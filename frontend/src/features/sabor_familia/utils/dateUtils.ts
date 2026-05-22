export function parseDataBR(value: string): string {
  const [datePart, timePart] = value.split(" ");
  const [day, month, year] = datePart.split("/");
  return new Date(`${year}-${month}-${day}T${timePart}`).toLocaleDateString("pt-BR");
}

export function isoParaBR(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
