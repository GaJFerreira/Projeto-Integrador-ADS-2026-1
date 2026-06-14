import "./explorarPerfilCard.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/UseAuth";
import { useAlternarSeguirLista } from "../../../hooks/UsePerfil";
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";
import { BotaoSeguir } from "../../common/BotaoSeguir";
import type { PerfilResumoResponse } from "../../../dto/perfil/response/PerfilResumoResponse";

interface Props {
  perfil: PerfilResumoResponse;
}

export function ExplorarPerfilCard({ perfil }: Props) {
  const navigate = useNavigate();
  const { perfilId: meuPerfilId } = useAuth();
  const { seguindo, alternar, loading } = useAlternarSeguirLista(
    perfil.perfilId,
    perfil.seguindoPeloUsuario ?? false,
    perfil.nome
  );

  const exibirSeguir = meuPerfilId !== null && perfil.perfilId !== meuPerfilId;

  return (
    <article className="explorar-perfil-card">
      <button
        type="button"
        className="explorar-perfil-card__main"
        onClick={() => navigate(`/sabor-familia/perfil/${perfil.perfilId}`)}
      >
        <PerfilAvatar
          perfilId={perfil.perfilId}
          possuiMidia={perfil.possuiMidia}
          contexto={ContextoMidiaPerfil.CAPA_PERFIL}
          alt={perfil.nome}
          className="explorar-perfil-card__avatar"
          placeholderClassName="explorar-perfil-card__avatar explorar-perfil-card__avatar--placeholder"
        />
        <p className="explorar-perfil-card__nome">{perfil.nome}</p>
      </button>

      {exibirSeguir && (
        <BotaoSeguir
          seguindo={seguindo}
          loading={loading}
          compacto
          onClick={(e) => {
            e.stopPropagation();
            alternar();
          }}
        />
      )}
    </article>
  );
}

export default ExplorarPerfilCard;
