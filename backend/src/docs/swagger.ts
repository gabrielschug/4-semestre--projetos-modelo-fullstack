const protegida = [{ bearerAuth: [] }];

const json = (schema: object) => ({ content: { "application/json": { schema } } });

const corpo = (schema: object, example?: object) => ({
  required: true,
  content: { "application/json": { schema, example } },
});

const resposta = (descricao: string, schema?: object) => ({
  description: descricao,
  ...(schema ? json(schema) : {}),
});

const ref = (nome: string) => ({ $ref: `#/components/schemas/${nome}` });
const lista = (nome: string) => ({ type: "array", items: ref(nome) });

const caminho = (nome: string, descricao?: string) => ({
  name: nome,
  in: "path",
  required: true,
  description: descricao,
  schema: { type: "string" },
});

const r401 = resposta("Token de acesso não informado, inválido ou expirado");
const r400 = resposta("Dados inválidos");
const r404 = resposta("Não encontrado");

const produtoEntrada = {
  type: "object",
  required: [
    "descricao",
    "categoria",
    "precoBase",
    "valorDesconto",
    "disponibilidade",
    "especificacoes",
    "fotoUrl",
    "tempoPreparoMinutos",
  ],
  properties: {
    descricao: { type: "string" },
    categoria: { type: "string" },
    precoBase: { type: "number" },
    valorDesconto: { type: "number", nullable: true },
    disponibilidade: { type: "boolean" },
    especificacoes: { type: "string", nullable: true },
    fotoUrl: { type: "string", nullable: true },
    tempoPreparoMinutos: { type: "integer", nullable: true },
  },
};

const bairroEntrada = {
  type: "object",
  required: ["bairro", "valor", "tempoEntregaMinutos"],
  properties: {
    bairro: { type: "string" },
    valor: { type: "number" },
    tempoEntregaMinutos: { type: "integer" },
  },
};

export const swaggerDocumento = {
  openapi: "3.0.3",
  info: {
    title: "API Restaurante Minuta Campeira",
    version: "1.0.0",
    description:
      "Rotas com cadeado exigem login de administrador: faça POST /admins/login, copie o token e clique em Authorize.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Admins" },
    { name: "Clientes" },
    { name: "Produtos" },
    { name: "Pedidos" },
    { name: "Bairros", description: "Também disponível em /valores_entregas" },
    { name: "Itens de pedido" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Erro: { type: "object", properties: { error: { type: "string" } } },
      Admin: {
        type: "object",
        properties: {
          id: { type: "string" },
          nome: { type: "string" },
          email: { type: "string" },
        },
      },
      Bairro: {
        type: "object",
        properties: {
          id: { type: "string" },
          ...bairroEntrada.properties,
        },
      },
      Cliente: {
        type: "object",
        properties: {
          id: { type: "string" },
          nome: { type: "string" },
          telefone: { type: "string" },
          rua: { type: "string" },
          numero: { type: "string" },
          obs: { type: "string", nullable: true },
          bairroID: { type: "string" },
          bairro: ref("Bairro"),
        },
      },
      Produto: {
        type: "object",
        properties: {
          id: { type: "string" },
          ...produtoEntrada.properties,
          adminID: { type: "string" },
        },
      },
      Ranking: {
        type: "object",
        properties: {
          descricao: { type: "string" },
          quantidade: { type: "integer" },
        },
      },
      Dashboard: {
        type: "object",
        properties: {
          refeicoes: lista("Ranking"),
          bebidas: lista("Ranking"),
          pedidosPorDia: {
            type: "array",
            items: {
              type: "object",
              properties: {
                dia: { type: "string", example: "2026-10-08" },
                quantidade: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/admins": {
      post: {
        tags: ["Admins"],
        summary: "Cadastrar administrador",
        requestBody: corpo(
          {
            type: "object",
            required: ["nome", "email", "senha"],
            properties: {
              nome: { type: "string" },
              email: { type: "string" },
              senha: { type: "string" },
            },
          },
          { nome: "Novo Admin", email: "novo@admin.com", senha: "senha#123" },
        ),
        responses: { 201: resposta("Criado", ref("Admin")), 400: r400 },
      },
    },
    "/admins/login": {
      post: {
        tags: ["Admins"],
        summary: "Login do administrador (retorna o token)",
        requestBody: corpo(
          {
            type: "object",
            required: ["email", "senha"],
            properties: { email: { type: "string" }, senha: { type: "string" } },
          },
          { email: "admin@admin.com", senha: "admin#123" },
        ),
        responses: {
          200: resposta("Login realizado", {
            type: "object",
            properties: { admin: ref("Admin"), token: { type: "string" } },
          }),
          401: resposta("E-mail ou senha incorretos"),
        },
      },
    },
    "/admins/me": {
      get: {
        tags: ["Admins"],
        summary: "Dados do administrador logado",
        security: protegida,
        responses: { 200: resposta("OK", ref("Admin")), 401: r401 },
      },
    },
    "/clientes": {
      post: {
        tags: ["Clientes"],
        summary: "Cadastrar cliente",
        requestBody: corpo(
          {
            type: "object",
            required: ["nome", "telefone", "senha", "rua", "numero", "bairroID"],
            properties: {
              nome: { type: "string" },
              telefone: { type: "string" },
              senha: { type: "string" },
              rua: { type: "string" },
              numero: { type: "string" },
              obs: { type: "string" },
              bairroID: { type: "string" },
            },
          },
          {
            nome: "Maria Silva",
            telefone: "53988887777",
            senha: "maria#123",
            rua: "Rua A",
            numero: "100",
            bairroID: "33333333-3333-3333-3333-333333333331",
          },
        ),
        responses: {
          201: resposta("Criado", ref("Cliente")),
          400: r400,
          409: resposta("Telefone já cadastrado"),
        },
      },
    },
    "/clientes/login": {
      post: {
        tags: ["Clientes"],
        summary: "Login do cliente",
        requestBody: corpo(
          {
            type: "object",
            required: ["telefone", "senha"],
            properties: {
              telefone: { type: "string" },
              senha: { type: "string" },
            },
          },
          { telefone: "53999999999", senha: "joao#123" },
        ),
        responses: {
          200: resposta("Login realizado", ref("Cliente")),
          401: resposta("Telefone ou senha incorretos"),
        },
      },
    },
    "/clientes/bairros": {
      get: {
        tags: ["Clientes"],
        summary: "Listar bairros de entrega",
        responses: { 200: resposta("OK", lista("Bairro")) },
      },
    },
    "/clientes/{id}": {
      get: {
        tags: ["Clientes"],
        summary: "Buscar cliente por ID",
        parameters: [caminho("id")],
        responses: { 200: resposta("OK", ref("Cliente")), 404: r404 },
      },
    },
    "/produtos": {
      get: {
        tags: ["Produtos"],
        summary: "Listar produtos disponíveis",
        responses: { 200: resposta("OK", lista("Produto")) },
      },
      post: {
        tags: ["Produtos"],
        summary: "Cadastrar produto",
        security: protegida,
        requestBody: corpo(produtoEntrada, {
          descricao: "Ala Minuta de Frango",
          categoria: "Refeição",
          precoBase: 30,
          valorDesconto: 0,
          disponibilidade: true,
          especificacoes: "Arroz, feijão, salada e fritas",
          fotoUrl: null,
          tempoPreparoMinutos: 15,
        }),
        responses: { 201: resposta("Criado", ref("Produto")), 400: r400, 401: r401 },
      },
    },
    "/produtos/todos": {
      get: {
        tags: ["Produtos"],
        summary: "Listar todos os produtos (inclusive indisponíveis)",
        security: protegida,
        responses: { 200: resposta("OK", lista("Produto")), 401: r401 },
      },
    },
    "/produtos/destaques": {
      get: {
        tags: ["Produtos"],
        summary: "Listar produtos em destaque (com desconto)",
        responses: { 200: resposta("OK", lista("Produto")) },
      },
    },
    "/produtos/categoria/{categoria}": {
      get: {
        tags: ["Produtos"],
        summary: "Filtrar produtos por categoria",
        parameters: [caminho("categoria", "Ex.: Bebidas, Refeição")],
        responses: { 200: resposta("OK", lista("Produto")) },
      },
    },
    "/produtos/pesquisa/{termo}": {
      get: {
        tags: ["Produtos"],
        summary: "Pesquisar por texto (descrição/categoria) ou preço máximo (número)",
        parameters: [caminho("termo", "Ex.: minuta ou 10")],
        responses: { 200: resposta("OK", lista("Produto")) },
      },
    },
    "/produtos/{id}": {
      get: {
        tags: ["Produtos"],
        summary: "Buscar produto por ID",
        parameters: [caminho("id")],
        responses: { 200: resposta("OK", ref("Produto")), 404: r404 },
      },
      put: {
        tags: ["Produtos"],
        summary: "Atualizar produto",
        security: protegida,
        parameters: [caminho("id")],
        requestBody: corpo(produtoEntrada),
        responses: {
          200: resposta("OK", ref("Produto")),
          400: r400,
          401: r401,
          404: r404,
        },
      },
      delete: {
        tags: ["Produtos"],
        summary: "Excluir produto",
        security: protegida,
        parameters: [caminho("id")],
        responses: {
          204: resposta("Excluído"),
          401: r401,
          404: r404,
          409: resposta("Produto já aparece em pedidos"),
        },
      },
    },
    "/pedidos": {
      get: {
        tags: ["Pedidos"],
        summary: "Listar todos os pedidos (Kanban)",
        security: protegida,
        responses: { 200: resposta("OK"), 401: r401 },
      },
      post: {
        tags: ["Pedidos"],
        summary: "Criar pedido",
        requestBody: corpo(
          {
            type: "object",
            properties: {
              cliente: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  telefone: { type: "string" },
                  rua: { type: "string" },
                  numero: { type: "string" },
                  bairroID: { type: "string" },
                },
              },
              pedido: {
                type: "object",
                properties: {
                  modalEntrega: { type: "string", enum: ["DELIVERY", "RETIRADA"] },
                  pagamento: {
                    type: "string",
                    enum: ["DINHEIRO", "MAQUININHA_CARTAO"],
                  },
                  valorTotal: { type: "number" },
                  anotacaoGeral: { type: "string" },
                  itens: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        produtoID: { type: "string" },
                        nomeProduto: { type: "string" },
                        quantidade: { type: "integer" },
                        precoProduto: { type: "number" },
                        observacao: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            cliente: {
              nome: "João Souza",
              telefone: "53999999999",
              rua: "Rua do Silício",
              numero: "10",
              bairroID: "33333333-3333-3333-3333-333333333331",
            },
            pedido: {
              modalEntrega: "DELIVERY",
              pagamento: "DINHEIRO",
              valorTotal: 41,
              itens: [
                {
                  produtoID: "44444444-4444-4444-4444-444444444441",
                  nomeProduto: "Ala Minuta de Vazio",
                  quantidade: 1,
                  precoProduto: 35,
                },
              ],
            },
          },
        ),
        responses: { 201: resposta("Criado"), 400: r400 },
      },
    },
    "/pedidos/status/quantidades": {
      get: {
        tags: ["Pedidos"],
        summary: "Quantidade de pedidos por status",
        security: protegida,
        responses: { 200: resposta("OK"), 401: r401 },
      },
    },
    "/pedidos/dashboard": {
      get: {
        tags: ["Pedidos"],
        summary:
          "Dados dos gráficos: refeições e bebidas mais pedidas e pedidos por dia (30 dias)",
        security: protegida,
        responses: { 200: resposta("OK", ref("Dashboard")), 401: r401 },
      },
    },
    "/pedidos/{pedidoId}/status": {
      patch: {
        tags: ["Pedidos"],
        summary: "Atualizar status do pedido",
        security: protegida,
        parameters: [caminho("pedidoId")],
        requestBody: corpo(
          {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: [
                  "PENDENTE",
                  "PREPARANDO",
                  "PRONTO",
                  "EM_ROTA",
                  "ENTREGUE",
                  "CANCELADO",
                ],
              },
            },
          },
          { status: "PREPARANDO" },
        ),
        responses: {
          200: resposta("OK"),
          401: r401,
          404: r404,
          409: resposta("Transição de status não permitida"),
        },
      },
    },
    "/pedidos/cliente/{clienteId}": {
      get: {
        tags: ["Pedidos"],
        summary: "Listar pedidos do cliente",
        parameters: [caminho("clienteId")],
        responses: { 200: resposta("OK"), 400: r400 },
      },
    },
    "/pedidos/cliente/{clienteId}/{pedidoId}/cancelar": {
      patch: {
        tags: ["Pedidos"],
        summary: "Cliente cancela pedido pendente",
        parameters: [caminho("clienteId"), caminho("pedidoId")],
        responses: {
          200: resposta("Cancelado"),
          404: r404,
          409: resposta("Somente pedidos pendentes podem ser cancelados"),
        },
      },
    },
    "/pedidos/cliente/{clienteId}/{pedidoId}/itens/{itemId}/avaliacao": {
      patch: {
        tags: ["Pedidos"],
        summary: "Cliente avalia item de pedido entregue",
        parameters: [
          caminho("clienteId"),
          caminho("pedidoId"),
          caminho("itemId"),
        ],
        requestBody: corpo(
          {
            type: "object",
            properties: { avaliacao: { type: "integer", minimum: 1, maximum: 5 } },
          },
          { avaliacao: 5 },
        ),
        responses: {
          200: resposta("Avaliação registrada"),
          404: r404,
          409: resposta("Pedido ainda não entregue"),
        },
      },
    },
    "/bairros": {
      get: {
        tags: ["Bairros"],
        summary: "Listar bairros",
        responses: { 200: resposta("OK", lista("Bairro")) },
      },
      post: {
        tags: ["Bairros"],
        summary: "Cadastrar bairro",
        security: protegida,
        requestBody: corpo(bairroEntrada, {
          bairro: "Fragata",
          valor: 12,
          tempoEntregaMinutos: 20,
        }),
        responses: {
          201: resposta("Criado", ref("Bairro")),
          400: r400,
          401: r401,
          409: resposta("Bairro já cadastrado"),
        },
      },
    },
    "/bairros/{id}": {
      put: {
        tags: ["Bairros"],
        summary: "Atualizar bairro",
        security: protegida,
        parameters: [caminho("id")],
        requestBody: corpo(bairroEntrada),
        responses: {
          200: resposta("OK", ref("Bairro")),
          400: r400,
          401: r401,
          404: r404,
        },
      },
      delete: {
        tags: ["Bairros"],
        summary: "Excluir bairro",
        security: protegida,
        parameters: [caminho("id")],
        responses: {
          204: resposta("Excluído"),
          401: r401,
          404: r404,
          409: resposta("Bairro vinculado a clientes"),
        },
      },
    },
    "/itens-pedido/avaliacoes": {
      get: {
        tags: ["Itens de pedido"],
        summary: "Média de avaliação por produto",
        responses: { 200: resposta("OK") },
      },
    },
  },
};
