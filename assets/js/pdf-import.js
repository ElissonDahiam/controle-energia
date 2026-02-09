// ================== PDF IMPORT — EQUATORIAL (ROBUSTO) ==================

async function importarFaturaEquatorial(file) {
  const buffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let texto = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    texto += content.items.map(i => i.str).join(" ") + "\n";
  }

  texto = texto.replace(/\s+/g, " ").toUpperCase();

  // ================== MÊS / ANO ==================
  // Ex: DEZ/2025
  let mes_ano = "";
  const mesMatch = texto.match(/\b(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}\b/);

  if (mesMatch) {
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    const [mesTxt, ano] = mesMatch[0].split("/");
    mes_ano = `${meses[mesTxt]}/${ano}`;
  }

  // ================== VENCIMENTO ==================
  let vencimento = "";
  const vencMatch = texto.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
  if (vencMatch) {
    const [d, m, a] = vencMatch[0].split("/");
    vencimento = `${a}-${m}-${d}`;
  }

  // ================== ENERGIA ATIVA ==================
  let consumo_kwh = 0;
  const ativaLine = texto.match(/ENERGIA ATIVA[^0-9]*(\d+)\s*KWH/);
  if (ativaLine) {
    consumo_kwh = Number(ativaLine[1]);
  }

  // ================== ENERGIA GERAÇÃO (SOLAR) ==================
  let energia_geracao_kwh = 0;
  const geracaoLine = texto.match(/ENERGIA GERAÇÃO[^0-9]*(\d+)\s*KWH/);
  if (geracaoLine) {
    energia_geracao_kwh = Number(geracaoLine[1]);
  }

  // ================== TOTAL A PAGAR ==================
  let valor = null;
  const totalMatch = texto.match(/TOTAL A PAGAR[^0-9]*([\d.,]+)/);
  if (totalMatch) {
    valor = Number(
      totalMatch[1].replace(/\./g, "").replace(",", ".")
    );
  }

  return {
    mes_ano,
    vencimento,
    consumo_kwh,
    energia_geracao_kwh,
    valor
  };
}
