-- =====================================================================
--  EDLoc — Modèle Physique de Données (MPD)
--  SGBD cible : PostgreSQL
--  Auteur : Inès SAMEL
--  Script de création de la base de données
-- =====================================================================

-- Extension nécessaire à la génération des UUID (PostgreSQL < 13)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
--  Types énumérés (domaines de valeurs)
-- ---------------------------------------------------------------------
CREATE TYPE type_edl_enum        AS ENUM ('entree', 'sortie');

CREATE TYPE statut_edl_enum      AS ENUM ('brouillon', 'signe');

CREATE TYPE etat_element_enum    AS ENUM ('neuf', 'bon_etat', 'etat_usage', 'mauvais_etat');

CREATE TYPE role_signataire_enum AS ENUM ('bailleur', 'locataire');

-- ---------------------------------------------------------------------
--  Table : bailleur
-- ---------------------------------------------------------------------
CREATE TABLE bailleur (
    id_bailleur UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hashe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
--  Table : bien
-- ---------------------------------------------------------------------
CREATE TABLE bien (
    id_bien UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    adresse VARCHAR(255) NOT NULL,
    code_postal VARCHAR(10) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    type_logement VARCHAR(50) NOT NULL,
    nombre_pieces SMALLINT CHECK (nombre_pieces > 0),
    surface NUMERIC(6, 2) CHECK (surface > 0),
    id_bailleur UUID NOT NULL,
    CONSTRAINT fk_bien_bailleur FOREIGN KEY (id_bailleur) REFERENCES bailleur (id_bailleur) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
--  Table : locataire
-- ---------------------------------------------------------------------
CREATE TABLE locataire (
    id_locataire UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20)
);

-- ---------------------------------------------------------------------
--  Table : etat_des_lieux
-- ---------------------------------------------------------------------
CREATE TABLE etat_des_lieux (
    id_edl UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    type_edl type_edl_enum NOT NULL,
    date_edl DATE NOT NULL DEFAULT CURRENT_DATE,
    statut statut_edl_enum NOT NULL DEFAULT 'brouillon',
    date_signature TIMESTAMP,
    id_bien UUID NOT NULL,
    id_locataire UUID NOT NULL,
    CONSTRAINT fk_edl_bien FOREIGN KEY (id_bien) REFERENCES bien (id_bien) ON DELETE CASCADE,
    CONSTRAINT fk_edl_locataire FOREIGN KEY (id_locataire) REFERENCES locataire (id_locataire)
);

-- ---------------------------------------------------------------------
--  Table : piece
-- ---------------------------------------------------------------------
CREATE TABLE piece (
    id_piece UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    libelle VARCHAR(100) NOT NULL,
    ordre SMALLINT,
    id_edl UUID NOT NULL,
    CONSTRAINT fk_piece_edl FOREIGN KEY (id_edl) REFERENCES etat_des_lieux (id_edl) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
--  Table : element
-- ---------------------------------------------------------------------
CREATE TABLE element (
    id_element UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    libelle VARCHAR(100) NOT NULL,
    etat etat_element_enum NOT NULL,
    commentaire TEXT,
    id_piece UUID NOT NULL,
    CONSTRAINT fk_element_piece FOREIGN KEY (id_piece) REFERENCES piece (id_piece) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
--  Table : photo
-- ---------------------------------------------------------------------
CREATE TABLE photo (
    id_photo UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    chemin VARCHAR(255) NOT NULL,
    date_horodatage TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_element UUID NOT NULL,
    CONSTRAINT fk_photo_element FOREIGN KEY (id_element) REFERENCES element (id_element) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
--  Table : signature
--  Contrainte d'unicité : au plus une signature par rôle et par EDL
--  (un bailleur signe une fois, un locataire signe une fois).
-- ---------------------------------------------------------------------
CREATE TABLE signature (
    id_signature UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    role_signataire role_signataire_enum NOT NULL,
    date_signature TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    donnees_signature TEXT NOT NULL,
    id_edl UUID NOT NULL,
    CONSTRAINT fk_signature_edl FOREIGN KEY (id_edl) REFERENCES etat_des_lieux (id_edl) ON DELETE CASCADE,
    CONSTRAINT uq_signature_role UNIQUE (id_edl, role_signataire)
);

-- ---------------------------------------------------------------------
--  Index secondaires (performances sur les clés étrangères)
-- ---------------------------------------------------------------------
-- Table ADMINISTRATEUR : acteur technique (compte seedé, hors flux métier)
-- Aucune relation avec le modèle métier ; aucune inscription publique.
-- ---------------------------------------------------------------------
CREATE TABLE administrateur (
    id_administrateur UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe_hashe VARCHAR(255) NOT NULL,
    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
CREATE INDEX idx_bien_bailleur ON bien (id_bailleur);

CREATE INDEX idx_edl_bien ON etat_des_lieux (id_bien);

CREATE INDEX idx_edl_locataire ON etat_des_lieux (id_locataire);

CREATE INDEX idx_piece_edl ON piece (id_edl);

CREATE INDEX idx_element_piece ON element (id_piece);

CREATE INDEX idx_photo_element ON photo (id_element);

CREATE INDEX idx_signature_edl ON signature (id_edl);
