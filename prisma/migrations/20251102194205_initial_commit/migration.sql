-- CreateEnum
CREATE TYPE "CATEGORYS" AS ENUM ('WEDDING', 'BIRTHDAY', 'ANNIVERSARY', 'GRADUATION', 'BABYSHOWER', 'FESTIVAL', 'INVITATION', 'CORPORATE');

-- CreateTable
CREATE TABLE "templates" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "catogery" "CATEGORYS" NOT NULL,
    "image" TEXT NOT NULL,
    "price" INTEGER,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "svg" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "saved templates" (
    "uuid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "file_location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved templates_pkey" PRIMARY KEY ("uuid")
);

-- AddForeignKey
ALTER TABLE "saved templates" ADD CONSTRAINT "saved templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
