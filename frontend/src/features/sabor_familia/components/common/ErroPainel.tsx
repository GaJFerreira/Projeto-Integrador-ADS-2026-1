import "./erroPainel.css";

interface Props {
  mensagem: string;
  titulo?: string;
  onTentarNovamente?: () => void;
  labelTentar?: string;
}

export function ErroPainel({
  mensagem,
  titulo = "Não foi possível carregar",
  onTentarNovamente,
  labelTentar = "Tentar novamente",
}: Props) {
  return (
    <div className="sf-erro-painel" role="alert">
      <p className="sf-erro-painel__titulo">{titulo}</p>
      <p className="sf-erro-painel__mensagem">{mensagem}</p>
      {onTentarNovamente && (
        <button
          type="button"
          className="sf-erro-painel__btn"
          onClick={onTentarNovamente}
        >
          {labelTentar}
        </button>
      )}
    </div>
  );
}

export default ErroPainel;
