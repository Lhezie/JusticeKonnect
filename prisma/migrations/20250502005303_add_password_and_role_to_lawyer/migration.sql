/*
  Warnings:

  - Added the required column `password` to the `Lawyer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Lawyer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Lawyer` ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` VARCHAR(191) NOT NULL;
