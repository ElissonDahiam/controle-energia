// ================== PDF IMPORT — EQUATORIAL (FINAL ESTÁVEL) ==================

async function importarFaturaEquatorial(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let linhas = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    content.items.forEach(item => {
      const t = item.str?.trim();
      if (t) linhas.push(t.toUpperCase());
    });
  }

  // ================== MÊS / ANO ==================
  let mes_ano = "";
  const mesLinha = linhas.find(l =>
    /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}/.test(l)
  );

  if (mesLinha) {
    const m = mesLinha.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})/);
    const meses = {
      JAN:"01",FEV:"02",MAR:"03",ABR:"04",
      MAI:"05",JUN:"06",JUL:"07",AGO:"08",
      SET:"09",OUT:"10",NOV:"11",DEZ:"12"
    };
    mes_ano = `${meses[m[1]]}/${m[2]}`;
  }

  // ================== VENCIMENTO ==================
  let vencimento = "";
  const vencLinha = linhas.find(l => l.includes("VENCIMENTO"));
  if (vencLinha) {
    const d = vencLinha.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (d) {
      const [dia, mes, ano] = d[1].split("/");
      vencimento = `${ano}-${mes}-${dia}`;
    }
  }

  // ================== CONSUMOS ==================
  let consumoAtivo = 0;
  let energiaGeracao = 0;

  for (let i = 0; i < linhas.length; i++) {

    // ENERGIA ATIVA → pegar o CONSUMO, não leitura
    if (linhas[i].includes("ENERGIA ATIVA") && linhas[i].includes("CONSUMO KWH")) {
      const m = linhas[i].match(/CONSUMO KWH\s*(\d+)/);
      if (m) consumoAtivo = Number(m[1]);
    }

    // ENERGIA GERAÇÃO (SOLAR)
    if (linhas[i].includes("ENERGIA GERAÇÃO") && linhas[i].includes("CONSUMO KWH")) {
      const m = linhas[i].match(/CONSUMO KWH\s*(\d+)/);
      if (m) energiaGeracao = Number(m[1]);
    }
  }

  const consumoTotal = consumoAtivo + energiaGeracao;

  // ================== VALOR TOTAL ==================
  let valor = null;
  const totalLinha = linhas.find(l => l.includes("TOTAL A PAGAR"));
  if (totalLinha) {
    const v = totalLinha.match(/([\d.,]+)/);
    if (v) valor = Number(v[1].replace(/\./g,"").replace(",","."));
  }

  return {
    mes_ano,
    vencimento,
    consumo_ativo_kwh: consumoAtivo,
    energia_geracao_kwh: energiaGeracao,
    consumo_total_kwh: consumoTotal,
    valor
  };
}
