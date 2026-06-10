import { ReceitaFocusView } from "../../common/ReceitaFocusView";

interface Props {
  receitaId: number;
  onVoltar: () => void;
  onReceitaRemovida?: () => void;
  nomePerfil?: string;
}

export function PerfilReceitaFocus({
  receitaId,
  onVoltar,
  onReceitaRemovida,
  nomePerfil,
}: Props) {
  return (
    <ReceitaFocusView
      receitaId={receitaId}
      onVoltar={onVoltar}
      onReceitaRemovida={onReceitaRemovida}
      voltarDestino="perfil"
      voltarDetalhe={nomePerfil}
      mainClassName="perfil-focus-main"
    />
  );
}

export default PerfilReceitaFocus;
