import { useState } from "react";
import { Button, TableCell, TableRow } from "flowbite-react";
import type { BairroType } from "../../utils/BairroType";

export type BairroFormData = Omit<BairroType, "id">;

type AdminLocaisRowProps = {
  bairro: BairroType;
  isNew?: boolean;
  onSave: (id: string | null, dados: BairroFormData) => Promise<BairroType>;
  onDelete?: (id: string) => Promise<void>;
  onCancel?: () => void;
};

const inputClassName =
  "w-full min-w-40 rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500";

export default function AdminLocaisRow({
  bairro,
  isNew = false,
  onSave,
  onDelete,
  onCancel,
}: AdminLocaisRowProps) {
  const [editando, setEditando] = useState(isNew);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [nome, setNome] = useState(bairro.bairro);
  const [valor, setValor] = useState(String(bairro.valor));
  const [tempo, setTempo] = useState(String(bairro.tempoEntregaMinutos));

  function iniciarEdicao() {
    setNome(bairro.bairro);
    setValor(String(bairro.valor));
    setTempo(String(bairro.tempoEntregaMinutos));
    setErro(null);
    setEditando(true);
  }

  async function salvar() {
    const valorNumerico = Number(valor);
    const tempoNumerico = Number(tempo);
    if (!nome.trim() || !Number.isFinite(valorNumerico) || valorNumerico < 0) {
      setErro("Informe o bairro e um valor de entrega válido.");
      return;
    }
    if (!Number.isInteger(tempoNumerico) || tempoNumerico < 0) {
      setErro("O tempo de entrega deve ser um número inteiro não negativo.");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      await onSave(isNew ? null : bairro.id, {
        bairro: nome.trim(),
        valor: valorNumerico,
        tempoEntregaMinutos: tempoNumerico,
      });
      setEditando(false);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Não foi possível salvar o local.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!onDelete || !confirm(`Excluir o local "${bairro.bairro}"?`)) {
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await onDelete(bairro.id);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Não foi possível excluir o local.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <TableRow className="h-16 bg-white">
      <TableCell className="min-w-56">
        {editando ? (
          <input
            aria-label="Nome do bairro"
            className={inputClassName}
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            autoFocus={isNew}
          />
        ) : (
          <span className="font-medium text-gray-900">{bairro.bairro}</span>
        )}
      </TableCell>
      <TableCell className="min-w-40">
        {editando ? (
          <input
            aria-label="Valor da entrega"
            className={inputClassName}
            type="number"
            min="0"
            step="0.01"
            value={valor}
            onChange={(event) => setValor(event.target.value)}
          />
        ) : (
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(bairro.valor)
        )}
      </TableCell>
      <TableCell className="min-w-48">
        {editando ? (
          <input
            aria-label="Tempo de entrega em minutos"
            className={inputClassName}
            type="number"
            min="0"
            step="1"
            value={tempo}
            onChange={(event) => setTempo(event.target.value)}
          />
        ) : (
          `${bairro.tempoEntregaMinutos} min`
        )}
      </TableCell>
      <TableCell className="min-w-56">
        <div className="flex flex-wrap items-center gap-2">
          {editando ? (
            <>
              <Button size="xs" color="success" onClick={salvar} disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                size="xs"
                color="light"
                disabled={salvando}
                onClick={() => {
                  if (isNew) {
                    onCancel?.();
                  } else {
                    setEditando(false);
                    setErro(null);
                  }
                }}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button size="xs" color="light" onClick={iniciarEdicao}>
                Editar
              </Button>
              <Button size="xs" color="failure" onClick={excluir} disabled={salvando}>
                Excluir
              </Button>
            </>
          )}
        </div>
        {erro && (
          <p role="alert" className="mt-1 max-w-64 text-xs text-red-700">
            {erro}
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}
