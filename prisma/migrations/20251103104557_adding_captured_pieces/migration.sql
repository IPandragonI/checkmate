-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "capturedPieces" JSONB NOT NULL DEFAULT '{"white":[],"black":[]}',
ADD COLUMN     "currentFen" TEXT NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

-- AlterTable
ALTER TABLE "Move" ADD COLUMN     "capturedPiece" TEXT;

-- CreateIndex
CREATE INDEX "Move_gameId_moveNumber_idx" ON "Move"("gameId", "moveNumber");
