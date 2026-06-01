import { useEffect, useId, useState } from "react";
import { TEXTOS_INTERFACE } from "../../utils/textosInterface";
import "./imagemUploadField.css";

const MAX_BYTES = 1.5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png"];

interface Props {
  label: string;
  hint?: string;
  arquivo: File | null;
  onArquivoChange: (file: File | null) => void;
  previewUrl?: string | null;
  disabled?: boolean;
}

export function ImagemUploadField({
  label,
  hint = TEXTOS_INTERFACE.formulario.fotoHint,
  arquivo,
  onArquivoChange,
  previewUrl,
  disabled = false,
}: Props) {
  const inputId = useId();
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);

  useEffect(() => {
    if (!arquivo) {
      setPreviewLocal(null);
      return;
    }
    const url = URL.createObjectURL(arquivo);
    setPreviewLocal(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  const preview = previewLocal ?? previewUrl ?? null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErroLocal(null);
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onArquivoChange(null);
      return;
    }

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setErroLocal(TEXTOS_INTERFACE.formulario.fotoErroTipo);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_BYTES) {
      setErroLocal(TEXTOS_INTERFACE.formulario.fotoErroTamanho);
      e.target.value = "";
      return;
    }

    onArquivoChange(file);
  };

  const handleRemover = () => {
    setErroLocal(null);
    onArquivoChange(null);
  };

  return (
    <div className="imagem-upload-field">
      <label className="imagem-upload-field__label" htmlFor={inputId}>
        {label}
      </label>
      {hint && <p className="imagem-upload-field__hint">{hint}</p>}

      {preview && (
        <div className="imagem-upload-field__preview-wrap">
          <img src={preview} alt="Pré-visualização" className="imagem-upload-field__preview" />
        </div>
      )}

      <div className="imagem-upload-field__actions">
        <label htmlFor={inputId} className="imagem-upload-field__btn">
          {arquivo ? TEXTOS_INTERFACE.formulario.trocarImagem : TEXTOS_INTERFACE.formulario.escolherImagem}
        </label>
        {arquivo && (
          <button
            type="button"
            className="imagem-upload-field__btn imagem-upload-field__btn--ghost"
            onClick={handleRemover}
            disabled={disabled}
          >
            {TEXTOS_INTERFACE.formulario.removerImagem}
          </button>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png"
        className="imagem-upload-field__input"
        onChange={handleChange}
        disabled={disabled}
      />

      {erroLocal && <p className="imagem-upload-field__error">{erroLocal}</p>}
    </div>
  );
}

export default ImagemUploadField;
