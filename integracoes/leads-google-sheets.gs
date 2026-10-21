/**
 * BRIDGE: recebe os leads do formulário de inscrição e grava na planilha.
 *
 * Como ativar (primeira vez):
 * 1. Na planilha do Google Sheets: Extensões > Apps Script.
 * 2. Apague o conteúdo e cole este arquivo. Salve.
 * 3. Implantar > Nova implantação > Tipo: App da Web.
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa.
 * 4. Autorize e copie a URL do App da Web (termina em /exec).
 * 5. No index.html, cole a URL no atributo data-leads-endpoint do <form id="lead-form">.
 *
 * Como atualizar sem trocar a URL (e sem apagar leads):
 * Cole a nova versão, salve e vá em Implantar > Gerenciar implantações > ✏️ Editar >
 * Versão: "Nova versão" > Implantar.
 *
 * Os leads entram na aba "Leads". Cada valor é gravado pela coluna com o mesmo nome no
 * cabeçalho; colunas novas são criadas no fim, então os dados antigos não se movem.
 */
const ABA = 'Leads';

// [nome da coluna no cabeçalho, campo enviado pelo site]
const COLUNAS = [
  ['Data/hora', null],
  ['Nome', 'nome'],
  ['Empresa', 'empresa'],
  ['Cargo', 'cargo'],
  ['Setor', 'setor'],
  ['E-mail', 'email'],
  ['WhatsApp', 'telefone'],
  ['Perfil', 'perfil'],
  ['Perfil (outro)', 'perfil_outro'],
  ['utm_source', 'utm_source'],
  ['utm_medium', 'utm_medium'],
  ['utm_campaign', 'utm_campaign'],
  ['utm_content', 'utm_content'],
  ['utm_term', 'utm_term'],
  ['Página', 'pagina'],
  ['Como conheceu o Instituto Ponte', 'origem'],
  ['Como conheceu (outro)', 'origem_outro'],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
    const cabecalho = garantirCabecalho(aba);
    const p = (e && e.parameter) || {};

    const linha = new Array(cabecalho.length).fill('');
    COLUNAS.forEach(function (c) {
      const idx = cabecalho.indexOf(c[0]);
      if (idx === -1) return;
      linha[idx] = c[1] === null ? new Date() : limpar(p[c[1]]);
    });
    aba.appendRow(linha);
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Lê o cabeçalho da linha 1 e acrescenta no fim as colunas que ainda não existem
function garantirCabecalho(aba) {
  const nomes = COLUNAS.map(function (c) { return c[0]; });
  if (aba.getLastRow() === 0) {
    aba.appendRow(nomes);
    return nomes;
  }
  const largura = Math.max(aba.getLastColumn(), 1);
  const atual = aba.getRange(1, 1, 1, largura).getValues()[0].map(String);
  const faltando = nomes.filter(function (n) { return atual.indexOf(n) === -1; });
  if (faltando.length) {
    aba.getRange(1, atual.length + 1, 1, faltando.length).setValues([faltando]);
  }
  return atual.concat(faltando);
}

// Evita que um valor vire fórmula na planilha (ex.: começando com "=") e limita o tamanho
function limpar(v) {
  v = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
