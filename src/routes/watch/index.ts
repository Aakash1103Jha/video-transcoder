import { Router } from "express";
import { watchVideo } from "../../controllers";

const router = Router();

router.get("/", watchVideo);

export default router;
