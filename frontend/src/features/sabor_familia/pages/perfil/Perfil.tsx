import "./perfil.css";
import Sidebar from "../../components/page/homePageComponents/SideBar";
import { useParams } from "react-router-dom";
import { useBuscarPerfil, useAlternarSeguir } from "../../hooks/UsePerfil";
import { useBuscarReceitasPerfil, useRemoverReceita } from "../../hooks/UseReceita";
import { useState } from "react";
import { PerfilHeader } from "../../components/page/perfilComponents/PerfilHeader";
import { ReceitasGrid } from "../../components/page/perfilComponents/ReceitasGrid";
import { PerfilReceitaFocus } from "../../components/page/perfilComponents/PerfilReceitaFocus";

export function Perfil() {
  const [selectedReceitaId, setSelectedReceitaId] = useState<number | null>(null);
  const { perfilId } = useParams<{ perfilId: string }>();
  const id = Number(perfilId);
  const { perfil, loading: loadingPerfil, error: erroPerfil } = useBuscarPerfil(id);
  const { receitas, loading: loadingReceitas } = useBuscarReceitasPerfil(id);
  const { remover } = useRemoverReceita();
  const {
    seguindo,
    totalSeguidores,
    alternar: alternarSeguir,
    loading: loadingSeguir,
  } = useAlternarSeguir(
    id,
    perfil?.seguindoPerfil ?? false,
    perfil?.estatisticas.countSeguidores ?? 0
  );

  const listaReceitas = receitas?.content ?? [];
  const totalPosts    = receitas?.totalElements ?? 0;
  const handleRemover = (receitaId: number) => {
    remover(receitaId);
  };

  const handleAbrirReceita = (receitaId: number) => {
    setSelectedReceitaId(receitaId);
  };

  if (isNaN(id)) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="perfil-main">
          <div className="home-error">Perfil inválido.</div>
        </main>
      </div>
    );
  }

  if (loadingPerfil) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="perfil-main">
          <div className="home-loading">
            <div className="home-loading__spinner" />
            <span>Carregando perfil…</span>
          </div>
        </main>
      </div>
    );
  }

  if (erroPerfil || !perfil) {
    return (
      <div className="home-layout">
        <Sidebar />
        <main className="perfil-main">
          <div className="home-error">{erroPerfil ?? "Perfil não encontrado."}</div>
        </main>
      </div>
    );
  }

  if (selectedReceitaId !== null) {
    return (
      <PerfilReceitaFocus
        receitaId={selectedReceitaId}
        onVoltar={() => setSelectedReceitaId(null)}
      />
    );
  }

  return (
    <div className="home-layout">
      <Sidebar />

      <main className="perfil-main">
        <div className="perfil-container">

          <PerfilHeader
            perfil={perfil}
            totalPosts={totalPosts}
            seguindo={seguindo}
            totalSeguidores={totalSeguidores}
            onAlternarSeguir={alternarSeguir}
            loadingSeguir={loadingSeguir}
          />

          <ReceitasGrid
            receitas={listaReceitas}
            loading={loadingReceitas}
            isProprioPerfil={perfil.proprioPerfil}
            onRemover={handleRemover}
            onAbrirReceita={handleAbrirReceita}
          />

        </div>
      </main>
    </div>
  );
}

export default Perfil;
