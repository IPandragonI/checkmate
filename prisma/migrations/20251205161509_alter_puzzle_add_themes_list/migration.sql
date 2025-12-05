/*
  Warnings:

  - You are about to drop the column `theme` on the `Puzzle` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Puzzle" DROP COLUMN "theme",
ADD COLUMN     "themes" "PuzzleTheme"[] DEFAULT ARRAY[]::"PuzzleTheme"[];
