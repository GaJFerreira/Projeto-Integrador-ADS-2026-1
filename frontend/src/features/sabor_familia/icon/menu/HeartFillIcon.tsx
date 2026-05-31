interface HeartFillIconProps {
  active: boolean;
  /** Cor quando preenchido; padrão vermelho (curtida). */
  activeColor?: string;
}

const HeartFillIcon = ({ active, activeColor = "#e53935" }: HeartFillIconProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={active ? activeColor : "none"}
    stroke={active ? activeColor : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default HeartFillIcon;
