import { useLocation, useNavigate } from "react-router-dom";
import ErrorIcon from "../../utils/ErrorIconUtil";
import { resolverErroPagina } from "../../utils/errorMapUtils";
import type { ErrorPageState } from "../../dto/error/ErrorPageState";
import type { ErrorPageProps } from "../../dto/error/ErrorPageProps";
import "../home/homeSaborFamilia.css";
import "./Error.css";

export default function ErrorPage({
  message: messageProp,
  onRetry,
}: Omit<ErrorPageProps, "statusCode">) {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state ?? null) as ErrorPageState | null;
  const isRotaDesconhecida =
    !location.pathname.endsWith("/error") && !state?.statusCode;

  const erro = resolverErroPagina(state, isRotaDesconhecida);
  const mensagemFinal = messageProp ?? erro.mensagemApi ?? erro.descricao;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    navigate(erro.returnTo, { replace: true });
  };

  const handleVoltar = () => {
    if (erro.isAuthError) {
      navigate("/sabor-familia/login", { replace: true });
      return;
    }
    navigate(erro.returnTo, { replace: true });
  };

  return (
    <main className="sf-error-main">
        <div className="sf-error-card" role="alert">
          <p className="sf-error-eyebrow">Sabor Família</p>

          {erro.statusCode && (
            <div className="sf-error-code-badge">
              <span>Erro {erro.statusCode}</span>
            </div>
          )}

          <div className={`sf-error-icon sf-error-icon--${erro.info.icon}`}>
            <ErrorIcon type={erro.info.icon} />
          </div>

          <h1 className="sf-error-title">{erro.titulo}</h1>
          <p className="sf-error-subtitle">{erro.subtitulo}</p>

          <div className="sf-error-message-box">
            <p className="sf-error-message">{mensagemFinal}</p>
            {erro.mensagemApi && erro.descricao !== mensagemFinal && (
              <p className="sf-error-message-detail">{erro.descricao}</p>
            )}
          </div>

          {erro.info.dicas && erro.info.dicas.length > 0 && (
            <div className="sf-error-tips">
              <p className="sf-error-tips__title">O que você pode fazer</p>
              <ul>
                {erro.info.dicas.map((dica) => (
                  <li key={dica}>{dica}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="sf-error-actions">
            {!erro.isAuthError && (
              <button
                type="button"
                className="sf-error-btn sf-error-btn--primary"
                onClick={handleRetry}
              >
                {onRetry ? "Tentar novamente" : erro.retryLabel}
              </button>
            )}

            <button
              type="button"
              className={`sf-error-btn ${
                erro.isAuthError
                  ? "sf-error-btn--primary"
                  : "sf-error-btn--secondary"
              }`}
              onClick={() =>
                erro.isAuthError
                  ? navigate("/sabor-familia/login", { replace: true })
                  : handleVoltar()
              }
            >
              {erro.isAuthError ? "Ir para o login" : "Voltar à tela anterior"}
            </button>

            <button
              type="button"
              className="sf-error-btn sf-error-btn--ghost"
              onClick={() => navigate("/sabor-familia/home", { replace: true })}
            >
              Ir para o início
            </button>
          </div>

          <p className="sf-error-hint">
            Problema persistindo?{" "}
            <a href="mailto:suporte@seudominio.com.br">Fale com o suporte</a>
          </p>
        </div>
    </main>
  );
}
