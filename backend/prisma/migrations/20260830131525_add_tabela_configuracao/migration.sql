-- CreateTable
CREATE TABLE "configuracoes" (
    "id" TEXT NOT NULL,
    "tempoAdicionalMinutos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);
