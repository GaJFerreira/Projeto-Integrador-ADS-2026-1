import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PlanoDiaItem {
  _diaPt?: string;
  dia?: string;
  atividades: string[];
}

export interface PlanoParaPdf {
  nome: string;
  idade: number | null;
  sexo: string;
  nivel: string;
  duracaoSemanas: number;
  diasPorSemana: number;
  minutosPorDia: number;
  itens: PlanoDiaItem[];
}

const COR_PRIMARIA: [number, number, number] = [33, 150, 243];
const COR_NIVEL: Record<string, [number, number, number]> = {
  alto:  [76,  175,  80],
  medio: [255, 152,   0],
  baixo: [244,  67,  54],
};
const COR_CINZA_CLARO: [number, number, number] = [245, 245, 245];
const COR_TEXTO: [number, number, number] = [33, 33, 33];

function corNivel(nivel: string): [number, number, number] {
  const k = (nivel ?? "").toLowerCase();
  if (k.includes("alto"))  return COR_NIVEL.alto;
  if (k.includes("medio") || k.includes("médio")) return COR_NIVEL.medio;
  if (k.includes("baixo")) return COR_NIVEL.baixo;
  return COR_PRIMARIA;
}

export function gerarPdfPlano(plano: PlanoParaPdf): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW = doc.internal.pageSize.getWidth();
  const PH = doc.internal.pageSize.getHeight();
  const MARGIN = 15;
  const CONTENT_W = PW - MARGIN * 2;
  let y = 0;

  /* CABEÇALHO */
  doc.setFillColor(...COR_PRIMARIA);
  doc.rect(0, 0, PW, 38, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("ELDERCARE", MARGIN, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Plano de Exercícios Personalizado", MARGIN, 25);
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFontSize(9);
  doc.text(`Gerado em ${dataHoje}`, PW - MARGIN, 25, { align: "right" });
  y = 48;

  /* DADOS DO IDOSO */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COR_TEXTO);
  doc.text("Dados do Idoso", MARGIN, y);
  y += 2;
  doc.setDrawColor(...COR_PRIMARIA);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 6;
  const colW = CONTENT_W / 3;
  const campos = [
    { label: "Nome", valor: plano.nome || "—" },
    { label: "Idade", valor: plano.idade !== null ? `${plano.idade} anos` : "—" },
    { label: "Sexo", valor: plano.sexo || "—" },
  ];
  doc.setFontSize(9);
  campos.forEach((c, i) => {
    const x = MARGIN + i * colW;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(c.label, x, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COR_TEXTO);
    doc.text(c.valor, x, y + 5);
  });
  y += 16;

  /* RESUMO DO PLANO */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COR_TEXTO);
  doc.text("Resumo do Plano", MARGIN, y);
  y += 2;
  doc.setDrawColor(...COR_PRIMARIA);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 7;
  const cor = corNivel(plano.nivel);
  doc.setFillColor(...cor);
  doc.roundedRect(MARGIN, y - 4, 34, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`Nível: ${plano.nivel.toUpperCase()}`, MARGIN + 17, y + 0.5, { align: "center" });
  y += 11;
  const resumo = [
    { label: "Duração",       valor: `${plano.duracaoSemanas} semanas` },
    { label: "Dias / semana", valor: String(plano.diasPorSemana) },
    { label: "Minutos / dia", valor: `${plano.minutosPorDia} min` },
    { label: "Tempo semanal", valor: `${plano.diasPorSemana * plano.minutosPorDia} min` },
  ];
  const boxW = (CONTENT_W - 9) / 4;
  resumo.forEach((r, i) => {
    const x = MARGIN + i * (boxW + 3);
    doc.setFillColor(...COR_CINZA_CLARO);
    doc.roundedRect(x, y, boxW, 14, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(r.label, x + boxW / 2, y + 5, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text(r.valor, x + boxW / 2, y + 11, { align: "center" });
  });
  y += 22;

  /* CRONOGRAMA */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COR_TEXTO);
  doc.text("Cronograma Semanal", MARGIN, y);
  y += 2;
  doc.setDrawColor(...COR_PRIMARIA);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 4;
  const tableBody = plano.itens.map((d) => [
    d._diaPt ?? d.dia ?? "Dia",
    (d.atividades ?? []).join("\n") || "—",
  ]);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Dia da Semana", "Atividades"]],
    body: tableBody,
    headStyles: { fillColor: COR_PRIMARIA, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: COR_TEXTO, cellPadding: 4 },
    alternateRowStyles: { fillColor: COR_CINZA_CLARO },
    columnStyles: { 0: { cellWidth: 45, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
    didDrawPage: () => { _desenharRodape(doc, PW, PH, MARGIN); },
  });
  const finalY: number = (doc as any).lastAutoTable?.finalY ?? y + 40;
  y = finalY + 10;

  /* OBSERVAÇÕES */
  if (y + 45 > PH - 20) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COR_TEXTO);
  doc.text("Observações Gerais", MARGIN, y);
  y += 2;
  doc.setDrawColor(...COR_PRIMARIA);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 6;
  const obs = [
    "Inicie cada sessão com 5–10 minutos de aquecimento leve e finalize com alongamento.",
    "Mantenha hidratação adequada e faça pausas sempre que necessário.",
    "Se sentir dor, tontura ou falta de ar anormal, interrompa e procure orientação médica.",
    "Este plano é gerado automaticamente; consulte um profissional de saúde antes de iniciar.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COR_TEXTO);
  obs.forEach((o) => { doc.text(`• ${o}`, MARGIN + 2, y, { maxWidth: CONTENT_W - 4 }); y += 7; });

  _desenharRodape(doc, PW, PH, MARGIN);

  const nomeArq = `plano-exercicios-${(plano.nome || "idoso")
    .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}.pdf`;
  doc.save(nomeArq);
}

function _desenharRodape(doc: jsPDF, pw: number, ph: number, margin: number) {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, ph - 12, pw - margin, ph - 12);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    "Eldercare — Plataforma de Atividades Físicas para Idosos | PUC Goiás — Projeto Integrador ADS",
    pw / 2, ph - 7, { align: "center" }
  );
}
