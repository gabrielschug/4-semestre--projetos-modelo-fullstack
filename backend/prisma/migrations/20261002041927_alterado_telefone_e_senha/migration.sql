-- DropIndex
DROP INDEX "clientes_telefone_key";

-- AlterTable
ALTER TABLE "clientes" ALTER COLUMN "senha" DROP NOT NULL;
