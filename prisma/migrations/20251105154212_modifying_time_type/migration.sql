/*
  Warnings:

  - Added the required column `timeLimit` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whiteTimeLeft` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blackTimeLeft` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "timeLimit",
ADD COLUMN     "timeLimit" TIMESTAMP(3) NOT NULL,
DROP COLUMN "whiteTimeLeft",
ADD COLUMN     "whiteTimeLeft" TIMESTAMP(3) NOT NULL,
DROP COLUMN "blackTimeLeft",
ADD COLUMN     "blackTimeLeft" TIMESTAMP(3) NOT NULL;
