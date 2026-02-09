// ================== PDF IMPORT — EQUATORIAL ==================

async function importarFaturaEquatorial(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let textoCompleto = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    textoCompleto += strings.join(" ") + "\n";
  }

  // ================== EXTRAÇÕES ==================

  // 📅 Conta mês (ex: DEZ/2025)
  const contaMesMatch = textoCompleto.match(/Conta mês\s+([A-Z]{3}\/\d{4})/i);

  let mesAnoFormatado = "";
  if (contaMesMatch) {
    const [mesTxt, ano] = contaMesMatch[1].split("/");
    const meses = {
      JAN: "01", FEV: "02", MAR: "03", ABR: "04",
      MAI: "05", JUN: "06", JUL: "07", AGO: "08",
      SET: "09", OUT: "10", NOV: "11", DEZ: "12"
    };
    mesAnoFormatado = `${meses[mesTxt.toUpperCase()]}/${ano}`;
  }

  // 📆 Vencimento
  const vencimentoMatch = textoCompleto.match(/Vencimento\s+(\d{2}\/\d{2}\/\d{4})/i);
  let vencimentoISO = "";
  if (vencimentoMatch) {
    const [d, m, a] = vencimentoMatch[1].split("/");
    vencimentoISO = `${a}-${m}-${d}`;
  }

  // ⚡ Energia Ativa
  const ativaMatch = textoCompleto.match(/ENERGIA ATIVA.*?(\d+)\s*kWh/i);
  const energiaAtiva = ativaMatch ? Number(ativaMatch[1]) : 0;

  // ☀️ Energia Geração (solar)
  const geracaoMatch = textoCompleto.match(/ENERGIA GERAÇÃO.*?(\d+)\s*kWh/i);
  const energiaGeracao = geracaoMatch ? Number(geracaoMatch[1]) : 0;

  // 💰 Total a pagar
  const totalMatch = textoCompleto.match(/Total a pagar.*?R\$[\s]*([\d.,]+)/i);
  let valorTotal = "";
  if (totalMatch) {
    valorTotal = Number(
      totalMatch[1].replace(".", "").replace(",", ".")
    );
  }

  return {
    mes_ano: mesAnoFormatado,
    vencimento: vencimentoISO,
    consumo_kwh: energiaAtiva,
    energia_geracao_kwh: energiaGeracao,
    valor: valorTotal
  };
}
