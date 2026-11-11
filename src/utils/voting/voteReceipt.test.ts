import { describe, expect, it } from "vitest";
import { buildVoteReceiptPdf, voteReceiptFileName, type VoteReceipt } from "./voteReceipt";

const receipt: VoteReceipt = {
  electionId: "e-123",
  electionName: "Consejo 2026",
  voteId: "91aac83c-1d54-42ae-98f6-ae50d36ed0cc",
  registeredAt: new Date("2026-11-10T18:00:00Z"),
  digest: "ZGlnZXN0bw==",
  signature: "ZmlybWE=",
};

// jsPDF no comprime el contenido por defecto, así que el texto se puede buscar en el PDF.
const pdfText = async (data: VoteReceipt) => (await buildVoteReceiptPdf(data)).output();

describe("voteReceipt", () => {
  it("genera un PDF con el identificador del voto, la elección, el digesto y la firma", async () => {
    const pdf = await pdfText(receipt);
    expect(pdf.startsWith("%PDF-")).toBe(true);
    for (const text of [receipt.voteId, "Consejo 2026", "e-123", receipt.digest, receipt.signature]) {
      expect(pdf).toContain(text);
    }
  });

  it("no incluye campos de identidad ni de selecciones", async () => {
    const pdf = (await pdfText(receipt)).toLowerCase();
    for (const word of ["usuario", "correo", "matr", "candidat"]) {
      expect(pdf).not.toContain(word);
    }
  });

  it("nombra el archivo con el identificador del voto", () => {
    expect(voteReceiptFileName(receipt.voteId)).toBe(
      "comprobante-voto-91aac83c-1d54-42ae-98f6-ae50d36ed0cc.pdf",
    );
  });
});
