// 🔐 CONFIGURAÇÃO SUPABASE (CHAVES NOVAS)
const SUPABASE_URL = "https://ilaythkvkcasxguzjchs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_T2yTuL22U4ppJSAU5UMd_A_y6szgC08";

// Headers padrão (SUPABASE NOVO)
const headers = {
  "apikey": SUPABASE_PUBLISHABLE_KEY,
  "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  "Content-Type": "application/json"
};

// ================== EMPRESAS ==================
async function salvarEmpresa(nome, cnpj) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/empresas`, {
    method: "POST",
    headers,
    body: JSON.stringify({ nome, cnpj })
  });

  if (!res.ok) {
    const erro = await res.text();
    console.error("Erro Supabase:", erro);
    alert("Erro ao salvar empresa");
  }
}

async function listarEmpresas() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/empresas?select=*`,
    { headers }
  );

  if (!res.ok) {
    console.error("Erro ao listar empresas:", await res.text());
    return [];
  }

  return await res.json();
}

// ================== LOJAS ==================
async function salvarLoja(nome, empresa_id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/lojas`, {
    method: "POST",
    headers,
    body: JSON.stringify({ nome, empresa_id })
  });

  if (!res.ok) {
    console.error("Erro ao salvar loja:", await res.text());
  }
}

async function listarLojas(empresa_id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/lojas?empresa_id=eq.${empresa_id}`,
    { headers }
  );

  return res.ok ? await res.json() : [];
}

// ================== UNIDADES ==================
async function salvarUnidade(loja_id, uc, distribuidora) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/unidades_consumidoras`, {
    method: "POST",
    headers,
    body: JSON.stringify({ loja_id, uc, distribuidora })
  });

  if (!res.ok) {
    console.error("Erro ao salvar unidade:", await res.text());
  }
}

async function listarUnidades(loja_id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/unidades_consumidoras?loja_id=eq.${loja_id}`,
    { headers }
  );

  return res.ok ? await res.json() : [];
}

// ================== FATURAS ==================
async function salvarFatura(dados) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/faturas`, {
    method: "POST",
    headers,
    body: JSON.stringify(dados)
  });

  if (!res.ok) {
    console.error("Erro ao salvar fatura:", await res.text());
    alert("Erro ao salvar fatura");
  }
}

async function listarFaturas(unidade_id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/faturas?unidade_id=eq.${unidade_id}&order=mes_ano.desc`,
    { headers }
  );

  return res.ok ? await res.json() : [];
}
