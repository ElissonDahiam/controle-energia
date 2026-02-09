// ================== PDF IMPORT — EQUATORIAL (FINAL CORRETO) ==================

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
  // Ex: CONTA MÊS DEZ/2025
  let mesAno = "";
  const mesMatch = texto.match(/CONTA MÊS\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})/);

  if (mesMatch) {
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    mesAno = `${meses[mesMatch[1]]}/${mesMatch[2]}`;
  }

  // ================== VENCIMENTO REAL ==================
  // Sempre vem junto do TOTAL A PAGAR
  let vencimento = "";
  const vencMatch = texto.match(/VENCIMENTO\s+(\d{2}\/\d{2}\/\d{4})/);

  if (vencMatch) {
    const [d, m, a] = vencMatch[1].split("/");
    vencimento = `${a}-${m}-${d}`;
  }

  // ================== CONSUMO — COLUNA CORRETA ==================
  // Energia Ativa → coluna "Consumo kWh"
  let consumoAtivo = 0;
  const ativaMatch = texto.match(/ENERGIA ATIVA.*?CONSUMO\s*KWH\s*(\d+)/);

  if (ativaMatch) {
    consumoAtivo = Number(ativaMatch[1]);
  }

  // Energia Geração (solar)
  let energiaGeracao = 0;
  const geracaoMatch = texto.match(/ENERGIA GERAÇÃO.*?CONSUMO\s*KWH\s*(\d+)/);

  if (geracaoMatch) {
    energiaGeracao = Number(geracaoMatch[1]);
  }

  // Consumo Total (ativo + geração)
  const consumoTotal = consumoAtivo + energiaGeracao;

  // ================== VALOR TOTAL ==================
  let valor = null;
  const valorMatch = texto.match(/TOTAL A PAGAR\s*R?\$?\s*([\d.,]+)/);

  if (valorMatch) {
    valor = Number(
      valorMatch[1].replace(".", "").replace(",", ".")
    );
  }

  return {
    mes_ano: mesAno,
    vencimento,
    consumo_kwh: consumoTotal,        // 👉 ESTE VAI PARA O CAMPO
    consumo_ativo_kwh: consumoAtivo,  // técnico / futuro relatório
    energia_geracao_kwh: energiaGeracao,
    valor
  };
}
