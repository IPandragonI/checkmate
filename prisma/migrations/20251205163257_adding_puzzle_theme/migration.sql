-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PuzzleTheme" ADD VALUE 'ANASTASIA_MATE';
ALTER TYPE "PuzzleTheme" ADD VALUE 'BALESTRA_MATE';
ALTER TYPE "PuzzleTheme" ADD VALUE 'BLIND_SWINE_MATE';
ALTER TYPE "PuzzleTheme" ADD VALUE 'CASTLING';
ALTER TYPE "PuzzleTheme" ADD VALUE 'DOVETAIL_MATE';
ALTER TYPE "PuzzleTheme" ADD VALUE 'KILL_BOX_MATE';
ALTER TYPE "PuzzleTheme" ADD VALUE 'MATE_IN5';
ALTER TYPE "PuzzleTheme" ADD VALUE 'TRIANGLE_MATE';
ALTER TYPE "PuzzleTheme" ADD VALUE 'UNDER_PROMOTION';
