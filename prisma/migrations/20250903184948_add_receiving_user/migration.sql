/*
  Warnings:

  - Added the required column `receivingUserId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."FriendRequest" ADD COLUMN     "receivingUserId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."FriendRequest" ADD CONSTRAINT "FriendRequest_receivingUserId_fkey" FOREIGN KEY ("receivingUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
