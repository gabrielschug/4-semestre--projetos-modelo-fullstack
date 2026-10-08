type FiltroCategoriasProps = {
  categorias: string[];
  categoriaSelecionada: string | null;
  aoSelecionar: (categoria: string | null) => void;
};

export function FiltroCategorias({
  categorias,
  categoriaSelecionada,
  aoSelecionar,
}: FiltroCategoriasProps) {
  if (categorias.length === 0) {
    return null;
  }

  const opcoes: { rotulo: string; valor: string | null }[] = [
    { rotulo: "Todas", valor: null },
    ...categorias.map((categoria) => ({ rotulo: categoria, valor: categoria })),
  ];

  return (
    <nav
      aria-label="Filtrar produtos por categoria"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {opcoes.map(({ rotulo, valor }) => {
          const ativo = categoriaSelecionada === valor;
          return (
            <button
              key={rotulo}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoSelecionar(valor)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-primaria/30 ${
                ativo
                  ? "border-primaria bg-primaria text-white"
                  : "border-secundaria/20 bg-white text-secundaria hover:border-primaria hover:text-primaria"
              }`}
            >
              {rotulo}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
