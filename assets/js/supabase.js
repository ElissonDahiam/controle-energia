// 🔐 CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = "COLE_AQUI_SUA_PROJECT_URL";
const SUPABASE_ANON_KEY = "COLE_AQUI_SUA_ANON_KEY";

// Headers padrão
const headers = {
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
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
    alert("Erro ao salvar empresa");
    console.error(await res.text());
  }
}

async function listarEmpresas() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/empresas?select=*`, {
    headers
  });
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
    alert("Erro ao salvar loja");
    console.error(await res.text());
  }
}

async function listarLojas(empresa_id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/lojas?empresa_id=eq.${empresa_id}`,
    { headers }
  );
  return await res.json();
}

// ================== UNIDADES ==================
async function salvarUnidade(loja_id, uc, distribuidora) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/unidades_consumidoras`, {
    method: "POST",
    headers,
    body: JSON.stringify({ loja_id, uc, distribuidora })
  });

  if (!res.ok) {
    alert("Erro ao salvar unidade");
    console.error(await res.text());
  }
}

async function listarUnidades(loja_id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/unidades_consumidoras?loja_id=eq.${loja_id}`,
    { headers }
  );
  return await res.json();
}
