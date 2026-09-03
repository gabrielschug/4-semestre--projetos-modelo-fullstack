import { prisma } from "../src/lib/prisma";
// 1. Limpar o banco para não duplicar
async function limparBanco() {
    await prisma.itensPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.valorEntrega.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.configuracao.deleteMany();
}
// Criando IDs com uuid
const adminId = "11111111-1111-1111-1111-111111111111";
const clienteId = "22222222-2222-2222-2222-222222222222";
const bairroValverdeId = "33333333-3333-3333-3333-333333333331";
const produtoVazioId = "44444444-4444-4444-4444-444444444441";
const produtoGuaranaId = "44444444-4444-4444-4444-444444444442";
const numPedido = "55555555-4444-4444-4444-555555555555";
const admins = [
    { id: adminId, email: "admin@admin.com", nome: "Administrador", senha: "admin#123" }
];
const configuracoes = [
    { tempoAdicionalMinutos: 30 }
];
const bairros = [
    { id: bairroValverdeId, bairro: "Valverde", valor: 5.0, tempoEntregaMinutos: 10 },
    { bairro: "Santo Antonio", valor: 5.0, tempoEntregaMinutos: 10 },
    { bairro: "Balneário dos Prazeres/Z3", valor: 10.0, tempoEntregaMinutos: 15 },
    { bairro: "Areal", valor: 15.0, tempoEntregaMinutos: 20 },
    { bairro: "Centro", valor: 20.0, tempoEntregaMinutos: 25 }
];
const clientes = [
    { id: clienteId, nome: "João Souza", telefone: "53999999999", senha: "joao#123", rua: "Rua do Silício", numero: "10", bairroID: bairroValverdeId }
];
const produtos = [
    { id: produtoVazioId, descricao: "Ala Minuta de Vazio", categoria: "Refeição", precoBase: 35.0, tempoPreparoMinutos: 15, adminID: adminId },
    { descricao: "Ala Minuta de Picanha", categoria: "Refeição", precoBase: 48.0, tempoPreparoMinutos: 15, adminID: adminId },
    { descricao: "Água mineral 500ml (com gás)", categoria: "Bebidas", precoBase: 5.0, tempoPreparoMinutos: 0, adminID: adminId },
    { id: produtoGuaranaId, descricao: "Guaraná 350ml (normal)", categoria: "Bebidas", precoBase: 6.0, tempoPreparoMinutos: 0, adminID: adminId },
    { descricao: "Coca-Cola 350ml (zero)", categoria: "Bebidas", precoBase: 6.0, tempoPreparoMinutos: 0, adminID: adminId }
];
const pedidos = [
    {
        id: numPedido,
        clienteID: clienteId,
        status: "PENDENTE",
        modalEntrega: "DELIVERY",
        pagamento: "DINHEIRO",
        valorTotal: 41.0,
        tempoTotalEstimadoMinutos: 25,
    }
];
const itensPedidos = [
    { pedidoID: numPedido, produtoID: produtoVazioId, quantidade: 1, precoProduto: 35.0 },
    { pedidoID: numPedido, produtoID: produtoGuaranaId, quantidade: 1, precoProduto: 6.0 }
];
async function main() {
    await limparBanco();
    console.log("Banco de dados limpo com sucesso.");
    await prisma.admin.createMany({ data: admins });
    console.log(`${admins.length} Admin cadastrado.`);
    await prisma.configuracao.createMany({ data: configuracoes });
    console.log(`${configuracoes.length} Configuração cadastrada.`);
    await prisma.valorEntrega.createMany({ data: bairros });
    console.log(`${bairros.length} Bairros cadastrados.`);
    await prisma.cliente.createMany({ data: clientes });
    console.log(`${clientes.length} Cliente cadastrado.`);
    await prisma.produto.createMany({ data: produtos });
    console.log(`${produtos.length} Produtos cadastrados.`);
    await prisma.pedido.createMany({ data: pedidos });
    console.log(`${pedidos.length} Pedidos cadastrados no Kanban.`);
    await prisma.itensPedido.createMany({ data: itensPedidos });
    console.log(`${itensPedidos.length} Itens de Pedido vinculados.`);
}
main()
    .then(async () => {
    console.log("✅ Seed concluido.");
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error("❌ Erro nas inclusões:", e);
    await prisma.$disconnect();
    process.exit(1);
});
