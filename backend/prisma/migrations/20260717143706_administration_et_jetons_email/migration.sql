-- CreateEnum
CREATE TYPE "type_jeton_enum" AS ENUM ('verification', 'reinitialisation');

-- AlterTable
ALTER TABLE "bailleur" ADD COLUMN     "actif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "email_verifie" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "jeton_email" (
    "id_jeton" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "type_jeton_enum" NOT NULL,
    "jeton_hashe" VARCHAR(255) NOT NULL,
    "date_expiration" TIMESTAMP(6) NOT NULL,
    "date_utilisation" TIMESTAMP(6),
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_bailleur" UUID NOT NULL,

    CONSTRAINT "jeton_email_pkey" PRIMARY KEY ("id_jeton")
);

-- CreateIndex
CREATE INDEX "idx_jeton_bailleur" ON "jeton_email"("id_bailleur");

-- AddForeignKey
ALTER TABLE "jeton_email" ADD CONSTRAINT "fk_jeton_bailleur" FOREIGN KEY ("id_bailleur") REFERENCES "bailleur"("id_bailleur") ON DELETE CASCADE ON UPDATE CASCADE;
