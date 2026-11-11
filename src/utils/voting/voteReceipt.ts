import type { jsPDF } from "jspdf";

/**
 * Comprobante de voto que el votante descarga al terminar, en PDF.
 *
 * No incluye la identidad del votante ni sus selecciones: con el identificador del
 * voto puede comprobar en el tablón público que su voto quedó registrado, pero no
 * puede demostrarle a nadie por quién votó, lo que evita la compra o coacción del voto.
 * El comprobante se genera en el navegador; el sistema no lo envía ni lo guarda.
 */
export type VoteReceipt = {
  electionId: string;
  electionName: string;
  voteId: string;
  registeredAt: Date;
  digest: string;
  signature: string;
  /** Dirección del tablón público de la elección, si se quiere imprimir en el comprobante. */
  bulletinUrl?: string;
};

export function voteReceiptFileName(voteId: string): string {
  return `comprobante-voto-${voteId}.pdf`;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "medium" }).format(date);

// Colores del tema claro (theme.ts), en RGB.
const PRIMARY: [number, number, number] = [30, 71, 200];
const PRIMARY_SOFT: [number, number, number] = [234, 239, 252];
const TEXT: [number, number, number] = [17, 24, 39];
const MUTED: [number, number, number] = [75, 85, 103];
const BORDER: [number, number, number] = [214, 219, 228];

const PAGE_WIDTH = 210;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** Construye el PDF del comprobante. jsPDF se carga solo cuando se necesita. */
export async function buildVoteReceiptPdf(receipt: VoteReceipt): Promise<jsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({ title: `Comprobante de voto ${receipt.voteId}`, subject: receipt.electionName });

  // Encabezado
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, PAGE_WIDTH, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Comprobante de voto", MARGIN, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Sistema de votación electrónica", MARGIN, 26);

  let y = 48;
  const label = (text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(text.toUpperCase(), MARGIN, y);
    y += 5.5;
  };
  const value = (text: string, size = 12) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...TEXT);
    const lines: string[] = doc.splitTextToSize(text, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    y += lines.length * size * 0.42 + 6;
  };
  const mono = (text: string) => {
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT);
    // Base64 no tiene espacios; se parte por caracteres para que no se salga del margen.
    const perLine = Math.floor(CONTENT_WIDTH / doc.getTextWidth("M"));
    const lines = text.match(new RegExp(`.{1,${perLine}}`, "g")) ?? [text];
    doc.text(lines, MARGIN, y);
    y += lines.length * 3.8 + 6;
  };

  label("Elección");
  value(receipt.electionName, 14);
  label("Identificador de la elección");
  value(receipt.electionId, 11);
  label("Fecha de registro");
  value(formatDate(receipt.registeredAt), 11);

  // Identificador del voto, destacado
  y += 2;
  doc.setFillColor(...PRIMARY_SOFT);
  doc.setDrawColor(...PRIMARY);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 26, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PRIMARY);
  doc.text("IDENTIFICADOR DE TU VOTO", PAGE_WIDTH / 2, y + 8, { align: "center" });
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...TEXT);
  doc.text(receipt.voteId, PAGE_WIDTH / 2, y + 18, { align: "center" });
  y += 36;

  label("Digesto del voto cifrado (SHA3-384, Base64)");
  mono(receipt.digest);
  label("Firma digital del voto (Base64)");
  mono(receipt.signature);

  // Cómo verificar
  doc.setDrawColor(...BORDER);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;
  label("¿Cómo verifico mi voto?");
  value(
    "Busca el identificador de tu voto en el tablón público de la elección. Si aparece, tu voto quedó registrado en la urna digital y será contabilizado.",
    10.5,
  );
  if (receipt.bulletinUrl) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...PRIMARY);
    doc.textWithLink(receipt.bulletinUrl, MARGIN, y - 3, { url: receipt.bulletinUrl });
    y += 6;
  }

  // Aviso de privacidad
  y += 2;
  doc.setFillColor(246, 247, 249);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 22, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(
    doc.splitTextToSize(
      "Este comprobante no contiene tu identidad ni tus selecciones. Sirve para comprobar que tu voto fue registrado, pero no permite demostrar a nadie el sentido de tu voto.",
      CONTENT_WIDTH - 10,
    ),
    MARGIN + 5,
    y + 8,
  );

  // Pie de página
  doc.setFontSize(8);
  doc.text(`Generado en tu navegador el ${formatDate(new Date())}`, MARGIN, 287);

  return doc;
}

/** Genera y descarga el comprobante en PDF. */
export async function downloadVoteReceipt(receipt: VoteReceipt): Promise<void> {
  const doc = await buildVoteReceiptPdf(receipt);
  doc.save(voteReceiptFileName(receipt.voteId));
}
