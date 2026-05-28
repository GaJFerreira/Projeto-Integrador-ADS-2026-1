import { useEffect, useState } from "react";
import { AvatarPlaceholderIcon } from "../../icon/placeholder/AvatarPlaceholderIcon";
import "./perfilAvatar.css";

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export function PerfilAvatar({
  src,
  alt,
  className = "",
  placeholderClassName = "",
}: Props) {
  const [failed, setFailed] = useState(false);
  const url = src?.trim() ?? "";
  const showImage = url.length > 0 && !failed;

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
