# Minuta Campeira

Este repositório contém um projeto acadêmico fullstack desenvolvido na disciplina de Programação FullStack do 4º semestre da faculdade. A ideia principal foi criar um sistema completo de delivery para um restaurante, com front-end para clientes e painel administrativo para o dono/funcionários do estabelecimento.

O projeto simula um ambiente real de operação de um restaurante digital, incluindo catálogo de produtos, cadastro de clientes, cálculo de preços, gerenciamento de pedidos, autenticação, fluxo de entrega e painel administrativo com controle do status dos pedidos.

## Visão geral do projeto

A aplicação foi pensada como um sistema de e-commerce gastronômico, com duas interfaces principais:

- Frontend para clientes: navegação no cardápio, filtro de produtos, visualização de detalhes, cadastro/login, carrinho de compras e acompanhamento dos próprios pedidos.
- Backend e API: responsável pela regra de negócio, autenticação, persistência no banco de dados e integração com o frontend.
- Área administrativa: painel com login do administrador, visualização de pedidos em um quadro Kanban, atualização de status e gerenciamento de produtos e locais de entrega.

## Tecnologias utilizadas

### Frontend
- React
- TypeScript
- Vite
- React Router DOM
- Zustand
- Tailwind CSS
- Flowbite React
- React Hook Form
- Zod
- Sonner

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- Bcrypt para hash de senhas
- Zod para validação de entrada

## Objetivos acadêmicos

Este projeto foi desenvolvido com foco em aprender e aplicar os conceitos vistos em Programação FullStack, especialmente:

- arquitetura cliente-servidor;
- separação entre frontend e backend;
- consumo de API REST;
- modelagem de banco de dados relacional;
- autenticação e autorização;
- manipulação de dados e regras de negócio;
- interface com UX funcional e responsiva;
- integração entre front-end, back-end e banco de dados.

## Funcionalidades

### Para clientes
- cadastro de conta
- login com telefone e senha
- visualização de produtos por categoria
- busca por produtos
- destaque de ofertas
- detalhes do produto com avaliação
- carrinho de compras
- cálculo de valor do pedido
- seleção de tipo de entrega (delivery ou retirada)
- escolha de bairro e valor de entrega
- acompanhamento dos pedidos realizados
- avaliação de itens do pedido

### Para administradores
- login administrativo
- painel com resumo dos pedidos por status
- quadro Kanban para controlar a produção e entrega
- atualização de status do pedido
- cadastro e gerenciamento de produtos
- gestão de bairros e valores de entrega
- controle de tempo estimado de entrega e preparo

## Estrutura do projeto

```text
4-semestre--projetos-modelo-fullstack/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

## Modelo de negócio e banco de dados

O sistema utiliza um banco relacional em PostgreSQL com Prisma. Os principais modelos são:

- Admin
  - dados do usuário administrativo
  - autenticação e gestão do sistema

- Cliente
  - nome, telefone, senha, endereço e bairro

- Produto
  - descrição, categoria, preço, desconto, disponibilidade e informações adicionais

- Pedido
  - cliente responsável, valor total, forma de entrega, pagamento e status

- ItensPedido
  - itens que compõem cada pedido, quantidade e preço por produto

- ValorEntrega
  - bairro e valor do frete associado

- Configuracao
  - ajustes gerais do sistema, como tempo adicional

Os estados de pedido estão definidos para representar o ciclo completo do atendimento:

- PENDENTE
- PREPARANDO
- PRONTO
- EM_ROTA
- ENTREGUE
- CANCELADO

## Requisitos para execução

Antes de rodar o projeto, você precisará ter instalado:

- Node.js 20.19+ ou 22.12+
- npm
- PostgreSQL
- Git

## Configuração do ambiente

### 1. Clonar o repositório

```bash
git clone https://github.com/gabrielschug/4-semestre--projetos-modelo-fullstack.git
cd 4-semestre--projetos-modelo-fullstack
```

### 2. Configurar o backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Copie o arquivo `.env.example` para `.env` na pasta `backend` e edite os valores:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

O arquivo `.env.example` lista as variáveis necessárias, incluindo `DATABASE_URL`, `JWT_SECRET` e `PORT`. Configure a conexão e uma chave secreta forte antes de iniciar o servidor. `GEMINI_API_KEY` é opcional e só é necessária para gerar frases de venda com Gemini.

As variáveis principais são:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO?schema=public"
JWT_SECRET="sua_chave_secreta_super_segura"
PORT=3000
```

Exemplo:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/minuta_campiera?schema=public"
JWT_SECRET="minha-chave-secreta-de-teste"
PORT=3000
```

Depois, execute as migrações do Prisma:

```bash
npx prisma migrate dev
```

Se quiser popular o banco com dados iniciais (administrador, clientes, bairros, produtos e pedidos de exemplo), rode:

```bash
npx tsx prisma/seed.ts
```

Para iniciar o servidor:

```bash
npm run dev
```

O backend ficará disponível em:

```text
http://localhost:3000
```

### 3. Configurar o frontend

Abra uma nova aba do terminal e entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Copie o arquivo `.env.example` para `.env` na pasta `frontend`:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

O `.env.example` já configura a URL local padrão da API. Se o backend usar outra porta ou endereço, ajuste `VITE_API_URL` no `.env`.

```env
VITE_API_URL="http://localhost:3000/"
```

Em seguida, inicie o frontend:

```bash
npm run dev
```

A aplicação frontend geralmente fica disponível em:

```text
http://localhost:5173
```

## Dados de teste

O projeto já vem preparado com seed para facilitar a execução local. Alguns exemplos de acesso:

### Administrador
- email: `admin@admin.com`
- senha: `admin#123`

### Cliente
- telefone: `53999999999`
- senha: `joao#123`

Esses dados permitem testar o fluxo completo do sistema de forma prática durante o desenvolvimento e apresentação do projeto.

## Comandos úteis

### Backend
```bash
npm run dev
npm run build
npx prisma migrate dev
npx prisma studio
```

### Frontend
```bash
npm run dev
npm run build
npm run preview
```

## Observações importantes para o contexto acadêmico

Este projeto foi desenvolvido como uma atividade de aprendizagem no curso de Programação FullStack e demonstra a integração entre:

- front-end em React;
- back-end em Express com TypeScript;
- banco relacional com PostgreSQL e Prisma;
- autenticação JWT;
- organização modular do código;
- manipulação de dados reais em um fluxo de negócio completo.

Ele é um excelente exemplo de aplicação fullstack realista, adequada para estudo, apresentação de trabalho acadêmico e aprofundamento em desenvolvimento web.

## Conclusão

O projeto Minuta Campeira representa uma solução completa para a gestão de pedidos de um restaurante em ambiente digital. Além de atender a uma necessidade real de negócio, ele também funciona como um material de estudo valioso para compreender como um sistema fullstack é estruturado, integrado e entregue para uso prático.

Se você estiver estudando programação fullstack, este projeto pode servir como base para aprender arquitetura de software, API REST, consumo de dados, autenticação, banco de dados e desenvolvimento de interfaces modernas.
