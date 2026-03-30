/* ─── State ─── */
let currentLang = 'zh';
let aiConsent = 'optout'; // 'agree' | 'optout'
let auditLog = [
  { time: '2026-03-10 14:22', action_zh: '修改 AI 授權', action_en: 'Changed AI Auth', status: 'optout', ip: '192.168.0.2' },
  { time: '2026-02-10 09:30', action_zh: '初始簽署',   action_en: 'Initial Sign',    status: 'agreed', ip: '140.112.1.5' },
  { time: '2025-09-01 08:15', action_zh: '首次登入',   action_en: 'First Login',      status: 'pending', ip: '140.112.1.5' },
];

/* ─── Page Navigation ─── */
function goPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

/* ─── Language ─── */
function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-zh]').forEach(el => {
    el.textContent = lang === 'zh' ? el.dataset.zh : el.dataset.en;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  // Update sign button state text
  updateSignBtn();
  // Re-render audit table with correct language
  renderAuditTable();
}

/* ─── Sign Page ─── */
function updateSignBtn() {
  const cb = document.getElementById('basic-checkbox');
  const btn = document.getElementById('sign-btn');
  btn.disabled = !cb.checked;
}

function toggleTooltip() {
  document.getElementById('ai-tooltip').classList.toggle('show');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.info-tooltip-wrap')) {
    const tip = document.getElementById('ai-tooltip');
    if (tip) tip.classList.remove('show');
  }
});

function doSign() {
  const radios = document.querySelectorAll('input[name="ai-consent"]');
  radios.forEach(r => { if (r.checked) aiConsent = r.value; });

  // Record audit entry
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  auditLog.unshift({
    time: timeStr,
    action_zh: '協議簽署', action_en: 'Agreement Signed',
    status: aiConsent === 'agree' ? 'agreed' : 'optout',
    ip: '140.112.88.1'
  });

  // Update personal settings state
  updateSettingsDisplay();

  // Go to dashboard with banner
  goPage('page-dashboard');
  const banner = document.getElementById('success-banner');
  const bannerText = document.getElementById('banner-text');
  banner.style.display = 'flex';
  bannerText.textContent = currentLang === 'zh'
    ? '協議簽署完成！歡迎回來，陳小明。'
    : 'Agreement signed! Welcome back.';
}

/* ─── Session Edge Case: show toast on beforeunload if on sign page ─── */
window.addEventListener('beforeunload', (e) => {
  if (document.getElementById('page-sign').classList.contains('active')) {
    showSessionToast();
    e.preventDefault();
    e.returnValue = '';
  }
});

function showSessionToast() {
  const toast = document.getElementById('session-toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 5000);
}

/* ─── Personal Settings ─── */
function updateSettingsDisplay() {
  const toggle = document.getElementById('ai-toggle');
  const badge = document.getElementById('ai-status-badge');
  const timeEl = document.getElementById('ai-modified-time');

  if (aiConsent === 'agree') {
    toggle.classList.add('on');
    badge.textContent = currentLang === 'zh' ? '已同意授權' : 'Authorized';
    badge.className = 'ai-status-badge ai-agreed';
  } else {
    toggle.classList.remove('on');
    badge.textContent = currentLang === 'zh' ? '已選擇 Opt-out' : 'Opted-out';
    badge.className = 'ai-status-badge';
  }

  // Display most recent time
  if (auditLog.length > 0) timeEl.textContent = auditLog[0].time;
  renderAuditTable();
}

function toggleAIConsent() {
  aiConsent = aiConsent === 'agree' ? 'optout' : 'agree';

  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  auditLog.unshift({
    time: timeStr,
    action_zh: '修改 AI 授權', action_en: 'Changed AI Auth',
    status: aiConsent === 'agree' ? 'agreed' : 'optout',
    ip: '140.112.88.1'
  });

  updateSettingsDisplay();
}

function renderAuditTable() {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;
  const statusMap = {
    agreed: { zh: '同意', en: 'Agreed', cls: 'agreed' },
    optout: { zh: 'Opt-out', en: 'Opt-out', cls: 'optout' },
    pending: { zh: '未簽署', en: 'Unsigned', cls: 'pending' },
  };
  tbody.innerHTML = auditLog.map((row, i) => {
    const s = statusMap[row.status] || statusMap.pending;
    return `<tr class="audit-row ${i === 0 ? 'latest' : ''}">
      <td>${row.time}</td>
      <td>${currentLang === 'zh' ? row.action_zh : row.action_en}</td>
      <td><span class="audit-badge ${s.cls}">${currentLang === 'zh' ? s.zh : s.en}</span></td>
      <td>${row.ip}</td>
    </tr>`;
  }).join('');
}

/* ─── Admin Editor ─── */
function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const mgr = document.getElementById('optout-manager');
  mgr.style.display = tab === 'basic' ? 'block' : 'none';
}

function switchEditorLang(lang, btn) {
  document.querySelectorAll('.editor-lang-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

let clauseCount = 3;
function addClause() {
  clauseCount++;
  const list = document.getElementById('clause-list');
  const div = document.createElement('div');
  div.className = 'clause-item';
  div.dataset.id = clauseCount;
  div.innerHTML = `
    <div class="clause-drag">⠿</div>
    <div class="clause-body">
      <div class="clause-title-row">
        <span class="clause-name" contenteditable="true">新條文 ${clauseCount}</span>
        <div class="clause-actions">
          <button class="clause-edit-btn" onclick="editClause(this)">✏️</button>
          <button class="clause-del-btn" onclick="deleteClause(this)">🗑️</button>
          <label class="mini-toggle"><input type="checkbox" checked onchange="toggleClause(this)"><span class="mini-knob"></span></label>
        </div>
      </div>
      <span class="clause-preview" contenteditable="true">請輸入條文摘要說明...</span>
    </div>`;
  list.appendChild(div);
  div.querySelector('.clause-name').focus();
}

function deleteClause(btn) {
  const item = btn.closest('.clause-item');
  if (confirm('確定刪除此條文？')) item.remove();
}

function editClause(btn) {
  const item = btn.closest('.clause-item');
  const name = item.querySelector('.clause-name');
  name.contentEditable = 'true';
  name.focus();
}

function toggleClause(cb) {
  const item = cb.closest('.clause-item');
  item.style.opacity = cb.checked ? '1' : '0.45';
}

/* ─── Publish Modal ─── */
function showPublishConfirm() {
  const modal = document.getElementById('publish-modal');
  const resignCheck = document.getElementById('require-resign');
  const notice = document.getElementById('resign-notice');
  notice.style.display = resignCheck.checked ? 'list-item' : 'none';
  modal.classList.add('show');
}

function closePublishModal(e) {
  if (!e || e.target.id === 'publish-modal' || e.currentTarget === undefined) {
    document.getElementById('publish-modal').classList.remove('show');
  }
}

function confirmPublish() {
  closePublishModal();
  alert('✅ v2.2 協議已成功發布！');
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  updateSettingsDisplay();
  renderAuditTable();

  // Demo: show session toast button on sign page for edge case demo
  const footer = document.querySelector('.sign-footer');
  if (footer) {
    const demoBtn = document.createElement('button');
    demoBtn.textContent = '⚠️ 模擬：關閉瀏覽器 (Edge Case Demo)';
    demoBtn.style.cssText = 'display:block;margin-top:.75rem;width:100%;padding:.6rem;background:none;border:1px dashed #f59e0b;color:#f59e0b;border-radius:8px;cursor:pointer;font-size:.8rem;';
    demoBtn.onclick = showSessionToast;
    footer.appendChild(demoBtn);
  }
});
/* ─── Entry Page ─── */
function updateEntryBtn() {
  const cb = document.getElementById('entry-checkbox');
  document.getElementById('entry-submit').disabled = !cb.checked;
}
function handleEntrySubmit() {
  goPage('page-sign');
}
function handleEntryCancel() {
  document.getElementById('entry-checkbox').checked = false;
  document.getElementById('entry-submit').disabled = true;
}