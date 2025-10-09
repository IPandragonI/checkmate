/*
  Warnings:

  - You are about to drop the column `fromSquare` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `toSquare` on the `Move` table. All the data in the column will be lost.
  - Added the required column `from` to the `Move` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Move" DROP COLUMN "fromSquare",
DROP COLUMN "toSquare",
ADD COLUMN     "from" TEXT NOT NULL,
ADD COLUMN     "to" TEXT NOT NULL;
