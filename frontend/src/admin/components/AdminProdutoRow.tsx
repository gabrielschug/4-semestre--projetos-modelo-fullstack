import { useState } from "react";
import { Button, TableCell, TableRow } from "flowbite-react";
import { Sparkles } from "lucide-react";
import type { ProdutoEdicaoType, ProdutoType } from "../../utils/ProdutoType";

type AdminProdutoRowProps = {
  produto: ProdutoType;
  isNew?: boolean;
  onSave: (
    id: string | null,
    dados: ProdutoEdicaoType,
  ) => Promise<ProdutoType>;
  onDelete?: (id: string) => Promise<void>;
  onCancel?: () => void;
  onGerarFrase: (
    dados: Pick<ProdutoEdicaoType, "descricao" | "categoria" | "especificacoes">,
  ) => Promise<string>;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

const inputClassName =
  "w-36 rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500";

export default function AdminProdutoRow({
  produto,
  isNew = false,
  onSave,
  onDelete,
  onCancel,
  onGerarFrase,
}: AdminProdutoRowProps) {
  const [editando, setEditando] = useState(isNew);
  const [salvando, setSalvando] = useState(false);
  const [gerandoFrase, setGerandoFrase] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<ProdutoEdicaoType>(() =>
    criarRascunho(produto),
  );

  function criarRascunho(item: ProdutoType): ProdutoEdicaoType {
    return {
      descricao: item.descricao,
      categoria: item.categoria,
      precoBase: item.precoBase,
      valorDesconto: item.valorDesconto,
      disponibilidade: item.disponibilidade,
      especificacoes: item.especificacoes,
      fraseVenda: item.fraseVenda,
      fotoUrl: item.fotoUrl,
      tempoPreparoMinutos: item.tempoPreparoMinutos,
    };
  }

  function iniciarEdicao() {
    setRascunho(criarRascunho(produto));
    setErro(null);
    setEditando(true);
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      await onSave(isNew ? null : produto.id, rascunho);
      setEditando(false);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function gerarFrase() {
    if (!rascunho.descricao.trim()) {
      setErro("Informe a descrição antes de gerar a frase.");
      return;
    }

    setGerandoFrase(true);
    setErro(null);
    try {
      const fraseVenda = await onGerarFrase({
        descricao: rascunho.descricao,
        categoria: rascunho.categoria,
        especificacoes: rascunho.especificacoes,
      });
      setRascunho((atual) => ({ ...atual, fraseVenda }));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a frase com IA.",
      );
    } finally {
      setGerandoFrase(false);
    }
  }

  async function excluir() {
    if (
      !onDelete ||
      !confirm(`Confirma a exclusão do produto "${produto.descricao}"?`)
    ) {
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      await onDelete(produto.id);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o produto.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (editando) {
    return (
      <TableRow className="h-16 bg-white">
        <TableCell className="w-32 max-w-32 overflow-hidden">
          <span
            className="block truncate whitespace-nowrap text-xs text-gray-500"
            title={isNew ? "Novo produto" : produto.id}
          >
            {isNew ? "Novo" : produto.id}
          </span>
        </TableCell>
        <TableCell className="w-40 max-w-40 overflow-hidden">
          <input
            aria-label="Descrição"
            className={inputClassName}
            value={rascunho.descricao}
            onChange={(event) =>
              setRascunho({ ...rascunho, descricao: event.target.value })
            }
          />
        </TableCell>
        <TableCell className="w-40 max-w-40 overflow-hidden">
          <input
            aria-label="Categoria"
            className={inputClassName}
            value={rascunho.categoria}
            onChange={(event) =>
              setRascunho({ ...rascunho, categoria: event.target.value })
            }
          />
        </TableCell>
        <TableCell className="w-40 max-w-40 overflow-hidden">
          <input
            aria-label="Preço base"
            className={inputClassName}
            type="number"
            min="0"
            step="0.01"
            value={rascunho.precoBase}
            onChange={(event) =>
              setRascunho({
                ...rascunho,
                precoBase:
                  event.target.value === "" ? 0 : Number(event.target.value),
              })
            }
          />
        </TableCell>
        <TableCell className="w-40 max-w-40 overflow-hidden">
          <input
            aria-label="Valor do desconto"
            className={inputClassName}
            type="number"
            min="0"
            step="0.01"
            value={rascunho.valorDesconto ?? ""}
            onChange={(event) =>
              setRascunho({
                ...rascunho,
                valorDesconto:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
          />
        </TableCell>
        <TableCell className="w-40 max-w-40 overflow-hidden">
          <select
            aria-label="Disponibilidade"
            className={inputClassName}
            value={String(rascunho.disponibilidade)}
            onChange={(event) =>
              setRascunho({
                ...rascunho,
                disponibilidade: event.target.value === "true",
              })
            }
          >
            <option value="true">Disponível</option>
            <option value="false">Indisponível</option>
          </select>
        </TableCell>
        <TableCell className="w-40 max-w-40 overflow-hidden">
          <textarea
            aria-label="Especificações"
            className={`${inputClassName} h-10 resize-none`}
            rows={1}
            value={rascunho.especificacoes ?? ""}
            onChange={(event) =>
              setRascunho({
                ...rascunho,
                especificacoes:
                  event.target.value === "" ? null : event.target.value,
              })
            }
          />
        </TableCell>
        <TableCell className="w-56 max-w-56 overflow-hidden">
          <div className="flex flex-col gap-1.5">
            <textarea
              aria-label="Frase de venda"
              className={`${inputClassName} h-16 w-52 resize-none`}
              rows={2}
              maxLength={200}
              placeholder={
                isNew ? "Vazio = gerada pela IA ao salvar" : "Opcional"
              }
              value={rascunho.fraseVenda ?? ""}
              onChange={(event) =>
                setRascunho({
                  ...rascunho,
                  fraseVenda:
                    event.target.value === "" ? null : event.target.value,
                })
              }
            />
            <button
              type="button"
              onClick={gerarFrase}
              disabled={gerandoFrase || salvando}
              className="inline-flex w-52 items-center justify-center gap-1.5 rounded-md border border-orange-300 bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-800 hover:bg-orange-100 disabled:cursor-wait disabled:opacity-60"
            >
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {gerandoFrase
                ? "Gerando..."
                : rascunho.fraseVenda
                  ? "Gerar outra com IA"
                  : "Gerar com IA"}
            </button>
          </div>
        </TableCell>
        <TableCell className="w-40 max-w-40 overflow-hidden">
          <input
            aria-label="URL da foto"
            className={`${inputClassName} truncate`}
            type="url"
            title={rascunho.fotoUrl ?? ""}
            value={rascunho.fotoUrl ?? ""}
            onChange={(event) =>
              setRascunho({
                ...rascunho,
                fotoUrl: event.target.value === "" ? null : event.target.value,
              })
            }
          />
        </TableCell>
        <TableCell>
          <input
            aria-label="Tempo de preparo em minutos"
            className={inputClassName}
            type="number"
            min="0"
            step="1"
            value={rascunho.tempoPreparoMinutos ?? ""}
            onChange={(event) =>
              setRascunho({
                ...rascunho,
                tempoPreparoMinutos:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
          />
        </TableCell>
        <TableCell>
          <div className="flex min-w-32 flex-col gap-2">
            <Button
              size="xs"
              color="success"
              onClick={salvar}
              disabled={salvando || gerandoFrase}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              size="xs"
              color="light"
              onClick={() => {
                if (isNew) {
                  onCancel?.();
                } else {
                  setEditando(false);
                  setErro(null);
                }
              }}
              disabled={salvando}
            >
              Cancelar
            </Button>
            {erro && (
              <p
                role="alert"
                className="max-w-48 truncate whitespace-nowrap text-xs text-red-700"
                title={erro}
              >
                {erro}
              </p>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="h-16 bg-white">
      <TableCell className="w-32 max-w-32 overflow-hidden">
        <span
          className="block truncate whitespace-nowrap text-xs text-gray-500"
          title={produto.id}
        >
          {isNew ? "Novo" : produto.id}
        </span>
      </TableCell>
      <TableCell className="max-w-56 overflow-hidden whitespace-nowrap font-medium text-gray-900">
        <div className="flex items-center gap-3">
          {produto.fotoUrl && (
            <img
              src={produto.fotoUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-md object-cover"
            />
          )}
          <span className="truncate" title={produto.descricao}>
            {produto.descricao}
          </span>
        </div>
      </TableCell>
      <TableCell>{produto.categoria}</TableCell>
      <TableCell>{formatarMoeda(produto.precoBase)}</TableCell>
      <TableCell>{produto.valorDesconto ?? "—"}</TableCell>
      <TableCell>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            produto.disponibilidade
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {produto.disponibilidade ? "Disponível" : "Indisponível"}
        </span>
      </TableCell>
      <TableCell className="w-48 max-w-48 overflow-hidden">
        <span
          className="block truncate whitespace-nowrap"
          title={produto.especificacoes ?? ""}
        >
          {produto.especificacoes ?? "—"}
        </span>
      </TableCell>
      <TableCell className="w-56 max-w-56 overflow-hidden">
        <span
          className="block truncate whitespace-nowrap italic"
          title={produto.fraseVenda ?? ""}
        >
          {produto.fraseVenda ?? "—"}
        </span>
      </TableCell>
      <TableCell className="w-48 max-w-48 overflow-hidden">
        <span
          className="block truncate whitespace-nowrap"
          title={produto.fotoUrl ?? ""}
        >
          {produto.fotoUrl ?? "—"}
        </span>
      </TableCell>
      <TableCell>{produto.tempoPreparoMinutos ?? "—"}</TableCell>
      <TableCell>
        <div className="flex min-w-28 flex-col gap-2">
          <Button size="xs" color="light" onClick={iniciarEdicao}>
            Editar
          </Button>
          {!isNew && (
            <Button
              size="xs"
              color="failure"
              onClick={excluir}
              disabled={salvando}
            >
              Excluir
            </Button>
          )}
          {erro && (
            <p role="alert" className="max-w-48 text-xs text-red-700">
              {erro}
            </p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
