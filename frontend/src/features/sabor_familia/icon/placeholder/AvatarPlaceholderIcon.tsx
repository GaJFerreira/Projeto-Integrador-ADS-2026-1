interface Props {
  className?: string;
}

/** Silhueta de usuário (estilo avatar padrão) alinhada à paleta do módulo. */
export function AvatarPlaceholderIcon({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="18" r="8" fill="currentColor" />
      <path
        fill="currentColor"
        d="M10 40c0-7.732 6.268-14 14-14s14 6.268 14 14v2H10v-2z"
      />
    </svg>
  );
}

export default AvatarPlaceholderIcon;
