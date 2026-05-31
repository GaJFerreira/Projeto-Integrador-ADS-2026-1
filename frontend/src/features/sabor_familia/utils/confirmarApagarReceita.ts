export function confirmarApagarReceita(titulo?: string): boolean {
  const nome = titulo?.trim();
  const detalhe = nome ? ` "${nome}"` : "";
  return window.confirm(
    `Apagar esta receita${detalhe}? Essa ação não pode ser desfeita.`
  );
}
