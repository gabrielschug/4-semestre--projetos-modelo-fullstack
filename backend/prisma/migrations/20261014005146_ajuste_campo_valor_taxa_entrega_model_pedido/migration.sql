/*
  Warnings:

  - You are about to drop the column `valorTaxaEntregaEntrega` on the `pedidos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pedidos" DROP COLUMN "valorTaxaEntregaEntrega",
ADD COLUMN     "valorTaxaEntrega" DOUBLE PRECISION;
