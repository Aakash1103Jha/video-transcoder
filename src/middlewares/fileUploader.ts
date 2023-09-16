import { Request } from "express";
import multer, { FileFilterCallback, Multer } from "multer";
import path from "path";
import { existsSync, mkdirSync } from "fs";

import HttpError from "../utils/HttpError";

function getUploadDirectoryPath(filename: string) {
  //   return path.join(__dirname, `../videos/raw/${filename}`);
  return path.join(__dirname, `../videos/raw`);
}

function ensureUploadDirectoryExists(filename: string) {
  const dirPath = getUploadDirectoryPath(filename);
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }
}

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const fileSpecificFolder = file.originalname.split(
      path.extname(file.originalname)
    )[0];
    ensureUploadDirectoryExists(fileSpecificFolder);
    cb(null, getUploadDirectoryPath(fileSpecificFolder));
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, file.originalname);
  },
});

const fileUploader: Multer = multer({
  storage: storage,
  limits: {
    // fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedFileTypes = [".jpg", ".jpeg", ".png", ".pdf", ".mp4", ".mov"];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedFileTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new HttpError(
          "Only .jpg, .jpeg, .png, and .pdf files are allowed.",
          400
        )
      );
    }
  },
});

export default fileUploader;
