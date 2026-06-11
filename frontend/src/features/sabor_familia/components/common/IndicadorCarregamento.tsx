import "../../pages/home/homeSaborFamilia.css";
import "../../pages/explorar/explorar.css";

interface Props {
  texto: string;
  estilo?: "pagina" | "grade";
  className?: string;
}

export function IndicadorCarregamento({
  texto,
  estilo = "pagina",
  className = "",
}: Props) {
  const classeContainer = estilo === "grade" ? "explorar-loading" : "home-loading";
  const classeSpinner =
    estilo === "grade" ? "explorar-spinner" : "home-loading__spinner";

  return (
    <div
      className={`${classeContainer} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className={classeSpinner} aria-hidden />
      <span>{texto}</span>
    </div>
  );
}

export default IndicadorCarregamento;
