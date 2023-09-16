import { NextFunction, Request, Response } from "express";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffProbeInstaller from "@ffprobe-installer/ffprobe";
import { path } from "@ffmpeg-installer/ffmpeg";
import { resolve, extname } from "path";
import { existsSync, mkdirSync, unlink } from "fs";
import HttpError from "../utils/HttpError";

export default async function transcodeVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.file)
      return next(new HttpError("Upload a file to begin transcoding", 400));
    // const inputFileName = req.params.name;

    const outputDirName = req.file.originalname.split(
      extname(req.file.originalname)
    )[0];

    const inputFileName = req.file.originalname;
    const inputFilePath = resolve(__dirname, `../videos/raw/${inputFileName}`);
    const filename = inputFileName.split(".")[0];
    /**
     * Directory to store transcoded files
     * videos
     * |- raw : video source
     * |- transcoded
     *    |- videoName
     *      |- .hls file
     *      |- .ts files
     */
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
      .setFfprobePath(ffProbeInstaller.path)
      .outputOptions([
        "-hls_time 15", // Set segment duration (in seconds)
        "-hls_list_size 0", // Allow an unlimited number of segments in the playlist
      ])
      .output(`${outputDir}/${outputDirName}.m3u8`);

    command.outputOptions("-c:v h264");
    command.outputOptions("-c:a aac");

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
    // ffmpegCommand.outputOptions("-c:v h264");
    // ffmpegCommand.outputOptions("-c:a aac");
  } catch (error) {
    console.error(`Transcoding failed: `, error);
    return res.status(500).json(error);
  }
}
