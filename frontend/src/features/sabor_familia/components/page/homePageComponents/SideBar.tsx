import "./sideBar.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/UseAuth";
import HomeIcon from "../../../icon/menu/HomeIcon";
import CompassIcon from "../../../icon/menu/CompassIcon";
import ChatIcon from "../../../icon/menu/ChatIcon";
import BookmarkIcon from "../../../icon/menu/BookmarkIcon";
import PlusIcon from "../../../icon/menu/PlusIcon";
import SettingsIcon from "../../../icon/menu/SettingsIcon";
import { PerfilAvatar } from "../../common/PerfilAvatar";

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { perfil, perfilId  } = useAuth();

  const links = [
    { label: "Início",          icon: <HomeIcon />,     path: "/sabor-familia/home" },
    { label: "Explorar",        icon: <CompassIcon />,  path: "/sabor-familia/explorar" }, 
    { label: "Mensagens",       icon: <ChatIcon />,     path: "/sabor-familia/mensagens" },
    { label: "Favoritos",       icon: <BookmarkIcon active={pathname === "/sabor-familia/favoritos"} />, path: "/sabor-familia/favoritos" },
    { label: "Adicionar receita", icon: <PlusIcon />,   path: "/sabor-familia/receita/nova" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate("/sabor-familia/home")}>
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#BA7517" opacity="0.15" />
            <path d="M20 8 C14 8 10 13 10 18 C10 24 15 28 20 32 C25 28 30 24 30 18 C30 13 26 8 20 8Z"
              fill="#BA7517" opacity="0.7" />
            <circle cx="20" cy="18" r="5" fill="#BA7517" />
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">Sabor</span>
          <span className="sidebar-brand-sub">da Família</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ label, icon, path }) => (
          <button
            key={path}
            className={`sidebar-link ${pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-link" onClick={() => perfilId && navigate(`/sabor-familia/perfil/${perfilId}`)}>
          <PerfilAvatar
            perfilId={perfilId ?? undefined}
            possuiMidia={perfil?.detalhes?.possuiMidia}
            alt={perfil?.detalhes?.nome ?? "Perfil"}
            className="sidebar-avatar"
            placeholderClassName="sidebar-avatar sidebar-avatar--placeholder"
          />
          <span>Perfil</span>
        </button>
        <button className="sidebar-link" onClick={() => navigate("/sabor-familia/configuracoes")}>
          <SettingsIcon />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
