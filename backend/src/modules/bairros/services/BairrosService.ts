import { BairrosRepository } from "../repositories/BairrosRepository";

export class BairrosService {
  constructor(private readonly bairrosRepository: BairrosRepository) {}

  async listarBairros() {
    return await this.bairrosRepository.listarBairros();
  }

  async criarBairro(dados: { bairro: string; valor: number; tempoEntregaMinutos: number }) {
    return await this.bairrosRepository.criarBairro(dados);
  }

  async atualizarBairro(
    id: string,
    dados: { bairro: string; valor: number; tempoEntregaMinutos: number },
  ) {
    return await this.bairrosRepository.atualizarBairro(id, dados);
  }

  async excluirBairro(id: string) {
    return await this.bairrosRepository.excluirBairro(id);
  }
}
