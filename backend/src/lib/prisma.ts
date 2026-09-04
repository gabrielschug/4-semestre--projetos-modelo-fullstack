import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function normalizarStringConexaoPostgres(conexaoString: string): string {
  try{
    const databaseURL= new URL(conexaoString)
    const sslMode = databaseURL.searchParams.get("sslmode")

  if (["prefer", "require", "verify-ca"].includes(sslMode ?? "")) {
    databaseURL.searchParams.set("sslmode", "verify-full")
  }

  return databaseURL.toString()
} catch {
  return conexaoString
}
}

const conexaoStringBruto = `${process.env.DATABASE_URL}`;

if(!conexaoStringBruto) {
  throw new Error("DATABASE_URL não configurada")
}

const connectionString = normalizarStringConexaoPostgres(conexaoStringBruto)

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };