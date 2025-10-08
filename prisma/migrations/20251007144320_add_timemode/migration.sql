/*
  Warnings:

  - You are about to drop the column `mode` on the `Game` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TimeMode" AS ENUM ('BULLET', 'BLITZ', 'RAPID', 'CLASSICAL');

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "mode",
ADD COLUMN     "timMode" "TimeMode" NOT NULL DEFAULT 'RAPID';
