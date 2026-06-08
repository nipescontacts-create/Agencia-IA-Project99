(function () {
  "use strict";

  /* ─── Helpers ──────────────────────────────────────────── */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
  const fmtEur = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:0,maximumFractionDigits:0}).format(+n||0) + " EUR";
  const fmtEurDec = n => new Intl.NumberFormat("es-ES",{minimumFractionDigits:2,maximumFractionDigits:2}).format(+n||0) + " EUR";
  const fmtMon = d => { const [y,m] = (d||"").split("-"); const names=["Ene","Feb","Mar","Apr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]; return (names[+m-1]||m)+" "+(y||""); };
  function safe(fn, name) { try { fn(); } catch(e) { console.warn("["+name+"]", e); } }

  const D = window.__P99__ || {};

  /* ─── State ─────────────────────────────────────────────── */
  let S = {
    user:      null,
    view:      "dashboard",
    theme:     localStorage.getItem("p99-theme") || "dark",
    collapsed: false,
    clients:   JSON.parse(localStorage.getItem("p99-clients")   || "[]"),
    projects:  JSON.parse(localStorage.getItem("p99-projects")  || "[]"),
    quotes:    JSON.parse(localStorage.getItem("p99-quotes")    || "[]"),
    invoices:  JSON.parse(localStorage.getItem("p99-invoices")  || "[]"),
    team:      JSON.parse(localStorage.getItem("p99-team")      || "[]"),
    portfolio: JSON.parse(localStorage.getItem("p99-portfolio") || "[]"),
    plEntries: JSON.parse(localStorage.getItem("p99-pl")        || "[]"),
    tasks:     JSON.parse(localStorage.getItem("p99-tasks")     || "null"),
    aiKeys:    JSON.parse(localStorage.getItem("p99-aikeys")    || "{}"),
    aiModels:  JSON.parse(localStorage.getItem("p99-aimodels")  || "{}"),
    toolKeys:  JSON.parse(localStorage.getItem("p99-toolkeys")  || "{}"),
    courses:   JSON.parse(localStorage.getItem("p99-courses")   || "{}"),
    edits:     JSON.parse(localStorage.getItem("p99-edits")     || "{}"),
    qCounter:  parseInt(localStorage.getItem("p99-qcnt") || "1000"),
    iCounter:  parseInt(localStorage.getItem("p99-icnt") || "100"),
  };

  // Reset tasks if they contain old seeded data (ids t1-t10)
  if(S.tasks === null || (S.tasks.length > 0 && S.tasks[0]?.id === "t1")) {
    S.tasks = [];
    localStorage.setItem("p99-tasks", JSON.stringify(S.tasks));
  }

  function persist(key, val) { S[key] = val; localStorage.setItem("p99-"+key, JSON.stringify(val)); }

  /* ── Computed financials from entries ── */
  function computeFinancials() {
    const map = {};
    S.plEntries.forEach(e => {
      const key = e.month || "2024-01";
      if (!map[key]) map[key] = { month: fmtMon(key), income: 0, expenses: 0, net: 0 };
      if (e.type === "income")  map[key].income   += +e.amount || 0;
      else                      map[key].expenses += +e.amount || 0;
    });
    const sorted = Object.keys(map).sort().map(k => {
      const m = map[k];
      m.net = m.income - m.expenses;
      return m;
    });
    return sorted;
  }

  /* ─── Boot ──────────────────────────────────────────────── */
  function boot() {
    safe(initTheme,  "theme");
    safe(initAuth,   "auth");
    safe(initPWA,    "pwa");
    safe(initEditMode, "editMode");
  }

  /* ─── Theme ─────────────────────────────────────────────── */
  function initTheme() {
    applyTheme(S.theme);
    const btn = $("#theme-toggle");
    if (btn) btn.addEventListener("click", () => { S.theme = S.theme==="dark"?"light":"dark"; localStorage.setItem("p99-theme",S.theme); applyTheme(S.theme); });
    const dBtn = $("#theme-dark-btn"), lBtn = $("#theme-light-btn");
    if (dBtn) dBtn.addEventListener("click", () => { S.theme="dark"; localStorage.setItem("p99-theme","dark"); applyTheme("dark"); syncThemeBtns(); });
    if (lBtn) lBtn.addEventListener("click", () => { S.theme="light"; localStorage.setItem("p99-theme","light"); applyTheme("light"); syncThemeBtns(); });
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    const sun=$(".icon-sun"), moon=$(".icon-moon");
    if(sun)  sun.classList.toggle("hidden", t==="dark");
    if(moon) moon.classList.toggle("hidden", t==="light");
    syncThemeBtns();
  }
  function syncThemeBtns() {
    const dBtn=$("#theme-dark-btn"), lBtn=$("#theme-light-btn");
    if(dBtn) dBtn.classList.toggle("active", S.theme==="dark");
    if(lBtn) lBtn.classList.toggle("active", S.theme==="light");
  }

  /* ─── Auth ──────────────────────────────────────────────── */
  function initAuth() {
    const saved = localStorage.getItem("p99-user");
    if (saved) { S.user = JSON.parse(saved); showApp(); return; }
    showAuthScreen();

    $$(".auth-tab").forEach(tab => tab.addEventListener("click", () => {
      $$(".auth-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      $$(".auth-form").forEach(f => f.classList.add("hidden"));
      const p = $('[data-auth-panel="'+tab.dataset.authTab+'"]');
      if(p) p.classList.remove("hidden");
    }));

    const lf = $("#login-form");
    if(lf) lf.addEventListener("submit", e => {
      e.preventDefault();
      const email = $("#login-email").value.trim() || "usuario@project99.io";
      const name = email.split("@")[0].replace(/[._]/g," ").split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ") || "Usuario";
      doLogin({ name, email, role:"Admin", avatar: name.slice(0,2).toUpperCase() });
    });
    const rf = $("#register-form");
    if(rf) rf.addEventListener("submit", e => {
      e.preventDefault();
      const name = $("#reg-name").value.trim() || "Nuevo Usuario";
      doLogin({ name, email: $("#reg-email").value.trim(), role: $("#reg-role").value, avatar: name.slice(0,2).toUpperCase() });
    });
    const gBtn = $("#google-login");
    if(gBtn) gBtn.addEventListener("click", () => doLogin({ name:"Usuario Google", email:"usuario@gmail.com", role:"Admin", avatar:"UG" }));
    const logoutBtn = $("#logout-btn");
    if(logoutBtn) logoutBtn.addEventListener("click", () => { localStorage.removeItem("p99-user"); S.user=null; showAuthScreen(); });
  }

  function doLogin(user) { S.user=user; localStorage.setItem("p99-user",JSON.stringify(user)); showApp(); }

  function showAuthScreen() {
    const auth=$("#auth-screen"), app=$("#app-shell");
    if(auth) auth.classList.remove("hidden");
    if(app)  app.classList.add("hidden");
  }

  function showApp() {
    const auth=$("#auth-screen"), app=$("#app-shell");
    if(auth) auth.classList.add("hidden");
    if(app)  app.classList.remove("hidden");
    updateUserUI();
    safe(initAppShell, "shell");
    safe(initNav, "nav");
    navigateTo("dashboard");
    applyEdits(); // restore user's text edits
  }

  function updateUserUI() {
    if(!S.user) return;
    const ag = S.user.avatar || S.user.name.slice(0,2).toUpperCase();
    $$("[id$='-avatar']").forEach(el => { el.textContent = ag; });
    $$("[id$='-username']").forEach(el => { el.textContent = S.user.name; });
    const gr = $("#dashboard-greeting");
    if(gr) { const h=new Date().getHours(); gr.textContent = (h<12?"Buenos dias":h<20?"Buenas tardes":"Buenas noches")+", "+S.user.name.split(" ")[0]; }
    const sn = $("#settings-name"); if(sn && !sn.value) sn.value = S.user.name || "";
    const se = $("#settings-email"); if(se && !se.value) se.value = S.user.email || "";
  }

  /* ─── App Shell ─────────────────────────────────────────── */
  function initAppShell() {
    const sidebar = $("#sidebar"), mainArea = $(".main-area"), toggle = $("#sidebar-toggle");
    if(toggle && sidebar) toggle.addEventListener("click", () => {
      S.collapsed = !S.collapsed;
      sidebar.classList.toggle("collapsed", S.collapsed);
      if(mainArea) mainArea.classList.toggle("sidebar-collapsed", S.collapsed);
      const icon = toggle.querySelector("svg");
      if(icon) icon.style.transform = S.collapsed ? "rotate(180deg)" : "";
    });

    const mBtn = $("#mobile-menu-btn");
    if(mBtn && sidebar) {
      mBtn.addEventListener("click", () => sidebar.classList.toggle("mobile-open"));
      document.addEventListener("click", e => {
        if(!sidebar.contains(e.target) && !mBtn.contains(e.target)) sidebar.classList.remove("mobile-open");
      });
    }

    const aiToggle=$("#ai-toggle"), aiPanel=$("#ai-panel"), aiClose=$("#ai-panel-close");
    if(aiToggle && aiPanel) aiToggle.addEventListener("click", () => aiPanel.classList.toggle("open"));
    if(aiClose  && aiPanel) aiClose.addEventListener("click",  () => aiPanel.classList.remove("open"));
    safe(initAIChat, "aiChat");

    document.addEventListener("keydown", e => {
      if((e.ctrlKey||e.metaKey) && e.key==="k") { e.preventDefault(); const gs=$("#global-search"); if(gs) gs.focus(); }
    });

    $$("[data-view-trigger]").forEach(b => b.addEventListener("click", () => navigateTo(b.dataset.viewTrigger)));
    $$(".modal-close").forEach(b => b.addEventListener("click", () => { if(b.dataset.modal) closeModal(b.dataset.modal); }));
    $$(".modal-overlay").forEach(o => o.addEventListener("click", e => { if(e.target===o) o.classList.add("hidden"); }));
  }

  /* ─── Navigation ─────────────────────────────────────────── */
  function initNav() {
    $$(".nav-item").forEach(item => item.addEventListener("click", () => navigateTo(item.dataset.view)));
  }

  function navigateTo(view) {
    if(!view) return; S.view = view;
    $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view===view));
    $$(".view").forEach(v => v.classList.toggle("hidden", v.dataset.view!==view));
    const ca = $(".content-area"); if(ca) ca.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const fn = viewInits[view]; if(fn) safe(fn, "view:"+view);
    const sidebar = $("#sidebar"); if(sidebar) sidebar.classList.remove("mobile-open");
  }

  const viewInits = {
    dashboard:    initDashboard,
    leads:        initLeads,
    crm:          initCRM,
    projects:     initProjects,
    tasks:        initTasks,
    quotes:       initQuotes,
    academy:      initAcademy,
    portfolio:    initPortfolio,
    resources:    initResources,
    integrations: initIntegrations,
    analytics:    initAnalytics,
    team:         initTeam,
    settings:     initSettings,
  };

  /* ─── Empty State ───────────────────────────────────────── */
  function emptyState(icon, title, desc, actions) {
    return '<div class="empty-state"><div class="empty-state-icon">'+icon+'</div><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p><div class="empty-state-actions">'+(actions||"")+'</div></div>';
  }
  function svgIcon(name) {
    const i = {
      users:    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      folder:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
      doc:      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      activity: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
      search:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
      image:    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
      team:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg>',
    };
    return i[name] || i.activity;
  }

  /* ─── DASHBOARD ─────────────────────────────────────────── */
  const KPI_DEFS = [
    { label:"Ingresos este mes", id:"kpi-income", icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>', cls:"income", sparkline:true },
    { label:"Leads en pipeline",  id:"kpi-leads",  icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>', cls:"leads" },
    { label:"Proyectos activos",  id:"kpi-projects",icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>', cls:"projects" },
    { label:"Tasa de conversion", id:"kpi-conv",    icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>', cls:"conversion" },
    { label:"Satisfaccion clientes",id:"kpi-sat",   icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>', cls:"satisfaction" },
    { label:"Ganancia neta",      id:"kpi-net",     icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>', cls:"net" }
  ];

  function buildKPIGrid(values) {
    const grid = document.getElementById("kpi-grid"); if(!grid) return;
    grid.innerHTML = KPI_DEFS.map(k => `
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">${k.label}</span>
          <span class="kpi-icon kpi-icon--${k.cls}">${k.icon}</span>
        </div>
        <div class="kpi-value" id="${k.id}">${values[k.id]?.val||"—"}</div>
        <div class="kpi-trend kpi-trend--${values[k.id]?.trend||"neutral"}">${values[k.id]?.sub||"Sin datos aun"}</div>
        ${k.sparkline?'<div class="kpi-sparkline" id="sparkline-income"></div>':""}
      </div>`).join("");
  }

  function initDashboard() {
    updateUserUI();
    const monthly = computeFinancials();
    if(monthly.length === 0) {
      buildKPIGrid({});  // all show "—"
      renderEmptyDashboard();
      renderDashboardTodayTasks();
      return;
    }
    const last = monthly[monthly.length-1];
    const totalClients = S.clients.length;
    const activeProj = S.projects.filter(p=>p.status!=="cierre"&&p.status!=="completada").length;
    buildKPIGrid({
      "kpi-income":   { val: fmtEur(last.income),  trend:"up",     sub:"Registrado este mes" },
      "kpi-leads":    { val: String(totalClients),   trend:totalClients>0?"up":"neutral", sub: totalClients>0?totalClients+" clientes en CRM":"Anade tu primer cliente" },
      "kpi-projects": { val: String(activeProj),     trend:"neutral", sub: activeProj>0?activeProj+" activos":"Sin proyectos activos" },
      "kpi-conv":     { val:"—",    trend:"neutral", sub:"Sin datos suficientes" },
      "kpi-sat":      { val:"—",    trend:"neutral", sub:"Sin valoraciones" },
      "kpi-net":      { val: fmtEur(last.net),       trend: last.net>=0?"up":"down", sub: "Margen: "+(last.income>0?Math.round((last.net/last.income)*100):0)+"%" }
    });
    safe(() => drawSparkline(monthly), "sparkline");
    safe(() => drawRevenueChart(monthly), "revenue");
    safe(() => drawPipelineChart(), "pipeline");
    safe(() => drawServicesChart(), "services");
    safe(() => drawExpensesDonut(), "donut");
    renderDashboardTodayTasks();
  }

  function renderDashboardTodayTasks() {
    const ul = document.getElementById("today-tasks"); if(!ul) return;
    const today = new Date().toISOString().slice(0,10);
    const todayTasks = (S.tasks||[]).filter(t => t.dueDate===today && t.status!=="completada").slice(0,5);
    if(!todayTasks.length) {
      ul.innerHTML='<li style="padding:.5rem 0;font-size:.775rem;color:var(--text-dim)">Sin tareas para hoy — <button class="btn-ghost btn-sm" onclick="window.p99Nav(\'tasks\')" style="font-size:.7rem">+ Crear una</button></li>';
      return;
    }
    const PCOL={alta:"#EF4444",media:"#EAB308",baja:"#22C55E"};
    ul.innerHTML=todayTasks.map(t=>`<li class="task-item">
      <input type="checkbox" ${t.status==="completada"?"checked":""} onchange="window.p99ToggleTask('${t.id}');this.closest('li').style.opacity='.4'">
      <span style="${t.status==="completada"?"text-decoration:line-through;color:var(--text-mute)":""}">${esc(t.title)}</span>
      <span class="task-tag" style="background:${PCOL[t.priority]||"#888"}22;color:${PCOL[t.priority]||"#888"};font-size:.6rem;padding:.1rem .4rem;border-radius:3px">${t.priority||""}</span>
    </li>`).join("");
  }

  function renderEmptyDashboard() {
    // KPI grid already built by buildKPIGrid({}) — shows "—" for all
    const cg = $(".charts-grid");
    if(cg) cg.innerHTML = emptyState(svgIcon("activity"),"Sin datos todavia","Registra tus primeros ingresos en Analytics y anade clientes al CRM para ver los graficos aqui.",
      '<button class="btn-primary" onclick="window.p99Nav(\'analytics\')">Registrar ingresos</button>'+
      '<button class="btn-ghost" onclick="window.p99Nav(\'crm\')">Anadir cliente</button>');
  }
  window.p99Nav = v => navigateTo(v);

  function svgSparkline(vals, color, w, h) {
    if(!vals||vals.length<2) return "";
    const min=Math.min(...vals), max=Math.max(...vals);
    const pts = vals.map((v,i) => (i/(vals.length-1))*w+","+(h-((v-min)/(max-min+1))*(h-4)-2));
    return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><polyline points="'+pts.join(" ")+'" fill="none" stroke="'+color+'" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function drawSparkline(monthly) {
    const el=$("#sparkline-income"); if(!el) return;
    el.innerHTML = svgSparkline(monthly.slice(-6).map(m=>m.income), "#22C55E", 200, 32);
  }
  function drawRevenueChart(monthly) {
    const el=$("#chart-revenue"); if(!el||!monthly.length) return;
    const W=el.offsetWidth||480, H=180, pad={t:12,r:16,b:32,l:44};
    const cW=W-pad.l-pad.r, cH=H-pad.t-pad.b;
    const maxVal=Math.max(...monthly.map(m=>m.income),1)*1.1;
    const xP=i=>pad.l+(i/(monthly.length-1||1))*cW, yP=v=>pad.t+cH-(v/maxVal)*cH;
    const mkLine=(key,color,dash)=>'<polyline points="'+monthly.map((m,i)=>xP(i)+","+yP(m[key])).join(" ")+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'+(dash?' stroke-dasharray="5,4"':'')+'/>';
    const mkArea=(key,color)=>'<polygon points="'+monthly.map((m,i)=>xP(i)+","+yP(m[key])).join(" ")+" "+xP(monthly.length-1)+","+(pad.t+cH)+" "+xP(0)+","+(pad.t+cH)+'" fill="'+color+'" opacity="0.07"/>';
    const grids=[0,.25,.5,.75,1].map(p=>{const y=pad.t+cH-p*cH; return '<line x1="'+pad.l+'" y1="'+y+'" x2="'+(W-pad.r)+'" y2="'+y+'" stroke="var(--border)" stroke-dasharray="3,5"/><text x="'+(pad.l-5)+'" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="var(--text-dim)">'+Math.round(maxVal*p/1000)+'k</text>';}).join("");
    const xLabels=monthly.filter((_,i)=>i%Math.max(1,Math.floor(monthly.length/6))===0).map((m,ii)=>'<text x="'+xP(ii*Math.max(1,Math.floor(monthly.length/6)))+'" y="'+(H-6)+'" text-anchor="middle" font-size="9" fill="var(--text-dim)">'+m.month+'</text>').join("");
    el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%">'+grids+mkArea("income","#E5302A")+mkLine("income","#22C55E")+mkLine("expenses","#E5302A")+mkLine("net","#888",true)+xLabels+'</svg>';
  }
  function drawPipelineChart() {
    const el=$("#chart-pipeline"); if(!el) return;
    const stages=CRM_STAGES.map(s=>({...s,count:S.clients.filter(c=>c.stage===s.key).length}));
    const maxCount=Math.max(...stages.map(s=>s.count),1);
    const W=el.offsetWidth||220, barH=24, gap=8;
    let svg=""; stages.forEach((s,i)=>{const y=i*(barH+gap)+8,bw=Math.max((s.count/maxCount)*(W-90),s.count>0?20:4);svg+='<rect x="86" y="'+y+'" width="'+bw+'" height="'+barH+'" rx="3" fill="'+(s.color||"#E5302A")+'" opacity="0.85"/><text x="82" y="'+(y+barH/2+4)+'" text-anchor="end" font-size="8" fill="var(--text-mute)">'+esc(s.label.split(" ")[0])+'</text><text x="'+(86+bw+5)+'" y="'+(y+barH/2+4)+'" font-size="9" font-weight="700" fill="var(--text)">'+s.count+'</text>';});
    el.innerHTML='<svg viewBox="0 0 '+W+' '+(stages.length*(barH+gap)+16)+'" width="100%">'+svg+'</svg>';
  }
  function drawServicesChart() {
    const el=$("#chart-services"); if(!el) return;
    const services=D.services.slice(0,5);
    const W=el.offsetWidth||260, barH=20, gap=9;
    const colors=["#E5302A","#AA2020","#881818","#661010","#440808"];
    let svg=""; services.forEach((s,i)=>{const y=i*(barH+gap)+8, bw=(s.base/Math.max(...services.map(x=>x.base),1))*(W-110); svg+='<rect x="106" y="'+y+'" width="'+bw+'" height="'+barH+'" rx="3" fill="'+colors[i]+'" opacity="0.85"/><text x="102" y="'+(y+barH/2+4)+'" text-anchor="end" font-size="8" fill="var(--text-mute)">'+esc(s.label.split(" ")[0])+'</text><text x="'+(106+bw+5)+'" y="'+(y+barH/2+4)+'" font-size="8" fill="var(--text-mute)">'+fmtEur(s.base)+'</text>';});
    el.innerHTML='<svg viewBox="0 0 '+W+' '+(services.length*(barH+gap)+16)+'" width="100%">'+svg+'</svg>';
  }
  function drawExpensesDonut() {
    const el=$("#chart-expenses"); if(!el) return;
    const monthly=computeFinancials();
    const cats = monthly.length>0 ? [
      {label:"Proyectos",pct:52},{label:"Herramientas",pct:19},{label:"Marketing",pct:13},{label:"Hosting",pct:11},{label:"Otros",pct:5}
    ] : [{label:"Sin datos",pct:100}];
    const W=el.offsetWidth||240, H=180, cx=W/2, cy=78, r=52, ir=28;
    const colors=["#E5302A","#AA2020","#881818","#661010","#444"];
    let angle=-Math.PI/2, arcs="";
    cats.forEach((c,i)=>{const a=(c.pct/100)*2*Math.PI,x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle),x2=cx+r*Math.cos(angle+a),y2=cy+r*Math.sin(angle+a),xi1=cx+ir*Math.cos(angle+a),yi1=cy+ir*Math.sin(angle+a),xi2=cx+ir*Math.cos(angle),yi2=cy+ir*Math.sin(angle),lg=a>Math.PI?1:0;arcs+='<path d="M '+x1+' '+y1+' A '+r+' '+r+' 0 '+lg+' 1 '+x2+' '+y2+' L '+xi1+' '+yi1+' A '+ir+' '+ir+' 0 '+lg+' 0 '+xi2+' '+yi2+' Z" fill="'+colors[i]+'"/>';angle+=a;});
    const legend=cats.map((c,i)=>'<tspan x="4" dy="13" fill="var(--text-mute)"><tspan fill="'+colors[i]+'">■ </tspan>'+esc(c.label)+' '+c.pct+'%</tspan>').join("");
    el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%">'+arcs+'<text x="'+cx+'" y="'+(cy-3)+'" text-anchor="middle" font-size="10" font-weight="800" fill="var(--text)">Gastos</text><text x="0" y="'+(cy+r+16)+'" font-size="8">'+legend+'</text></svg>';
  }

  /* ─── LEADS ──────────────────────────────────────────────── */
  function initLeads() {
    if(S.clients.length===0) {
      const res=$(".leads-results");
      if(res) res.innerHTML=emptyState(svgIcon("search"),"Ejecuta tu primera busqueda","Configura los filtros y pulsa Buscar leads.","");
    } else { populateLeadsTable(S.clients); }
    $$("[id='run-lead-search'],[id='search-leads-btn']").forEach(btn => btn.addEventListener("click", () => {
      showToast("Buscando leads...","info");
      setTimeout(()=>{ if(S.clients.length>0){populateLeadsTable(S.clients);showToast(S.clients.length+" leads","success");}else{const r=$(".leads-results");if(r)r.innerHTML=emptyState(svgIcon("users"),"Sin resultados","Prueba con otros filtros.",'<button class="btn-ghost" onclick="window.p99Nav(\'crm\')">Anadir manualmente</button>');showToast("Sin resultados","info");} },900);
    }));
    const exportBtn=$("#export-leads-btn");
    if(exportBtn) exportBtn.addEventListener("click",()=>{if(!S.clients.length){showToast("Sin leads","info");return;}exportCSV(S.clients,"leads");showToast("CSV exportado","success");});
    const filter=$("#leads-filter");
    if(filter) filter.addEventListener("input",()=>{ const q=filter.value.toLowerCase(); $$(".leads-tr").forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q)?"":"none";}); });
  }
  function populateLeadsTable(clients) {
    const tbody=$("#leads-tbody"), count=$("#leads-count"); if(!tbody) return;
    tbody.innerHTML=clients.map(c=>{const score=(c.score||5)>=8?"high":(c.score||5)>=5?"mid":"low";return'<tr class="leads-tr"><td><strong>'+esc(c.name)+'</strong><br><span style="font-size:.65rem;color:var(--text-mute)">'+esc(c.website||"")+'</span></td><td>'+esc(c.industry||"—")+'</td><td>'+esc(c.city||"—")+'</td><td>'+esc(c.contact||"—")+'<br><span style="font-size:.65rem;color:var(--text-mute)">'+esc(c.email||"")+'</span></td><td><span class="score-badge score-badge--'+score+'">'+(c.score||"—")+'</span></td><td class="mono">'+fmtEur(c.budget||0)+'</td><td><div style="display:flex;gap:.25rem"><button class="btn-ghost btn-sm" onclick="window.p99OpenClient(\''+esc(c.id)+'\')">Ver</button><button class="btn-ghost btn-sm" onclick="window.p99ColdCall(\''+esc(c.id)+'\')">Script</button></div></td></tr>';}).join("");
    if(count) count.textContent=clients.length+" leads";
  }

  /* ─── CRM ────────────────────────────────────────────────── */
  const CRM_STAGES = [
    {key:"lead-frio",label:"Lead Frio",color:"#444"},{key:"lead-caliente",label:"Lead Caliente",color:"#E5302A"},
    {key:"propuesta",label:"Propuesta Enviada",color:"#888"},{key:"negociacion",label:"Negociacion",color:"#AAA"},
    {key:"cliente",label:"Cliente",color:"#22C55E"},{key:"proyecto-activo",label:"Proyecto Activo",color:"#EAB308"},
    {key:"cliente-feliz",label:"Cliente Feliz",color:"#666"},{key:"churn",label:"Churn",color:"#661010"}
  ];
  function initCRM() {
    renderKanban(); renderCRMList();
    $$(".crm-view-btn").forEach(btn=>btn.addEventListener("click",()=>{$$(".crm-view-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const v=btn.dataset.crmView;$("#crm-kanban").classList.toggle("hidden",v!=="kanban");$("#crm-list").classList.toggle("hidden",v!=="list");}));
    const nb=$("#new-client-btn"); if(nb) nb.addEventListener("click",()=>showToast("Formulario de nuevo cliente — proximamente","info"));
  }
  function renderKanban() {
    const board=$("#crm-kanban"); if(!board) return;
    if(S.clients.length===0){board.innerHTML=emptyState(svgIcon("users"),"CRM vacio","Anade tu primer cliente para gestionar el pipeline.",'<button class="btn-primary">+ Anadir cliente</button>');return;}
    board.innerHTML=CRM_STAGES.map(stage=>{const clients=S.clients.filter(c=>c.stage===stage.key);const cards=clients.map(c=>'<div class="kanban-card" onclick="window.p99OpenClient(\''+esc(c.id)+'\')" ><div class="kanban-card-name">'+esc(c.name)+'</div><div class="kanban-card-meta">'+esc(c.contact||"")+(c.industry?" &bull; "+esc(c.industry):"")+'</div><div class="kanban-card-tags">'+(c.tags||[]).map(t=>'<span class="kanban-card-tag">'+esc(t)+'</span>').join("")+'</div><div class="kanban-card-footer"><span class="kanban-card-budget">'+fmtEur(c.budget||0)+'</span><span class="kanban-card-avatar">'+esc(c.avatar||c.name.slice(0,2).toUpperCase())+'</span></div></div>').join("");return'<div class="kanban-col"><div class="kanban-col-header" style="border-top:2px solid '+stage.color+'"><span class="kanban-col-title">'+esc(stage.label)+'</span><span class="kanban-col-count">'+clients.length+'</span></div><div class="kanban-cards">'+(cards||'<p style="font-size:.65rem;color:var(--text-dim);padding:.4rem">Vacio</p>')+'</div></div>';}).join("");
  }
  function renderCRMList() {
    const tbody=$("#crm-list-tbody"); if(!tbody) return;
    if(S.clients.length===0){tbody.innerHTML='<tr><td colspan="7" class="table-empty"><p>Sin clientes</p><button class="btn-primary btn-sm">+ Anadir</button></td></tr>';return;}
    tbody.innerHTML=S.clients.map(c=>{const stage=CRM_STAGES.find(s=>s.key===c.stage)||{label:c.stage,color:"#444"};const score=(c.score||5)>=8?"high":(c.score||5)>=5?"mid":"low";return'<tr><td><strong>'+esc(c.name)+'</strong></td><td>'+esc(c.contact||"—")+'</td><td><span class="badge" style="background:'+stage.color+'22;color:'+stage.color+'">'+esc(stage.label)+'</span></td><td class="mono">'+fmtEur(c.budget||0)+'</td><td class="mono" style="font-size:.7rem;color:var(--text-mute)">'+esc(c.lastContact||"—")+'</td><td><span class="score-badge score-badge--'+score+'">'+(c.score||"—")+'</span></td><td><button class="btn-ghost btn-sm" onclick="window.p99OpenClient(\''+esc(c.id)+'\')">Ver</button></td></tr>';}).join("");
  }
  window.p99OpenClient = function(id) {
    const client=S.clients.find(c=>c.id===id); if(!client) return;
    const modal=$("#modal-client"),title=$("#modal-client-title"),body=$("#modal-client-body");
    if(!modal||!body) return;
    const stage=CRM_STAGES.find(s=>s.key===client.stage)||{label:client.stage,color:"#444"};
    const score=(client.score||5)>=8?"high":(client.score||5)>=5?"mid":"low";
    if(title) title.textContent=client.name;
    body.innerHTML='<div class="client-detail-header"><div class="client-detail-avatar">'+esc(client.avatar||client.name.slice(0,2).toUpperCase())+'</div><div class="client-detail-info"><h4>'+esc(client.name)+'</h4><p>'+esc(client.industry||"—")+' &bull; <span class="badge" style="background:'+stage.color+'22;color:'+stage.color+'">'+esc(stage.label)+'</span></p></div><span class="score-badge score-badge--'+score+'" style="width:34px;height:34px;font-size:.8rem;margin-left:auto">'+(client.score||"—")+'</span></div><div class="client-detail-grid">'+detItem("Contacto",client.contact)+detItem("Email",client.email)+detItem("Telefono",client.phone)+detItem("Web",client.website)+detItem("Presupuesto",fmtEur(client.budget||0))+detItem("Ultima interaccion",client.lastContact||"—")+'</div>'+(client.tags&&client.tags.length?'<div><h4 style="margin-bottom:.5rem">Tags</h4><div style="display:flex;gap:.25rem;flex-wrap:wrap">'+(client.tags.map(t=>'<span class="badge badge--red">'+esc(t)+'</span>').join(""))+'</div></div>':"")+' <div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="btn-primary btn-sm" onclick="window.p99NewQuoteFor(\''+esc(id)+'\')">Nuevo presupuesto</button><button class="btn-ghost btn-sm" onclick="window.p99ColdCall(\''+esc(id)+'\')">Script call</button></div>';
    modal.classList.remove("hidden");
  };
  function detItem(label,value){return'<div class="client-detail-item"><label>'+esc(label)+'</label><span>'+esc(value||"—")+'</span></div>';}
  window.p99NewQuoteFor = function(id){closeModal("modal-client");const c=S.clients.find(c=>c.id===id);if(c){const qComp=$("#q-company"),qCont=$("#q-contact"),qEmail=$("#q-email");if(qComp)qComp.value=c.name;if(qCont)qCont.value=c.contact||"";if(qEmail)qEmail.value=c.email||"";}openModal("modal-quote");navigateTo("quotes");};

  /* ─── COLD CALL ──────────────────────────────────────────── */
  window.p99ColdCall = function(id) {
    const c=S.clients.find(cl=>cl.id===id)||{name:"la empresa",industry:"su sector"};
    const modal=$("#modal-coldcall"),body=$("#modal-coldcall-body"); if(!body) return;
    body.innerHTML='<div style="display:flex;flex-direction:column;gap:.875rem">'+
      coldCallBlock("Apertura (15 segundos)",'"Hola, buenos dias, soy [TU NOMBRE] de Project99 Agencia IA. Llamo porque trabajamos con empresas del sector '+esc(c.industry||"su sector")+' y hemos ayudado a reducir su carga operativa entre un 30-50% con IA. ¿Tiene un momento breve?"')+
      coldCallBlock("Objecion: Es muy caro",'"Entiendo. Nuestras soluciones se recuperan en 3-4 meses. Si su equipo dedica 2h diarias a tareas automatizables, son 40h/mes. El ROI es claro. ¿Le cuento un caso real?"')+
      coldCallBlock("Cierre",'"¿Quedamos 20 minutos esta semana para mostrarle exactamente como lo implementariamos en '+esc(c.name)+'? Sin compromiso. ¿Martes o jueves?"')+'</div>';
    if(modal) modal.classList.remove("hidden");
    const copyBtn=$("#copy-script-btn"); if(copyBtn) copyBtn.onclick=()=>{if(navigator.clipboard) navigator.clipboard.writeText(body.textContent.replace(/\s+/g," ").trim()).then(()=>showToast("Script copiado","success"));};
  };
  function coldCallBlock(title,content){return'<div class="card" style="padding:.75rem"><h4 style="margin-bottom:.4rem;color:var(--accent);font-size:.8rem">'+esc(title)+'</h4><p style="font-size:.775rem;white-space:pre-line">'+esc(content)+'</p></div>';}

  /* ─── PROJECTS ───────────────────────────────────────────── */
  const PROJ_STAGES=["briefing","diseño","desarrollo","testing","entrega","cierre"];
  function initProjects() {
    renderProjectsTable();renderProjectsBoard();renderProjectsTimeline();
    $$(".proj-view-btn").forEach(btn=>btn.addEventListener("click",()=>{$$(".proj-view-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const v=btn.dataset.projView;$("#proj-table-view").classList.toggle("hidden",v!=="table");$("#proj-board-view").classList.toggle("hidden",v!=="board");$("#proj-timeline-view").classList.toggle("hidden",v!=="timeline");}));
    const nb=$("#new-project-btn"); if(nb) nb.addEventListener("click",()=>showToast("Nuevo proyecto — proximamente","info"));
  }
  function renderProjectsTable(){const tbody=$("#proj-tbody");if(!tbody)return;if(S.projects.length===0){tbody.innerHTML='<tr><td colspan="8" class="table-empty"><p>Sin proyectos</p><button class="btn-primary btn-sm">+ Crear proyecto</button></td></tr>';return;}tbody.innerHTML=S.projects.map(p=>'<tr><td><strong>'+esc(p.name)+'</strong></td><td>'+esc(p.client||"—")+'</td><td><span class="status-dot status-dot--'+esc(p.status||"briefing")+'"></span>'+ucFirst(p.status||"briefing")+'</td><td>'+((p.team||[]).join(", ")||"—")+'</td><td class="mono" style="font-size:.7rem">'+esc(p.deadline||"—")+'</td><td class="mono">'+fmtEur(p.spent||0)+' / '+fmtEur(p.budget||0)+'</td><td><div style="display:flex;align-items:center;gap:.4rem"><div class="progress-bar"><div class="progress-bar-fill" style="width:'+(p.progress||0)+'%"></div></div><span style="font-size:.7rem;color:var(--text-mute)">'+(p.progress||0)+'%</span></div></td><td><button class="btn-ghost btn-sm">Ver</button></td></tr>').join("");}
  function renderProjectsBoard(){const board=$("#proj-kanban");if(!board)return;if(S.projects.length===0){board.innerHTML=emptyState(svgIcon("folder"),"Sin proyectos","El board aparecera cuando crees tu primer proyecto.","");return;}board.innerHTML=PROJ_STAGES.map(stage=>{const projs=S.projects.filter(p=>p.stage===stage||p.status===stage);const cards=projs.map(p=>'<div class="kanban-card"><div class="kanban-card-name">'+esc(p.name)+'</div><div class="kanban-card-meta">'+esc(p.client||"")+'</div><div class="kanban-card-footer"><span class="kanban-card-budget">'+(p.progress||0)+'%</span><div class="progress-bar" style="width:70px"><div class="progress-bar-fill" style="width:'+(p.progress||0)+'%"></div></div></div></div>').join("");return'<div class="kanban-col"><div class="kanban-col-header" style="border-top:2px solid var(--accent)"><span class="kanban-col-title">'+ucFirst(stage)+'</span><span class="kanban-col-count">'+projs.length+'</span></div><div class="kanban-cards">'+(cards||'<p style="font-size:.65rem;color:var(--text-dim);padding:.4rem">Vacio</p>')+'</div></div>';}).join("");}
  function renderProjectsTimeline(){const wrap=$("#proj-timeline");if(!wrap)return;if(S.projects.length===0){wrap.innerHTML=emptyState(svgIcon("activity"),"Sin proyectos","El timeline aparecera cuando tengas proyectos con fechas.","");return;}wrap.innerHTML='<div style="padding:1rem">'+S.projects.map(p=>'<div class="timeline-item"><div style="width:160px;font-size:.775rem;font-weight:700;flex-shrink:0">'+esc(p.name.slice(0,20))+'...</div><div class="timeline-bar-col"><div class="timeline-track"><div class="timeline-fill" style="width:'+(p.progress||0)+'%">'+(p.progress||0)+'%</div></div><div class="timeline-dates"><span>'+esc(p.client||"")+'</span><span>'+esc(p.deadline||"—")+'</span></div></div></div>').join("")+'</div>';}

  /* ─── QUOTES & INVOICES ──────────────────────────────────── */
  function initQuotes(){
    renderQuotesTable();renderInvoicesTable();initQuoteModal();
    $$(".quotes-tabs .tab-btn").forEach(btn=>btn.addEventListener("click",()=>switchQuoteTab(btn.dataset.tab)));
    const nb=$("#new-quote-btn"); if(nb) nb.addEventListener("click",()=>{resetQuoteModal();openModal("modal-quote");});
    const ib=$("#invoices-btn"); if(ib) ib.addEventListener("click",()=>switchQuoteTab("invoices"));
  }
  function switchQuoteTab(tab){$$(".quotes-tabs .tab-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));$("#quotes-panel").classList.toggle("hidden",tab!=="quotes");$("#invoices-panel").classList.toggle("hidden",tab!=="invoices");}

  function renderQuotesTable(){
    const tbody=$("#quotes-tbody"); if(!tbody) return;
    if(S.quotes.length===0){tbody.innerHTML='<tr><td colspan="8" class="table-empty"><p>Sin presupuestos</p><button class="btn-primary btn-sm" onclick="document.getElementById(\'new-quote-btn\').click()">+ Crear</button></td></tr>';return;}
    tbody.innerHTML=S.quotes.map(q=>{const s=q.status==="aceptado"?"success":q.status==="enviado"?"info":q.status==="rechazado"?"error":"neutral";return'<tr><td><code class="mono" style="font-size:.7rem;color:var(--accent)">'+esc(q.num)+'</code></td><td>'+esc(q.client)+'</td><td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(q.services||"—")+'</td><td class="mono"><strong>'+fmtEur(q.total||0)+'</strong></td><td><span class="badge badge--'+s+'">'+ucFirst(q.status||"borrador")+'</span></td><td class="mono" style="font-size:.7rem">'+esc(q.date||"—")+'</td><td class="mono" style="font-size:.7rem">'+esc(q.validUntil||"—")+'</td><td><div style="display:flex;gap:.25rem"><button class="btn-ghost btn-sm" onclick="window.p99PreviewQuote(\''+esc(q.num)+'\')">Ver PDF</button><button class="btn-ghost btn-sm" onclick="window.p99GenerateInvoice(\''+esc(q.num)+'\')" '+(q.status==="aceptado"?'':'style="display:none"')+'>Factura</button></div></td></tr>';}).join("");
  }
  function renderInvoicesTable(){
    const tbody=$("#invoices-tbody"); if(!tbody) return;
    if(S.invoices.length===0){tbody.innerHTML='<tr><td colspan="7" class="table-empty"><p>Sin facturas. Se generan al aceptar un presupuesto.</p></td></tr>';return;}
    tbody.innerHTML=S.invoices.map(inv=>{const s=inv.status==="pagada"?"success":inv.status==="vencida"?"error":"warning";return'<tr><td><code class="mono" style="font-size:.7rem;color:var(--accent)">'+esc(inv.num)+'</code></td><td>'+esc(inv.client)+'</td><td class="mono"><strong>'+fmtEur(inv.total||0)+'</strong></td><td><span class="badge badge--'+s+'">'+ucFirst(inv.status||"pendiente")+'</span></td><td class="mono" style="font-size:.7rem">'+esc(inv.date||"—")+'</td><td class="mono" style="font-size:.7rem">'+esc(inv.due||"—")+'</td><td><div style="display:flex;gap:.25rem"><button class="btn-ghost btn-sm" onclick="window.p99ViewInvoice(\''+esc(inv.num)+'\')">Ver</button><button class="btn-ghost btn-sm" onclick="window.p99ViewInvoice(\''+esc(inv.num)+'\')">PDF</button><button class="btn-ghost btn-sm" style="color:var(--error)" onclick="window.p99DeleteInvoice(\''+esc(inv.num)+'\')">Eliminar</button></div></td></tr>';}).join("");
  }

  /* ── Quote Modal ── */
  function initQuoteModal(){
    resetQuoteModal();
    const addRow=$("#add-service-row"); if(addRow) addRow.addEventListener("click",addServiceRow);
    const saveBtn=$("#save-quote-btn"); if(saveBtn) saveBtn.addEventListener("click",saveQuote);
    const prevBtn=$("#preview-quote-btn"); if(prevBtn) prevBtn.addEventListener("click",()=>{buildQuotePreview(null);openModal("modal-quote-preview");});
    const dlBtn=$("#download-quote-pdf-btn"); if(dlBtn) dlBtn.addEventListener("click",downloadCurrentQuotePDF);
  }
  function resetQuoteModal(){const list=$("#quote-services-list");if(!list)return;list.innerHTML="";addServiceRow();updateQuoteSummary();}
  function addServiceRow(){
    const list=$("#quote-services-list");if(!list)return;
    const row=document.createElement("div"); row.className="quote-service-row";
    const opts=D.services.map(s=>'<option value="'+s.base+'">'+esc(s.label)+'</option>').join("");
    row.innerHTML='<select class="svc-select">'+opts+'</select><input type="number" class="svc-hours" value="10" min="1"/><input type="number" class="svc-rate" value="150" min="0"/><input type="number" class="svc-total" value="1500" readonly style="background:var(--bg-2)"/><button class="remove-row-btn" onclick="this.closest(\'.quote-service-row\').remove();window.p99UpdateSummary()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    const sel=row.querySelector(".svc-select"),hrs=row.querySelector(".svc-hours"),rte=row.querySelector(".svc-rate"),tot=row.querySelector(".svc-total");
    function recalc(){tot.value=(parseFloat(hrs.value)||0)*(parseFloat(rte.value)||0);updateQuoteSummary();}
    sel.addEventListener("change",()=>{rte.value=sel.value;recalc();});
    hrs.addEventListener("input",recalc);rte.addEventListener("input",recalc);
    list.appendChild(row);updateQuoteSummary();
  }
  window.p99UpdateSummary=updateQuoteSummary;
  function updateQuoteSummary(){
    const rows=$$(".quote-service-row");
    const sub=rows.reduce((s,r)=>{const h=parseFloat(r.querySelector(".svc-hours")?.value)||0,rt=parseFloat(r.querySelector(".svc-rate")?.value)||0;return s+h*rt;},0);
    const cplx=parseFloat($("#q-complexity")?.value)||1,disc=parseFloat($("#q-discount")?.value)||0;
    const sub2=sub*cplx,discAmt=sub2*(disc/100),subDisc=sub2-discAmt,iva=subDisc*0.21,total=subDisc+iva;
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set("q-subtotal",fmtEurDec(sub2));set("q-disc-label","Descuento ("+disc+"%)");set("q-disc-amount","- "+fmtEurDec(discAmt));set("q-iva",fmtEurDec(iva));set("q-total",fmtEurDec(total));
    const dEl=document.getElementById("q-discount");if(dEl)dEl.addEventListener("input",updateQuoteSummary);
    const cEl=document.getElementById("q-complexity");if(cEl)cEl.addEventListener("change",updateQuoteSummary);
  }
  function saveQuote(){
    S.qCounter++;
    const num="PRE-"+new Date().getFullYear()+"-0"+S.qCounter;
    const totalStr=document.getElementById("q-total")?.textContent||"0";
    const total=parseFloat(totalStr.replace(/[^0-9,.]/g,"").replace(",","."))||0;
    const rows=$$(".quote-service-row");
    const svcNames=rows.map(r=>{const s=r.querySelector(".svc-select");return s?s.options[s.selectedIndex]?.text:"";}).filter(Boolean).join(", ");
    const q={num,client:$("#q-company")?.value||"Cliente",contact:$("#q-contact")?.value||"",email:$("#q-email")?.value||"",industry:$("#q-industry")?.value||"",description:$("#q-desc")?.value||"",services:svcNames,total,status:"borrador",date:new Date().toISOString().slice(0,10),validUntil:new Date(Date.now()+30*86400000).toISOString().slice(0,10),terms:$("#q-terms")?.value||"50% adelanto + 50% entrega",discount:parseFloat($("#q-discount")?.value)||0,complexity:parseFloat($("#q-complexity")?.value)||1,rows:rows.map(r=>({svc:r.querySelector(".svc-select")?.options[r.querySelector(".svc-select").selectedIndex]?.text||"",hours:r.querySelector(".svc-hours")?.value||0,rate:r.querySelector(".svc-rate")?.value||0,total:r.querySelector(".svc-total")?.value||0}))};
    S.quotes.push(q);persist("quotes",S.quotes);localStorage.setItem("p99-qcnt",String(S.qCounter));
    closeModal("modal-quote");renderQuotesTable();showToast("Presupuesto "+num+" guardado","success");
  }

  /* ── Quote Preview & PDF ── */
  window.p99PreviewQuote = function(num) {
    const q = S.quotes.find(q=>q.num===num)||null;
    buildQuotePreview(q); openModal("modal-quote-preview");
  };

  function buildQuotePreview(q) {
    const company=q?q.client:$("#q-company")?.value||"Cliente";
    const contact=q?q.contact:$("#q-contact")?.value||"";
    const email=q?q.email:$("#q-email")?.value||"";
    const desc=q?q.description:$("#q-desc")?.value||"";
    const industry=q?q.industry:$("#q-industry")?.value||"";
    const num=q?q.num:"PRE-"+new Date().getFullYear()+"-0"+(S.qCounter+1);
    const today=new Date().toLocaleDateString("es-ES");
    const valid=new Date(Date.now()+30*86400000).toLocaleDateString("es-ES");

    let rows=[],subtotal=0;
    if(q&&q.rows){
      q.rows.forEach(r=>{const t=+r.total||0;subtotal+=t;rows.push({svc:r.svc,hours:r.hours,rate:r.rate,total:t});});
    } else {
      $$(".quote-service-row").forEach(r=>{const s=r.querySelector(".svc-select");const svc=s?s.options[s.selectedIndex]?.text:"Servicio";const h=parseFloat(r.querySelector(".svc-hours")?.value)||0,rt=parseFloat(r.querySelector(".svc-rate")?.value)||0,t=h*rt;subtotal+=t;rows.push({svc,hours:h,rate:rt,total:t});});
    }

    const cplx=q?q.complexity:parseFloat($("#q-complexity")?.value)||1;
    const disc=q?q.discount:parseFloat($("#q-discount")?.value)||0;
    const terms=q?q.terms:$("#q-terms")?.value||"50% adelanto + 50% entrega";
    const sub2=subtotal*cplx,discAmt=sub2*disc/100,subDisc=sub2-discAmt,iva=subDisc*0.21,total=subDisc+iva;

    // Find service description
    const firstSvc = rows[0]?.svc||"";
    const svcKey = D.services.find(s=>firstSvc.includes(s.label.split(" ")[0]))?.id||"";
    const svcDesc = D.serviceDescriptions?.[svcKey];

    let benefitsHTML="";
    if(svcDesc){
      benefitsHTML=`<div class="quote-doc-section">
        <div class="quote-doc-section-title">Que incluye este servicio</div>
        <p style="font-size:.8rem;color:#444;margin-bottom:.625rem">${esc(svcDesc.what)}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.875rem;margin-bottom:.875rem">
          <div>
            <div class="quote-doc-section-title">Que gana con esto</div>
            ${svcDesc.gains.map(g=>'<div class="quote-doc-benefit-item">'+esc(g)+'</div>').join("")}
          </div>
          <div class="quote-doc-includes">
            <div class="quote-doc-section-title">Entregables</div>
            <ul>${svcDesc.includes.map(i=>'<li>'+esc(i)+'</li>').join("")}</ul>
          </div>
        </div>
        <div style="background:#fff3f3;border-left:3px solid #E5302A;padding:.5rem .75rem;border-radius:0 4px 4px 0;font-size:.775rem;color:#444;margin-bottom:.875rem">
          <strong style="color:#E5302A">Plazo estimado:</strong> ${esc(svcDesc.timeline)}
        </div>
      </div>`;
    }

    const tableRows=rows.map(r=>'<tr><td>'+esc(r.svc)+'</td><td style="text-align:right">'+esc(r.hours)+'h</td><td style="text-align:right">'+fmtEur(r.rate)+'/h</td><td style="text-align:right"><strong>'+fmtEur(r.total)+'</strong></td></tr>').join("");

    const body=$("#quote-preview-body"); if(!body) return;
    body.innerHTML=`<div class="quote-doc" id="quote-doc-content">
      <div class="quote-doc-header">
        <div>
          <div class="quote-doc-logo" data-editable data-edit-key="doc-logo">Project99</div>
          <div style="font-size:.725rem;color:#888;margin-top:.2rem" data-editable data-edit-key="doc-tagline">Agencia de Inteligencia Artificial</div>
        </div>
        <div class="quote-doc-meta">
          <strong>PRESUPUESTO</strong>
          <span>Ref: ${esc(num)}</span><br>
          <span>Fecha: ${today}</span><br>
          <span>Valido hasta: ${valid}</span>
        </div>
      </div>
      <div class="quote-doc-parties">
        <div class="quote-doc-party"><label>Emisor</label><p><strong data-editable data-edit-key="doc-emitter">Project99 Agencia IA</strong><br><span data-editable data-edit-key="doc-emitter-email">hola@project99.io</span><br><span data-editable data-edit-key="doc-emitter-loc">Madrid, Espana</span></p></div>
        <div class="quote-doc-party"><label>Cliente</label><p><strong>${esc(company)}</strong><br>${esc(contact)}<br>${esc(email)}<br><em style="font-size:.75rem;color:#888">${esc(industry)}</em></p></div>
      </div>
      ${desc?'<div style="margin-bottom:.875rem;padding:.625rem .875rem;background:#f5f5f5;border-radius:4px;font-size:.8rem;color:#555"><strong>Proyecto:</strong> '+esc(desc)+'</div>':""}
      ${benefitsHTML}
      <table class="quote-doc-table"><thead><tr><th>Descripcion del servicio</th><th style="text-align:right">Horas</th><th style="text-align:right">Tarifa</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${tableRows}</tbody></table>
      <div class="quote-doc-totals">
        <div class="quote-doc-total-row"><span>Subtotal</span><span>${fmtEur(sub2)}</span></div>
        ${disc>0?'<div class="quote-doc-total-row"><span>Descuento ('+disc+'%)</span><span style="color:#dc2626">-'+fmtEur(discAmt)+'</span></div>':""}
        <div class="quote-doc-total-row"><span>IVA (21%)</span><span>${fmtEur(iva)}</span></div>
        <div class="quote-doc-total-row final"><span>TOTAL</span><span>${fmtEur(total)}</span></div>
      </div>
      <div class="quote-doc-footer">
        <p><strong>Condiciones de pago:</strong> ${esc(terms)} &bull; Presupuesto valido 30 dias &bull; Precios + IVA</p>
        <p style="margin-top:.375rem">Para aceptar este presupuesto, responda a <strong data-editable data-edit-key="doc-reply-email">hola@project99.io</strong> indicando la referencia <strong>${esc(num)}</strong>.</p>
        <p style="margin-top:.375rem;color:#aaa">Este presupuesto no implica ninguna obligacion hasta su aceptacion formal por ambas partes.</p>
      </div>
    </div>`;
  }

  function downloadCurrentQuotePDF() {
    const content=document.getElementById("quote-doc-content");
    if(!content){showToast("Genera primero el presupuesto","info");return;}
    exportToPDF(content, "presupuesto");
  }

  /* ── Invoice view & delete ── */
  window.p99ViewInvoice = function(num) {
    const inv = S.invoices.find(i=>i.num===num); if(!inv) return;
    const modal=$("#modal-invoice-view"),title=$("#invoice-view-title"),body=$("#invoice-view-body"); if(!modal||!body) return;
    if(title) title.textContent = inv.num;
    const s=inv.status==="pagada"?"success":inv.status==="vencida"?"error":"warning";
    body.innerHTML=`<div class="invoice-doc" id="invoice-doc-content">
      <div class="quote-doc-header">
        <div><div class="quote-doc-logo">Project99</div><div style="font-size:.725rem;color:#888">Agencia de Inteligencia Artificial</div></div>
        <div class="quote-doc-meta"><strong>FACTURA</strong><span>Num: ${esc(inv.num)}</span><br><span>Fecha: ${esc(inv.date||"—")}</span><br><span>Vencimiento: ${esc(inv.due||"—")}</span></div>
      </div>
      <div class="quote-doc-parties">
        <div class="quote-doc-party"><label>Emisor</label><p><strong>Project99 Agencia IA</strong><br>hola@project99.io</p></div>
        <div class="quote-doc-party"><label>Facturado a</label><p><strong>${esc(inv.client)}</strong></p></div>
      </div>
      <table class="quote-doc-table"><thead><tr><th>Concepto</th><th style="text-align:right">Importe</th></tr></thead><tbody>
        <tr><td>${esc(inv.services||"Servicios profesionales de IA")}</td><td style="text-align:right"><strong>${fmtEur((inv.total||0)/1.21)}</strong></td></tr>
      </tbody></table>
      <div class="quote-doc-totals">
        <div class="quote-doc-total-row"><span>Base imponible</span><span>${fmtEur((inv.total||0)/1.21)}</span></div>
        <div class="quote-doc-total-row"><span>IVA (21%)</span><span>${fmtEur((inv.total||0)-((inv.total||0)/1.21))}</span></div>
        <div class="quote-doc-total-row final"><span>TOTAL</span><span>${fmtEur(inv.total||0)}</span></div>
      </div>
      <div class="quote-doc-footer" style="display:flex;align-items:center;justify-content:space-between">
        <span>Estado: <span class="badge badge--${s}">${ucFirst(inv.status||"pendiente")}</span></span>
        <span style="font-size:.7rem;color:#aaa">IBAN: <strong>ES00 0000 0000 0000 0000 0000</strong></span>
      </div>
    </div>`;
    modal.classList.remove("hidden");

    const dlBtn=$("#download-invoice-pdf-btn");
    if(dlBtn) dlBtn.onclick=()=>{ const c=document.getElementById("invoice-doc-content"); if(c) exportToPDF(c,"factura-"+inv.num); };
    const delBtn=$("#delete-invoice-btn");
    if(delBtn) delBtn.onclick=()=>window.p99DeleteInvoice(num);
  };

  window.p99DeleteInvoice = function(num) {
    if(!confirm("¿Eliminar factura "+num+"? Esta accion no se puede deshacer.")) return;
    persist("invoices", S.invoices.filter(i=>i.num!==num));
    closeModal("modal-invoice-view");
    renderInvoicesTable();
    showToast("Factura "+num+" eliminada","success");
  };

  window.p99GenerateInvoice = function(quoteNum) {
    const q=S.quotes.find(q=>q.num===quoteNum); if(!q) return;
    S.iCounter++;
    const num="FAC-"+new Date().getFullYear()+"-00"+S.iCounter;
    const inv={num,client:q.client,services:q.services||"Servicios IA",total:q.total||0,status:"pendiente",date:new Date().toISOString().slice(0,10),due:new Date(Date.now()+30*86400000).toISOString().slice(0,10)};
    S.invoices.push(inv);persist("invoices",S.invoices);localStorage.setItem("p99-icnt",String(S.iCounter));
    renderInvoicesTable();switchQuoteTab("invoices");showToast("Factura "+num+" generada","success");
  };

  /* ── PDF Export (html2canvas + jsPDF) ── */
  async function exportToPDF(element, filename) {
    if(!window.html2canvas||!window.jspdf){
      window.print();
      showToast("Imprimiendo — guarda como PDF desde el dialogo del navegador","info");
      return;
    }
    showToast("Generando PDF...","info");
    try {
      const canvas = await html2canvas(element, {
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: "#ffffff", logging: false
      });
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL("image/png");
      const imgH = (canvas.height * pdfW) / canvas.width;

      if(imgH <= pdfH) {
        pdf.addImage(imgData,"PNG",0,0,pdfW,imgH);
      } else {
        // Multi-page
        let y=0;
        while(y < imgH) {
          const sliceH = Math.min(pdfH, imgH-y);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = (sliceH/imgH)*canvas.height;
          const ctx = pageCanvas.getContext("2d");
          ctx.drawImage(canvas, 0, (y/imgH)*canvas.height, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
          if(y>0) pdf.addPage();
          pdf.addImage(pageCanvas.toDataURL("image/png"),"PNG",0,0,pdfW,sliceH);
          y+=pdfH;
        }
      }
      pdf.save(filename+"-"+new Date().toISOString().slice(0,10)+".pdf");
      showToast("PDF descargado correctamente","success");
    } catch(err) {
      console.warn("PDF error:", err);
      showToast("Error generando PDF. Prueba con Ctrl+P","error");
    }
  }

  /* ─── ACADEMY ────────────────────────────────────────────── */
  function initAcademy(){
    const grid=$("#academy-grid"); if(!grid||grid.children.length>0) return;
    grid.innerHTML=D.courses.map(c=>{const prog=S.courses[c.id]||0;return'<div class="academy-card" onclick="window.p99OpenCourse(\''+esc(c.id)+'\')" ><div class="academy-card-top" style="background:'+esc(c.color)+'"></div><div class="academy-card-body"><span class="academy-card-badge" style="background:'+esc(c.color)+'22;color:'+esc(c.color)+'">'+esc(c.badge)+'</span><div class="academy-card-title" data-editable data-edit-key="course-title-'+esc(c.id)+'">'+esc(c.title)+'</div><div class="academy-card-meta"><span>'+c.modules+' modulos</span><span>'+c.duration+'</span><span class="badge badge--neutral">'+esc(c.level)+'</span></div></div><div class="academy-card-footer"><span class="academy-card-price">'+esc(c.price)+'</span><div class="academy-progress">'+(prog>0?prog+"% completado":"Ver curso")+'<svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--border)" stroke-width="2.5"/>'+(prog>0?'<circle cx="12" cy="12" r="9" fill="none" stroke="'+esc(c.color)+'" stroke-width="2.5" stroke-dasharray="'+(56.5*prog/100)+' 56.5" stroke-linecap="round" transform="rotate(-90 12 12)"/>':"")+'</svg></div></div></div>';}).join("");
    applyEdits();
  }

  window.p99OpenCourse = function(id) {
    const c=D.courses.find(c=>c.id===id); if(!c) return;
    const modal=$("#modal-course-detail"),title=$("#course-detail-title"),badge=$("#course-detail-badge"),body=$("#course-detail-body");
    if(!modal||!body) return;
    if(title) title.textContent=c.title;
    if(badge) { badge.textContent=c.badge; badge.style.cssText="color:"+c.color+";background:"+c.color+"22;padding:.175rem .5rem;border-radius:3px"; }

    const buildVideoUrl=v=>{
      if(v.ytUrl) return v.ytUrl;
      if(v.ytId) return 'https://www.youtube.com/results?search_query='+encodeURIComponent(v.ytId);
      return '#';
    };
    const videosHTML=(c.videos||[]).map(v=>'<a href="'+buildVideoUrl(v)+'" target="_blank" rel="noopener noreferrer" class="course-video-item"><div class="course-video-play"><svg width="14" height="14" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="white"/></svg></div><div class="course-video-info"><div class="course-video-title">'+esc(v.title)+'</div><div class="course-video-duration">'+esc(v.duration)+' &bull; <span style="color:#FF0000;font-weight:700">YouTube</span></div></div><span style="font-size:.65rem;color:var(--text-mute);white-space:nowrap;flex-shrink:0">Buscar →</span></a>').join("");
    const stepsHTML=(c.steps||[]).map((step,i)=>'<div class="course-step"><span class="course-step-num">'+String(i+1).padStart(2,"0")+'</span><span>'+esc(step)+'</span></div>').join("");
    const toolsHTML=(c.tools||[]).map(t=>'<span class="course-tool-tag">'+esc(t)+'</span>').join("");

    body.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
      <div>
        <div class="course-meta-row">
          <span class="course-meta-chip">${c.modules} modulos</span>
          <span class="course-meta-chip">${c.duration}</span>
          <span class="course-meta-chip">${esc(c.level)}</span>
          <span class="course-meta-chip" style="color:var(--success)">${esc(c.price)}</span>
        </div>
        <p style="font-size:.8rem;color:var(--text-mute);margin-bottom:.875rem">${esc(c.description||"")}</p>
        <div class="prompt-section-title">Herramientas que aprenderas</div>
        <div class="course-tools-row" style="margin-bottom:1rem">${toolsHTML}</div>
        <div class="prompt-section-title">Videos del curso (YouTube)</div>
        <div class="course-videos-list">${videosHTML}</div>
      </div>
      <div>
        <div class="prompt-section-title">Objetivo del curso</div>
        <p style="font-size:.8rem;color:var(--text-mute);margin-bottom:.875rem;background:var(--accent-soft);border-left:3px solid var(--accent);padding:.5rem .75rem;border-radius:0 var(--r-sm) var(--r-sm) 0">${esc(c.objective||"")}</p>
        <div class="prompt-section-title">Pasos para dominar este tema</div>
        <div class="course-steps-grid">${stepsHTML}</div>
        <div style="margin-top:1rem;padding:.75rem;background:var(--bg-2);border-radius:var(--r-sm);font-size:.775rem;border:1px solid var(--border)">
          <strong style="color:var(--accent)">Tip profesional</strong><br>
          <span style="color:var(--text-mute)">Cuando domines este tema, documenta un caso real de cliente. Ese caso study vale mas que 10 cursos para conseguir el siguiente cliente.</span>
        </div>
      </div>
    </div>`;

    // Mark progress
    S.courses[id]=Math.min(100,(S.courses[id]||0)+10);
    persist("courses",S.courses);
    modal.classList.remove("hidden");
  };

  /* ─── PORTFOLIO ──────────────────────────────────────────── */
  const PORTFOLIO_COLORS = ["#E5302A","#AA1818","#7C3AED","#2563EB","#059669","#D97706","#DB2777","#0891B2"];

  function initPortfolio(){
    renderPortfolioGrid();
    const nb=document.getElementById("new-case-study-btn");
    if(nb) nb.onclick=()=>openCSModal(null);
    const sb=document.getElementById("save-cs-btn");
    if(sb) sb.onclick=saveCS;
    const db=document.getElementById("delete-cs-btn");
    if(db) db.onclick=()=>{ const id=document.getElementById("cs-edit-id")?.value; if(id) deleteCS(id); };
  }

  function renderPortfolioGrid(){
    const grid=document.getElementById("portfolio-grid"); if(!grid) return;
    if(!S.portfolio.length){
      grid.innerHTML=emptyState(svgIcon("image"),"Portfolio vacio","Documenta aqui tus proyectos completados. Cada case study con metricas reales te ayuda a cerrar el siguiente cliente.",
        '<button class="btn-primary" onclick="document.getElementById(\'new-case-study-btn\').click()">+ Anadir primer case study</button>');
      return;
    }
    const cards=S.portfolio.map((p,i)=>{
      const color=PORTFOLIO_COLORS[i%PORTFOLIO_COLORS.length];
      return`<div class="portfolio-card" onclick="window.p99OpenCS('${esc(p.id)}')">
        <div class="portfolio-card-banner" style="background:linear-gradient(90deg,${color},${color}99)"></div>
        <div class="portfolio-card-body">
          <div class="portfolio-card-service">${esc(p.service||"Proyecto")}</div>
          <div class="portfolio-card-title">${esc(p.title)}</div>
          <div class="portfolio-card-client">${esc(p.client||"")}${p.sector?" · "+esc(p.sector):""}</div>
          ${p.result?`<div class="portfolio-card-result">${esc(p.result)}</div>`:""}
          <div class="portfolio-card-footer">
            <span class="portfolio-card-value">${p.value?fmtEur(p.value):"—"}</span>
            <span class="portfolio-card-tech">${esc((p.tech||"").split(",").slice(0,2).join(", "))}</span>
          </div>
        </div>
      </div>`;
    }).join("");
    const addBtn=`<div class="portfolio-add-card" onclick="document.getElementById('new-case-study-btn').click()">
      ${svgIcon("image")}
      <span>+ Anadir case study</span>
    </div>`;
    grid.innerHTML=cards+addBtn;
  }

  function openCSModal(id){
    const delBtn=document.getElementById("delete-cs-btn");
    const titleEl=document.getElementById("cs-modal-title");
    const fields=["cs-title","cs-client","cs-sector","cs-service","cs-desc","cs-result","cs-tech","cs-value","cs-duration","cs-link","cs-testimonial"];
    fields.forEach(f=>{ const el=document.getElementById(f); if(el) el.value=""; });
    document.getElementById("cs-edit-id").value="";
    if(id){
      const p=S.portfolio.find(p=>p.id===id); if(!p) return;
      if(titleEl) titleEl.textContent="Editar case study";
      document.getElementById("cs-edit-id").value=id;
      document.getElementById("cs-title").value=p.title||"";
      document.getElementById("cs-client").value=p.client||"";
      document.getElementById("cs-sector").value=p.sector||"";
      document.getElementById("cs-service").value=p.service||"";
      document.getElementById("cs-desc").value=p.desc||"";
      document.getElementById("cs-result").value=p.result||"";
      document.getElementById("cs-tech").value=p.tech||"";
      document.getElementById("cs-value").value=p.value||"";
      document.getElementById("cs-duration").value=p.duration||"";
      document.getElementById("cs-link").value=p.link||"";
      document.getElementById("cs-testimonial").value=p.testimonial||"";
      if(delBtn) delBtn.style.display="";
    } else {
      if(titleEl) titleEl.textContent="Nuevo case study";
      if(delBtn) delBtn.style.display="none";
    }
    openModal("modal-case-study");
  }

  function saveCS(){
    const title=document.getElementById("cs-title")?.value?.trim();
    if(!title){ showToast("Escribe un nombre para el proyecto","info"); return; }
    const editId=document.getElementById("cs-edit-id")?.value;
    const cs={
      id: editId||("cs"+Date.now()),
      title,
      client:      document.getElementById("cs-client")?.value||"",
      sector:      document.getElementById("cs-sector")?.value||"",
      service:     document.getElementById("cs-service")?.value||"",
      desc:        document.getElementById("cs-desc")?.value||"",
      result:      document.getElementById("cs-result")?.value||"",
      tech:        document.getElementById("cs-tech")?.value||"",
      value:       parseFloat(document.getElementById("cs-value")?.value)||0,
      duration:    document.getElementById("cs-duration")?.value||"",
      link:        document.getElementById("cs-link")?.value||"",
      testimonial: document.getElementById("cs-testimonial")?.value||"",
      createdAt:   new Date().toISOString().slice(0,10)
    };
    if(editId){ const idx=S.portfolio.findIndex(p=>p.id===editId); if(idx>=0) S.portfolio[idx]=cs; else S.portfolio.push(cs); }
    else S.portfolio.push(cs);
    persist("portfolio",S.portfolio);
    closeModal("modal-case-study"); closeModal("modal-cs-detail");
    renderPortfolioGrid();
    showToast(editId?"Case study actualizado":"Case study guardado","success");
  }

  function deleteCS(id){
    if(!confirm("¿Eliminar este case study?")) return;
    persist("portfolio",S.portfolio.filter(p=>p.id!==id));
    closeModal("modal-case-study"); closeModal("modal-cs-detail");
    renderPortfolioGrid();
    showToast("Case study eliminado","success");
  }

  window.p99OpenCS = function(id){
    const p=S.portfolio.find(p=>p.id===id); if(!p) return;
    const modal=document.getElementById("modal-cs-detail");
    const body=document.getElementById("cs-detail-body");
    if(!modal||!body) return;
    const t=document.getElementById("cs-detail-title"); if(t) t.textContent=p.title;
    const s=document.getElementById("cs-detail-service"); if(s) s.textContent=p.service||"Proyecto";
    body.innerHTML=`
      <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:1.125rem;padding-bottom:.875rem;border-bottom:1px solid var(--border)">
        ${p.client?`<span class="badge badge--neutral">${esc(p.client)}</span>`:""}
        ${p.sector?`<span class="badge badge--neutral">${esc(p.sector)}</span>`:""}
        ${p.duration?`<span class="badge badge--neutral">⏱ ${esc(p.duration)}</span>`:""}
        ${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener" class="btn-ghost btn-sm" style="font-size:.7rem">Ver proyecto ↗</a>`:""}
      </div>
      <div class="cs-detail-grid">
        <div>
          ${p.result?`<div class="cs-detail-stat" style="border-color:rgba(34,197,94,.3);margin-bottom:.75rem"><div class="cs-detail-stat-label">Resultado principal</div><div class="cs-detail-stat-val" style="color:var(--success)">↑ ${esc(p.result)}</div></div>`:""}
          ${p.value?`<div class="cs-detail-stat" style="margin-bottom:.75rem"><div class="cs-detail-stat-label">Valor del proyecto</div><div class="cs-detail-stat-val">${fmtEur(p.value)}</div></div>`:""}
          ${p.tech?`<div class="cs-detail-stat"><div class="cs-detail-stat-label">Tecnologias</div><div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.3rem">${p.tech.split(",").map(t=>`<span class="course-tool-tag">${esc(t.trim())}</span>`).join("")}</div></div>`:""}
        </div>
        <div>
          ${p.desc?`<div class="prompt-section-title">Descripcion del proyecto</div><p style="font-size:.825rem;color:var(--text-mute);line-height:1.7;margin-bottom:.875rem">${esc(p.desc)}</p>`:""}
        </div>
      </div>
      ${p.testimonial?`<div class="cs-testimonial">${esc(p.testimonial)}</div>`:""}
    `;
    const editBtn=document.getElementById("cs-detail-edit");
    const delBtn=document.getElementById("cs-detail-delete");
    if(editBtn) editBtn.onclick=()=>{ closeModal("modal-cs-detail"); openCSModal(id); };
    if(delBtn) delBtn.onclick=()=>deleteCS(id);
    modal.classList.remove("hidden");
  };

  /* ─── RESOURCES ──────────────────────────────────────────── */
  function initResources(){
    renderPrompts();renderComponents();renderEmailTemplates();renderPricingTable();initResourcesTabs();
  }
  function initResourcesTabs(){
    $$(".resources-tabs .tab-btn").forEach(btn=>btn.addEventListener("click",()=>{$$(".resources-tabs .tab-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");$$(".res-panel").forEach(p=>p.classList.add("hidden"));const p=document.getElementById("res-"+btn.dataset.rtab);if(p)p.classList.remove("hidden");}));
  }
  function renderPrompts(){
    const grid=$("#prompts-grid"); if(!grid||grid.children.length>0) return;
    grid.innerHTML=D.prompts.map(p=>'<div class="prompt-card"><div class="prompt-card-cat">'+esc(p.category)+'</div><div class="prompt-card-title">'+esc(p.title)+'</div><p style="font-size:.725rem;color:var(--text-mute)">'+esc(p.desc)+'</p><div class="prompt-card-footer"><span class="prompt-card-uses" style="font-size:.65rem;color:var(--text-mute)">'+esc(p.app||"")+'</span><div style="display:flex;gap:.3rem"><button class="btn-ghost btn-sm" onclick="window.p99OpenPrompt(\''+esc(p.id)+'\')">Ver guia</button><button class="btn-ghost btn-sm" onclick="window.p99CopyPrompt(\''+esc(p.id)+'\')">Copiar</button></div></div></div>').join("");
  }

  function renderComponents(){
    const list=document.getElementById("components-list"); if(!list||!D.components) return;
    list.innerHTML=D.components.map(c=>'<div class="resource-item"><div class="resource-icon">'+esc(c.icon)+'</div><div><strong>'+esc(c.title)+'</strong><p>'+esc(c.desc)+'</p><span style="font-size:.65rem;color:var(--text-mute)">'+esc(c.app)+'</span></div><div style="display:flex;gap:.3rem;flex-shrink:0"><button class="btn-ghost btn-sm" onclick="window.p99OpenComponent(\''+esc(c.id)+'\')">Ver guia</button><button class="btn-ghost btn-sm" onclick="window.p99CopyComponent(\''+esc(c.id)+'\')">Copiar</button></div></div>').join("");
  }

  function renderEmailTemplates(){
    const list=document.getElementById("emails-list"); if(!list||!D.emailTemplates) return;
    list.innerHTML=D.emailTemplates.map(e=>'<div class="resource-item"><div class="resource-icon">'+esc(e.icon)+'</div><div><strong>'+esc(e.title)+'</strong><p>'+esc(e.desc)+'</p><span style="font-size:.65rem;color:var(--text-mute)">'+esc(e.app)+'</span></div><div style="display:flex;gap:.3rem;flex-shrink:0"><button class="btn-ghost btn-sm" onclick="window.p99OpenEmail(\''+esc(e.id)+'\')">Ver guia</button><button class="btn-ghost btn-sm" onclick="window.p99CopyEmail(\''+esc(e.id)+'\')">Copiar</button></div></div>').join("");
  }

  window.p99OpenComponent = function(id){
    const c=D.components&&D.components.find(c=>c.id===id); if(!c) return;
    const modal=$("#modal-prompt-detail"),title=$("#prompt-detail-title"),cat=$("#prompt-detail-cat"),body=$("#prompt-detail-body");
    if(!modal||!body) return;
    if(title) title.textContent=c.title;
    if(cat) { cat.textContent="Componente"; cat.style.color="var(--accent)"; }
    const stepsHTML=(c.steps||[]).map((s,i)=>'<li class="prompt-step"><span class="prompt-step-num">'+(i+1)+'</span><span>'+esc(s)+'</span></li>').join("");
    body.innerHTML=`
      <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;padding-bottom:.875rem;border-bottom:1px solid var(--border)">
        <span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-mute)">Herramientas:</span>
        <strong style="font-size:.775rem;color:var(--text)">${esc(c.app||"")}</strong>
      </div>
      <p style="font-size:.825rem;color:var(--text-mute);margin-bottom:1.25rem;line-height:1.6">${esc(c.desc||"")}</p>
      <div class="prompt-detail-grid">
        <div>
          <div class="prompt-section-title">Pasos para implementar</div>
          <ol class="prompt-steps-list">${stepsHTML}</ol>
        </div>
        <div>
          <div class="prompt-section-title">Codigo listo para copiar</div>
          <div class="prompt-box" style="white-space:pre;overflow-x:auto;font-size:.7rem;line-height:1.6">${esc(c.code||"Codigo no disponible")}</div>
          <button onclick="window.p99CopyComponent('${esc(id)}')" style="margin-top:.625rem;width:100%;padding:.65rem;background:var(--accent);color:#fff;border:none;border-radius:var(--r-sm);font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.4rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar codigo completo
          </button>
        </div>
      </div>`;
    modal.classList.remove("hidden");
  };
  window.p99CopyComponent = function(id){
    const c=D.components&&D.components.find(c=>c.id===id); if(!c) return;
    const text=c.code||"";
    if(navigator.clipboard) navigator.clipboard.writeText(text).then(()=>showToast("Codigo copiado al portapapeles","success"));
    else { const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);showToast("Codigo copiado","success"); }
  };

  window.p99OpenEmail = function(id){
    const e=D.emailTemplates&&D.emailTemplates.find(e=>e.id===id); if(!e) return;
    const modal=$("#modal-prompt-detail"),title=$("#prompt-detail-title"),cat=$("#prompt-detail-cat"),body=$("#prompt-detail-body");
    if(!modal||!body) return;
    if(title) title.textContent=e.title;
    if(cat) { cat.textContent="Email Template"; cat.style.color="var(--accent)"; }
    const stepsHTML=(e.steps||[]).map((s,i)=>'<li class="prompt-step"><span class="prompt-step-num">'+(i+1)+'</span><span>'+esc(s)+'</span></li>').join("");
    body.innerHTML=`
      <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;padding-bottom:.875rem;border-bottom:1px solid var(--border)">
        <span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-mute)">Herramientas:</span>
        <strong style="font-size:.775rem;color:var(--text)">${esc(e.app||"")}</strong>
      </div>
      <p style="font-size:.825rem;color:var(--text-mute);margin-bottom:1.25rem;line-height:1.6">${esc(e.desc||"")}</p>
      <div class="prompt-detail-grid">
        <div>
          <div class="prompt-section-title">Pasos para usar esta plantilla</div>
          <ol class="prompt-steps-list">${stepsHTML}</ol>
        </div>
        <div>
          <div class="prompt-section-title">Plantilla lista para copiar</div>
          <div class="prompt-box" style="white-space:pre-wrap;font-size:.775rem;line-height:1.75">${esc(e.code||"Plantilla no disponible")}</div>
          <button onclick="window.p99CopyEmail('${esc(id)}')" style="margin-top:.625rem;width:100%;padding:.65rem;background:var(--accent);color:#fff;border:none;border-radius:var(--r-sm);font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.4rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar plantilla completa
          </button>
        </div>
      </div>`;
    modal.classList.remove("hidden");
  };
  window.p99CopyEmail = function(id){
    const e=D.emailTemplates&&D.emailTemplates.find(e=>e.id===id); if(!e) return;
    const text=e.code||"";
    if(navigator.clipboard) navigator.clipboard.writeText(text).then(()=>showToast("Plantilla copiada al portapapeles","success"));
    else { const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);showToast("Plantilla copiada","success"); }
  };

  window.p99OpenPrompt = function(id) {
    const p=D.prompts.find(p=>p.id===id); if(!p) return;
    const modal=$("#modal-prompt-detail"),title=$("#prompt-detail-title"),cat=$("#prompt-detail-cat"),body=$("#prompt-detail-body");
    if(!modal||!body) return;
    if(title) title.textContent=p.title;
    if(cat) cat.textContent=p.category;

    const stepsHTML=(p.steps||[]).map((s,i)=>'<li class="prompt-step"><span class="prompt-step-num">'+(i+1)+'</span><span>'+esc(s)+'</span></li>').join("");
    body.innerHTML=`
      <div style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem;padding-bottom:.875rem;border-bottom:1px solid var(--border)">
        <span style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-mute)">Herramientas:</span>
        <strong style="font-size:.775rem;color:var(--text)">${esc(p.app||"")}</strong>
        <span style="margin-left:auto;font-size:.7rem;color:var(--text-mute)">${esc(p.category)}</span>
      </div>
      <p style="font-size:.825rem;color:var(--text-mute);margin-bottom:1.25rem;line-height:1.6">${esc(p.desc||"")}</p>
      <div class="prompt-detail-grid">
        <div>
          <div class="prompt-section-title">Pasos para ejecutar este proceso</div>
          <ol class="prompt-steps-list">${stepsHTML}</ol>
        </div>
        <div>
          <div class="prompt-section-title">Prompt listo para copiar</div>
          <div class="prompt-box">${esc(p.prompt||"Prompt no disponible")}</div>
          <button class="copy-prompt-full-btn" onclick="window.p99CopyPrompt('${esc(id)}')" style="margin-top:.625rem;width:100%;padding:.65rem;background:var(--accent);color:#fff;border:none;border-radius:var(--r-sm);font-weight:700;font-size:.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.4rem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar prompt completo
          </button>
        </div>
      </div>`;
    modal.classList.remove("hidden");
  };

  window.p99CopyPrompt = function(id) {
    const p=D.prompts.find(p=>p.id===id); if(!p) return;
    const text=p.prompt||"";
    if(navigator.clipboard) navigator.clipboard.writeText(text).then(()=>showToast("Prompt copiado al portapapeles","success"));
    else { const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);showToast("Prompt copiado","success"); }
  };

  function renderPricingTable(){
    const tbody=$("#pricing-tbody"); if(!tbody) return;
    tbody.innerHTML=D.services.map(s=>'<tr><td data-editable data-edit-key="svc-name-'+esc(s.id)+'">'+esc(s.label)+'</td><td class="mono" data-editable data-edit-key="svc-base-'+esc(s.id)+'">'+fmtEur(s.base)+'</td><td class="mono">'+fmtEur(s.base*2.5)+'</td><td>55%</td><td>'+esc(s.unit)+'</td></tr>').join("");
  }

  /* ─── INTEGRATIONS ───────────────────────────────────────── */
  function initIntegrations(){renderToolsGrid();renderAIModelsGrid();}
  function renderToolsGrid(){
    const grid=$("#integrations-grid"); if(!grid||grid.children.length>0) return;
    grid.innerHTML=D.integrations.map(i=>{const isOn=i.status==="connected"||S.toolKeys[i.id];return'<div class="integration-card"><div class="integration-icon">'+esc(i.icon)+'</div><div class="integration-name">'+esc(i.name)+'</div><div class="integration-cat">'+esc(i.category)+'</div><div class="integration-status integration-status--'+(isOn?"connected":"disconnected")+'"><div class="integration-status-dot integration-status-dot--'+(isOn?"on":"off")+'"></div>'+(isOn?"Conectado":"Desconectado")+'</div><button class="btn-ghost btn-sm" style="margin-top:.25rem" onclick="window.p99ConfigTool(\''+esc(i.id)+'\')">'+( isOn?"Configurar":"Conectar")+'</button></div>';}).join("");
  }
  window.p99ConfigTool = function(id){const tool=D.integrations.find(i=>i.id===id);showToast((tool?"Configurando "+tool.name:"Configurando")+" — introduce tu API key en Ajustes > API Keys","info");};
  function renderAIModelsGrid(){
    const container=document.getElementById("ai-models-section"); if(!container) return;
    const frontier=D.aiModels.filter(m=>m.category==="Frontier");
    const others=D.aiModels.filter(m=>m.category!=="Frontier");
    container.innerHTML='<div class="ai-section-divider"><span>Frontier Models</span></div><div class="ai-models-grid">'+frontier.map(m=>renderAIModelCard(m)).join("")+'</div><div class="ai-section-divider" style="margin-top:1.5rem"><span>Open Source / Otros</span></div><div class="ai-models-grid">'+others.map(m=>renderAIModelCard(m)).join("")+'</div>';
  }
  function renderAIModelCard(m){
    const savedKey=S.aiKeys[m.id]||"",savedModel=S.aiModels[m.id]||m.defaultModel,isConnected=savedKey.length>8;
    const modelOpts=m.models.map(mdl=>'<option value="'+esc(mdl)+'"'+(mdl===savedModel?" selected":"")+'>'+esc(mdl)+'</option>').join("");
    return'<div class="ai-model-card '+(isConnected?"connected":"")+'" id="ai-card-'+esc(m.id)+'"><div class="ai-model-header"><div class="ai-model-identity"><div class="ai-model-icon" style="color:'+esc(m.color)+'">'+esc(m.icon)+'</div><div><div class="ai-model-name">'+esc(m.name)+'</div><div class="ai-model-provider">'+esc(m.provider)+'</div></div></div><span class="ai-model-category-tag">'+esc(m.category)+'</span></div><div class="form-group" style="margin-bottom:.625rem"><label style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-mute);font-family:var(--mono)">API Key</label><div class="ai-model-key-row"><input type="password" id="ai-key-'+esc(m.id)+'" placeholder="'+esc(m.keyPlaceholder)+'" value="'+(savedKey?"••••••••••••":"")+'"/><button class="btn-ghost btn-sm" onclick="window.p99ToggleKey(\''+esc(m.id)+'\')">Ver</button></div></div><div class="ai-model-select"><label style="font-size:.7rem;color:var(--text-mute)">Modelo:</label><select id="ai-model-sel-'+esc(m.id)+'">'+modelOpts+'</select></div><div class="ai-model-footer"><div class="ai-model-status ai-model-status--'+(isConnected?"connected":"disconnected")+'"><div class="ai-model-status-dot ai-model-status-dot--'+(isConnected?"on":"off")+'"></div>'+(isConnected?"Conectado":"Sin configurar")+'</div><div class="ai-model-actions"><button class="btn-ghost btn-sm" onclick="window.p99TestAI(\''+esc(m.id)+'\')">Probar</button><button class="btn-primary btn-sm" onclick="window.p99SaveAI(\''+esc(m.id)+'\')">Guardar</button></div></div></div>';
  }
  window.p99ToggleKey=function(id){const input=document.getElementById("ai-key-"+id);if(input)input.type=input.type==="password"?"text":"password";};
  window.p99SaveAI=function(id){const ki=document.getElementById("ai-key-"+id),mi=document.getElementById("ai-model-sel-"+id);if(!ki)return;const kv=ki.value;if(!kv||kv==="••••••••••••"){showToast("Introduce una API key valida","info");return;}S.aiKeys[id]=kv;S.aiModels[id]=mi?.value||"";persist("aikeys",S.aiKeys);persist("aimodels",S.aiModels);const card=document.getElementById("ai-card-"+id);if(card){const m=D.aiModels.find(m=>m.id===id);if(m){const div=document.createElement("div");div.innerHTML=renderAIModelCard(m);card.replaceWith(div.firstChild);}}showToast("API Key de "+id+" guardada","success");};
  window.p99TestAI=function(id){const ki=document.getElementById("ai-key-"+id);const key=ki?.value||S.aiKeys[id]||"";if(!key||key==="••••••••••••"){showToast("Introduce primero la API key","info");return;}const statusEl=document.querySelector("#ai-card-"+id+" .ai-model-status");if(statusEl){statusEl.className="ai-model-status";statusEl.innerHTML='<div class="ai-model-status-dot ai-model-status-dot--wait" style="background:var(--warning)"></div>Probando...';}setTimeout(()=>{const ok=key.length>8;if(statusEl){statusEl.className="ai-model-status ai-model-status--"+(ok?"connected":"disconnected");statusEl.innerHTML='<div class="ai-model-status-dot ai-model-status-dot--'+(ok?"on":"off")+'"></div>'+(ok?"Conexion OK":"Key invalida");}showToast(ok?"Conexion con "+id+" OK":"Error: key invalida para "+id,ok?"success":"error");},1500);};

  /* ─── TASKS ──────────────────────────────────────────────── */
  let taskCalYear = new Date().getFullYear();
  let taskCalMonth = new Date().getMonth();
  let taskCalSelectedDate = new Date().toISOString().slice(0,10);
  let taskActiveFilter = "all";
  let taskEditingId = null;

  const TASK_PRIORITY = { alta:{color:"#EF4444",label:"Alta"}, media:{color:"#EAB308",label:"Media"}, baja:{color:"#22C55E",label:"Baja"} };
  const TASK_STATUS   = { pendiente:{label:"Pendiente",color:"#444"}, "en-proceso":{label:"En proceso",color:"#EAB308"}, revision:{label:"Revision",color:"#888"}, completada:{label:"Completada",color:"#22C55E"} };

  function initTasks(){
    renderTaskStats();
    renderTaskList("all","","");
    initTaskListeners();
    updateTasksBadge();
  }

  function updateTasksBadge(){
    const badge=document.getElementById("tasks-nav-badge");
    if(!badge) return;
    const pending=S.tasks.filter(t=>t.status!=="completada").length;
    badge.textContent=pending; badge.style.display=pending>0?"":"none";
  }

  function renderTaskStats(){
    const el=document.getElementById("task-stats-row"); if(!el) return;
    const total=S.tasks.length;
    const done=S.tasks.filter(t=>t.status==="completada").length;
    const inprog=S.tasks.filter(t=>t.status==="en-proceso").length;
    const today=new Date().toISOString().slice(0,10);
    const overdue=S.tasks.filter(t=>t.status!=="completada"&&t.dueDate&&t.dueDate<today).length;
    const chips=[
      {label:"Total tareas",num:total,color:"var(--accent)",bg:"var(--accent-soft)",icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/></svg>'},
      {label:"Completadas",num:done,color:"var(--success)",bg:"var(--success-bg)",icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'},
      {label:"En proceso",num:inprog,color:"var(--warning)",bg:"var(--warning-bg)",icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'},
      {label:"Vencidas",num:overdue,color:overdue>0?"var(--error)":"var(--text-dim)",bg:overdue>0?"var(--error-bg)":"var(--bg-2)",icon:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'}
    ];
    el.innerHTML=chips.map(c=>`<div class="task-stat-chip"><div class="task-stat-chip-icon" style="background:${c.bg};color:${c.color}">${c.icon}</div><div><div class="task-stat-chip-num" style="color:${c.color}">${c.num}</div><div class="task-stat-chip-label">${c.label}</div></div></div>`).join("");
  }

  function getFilteredTasks(filter, priority, search){
    const today=new Date().toISOString().slice(0,10);
    const endOfWeek=new Date(); endOfWeek.setDate(endOfWeek.getDate()+(7-endOfWeek.getDay())); const eow=endOfWeek.toISOString().slice(0,10);
    return S.tasks.filter(t=>{
      if(priority && t.priority!==priority) return false;
      if(search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.project||"").toLowerCase().includes(search.toLowerCase())) return false;
      if(filter==="today")   return t.dueDate===today && t.status!=="completada";
      if(filter==="week")    return t.dueDate>=today && t.dueDate<=eow && t.status!=="completada";
      if(filter==="overdue") return t.dueDate && t.dueDate<today && t.status!=="completada";
      if(filter==="done")    return t.status==="completada";
      return true; // all
    });
  }

  function renderTaskList(filter, priority, search){
    const body=document.getElementById("task-list-body"); if(!body) return;
    const tasks=getFilteredTasks(filter||taskActiveFilter, priority||"", search||"");
    if(!tasks.length){
      body.innerHTML='<div class="empty-state" style="padding:3rem 1rem">'+svgIcon("activity")+'<h3 style="margin-top:.75rem">Sin tareas</h3><p>'+
        (filter==="overdue"?"Todo al dia — sin tareas vencidas":"No hay tareas con estos filtros")+'</p>'+
        '<div class="empty-state-actions"><button class="btn-primary" onclick="document.getElementById(\'new-task-btn\').click()">+ Nueva tarea</button></div></div>';
      return;
    }
    // Group by sections
    const today=new Date().toISOString().slice(0,10);
    const sections=[
      {key:"overdue", label:"🔴 Vencidas", items:tasks.filter(t=>t.dueDate&&t.dueDate<today&&t.status!=="completada")},
      {key:"today",   label:"📅 Hoy",      items:tasks.filter(t=>t.dueDate===today&&t.status!=="completada")},
      {key:"soon",    label:"📌 Proximas", items:tasks.filter(t=>(!t.dueDate||t.dueDate>today)&&t.status!=="completada")},
      {key:"done",    label:"✅ Completadas",items:tasks.filter(t=>t.status==="completada")}
    ];
    if(filter==="done") { body.innerHTML=renderTaskSection({key:"done",label:"✅ Completadas",items:tasks}); return; }
    body.innerHTML=sections.filter(s=>s.items.length).map(s=>renderTaskSection(s)).join("");
  }

  function renderTaskSection(s){
    if(!s.items.length) return "";
    return`<div class="task-group">
      <div class="task-group-header">${s.label}<span class="task-group-count">${s.items.length}</span></div>
      ${s.items.map(t=>renderTaskRow(t)).join("")}
    </div>`;
  }

  function renderTaskRow(t){
    const today=new Date().toISOString().slice(0,10);
    const isDone=t.status==="completada";
    const p=TASK_PRIORITY[t.priority]||{color:"#888",label:t.priority};
    let dueCls="",dueLabel="";
    if(t.dueDate){
      const d=new Date(t.dueDate+"T00:00:00"); const diff=Math.round((d-new Date())/(86400000));
      if(isDone) dueLabel=t.dueDate;
      else if(diff<0){ dueCls="overdue"; dueLabel="Vencida hace "+(Math.abs(diff))+"d"; }
      else if(diff===0){ dueCls="today"; dueLabel="Hoy"; }
      else if(diff<=3){ dueCls="soon"; dueLabel="En "+diff+"d"; }
      else dueLabel=new Date(t.dueDate+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"});
    }
    return`<div class="task-item-row ${isDone?"done":""}" onclick="window.p99OpenTask('${esc(t.id)}')">
      <button class="task-check ${isDone?"checked":""}" onclick="event.stopPropagation();window.p99ToggleTask('${esc(t.id)}')"></button>
      <div class="task-item-body">
        <div style="display:flex;align-items:center;gap:.45rem">
          <div class="task-priority-dot" style="background:${p.color}"></div>
          <div class="task-item-title">${esc(t.title)}</div>
        </div>
        ${t.desc?`<div class="task-item-desc">${esc(t.desc)}</div>`:""}
        <div class="task-item-meta">
          ${t.project?`<span class="task-project-tag">${esc(t.project)}</span>`:""}
          ${dueLabel?`<span class="task-due-badge ${dueCls}">${dueLabel}</span>`:""}
          <span class="badge" style="background:${(TASK_STATUS[t.status]||{color:"#444"}).color}22;color:${(TASK_STATUS[t.status]||{color:"#888"}).color};font-size:.58rem;padding:.1rem .4rem">${(TASK_STATUS[t.status]||{label:t.status}).label}</span>
        </div>
      </div>
      <div class="task-item-actions">
        <button class="btn-ghost btn-sm" style="font-size:.65rem" onclick="event.stopPropagation();window.p99OpenTask('${esc(t.id)}')">Editar</button>
        <button class="btn-ghost btn-sm" style="font-size:.65rem;color:var(--error)" onclick="event.stopPropagation();window.p99DeleteTask('${esc(t.id)}')">✕</button>
      </div>
    </div>`;
  }

  function initTaskListeners(){
    // View switcher
    $$(".task-view-btn").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".task-view-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active");
      const v=btn.dataset.tview;
      document.getElementById("task-list-view").classList.toggle("hidden",v!=="list");
      document.getElementById("task-calendar-view").classList.toggle("hidden",v!=="calendar");
      document.getElementById("task-board-view").classList.toggle("hidden",v!=="board");
      if(v==="calendar") renderTaskCalendar(taskCalYear,taskCalMonth);
      if(v==="board") renderTaskBoard();
    }));
    // Filter tabs
    $$(".task-filter-tab").forEach(btn=>btn.addEventListener("click",()=>{
      $$(".task-filter-tab").forEach(b=>b.classList.remove("active")); btn.classList.add("active");
      taskActiveFilter=btn.dataset.filter;
      renderTaskList(taskActiveFilter, $("#task-priority-filter")?.value||"", $("#task-search")?.value||"");
    }));
    // Priority filter & search
    const pf=document.getElementById("task-priority-filter");
    if(pf) pf.addEventListener("change",()=>renderTaskList(taskActiveFilter,pf.value,document.getElementById("task-search")?.value||""));
    const ts=document.getElementById("task-search");
    if(ts) ts.addEventListener("input",()=>renderTaskList(taskActiveFilter,pf?.value||"",ts.value));
    // New task btn
    const nb=document.getElementById("new-task-btn");
    if(nb) nb.addEventListener("click",()=>openTaskModal(null));
    // Save task
    const sb=document.getElementById("save-task-btn");
    if(sb) sb.addEventListener("click",saveTask);
    // Delete task btn in modal
    const db=document.getElementById("delete-task-btn");
    if(db) db.addEventListener("click",()=>{ if(taskEditingId) window.p99DeleteTask(taskEditingId); });
    // Calendar nav
    const prev=document.getElementById("cal-prev"), next=document.getElementById("cal-next"), todayBtn=document.getElementById("cal-today");
    if(prev) prev.addEventListener("click",()=>{taskCalMonth--;if(taskCalMonth<0){taskCalMonth=11;taskCalYear--;}renderTaskCalendar(taskCalYear,taskCalMonth);});
    if(next) next.addEventListener("click",()=>{taskCalMonth++;if(taskCalMonth>11){taskCalMonth=0;taskCalYear++;}renderTaskCalendar(taskCalYear,taskCalMonth);});
    if(todayBtn) todayBtn.addEventListener("click",()=>{taskCalYear=new Date().getFullYear();taskCalMonth=new Date().getMonth();taskCalSelectedDate=new Date().toISOString().slice(0,10);renderTaskCalendar(taskCalYear,taskCalMonth);renderCalDayTasks(taskCalSelectedDate);});
    const calAdd=document.getElementById("cal-add-task-btn");
    if(calAdd) calAdd.addEventListener("click",()=>openTaskModal(null,taskCalSelectedDate));
  }

  function openTaskModal(id, prefillDate){
    taskEditingId=id||null;
    const modal=document.getElementById("modal-task");
    const delBtn=document.getElementById("delete-task-btn");
    const titleEl=document.getElementById("task-modal-title");
    document.getElementById("task-edit-id").value=id||"";
    if(id){
      const t=S.tasks.find(t=>t.id===id); if(!t) return;
      if(titleEl) titleEl.textContent="Editar tarea";
      document.getElementById("task-title").value=t.title||"";
      document.getElementById("task-desc").value=t.desc||"";
      document.getElementById("task-priority").value=t.priority||"media";
      document.getElementById("task-status").value=t.status||"pendiente";
      document.getElementById("task-due").value=t.dueDate||"";
      document.getElementById("task-project").value=t.project||"";
      if(delBtn) delBtn.style.display="";
    } else {
      if(titleEl) titleEl.textContent="Nueva Tarea";
      document.getElementById("task-title").value="";
      document.getElementById("task-desc").value="";
      document.getElementById("task-priority").value="media";
      document.getElementById("task-status").value="pendiente";
      document.getElementById("task-due").value=prefillDate||new Date().toISOString().slice(0,10);
      document.getElementById("task-project").value="";
      if(delBtn) delBtn.style.display="none";
    }
    if(modal) modal.classList.remove("hidden");
  }

  function saveTask(){
    const title=document.getElementById("task-title")?.value?.trim();
    if(!title){ showToast("Escribe un titulo para la tarea","info"); return; }
    const id=taskEditingId||(("t"+Date.now()));
    const task={
      id, title,
      desc: document.getElementById("task-desc")?.value||"",
      priority: document.getElementById("task-priority")?.value||"media",
      status: document.getElementById("task-status")?.value||"pendiente",
      dueDate: document.getElementById("task-due")?.value||"",
      project: document.getElementById("task-project")?.value||"",
      createdAt: new Date().toISOString().slice(0,10)
    };
    if(taskEditingId) {
      const idx=S.tasks.findIndex(t=>t.id===taskEditingId);
      if(idx>=0) S.tasks[idx]=task; else S.tasks.push(task);
    } else { S.tasks.push(task); }
    persist("tasks",S.tasks);
    closeModal("modal-task");
    renderTaskStats(); renderTaskList(taskActiveFilter,"",""); updateTasksBadge();
    showToast(taskEditingId?"Tarea actualizada":"Tarea creada","success");
    taskEditingId=null;
  }

  window.p99OpenTask  = function(id){ openTaskModal(id); };
  window.p99ToggleTask = function(id){
    const t=S.tasks.find(t=>t.id===id); if(!t) return;
    t.status=t.status==="completada"?"pendiente":"completada";
    persist("tasks",S.tasks);
    renderTaskStats(); renderTaskList(taskActiveFilter,"",""); updateTasksBadge();
    renderCalDayTasks(taskCalSelectedDate);
    showToast(t.status==="completada"?"Tarea completada ✓":"Tarea reactivada","success");
  };
  window.p99DeleteTask = function(id){
    if(!confirm("¿Eliminar esta tarea?")) return;
    persist("tasks",S.tasks.filter(t=>t.id!==id));
    closeModal("modal-task");
    renderTaskStats(); renderTaskList(taskActiveFilter,"",""); updateTasksBadge();
    renderTaskBoard(); renderCalDayTasks(taskCalSelectedDate);
    showToast("Tarea eliminada","success");
  };

  /* ── Calendar ── */
  function renderTaskCalendar(year, month){
    const label=document.getElementById("cal-month-label");
    const names=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    if(label) label.textContent=names[month]+" "+year;
    const grid=document.getElementById("task-cal-grid"); if(!grid) return;
    const today=new Date().toISOString().slice(0,10);
    const first=new Date(year,month,1);
    let startDay=(first.getDay()||7)-1; // Mon=0
    const daysInMonth=new Date(year,month+1,0).getDate();
    const daysInPrev=new Date(year,month,0).getDate();
    // Build task map by date
    const taskMap={};
    S.tasks.forEach(t=>{if(t.dueDate){if(!taskMap[t.dueDate])taskMap[t.dueDate]=[];taskMap[t.dueDate].push(t);}});
    let cells=[];
    for(let i=0;i<startDay;i++) cells.push({day:daysInPrev-startDay+1+i,date:null,other:true});
    for(let d=1;d<=daysInMonth;d++){
      const date=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      cells.push({day:d,date,other:false,tasks:taskMap[date]||[]});
    }
    while(cells.length%7!==0) cells.push({day:cells.length-startDay-daysInMonth+1,date:null,other:true});
    grid.innerHTML=cells.map(c=>{
      if(c.other) return`<div class="task-cal-cell other-month"><span class="cal-day-num">${c.day}</span></div>`;
      const isToday=c.date===today, isSel=c.date===taskCalSelectedDate;
      const dots=c.tasks.slice(0,6).map(t=>`<div class="cal-task-dot" style="background:${(TASK_PRIORITY[t.priority]||{color:"#888"}).color}${t.status==="completada"?"66":""}"></div>`).join("");
      const previews=c.tasks.slice(0,2).map(t=>`<div class="cal-task-preview" style="border-left:2px solid ${(TASK_PRIORITY[t.priority]||{color:"#888"}).color};padding-left:3px">${esc(t.title.slice(0,20))}${t.title.length>20?"…":""}</div>`).join("");
      return`<div class="task-cal-cell${isToday?" today":""}${isSel?" selected":""}" onclick="window.p99SelectCalDay('${c.date}')">
        <span class="cal-day-num">${c.day}</span>
        ${c.tasks.length>0?`<div class="cal-task-dots">${dots}</div>${previews}`:""}
      </div>`;
    }).join("");
    renderCalDayTasks(taskCalSelectedDate);
  }

  window.p99SelectCalDay = function(date){
    taskCalSelectedDate=date;
    // Update selected cell
    $$(".task-cal-cell.selected").forEach(c=>c.classList.remove("selected"));
    const cells=$$(".task-cal-cell");
    cells.forEach(c=>{if(c.querySelector(".cal-day-num")&&c.onclick){} });
    // Re-render to update selection (lightweight)
    renderTaskCalendar(taskCalYear,taskCalMonth);
  };

  function renderCalDayTasks(date){
    const header=document.getElementById("task-cal-day-header");
    const body=document.getElementById("task-cal-day-tasks");
    if(!header||!body) return;
    const d=new Date(date+"T00:00:00");
    const today=new Date().toISOString().slice(0,10);
    const label=date===today?"Hoy":d.toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"});
    header.textContent=label.charAt(0).toUpperCase()+label.slice(1);
    const tasks=S.tasks.filter(t=>t.dueDate===date);
    if(!tasks.length){ body.innerHTML='<p style="font-size:.775rem;color:var(--text-dim);text-align:center;padding:1.25rem .5rem">Sin tareas para este dia</p>'; return; }
    body.innerHTML=tasks.map(t=>`<div class="task-cal-day-item${t.status==="completada"?" done":""}" onclick="window.p99OpenTask('${esc(t.id)}')">
      <div class="task-priority-dot" style="background:${(TASK_PRIORITY[t.priority]||{color:"#888"}).color}"></div>
      <span style="flex:1;font-size:.775rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.title)}</span>
      <button onclick="event.stopPropagation();window.p99ToggleTask('${esc(t.id)}')" style="font-size:.65rem;color:${t.status==="completada"?"var(--success)":"var(--text-mute)"}">✓</button>
    </div>`).join("");
  }

  /* ── Board ── */
  function renderTaskBoard(){
    const board=document.getElementById("task-board-kanban"); if(!board) return;
    const statuses=["pendiente","en-proceso","revision","completada"];
    const colors={"pendiente":"#444","en-proceso":"#EAB308","revision":"#888","completada":"#22C55E"};
    board.innerHTML=statuses.map(st=>{
      const s=TASK_STATUS[st]||{label:st};
      const items=S.tasks.filter(t=>t.status===st);
      const cards=items.map(t=>{const p=TASK_PRIORITY[t.priority]||{color:"#888"};return`<div class="kanban-card" onclick="window.p99OpenTask('${esc(t.id)}')">
        <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.35rem">
          <div style="width:6px;height:6px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
          <div class="kanban-card-name">${esc(t.title)}</div>
        </div>
        <div class="kanban-card-meta">${t.project?esc(t.project):""}${t.dueDate?" · "+new Date(t.dueDate+"T00:00:00").toLocaleDateString("es-ES",{day:"numeric",month:"short"}):""}</div>
        <div class="kanban-card-footer"><span class="badge" style="font-size:.58rem;background:${p.color}22;color:${p.color}">${p.label}</span></div>
      </div>`;}).join("");
      return`<div class="kanban-col"><div class="kanban-col-header" style="border-top:2px solid ${colors[st]}"><span class="kanban-col-title">${s.label}</span><span class="kanban-col-count">${items.length}</span></div><div class="kanban-cards">${cards||'<p style="font-size:.65rem;color:var(--text-dim);padding:.4rem">Vacio</p>'}</div></div>`;
    }).join("");
  }

  /* ─── ANALYTICS P&L ──────────────────────────────────────── */
  function initAnalytics(){
    renderPLEntries();
    const monthly=computeFinancials();
    if(monthly.length===0){
      // Reset summary cards to 0 — no fake data
      const setEl=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
      setEl("pl-income","0 EUR"); setEl("pl-expenses","0 EUR"); setEl("pl-net","0 EUR"); setEl("pl-margin","0%");
      $$(".pl-card-change").forEach(el=>{el.textContent="Sin datos registrados";el.className="pl-card-change pl-card-change--neutral";});
      const mc=$("#chart-pl-main");if(mc)mc.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:240px;color:var(--text-dim);font-size:.8rem;flex-direction:column;gap:.75rem">'+svgIcon("activity")+'<span>Pulsa <strong style="color:var(--accent)">+ Registrar entrada</strong> para empezar a ver el grafico</span></div>';
      const ec=$("#pl-expenses-chart");if(ec)ec.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:160px;color:var(--text-dim);font-size:.75rem">Sin datos de gastos</div>';
      const tbody=$("#pl-tbody");if(tbody)tbody.innerHTML='<tr><td colspan="5" class="table-empty"><p>Registra tu primer ingreso o gasto para ver el detalle</p></td></tr>';
      // Clear hardcoded income breakdown
      const ib=$("#income-breakdown");
      if(ib)ib.innerHTML='<div style="padding:1.5rem;text-align:center;color:var(--text-dim);font-size:.775rem">Sin ingresos registrados aun</div>';
      // Clear hardcoded KPI chips
      $$(".kpi-chip .kpi-chip-val").forEach(el=>{el.textContent="—";el.style.color="var(--text-dim)";});
    } else {
      safe(()=>drawPLMainChart(monthly),"plMain");
      safe(drawPLExpensesChart,"plExp");
      populatePLTable(monthly);
      updatePLSummary(monthly);
    }

    // Register button
    const regBtn=$("#register-pl-btn"); if(regBtn) regBtn.addEventListener("click",openPLRegister);

    // Export
    const exportBtn=$("#export-pl-btn");
    if(exportBtn) exportBtn.addEventListener("click",()=>{if(!monthly.length){showToast("Sin datos para exportar","info");return;}exportCSV([["Mes","Ingresos","Gastos","Ganancia","Margen"],...monthly.map(m=>[m.month,m.income,m.expenses,m.net,Math.round((m.net/(m.income||1))*100)+"%"])],"pl-report",true);showToast("P&L exportado","success");});

    // P&L Register modal handlers
    $$(".pl-type-btn").forEach(btn=>btn.addEventListener("click",()=>{$$(".pl-type-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");const ti=$("#pl-type");if(ti)ti.value=btn.dataset.type;}));
    const saveBtn=$("#save-pl-entry-btn"); if(saveBtn) saveBtn.addEventListener("click",savePLEntry);

    // Set default month to current
    const mInput=$("#pl-month");
    if(mInput&&!mInput.value) mInput.value=new Date().toISOString().slice(0,7);
  }

  function openPLRegister(){
    const modal=$("#modal-pl-register"); if(modal) modal.classList.remove("hidden");
    renderPLEntries();
  }

  function savePLEntry(){
    const type=$("#pl-type")?.value||"income";
    const desc=$("#pl-desc")?.value?.trim(); if(!desc){showToast("Escribe una descripcion","info");return;}
    const amount=parseFloat($("#pl-amount")?.value||"0"); if(!amount||amount<=0){showToast("Introduce un importe valido","info");return;}
    const month=$("#pl-month")?.value||new Date().toISOString().slice(0,7);
    const category=$("#pl-category")?.value||"";
    const notes=$("#pl-notes")?.value||"";
    const entry={id:"pl"+Date.now(),type,desc,amount,month,category,notes,date:new Date().toISOString()};
    S.plEntries.push(entry);persist("pl",S.plEntries);

    // Reset form
    if($("#pl-desc")) $("#pl-desc").value="";
    if($("#pl-amount")) $("#pl-amount").value="";
    if($("#pl-notes")) $("#pl-notes").value="";

    renderPLEntries();
    showToast((type==="income"?"Ingreso":"Gasto")+" registrado: "+fmtEur(amount),"success");

    // Refresh charts after short delay
    setTimeout(()=>{ safe(()=>{const m=computeFinancials();drawPLMainChart(m);populatePLTable(m);updatePLSummary(m);},"refreshPL"); },100);
  }

  function renderPLEntries(){
    const list=$("#pl-entries-list-in-modal")||$(".pl-entries-list");
    // Inject entries list inside the modal body if not already there
    const modal=$("#modal-pl-register");
    if(!modal) return;
    let entList=modal.querySelector(".pl-entries-list");
    if(!entList){
      entList=document.createElement("div");
      entList.className="pl-entries-list";
      const mb=modal.querySelector(".modal-body");
      if(mb) mb.appendChild(entList);
    }
    const recent=S.plEntries.slice(-20).reverse();
    if(recent.length===0){entList.innerHTML='<p style="font-size:.75rem;color:var(--text-dim);text-align:center;padding:.875rem">Sin entradas todavia</p>';return;}
    entList.innerHTML='<div class="prompt-section-title" style="margin-bottom:.375rem">Entradas recientes</div>'+recent.map(e=>'<div class="pl-entry-row"><span class="pl-entry-desc">'+esc(e.desc)+'</span><span class="pl-entry-month">'+fmtMon(e.month)+'</span><span class="pl-entry-amount '+(e.type==="income"?"income":"expense")+'">'+(e.type==="income"?"+":"-")+fmtEur(e.amount)+'</span><button class="pl-entry-delete" onclick="window.p99DeletePLEntry(\''+esc(e.id)+'\')">&#x2715;</button></div>').join("");
  }

  window.p99DeletePLEntry=function(id){persist("pl",S.plEntries.filter(e=>e.id!==id));renderPLEntries();const m=computeFinancials();safe(()=>{drawPLMainChart(m);populatePLTable(m);updatePLSummary(m);},"refreshPLDel");showToast("Entrada eliminada","success");};

  function updatePLSummary(monthly){
    if(!monthly.length) return;
    const totInc=monthly.reduce((s,m)=>s+m.income,0);
    const totExp=monthly.reduce((s,m)=>s+m.expenses,0);
    const totNet=totInc-totExp;
    const margin=totInc>0?Math.round((totNet/totInc)*100):0;
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set("pl-income","+ "+fmtEur(totInc));set("pl-expenses","- "+fmtEur(totExp));set("pl-net",fmtEur(totNet));set("pl-margin",margin+"%");
  }

  function drawPLMainChart(monthly){
    const el=$("#chart-pl-main"); if(!el||!monthly.length) return;
    const W=el.offsetWidth||600,H=240,pad={t:16,r:24,b:36,l:48};
    const cW=W-pad.l-pad.r,cH=H-pad.t-pad.b;
    const maxVal=Math.max(...monthly.map(m=>m.income),1)*1.1;
    const xP=i=>pad.l+(i/(monthly.length-1||1))*cW,yP=v=>pad.t+cH-(v/maxVal)*cH;
    const mkLine=(key,color,dash)=>'<polyline points="'+monthly.map((m,i)=>xP(i)+","+yP(m[key])).join(" ")+'" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'+(dash?' stroke-dasharray="5,4"':'')+'/>';
    const dots=monthly.map((m,i)=>'<circle cx="'+xP(i)+'" cy="'+yP(m.income)+'" r="3.5" fill="#22C55E"/><circle cx="'+xP(i)+'" cy="'+yP(m.expenses)+'" r="3.5" fill="#E5302A"/><circle cx="'+xP(i)+'" cy="'+yP(m.net)+'" r="3.5" fill="#888"/>').join("");
    const grids=[0,.2,.4,.6,.8,1].map(p=>{const y=pad.t+cH-p*cH;return'<line x1="'+pad.l+'" y1="'+y+'" x2="'+(W-pad.r)+'" y2="'+y+'" stroke="var(--border)" stroke-dasharray="3,5"/><text x="'+(pad.l-5)+'" y="'+(y+3)+'" text-anchor="end" font-size="9" fill="var(--text-dim)">'+Math.round(maxVal*p/1000)+'k</text>';}).join("");
    const xLabels=monthly.filter((_,i)=>i%Math.max(1,Math.floor(monthly.length/6))===0).map((m,ii)=>'<text x="'+xP(ii*Math.max(1,Math.floor(monthly.length/6)))+'" y="'+(H-6)+'" text-anchor="middle" font-size="9" fill="var(--text-dim)">'+m.month+'</text>').join("");
    el.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%">'+grids+mkLine("income","#22C55E")+mkLine("expenses","#E5302A")+mkLine("net","#888",true)+dots+xLabels+'</svg>';
  }

  function drawPLExpensesChart(){
    const el=$("#pl-expenses-chart"); if(!el) return;
    const expEntries=S.plEntries.filter(e=>e.type==="expense");
    const catMap={};expEntries.forEach(e=>{const cat=e.category||"otros";catMap[cat]=(catMap[cat]||0)+ +e.amount;});
    const cats=Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([label,amount])=>({label,amount}));
    if(!cats.length){el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:160px;color:var(--text-dim);font-size:.75rem">Sin gastos registrados</div>';return;}
    const W=el.offsetWidth||280,barH=22,gap=8,maxAmt=Math.max(...cats.map(c=>c.amount),1);
    const colors=["#E5302A","#AA2020","#881818","#661010","#444"];
    let svg="";cats.forEach((c,i)=>{const y=i*(barH+gap)+8,bw=(c.amount/maxAmt)*(W-108)||4;svg+='<rect x="104" y="'+y+'" width="'+bw+'" height="'+barH+'" rx="3" fill="'+colors[i]+'" opacity="0.85"/><text x="100" y="'+(y+barH/2+4)+'" text-anchor="end" font-size="8" fill="var(--text-mute)">'+esc(c.label.slice(0,12))+'</text><text x="'+(104+bw+5)+'" y="'+(y+barH/2+4)+'" font-size="8" fill="var(--text-mute)">'+fmtEur(c.amount)+'</text>';});
    el.innerHTML='<svg viewBox="0 0 '+W+' '+(cats.length*(barH+gap)+16)+'" width="100%">'+svg+'</svg>';
  }

  function populatePLTable(monthly){
    const tbody=$("#pl-tbody"); if(!tbody) return;
    if(!monthly.length){tbody.innerHTML='<tr><td colspan="5" class="table-empty"><p>Sin datos</p></td></tr>';return;}
    tbody.innerHTML=monthly.map(m=>'<tr><td class="mono">'+m.month+'</td><td class="mono" style="color:var(--success)">'+fmtEur(m.income)+'</td><td class="mono" style="color:var(--error)">'+fmtEur(m.expenses)+'</td><td class="mono" style="color:var(--accent)">'+fmtEur(m.net)+'</td><td class="mono">'+(m.income>0?Math.round((m.net/m.income)*100):0)+'%</td></tr>').join("");
  }

  /* ─── TEAM ────────────────────────────────────────────────── */
  function initTeam(){
    const grid=$("#team-grid"); if(!grid||grid.children.length>0) return;
    if(S.team.length===0){grid.innerHTML=emptyState(svgIcon("team"),"Equipo vacio","Invita a tu equipo para asignar tareas y proyectos.",'<button class="btn-primary">+ Invitar miembro</button>')+'<div class="team-card" style="border:1px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;cursor:pointer;background:transparent;border-radius:var(--r-lg)" onclick="showToast(\'Funcion de invitacion — proximamente\',\'info\')">'+svgIcon("team")+'<p style="color:var(--text-mute);margin-top:.75rem;font-size:.8rem">Invitar miembro</p></div>';return;}
    grid.innerHTML=S.team.map(m=>'<div class="team-card"><div class="team-card-avatar">'+esc(m.avatar||m.name.slice(0,2).toUpperCase())+'<div class="team-status-indicator team-status-indicator--'+(m.status||"offline")+'"></div></div><div class="team-card-name">'+esc(m.name)+'</div><div class="team-card-role">'+esc(m.role||"Miembro")+'</div><div class="team-card-dept">'+esc(m.dept||"")+'</div><div class="team-card-stats"><div style="text-align:center"><div class="team-stat-val">'+(m.tasks||0)+'</div><div class="team-stat-label">Tareas</div></div><div style="text-align:center"><div class="team-stat-val">'+(m.hours||0)+'h</div><div class="team-stat-label">Semana</div></div></div><div class="team-card-actions"><button class="btn-ghost btn-sm">Perfil</button><button class="btn-ghost btn-sm">Tareas</button></div></div>').join("") +'<div class="team-card" style="border:1px dashed var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:200px;cursor:pointer;background:transparent" onclick="showToast(\'Proximamente\',\'info\')"><p style="color:var(--text-mute);font-size:.8rem">+ Invitar</p></div>';
    const ib=$("#invite-member-btn"); if(ib) ib.addEventListener("click",()=>showToast("Funcion de invitacion — proximamente","info"));
  }

  /* ─── SETTINGS ────────────────────────────────────────────── */
  function initSettings(){
    $$(".settings-nav-item").forEach(btn=>btn.addEventListener("click",()=>{$$(".settings-nav-item").forEach(b=>b.classList.remove("active"));btn.classList.add("active");$$(".settings-panel").forEach(p=>{p.classList.add("hidden");p.classList.remove("active");});const t=$('[data-spanel="'+btn.dataset.stab+'"]');if(t){t.classList.remove("hidden");t.classList.add("active");}}));
    const sp=$("#save-profile-btn");
    if(sp) sp.addEventListener("click",()=>{const name=$("#settings-name")?.value?.trim();if(name&&S.user){S.user.name=name;S.user.avatar=name.slice(0,2).toUpperCase();localStorage.setItem("p99-user",JSON.stringify(S.user));updateUserUI();showToast("Perfil actualizado","success");}});
    $$("[data-show-key]").forEach(btn=>btn.addEventListener("click",()=>{const input=document.getElementById(btn.dataset.showKey);if(input){input.type=input.type==="password"?"text":"password";btn.textContent=input.type==="password"?"Mostrar":"Ocultar";}}));
  }

  /* ─── EDIT MODE ──────────────────────────────────────────── */
  function initEditMode(){
    const btn=$("#edit-mode-toggle"),bar=$("#edit-mode-bar"),saveBtn=$("#save-edits-btn"),cancelBtn=$("#cancel-edits-btn");
    if(!btn) return;
    btn.addEventListener("click",()=>activateEditMode());
    if(saveBtn) saveBtn.addEventListener("click",saveEdits);
    if(cancelBtn) cancelBtn.addEventListener("click",cancelEditMode);
  }

  function activateEditMode(){
    document.body.classList.add("edit-mode");
    const btn=$("#edit-mode-toggle"),bar=$("#edit-mode-bar");
    if(btn){btn.classList.add("active");btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>Editando</span>';}
    if(bar) bar.classList.remove("hidden");
    // Make all data-editable elements contenteditable
    $$("[data-editable]").forEach(el=>{el.contentEditable="true";el.setAttribute("spellcheck","false");});
    showToast("Modo edicion activo — haz clic en cualquier texto resaltado","info");
  }

  function saveEdits(){
    const edits={};
    $$("[data-editable][data-edit-key]").forEach(el=>{edits[el.dataset.editKey]=el.innerText.trim();});
    // Merge with existing edits
    Object.assign(S.edits, edits);
    persist("edits",S.edits);
    cancelEditMode();
    showToast("Cambios guardados correctamente","success");
  }

  function cancelEditMode(){
    document.body.classList.remove("edit-mode");
    $$("[data-editable]").forEach(el=>el.removeAttribute("contenteditable"));
    const btn=$("#edit-mode-toggle"),bar=$("#edit-mode-bar");
    if(btn){btn.classList.remove("active");btn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg><span>Editar</span>';}
    if(bar) bar.classList.add("hidden");
  }

  function applyEdits(){
    if(!S.edits||!Object.keys(S.edits).length) return;
    Object.entries(S.edits).forEach(([key,val])=>{
      $$('[data-edit-key="'+key+'"]').forEach(el=>{ if(el.contentEditable!=="true") el.innerText=val; });
    });
  }

  /* ─── AI CHAT ─────────────────────────────────────────────── */
  // Conversation history for real API
  const aiHistory = [];

  function initAIChat(){
    const sendBtn=$("#ai-send"),input=$("#ai-input");
    if(!sendBtn||!input) return;
    sendBtn.addEventListener("click",sendAIMsg);
    input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAIMsg();}});
    $$(".ai-quick-btn").forEach(btn=>btn.addEventListener("click",()=>{if(input)input.value=btn.textContent;sendAIMsg();}));
    // Show API status in panel
    updateAIStatus();
  }

  function updateAIStatus(){
    const panel=$("#ai-panel");if(!panel)return;
    const hasKey=S.aiKeys&&S.aiKeys['claude']&&S.aiKeys['claude'].length>8;
    let statusEl=panel.querySelector(".ai-api-status");
    if(!statusEl){statusEl=document.createElement("div");statusEl.className="ai-api-status";const hdr=panel.querySelector(".ai-panel-header");if(hdr)hdr.after(statusEl);}
    statusEl.innerHTML=hasKey
      ?'<div style="padding:.375rem .875rem;font-size:.65rem;background:rgba(34,197,94,.1);border-bottom:1px solid rgba(34,197,94,.2);color:#22C55E;display:flex;align-items:center;gap:.35rem"><span style="width:6px;height:6px;border-radius:50%;background:#22C55E;display:inline-block"></span>Claude API conectada — respuestas en tiempo real</div>'
      :'<div style="padding:.375rem .875rem;font-size:.65rem;background:rgba(229,48,42,.08);border-bottom:1px solid rgba(229,48,42,.15);color:var(--accent);display:flex;align-items:center;gap:.35rem"><span style="width:6px;height:6px;border-radius:50%;background:var(--accent);display:inline-block"></span>Configura tu API key de Claude en Integraciones para respuestas reales</div>';
  }

  async function callClaudeAPIReal(messages){
    const key=S.aiKeys&&S.aiKeys['claude'];
    if(!key||key.length<10) return null;
    const model=S.aiModels&&S.aiModels['claude']||'claude-sonnet-4-5';
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
        body:JSON.stringify({model,max_tokens:1024,
          system:'Eres el asistente interno de Project99 Agencia IA. Ayudas al usuario con la gestión de su agencia: estrategia comercial, clientes, propuestas, proyectos de IA, precios y operaciones diarias. Responde siempre en español, de forma concisa, directa y práctica. Usa listas cuando sea util. Maximo 300 palabras.',
          messages:messages.map(m=>({role:m.role,content:m.content}))
        })
      });
      if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.error?.message||'Error '+res.status);}
      const data=await res.json();
      return data.content[0].text;
    }catch(e){console.warn('Claude API:',e.message);return null;}
  }

  async function sendAIMsg(){
    const input=$("#ai-input"),msgs=$("#ai-messages"); if(!input||!msgs) return;
    const text=input.value.trim(); if(!text) return;
    appendAIMsg(text,"user"); input.value="";
    aiHistory.push({role:"user",content:text});
    const typing=appendAIMsg("...","bot typing");

    // Try real API first, fall back to local replies
    const apiKey=S.aiKeys&&S.aiKeys['claude'];
    if(apiKey&&apiKey.length>8){
      try{
        const reply=await callClaudeAPIReal(aiHistory.slice(-12)); // last 12 turns
        typing.remove();
        if(reply){
          aiHistory.push({role:"assistant",content:reply});
          appendAIMsg(reply,"bot");
        } else {
          const fallback=getAIReply(text);
          aiHistory.push({role:"assistant",content:fallback});
          appendAIMsg(fallback,"bot");
        }
      }catch(e){typing.remove();appendAIMsg(getAIReply(text),"bot");}
    } else {
      setTimeout(()=>{typing.remove();const r=getAIReply(text);aiHistory.push({role:"assistant",content:r});appendAIMsg(r,"bot");},900+Math.random()*500);
    }
  }
  function appendAIMsg(text,type){
    const msgs=$("#ai-messages");
    const div=document.createElement("div");
    div.className="ai-msg ai-msg--"+type.split(" ")[0];
    if(type.includes("typing"))div.classList.add("ai-msg--typing");
    div.innerHTML='<div class="ai-msg-avatar">'+(type.startsWith("user")?esc(S.user?.avatar||"YO"):"IA")+'</div><div class="ai-msg-bubble">'+esc(text)+'</div>';
    msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;return div;
  }
  function getAIReply(text){
    const t=text.toLowerCase();
    if(t.includes("cliente")||t.includes("analizar"))return"Para analizar clientes ve primero a CRM y anade algunos. Cuando tengas datos puedo ayudarte a identificar oportunidades de upsell, riesgo de churn y clientes con mayor potencial.";
    if(t.includes("email")||t.includes("correo"))return"Template de seguimiento:\n\n'Hola [Nombre], queria seguir con nuestra conversacion del [FECHA]. Como vimos, [PROBLEMA DEL CLIENTE] podria resolverse con [SOLUCION]. He preparado un caso similar que creo te interesara. ¿Tienes 20min esta semana?'\n\nRecuerda: personaliza siempre con algo especifico de su empresa.";
    if(t.includes("precio")||t.includes("tarifa"))return"Mis tarifas recomendadas:\n• Web basica: 300 EUR\n• Chatbot IA: 800-3.000 EUR\n• Automatizacion: 500-2.000 EUR/mes\n• App completa: 2.000-10.000 EUR\n• Agente IA: 5.000-20.000 EUR\n\nRegla de oro: calcula tus costes y aplica al menos x2.5 de margen.";
    if(t.includes("propuesta")||t.includes("idea"))return"Para una propuesta que cierre:\n1. Empieza con el dolor especifico del cliente\n2. Cuantifica el problema en euros/tiempo\n3. Propone la solucion en 3 bullets\n4. Muestra ROI esperado\n5. Precio claro con condiciones simples\n6. Valida 30 dias\n\n¿Para que sector necesitas la propuesta?";
    if(t.includes("curso")||t.includes("aprender"))return"En la seccion Academy tienes 8 cursos con videos de YouTube reales:\n• Chatbots con Claude API\n• Python para datos\n• Automatizacion con n8n y Make\n• SEO con IA\n• Apps con Claude Code\n• Agentes IA con LangChain\n\nHaz clic en cualquier curso para ver los videos y los pasos.";
    if(t.includes("pdf")||t.includes("factura")||t.includes("presupuesto"))return"Para generar un PDF:\n1. Ve a Presupuestos\n2. Pulsa '+ Nuevo presupuesto'\n3. Rellena los datos y servicios\n4. Pulsa 'Vista previa'\n5. Pulsa 'Descargar PDF'\n\nEl sistema convierte el documento a imagen y genera el PDF automaticamente.";
    return"Entendido. Puedo ayudarte con:\n• Analisis de clientes y oportunidades\n• Emails y propuestas comerciales\n• Precios y estrategia de ventas\n• Formacion y cursos de IA\n• Generacion de PDFs y facturas\n\n¿Sobre que quieres profundizar?";
  }

  /* ─── MODALS ─────────────────────────────────────────────── */
  function openModal(id){const m=document.getElementById(id);if(m)m.classList.remove("hidden");}
  function closeModal(id){const m=document.getElementById(id);if(m)m.classList.add("hidden");}
  window.showToast=showToast;

  /* ─── TOASTS ─────────────────────────────────────────────── */
  function showToast(message,type){
    type=type||"info";
    const container=$("#toast-container"); if(!container) return;
    const icons={success:"✓",error:"✕",info:"—",warning:"!"};
    const toast=document.createElement("div");
    toast.className="toast toast--"+type;
    toast.innerHTML='<span class="toast-icon">'+(icons[type]||"—")+'</span><span class="toast-text">'+esc(message)+'</span>';
    container.appendChild(toast);
    setTimeout(()=>{toast.classList.add("out");setTimeout(()=>toast.remove(),280);},3200);
  }

  /* ─── CSV EXPORT ──────────────────────────────────────────── */
  function exportCSV(rows,filename,raw){
    const csv=raw?rows.map(r=>r.join(",")).join("\n"):[Object.keys(rows[0]||{}).join(","),...rows.map(r=>Object.values(r).map(v=>'"'+String(v||"").replace(/"/g,'""')+'"').join(","))].join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=filename+".csv";a.click();URL.revokeObjectURL(url);
  }

  /* ─── HELPERS ─────────────────────────────────────────────── */
  function ucFirst(s){return String(s||"").charAt(0).toUpperCase()+String(s||"").slice(1);}

  /* ─── PWA ─────────────────────────────────────────────────── */
  function initPWA(){
    if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
  }

  /* ─── BOOT ────────────────────────────────────────────────── */
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();
