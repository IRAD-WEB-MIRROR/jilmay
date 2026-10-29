(function () {
  "use strict";

  var DATA = window.JILMAY;
  var I18N = window.JL_I18N;
  var PAGE = 20;

  /* ---------- language ---------- */
  var LANG = "en";
  try { var saved = localStorage.getItem("jl_lang"); if (saved && I18N[saved]) LANG = saved; } catch (e) {}
  function T(k, vars) {
    var d = I18N[LANG], v = (d && k in d) ? d[k] : I18N.en[k];
    if (v === undefined) return k;
    if (vars) v = String(v).replace(/\{(\w+)\}/g, function (m, n) { return vars[n] !== undefined ? vars[n] : m; });
    return v;
  }
  function catName(id) { return (I18N[LANG].cat || {})[id] || I18N.en.cat[id] || id; }
  function cityName(c) { return (I18N[LANG].city || {})[c] || c; }
  function countText(n) {
    if (LANG === "ru") {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return T("count1", { n: n });
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return T("count2", { n: n });
      return T("countN", { n: n });
    }
    return T(n === 1 ? "count1" : "countN", { n: n });
  }

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* Pastel backgrounds for listing thumbnails, one per category */
  var TINTS = {
    horses: ["#fff1dc", "#ffe2bd"], transport: ["#e3efff", "#cfe2ff"], parts: ["#eceff3", "#dde2e9"],
    home: ["#fff6cf", "#ffe98f"], realestate: ["#e9f7ec", "#d2efd9"], electronics: ["#efe9ff", "#e0d6ff"],
    construction: ["#ffe9e3", "#ffd5ca"], livestock: ["#f1f8e4", "#e1f0c7"], personal: ["#fde8f1", "#f9d2e4"],
    kids: ["#e5f7fb", "#cbeef6"], food: ["#fff0e0", "#ffdcb5"], jobs: ["#e8eefc", "#d5e0fa"],
    services: ["#e6f6f4", "#cdeee9"], free: ["#f9eefe", "#efd9fb"]
  };


  var catById = {};
  DATA.categories.forEach(function (c) { catById[c.id] = c; });

  /* Give every listing an id and a search string */
  DATA.listings.forEach(function (l, i) {
    l.id = i + 1;
    var c = catById[l.c];
    var extra = ["en", "ir", "ru"].map(function (lg) { return (I18N[lg].cat[l.c] || "") + " " + ((I18N[lg].city || {})[l.city] || ""); }).join(" ");
    l._search = norm([l.t, l.d, l.city, l.s, extra].join(" "));
  });

  /* ---------- helpers ---------- */
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/ı/g, "i").replace(/İ/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/ğ/g, "g").replace(/ñ/g, "n").replace(/ş/g, "s").replace(/ç/g, "c")
      .replace(/[^\p{L}\p{N}\s]/gu, " ");
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function dollars(d) {
    return "$" + (d >= 100 || d === Math.round(d) ? Math.round(d).toLocaleString("en-US") : d.toFixed(2));
  }
  function usd(som) { return dollars(som / DATA.rate); }
  function priceHtml(l) {
    if (l.p === 0) return '<div class="price free">' + T("free") + "</div>";
    if (l.p === null || l.p === undefined) {
      return '<div class="price neg">' + T("neg") + (l.cur === "usd" ? ' <span class="usd">' + T("negUsd") + "</span>" : "") + "</div>";
    }
    var unit = l.unit ? " / " + T("u_" + l.unit) : "";
    if (l.cur === "usd") return '<div class="price">' + dollars(l.p) + unit + "</div>";
    var alt = l.p >= 5000 ? '<span class="usd" title="' + esc(T("usdAt") + " " + DATA.rate.toFixed(2) + " " + T("som")) + '">≈ ' + usd(l.p) + "</span>" : "";
    return '<div class="price">' + fmt(LANG === "ru" ? String(l.p).replace(".", ",") : l.p) + " " + T("som") + unit + alt + "</div>";
  }
  function when(mins) {
    var now = new Date();
    var t = new Date(now.getTime() - mins * 60000);
    var hhmm = ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2);
    if (mins < 60) return mins <= 1 ? T("justNow") : T("minAgo", { n: mins });
    var startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (t.getTime() >= startToday) return T("today", { t: hhmm });
    if (t.getTime() >= startToday - 86400000) return T("yesterday", { t: hhmm });
    return t.getDate() + " " + T("months")[t.getMonth()];
  }
  function initials(name) {
    var parts = name.replace(/[^\p{L}\s-]/gu, "").split(/\s+/).filter(Boolean);
    return ((parts[0] || "?")[0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }
  function avaColor(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return "hsl(" + h + ", 55%, 52%)";
  }

  /* ---------- routing (state lives in the URL hash) ---------- */
  function parseHash() {
    var h = location.hash.replace(/^#/, "");
    if (h === "cargo" || h === "calc") return { view: "cargo" };
    if (h === "about" || h === "rules") return { view: "home", modal: h, cat: "", city: "", q: "" };
    var qs = new URLSearchParams(h.replace(/^\/?\??/, ""));
    return { view: "home", cat: qs.get("cat") || "", city: qs.get("city") || "", q: qs.get("q") || "" };
  }
  function setHome(next) {
    var cur = parseHash();
    var st = {
      cat: next.cat !== undefined ? next.cat : (cur.cat || ""),
      city: next.city !== undefined ? next.city : (cur.city || ""),
      q: next.q !== undefined ? next.q : (cur.q || "")
    };
    var qs = new URLSearchParams();
    if (st.cat) qs.set("cat", st.cat);
    if (st.city) qs.set("city", st.city);
    if (st.q) qs.set("q", st.q);
    var s = qs.toString();
    location.hash = s ? "/?" + s : "/";
  }

  /* ---------- rendering ---------- */
  var shown = PAGE;
  var lastKey = "";

  function filtered(st) {
    var tokens = norm(st.q).split(/\s+/).filter(Boolean);
    return DATA.listings.filter(function (l) {
      if (st.cat && l.c !== st.cat) return false;
      if (st.city && l.city !== st.city) return false;
      for (var i = 0; i < tokens.length; i++) if (l._search.indexOf(tokens[i]) === -1) return false;
      return true;
    }).sort(function (a, b) {
      if (!!b.vip !== !!a.vip) return b.vip ? 1 : -1;
      return a.m - b.m;
    });
  }

  function renderCats(st) {
    var counts = {};
    DATA.listings.forEach(function (l) {
      if (!st.city || l.city === st.city) counts[l.c] = (counts[l.c] || 0) + 1;
    });
    $("#cats").innerHTML = DATA.categories.map(function (c) {
      return '<button type="button" class="cat' + (st.cat === c.id ? " on" : "") + '" data-cat="' + c.id + '">' +
        '<span class="cat-e">' + c.e + "</span>" +
        '<span class="cat-n">' + esc(catName(c.id)) + "</span>" +
        '<span class="cat-c">' + (counts[c.id] || 0) + "</span></button>";
    }).join("");
  }

  function renderCities(st) {
    var html = '<button type="button" class="chip' + (!st.city ? " on" : "") + '" data-city="">' + T("allIrad") + "</button>";
    html += DATA.cities.map(function (c) {
      return '<button type="button" class="chip' + (st.city === c ? " on" : "") + '" data-city="' + esc(c) + '">' + esc(cityName(c)) + "</button>";
    }).join("");
    $("#cities").innerHTML = html;
  }

  function card(l) {
    var c = catById[l.c];
    var tint = TINTS[l.c] || ["#f2f3f5", "#e6e8ec"];
    return '<div class="card" role="button" tabindex="0" data-id="' + l.id + '" aria-label="' + esc(l.t) + '">' +
      '<div class="thumb" style="background:linear-gradient(145deg,' + tint[0] + "," + tint[1] + ')">' +
        (l.img
          ? '<img class="thumb-img" src="' + esc(l.img) + '" alt="" loading="lazy">' +
            '<span class="photos">📷 1</span>'
          : '<span class="thumb-bg-e" style="top:10%;left:12%">' + c.e + "</span>" +
            '<span class="thumb-bg-e" style="bottom:8%;right:10%">' + c.e + "</span>" +
            '<span class="thumb-e">' + l.e + "</span>") +
        (l.vip ? '<span class="badge-vip">VIP</span>' : "") +
        '<span class="fav" data-fav title="' + esc(T("fav")) + '">🤍</span>' +
      "</div>" +
      '<div class="card-body">' +
        priceHtml(l) +
        '<div class="title">' + esc(l.t) + "</div>" +
        '<div class="desc">' + esc(l.d) + "</div>" +
        '<div class="where-line">📍 ' + esc(cityName(l.city)) + " · " + when(l.m) + "</div>" +
        '<div class="meta"><span class="ava" style="background:' + avaColor(l.s) + '">' + esc(initials(l.s)) + "</span>" +
          '<span class="seller">' + esc(l.s) + "</span>" + (l.pro ? '<span class="pro">PRO</span>' : "") +
        "</div>" +
      "</div></div>";
  }

  function renderFeed(st) {
    var list = filtered(st);
    var key = st.cat + "|" + st.city + "|" + st.q;
    if (key !== lastKey) { shown = PAGE; lastKey = key; }

    var cat = st.cat ? catById[st.cat] : null;
    var title = st.q ? T("results", { q: st.q }) : (cat ? cat.e + " " + catName(cat.id) : T("feedTitle"));
    if (st.city) title = T("inCity", { title: title, city: cityName(st.city) });
    $("#feedTitle").textContent = title;
    $("#feedSub").textContent = countText(list.length);

    var notice = { horses: T("nHorses"), livestock: T("nCattle") }[st.cat];
    if (!notice && st.q && /(^|[^\p{L}])(cows?|cattle|bulls?|ox|oxen|calf|yaks?|beef|bovine|корова|бык|говядин\p{L}*|уй|bodo)([^\p{L}]|$)/iu.test(st.q)) notice = T("nCattle");
    if (!notice && st.q && /(^|[^\p{L}])(horsemeat|kazy|kazi|chuchuk|конина|казы|чучук|jılkı eti)([^\p{L}]|$)/iu.test(st.q)) notice = T("nHorses");
    if (!notice && st.q && /(^|[^\p{L}])(dollars?|usd|exchange|tulparcoin|tlpr|crypto\p{L}*|bitcoin|доллар\p{L}*|обмен|крипт\p{L}*|valyuta)([^\p{L}]|$)/iu.test(st.q)) notice = T("nMoney");
    $("#notice").hidden = !notice;
    $("#notice").textContent = notice || "";

    if (!list.length) {
      $("#grid").innerHTML = '<div class="empty"><span class="empty-e">😶</span><h2>' + T("emptyH") + "</h2>" +
        "<p>" + T("emptyP") + "</p></div>";
      $("#moreBtn").hidden = true;
      return;
    }
    $("#grid").innerHTML = list.slice(0, shown).map(card).join("");
    $("#moreBtn").hidden = list.length <= shown;
  }

  function render() {
    var st = parseHash();
    $("#viewHome").hidden = st.view !== "home";
    $("#viewCargo").hidden = st.view !== "cargo";
    $(".cargo-link").classList.toggle("on", st.view === "cargo");

    if (st.view === "cargo") {
      if (location.hash === "#calc") $("#calc").scrollIntoView({ behavior: "smooth", block: "center" });
      else window.scrollTo(0, 0);
      return;
    }
    $("#searchInput").value = st.q;
    $("#searchCat").value = st.cat;
    renderCats(st);
    renderCities(st);
    renderFeed(st);
    if (st.modal) openInfo(st.modal);
  }

  /* ---------- search & filters ---------- */
  function fillCatSelect() {
    var keep = $("#searchCat").value;
    $("#searchCat").innerHTML = '<option value="">' + esc(T("allCats")) + "</option>" + DATA.categories.map(function (c) {
      return '<option value="' + c.id + '">' + c.e + " " + esc(catName(c.id)) + "</option>";
    }).join("");
    $("#searchCat").value = keep;
  }
  fillCatSelect();

  $("#searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    setHome({ q: $("#searchInput").value.trim(), cat: $("#searchCat").value });
  });
  $("#searchCat").addEventListener("change", function () {
    setHome({ q: $("#searchInput").value.trim(), cat: $("#searchCat").value });
  });
  /* live search while typing (only on the marketplace page) */
  var typing;
  $("#searchInput").addEventListener("input", function () {
    clearTimeout(typing);
    typing = setTimeout(function () {
      var st = parseHash();
      if (st.view !== "home") return;
      history.replaceState(null, "", "#/?" + new URLSearchParams(
        Object.entries({ cat: st.cat, city: st.city, q: $("#searchInput").value.trim() }).filter(function (p) { return p[1]; })
      ).toString());
      var now = parseHash();
      renderCats(now); renderFeed(now);
    }, 180);
  });

  $("#cats").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]");
    if (!b) return;
    var st = parseHash();
    setHome({ cat: st.cat === b.dataset.cat ? "" : b.dataset.cat, q: "" });
  });
  $("#cities").addEventListener("click", function (e) {
    var b = e.target.closest("[data-city]");
    if (b) setHome({ city: b.dataset.city });
  });
  $("#moreBtn").addEventListener("click", function () {
    shown += PAGE;
    renderFeed(parseHash());
  });
  $(".logo").addEventListener("click", function (e) {
    e.preventDefault();
    location.hash = "/";
  });
  $$("[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      $("#" + a.dataset.scroll).scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  /* ---------- cargo calculator ---------- */
  function calc() {
    var kg = parseFloat($("#calcKg").value);
    var rate = parseFloat($("#calcZone").value);
    if (!(kg > 0)) { $("#calcPrice").textContent = "—"; $("#calcUsd").textContent = ""; return; }
    var cost = Math.max(1, Math.ceil(kg * 10) / 10) * rate;
    $("#calcPrice").textContent = "$" + cost.toFixed(2);
    $("#calcUsd").textContent = T("cUsdOnly");
  }
  $("#calcKg").addEventListener("input", calc);
  $("#calcZone").addEventListener("change", calc);
  calc();

  /* ---------- the login loop ---------- */
  var REASONS = { item: "rItem", fav: "rFav", post: "rPost", cargo: "rCargo", general: "rGeneral" };
  var reasonKey = "rGeneral";
  var timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function busy(btn, text) {
    btn.disabled = true;
    btn.dataset.label = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>' + text;
  }
  function idle(btn) {
    btn.disabled = false;
    if (btn.dataset.label) btn.textContent = btn.dataset.label;
  }
  function shake(el) {
    el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
  }
  function msg(id, text, info) {
    var m = $(id);
    m.textContent = text || "";
    m.classList.toggle("info", !!info);
  }
  function face(pane, e) { $(".auth-face", pane).textContent = e; }

  function showPane(name) {
    ["Login", "Forgot", "Register"].forEach(function (p) {
      $("#pane" + p).hidden = p.toLowerCase() !== name;
    });
    var pane = $("#pane" + name.charAt(0).toUpperCase() + name.slice(1));
    var first = $("input", pane);
    if (first && window.matchMedia("(pointer: fine)").matches) setTimeout(function () { first.focus(); }, 30);
  }

  function resetLogin() {
    clearTimers();
    ["#loginBtn", "#forgotBtn", "#regBtn"].forEach(function (b) { idle($(b)); });
    msg("#loginMsg"); msg("#forgotMsg"); msg("#regMsg");
    $$("#authModal input").forEach(function (i) { i.classList.remove("bad"); });
    $("#loginPass").value = "";
    face($("#paneLogin"), "😊");
    face($("#paneForgot"), "🤔");
    face($("#paneRegister"), "🥳");
  }

  function openLogin(reason) {
    closeModals();
    resetLogin();
    reasonKey = REASONS[reason] || "rGeneral";
    $("#loginReason").textContent = T(reasonKey);
    $("#authModal").hidden = false;
    document.body.style.overflow = "hidden";
    showPane("login");
  }

  function backToLogin() {
    resetLogin();
    showPane("login");
  }

  /* Step 1: any password is wrong */
  $("#paneLogin").addEventListener("submit", function (e) {
    e.preventDefault();
    var user = $("#loginUser"), pass = $("#loginPass"), btn = $("#loginBtn");
    if (!user.value.trim() || !pass.value) {
      msg("#loginMsg", T("mFill"));
      shake($("#paneLogin"));
      return;
    }
    msg("#loginMsg");
    busy(btn, T("mChecking"));
    later(function () {
      idle(btn);
      pass.classList.add("bad");
      face($("#paneLogin"), "😬");
      msg("#loginMsg", T("mWrong"));
      shake($("#paneLogin"));
      later(function () {
        msg("#forgotMsg");
        $("#forgotEmail").classList.remove("bad");
        if (user.value.indexOf("@") > -1) $("#forgotEmail").value = user.value.trim();
        face($("#paneForgot"), "🤔");
        showPane("forgot");
      }, 2200);
    }, 1300);
  });

  /* Step 2: every email is invalid */
  $("#paneForgot").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("#forgotEmail"), btn = $("#forgotBtn");
    if (!email.value.trim()) {
      msg("#forgotMsg", T("mEmail"));
      shake($("#paneForgot"));
      return;
    }
    msg("#forgotMsg");
    busy(btn, T("mSending"));
    later(function () {
      idle(btn);
      email.classList.add("bad");
      face($("#paneForgot"), "😵");
      msg("#forgotMsg", T("mInvalid"));
      shake($("#paneForgot"));
      later(backToLogin, 2400);
    }, 1400);
  });

  /* Registering doesn't help either */
  $("#paneRegister").addEventListener("submit", function (e) {
    e.preventDefault();
    var user = $("#regUser"), btn = $("#regBtn");
    if (!$("#regName").value.trim() || !user.value.trim() || !$("#regPass").value) {
      msg("#regMsg", T("mAll"));
      shake($("#paneRegister"));
      return;
    }
    msg("#regMsg");
    busy(btn, T("mCreating"));
    later(function () {
      idle(btn);
      user.classList.add("bad");
      face($("#paneRegister"), "🙃");
      msg("#regMsg", T("mExists"));
      shake($("#paneRegister"));
      later(function () {
        var u = user.value.trim();
        backToLogin();
        $("#loginUser").value = u;
      }, 2400);
    }, 1400);
  });

  $$("#authModal [data-goto]").forEach(function (b) {
    b.addEventListener("click", function () {
      var to = b.dataset.goto;
      if (to === "login") backToLogin();
      else { resetLogin(); showPane(to); }
    });
  });

  /* Everything that needs an account opens the loop */
  document.addEventListener("click", function (e) {
    var cardEl = e.target.closest(".card");
    if (cardEl) { openLogin(e.target.closest("[data-fav]") ? "fav" : "item"); return; }
    var t = e.target.closest("[data-login]");
    if (t) {
      e.preventDefault();
      if (t.classList.contains("btn-post") && t.closest("#viewCargo")) openLogin("cargo");
      else if (t.classList.contains("btn-post")) openLogin("post");
      else openLogin("general");
    }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("card")) {
      e.preventDefault();
      openLogin("item");
    }
    if (e.key === "Escape") closeModals();
  });

  /* ---------- info modals ---------- */
  var infoOpen = "";
  function openInfo(which) {
    infoOpen = which;
    $("#infoBody").innerHTML = T(which === "about" ? "infoAbout" : "infoRules");
    $("#authModal").hidden = true;
    $("#infoModal").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModals() {
    clearTimers();
    $("#authModal").hidden = true;
    $("#infoModal").hidden = true;
    document.body.style.overflow = "";
  }
  $$("[data-modal]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); openInfo(a.dataset.modal); });
  });
  $$(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]") || e.target.closest("[data-close-link]")) closeModals();
    });
  });

  /* ---------- languages ---------- */
  var toastTimer;
  function toast(text) {
    var t = $("#toast");
    t.textContent = text;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function applyStatic() {
    $$("[data-i]").forEach(function (el) { el.textContent = T(el.dataset.i); });
    $$("[data-ih]").forEach(function (el) { el.innerHTML = T(el.dataset.ih); });
    $$("[data-ip]").forEach(function (el) { el.placeholder = T(el.dataset.ip); });
    $$("[data-it]").forEach(function (el) { el.title = T(el.dataset.it); });
    $$("[data-ia]").forEach(function (el) { el.setAttribute("aria-label", T(el.dataset.ia)); });
    $$("[data-lang]").forEach(function (b) { b.classList.toggle("on", b.dataset.lang === LANG); });
    document.documentElement.lang = I18N.htmlLang[LANG] || "en";
    document.title = T("docTitle");
    $("#loginReason").textContent = T(reasonKey);
    if (window.JL_onLang) window.JL_onLang();
  }
  function setLang(lg) {
    if (!I18N[lg] || lg === LANG) return;
    LANG = lg;
    try { localStorage.setItem("jl_lang", lg); } catch (e) {}
    applyStatic();
    fillCatSelect();
    calc();
    if (!$("#infoModal").hidden && infoOpen) openInfo(infoOpen);
    render();
  }
  $$("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.lang); });
  });
  applyStatic();
  calc();

  window.addEventListener("hashchange", render);
  render();

  /* "≈ $" amounts follow the morning bazaar rate from IradOne's market data (data.js keeps the last one) */
  fetch("https://iradone.com/data/today.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) {
      var m = j && j.rates && j.rates.bazaar && j.rates.bazaar.usd_mid;
      if (m > 0 && m !== DATA.rate) { DATA.rate = m; render(); }
    })
    .catch(function () { /* keep the rate in data.js */ });

  /* ---------- welcome popups (three stacked, once per browser session) ---------- */
  (function () {
    var layer = $("#promoLayer");
    var order = ["#promoShip", "#promoCoupons", "#promoWheel"];   // top first
    var KEY = "jl_promos_seen";
    var seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
    if (/[?&#]promos\b/.test(location.href)) seen = false;   // add #promos to the URL to see them again
    if (seen) return;

    var countdownTimer;
    function remaining() { return order.filter(function (s) { return !$(s).hidden; }); }
    function closePromo(el) {
      el.classList.add("promo-out");
      setTimeout(function () {
        el.hidden = true;
        el.classList.remove("promo-out");
        var left = remaining();
        if (!left.length) {
          layer.hidden = true;
          document.body.style.overflow = "";
          clearInterval(countdownTimer);
          try { sessionStorage.setItem(KEY, "1"); } catch (e) {}
        } else if (left[0] === "#promoCoupons") {
          startCountdown();
        }
      }, 180);
    }
    var cdLeft = 9 * 60 + 59;
    function endsLine() {
      var mmss = ("0" + Math.floor(cdLeft / 60)).slice(-2) + ":" + ("0" + (cdLeft % 60)).slice(-2);
      $("#endsLine").innerHTML = T("pEnds", { t: '<b class="countdown" id="countdown">' + mmss + "</b>" });
    }
    endsLine();
    function startCountdown() {
      var x = $("#promoCoupons .promo-x");
      setTimeout(function () { x.classList.add("shown"); }, 2500);
      clearInterval(countdownTimer);
      countdownTimer = setInterval(function () {
        cdLeft = cdLeft > 0 ? cdLeft - 1 : 9 * 60 + 59;   // it never actually ends
        endsLine();
      }, 1000);
    }

    $$("#promoLayer [data-promo-close]").forEach(function (b) {
      b.addEventListener("click", function () { closePromo(b.closest(".promo")); });
    });
    $$("#promoLayer [data-promo-claim]").forEach(function (b) {
      b.addEventListener("click", function () { toast(T(b.dataset.promoClaim)); closePromo(b.closest(".promo")); });
    });

    /* Ship to: Irad is never on the list */
    $("#shipTo").addEventListener("change", function () {
      shipNote();
    });
    function shipName() { var o = $("#shipTo").selectedOptions[0]; return o ? o.textContent : ""; }
    var shipTouched = false;
    function shipNote() {
      shipTouched = true;
      var n = $("#shipNote");
      n.removeAttribute("data-i");
      if ($("#shipTo").value === "other") { n.textContent = T("pShipNo"); n.classList.add("warn"); }
      else { n.textContent = T("pShipYes", { c: shipName() }); n.classList.remove("warn"); }
    }
    $("#shipSave").addEventListener("click", function () {
      toast(T("pSaved", { c: $("#shipTo").value === "other" ? T("pNowhere") : shipName() }));
      closePromo($("#promoShip"));
    });

    /* The wheel always lands on the same prize */
    var spun = false;
    $("#spinBtn").addEventListener("click", function () {
      if (spun) { toast(T("pCollectToast")); closePromo($("#promoWheel")); return; }
      spun = true;
      this.disabled = true;
      var wheel = $("#wheel");
      wheel.style.transform = "rotate(" + (360 * 6 - 22.5) + "deg)";   // lands on 🐎 every time
      var btn = this;
      setTimeout(function () {
        var r = $("#wheelResult");
        r.hidden = false;
        r.setAttribute("data-ih", "pWon");
        r.innerHTML = T("pWon");
        btn.disabled = false;
        btn.dataset.i = "pCollect";
        btn.textContent = T("pCollect");
      }, 3600);
    });

    window.JL_onLang = function () { endsLine(); if (shipTouched) shipNote(); };
    layer.hidden = false;
    document.body.style.overflow = "hidden";
  })();

  /* ---------- bottom feedback bar (once per browser session, after the welcome popups) ---------- */
  (function () {
    var bar = $("#rateBar"), KEY = "jl_rate_seen", seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
    if (/[?&#]promos\b/.test(location.href)) seen = false;
    if (seen) return;
    function done() { try { sessionStorage.setItem(KEY, "1"); } catch (e) {} }
    function hide() { bar.classList.add("rate-out"); setTimeout(function () { bar.hidden = true; }, 250); done(); }
    function show() { bar.hidden = false; }
    /* appear a few seconds after the welcome popups are gone */
    (function wait() {
      if ($("#promoLayer").hidden) setTimeout(show, 4000);
      else setTimeout(wait, 500);
    })();
    $("#rateX").addEventListener("click", hide);
    $$("#rateBar [data-rate]").forEach(function (b) {
      b.addEventListener("click", function () {
        var n = b.dataset.rate;
        $("#rateAsk").hidden = true;
        $("#rateDoneE").textContent = b.textContent;
        $("#rateDoneT").setAttribute("data-i", "fb" + n);
        $("#rateDoneT").textContent = T("fb" + n);
        $("#rateDone").hidden = false;
        done();
        setTimeout(hide, 4500);
      });
    });
  })();

})();
