-- DropForeignKey
ALTER TABLE "public"."Game" DROP CONSTRAINT "Game_playerBlackId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Game" DROP CONSTRAINT "Game_playerWhiteId_fkey";

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "playerWhiteId" DROP NOT NULL,
ALTER COLUMN "playerBlackId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerWhiteId_fkey" FOREIGN KEY ("playerWhiteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerBlackId_fkey" FOREIGN KEY ("playerBlackId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
