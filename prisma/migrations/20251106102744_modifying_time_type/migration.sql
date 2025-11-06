/*
  Warnings:

  - The `timeLimit` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `whiteTimeLeft` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `blackTimeLeft` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "timeLimit",
ADD COLUMN     "timeLimit" INTEGER,
DROP COLUMN "whiteTimeLeft",
ADD COLUMN     "whiteTimeLeft" INTEGER,
DROP COLUMN "blackTimeLeft",
ADD COLUMN     "blackTimeLeft" INTEGER;
