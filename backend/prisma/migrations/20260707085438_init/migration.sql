-- CreateEnum
CREATE TYPE "type_edl_enum" AS ENUM ('entree', 'sortie');

-- CreateEnum
CREATE TYPE "statut_edl_enum" AS ENUM ('brouillon', 'signe');

-- CreateEnum
CREATE TYPE "etat_element_enum" AS ENUM ('neuf', 'bon_etat', 'etat_usage', 'mauvais_etat');

-- CreateEnum
CREATE TYPE "role_signataire_enum" AS ENUM ('bailleur', 'locataire');

-- CreateTable
CREATE TABLE "bailleur" (
    "id_bailleur" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe_hashe" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(20),
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bailleur_pkey" PRIMARY KEY ("id_bailleur")
);

-- CreateTable
CREATE TABLE "bien" (
    "id_bien" UUID NOT NULL DEFAULT gen_random_uuid(),
    "adresse" VARCHAR(255) NOT NULL,
    "code_postal" VARCHAR(10) NOT NULL,
    "ville" VARCHAR(100) NOT NULL,
    "type_logement" VARCHAR(50) NOT NULL,
    "nombre_pieces" SMALLINT,
    "surface" DECIMAL(6,2),
    "id_bailleur" UUID NOT NULL,

    CONSTRAINT "bien_pkey" PRIMARY KEY ("id_bien")
);

-- CreateTable
CREATE TABLE "locataire" (
    "id_locataire" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "telephone" VARCHAR(20),

    CONSTRAINT "locataire_pkey" PRIMARY KEY ("id_locataire")
);

-- CreateTable
CREATE TABLE "etat_des_lieux" (
    "id_edl" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type_edl" "type_edl_enum" NOT NULL,
    "date_edl" DATE NOT NULL DEFAULT CURRENT_DATE,
    "statut" "statut_edl_enum" NOT NULL DEFAULT 'brouillon',
    "date_signature" TIMESTAMP(6),
    "id_bien" UUID NOT NULL,
    "id_locataire" UUID NOT NULL,

    CONSTRAINT "etat_des_lieux_pkey" PRIMARY KEY ("id_edl")
);

-- CreateTable
CREATE TABLE "piece" (
    "id_piece" UUID NOT NULL DEFAULT gen_random_uuid(),
    "libelle" VARCHAR(100) NOT NULL,
    "ordre" SMALLINT,
    "id_edl" UUID NOT NULL,

    CONSTRAINT "piece_pkey" PRIMARY KEY ("id_piece")
);

-- CreateTable
CREATE TABLE "element" (
    "id_element" UUID NOT NULL DEFAULT gen_random_uuid(),
    "libelle" VARCHAR(100) NOT NULL,
    "etat" "etat_element_enum" NOT NULL,
    "commentaire" TEXT,
    "id_piece" UUID NOT NULL,

    CONSTRAINT "element_pkey" PRIMARY KEY ("id_element")
);

-- CreateTable
CREATE TABLE "photo" (
    "id_photo" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chemin" VARCHAR(255) NOT NULL,
    "date_horodatage" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_element" UUID NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id_photo")
);

-- CreateTable
CREATE TABLE "signature" (
    "id_signature" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_signataire" "role_signataire_enum" NOT NULL,
    "date_signature" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "donnees_signature" TEXT NOT NULL,
    "id_edl" UUID NOT NULL,

    CONSTRAINT "signature_pkey" PRIMARY KEY ("id_signature")
);

-- CreateTable
CREATE TABLE "administrateur" (
    "id_administrateur" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe_hashe" VARCHAR(255) NOT NULL,
    "date_creation" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "administrateur_pkey" PRIMARY KEY ("id_administrateur")
);

-- CreateIndex
CREATE UNIQUE INDEX "bailleur_email_key" ON "bailleur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "locataire_email_key" ON "locataire"("email");

-- CreateIndex
CREATE UNIQUE INDEX "uq_signature_role" ON "signature"("id_edl", "role_signataire");

-- CreateIndex
CREATE UNIQUE INDEX "administrateur_email_key" ON "administrateur"("email");

-- AddForeignKey
ALTER TABLE "bien" ADD CONSTRAINT "fk_bien_bailleur" FOREIGN KEY ("id_bailleur") REFERENCES "bailleur"("id_bailleur") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etat_des_lieux" ADD CONSTRAINT "fk_edl_bien" FOREIGN KEY ("id_bien") REFERENCES "bien"("id_bien") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etat_des_lieux" ADD CONSTRAINT "fk_edl_locataire" FOREIGN KEY ("id_locataire") REFERENCES "locataire"("id_locataire") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece" ADD CONSTRAINT "fk_piece_edl" FOREIGN KEY ("id_edl") REFERENCES "etat_des_lieux"("id_edl") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "element" ADD CONSTRAINT "fk_element_piece" FOREIGN KEY ("id_piece") REFERENCES "piece"("id_piece") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "fk_photo_element" FOREIGN KEY ("id_element") REFERENCES "element"("id_element") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature" ADD CONSTRAINT "fk_signature_edl" FOREIGN KEY ("id_edl") REFERENCES "etat_des_lieux"("id_edl") ON DELETE CASCADE ON UPDATE CASCADE;
