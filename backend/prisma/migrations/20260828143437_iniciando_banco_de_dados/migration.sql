/*
  Warnings:

  - You are about to drop the `carros` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clientes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `marcas` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDENTE', 'PREPARANDO', 'PRONTO', 'EM_ROTA', 'ENTREGUE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "ModalEntrega" AS ENUM ('DELIVERY', 'RETIRADA');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('DINHEIRO', 'MAQUININHA_CARTAO');

-- DropForeignKey
ALTER TABLE "carros" DROP CONSTRAINT "carros_marcaId_fkey";

-- DropTable
DROP TABLE "carros";

-- DropTable
DROP TABLE "clientes";

-- DropTable
DROP TABLE "marcas";

-- DropEnum
DROP TYPE "Combustiveis";

-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "tempoAdicionalMinutos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValorEntrega" (
    "id" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "tempoEntregaMinutos" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "ValorEntrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "obs" TEXT,
    "bairroID" TEXT NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precoBase" DOUBLE PRECISION NOT NULL,
    "valorDesconto" DOUBLE PRECISION DEFAULT 0,
    "disponibilidade" BOOLEAN NOT NULL DEFAULT true,
    "especificacoes" TEXT,
    "fotoUrl" TEXT,
    "tempoPreparoMinutos" INTEGER,
    "adminID" TEXT NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'PENDENTE',
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modalEntrega" "ModalEntrega" NOT NULL,
    "pagamento" "MetodoPagamento" NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "tempoTotalEstimadoMinutos" INTEGER NOT NULL,
    "anotacaoCliente" TEXT,
    "anotacaoAdm" TEXT,
    "clienteID" TEXT NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItensPedido" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoProduto" DOUBLE PRECISION NOT NULL,
    "pedidoID" TEXT NOT NULL,
    "produtoID" TEXT NOT NULL,

    CONSTRAINT "ItensPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ValorEntrega_bairro_key" ON "ValorEntrega"("bairro");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_telefone_key" ON "Cliente"("telefone");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_bairroID_fkey" FOREIGN KEY ("bairroID") REFERENCES "ValorEntrega"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteID_fkey" FOREIGN KEY ("clienteID") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItensPedido" ADD CONSTRAINT "ItensPedido_pedidoID_fkey" FOREIGN KEY ("pedidoID") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItensPedido" ADD CONSTRAINT "ItensPedido_produtoID_fkey" FOREIGN KEY ("produtoID") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
