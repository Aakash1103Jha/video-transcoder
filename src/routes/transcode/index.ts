import { Router } from "express";
import { transcodeVideo } from "../../controllers";
import fileUploader from "../../middlewares/fileUploader";

const router = Router();

// router.get("/new/:name", transcodeVideo);
router.post("/new", fileUploader.single("file"), transcodeVideo);

export default router;
