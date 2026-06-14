import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ReceitaFocusView } from "../../components/common/ReceitaFocusView";
import {
  resolverVoltarState,
  type ReceitaVoltarState,
} from "../../utils/receitaNavegacao";

export function ReceitaDetalhe() {
  const navigate = useNavigate();
  const location = useLocation();
  const { receitaId: receitaIdParam } = useParams<{ receitaId: string }>();
  const receitaId = Number(receitaIdParam);

  const voltarState = resolverVoltarState(
    location.pathname,
    location.state as ReceitaVoltarState | null
  );

  const handleVoltar = () => {
    navigate(voltarState.voltarPara);
  };

  if (isNaN(receitaId)) {
    return (
      <main className="home-main">
        <div className="home-error">Receita inválida.</div>
      </main>
    );
  }

  return (
    <ReceitaFocusView
      receitaId={receitaId}
      onVoltar={handleVoltar}
      voltarDestino={voltarState.voltarDestino}
      voltarDetalhe={voltarState.voltarDetalhe}
      mainClassName="home-main"
    />
  );
}

export default ReceitaDetalhe;
