// ================== PDF IMPORT — EQUATORIAL (FINAL FUNCIONAL) ==================

async function importarFaturaEquatorial(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let texto = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    texto += content.items.map(item => item.str).join(" ") + " ";
  }

  texto = texto.replace(/\s+/g, " ").toUpperCase();

  // ================== MÊS / ANO ==================
  // Ex: DEZ/2025
  let mesAno = "";
  const mesMatch = texto.match(/\b(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})\b/);

  if (mesMatch) {
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    mesAno = `${meses[mesMatch[1]]}/${mesMatch[2]}`;
  }

  // ================== VENCIMENTO ==================
  // Padrão: 15/01/2026 R$*********120,31
  let vencimento = "";
  const vencMatch = texto.match(/(\d{2}\/\d{2}\/\d{4})\s+R\$\*+/);

  if (vencMatch) {
    const [d, m, a] = vencMatch[1].split("/");
    vencimento = `${a}-${m}-${d}`;
  }

  // ================== ENERGIA ATIVA ==================
  // Última coluna da linha ENERGIA ATIVA - KWH
  let consumoAtivo = 0;
  const ativaMatch = texto.match(/ENERGIA ATIVA\s*-\s*KWH.*?(\d+)\b/);

  if (ativaMatch) {
    consumoAtivo = Number(ativaMatch[1]);
  }

  // ================== ENERGIA GERAÇÃO (SOLAR) ==================
  let energiaGeracao = 0;
  const geracaoMatch = texto.match(/ENERGIA GERAÇÃO\s*-\s*KWH.*?(\d+)\b/);

  if (geracaoMatch) {
    energiaGeracao = Number(geracaoMatch[1]);
  }

  // ================== VALOR TOTAL ==================
  let valor = null;
  const valorMatch = texto.match(/R\$\*+([\d.,]+)/);

  if (valorMatch) {
    valor = Number(valorMatch[1].replace(".", "").replace(",", "."));
  }

  return {
    mes_ano: mesAno,
    vencimento,
    consumo_kwh: consumoAtivo,
    energia_geracao_kwh: energiaGeracao,
    valor
  };
}
