(function () {
  // 1. Register Service Worker for PWA Installation
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  // 2. Inject App Shell CSS (Bottom Bar, Notification Drawer, Install Banner)
  const style = document.createElement('style');
  style.textContent = `
    body { padding-bottom: 76px !important; }
    .x-bottom-nav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: 64px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      z-index: 400;
      box-shadow: 0 -6px 20px rgba(15, 23, 42, 0.06);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .x-nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
      border: 0;
      background: transparent;
      cursor: pointer;
      position: relative;
    }
    .x-nav-item .ico { font-size: 20px; line-height: 1; }
    .x-nav-item.active { color: #2563eb; }
    .x-nav-item.active::before {
      content: "";
      position: absolute;
      top: 0;
      width: 28px;
      height: 3px;
      border-radius: 0 0 4px 4px;
      background: #2563eb;
    }
    .x-badge-dot {
      position: absolute;
      top: 7px;
      right: calc(50% - 16px);
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 999px;
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      display: none;
      align-items: center;
      justify-content: center;
    }
    /* Install App Floating Pill */
    .x-install-bar {
      position: fixed;
      bottom: 74px;
      left: 50%;
      transform: translateX(-50%);
      width: min(420px, 92%);
      background: #0f172a;
      color: #fff;
      padding: 12px 16px;
      border-radius: 16px;
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 410;
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.28);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .x-install-btn {
      padding: 8px 14px;
      border-radius: 10px;
      border: 0;
      background: #2563eb;
      color: #fff;
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
    }
    /* Notification Drawer Modal */
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

  // 3. Determine Active Tab
  const path = location.pathname.toLowerCase();
  const isTests = path.includes('test-portal');
  const isNotes = path.includes('notes');
  const isProfile = path.includes('auth') || path.includes('complete-profile') || path.includes('admin');
  const isHome = !isTests && !isNotes && !isProfile;

  // 4. Create Bottom Navigation Bar
  const nav = document.createElement('nav');
  nav.className = 'x-bottom-nav';
  nav.id = 'xBottomNav';
  nav.innerHTML = `
    <a class="x-nav-item ${isHome ? 'active' : ''}" href="./index.html"><span class="ico">🏠</span><span>Home</span></a>
    <a class="x-nav-item ${isTests ? 'active' : ''}" href="./test-portal.html"><span class="ico">📝</span><span>Tests</span></a>
    <a class="x-nav-item ${isNotes ? 'active' : ''}" href="./notes.html"><span class="ico">📚</span><span>Notes</span></a>
    <button type="button" class="x-nav-item" id="xAlertsBtn">
      <span class="ico">🔔</span><span>Alerts</span>
      <span class="x-badge-dot" id="xUnreadBadge">0</span>
    </button>
    <a class="x-nav-item ${isProfile ? 'active' : ''}" href="./auth.html"><span class="ico">👤</span><span>Profile</span></a>
  `;
  document.body.appendChild(nav);

  // 5. Create Install App Bar
  const installBar = document.createElement('div');
  installBar.className = 'x-install-bar';
  installBar.id = 'xInstallBar';
  installBar.innerHTML = `
    <div style="font-size:13px"><strong>📲 Install Xtreme Exam App</strong><div style="font-size:11px;color:#94a3b8">Fast access on Home Screen & PC</div></div>
    <div style="display:flex;gap:8px;align-items:center">
      <button type="button" class="x-install-btn" id="xDoInstallBtn">Install</button>
      <button type="button" style="background:transparent;border:0;color:#94a3b8;font-size:16px;cursor:pointer" onclick="document.getElementById('xInstallBar').style.display='none'">✕</button>
    </div>
  `;
  document.body.appendChild(installBar);

  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBar.style.display = 'flex';
  });

  document.getElementById('xDoInstallBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBar.style.display = 'none';
  });

  // 6. Create Notification Drawer
  const notifModal = document.createElement('div');
  notifModal.className = 'x-notif-backdrop';
  notifModal.id = 'xNotifModal';
  notifModal.innerHTML = `
    <div class="x-notif-sheet">
      <div class="x-notif-head">
        <h3 style="margin:0;font-size:17px">🔔 Notifications & Alerts</h3>
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

  // 7. Fetch Notifications from Supabase
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
    if (unread > 0) {
      badge.textContent = unread > 9 ? '9+' : unread;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
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
    loadNotifications();
  });

  // Load badge count on startup
  setTimeout(loadNotifications, 800);
})();
