// ================== PDF IMPORT — EQUATORIAL (DEFINITIVO) ==================

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
  // Ex: DEZ/2025 (campo "Conta mês")
  let mes_ano = "";
  const mesMatch = texto.match(/CONTA MÊS\s*(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})/);

  if (mesMatch) {
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    mes_ano = `${meses[mesMatch[1]]}/${mesMatch[2]}`;
  }

  // ================== VENCIMENTO (CORRETO) ==================
  // Busca EXPLICITAMENTE o rótulo VENCIMENTO
  let vencimento = "";
  const vencMatch = texto.match(/VENCIMENTO\s*(\d{2}\/\d{2}\/\d{4})/);

  if (vencMatch) {
    const [d, m, a] = vencMatch[1].split("/");
    vencimento = `${a}-${m}-${d}`;
  }

  // ================== CONSUMO — ENERGIA ATIVA ==================
  let consumo_kwh = 0;
  const ativaMatch = texto.match(/ENERGIA ATIVA[^0-9]*(\d+)\s*KWH/);
  if (ativaMatch) {
    consumo_kwh = Number(ativaMatch[1]);
  }

  // ================== ENERGIA GERAÇÃO (SOLAR) ==================
  let energia_geracao_kwh = 0;
  const geracaoMatch = texto.match(/ENERGIA GERAÇÃO[^0-9]*(\d+)\s*KWH/);
  if (geracaoMatch) {
    energia_geracao_kwh = Number(geracaoMatch[1]);
  }

  // ================== TOTAL A PAGAR ==================
  let valor = null;
  const totalMatch = texto.match(/TOTAL A PAGAR[^0-9]*([\d.,]+)/);
  if (totalMatch) {
    valor = Number(
      totalMatch[1]
        .replace(/\*/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
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
