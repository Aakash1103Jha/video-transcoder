import { NextFunction, Request, Response } from "express";
import ffmpeg from "fluent-ffmpeg";
import { path } from "@ffmpeg-installer/ffmpeg";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";

ffmpeg.setFfmpegPath(path);

export default async function transcodeVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const inputFileName = req.params.name;
    console.log(inputFileName);
    const inputFilePath = resolve(__dirname, `../videos/raw/${inputFileName}`);
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
      `../videos/transcoded/${inputFileName}`
    );
    const manifestPath = `${outputDir}/${inputFileName}.m3u8`;

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const ffmpegCommand = ffmpeg(inputFilePath)
      .outputOptions([
        "-hls_time 15", // Set segment duration (in seconds)
        "-hls_list_size 0", // Allow an unlimited number of segments in the playlist
      ])
      .output(`${outputDir}/${inputFileName}.m3u8`);

    ffmpegCommand.outputOptions("-c:v h264");
    ffmpegCommand.outputOptions("-c:a aac");

    ffmpegCommand.on("end", () => {
      console.log("Transcoding completed.");
      res
        .status(200)
        .json({ message: "Transcoding completed", manifest: manifestPath });
    });

    ffmpegCommand.on("error", (err) => {
      console.error("Error:", err);
      res.status(500).json({ error: "An error occurred during transcoding." });
    });

    ffmpegCommand.run();
  } catch (error) {
    console.error(`Transcoding failed: `, error);
    return next(error);
  }
}
