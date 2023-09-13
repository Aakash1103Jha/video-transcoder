import { NextFunction, Request, Response } from "express";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffProbeInstaller from "@ffprobe-installer/ffprobe";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";

export default async function transcodeVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const inputFileName = req.params.name;
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
    const outputDir = resolve(__dirname, `../videos/transcoded/${filename}`);
    const manifestPath = `${outputDir}/${filename}.m3u8`;

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const command = ffmpeg(inputFilePath)
      .setFfmpegPath(ffmpegInstaller.path)
      .setFfprobePath(ffProbeInstaller.path)
      .outputOptions([
        "-hls_time 15", // Set segment duration (in seconds)
        "-hls_list_size 0", // Allow an unlimited number of segments in the playlist
        "-c:v h264",
        "-c:a aac",
      ]);

    command.on("start", () => {
      console.info("Starting transcoding file: ", inputFileName);
    });
    command.on("error", (err) => {
      console.error("Error:", err);
      throw err;
    });
    command.on("end", () => {
      console.log("Transcoding completed.");
      return res
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
