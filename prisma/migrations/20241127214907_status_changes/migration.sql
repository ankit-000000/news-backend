/*
  Warnings:

  - The values [ARCHIVED] on the enum `ArticleStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ArticleStatus_new" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');
ALTER TABLE "Article" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Article" ALTER COLUMN "status" TYPE "ArticleStatus_new" USING ("status"::text::"ArticleStatus_new");
ALTER TYPE "ArticleStatus" RENAME TO "ArticleStatus_old";
ALTER TYPE "ArticleStatus_new" RENAME TO "ArticleStatus";
DROP TYPE "ArticleStatus_old";
ALTER TABLE "Article" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
