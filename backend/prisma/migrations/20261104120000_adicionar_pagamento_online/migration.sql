-- AlterEnum
ALTER TYPE "MetodoPagamento" ADD VALUE 'ONLINE';

-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "pagoEm" TIMESTAMP(3),
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_stripePaymentIntentId_key" ON "pedidos"("stripePaymentIntentId");
