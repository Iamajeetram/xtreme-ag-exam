(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  const style = document.createElement('style');
  style.textContent = `
    html, body {
      max-width: 100vw !important;
      overflow-x: hidden !important;
    }
    body {
      padding-bottom: calc(74px + env(safe-area-inset-bottom, 0px)) !important;
    }
    .x-bottom-nav {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100vw !important;
      max-width: 100% !important;
      height: calc(62px + env(safe-area-inset-bottom, 0px));
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: #ffffff !important;
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      z-index: 900;
      box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.06);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      transform: translateZ(0);
    }
    .x-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
      text-decoration: none;
      border: 0;
      background: transparent;
      cursor: pointer;
      position: relative;
      min-width: 0;
      padding: 0 2px;
    }
    .x-nav-item svg {
      width: 21px;
      height: 21px;
      stroke: currentColor;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex-shrink: 0;
    }
    .x-nav-item.active {
      color: #2563eb !important;
      font-weight: 800;
    }
    .x-nav-item.active::before {
      content: "";
      position: absolute;
      top: 0;
      width: 30px;
      height: 3px;
      border-radius: 0 0 4px 4px;
      background: #2563eb;
    }
    .x-badge-dot {
      position: absolute;
      top: 6px;
      right: calc(50% - 15px);
      min-width: 15px;
      height: 15px;
      padding: 0 4px;
      border-radius: 999px;
      background: #ef4444;
      color: #fff;
      font-size: 9.5px;
      font-weight: 800;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .x-notif-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 950;
      display: none;
      align-items: flex-end;
      justify-content: center;
    }
    .x-notif-backdrop.open { display: flex; }
    .x-notif-sheet {
      width: min(520px, 100%);
      max-height: 82dvh;
      background: #fff;
      border-radius: 24px 24px 0 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .x-notif-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 12px;
    }
    .x-notif-list {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding-bottom: 10px;
    }
    .x-notif-card {
      padding: 14px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
    }
    .x-notif-card.personal { border-left-color: #10b981; background: #f0fdf4; }
    .x-notif-card h4 { margin: 0 0 4px; font-size: 14.5px; color: #0f172a; }
    .x-notif-card p { margin: 0 0 6px; font-size: 13px; color: #475569; line-height: 1.5; }
    .x-notif-time { font-size: 11px; color: #94a3b8; font-weight: 600; }
    @media (min-width: 900px) {
      .x-notif-backdrop { align-items: center; }
      .x-notif-sheet { border-radius: 22px; }
    }
  `;
  document.head.appendChild(style);

  const path = location.pathname.toLowerCase();
  const isTests = path.includes('test-portal');
  const isNotes = path.includes('notes');
  const isProfile = path.includes('auth') || path.includes('complete-profile') || path.includes('admin');
  const isHome = !isTests && !isNotes && !isProfile;

  const nav = document.createElement('nav');
  nav.className = 'x-bottom-nav';
  nav.id = 'xBottomNav';
  nav.innerHTML = `
    <a class="x-nav-item ${isHome ? 'active' : ''}" href="./index.html">
      <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span>Home</span>
    </a>
    <a class="x-nav-item ${isTests ? 'active' : ''}" href="./test-portal.html">
      <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      <span>Tests</span>
    </a>
    <a class="x-nav-item ${isNotes ? 'active' : ''}" href="./notes.html">
      <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      <span>Notes</span>
    </a>
    <button type="button" class="x-nav-item" id="xAlertsBtn">
      <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span>Alerts</span>
      <span class="x-badge-dot" id="xUnreadBadge">0</span>
    </button>
    <a class="x-nav-item ${isProfile ? 'active' : ''}" href="./auth.html">
      <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Profile</span>
    </a>
  `;
  document.body.appendChild(nav);

  const notifModal = document.createElement('div');
  notifModal.className = 'x-notif-backdrop';
  notifModal.id = 'xNotifModal';
  notifModal.innerHTML = `
    <div class="x-notif-sheet">
      <div class="x-notif-head">
        <h3 style="margin:0;font-size:17px">Notifications & Alerts</h3>
        <button type="button" style="border:0;background:#f1f5f9;padding:6px 12px;border-radius:8px;font-weight:800;cursor:pointer" id="xCloseNotif">✕ Close</button>
      </div>
      <div class="x-notif-list" id="xNotifList">
        <div style="text-align:center;padding:30px;color:#64748b;font-size:13.5px">Loading notifications...</div>
      </div>
    </div>
  `;
  document.body.appendChild(notifModal);

  document.getElementById('xCloseNotif').onclick = () => notifModal.classList.remove('open');
  notifModal.onclick = (e) => { if (e.target === notifModal) notifModal.classList.remove('open'); };

  async function loadNotifications() {
    if (!window.supabase) return;
    const client = window.supabase.createClient(
      "https://vbfjafblxnrfminbdlbb.supabase.co",
      "sb_publishable_B1zX6LJONSD6icwsbHVmYg_z8qpprk9"
    );

    const { data: list } = await client
      .from('exam_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    const items = list || [];
    const lastSeen = Number(localStorage.getItem('xtreme_notif_seen_at') || 0);
    const unread = items.filter(n => new Date(n.created_at).getTime() > lastSeen).length;

    const badge = document.getElementById('xUnreadBadge');
    const topDot = document.getElementById('topBellDot');
    if (unread > 0) {
      badge.textContent = unread > 9 ? '9+' : unread;
      badge.style.display = 'flex';
      if (topDot) topDot.style.display = 'block';
    } else {
      badge.style.display = 'none';
      if (topDot) topDot.style.display = 'none';
    }

    const listEl = document.getElementById('xNotifList');
    if (!items.length) {
      listEl.innerHTML = `<div style="text-align:center;padding:30px;color:#64748b;font-size:13.5px">Abhi koi naya notification nahi hai.</div>`;
    } else {
      listEl.innerHTML = items.map(n => `
        <div class="x-notif-card ${n.user_id ? 'personal' : ''}">
          <h4>${n.user_id ? '📩 ' : '📢 '}${n.title}</h4>
          <p>${n.message}</p>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span class="x-notif-time">${new Date(n.created_at).toLocaleString('en-IN')}</span>
            ${n.link ? `<a href="${n.link}" style="font-size:12px;font-weight:800;color:#2563eb">Open →</a>` : ''}
          </div>
        </div>
      `).join('');
    }
  }

  document.getElementById('xAlertsBtn').addEventListener('click', () => {
    notifModal.classList.add('open');
    localStorage.setItem('xtreme_notif_seen_at', String(Date.now()));
    document.getElementById('xUnreadBadge').style.display = 'none';
    const topDot = document.getElementById('topBellDot');
    if (topDot) topDot.style.display = 'none';
    loadNotifications();
  });

  setTimeout(loadNotifications, 700);
})();