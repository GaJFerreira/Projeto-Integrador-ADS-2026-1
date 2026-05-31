import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { OpcoesDialogoConfirmacao } from "../utils/textosInterface";
import "../components/common/dialogoConfirmacao.css";

const DialogoConfirmacaoContext = createContext<
  ((opcoes: OpcoesDialogoConfirmacao) => Promise<boolean>) | null
>(null);

export function ProvedorDialogoConfirmacao({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<(OpcoesDialogoConfirmacao & { aberto: true }) | null>(
    null
  );
  const resolverRef = useRef<((valor: boolean) => void) | null>(null);

  const pedirConfirmacao = useCallback(
    (opcoes: OpcoesDialogoConfirmacao): Promise<boolean> => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setEstado({ ...opcoes, aberto: true });
      });
    },
    []
  );

  const fechar = (confirmou: boolean) => {
    resolverRef.current?.(confirmou);
    resolverRef.current = null;
    setEstado(null);
  };

  return (
    <DialogoConfirmacaoContext.Provider value={pedirConfirmacao}>
      {children}
      {estado?.aberto &&
        createPortal(
          <div
            className="sf-dialogo-confirmacao-overlay"
            role="presentation"
            onClick={() => fechar(false)}
          >
            <div
              className="sf-dialogo-confirmacao"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="sf-dialogo-confirmacao-titulo"
              aria-describedby="sf-dialogo-confirmacao-mensagem"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="sf-dialogo-confirmacao-titulo" className="sf-dialogo-confirmacao__titulo">
                {estado.titulo}
              </h2>
              <p id="sf-dialogo-confirmacao-mensagem" className="sf-dialogo-confirmacao__mensagem">
                {estado.mensagem}
              </p>
              <div className="sf-dialogo-confirmacao__acoes">
                <button
                  type="button"
                  className="sf-dialogo-confirmacao__btn sf-dialogo-confirmacao__btn--cancelar"
                  onClick={() => fechar(false)}
                >
                  {estado.textoCancelar ?? "Cancelar"}
                </button>
                <button
                  type="button"
                  className={`sf-dialogo-confirmacao__btn ${
                    estado.acaoPerigosa
                      ? "sf-dialogo-confirmacao__btn--perigo"
                      : "sf-dialogo-confirmacao__btn--confirmar"
                  }`}
                  onClick={() => fechar(true)}
                >
                  {estado.textoConfirmar ?? "Confirmar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </DialogoConfirmacaoContext.Provider>
  );
}

export function useDialogoConfirmacao() {
  const pedirConfirmacao = useContext(DialogoConfirmacaoContext);
  if (!pedirConfirmacao) {
    throw new Error(
      "useDialogoConfirmacao deve ser usado dentro de ProvedorDialogoConfirmacao"
    );
  }
  return pedirConfirmacao;
}
