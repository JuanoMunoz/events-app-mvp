/*
  Warnings:

  - Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ORGANIZER', 'STAFF');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL;
