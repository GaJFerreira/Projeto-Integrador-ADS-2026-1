import type { PerfilResumoResponse } from "../../../dto/perfil/response/PerfilResumoResponse";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/UseAuth";
import { useAlternarSeguirLista } from "../../../hooks/UsePerfil";
import { ContextoMidiaPerfil } from "../../../dto/enums/ContextoMidiaEnum";
import { PerfilAvatar } from "../../common/PerfilAvatar";
import { BotaoSeguir } from "../../common/BotaoSeguir";

export function PerfilItem({ perfil }: { perfil: PerfilResumoResponse }) {
  const navigate = useNavigate();
  const { perfilId: meuPerfilId } = useAuth();
  const { seguindo, alternar, loading } = useAlternarSeguirLista(
    perfil.perfilId,
    perfil.seguindoPeloUsuario ?? false,
    perfil.nome
  );

  const exibirSeguir =
    meuPerfilId !== null && perfil.perfilId !== meuPerfilId;

  return (
    <div className="lista-perfis-item">
      <button
        type="button"
        className="lista-perfis-item__main"
        onClick={() => navigate(`/sabor-familia/perfil/${perfil.perfilId}`)}
      >
        <PerfilAvatar
          perfilId={perfil.perfilId}
          possuiMidia={perfil.possuiMidia}
          contexto={ContextoMidiaPerfil.CAPA_PERFIL}
          alt={perfil.nome}
          className="lista-perfis-avatar"
          placeholderClassName="lista-perfis-avatar lista-perfis-avatar--placeholder"
        />
        <span className="lista-perfis-nome">{perfil.nome}</span>
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
    </div>
  );
}
