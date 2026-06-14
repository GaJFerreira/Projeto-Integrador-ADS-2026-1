export function criarFormDataMultipart<T>(dados: T, arquivo?: File | null): FormData {
  const formData = new FormData();
  formData.append(
    "dados",
    new Blob([JSON.stringify(dados)], { type: "application/json" })
  );
  if (arquivo) {
    formData.append("arquivo", arquivo);
  }
  return formData;
}
