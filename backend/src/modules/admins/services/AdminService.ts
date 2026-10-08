import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AdminRepository } from "../repositories/AdminRepository";
import type { LoginAdminInput } from "../types/AdminTypes";
import { CadastrarAdminInput } from "../types/AdminTypes";

const quantidadeDeRodadasDeCriptografia = 10;
const tempoDeValidadeDoToken = "1d";

function buscarChaveSecretaDoToken(): string {
  const chaveSecreta = process.env.JWT_SECRET;
  if (!chaveSecreta) {
    throw new Error(
      "A variável JWT_SECRET não foi configurada no arquivo .env",
    );
  }
  return chaveSecreta;
}

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  private removeSenha<T extends { senha: string }>(admin: T) {
    const { senha, ...adminSemSenha } = admin;
    return adminSemSenha;
  }

  async login(dados: LoginAdminInput) {
    const admin = await this.adminRepository.buscarPorEmail(dados.email);
    if (!admin) {
      throw new Error("CREDENCIAIS_INVALIDAS");
    }

    const senhaConfere = await bcrypt.compare(dados.senha, admin.senha);
    if (!senhaConfere) {
      throw new Error("CREDENCIAIS_INVALIDAS");
    }

    const tokenDeAcesso = jwt.sign(
      { adminId: admin.id },
      buscarChaveSecretaDoToken(),
      {
        expiresIn: tempoDeValidadeDoToken,
      },
    );

    return { admin: this.removeSenha(admin), token: tokenDeAcesso };
  }

  async buscarPorId(id: string) {
    const admin = await this.adminRepository.buscarPorId(id);
    if (!admin) {
      throw new Error("ADMIN_NAO_ENCONTRADO");
    }

    return this.removeSenha(admin);
  }

  async cadastrar(dados: CadastrarAdminInput) {
    console.log("2. SERVICE \n", dados);
    const senhaHash = await bcrypt.hash(
      dados.senha,
      quantidadeDeRodadasDeCriptografia,
    );
    const adminCriado = await this.adminRepository.cadastrar(dados, senhaHash);

    return this.removeSenha(adminCriado);
  }
}
