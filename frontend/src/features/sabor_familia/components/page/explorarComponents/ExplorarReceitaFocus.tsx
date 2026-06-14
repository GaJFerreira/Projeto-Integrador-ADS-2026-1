import { ReceitaFocusView } from "../../common/ReceitaFocusView";

interface Props {
  receitaId: number;
  onVoltar: () => void;
  voltarDestino?: "explorar" | "favoritos";
}

export function ExplorarReceitaFocus({
  receitaId,
  onVoltar,
  voltarDestino = "explorar",
}: Props) {
  return (
    <ReceitaFocusView
      receitaId={receitaId}
      onVoltar={onVoltar}
      voltarDestino={voltarDestino}
      mainClassName="explorar-focus-main"
    />
  );
}

export default ExplorarReceitaFocus;
