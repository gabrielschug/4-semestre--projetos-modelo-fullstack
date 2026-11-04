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
- Multer para receber imagens de produtos
- Cloudinary para armazenar imagens de produtos
- JWT para autenticação
- Bcrypt para hash de senhas
- Zod para validação de entrada
- Stripe (`stripe`) para cobrança online com Pix e cartão

### Bibliotecas de interface
- dnd-kit para a funcionalidade de arrastar e soltar no Kanban administrativo
- Stripe.js (`@stripe/stripe-js` e `@stripe/react-stripe-js`) para o formulário de pagamento (Pix e cartão) no carrinho

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
- pagamento em dinheiro, na maquininha ou online com Pix e cartão de crédito/débito (Stripe)
- acompanhamento dos pedidos realizados
- avaliação de itens do pedido

### Para administradores
- login administrativo
- painel com resumo dos pedidos por status
- quadro Kanban para controlar a produção e entrega
- movimentação de pedidos entre as etapas do Kanban por drag and drop, com atualização do status no backend
- atualização de status do pedido
- cadastro e gerenciamento de produtos com envio de imagens
- gestão de bairros e valores de entrega
- controle de tempo estimado de entrega e preparo

### Imagens dos produtos
As imagens são enviadas como arquivos JPEG ou PNG de até 5 MB. O backend recebe o arquivo com Multer e o envia para o Cloudinary; a URL segura retornada é armazenada junto aos dados do produto. O envio é usado no cadastro e na edição de produtos, pelo campo `fotoUrl`.

### Pagamento online (Stripe)
No carrinho, a opção "Pagar online agora (Pix ou cartão de crédito/débito)" abre o formulário do Stripe (Payment Element) dentro do próprio drawer. O fluxo é:

1. O frontend envia o pedido com `pagamento: "ONLINE"`. O backend confere preços e taxa de entrega com o banco, cria o pedido e um PaymentIntent no Stripe (aceitando `card` e `pix`), e devolve o `clientSecret`.
2. O cliente escolhe Pix ou cartão no Payment Element. Os dados vão direto para o Stripe, sem passar pelo backend.
   - **Cartão (crédito ou débito):** a aprovação acontece na hora, inclusive a etapa 3D Secure.
   - **Pix:** o drawer mostra o QR Code e o código Pix Copia e Cola, e consulta o Stripe a cada 3 segundos até o pagamento ser aprovado. O QR Code vale 30 minutos (`VALIDADE_PIX_SEGUNDOS` em `PagamentoService.ts`).
3. Com o pagamento aprovado, o frontend chama `POST /pagamentos/pedidos/:pedidoId/confirmar`. O backend consulta o Stripe e grava `pagoEm` no pedido. Se o Stripe redirecionar o cliente, a página inicial recebe `?pedido=ID&redirect_status=...` e conclui a confirmação.
4. O webhook `POST /pagamentos/webhook` também grava `pagoEm`, caso o cliente feche a página antes da confirmação.

Pedidos online só aparecem no Kanban, no dashboard e em "Meus pedidos" depois que o pagamento é confirmado. No Kanban eles levam a etiqueta "Pago online".

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

O arquivo `.env.example` lista as variáveis necessárias, incluindo `DATABASE_URL`, `JWT_SECRET` e `PORT`. Configure a conexão e uma chave secreta forte antes de iniciar o servidor. Para enviar imagens de produtos, configure também as credenciais da sua conta Cloudinary. `GEMINI_API_KEY` é opcional e só é necessária para gerar frases de venda com Gemini.

As variáveis principais são:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO?schema=public"
JWT_SECRET="sua_chave_secreta_super_segura"
PORT=3000
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="sua_api_secret"
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

#### Pagamento online com Stripe (opcional)

Sem as chaves do Stripe o sistema funciona normalmente, mas a opção "Pagar online" não aparece no carrinho. Para ativar:

1. Crie uma conta em [stripe.com](https://stripe.com) com o Brasil como país da conta e, no modo de teste, copie as chaves em *Developers → API keys*.
2. Ative o **Pix** em [Settings → Payment methods](https://dashboard.stripe.com/settings/payment_methods), no modo de teste e também no modo de produção. Cartões já vêm ativados.
3. No `backend/.env`, preencha `STRIPE_SECRET_KEY` com a chave secreta (`sk_test_...`).
4. No `frontend/.env`, preencha `VITE_STRIPE_PUBLISHABLE_KEY` com a chave publicável (`pk_test_...`).

Para testar no modo de teste:

- **Cartão:** `4242 4242 4242 4242`, qualquer data futura e qualquer CVC. O cartão `4000 0025 0000 3155` simula a autenticação 3D Secure.
- **Pix:** escolha Pix e use o CPF `000.000.000-00`. Para controlar o resultado, use o e-mail: `succeed_immediately@teste.com` paga na hora, `qualquer@teste.com` paga em cerca de 3 minutos e `expire_immediately@teste.com` expira na hora. O botão **Simular digitalização** também permite aprovar ou expirar o Pix.

O webhook é recomendado, principalmente para o Pix, que é pago fora da página. Com a [Stripe CLI](https://docs.stripe.com/stripe-cli) instalada, rode:

```bash
stripe listen --forward-to localhost:3000/pagamentos/webhook
```

Copie o segredo `whsec_...` exibido para `STRIPE_WEBHOOK_SECRET` no `backend/.env`. Em produção, cadastre o endpoint `https://SEU_BACKEND/pagamentos/webhook` no painel do Stripe com o evento `payment_intent.succeeded`.

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
