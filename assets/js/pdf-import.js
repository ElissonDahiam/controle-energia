// ================== PDF IMPORT — EQUATORIAL (ESTÁVEL REAL) ==================

async function importarFaturaEquatorial(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let tokens = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    content.items.forEach(i => {
      if (i.str && i.str.trim()) {
        tokens.push(i.str.trim().toUpperCase());
      }
    });
  }

  // ================== MÊS / ANO ==================
  let mes_ano = "";
  const mesToken = tokens.find(t =>
    /(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/\d{4}/.test(t)
  );
  if (mesToken) {
    const m = mesToken.match(/(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\/(\d{4})/);
    const map = {
      JAN:"01",FEV:"02",MAR:"03",ABR:"04",
      MAI:"05",JUN:"06",JUL:"07",AGO:"08",
      SET:"09",OUT:"10",NOV:"11",DEZ:"12"
    };
    mes_ano = `${map[m[1]]}/${m[2]}`;
  }

  // ================== VENCIMENTO ==================
  let vencimento = "";
  const vencIdx = tokens.findIndex(t => t === "VENCIMENTO");
  if (vencIdx !== -1) {
    const d = tokens.slice(vencIdx, vencIdx + 6)
      .find(t => /^\d{2}\/\d{2}\/\d{4}$/.test(t));
    if (d) {
      const [dia, mes, ano] = d.split("/");
      vencimento = `${ano}-${mes}-${dia}`;
    }
  }

  // ================== CONSUMOS ==================
  let consumoAtivo = 0;
  let energiaGeracao = 0;

  for (let i = 0; i < tokens.length; i++) {

    // ENERGIA ATIVA → pegar PRIMEIRO número pequeno depois
    if (tokens[i] === "ENERGIA" && tokens[i + 1] === "ATIVA") {
      for (let j = i; j < i + 20; j++) {
        if (/^\d+$/.test(tokens[j]) && Number(tokens[j]) < 1000) {
          consumoAtivo = Number(tokens[j]);
          break;
        }
      }
    }

    // ENERGIA GERAÇÃO
    if (tokens[i] === "ENERGIA" && tokens[i + 1] === "GERAÇÃO") {
      for (let j = i; j < i + 20; j++) {
        if (/^\d+$/.test(tokens[j]) && Number(tokens[j]) > 1000) {
          energiaGeracao = Number(tokens[j]);
          break;
        }
      }
    }
  }

  const consumoTotal = consumoAtivo + energiaGeracao;

  // ================== VALOR ==================
  let valor = null;
  const valorToken = tokens.find(t => /^\d{1,3}(\.\d{3})*,\d{2}$/.test(t));
  if (valorToken) {
    valor = Number(valorToken.replace(/\./g, "").replace(",", "."));
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
