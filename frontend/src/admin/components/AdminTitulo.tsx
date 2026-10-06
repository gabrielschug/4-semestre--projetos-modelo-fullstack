import { useAdminStore } from "../../context/AdminContext";

export default function AdminTitulo() {
  const { admin } = useAdminStore();

  return (
    <header className="h-16 shrink-0 border-b border-gray-800 bg-gray-900">
      <div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4">
        <h1 className="font-semibold tracking-wide text-white">
          Painel Administrativo
        </h1>
        {admin.nome && (
          <span className="text-sm text-gray-300">{admin.nome}</span>
        )}
      </div>
    </header>
  );
}
