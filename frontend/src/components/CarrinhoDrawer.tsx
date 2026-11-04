import { useState, useEffect } from "react";
import { useCarrinho, type ItemCarrinho } from "../context/useCarrinhoStore";
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
import { PagamentoOnline } from "./PagamentoOnline";
import { calcularPrecoFinal } from "../utils/ProdutoType";
import {
  confirmarPagamentoNoServidor,
  stripePromise,
} from "../utils/stripe";

const apiUrl = import.meta.env.VITE_API_URL;

type PedidoConfirmado = {
  pedidoId: number;
  tempoEstimadoMinutos: number;
  modalEntrega: "DELIVERY" | "RETIRADA";
  pagoOnline: boolean;
};

// Pedido online já criado, esperando o cliente pagar no formulário do Stripe
type PagamentoPendente = Omit<PedidoConfirmado, "pagoOnline"> & {
  clientSecret: string;
  total: number;
  nomeCliente: string;
  itens: ItemCarrinho[];
};

export function CarrinhoDrawer() {
  const { itens, drawerAberto, fecharDrawer, limparCarrinho } = useCarrinho();
  const cliente = useClienteStore((state) => state.cliente);
  const [listaBairros, setListaBairros] = useState<BairroType[]>([]);
  const enderecoPrincipal = cliente.enderecos?.[0];
  const [pedidoConfirmado, setPedidoConfirmado] =
    useState<PedidoConfirmado | null>(null);
  const [pagamentoPendente, setPagamentoPendente] =
    useState<PagamentoPendente | null>(null);
  // Se o carrinho mudar, o valor cobrado ficaria errado: volta para o formulário
  const pagamentoAtual =
    pagamentoPendente?.itens === itens ? pagamentoPendente : null;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { modalEntrega: "DELIVERY", pagamento: "DINHEIRO" },
  });

  useEffect(() => {
    setValue("nome", cliente.id ? cliente.nome : "");
    setValue("telefone", cliente.id ? cliente.telefone : "");
    setValue("bairroID", enderecoPrincipal?.bairroID);
    setValue("rua", enderecoPrincipal?.rua ?? "");
    setValue("numero", enderecoPrincipal?.numero ?? "");
  }, [cliente.id, cliente.nome, cliente.telefone, enderecoPrincipal, setValue]);

  const modalEntregaAtual = watch("modalEntrega");
  const bairroSelecionadoAtual = watch("bairroID");
  const pagamentoSelecionado = watch("pagamento");

  // Quando o Stripe redireciona de volta (ex.: Pix aprovado), a URL traz
  // ?pedido=ID&redirect_status=... e a confirmação termina aqui
  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const pedidoId = Number(parametros.get("pedido"));
    const status = parametros.get("redirect_status");
    if (!pedidoId || !status) {
      return;
    }
    // Limpa a URL na hora para não processar o retorno duas vezes
    window.history.replaceState(null, "", window.location.pathname);

    if (status === "processing") {
      toast.info(
        "Pagamento em processamento. O pedido vai para a cozinha assim que for aprovado.",
      );
      return;
    }
    if (status !== "succeeded") {
      toast.error("O pagamento não foi concluído. Tente novamente.");
      return;
    }
    confirmarPagamentoNoServidor(pedidoId).then((pedido) => {
      if (pedido) {
        setPedidoConfirmado({ ...pedido, pagoOnline: true });
      } else {
        toast.warning(
          `Pagamento recebido, mas não conseguimos avisar o restaurante. Se o pedido #${pedidoId} não aparecer em alguns minutos, fale conosco pelo WhatsApp.`,
          { duration: 15000 },
        );
      }
    });
  }, []);

  useEffect(() => {
    if (drawerAberto) {
      async function buscarBairros() {
        try {
          const response = await fetch(`${apiUrl}/bairros`);
          if (!response.ok) {
            throw new Error(`Falha ao buscar bairros: HTTP ${response.status}`);
          }

          const data: unknown = await response.json();
          if (!Array.isArray(data)) {
            throw new Error("A resposta de bairros tem formato inválido");
          }

          setListaBairros(data);
        } catch (error) {
          console.error("Erro ao buscar bairros:", error);
          toast.error("Não foi possível carregar os bairros de entrega.");
        }
      }
      buscarBairros();
    }
  }, [drawerAberto]);

  const bairroEscolhido = listaBairros.find(
    (bairro) => bairro.id === Number(bairroSelecionadoAtual),
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
      },
      pedido: {
        modalEntrega: data.modalEntrega,
        pagamento: data.pagamento,
        valorTotal: total,
        anotacaoGeral: data.anotacaoGeral?.trim(),
        ruaEntrega: data.modalEntrega === "DELIVERY" ? data.rua : undefined,
        numeroEntrega:
          data.modalEntrega === "DELIVERY" ? data.numero : undefined,
        nomeBairroEntrega:
          data.modalEntrega === "DELIVERY"
            ? bairroEscolhido?.bairro
            : undefined,
        valorTaxaEntrega:
          data.modalEntrega === "DELIVERY" ? bairroEscolhido?.valor : undefined,
        itens: itens.map((item) => ({
          produtoID: Number(item.produto.id),
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
        if (data.pagamento === "ONLINE") {
          // O carrinho só é limpo depois que o pagamento for aprovado
          if (
            typeof responseData.pedidoId === "number" &&
            typeof responseData.tempoTotalEstimadoMinutos === "number" &&
            typeof responseData.clientSecret === "string"
          ) {
            setPagamentoPendente({
              pedidoId: responseData.pedidoId,
              tempoEstimadoMinutos: responseData.tempoTotalEstimadoMinutos,
              modalEntrega: data.modalEntrega,
              clientSecret: responseData.clientSecret,
              total,
              nomeCliente: data.nome,
              itens,
            });
          } else {
            console.error("Resposta de pagamento online inválida:", responseData);
            toast.error("Não foi possível iniciar o pagamento online.");
          }
          return;
        }

        limparCarrinho();
        fecharDrawer();
        if (
          typeof responseData.pedidoId === "number" &&
          typeof responseData.tempoTotalEstimadoMinutos === "number"
        ) {
          setPedidoConfirmado({
            pedidoId: responseData.pedidoId,
            tempoEstimadoMinutos: responseData.tempoTotalEstimadoMinutos,
            modalEntrega: data.modalEntrega,
            pagoOnline: false,
          });
        } else {
          console.error(
            "Resposta de pedido confirmado inválida:",
            responseData,
          );
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
            {formatarMoeda(calcularPrecoFinal(item.produto) * item.quantidade)}
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
        {pagamentoAtual && (
          <PagamentoOnline
            key={pagamentoAtual.clientSecret}
            pedidoId={pagamentoAtual.pedidoId}
            clientSecret={pagamentoAtual.clientSecret}
            total={pagamentoAtual.total}
            nomeCliente={pagamentoAtual.nomeCliente}
            onVoltar={() => setPagamentoPendente(null)}
            onPago={() => {
              setPagamentoPendente(null);
              limparCarrinho();
              fecharDrawer();
              setPedidoConfirmado({
                pedidoId: pagamentoAtual.pedidoId,
                tempoEstimadoMinutos: pagamentoAtual.tempoEstimadoMinutos,
                modalEntrega: pagamentoAtual.modalEntrega,
                pagoOnline: true,
              });
            }}
          />
        )}
        {/* Durante o pagamento o formulário só fica escondido, para manter o que foi preenchido */}
        <DrawerItems
          className={`flex-1 overflow-y-auto bg-fundo p-4 ${pagamentoAtual ? "hidden" : ""}`}
        >
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
              <span className="text-secundaria">
                {formatarMoeda(taxaEntrega)}
              </span>
            </div>
            <hr className="border-secundaria/15" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-secundaria">Total</span>
              <span className="text-secundaria">{formatarMoeda(total)}</span>
            </div>
          </div>

          <form id="form-checkout" onSubmit={handleSubmit(enviarPedido)}>
            <div>
              <h3 className="text-lg font-bold text-secundaria mb-3">
                Seus Dados
              </h3>
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
                      {...register("bairroID", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      })}
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
                {stripePromise && (
                  <div className="flex items-center gap-2">
                    <Radio
                      id="online"
                      value="ONLINE"
                      className="text-primaria focus:ring-primaria"
                      {...register("pagamento")}
                    />
                    <Label htmlFor="online">
                      Pagar online agora (Pix ou cartão de crédito/débito)
                    </Label>
                  </div>
                )}
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
        <div
          className={`${pagamentoAtual ? "hidden" : "flex"} gap-3 border-t border-secundaria/10 bg-fundo p-4`}
        >
          <Button
            onClick={fecharDrawer}
            className="flex-1 cursor-pointer border border-secundaria/20 bg-fundo text-secundaria hover:bg-secundaria/5 focus:ring-primaria"
          >
            Continuar Comprando
          </Button>
          <Button
            type="submit"
            form="form-checkout"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer bg-primaria font-bold text-white hover:bg-secundaria focus:ring-primaria"
          >
            {isSubmitting
              ? "Enviando..."
              : pagamentoSelecionado === "ONLINE"
                ? "Ir para pagamento"
                : "Confirmar Pedido"}
          </Button>
        </div>
      </Drawer>
      {pedidoConfirmado && (
        <PedidoConfirmadoModal
          pedidoId={pedidoConfirmado.pedidoId}
          tempoEstimadoMinutos={pedidoConfirmado.tempoEstimadoMinutos}
          modalEntrega={pedidoConfirmado.modalEntrega}
          pagoOnline={pedidoConfirmado.pagoOnline}
          clienteLogado={Boolean(cliente.id)}
          onClose={() => setPedidoConfirmado(null)}
        />
      )}
    </>
  );
}
