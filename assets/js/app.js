(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const CFG = window.GB_CONFIG || {};
  const DEFAULT = window.GB_DEFAULT_DATA || {};
  const state = {
    sb: null,
    settings: structuredClone(DEFAULT.settings || {}),
    categories: structuredClone(DEFAULT.categories || []),
    products: structuredClone(DEFAULT.products || []),
    catalogues: structuredClone(DEFAULT.catalogues || []),
    gallery: structuredClone(DEFAULT.gallery || []),
    enquiries: [],
    activeFilter: "All"
  };

  function clone(data) { return JSON.parse(JSON.stringify(data)); }
  function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }
  function attr(value) { return esc(value).replace(/`/g, "&#96;"); }
  function plainPhone(value) { return String(value || "").replace(/[^0-9]/g, ""); }
  function sortRows(rows) { return [...(rows || [])].filter(r => r.is_active !== false).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)); }
  function makeInitial(text) { return String(text || "GB").split(/\s+/).map(x => x[0]).join("").slice(0, 3).toUpperCase(); }
  function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function supabaseReady() {
    return Boolean(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase);
  }
  function initSupabase() {
    if (supabaseReady()) state.sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  }

  function instagramHref(value) {
    const raw = String(value || "").trim();
    if (!raw) return "#";
    if (/^https?:\/\//i.test(raw)) return raw;
    const username = raw.replace(/^@/, "").replace(/^instagram\.com\//i, "");
    return `https://www.instagram.com/${username}`;
  }
  function instagramLabel(value) {
    const raw = String(value || "").trim();
    if (!raw) return "Instagram";
    const match = raw.match(/instagram\.com\/([^/?#]+)/i);
    if (match?.[1]) return match[1].replace(/^@/, "");
    return raw.replace(/^@/, "");
  }
  function fileNameFromTitle(title, ext = "pdf") {
    const base = String(title || "goyal-borewells-file").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "goyal-borewells-file";
    return `${base}.${ext}`;
  }
  window.GB_downloadFile = async function(event, url, fileName) {
    if (!url || url.endsWith("#contact") || url.includes("#contact")) return true;
    event.preventDefault();
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName || "goyal-borewells.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
    } catch (error) {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "goyal-borewells.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    return false;
  };
  function whatsappLink(message = "") {
    const number = CFG.whatsappNumber || plainPhone(state.settings.phone) || "918770327415";
    const text = message || `Hello Goyal Borewells, I want a bulk quotation for B2B material supply.`;
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }
  function applyTheme() {
    const theme = state.settings.theme || {};
    const root = document.documentElement;
    if (theme.primary) root.style.setProperty("--primary", theme.primary);
    if (theme.accent) root.style.setProperty("--accent", theme.accent);
    if (theme.dark) root.style.setProperty("--dark", theme.dark);
    if (theme.light) root.style.setProperty("--light", theme.light);
    if (theme.radius) root.style.setProperty("--radius", `${theme.radius}px`);
  }
  function heroTitle(text) {
    const value = String(text || "");
    const marker = " for ";
    const idx = value.toLowerCase().indexOf(marker);
    if (idx > -1) return `${esc(value.slice(0, idx + marker.length))}<span>${esc(value.slice(idx + marker.length))}</span>`;
    const parts = value.split(" ");
    if (parts.length > 4) return `${esc(parts.slice(0, 4).join(" "))}<span>${esc(parts.slice(4).join(" "))}</span>`;
    return esc(value);
  }
  function setText(selector, value) { const el = $(selector); if (el) el.textContent = value || ""; }
  function setHTML(selector, value) { const el = $(selector); if (el) el.innerHTML = value || ""; }
  function setHref(selector, href) { const el = $(selector); if (el) el.href = href || "#"; }
  function renderBrand() {
    const s = state.settings;
    setText("#brandName", s.companyName);
    setText("#brandLine", s.brandLine);
    setText("#adminBrandLine", s.companyName);
    const logo = $("#brandLogo");
    if (logo) logo.innerHTML = s.logoImage ? `<img src="${attr(s.logoImage)}" alt="${attr(s.companyName)} logo">` : esc(s.logoText || makeInitial(s.companyName));
  }
  function renderSettings() {
    const s = state.settings;
    document.title = `${s.companyName || "Goyal Borewells"} | B2B Industrial Supply House`;
    renderBrand();
    setText("#utilityBadge", s.utilityBadge || "B2B Bulk Supply");
    setText("#utilityText", s.utilityText || "Manufacturer · Trader · Project Material Supplier");
    setText("#utilityPhone", `Call: ${s.phone || ""}`);
    setText("#utilityMail", s.email || "");
    setHref("#utilityPhone", `tel:${plainPhone(s.phone)}`);
    setHref("#utilityMail", `mailto:${s.email || ""}`);
    setHTML("#homeHeading", heroTitle(s.homeHeading));
    setText("#homeDescription", s.homeDesc);
    setText("#aboutHeading", s.aboutHeading);
    setText("#aboutText", s.aboutText);
    setText("#bosHeading", s.bosHeading);
    setText("#bosText", s.bosText);
    setText("#footerCompany", s.companyName);
    setText("#footerText", s.footerText);
    setText("#footPhone", s.phone);
    setText("#footEmail", s.email);
    setText("#footAddress", s.address);
    setText("#copyCompany", s.companyName);
    setText("#phoneView", s.phone);
    setText("#emailView", s.email);
    setText("#instaLabel", instagramLabel(s.instagram));
    setText("#addressView", s.address);
    setHref("#phoneView", `tel:${plainPhone(s.phone)}`);
    setHref("#emailView", `mailto:${s.email || ""}`);
    setHref("#instaView", instagramHref(s.instagram));
    setHref("#floatInstagram", instagramHref(s.instagram));
    setHref("#floatCall", `tel:${plainPhone(s.phone)}`);
    const wa = whatsappLink();
    ["#headerWhatsapp", "#heroWhatsapp", "#floatWhatsapp"].forEach(sel => setHref(sel, wa));
    setText("#year", new Date().getFullYear());
    applyTheme();
  }
  function renderHeroBlocks() {
    const chips = DEFAULT.chips || [];
    const metrics = DEFAULT.metrics || [];
    const processes = DEFAULT.processes || [];
    const cats = sortRows(state.categories).slice(0, 4);

    setHTML("#heroChips", chips.map(c => `<span class="chip">${esc(c)}</span>`).join(""));
    setHTML("#metricRow", metrics.map(m => `<div class="metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join(""));
    setHTML("#processList", processes.map((p, i) => `<div class="process-row"><span>${String(i + 1).padStart(2, "0")}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div></div>`).join(""));

    setHTML("#supplyGrid", cats.map(c => `<div class="supply-item">
      <div class="supply-icon">${c.image ? `<img src="${attr(c.image)}" alt="${attr(c.name)}">` : esc(c.icon || "•")}</div>
      <div><h3>${esc(c.name)}</h3><small>${esc(c.description)}</small></div>
    </div>`).join(""));
  }
  function renderCategories() {
    const rows = sortRows(state.categories);
    setHTML("#categoryGrid", rows.map(c => `<article class="category-card reveal">
      <div class="cat-icon">${c.image ? `<img src="${attr(c.image)}" alt="${attr(c.name)}">` : esc(c.icon || "•")}</div>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.description)}</p>
    </article>`).join(""));
  }
  function renderFilters() {
    const cats = ["All", ...new Set(sortRows(state.categories).map(c => c.name))];
    setHTML("#productFilters", cats.map(c => `<button class="filter-btn ${state.activeFilter === c ? "active" : ""}" data-filter="${attr(c)}" type="button">${esc(c)}</button>`).join(""));
    $$(".filter-btn").forEach(btn => btn.addEventListener("click", () => {
      state.activeFilter = btn.dataset.filter || "All";
      renderProducts();
      renderFilters();
      revealNow();
    }));
  }
  function productCard(product) {
    const imageStyle = product.image ? `style="background-image:url('${attr(product.image)}')"` : "";
    const imageClass = product.image ? "has-img" : "";
    const rate = product.rate ? product.rate : (product.price_type || "Ask for Price");
    const unit = product.unit ? ` / ${product.unit}` : "";
    const waText = `Hello Goyal Borewells, I want quotation for ${product.name}. Category: ${product.category}. Rate: ${rate}${unit}.`;
    return `<article class="product-card reveal">
      <div class="product-media ${imageClass}" ${imageStyle} data-initial="${attr(makeInitial(product.name))}"></div>
      <div class="product-body">
        <span class="product-tag">${esc(product.category)}</span>
        <h3>${esc(product.name)}</h3>
        <p>${esc(product.description)}</p>
        <div class="product-rate">${esc(rate)}${esc(unit)}</div>
        <div class="product-meta"><span>MOQ: ${esc(product.moq || "As per order")}</span><span>${esc(product.price_type || "Ask for Price")}</span><span>SKU: ${esc(product.sku || "N/A")}</span><span>${esc(product.material || "Project Material")}</span></div>
        <a class="btn btn-primary" href="${attr(whatsappLink(waText))}" target="_blank" rel="noopener">Request Quote</a>
      </div>
    </article>`;
  }
  function renderProducts() {
    let rows = sortRows(state.products);
    if (state.activeFilter !== "All") rows = rows.filter(p => p.category === state.activeFilter);
    setHTML("#productGrid", rows.length ? rows.map(productCard).join("") : `<div class="empty-state">No products available.</div>`);
  }
  function renderCatalogues() {
    const rows = sortRows(state.catalogues);
    setHTML("#catalogueGrid", rows.length ? rows.map(c => {
      const link = c.link || "#contact";
      const fileName = fileNameFromTitle(c.name, "pdf");
      const isDownload = link && !link.startsWith("#");
      return `<article class="catalogue-card reveal">
        <div class="doc-icon">PDF</div>
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.description)}</p>
        <a class="btn btn-copper" href="${attr(link)}" ${isDownload ? `download="${attr(fileName)}" onclick="return GB_downloadFile(event, this.href, '${attr(fileName)}')"` : ""} rel="noopener">Open</a>
      </article>`;
    }).join("") : `<div class="empty-state">No catalogue available.</div>`);
  }
  function renderGallery() {
    const rows = sortRows(state.gallery);
    setHTML("#galleryGrid", rows.length ? rows.map(g => `<article class="gallery-item ${g.image ? "has-img" : ""} reveal" ${g.image ? `style="background-image:url('${attr(g.image)}')"` : ""}><div class="gallery-copy"><h3>${esc(g.title)}</h3><p>${esc(g.caption || g.category)}</p></div></article>`).join("") : `<div class="empty-state">No gallery available.</div>`);
  }
  function renderIndustries() {
    setHTML("#industryPills", (DEFAULT.industries || []).map(i => `<span>${esc(i)}</span>`).join(""));
  }
  function fillEnquiryCategory() {
    const select = $("#enquiryCategory");
    if (!select) return;
    const current = select.value;
    select.innerHTML = sortRows(state.categories).map(c => `<option>${esc(c.name)}</option>`).join("");
    if (current) select.value = current;
  }
  function renderStateDistrict() {
    const stateSelect = $("#stateSelect");
    const districtSelect = $("#districtSelect");
    const states = DEFAULT.states || {};
    if (!stateSelect || !districtSelect) return;
    stateSelect.innerHTML = `<option value="">Select State</option>` + Object.keys(states).map(s => `<option value="${attr(s)}">${esc(s)}</option>`).join("");
    stateSelect.addEventListener("change", () => {
      const rows = states[stateSelect.value] || [];
      districtSelect.innerHTML = `<option value="">Select District</option>` + rows.map(d => `<option value="${attr(d)}">${esc(d)}</option>`).join("");
    });
  }
  function revealNow() {
    const items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("show")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("show"); io.unobserve(entry.target); } });
    }, { threshold: .08 });
    items.forEach(el => io.observe(el));
  }
  function renderAll() {
    renderSettings();
    renderHeroBlocks();
    renderCategories();
    renderFilters();
    renderProducts();
    renderCatalogues();
    renderGallery();
    renderIndustries();
    fillEnquiryCategory();
    revealNow();
  }
  async function loadPublicData() {
    if (!state.sb) { renderAll(); return; }
    try {
      const [settingsRes, categoriesRes, productsRes, catalogueRes, galleryRes] = await Promise.all([
        state.sb.from("site_settings").select("data").eq("id", "main").maybeSingle(),
        state.sb.from("categories").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        state.sb.from("products").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        state.sb.from("catalogues").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        state.sb.from("gallery").select("*").eq("is_active", true).order("sort_order", { ascending: true })
      ]);
      if (settingsRes.data?.data) state.settings = { ...clone(DEFAULT.settings), ...settingsRes.data.data, theme: { ...(DEFAULT.settings.theme || {}), ...(settingsRes.data.data.theme || {}) } };
      if (categoriesRes.data?.length) state.categories = categoriesRes.data;
      if (productsRes.data?.length) state.products = productsRes.data;
      if (catalogueRes.data?.length) state.catalogues = catalogueRes.data;
      if (galleryRes.data?.length) state.gallery = galleryRes.data;
    } catch (err) {
      console.warn(err);
    }
    renderAll();
  }
  function bindPublicUI() {
    const mobileBtn = $("#mobileMenuBtn");
    const mobilePanel = $("#mobilePanel");
    mobileBtn?.addEventListener("click", () => mobilePanel?.classList.toggle("open"));
    $$("#mobilePanel a").forEach(a => a.addEventListener("click", () => mobilePanel?.classList.remove("open")));
    $("#closeLoginBtn")?.addEventListener("click", closeLogin);
    window.addEventListener("hashchange", checkAdminHash);
    $("#enquiryForm")?.addEventListener("submit", submitEnquiry);
  }
  function formObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }
  async function submitEnquiry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const btn = $("#enquirySubmitBtn");
    const data = formObject(form);
    data.created_at = new Date().toISOString();
    btn.disabled = true;
    btn.textContent = "Submitting...";
    try {
      if (state.sb) {
        const { error } = await state.sb.from("enquiries").insert({
          company: data.company,
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          city: data.city,
          state: data.state,
          district: data.district,
          business: data.business,
          category: data.category,
          quantity: data.quantity,
          message: data.message,
          status: "New"
        });
        if (error) throw error;
      }
      const waText = `New B2B Enquiry%0ACompany: ${data.company}%0AName: ${data.name}%0AMobile: ${data.mobile}%0ACity: ${data.city}, ${data.district}, ${data.state}%0ACategory: ${data.category}%0AQuantity: ${data.quantity || "N/A"}%0ARequirement: ${data.message}`;
      window.open(whatsappLink(decodeURIComponent(waText)), "_blank");
      form.reset();
      showToast("Enquiry submitted successfully");
    } catch (err) {
      console.error(err);
      showToast("Enquiry submit nahi ho paayi");
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit B2B Enquiry";
    }
  }
  function checkAdminHash() {
    if (location.hash === "#admin") openLogin();
  }
  function openLogin() {
    if (!state.sb) {
      showToast("Supabase connection missing");
      return;
    }
    $("#loginModal")?.classList.add("open");
    $("#loginModal")?.setAttribute("aria-hidden", "false");
  }
  function closeLogin() {
    $("#loginModal")?.classList.remove("open");
    $("#loginModal")?.setAttribute("aria-hidden", "true");
    if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
  }
  async function handleLogin(event) {
    event.preventDefault();
    const msg = $("#authMessage");
    const data = formObject(event.currentTarget);
    if (msg) msg.textContent = "";
    try {
      const { error } = await state.sb.auth.signInWithPassword({ email: data.email, password: data.password });
      if (error) throw error;
      closeLogin();
      await openAdmin();
    } catch (err) {
      if (msg) msg.textContent = "Login failed";
    }
  }
  async function openAdmin() {
    $("#adminApp")?.classList.remove("hidden");
    await ensureSeedData();
    await loadAdminData();
    renderAdminTables();
    fillAdminForms();
  }
  async function logout() {
    await state.sb?.auth.signOut();
    $("#adminApp")?.classList.add("hidden");
  }
  async function ensureSeedData() {
    if (!state.sb) return;
    try {
      const { data: settingsData } = await state.sb.from("site_settings").select("id").eq("id", "main").maybeSingle();
      if (!settingsData) await state.sb.from("site_settings").upsert({ id: "main", data: clone(DEFAULT.settings) });
      const { count: catCount } = await state.sb.from("categories").select("id", { count: "exact", head: true });
      if (!catCount) await state.sb.from("categories").insert(clone(DEFAULT.categories));
      const { count: prodCount } = await state.sb.from("products").select("id", { count: "exact", head: true });
      if (!prodCount) await state.sb.from("products").insert(clone(DEFAULT.products));
      const { count: docCount } = await state.sb.from("catalogues").select("id", { count: "exact", head: true });
      if (!docCount) await state.sb.from("catalogues").insert(clone(DEFAULT.catalogues));
      const { count: galCount } = await state.sb.from("gallery").select("id", { count: "exact", head: true });
      if (!galCount) await state.sb.from("gallery").insert(clone(DEFAULT.gallery));
    } catch (err) {
      console.warn(err);
    }
  }
  async function loadAdminData() {
    if (!state.sb) return;
    const [settingsRes, categoriesRes, productsRes, catalogueRes, galleryRes, enquiriesRes] = await Promise.all([
      state.sb.from("site_settings").select("data").eq("id", "main").maybeSingle(),
      state.sb.from("categories").select("*").order("sort_order", { ascending: true }),
      state.sb.from("products").select("*").order("sort_order", { ascending: true }),
      state.sb.from("catalogues").select("*").order("sort_order", { ascending: true }),
      state.sb.from("gallery").select("*").order("sort_order", { ascending: true }),
      state.sb.from("enquiries").select("*").order("created_at", { ascending: false })
    ]);
    if (settingsRes.data?.data) state.settings = { ...clone(DEFAULT.settings), ...settingsRes.data.data, theme: { ...(DEFAULT.settings.theme || {}), ...(settingsRes.data.data.theme || {}) } };
    state.categories = categoriesRes.data || [];
    state.products = productsRes.data || [];
    state.catalogues = catalogueRes.data || [];
    state.gallery = galleryRes.data || [];
    state.enquiries = enquiriesRes.data || [];
    renderAll();
  }
  function adminRows(table, rows, columns) {
    if (!rows?.length) return `<div class="empty-state">No records found.</div>`;
    const head = `<tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join("")}<th>Action</th></tr>`;
    const body = rows.map(row => `<tr>${columns.map(c => `<td>${esc(c.render ? c.render(row) : row[c.key])}</td>`).join("")}<td><div class="table-actions"><button class="edit-btn" data-table="${table}" data-id="${attr(row.id)}">Edit</button><button class="delete-btn" data-table="${table}" data-id="${attr(row.id)}">Delete</button></div></td></tr>`).join("");
    return `<table class="data-table"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  }
  function enquiryTable(rows) {
    if (!rows?.length) return `<div class="empty-state">No enquiries found.</div>`;
    return `<table class="data-table"><thead><tr><th>Date</th><th>Company</th><th>Name</th><th>Mobile</th><th>Location</th><th>Category</th><th>Requirement</th></tr></thead><tbody>${rows.map(e => `<tr><td>${esc(new Date(e.created_at).toLocaleString())}</td><td>${esc(e.company)}</td><td>${esc(e.name)}</td><td>${esc(e.mobile)}</td><td>${esc([e.city,e.district,e.state].filter(Boolean).join(", "))}</td><td>${esc(e.category)}</td><td>${esc(e.message)}</td></tr>`).join("")}</tbody></table>`;
  }
  function renderAdminTables() {
    setText("#stEnq", state.enquiries.length);
    setText("#stProd", state.products.length);
    setText("#stCatg", state.categories.length);
    setText("#stGal", state.gallery.length);
    setHTML("#recentTable", enquiryTable(state.enquiries.slice(0, 5)));
    setHTML("#productTable", adminRows("products", state.products, [
      { key: "name", label: "Product" },
      { key: "category", label: "Category" },
      { key: "rate", label: "Rate" },
      { key: "sku", label: "SKU" },
      { key: "image", label: "Photo", render: row => row.image ? "Uploaded" : "No Photo" }
    ]));
    setHTML("#categoryTable", adminRows("categories", state.categories, [
      { key: "name", label: "Category" },
      { key: "icon", label: "Icon" },
      { key: "image", label: "Image URL" },
      { key: "description", label: "Description" },
      { key: "is_active", label: "Status", render: row => row.is_active === false ? "Hidden" : "Active" }
    ]));
    setHTML("#catalogueTable", adminRows("catalogues", state.catalogues, [
      { key: "name", label: "Name" },
      { key: "type", label: "Type" },
      { key: "link", label: "PDF Link" },
      { key: "is_active", label: "Status", render: row => row.is_active === false ? "Hidden" : "Active" }
    ]));
    setHTML("#galleryTable", adminRows("gallery", state.gallery, [
      { key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "caption", label: "Caption" }
    ]));
    setHTML("#enquiryTable", enquiryTable(state.enquiries));
    bindTableActions();
    updateCategorySelects();
  }
  function bindAdminUI() {
    $("#loginForm")?.addEventListener("submit", handleLogin);
    $("#logoutBtn")?.addEventListener("click", logout);
    $("#viewWebsiteBtn")?.addEventListener("click", () => {
      $("#adminApp")?.classList.add("hidden");
      if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
    });
    $$(".admin-sidebar [data-sec]").forEach(btn => btn.addEventListener("click", () => {
      $$(".admin-sidebar [data-sec]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".admin-sec").forEach(sec => sec.classList.remove("active"));
      $(`#${btn.dataset.sec}`)?.classList.add("active");
      setText("#adminTitle", btn.textContent);
    }));
    $("#productForm")?.addEventListener("submit", e => saveRow(e, "products", ["name", "category", "rate", "unit", "sku", "moq", "material", "price_type", "image", "description", "sort_order", "is_active"], "imageFile"));
    $("#categoryForm")?.addEventListener("submit", e => saveRow(e, "categories", ["name", "icon", "image", "description", "sort_order", "is_active"], "imageFile"));
    $("#catalogueForm")?.addEventListener("submit", e => saveRow(e, "catalogues", ["name", "type", "link", "description", "sort_order", "is_active"], "pdfFile", "link"));
    $("#galleryForm")?.addEventListener("submit", e => saveRow(e, "gallery", ["title", "category", "image", "caption", "sort_order", "is_active"], "imageFile"));
    $("#settingsForm")?.addEventListener("submit", saveSettings);
    $("#themeForm")?.addEventListener("submit", saveTheme);
    $("#exportCsvBtn")?.addEventListener("click", exportCSV);
    $("#clearEnquiriesBtn")?.addEventListener("click", clearEnquiries);
    $$(".js-reset").forEach(btn => btn.addEventListener("click", () => {
      const form = $(`#${btn.dataset.form}`);
      form?.reset();
      updateMediaPreview(form, "");
    }));
    ["productForm", "galleryForm", "categoryForm"].forEach(id => {
      const form = $(`#${id}`);
      form?.elements.imageFile?.addEventListener("change", () => {
        const file = form.elements.imageFile.files?.[0];
        updateMediaPreview(form, file ? URL.createObjectURL(file) : form.elements.image?.value);
      });
      form?.elements.image?.addEventListener("input", () => updateMediaPreview(form, form.elements.image.value));
    });

    const catalogueForm = $("#catalogueForm");
    catalogueForm?.elements.pdfFile?.addEventListener("change", () => {
      const file = catalogueForm.elements.pdfFile.files?.[0];
      updateMediaPreview(catalogueForm, file ? URL.createObjectURL(file) : catalogueForm.elements.link?.value);
    });
    catalogueForm?.elements.link?.addEventListener("input", () => updateMediaPreview(catalogueForm, catalogueForm.elements.link.value));
  }
  function updateCategorySelects() {
    const html = sortRows(state.categories).map(c => `<option value="${attr(c.name)}">${esc(c.name)}</option>`).join("");
    const select = $("#productCategorySelect");
    if (select) select.innerHTML = html;
  }
  function bindTableActions() {
    $$(".edit-btn").forEach(btn => btn.addEventListener("click", () => editRecord(btn.dataset.table, btn.dataset.id)));
    $$(".delete-btn").forEach(btn => btn.addEventListener("click", () => deleteRecord(btn.dataset.table, btn.dataset.id)));
  }
  function formByTable(table) {
    return { products: "productForm", categories: "categoryForm", catalogues: "catalogueForm", gallery: "galleryForm" }[table];
  }
  function stateKey(table) { return table === "catalogues" ? "catalogues" : table; }
  function editRecord(table, id) {
    const form = $(`#${formByTable(table)}`);
    const row = state[stateKey(table)]?.find(r => String(r.id) === String(id));
    if (!form || !row) return;
    Object.keys(row).forEach(key => {
      if (!form.elements[key] || form.elements[key].type === "file") return;
      form.elements[key].value = typeof row[key] === "boolean" ? String(row[key]) : (row[key] ?? "");
    });
    updateMediaPreview(form, table === "catalogues" ? row.link : row.image);
    showToast("Record loaded for edit");
  }
  async function deleteRecord(table, id) {
    if (!state.sb) return;
    if (!confirm("Delete this record?")) return;
    const { error } = await state.sb.from(table).delete().eq("id", id);
    if (error) return showToast("Delete failed");
    await loadAdminData();
    renderAdminTables();
    showToast("Deleted");
  }
  async function uploadMedia(file, folder) {
    if (!file || !state.sb) return "";
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await state.sb.storage.from("gb-media").upload(path, file, { upsert: false, cacheControl: "3600" });
    if (error) throw error;
    const { data } = state.sb.storage.from("gb-media").getPublicUrl(path);
    return data?.publicUrl || "";
  }
  function updateMediaPreview(form, url) {
    const previewMap = {
      productForm: "#productImagePreview",
      galleryForm: "#galleryImagePreview",
      categoryForm: "#categoryImagePreview",
      catalogueForm: "#cataloguePdfPreview"
    };
    const previewId = previewMap[form?.id] || "";
    const preview = previewId ? $(previewId) : null;
    if (!preview) return;
    if (!url) {
      preview.innerHTML = "";
      return;
    }
    if (form?.id === "catalogueForm") {
      preview.innerHTML = `<a href="${attr(url)}" target="_blank" rel="noopener">PDF Ready</a>`;
      return;
    }
    preview.innerHTML = `<img src="${attr(url)}" alt="Preview">`;
  }
  async function saveRow(event, table, fields, fileField, fileTarget = "image") {
    event.preventDefault();
    if (!state.sb) return;
    const form = event.currentTarget;
    const data = formObject(form);
    const payload = {};
    fields.forEach(field => payload[field] = data[field] ?? "");
    payload.sort_order = Number(payload.sort_order || 0);
    if ("is_active" in payload) payload.is_active = payload.is_active === "true";
    else payload.is_active = true;
    const file = fileField && form.elements[fileField]?.files?.[0];
    if (file) payload[fileTarget] = await uploadMedia(file, table);
    let error;
    if (data.id) ({ error } = await state.sb.from(table).update(payload).eq("id", data.id));
    else ({ error } = await state.sb.from(table).insert(payload));
    if (error) return showToast("Save failed");
    form.reset();
    updateMediaPreview(form, "");
    await loadAdminData();
    renderAdminTables();
    showToast("Saved");
  }
  function fillAdminForms() {
    const s = state.settings;
    const form = $("#settingsForm");
    if (form) {
      ["companyName", "brandLine", "phone", "email", "instagram", "address", "logoText", "logoImage", "homeHeading", "homeDesc", "aboutHeading", "aboutText", "bosHeading", "bosText", "footerText"].forEach(k => {
        if (form.elements[k]) form.elements[k].value = s[k] || "";
      });
    }
    const themeForm = $("#themeForm");
    if (themeForm) {
      const t = s.theme || {};
      ["primary", "accent", "dark", "light", "radius"].forEach(k => { if (themeForm.elements[k]) themeForm.elements[k].value = t[k] || themeForm.elements[k].value; });
    }
  }
  async function saveSettings(event) {
    event.preventDefault();
    if (!state.sb) return;
    const data = formObject(event.currentTarget);
    const next = { ...state.settings, ...data, theme: state.settings.theme || {} };
    const { error } = await state.sb.from("site_settings").upsert({ id: "main", data: next });
    if (error) return showToast("Content save failed");
    state.settings = next;
    renderAll();
    showToast("Content saved");
  }
  async function saveTheme(event) {
    event.preventDefault();
    if (!state.sb) return;
    const data = formObject(event.currentTarget);
    const next = { ...state.settings, theme: { ...state.settings.theme, ...data } };
    const { error } = await state.sb.from("site_settings").upsert({ id: "main", data: next });
    if (error) return showToast("Theme save failed");
    state.settings = next;
    renderAll();
    showToast("Theme saved");
  }
  function exportCSV() {
    const rows = state.enquiries || [];
    const cols = ["created_at", "company", "name", "mobile", "email", "city", "district", "state", "business", "category", "quantity", "message", "status"];
    const csv = [cols.join(","), ...rows.map(r => cols.map(c => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goyal-borewells-enquiries-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function clearEnquiries() {
    if (!state.sb || !confirm("Clear all enquiries?")) return;
    const { error } = await state.sb.from("enquiries").delete().neq("id", "");
    if (error) return showToast("Clear failed");
    await loadAdminData();
    renderAdminTables();
    showToast("Enquiries cleared");
  }
  async function restoreSession() {
    if (!state.sb) return;
    const { data } = await state.sb.auth.getSession();
    if (data?.session) {
      await ensureSeedData();
    }
  }
  function init() {
    initSupabase();
    renderStateDistrict();
    bindPublicUI();
    bindAdminUI();
    loadPublicData();
    restoreSession();
    setTimeout(checkAdminHash, 250);
    setTimeout(() => $("#preloader")?.classList.add("hide"), 450);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
