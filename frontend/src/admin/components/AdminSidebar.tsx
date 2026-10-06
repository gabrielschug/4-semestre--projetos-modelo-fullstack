import { useAdminStore } from "../../context/AdminContext";

import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
  SidebarLogo,
} from "flowbite-react";
import {
  BoxIcon,
  KanbanSquare,
  LayoutDashboardIcon,
  LocationEdit,
  LogOutIcon,
} from "lucide-react";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { deslogaAdmin } = useAdminStore();

  function adminSair() {
    if (confirm("Confirma Saída?")) {
      deslogaAdmin();
      navigate("/", { replace: true });
    }
  }

  return (
    <Sidebar aria-label="Navegação administrativa" className="w-64 ">
      <SidebarLogo href="#" img="/favicon.svg" imgAlt="logo">
        Minuta Campeira
      </SidebarLogo>
      <SidebarItems>
        <SidebarItemGroup>
          <Link to="/admin">
            <SidebarItem icon={KanbanSquare}>Kanban</SidebarItem>
          </Link>
          <Link to="/admin/dashboard">
            <SidebarItem icon={LayoutDashboardIcon}>Dashboard</SidebarItem>
          </Link>
        </SidebarItemGroup>
        <SidebarItemGroup>
          <Link to="/admin/produtos">
            <SidebarItem icon={BoxIcon}>Produtos</SidebarItem>
          </Link>
          <Link to="/admin/locais">
            <SidebarItem icon={LocationEdit}>Locais</SidebarItem>
          </Link>
          <SidebarItem></SidebarItem>
          <SidebarItem icon={LogOutIcon} onClick={adminSair}>
            Sair
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
