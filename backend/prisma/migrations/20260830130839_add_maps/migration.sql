/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Configuracao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItensPedido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pedido` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Produto` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValorEntrega` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cliente" DROP CONSTRAINT "Cliente_bairroID_fkey";

-- DropForeignKey
ALTER TABLE "ItensPedido" DROP CONSTRAINT "ItensPedido_pedidoID_fkey";

-- DropForeignKey
ALTER TABLE "ItensPedido" DROP CONSTRAINT "ItensPedido_produtoID_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_clienteID_fkey";

-- DropForeignKey
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_adminID_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Cliente";

-- DropTable
DROP TABLE "Configuracao";

-- DropTable
DROP TABLE "ItensPedido";

-- DropTable
DROP TABLE "Pedido";

-- DropTable
DROP TABLE "Produto";

-- DropTable
DROP TABLE "ValorEntrega";

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_entregas" (
    "id" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "tempoEntregaMinutos" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "valores_entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "obs" TEXT,
    "bairroID" TEXT NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
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

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
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

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedidos" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoProduto" DOUBLE PRECISION NOT NULL,
    "pedidoID" TEXT NOT NULL,
    "produtoID" TEXT NOT NULL,

    CONSTRAINT "itens_pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "tempoAdicionalMinutos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "valores_entregas_bairro_key" ON "valores_entregas"("bairro");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefone_key" ON "clientes"("telefone");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_bairroID_fkey" FOREIGN KEY ("bairroID") REFERENCES "valores_entregas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_clienteID_fkey" FOREIGN KEY ("clienteID") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedidos" ADD CONSTRAINT "itens_pedidos_pedidoID_fkey" FOREIGN KEY ("pedidoID") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedidos" ADD CONSTRAINT "itens_pedidos_produtoID_fkey" FOREIGN KEY ("produtoID") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
