import { Router } from "express";
import { transcodeVideo } from "../../controllers";

const router = Router();

router.get("/new/:name", transcodeVideo);

export default router;
