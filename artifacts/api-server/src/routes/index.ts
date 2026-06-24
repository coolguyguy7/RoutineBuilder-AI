import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import achievementsRouter from "./achievements";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(achievementsRouter);

export default router;
