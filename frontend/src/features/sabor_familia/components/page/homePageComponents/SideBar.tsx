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
import { TEXTOS_INTERFACE } from "../../../utils/textosInterface";

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { perfil, perfilId  } = useAuth();

  const links = [
    { ...TEXTOS_INTERFACE.menu.inicio,          icon: <HomeIcon />,     path: "/sabor-familia/home" },
    { ...TEXTOS_INTERFACE.menu.descobrir,       icon: <CompassIcon />,  path: "/sabor-familia/explorar" },
    { ...TEXTOS_INTERFACE.menu.mensagens,       icon: <ChatIcon />,     path: "/sabor-familia/mensagens" },
    {
      ...TEXTOS_INTERFACE.menu.favoritos,
      icon: <BookmarkIcon active={pathname === "/sabor-familia/favoritos"} />,
      path: "/sabor-familia/favoritos",
    },
    { ...TEXTOS_INTERFACE.menu.publicarReceita, icon: <PlusIcon />,     path: "/sabor-familia/receita/nova" },
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
        {links.map(({ titulo, explicacao, icon, path }) => (
          <button
            key={path}
            className={`sidebar-link ${pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}
            title={`${titulo} — ${explicacao}`}
          >
            {icon}
            <span className="sidebar-link__text">
              <span className="sidebar-link__label">{titulo}</span>
              <span className="sidebar-link__hint">{explicacao}</span>
            </span>
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
          <span className="sidebar-link__text">
            <span className="sidebar-link__label">{TEXTOS_INTERFACE.menu.meuPerfil.titulo}</span>
            <span className="sidebar-link__hint">{TEXTOS_INTERFACE.menu.meuPerfil.explicacao}</span>
          </span>
        </button>
        <button
          className="sidebar-link"
          onClick={() => navigate("/sabor-familia/configuracoes")}
          title={`${TEXTOS_INTERFACE.menu.configuracoes.titulo} — ${TEXTOS_INTERFACE.menu.configuracoes.explicacao}`}
        >
          <SettingsIcon />
          <span className="sidebar-link__text">
            <span className="sidebar-link__label">{TEXTOS_INTERFACE.menu.configuracoes.titulo}</span>
            <span className="sidebar-link__hint">{TEXTOS_INTERFACE.menu.configuracoes.explicacao}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
