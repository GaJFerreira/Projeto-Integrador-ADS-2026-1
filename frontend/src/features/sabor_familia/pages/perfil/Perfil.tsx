import "./perfil.css";
import { useParams } from "react-router-dom";
import { useBuscarPerfil, useAlternarSeguir } from "../../hooks/UsePerfil";
import { useBuscarReceitasPerfil } from "../../hooks/UseReceita";
import { useState } from "react";
import { PerfilHeader } from "../../components/page/perfilComponents/PerfilHeader";
import { ReceitasGrid } from "../../components/page/perfilComponents/ReceitasGrid";
import { PerfilReceitaFocus } from "../../components/page/perfilComponents/PerfilReceitaFocus";

export function Perfil() {
  const [selectedReceitaId, setSelectedReceitaId] = useState<number | null>(null);
  const { perfilId } = useParams<{ perfilId: string }>();
  const id = Number(perfilId);
  const { perfil, loading: loadingPerfil, error: erroPerfil } = useBuscarPerfil(id);
  const { receitas, loading: loadingReceitas, recarregar: recarregarReceitas } =
    useBuscarReceitasPerfil(id);
  const {
    seguindo,
    totalSeguidores,
    alternar: alternarSeguir,
    loading: loadingSeguir,
  } = useAlternarSeguir(
    id,
    perfil?.seguindoPerfil ?? false,
    perfil?.estatisticas?.countSeguidores ?? 0,
    perfil?.detalhes?.nome
  );

  const listaReceitas = receitas?.content ?? [];
  const totalPosts    = receitas?.totalElements ?? 0;
  const handleAbrirReceita = (receitaId: number) => {
    setSelectedReceitaId(receitaId);
  };

  if (isNaN(id)) {
    return (
      <main className="perfil-main">
        <div className="home-error">Perfil inválido.</div>
      </main>
    );
  }

  if (loadingPerfil) {
    return (
      <main className="perfil-main">
        <div className="home-loading">
          <div className="home-loading__spinner" />
          <span>Carregando perfil…</span>
        </div>
      </main>
    );
  }

  if (erroPerfil || !perfil) {
    return (
      <main className="perfil-main">
        <div className="home-error">{erroPerfil ?? "Perfil não encontrado."}</div>
      </main>
    );
  }

  if (selectedReceitaId !== null) {
    return (
      <PerfilReceitaFocus
        receitaId={selectedReceitaId}
        onVoltar={() => setSelectedReceitaId(null)}
        onReceitaRemovida={recarregarReceitas}
        nomePerfil={perfil.detalhes.nome}
      />
    );
  }

  return (
    <main className="perfil-main">
      <div className="perfil-container">

        <PerfilHeader
            perfil={perfil}
            totalPosts={totalPosts}
            seguindo={seguindo}
            countSeguidores={totalSeguidores}
            countSeguindo={perfil.estatisticas.countSeguindo}
            onAlternarSeguir={alternarSeguir}
            loadingSeguir={loadingSeguir}
          />

          <ReceitasGrid
            receitas={listaReceitas}
            loading={loadingReceitas}
            onAbrirReceita={handleAbrirReceita}
          />

      </div>
    </main>
  );
}

export default Perfil;
