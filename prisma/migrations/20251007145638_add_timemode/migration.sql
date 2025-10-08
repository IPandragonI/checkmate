/*
  Warnings:

  - You are about to drop the column `timMode` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "timMode",
ADD COLUMN     "timeMode" "TimeMode" NOT NULL DEFAULT 'RAPID';
