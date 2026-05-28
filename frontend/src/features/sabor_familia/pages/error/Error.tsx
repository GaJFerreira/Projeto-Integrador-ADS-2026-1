import { useLocation, useNavigate } from 'react-router-dom';
import { ERROR_MAP, FALLBACK_ERROR } from '../../utils/errorMapUtils';
import type { ErrorPageProps } from '../../dto/error/ErrorPageProps';
import ErrorIcon from '../../utils/ErrorIconUtil';
import './Error.css';

export default function ErrorPage({ message, onRetry }: Omit<ErrorPageProps, 'statusCode'>) {
  const navigate = useNavigate();
  const location = useLocation();

  const statusCode = location.state?.statusCode as number | undefined;
  const info = statusCode ? (ERROR_MAP[statusCode] ?? FALLBACK_ERROR) : FALLBACK_ERROR;
  const isAuthError = statusCode === 401 || statusCode === 403;

  return (
    <div className="error-container">
      <div className="error-card">

        {/* Badge com o código */}
        {statusCode && (
          <div className="error-code-badge">
            <span>Erro {statusCode}</span>
          </div>
        )}

        <div className="error-icon">
          <ErrorIcon type={info.icon} />
        </div>

        {/* Título e descrição */}
        <h1>{info.title}</h1>
        <p>{message ?? info.description}</p>

        <div className="error-divider" />

        {/* Ações */}
        <div className="error-actions">
          {onRetry && (
            <button className="btn-primary" onClick={onRetry}>
              Tentar novamente
            </button>
          )}

          {isAuthError ? (
            <button
              className={onRetry ? 'btn-secondary' : 'btn-primary'}
              onClick={() => navigate('/sabor-familia/login')}
            >
              Ir para o login
            </button>
          ) : (
            <button
              className={onRetry ? 'btn-secondary' : 'btn-primary'}
              onClick={() => navigate(-1)}
            >
              Voltar à página anterior
            </button>
          )}

          <button className="btn-secondary" onClick={() => navigate('/sabor-familia/home')}>
            Ir para o início
          </button>
        </div>

        {/* Suporte */}
        <p className="error-hint">
          Problema persistindo?{' '}
          <a href="mailto:suporte@seudominio.com.br">Entre em contato</a>
        </p>

      </div>
    </div>
  );
}
