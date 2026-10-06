import { useState, useEffect } from "react";
import { useCarrinho } from "../context/useCarrinhoStore";
import { useClienteStore } from "../context/ClienteContext";
import type { BairroType } from "../utils/BairroType";
import {
  Drawer,
  Radio,
  Label,
  TextInput,
  Button,
  Select,
  DrawerItems,
  DrawerHeader,
} from "flowbite-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutData } from "../schemas/CheckoutSchema";
import { PedidoConfirmadoModal } from "./PedidoConfirmadoModal";
import { calcularPrecoFinal } from "../utils/ProdutoType";

const apiUrl = import.meta.env.VITE_API_URL;

export function CarrinhoDrawer() {
  const { itens, drawerAberto, fecharDrawer, limparCarrinho } = useCarrinho();
  const cliente = useClienteStore((state) => state.cliente);
  const [listaBairros, setListaBairros] = useState<BairroType[]>([]);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    pedidoId: string;
    tempoEstimadoMinutos: number;
    modalEntrega: "DELIVERY" | "RETIRADA";
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { modalEntrega: "DELIVERY", pagamento: "DINHEIRO" },
  });

  useEffect(() => {
    setValue("nome", cliente.id ? cliente.nome : "");
    setValue("telefone", cliente.id ? cliente.telefone : "");
    setValue("bairroID", cliente.id ? cliente.bairroID : "");
    setValue("rua", cliente.id ? cliente.rua : "");
    setValue("numero", cliente.id ? cliente.numero : "");
  }, [cliente, setValue]);

  const modalEntregaAtual = watch("modalEntrega");
  const bairroSelecionadoAtual = watch("bairroID");

  useEffect(() => {
    if (drawerAberto) {
      async function buscarBairros() {
        try {
          const response = await fetch(`${apiUrl}/bairros`);
          const data = await response.json();
          setListaBairros(data);
        } catch (error) {
          console.error("Erro ao buscar bairros:", error);
        }
      }
      buscarBairros();
    }
  }, [drawerAberto]);

  const bairroEscolhido = listaBairros.find(
    (bairro) => bairro.id === bairroSelecionadoAtual,
  );
  const subtotal = itens.reduce(
    (acc, item) => acc + calcularPrecoFinal(item.produto) * item.quantidade,
    0,
  );
  const taxaEntrega =
    modalEntregaAtual === "DELIVERY" && bairroEscolhido
      ? bairroEscolhido.valor
      : 0;
  const total = subtotal + taxaEntrega;

  const enviarPedido = async (data: CheckoutData) => {
    const payload = {
      cliente: {
        nome: data.nome,
        telefone: data.telefone.replace(/\D/g, ""),
        rua: data.rua || "",
        numero: data.numero || "",
        bairroID: data.bairroID,
      },
      pedido: {
        modalEntrega: data.modalEntrega,
        pagamento: data.pagamento,
        valorTotal: total,
        anotacaoGeral: data.anotacaoGeral?.trim(),
        itens: itens.map((item) => ({
          produtoID: item.produto.id,
          nomeProduto: item.produto.descricao,
          quantidade: item.quantidade,
          precoProduto: calcularPrecoFinal(item.produto),
          observacao: item.observacao,
        })),
      },
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.status === 201) {
        limparCarrinho();
        fecharDrawer();
        if (
          typeof responseData.pedidoId === "string" &&
          typeof responseData.tempoTotalEstimadoMinutos === "number"
        ) {
          setPedidoConfirmado({
            pedidoId: responseData.pedidoId,
            tempoEstimadoMinutos: responseData.tempoTotalEstimadoMinutos,
            modalEntrega: data.modalEntrega,
          });
        } else {
          console.error("Resposta de pedido confirmado inválida:", responseData);
          toast.error(
            "O pedido foi criado, mas não foi possível exibir os detalhes.",
          );
        }
      } else {
        toast.error(
          responseData.erro || "Houve um erro ao processar seu pedido.",
        );
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      toast.error("Falha de comunicação com o servidor.");
    }
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  const itensPedido = itens.map((item) => (
    <div key={item.id_item_carrinho} className="flex justify-between">
      {item.quantidade > 1 ? (
        <>
          <span className="text-secundaria">
            {item.produto.descricao} (x{item.quantidade})
          </span>
          <span className="text-secundaria">
            {formatarMoeda(
              calcularPrecoFinal(item.produto) * item.quantidade,
            )}
          </span>
        </>
      ) : (
        <>
          <span className="text-secundaria">{item.produto.descricao}</span>
          <span className="text-secundaria">
            {formatarMoeda(calcularPrecoFinal(item.produto))}
          </span>
        </>
      )}
    </div>
  ));

  return (
    <>
      <Drawer
        open={drawerAberto}
        onClose={fecharDrawer}
        position="right"
        className="w-full bg-fundo p-0 text-secundaria md:w-[450px] flex flex-col overflow-hidden"
      >
      <DrawerHeader
        title="MEU PEDIDO"
        titleIcon={() => <></>}
        className="bg-fundo p-4 text-secundaria"
      />
      <DrawerItems className="flex-1 overflow-y-auto bg-fundo p-4">
        <div className="flex justify-end mb-2">
          <Button
            size="xs"
            color="red"
            outline
            className="2 cursor-pointer"
            onClick={() => {
              limparCarrinho();
              fecharDrawer();
            }}
          >
            Limpar Carrinho
          </Button>
        </div>

        <div className="mb-6 space-y-3 rounded-lg bg-secundaria/5 p-4">
          {itensPedido}
          <div className="flex justify-between">
            <span className="text-secundaria"></span>
            <span className="text-secundaria"></span>
          </div>
          <hr className="border-secundaria/15" />
          <div className="flex justify-between">
            <span className="text-secundaria">Subtotal</span>
            <span className="text-secundaria">{formatarMoeda(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secundaria">Entrega</span>
            <span className="text-secundaria">{formatarMoeda(taxaEntrega)}</span>
          </div>
          <hr className="border-secundaria/15" />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-secundaria">Total</span>
            <span className="text-secundaria">{formatarMoeda(total)}</span>
          </div>
        </div>

        <form id="form-checkout" onSubmit={handleSubmit(enviarPedido)}>
          <div>
            <h3 className="text-lg font-bold text-secundaria mb-3">Seus Dados</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <TextInput
                  id="nome"
                  placeholder="Ex: João Silva"
                  readOnly={Boolean(cliente.id)}
                  {...register("nome")}
                />
                {errors.nome && (
                  <span className="text-red-500 text-sm">
                    {errors.nome.message}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="telefone">WhatsApp *</Label>
                <TextInput
                  id="telefone"
                  placeholder="(53) 99999-9999"
                  readOnly={Boolean(cliente.id)}
                  {...register("telefone")}
                />
                {errors.telefone && (
                  <span className="text-red-500 text-sm">
                    {errors.telefone.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-secundaria mb-3">
              Como deseja receber?
            </h3>
            <fieldset className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Radio
                  id="delivery"
                  value="DELIVERY"
                  className="text-primaria focus:ring-primaria"
                  {...register("modalEntrega")}
                />
                <Label htmlFor="delivery">Entrega no meu endereço</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="retirada"
                  value="RETIRADA"
                  className="text-primaria focus:ring-primaria"
                  {...register("modalEntrega")}
                />
                <Label htmlFor="retirada">Vou buscar no balcão</Label>
              </div>
            </fieldset>

            {modalEntregaAtual === "DELIVERY" && (
              <div className="mt-4 space-y-3 p-4 rounded-lg">
                <div>
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Select
                    id="bairro"
                    className="focus:border-primaria focus:ring-primaria"
                    {...register("bairroID")}
                  >
                    <option value="">Selecione seu bairro...</option>
                    {listaBairros.map((bairro) => (
                      <option key={bairro.id} value={bairro.id}>
                        {bairro.bairro} - {formatarMoeda(bairro.valor)}
                      </option>
                    ))}
                  </Select>
                  {errors.bairroID && (
                    <span className="text-red-500 text-sm">
                      {errors.bairroID.message}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="rua">Rua *</Label>
                    <TextInput
                      id="rua"
                      placeholder="Nome da rua"
                      {...register("rua")}
                    />
                    {errors.rua && (
                      <span className="text-red-500 text-sm">
                        {errors.rua.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="numero">Nº *</Label>
                    <TextInput
                      id="numero"
                      placeholder="Número"
                      {...register("numero")}
                    />
                    {errors.numero && (
                      <span className="text-red-500 text-sm">
                        {errors.numero.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-secundaria mb-3">
              Forma de Pagamento
            </h3>
            <fieldset className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Radio
                  id="maquininha"
                  value="MAQUININHA_CARTAO"
                  className="text-primaria focus:ring-primaria"
                  {...register("pagamento")}
                />
                <Label htmlFor="maquininha">
                  Cartão (Levamos a maquininha)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="dinheiro"
                  value="DINHEIRO"
                  defaultChecked
                  className="text-primaria focus:ring-primaria"
                  {...register("pagamento")}
                />
                <Label htmlFor="dinheiro">Dinheiro</Label>
              </div>
            </fieldset>
          </div>
          <div>
            <h3 className="text-lg font-bold text-secundaria mb-3">
              Observações (Opcional)
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="anotacaoGeral" className="sr-only">
                  Observações do pedido
                </Label>
                <TextInput
                  id="anotacaoGeral"
                  placeholder="Ex: Troco para R$ 100"
                  {...register("anotacaoGeral")}
                />
              </div>
            </div>
          </div>
        </form>
      </DrawerItems>

      {/* Footer Fixo */}
      <div className="flex gap-3 border-t border-secundaria/10 bg-fundo p-4">
        <Button
          onClick={fecharDrawer}
          className="flex-1 cursor-pointer border border-secundaria/20 bg-fundo text-secundaria hover:bg-secundaria/5 focus:ring-primaria"
        >
          Continuar Comprando
        </Button>
        <Button
          type="submit"
          form="form-checkout"
          className="flex-1 cursor-pointer bg-primaria font-bold text-white hover:bg-secundaria focus:ring-primaria"
        >
          Confirmar Pedido
        </Button>
      </div>
      </Drawer>
      {pedidoConfirmado && (
        <PedidoConfirmadoModal
          pedidoId={pedidoConfirmado.pedidoId}
          tempoEstimadoMinutos={pedidoConfirmado.tempoEstimadoMinutos}
          modalEntrega={pedidoConfirmado.modalEntrega}
          clienteLogado={Boolean(cliente.id)}
          onClose={() => setPedidoConfirmado(null)}
        />
      )}
    </>
  );
}
