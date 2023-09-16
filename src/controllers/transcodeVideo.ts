import { NextFunction, Request, Response } from "express";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { extname, resolve } from "path";
import { existsSync, mkdirSync, unlink } from "fs";

import HttpError from "../utils/HttpError";
import TranscoderConfig from "../config/transcoder.config.json";

export default async function transcodeVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file)
      return next(new HttpError("Upload a file to begin transcoding", 400));
    const outputDirName = req.file.originalname.split(
      extname(req.file.originalname)
    )[0];
    const inputFileName = req.file.originalname;
    const inputFilePath = resolve(__dirname, `../videos/raw/${inputFileName}`);
    const outputDir = resolve(
      __dirname,
      `../videos/transcoded/${outputDirName}`
    );
    const manifestPath = `${outputDir}/${outputDirName}.m3u8`;

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    const command = ffmpeg(inputFilePath)
      .setFfmpegPath(ffmpegInstaller.path)
      .outputOptions([
        `-hls_time ${TranscoderConfig.HLS_SEGMENT_DURATION}`, // Set segment duration (in seconds)
        `-hls_list_size ${TranscoderConfig.HLS_LIST_SIZE}`, // Allow an unlimited number of segments in the playlist
        `-c:v ${TranscoderConfig.CODEC.VIDEO}`,
        `-c:a ${TranscoderConfig.CODEC.AUDIO}`,
      ]);
    command.on("start", () => {
      console.info("Starting transcoding file: ", inputFileName);
    });
    command.on("error", (err) => {
      console.error("Error:", err);
      throw err;
    });
    command.on("end", () => {
      unlink(inputFilePath, (err) => {
        if (err) throw new HttpError((err as Error).message, 500);
        console.info(
          `Transcoding completed. Raw file removed from ${inputFilePath}`
        );
      });
      res
        .status(200)
        .json({ message: "Transcoding completed", manifest: manifestPath });
    });
    command.output(manifestPath).run();
  } catch (error) {
    console.error(`Transcoding failed: `, error);
    return res.status(500).json(error);
  }
}
