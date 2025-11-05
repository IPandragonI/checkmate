/*
  Warnings:

  - You are about to drop the column `name` on the `Bot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Bot_name_key";

-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "name",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bot_username_key" ON "Bot"("username");
