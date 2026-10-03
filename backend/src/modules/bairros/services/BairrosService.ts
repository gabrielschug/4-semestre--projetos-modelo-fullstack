import { BairrosRepository } from "../repositories/BairrosRepository";

export class BairrosService {
  constructor(private readonly bairrosRepository: BairrosRepository) {}

  async listarBairros() {
    return await this.bairrosRepository.listarBairros();
  }
}
