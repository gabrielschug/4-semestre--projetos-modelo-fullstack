import { useState } from "react";
import { useCarrinho } from "../context/useCarrinhoStore";
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

export function CarrinhoDrawer() {
  const { itens, drawerAberto, fecharDrawer } = useCarrinho();

  const [modalEntrega, setModalEntrega] = useState("DELIVERY");
  const [metodoPagamento, setMetodoPagamento] = useState("DINHEIRO");

  const subtotal = itens.reduce(
    (acc, item) => acc + item.produto.precoBase * item.quantidade,
    0,
  );
  const taxaEntrega = modalEntrega === "DELIVERY" ? 5.0 : 0;
  const total = subtotal + taxaEntrega;

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

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
        <div className="bg-gray-100 text-white rounded-lg p-4 mb-6 space-y-3">
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
                  <Select id="bairro" required>
                    <option>Selecione um bairro...</option>
                    <option value="centro">Centro - R$ 5,00</option>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor="rua" value="Rua *" />
                    <TextInput id="rua" required />
                  </div>
                  <div>
                    <Label htmlFor="numero" value="Nº *" />
                    <TextInput id="numero" required />
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
        </form>
      </DrawerItems>

      {/* Footer Fixo */}
      <div className="p-4 border-t bg-white flex gap-3">
        <Button color="light" onClick={fecharDrawer} className="flex-1">
          Continuar Comprando
        </Button>
        <Button color="cyan" className="flex-1 font-bold">
          Confirmar Pedido
        </Button>
      </div>
    </Drawer>
  );
}
