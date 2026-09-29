import bcrypt from "bcrypt"

import { ClienteRepository } from "../repositories/ClienteRepository"
import type { CadastrarClienteInput, LoginClienteInput } from "../types/ClienteTypes"

const quantidadeDeRodadasDeCriptografia = 10

export class ClienteService {
  constructor(private readonly clienteRepository: ClienteRepository) {}

  private removeSenha<T extends { senha: string }>(cliente: T) {
    const { senha, ...clienteSemSenha } = cliente
    return clienteSemSenha
  }

  async cadastrar(dados: CadastrarClienteInput) {
    const telefoneExistente = await this.clienteRepository.buscarPorTelefone(dados.telefone)
    if (telefoneExistente) {
      throw new Error("TELEFONE_JA_CADASTRADO")
    }

    const senhaHash = await bcrypt.hash(dados.senha, quantidadeDeRodadasDeCriptografia)
    const clienteCriado = await this.clienteRepository.criar(dados, senhaHash)

    return this.removeSenha(clienteCriado)
  }

  async login(dados: LoginClienteInput) {
    const cliente = await this.clienteRepository.buscarPorTelefone(dados.telefone)
    if (!cliente) {
      throw new Error("CREDENCIAIS_INVALIDAS")
    }

    const senhaConfere = await bcrypt.compare(dados.senha, cliente.senha)
    if (!senhaConfere) {
      throw new Error("CREDENCIAIS_INVALIDAS")
    }

    return this.removeSenha(cliente)
  }

  async buscarPorId(id: string) {
    const cliente = await this.clienteRepository.buscarPorId(id)
    if (!cliente) {
      throw new Error("CLIENTE_NAO_ENCONTRADO")
    }

    return this.removeSenha(cliente)
  }

  async listarBairros() {
    return await this.clienteRepository.listarBairros()
  }
}
