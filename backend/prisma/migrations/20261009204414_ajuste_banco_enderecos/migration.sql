/*
  Warnings:

  - You are about to drop the column `bairroID` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `obs` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `rua` on the `clientes` table. All the data in the column will be lost.
  - The primary key for the `itens_pedidos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `itens_pedidos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `pedidos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `pedidos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `produtos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `produtos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `valores_entregas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `valores_entregas` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[telefone]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `pedidoID` on the `itens_pedidos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `produtoID` on the `itens_pedidos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "clientes" DROP CONSTRAINT "clientes_bairroID_fkey";

-- DropForeignKey
ALTER TABLE "itens_pedidos" DROP CONSTRAINT "itens_pedidos_pedidoID_fkey";

-- DropForeignKey
ALTER TABLE "itens_pedidos" DROP CONSTRAINT "itens_pedidos_produtoID_fkey";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "bairroID",
DROP COLUMN "numero",
DROP COLUMN "obs",
DROP COLUMN "rua";

-- AlterTable
ALTER TABLE "itens_pedidos" DROP CONSTRAINT "itens_pedidos_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "pedidoID",
ADD COLUMN     "pedidoID" INTEGER NOT NULL,
DROP COLUMN "produtoID",
ADD COLUMN     "produtoID" INTEGER NOT NULL,
ADD CONSTRAINT "itens_pedidos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "pedidos" DROP CONSTRAINT "pedidos_pkey",
ADD COLUMN     "nomeBairroEntrega" TEXT,
ADD COLUMN     "numeroEntrega" TEXT,
ADD COLUMN     "obsEntrega" TEXT,
ADD COLUMN     "ruaEntrega" TEXT,
ADD COLUMN     "valorTaxaEntregaEntrega" DOUBLE PRECISION,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "produtos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "valores_entregas" DROP CONSTRAINT "valores_entregas_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "valores_entregas_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "enderecos_clientes" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "obs" TEXT,
    "bairroID" INTEGER NOT NULL,
    "clienteID" TEXT NOT NULL,

    CONSTRAINT "enderecos_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefone_key" ON "clientes"("telefone");

-- AddForeignKey
ALTER TABLE "enderecos_clientes" ADD CONSTRAINT "enderecos_clientes_bairroID_fkey" FOREIGN KEY ("bairroID") REFERENCES "valores_entregas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enderecos_clientes" ADD CONSTRAINT "enderecos_clientes_clienteID_fkey" FOREIGN KEY ("clienteID") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedidos" ADD CONSTRAINT "itens_pedidos_pedidoID_fkey" FOREIGN KEY ("pedidoID") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedidos" ADD CONSTRAINT "itens_pedidos_produtoID_fkey" FOREIGN KEY ("produtoID") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
