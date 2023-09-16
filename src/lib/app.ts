import express from "express";
import cors from "cors";

import { TranscodeRoute, VideoRoute } from "../routes";
import errorHandler from "../middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/transcode", TranscodeRoute);
app.use("/watch", VideoRoute);

app.use(errorHandler);

export default app;
