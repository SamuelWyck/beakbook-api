/*
  Warnings:

  - Added the required column `friendId` to the `UserFriend` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."UserFriend" ADD COLUMN     "friendId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."UserFriend" ADD CONSTRAINT "UserFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
