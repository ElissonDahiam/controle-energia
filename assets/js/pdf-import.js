// ================== PDF IMPORT — EQUATORIAL (UMD) ==================

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

  // ================== CONTA MÊS ==================
  // Ex: CONTA MÊS DEZ/2025
  let mesAno = "";
  const contaMes = texto.match(/CONTA MÊS\s+([A-Z]{3})\/(\d{4})/);

  if (contaMes) {
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    mesAno = `${meses[contaMes[1]]}/${contaMes[2]}`;
  }

  // ================== VENCIMENTO ==================
  let vencimento = "";
  const venc = texto.match(/VENCIMENTO\s+(\d{2}\/\d{2}\/\d{4})/);

  if (venc) {
    const [d, m, a] = venc[1].split("/");
    vencimento = `${a}-${m}-${d}`;
  }

  // ================== ENERGIA ATIVA ==================
  let consumoAtivo = 0;
  const ativa = texto.match(/ENERGIA ATIVA.*?(\d+)\s*KWH/);
  if (ativa) consumoAtivo = Number(ativa[1]);

  // ================== ENERGIA GERAÇÃO (SOLAR) ==================
  let energiaGeracao = 0;
  const geracao = texto.match(/ENERGIA GERAÇÃO.*?(\d+)\s*KWH/);
  if (geracao) energiaGeracao = Number(geracao[1]);

  // ================== TOTAL A PAGAR ==================
  let valor = null;
  const total = texto.match(/TOTAL A PAGAR\s*R?\$?\s*([\d.,]+)/);
  if (total) {
    valor = Number(total[1].replace(".", "").replace(",", "."));
  }

  return {
    mes_ano: mesAno,
    vencimento,
    consumo_kwh: consumoAtivo,
    energia_geracao_kwh: energiaGeracao,
    valor
  };
}
