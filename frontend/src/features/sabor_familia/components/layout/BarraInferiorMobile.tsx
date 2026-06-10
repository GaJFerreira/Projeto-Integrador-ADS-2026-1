import "./barraInferiorMobile.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import HomeIcon from "../../icon/menu/HomeIcon";
import CompassIcon from "../../icon/menu/CompassIcon";
import ChatIcon from "../../icon/menu/ChatIcon";
import BookmarkIcon from "../../icon/menu/BookmarkIcon";
import PlusIcon from "../../icon/menu/PlusIcon";
import { PerfilAvatar } from "../common/PerfilAvatar";
import { TEXTOS_INTERFACE } from "../../utils/textosInterface";

const ROTAS = {
  inicio: "/sabor-familia/home",
  descobrir: "/sabor-familia/explorar",
  mensagens: "/sabor-familia/mensagens",
  favoritos: "/sabor-familia/favoritos",
  publicar: "/sabor-familia/receita/nova",
} as const;

export function BarraInferiorMobile() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { perfil, perfilId } = useAuth();

  const perfilPath =
    perfilId !== null ? `/sabor-familia/perfil/${perfilId}` : "/sabor-familia/configuracoes";

  const itens = [
    {
      id: "inicio",
      titulo: TEXTOS_INTERFACE.menuInferior.inicio,
      path: ROTAS.inicio,
      ativo: pathname === ROTAS.inicio,
      icone: <HomeIcon />,
    },
    {
      id: "descobrir",
      titulo: TEXTOS_INTERFACE.menuInferior.descobrir,
      path: ROTAS.descobrir,
      ativo: pathname.startsWith(ROTAS.descobrir),
      icone: <CompassIcon />,
    },
    {
      id: "favoritos",
      titulo: TEXTOS_INTERFACE.menuInferior.salvas,
      path: ROTAS.favoritos,
      ativo: pathname === ROTAS.favoritos,
      icone: <BookmarkIcon active={pathname === ROTAS.favoritos} />,
    },
    {
      id: "mensagens",
      titulo: TEXTOS_INTERFACE.menuInferior.mensagens,
      path: ROTAS.mensagens,
      ativo: pathname.startsWith(ROTAS.mensagens),
      icone: <ChatIcon />,
    },
    {
      id: "publicar",
      titulo: TEXTOS_INTERFACE.menuInferior.publicar,
      path: ROTAS.publicar,
      ativo: pathname.startsWith("/sabor-familia/receita/"),
      icone: <PlusIcon />,
      destaque: true,
    },
    {
      id: "perfil",
      titulo: TEXTOS_INTERFACE.menuInferior.perfil,
      path: perfilPath,
      ativo:
        pathname === perfilPath ||
        pathname.startsWith("/sabor-familia/configuracoes"),
      icone: perfilId !== null ? (
        <PerfilAvatar
          perfilId={perfilId}
          possuiMidia={perfil?.detalhes?.possuiMidia}
          alt={perfil?.detalhes?.nome ?? "Perfil"}
          className="sf-barra-inferior__avatar"
          placeholderClassName="sf-barra-inferior__avatar sf-barra-inferior__avatar--placeholder"
        />
      ) : (
        <span className="sf-barra-inferior__avatar sf-barra-inferior__avatar--placeholder" />
      ),
    },
  ];

  return (
    <nav className="sf-barra-inferior" aria-label={TEXTOS_INTERFACE.menuInferior.rotulo}>
      {itens.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`sf-barra-inferior__item ${item.ativo ? "sf-barra-inferior__item--ativo" : ""} ${
            item.destaque ? "sf-barra-inferior__item--destaque" : ""
          }`.trim()}
          onClick={() => navigate(item.path)}
          aria-current={item.ativo ? "page" : undefined}
          title={item.titulo}
        >
          <span className="sf-barra-inferior__icone" aria-hidden>
            {item.icone}
          </span>
          <span className="sf-barra-inferior__titulo">{item.titulo}</span>
        </button>
      ))}
    </nav>
  );
}

export default BarraInferiorMobile;
