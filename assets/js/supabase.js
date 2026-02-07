// 🔐 CONFIGURAÇÃO SUPABASE
const SUPABASE_URL = "https://ilaythkvkcasxguzjchs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYXl0aGt2a2Nhc3hndXpqY2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjI3NzUsImV4cCI6MjA4NjAzODc3NX0.i-G9qqdOY0DLYv6I4CzEDqhGpv5UjI6JB9WBmLiQyYg";

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
