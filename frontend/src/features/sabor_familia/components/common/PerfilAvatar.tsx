import { useEffect, useState } from "react";
import { useMidiaUrl } from "../../hooks/UseMidia";
import {
  ContextoMidiaPerfil,
  type ContextoMidiaPerfil as ContextoMidiaPerfilType,
} from "../../dto/enums/ContextoMidiaEnum";
import { AvatarPlaceholderIcon } from "../../icon/placeholder/AvatarPlaceholderIcon";
import "./perfilAvatar.css";

interface Props {
  perfilId?: number;
  possuiMidia?: boolean;
  contexto?: ContextoMidiaPerfilType;
  previewSrc?: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export function PerfilAvatar({
  perfilId,
  possuiMidia = false,
  contexto = ContextoMidiaPerfil.AVATAR,
  previewSrc,
  alt,
  className = "",
  placeholderClassName = "",
}: Props) {
  const [failed, setFailed] = useState(false);
  const { url: midiaUrl, failed: midiaFailed } = useMidiaUrl(
    "perfil",
    perfilId,
    contexto,
    possuiMidia && !previewSrc
  );

  const preview = previewSrc?.trim() ?? "";
  const url = preview || midiaUrl || "";
  const showImage = url.length > 0 && !failed && !midiaFailed;

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!showImage) {
    const placeholderClasses = [
      "perfil-avatar-placeholder",
      placeholderClassName,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={placeholderClasses} role="img" aria-label={alt}>
        <AvatarPlaceholderIcon className="perfil-avatar-placeholder__icon" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export default PerfilAvatar;
