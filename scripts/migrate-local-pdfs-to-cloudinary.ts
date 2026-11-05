import fs from "fs";
import path from "path";
import prisma from "../lib/db-init";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PDF_FOLDER = process.env.CLOUDINARY_PDF_FOLDER || "template-pdfs";

async function migratePdfs() {
  console.log("🚀 Starting migration of local PDFs to Cloudinary...");
  console.log(`📁 Target Cloudinary folder: ${PDF_FOLDER}`);

  const templates = await prisma.template.findMany({
    select: {
      uuid: true,
      name: true,
      pdf: true,
    },
  });

  const localTemplates = templates.filter(
    (t) => !t.pdf.startsWith("http://") && !t.pdf.startsWith("https://") && !t.pdf.includes("cloudinary.com")
  );

  console.log(`Found ${localTemplates.length} templates with local PDFs.`);

  if (localTemplates.length === 0) {
    console.log("✅ All templates already use Cloudinary URLs. Nothing to migrate!");
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const template of localTemplates) {
    const filename = path.basename(template.pdf);
    const localFilePath = path.join(
      process.cwd(),
      "private",
      "designs",
      "design",
      "pdf",
      filename
    );

    if (!fs.existsSync(localFilePath)) {
      console.error(`❌ File not found on disk for template "${template.name}": ${localFilePath}`);
      failCount++;
      continue;
    }

    try {
      console.log(`⏳ Uploading "${filename}" for template "${template.name}"...`);

      const fileBuffer = fs.readFileSync(localFilePath);
      const cleanPublicId = filename.replace(/\.[^/.]+$/, "");

      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: PDF_FOLDER,
            public_id: cleanPublicId,
            resource_type: "auto",
            tags: ["template_pdf", "migrated_from_vps"],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(fileBuffer);
      });

      const secureUrl = uploadResult.secure_url;

      // Update Prisma database record
      await prisma.template.update({
        where: { uuid: template.uuid },
        data: { pdf: secureUrl },
      });

      console.log(`✅ Migrated "${template.name}" -> ${secureUrl}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to migrate template "${template.name}":`, err);
      failCount++;
    }
  }

  console.log("\n================ MIGRATION SUMMARY ================");
  console.log(`Total local templates: ${localTemplates.length}`);
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed:               ${failCount}`);
  console.log("===================================================\n");
}

migratePdfs()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

