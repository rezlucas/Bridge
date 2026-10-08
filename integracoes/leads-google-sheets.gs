/**
 * BRIDGE: recebe os leads do formulário de inscrição e grava na planilha.
 *
 * Como ativar:
 * 1. Na planilha do Google Sheets: Extensões > Apps Script.
 * 2. Apague o conteúdo e cole este arquivo. Salve.
 * 3. Implantar > Nova implantação > Tipo: App da Web.
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 * 4. Autorize e copie a URL do App da Web (termina em /exec).
 * 5. No index.html, cole a URL no atributo data-leads-endpoint do <form id="lead-form">.
 *
 * Os leads entram na aba "Leads" (criada automaticamente, com cabeçalho).
 */
const ABA = 'Leads';
const COLUNAS = ['Data/hora', 'Nome', 'Empresa', 'Cargo', 'Setor', 'E-mail', 'WhatsApp', 'Perfil', 'Perfil (outro)', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'Página'];
const CAMPOS = ['nome', 'empresa', 'cargo', 'setor', 'email', 'telefone', 'perfil', 'perfil_outro', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'pagina'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
    if (aba.getLastRow() === 0) aba.appendRow(COLUNAS);
    const p = (e && e.parameter) || {};
    const linha = CAMPOS.map(function (c) { return limpar(p[c]); });
    aba.appendRow([new Date()].concat(linha));
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Evita que um valor vire fórmula na planilha (ex.: começando com "=") e limita o tamanho
function limpar(v) {
  v = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
