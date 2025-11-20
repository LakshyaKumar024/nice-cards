import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

import * as dotenv from 'dotenv';
dotenv.config();

// ------------------------
// 📌 Cloudinary Config
// ------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ------------------------
// 📌 App Setup
// ------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------
// 📌 Resolve root folder
// ------------------------
const ROOT = path.resolve(process.cwd());

// ------------------------
// 📌 PDF Save Directory
// ------------------------
const pdfDir = path.join(ROOT, "private", "designs", "design", "pdf");

// Ensure folder exists
fs.ensureDirSync(pdfDir);

// -----------------------------------------------------
// 📌 Multer Storage for PDF (disk + unique filename)
// -----------------------------------------------------
const pdfStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pdfDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";

    // 🔥 Unique filename formula
    const uniqueName =
      "pdf_" +
      crypto.randomBytes(12).toString("hex") +
      "_" +
      Date.now() +
      ext;

    cb(null, uniqueName);
  },
});

// Accept ONLY PDF files
const uploadPDF = multer({
  storage: pdfStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});

// -----------------------------------------------------
// 📌 Multer for Images (memory storage)
// -----------------------------------------------------
const uploadImageMulter = multer({ storage: multer.memoryStorage() });

// -----------------------------------------------------
// 📌 Upload image to Cloudinary
// -----------------------------------------------------
async function uploadImageToCloudinary(file: Express.Multer.File) {

  // 🔥 Strong unique filename
  const uniquePublicId =
    "img_" + crypto.randomBytes(12).toString("hex") + "_" + Date.now();

  const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "template-images",
    public_id: uniquePublicId,
    resource_type: "auto",
    quality: "auto",
    fetch_format: "auto",
    overwrite: false,
  });

  return result.secure_url;
}

/* =====================================================
   📌 1. PDF UPLOAD ROUTE
   ===================================================== */
app.post(
  "/upload/pdf",
  uploadPDF.single("file"),
  (req: Request, res: Response) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No PDF file uploaded" });
    }

    console.log("📸 Uploading pdf:", {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
    });

    const fileUrl = `/private/designs/design/pdf/${req.file.filename}`;

    return res.json({
      success: true,
      data: {
        fileName: req.file.filename,
        url: fileUrl,
        message: "PDF uploaded successfully",
      },
    });
  }
);

/* =====================================================
   📌 2. IMAGE UPLOAD (Cloudinary)
   ===================================================== */
app.post(
  "/upload/image",
  uploadImageMulter.single("file"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, error: "No image provided" });

      console.log("📸 Uploading image:", {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      });

      // Upload image
      const imageUrl = await uploadImageToCloudinary(req.file);

      return res.json({
        success: true,
        data: {
          fileName: imageUrl,
          url: imageUrl,
          message: "Image uploaded successfully",
        },
      });
    } catch (err) {
      console.error("❌ Image upload error:", err);
      return res
        .status(500)
        .json({ success: false, error: "Image upload failed" });
    }
  }
);

/* =====================================================
   🚀 START SERVER
   ===================================================== */
const PORT = process.env.EXPRESS_PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Bun Express Upload Server running on port ${PORT}`);
});
