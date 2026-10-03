import { useState, useEffect } from "react";
import { useCarrinho } from "../context/useCarrinhoStore";
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

const apiUrl = import.meta.env.VITE_API_URL;

export function CarrinhoDrawer() {
  const { itens, drawerAberto, fecharDrawer, limparCarrinho } = useCarrinho();

  const [modalEntrega, setModalEntrega] = useState("DELIVERY");
  const [metodoPagamento, setMetodoPagamento] = useState("DINHEIRO");

  const [listaBairros, setListaBairros] = useState<BairroType[]>([]);
  const [bairroSelecionadoId, setBairroSelecionadoId] = useState("");

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
    (bairro) => bairro.id === bairroSelecionadoId,
  );
  const subtotal = itens.reduce(
    (acc, item) => acc + item.produto.precoBase * item.quantidade,
    0,
  );
  const taxaEntrega =
    modalEntrega === "DELIVERY" && bairroEscolhido ? bairroEscolhido.valor : 0;
  const total = subtotal + taxaEntrega;

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  const itensPedido = itens.map((item) => (
    <div key={item.id_item_carrinho} className="flex justify-between">
      {item.quantidade > 1 ? (
        <>
          <span className="text-gray-800">
            {item.produto.descricao} (x{item.quantidade})
          </span>
          <span className="text-gray-900">
            {formatarMoeda(item.produto.precoBase * item.quantidade)}
          </span>
        </>
      ) : (
        <>
          <span className="text-gray-800">{item.produto.descricao}</span>
          <span className="text-gray-900">
            {formatarMoeda(item.produto.precoBase)}
          </span>
        </>
      )}
    </div>
  ));

  const finalizar = () => {
    toast.success("Pedido Confirmado! Acompanhe pelo seu Whatsapp!");
    limparCarrinho();
    fecharDrawer();
  };

  return (
    <Drawer
      open={drawerAberto}
      onClose={fecharDrawer}
      position="right"
      className="w-full md:w-[450px] p-0"
    >
      <DrawerHeader
        title="MEU PEDIDO"
        titleIcon={() => <></>}
        className="p-4"
      />

      <DrawerItems className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
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
        <div className="bg-gray-100 text-white rounded-lg p-4 mb-6 space-y-3">
          {itensPedido}
          <div className="flex justify-between">
            <span className="text-gray-800"></span>
            <span className="text-gray-900"></span>
          </div>
          <hr className="border-gray-600" />
          <div className="flex justify-between">
            <span className="text-gray-800">Subtotal</span>
            <span className="text-gray-900">{formatarMoeda(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-800">Entrega</span>
            <span className="text-gray-900">{formatarMoeda(taxaEntrega)}</span>
          </div>
          <hr className="border-gray-600" />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-800">Total</span>
            <span className="text-gray-900">{formatarMoeda(total)}</span>
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Seus Dados</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="nome" value="Nome Completo *" />
                <TextInput id="nome" placeholder="Ex: João Silva" required />
              </div>
              <div>
                <Label htmlFor="telefone" value="WhatsApp *" />
                <TextInput
                  id="telefone"
                  placeholder="(53) 99999-9999"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Como deseja receber?
            </h3>
            <fieldset className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Radio
                  id="delivery"
                  name="modalEntrega"
                  value="DELIVERY"
                  defaultChecked
                  onChange={(e) => setModalEntrega(e.target.value)}
                />
                <Label htmlFor="delivery">Entrega no meu endereço</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="retirada"
                  name="modalEntrega"
                  value="RETIRADA"
                  onChange={(e) => setModalEntrega(e.target.value)}
                />
                <Label htmlFor="retirada">Vou buscar no balcão</Label>
              </div>
            </fieldset>

            {modalEntrega === "DELIVERY" && (
              <div className="mt-4 space-y-3 p-4 rounded-lg">
                <div>
                  <Label htmlFor="bairro" value="Bairro *" />
                  <Select
                    id="bairro"
                    required
                    value={bairroSelecionadoId}
                    onChange={(e) => setBairroSelecionadoId(e.target.value)}
                  >
                    <option>Selecione um bairro...</option>
                    {listaBairros.map((bairro) => (
                      <option key={bairro.id} value={bairro.id}>
                        {bairro.bairro} - {formatarMoeda(bairro.valor)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="rua" value="Rua *" />
                    <TextInput id="rua" placeholder="Nome da rua" required />
                  </div>
                  <div>
                    <Label htmlFor="numero" value="Nº *" />
                    <TextInput id="numero" placeholder="Número" required />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Forma de Pagamento
            </h3>
            <fieldset className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Radio
                  id="maquininha"
                  name="pagamento"
                  value="MAQUININHA_CARTAO"
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                />
                <Label htmlFor="maquininha">
                  Cartão (Levamos a maquininha)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="dinheiro"
                  name="pagamento"
                  value="DINHEIRO"
                  defaultChecked
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                />
                <Label htmlFor="dinheiro">Dinheiro</Label>
              </div>
            </fieldset>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Deseja incluir alguma observação?
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="anotacaoCliente" value="Observação *" />
                <TextInput
                  id="anotacaoCliente"
                  placeholder="Ex: Entregar na porta da frente"
                />
              </div>
            </div>
          </div>
        </form>
      </DrawerItems>

      {/* Footer Fixo */}
      <div className="p-4 border-t bg-white flex gap-3">
        <Button color="light" onClick={fecharDrawer} className="flex-1">
          Continuar Comprando
        </Button>
        <Button color="cyan" className="flex-1 font-bold" onClick={finalizar}>
          Confirmar Pedido
        </Button>
      </div>
    </Drawer>
  );
}
