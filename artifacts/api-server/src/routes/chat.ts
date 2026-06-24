import { Router, type IRouter } from "express";
import multer from "multer";
import OpenAI from "openai";
import { SendChatMessageBody, UploadChatFileResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VECTOR_STORE_ID = "vs_6a3bf99c76648191a316dfd7894e4728";
const MODEL = "gpt-4o-mini";
const ASSISTANT_INSTRUCTIONS = `You are a helpful routine builder AI that helps students during the summer be more productive with their free time whilst still having fun.
Respond clearly using vector store files, and divide the tips into different sections with a subheader. Also on top of that add a recommended schedule for the user to try out for a day. If they are trying to request an unhealthy or unstable routine, redirect them to a safer routine to still be productive.`;

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

function extractCitations(response: OpenAI.Responses.Response): Array<{ filename: string; text?: string }> {
  const citations: Array<{ filename: string; text?: string }> = [];
  const seen = new Set<string>();

  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const contentBlock of item.content ?? []) {
      if (contentBlock.type !== "output_text") continue;
      for (const ann of (contentBlock as { type: string; annotations?: Array<{ type: string; filename?: string; quote?: string }> }).annotations ?? []) {
        if (ann.type === "file_citation" && ann.filename && !seen.has(ann.filename)) {
          seen.add(ann.filename);
          citations.push({ filename: ann.filename, text: ann.quote });
        }
      }
    }
  }
  return citations;
}

router.post("/chat/messages", async (req, res): Promise<void> => {
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { message, previousResponseId, uploadedFileId } = parsed.data;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    type InputItem =
      | string
      | {
          role: "user";
          content: Array<{
            type: "input_text" | "input_file";
            text?: string;
            file_id?: string;
          }>;
        };

    let inputContent: InputItem;

    if (uploadedFileId) {
      inputContent = {
        role: "user",
        content: [
          { type: "input_text", text: message },
          { type: "input_file", file_id: uploadedFileId },
        ],
      };
    } else {
      inputContent = message;
    }

    const response = await openai.responses.create({
      model: MODEL,
      instructions: ASSISTANT_INSTRUCTIONS,
      input: inputContent as Parameters<typeof openai.responses.create>[0]["input"],
      tools: [{ type: "file_search", vector_store_ids: [VECTOR_STORE_ID] }],
      ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
    });

    const fullText: string = (response as unknown as { output_text: string }).output_text ?? "";

    const words = fullText.split(/(\s+)/);
    for (const word of words) {
      if (word) {
        res.write(`data: ${JSON.stringify({ content: word })}\n\n`);
      }
    }

    const citations = extractCitations(response);
    res.write(
      `data: ${JSON.stringify({ done: true, responseId: response.id, citations })}\n\n`
    );
  } catch (err) {
    logger.error({ err }, "Error calling OpenAI Responses API");
    res.write(`data: ${JSON.stringify({ error: "Failed to get AI response" })}\n\n`);
  } finally {
    res.end();
  }
});

router.post("/chat/files", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  try {
    const file = await openai.files.create({
      file: new File([new Uint8Array(req.file.buffer)], req.file.originalname, { type: req.file.mimetype }),
      purpose: "assistants",
    });

    res.json(
      UploadChatFileResponse.parse({
        fileId: file.id,
        filename: req.file.originalname,
      })
    );
  } catch (err) {
    req.log.error({ err }, "Failed to upload file to OpenAI");
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
