/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Game_code_key" ON "Game"("code");
