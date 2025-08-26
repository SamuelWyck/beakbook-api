/*
  Warnings:

  - You are about to drop the `ChatRoomUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatRoomUser" DROP CONSTRAINT "ChatRoomUser_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatRoomUser" DROP CONSTRAINT "ChatRoomUser_userId_fkey";

-- AlterTable
ALTER TABLE "public"."ChatRoom" ADD COLUMN     "name" TEXT;

-- DropTable
DROP TABLE "public"."ChatRoomUser";

-- CreateTable
CREATE TABLE "public"."_ChatRoomToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChatRoomToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChatRoomToUser_B_index" ON "public"."_ChatRoomToUser"("B");

-- AddForeignKey
ALTER TABLE "public"."_ChatRoomToUser" ADD CONSTRAINT "_ChatRoomToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ChatRoomToUser" ADD CONSTRAINT "_ChatRoomToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
