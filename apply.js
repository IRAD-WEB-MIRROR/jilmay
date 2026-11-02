/* Applications: submit, follow by number, my applications. Nothing typed is sent anywhere. */
window.MoveCore = (function () {
  "use strict";
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function pick(r, a) { return a[Math.floor(r() * a.length)]; }
  /* dates are UTC midnights standing for days of the Irad calendar */
  function addDays(d, n) { var x = new Date(d.getTime()); x.setUTCDate(x.getUTCDate() + n); return x; }
  function isW(d) { var g = d.getUTCDay(); return g !== 0 && g !== 6; }
  function addW(d, n) { var x = d; while (n > 0) { x = addDays(x, 1); if (isW(x)) n--; } return x; }
  function onW(d) { var x = d; while (!isW(x)) x = addDays(x, 1); return x; }
  function onDow(d, dow) { var x = d; while (x.getUTCDay() !== dow) x = addDays(x, 1); return x; }
  function wdays(a, b) { var n = 0, x = a; while (x < b) { x = addDays(x, 1); if (isW(x)) n++; } return n; }
  function iso(d) { return d.toISOString().slice(0, 10); }
  function day(s) { return new Date(s + "T00:00:00Z"); }
  function ymd(s) { var d = day("20" + s.slice(0, 2) + "-" + s.slice(2, 4) + "-" + s.slice(4, 6)); return isNaN(d) || iso(d).replace(/-/g, "").slice(2) !== s ? null : d; }
  /* now in Irad time: {today, hour, min} */
  function irt(at) { var t = new Date((at || Date.now()) + 6 * 3600e3); return { today: day(t.toISOString().slice(0, 10)), hour: t.getUTCHours(), min: t.getUTCMinutes() }; }
  function check(s, alpha) { return alpha.charAt(hash("mv" + s) % alpha.length); }
  /* the events that have happened by now: an event without an hour happens at 10:00 */
  function upTo(ev, now) { return ev.filter(function (e) { return e.d < now.today || (+e.d === +now.today && (e.h == null ? 10 : e.h) <= now.hour); }); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fill(s, v) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return v && v[k] != null ? v[k] : m; }); }

  /* the kept list: [{r: number, t: day taken, a: day of the visitor's step}] */
  function store(key, max) {
    function load() { try { var a = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(a) ? a.filter(function (x) { return x && x.r; }) : []; } catch (e) { return []; } }
    function save(a) { try { localStorage.setItem(key, JSON.stringify(a.slice(-max))); } catch (e) {} }
    return {
      load: load,
      get: function (ref) { return load().filter(function (x) { return x.r === ref; })[0] || null; },
      keep: function (ref, extra) { var a = load(), o = a.filter(function (x) { return x.r === ref; })[0] || { r: ref }; a = a.filter(function (x) { return x.r !== ref; }); for (var k in extra) o[k] = extra[k]; a.push(o); save(a); },
      drop: function (ref) { save(load().filter(function (x) { return x.r !== ref; })); }
    };
  }

  /* The page: three tabs (submit, follow, mine) inside el. O is the office (see offices/*.js). */
  function mount(el, O) {
    var S = store(O.key, O.max || 10), c = O.cls, L = O.L;
    function $(s) { return el.querySelector(s); }
    function $$(s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }
    function now() { return irt(); }
    var tabIds = ["submit", "follow", "mine"], cur = 0;
    function draw() {
      el.innerHTML = '<div class="' + c.tabs + '" role="tablist">' + tabIds.map(function (id, i) { return '<a href="#' + id + '" role="tab" data-tab="' + i + '">' + esc(L(O.t.tabs[i])) + "</a>"; }).join("") + "</div>" +
        '<div data-pane="0"><form class="' + c.form + '" id="mvs" novalidate>' + O.form(now()) + '<div><button class="' + c.btn + '" type="submit">' + esc(L(O.t.send)) + '</button></div></form><div id="mvsr"></div></div>' +
        '<div data-pane="1" hidden><form class="' + c.form + '" id="mvf" novalidate><div><label for="mvn">' + esc(L(O.t.number)) + '</label><input id="mvn" type="text" autocomplete="off" spellcheck="false" placeholder="' + esc(O.sample) + '"></div><div><button class="' + c.btn + '" type="submit">' + esc(L(O.t.follow)) + '</button></div></form><div id="mvfr"></div></div>' +
        '<div data-pane="2" hidden><div id="mvm"></div></div>';
      $$("[data-tab]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); tab(+a.getAttribute("data-tab")); try { history.replaceState(null, "", location.pathname + location.search + (O.hashPrefix || "#") + tabIds[+a.getAttribute("data-tab")]); } catch (x) {} }); });
      $("#mvs").addEventListener("submit", function (e) {
        e.preventDefault();
        var r = O.submit($("#mvs"), now());
        if (typeof r === "string") { $("#mvsr").innerHTML = '<div class="' + c.warn + '">' + r + "</div>"; return; }
        S.keep(r.ref, { t: iso(now().today) });
        $("#mvsr").innerHTML = '<div class="' + c.done + '">' + r.html + '</div><p><a href="#" class="' + c.btn2 + '" data-go="' + esc(r.ref) + '">' + esc(L(O.t.followThis)) + "</a></p>";
        $("#mvs").reset(); if (O.after) O.after($("#mvs"));
        $("#mvsr [data-go]").addEventListener("click", function (ev) { ev.preventDefault(); go(r.ref); });
      });
      $("#mvf").addEventListener("submit", function (e) { e.preventDefault(); show($("#mvn").value); });
      if (O.wire) O.wire($("#mvs"), now());
      tab(cur);
    }
    function tab(i) { cur = i; $$("[data-pane]").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== String(i); }); $$("[data-tab]").forEach(function (a) { a.className = a.getAttribute("data-tab") === String(i) ? "on" : ""; }); if (i === 2) mine(); }
    function go(ref) { tab(1); $("#mvn").value = ref; show(ref); }
    function show(s) {
      var n = now(), p = O.parse(s, n.today), out = $("#mvfr");
      if (p === "bad" || p === "none") { out.innerHTML = '<div class="' + c.warn + '">' + esc(L(O.t[p])) + "</div>"; return; }
      var kept = S.get(p.ref), act = kept && kept.a || null, pl = O.plan(p, act), seen = upTo(pl.ev, n);
      if (!seen.length) seen = pl.ev.slice(0, 1);
      var last = seen[seen.length - 1], wait = pl.wait && last.k === pl.wait.at && !act ? pl.wait : null;
      var rows = seen.slice().reverse().map(function (e) { return '<tr><td class="' + (c.num || "") + '">' + esc(O.when(e)) + "</td><td>" + O.text(e, p) + "</td></tr>"; }).join("");
      out.innerHTML = '<div class="' + c.box + '"><p><b>' + esc(L(O.t.number)) + ":</b> " + esc(p.ref) + "<br>" + O.head(p) + "<br><b>" + esc(L(O.t.status)) + ":</b> " + esc(O.status(last, p)) + "</p></div>" +
        (wait ? '<div class="' + c.note + '">' + wait.html + '<p><button type="button" class="' + c.btn + '" id="mvact">' + esc(wait.btn) + "</button></p></div>" : "") +
        '<table class="' + c.table + '"><thead><tr><th>' + esc(L(O.t.date)) + "</th><th>" + esc(L(O.t.event)) + "</th></tr></thead><tbody>" + rows + "</tbody></table>" +
        (kept ? "" : '<p><a href="#" class="' + c.btn2 + '" id="mvkeep">' + esc(L(O.t.keep)) + "</a></p>");
      if ($("#mvact")) $("#mvact").addEventListener("click", function () { S.keep(p.ref, { a: iso(now().today) }); show(p.ref); });
      if ($("#mvkeep")) $("#mvkeep").addEventListener("click", function (e) { e.preventDefault(); S.keep(p.ref, {}); show(p.ref); });
    }
    function mine() {
      var a = S.load(), n = now(), box = $("#mvm");
      if (!a.length) { box.innerHTML = "<p>" + esc(L(O.t.empty)) + "</p>"; return; }
      box.innerHTML = '<table class="' + c.table + '"><thead><tr><th>' + esc(L(O.t.number)) + "</th><th>" + esc(L(O.t.status)) + "</th><th></th></tr></thead><tbody>" +
        a.slice().reverse().map(function (x) {
          var p = O.parse(x.r, n.today);
          if (typeof p === "string") return "";
          var pl = O.plan(p, x.a || null), seen = upTo(pl.ev, n), last = seen[seen.length - 1] || pl.ev[0];
          return '<tr><td><a href="#" data-go="' + esc(x.r) + '">' + esc(x.r) + "</a><br><small>" + O.head(p) + "</small></td><td>" + esc(O.status(last, p)) + '</td><td><a href="#" data-rm="' + esc(x.r) + '">' + esc(L(O.t.remove)) + "</a></td></tr>";
        }).join("") + "</tbody></table>";
      $$("#mvm [data-go]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); go(b.getAttribute("data-go")); }); });
      $$("#mvm [data-rm]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); S.drop(b.getAttribute("data-rm")); mine(); }); });
    }
    var h = (location.hash || "").replace(O.hashPrefix || "#", "");
    if (h === "follow") cur = 1; else if (h === "mine") cur = 2;
    draw();
    var q = /[?&]n=([^&#]+)/.exec(location.search) || /[?&]n=([^&#]+)/.exec(location.hash);
    if (q) go(decodeURIComponent(q[1]));
    return { redraw: draw };
  }

  return { hash: hash, rng: rng, ri: ri, pick: pick, addDays: addDays, isW: isW, addW: addW, onW: onW, onDow: onDow, wdays: wdays,
    iso: iso, day: day, ymd: ymd, irt: irt, check: check, upTo: upTo, esc: esc, fill: fill, store: store, mount: mount };
})();

window.JL_APPLY = (function () {
  "use strict";
  var C = window.MoveCore, START = "2026-10-01", DIG = "0123456789";
  var X = {
    en: { tabs: ["⚡ Quick apply", "Check my application", "My applications"], send: "Send application 🚀", number: "Application number", follow: "Check",
      followThis: "See my application 👀", status: "Status", date: "When", event: "What happened", keep: "Save this number on this device", remove: "remove",
      empty: "No applications yet. Find a job in 💼 Jobs and apply in one click!",
      bad: "This is not a Jılmay application number. It looks like JL30614-K7-4811.", none: "Application not found. Check the number.",
      h: "⚡ Quick apply: no account needed", lead: "Apply for any job on Jılmay without registering. Your phone number goes only to the employer.",
      job: "Vacancy", name: "Your first name", phone: "Phone", msg: "A few words about you (optional)", msgPh: "Experience, when you can start…", agree: "I agree to the Jılmay Rules",
      eName: "Please write your name 🙂", ePhone: "Please write your phone number 📱", eAgree: "Please agree to the Jılmay Rules",
      done: "🎉 Application sent to {s}! Your number is {ref}. Keep your phone on: employers on Jılmay usually answer within a week.",
      gone: "This listing is no longer on Jılmay.", from: "Sent {d}",
      back: "← Back to listings",
      S: { sent: "Sent ✉️", seen: "Viewed 👀", remind: "Waiting for the employer", fav: "In favourites ⭐", call: "Wants to call you 📞", miss: "Missed call 📵", choose: "Employer is choosing ⏳", filled: "Position filled 😔", removed: "Listing removed 🗑️", similar: "Position filled 😔" },
      T: { sent: "✉️ Application sent to {s}.", seen: "👀 {s} viewed your application.", remind: "🔔 {s} has not opened your application for 3 days. We sent a reminder.",
        fav: "⭐ {s} added your application to favourites.", call: "📞 {s} wants to talk to you. Keep your phone on!", miss: "📵 {s} tried to call you but could not get through.",
        choose: "⏳ {s} is still choosing. We will tell you.", filled: "😔 The vacancy is closed: the position has been filled. Don't give up!", removed: "🗑️ The listing was removed by the seller.",
        similar: "💼 New jobs in {c} are waiting for you in the Jobs section." },
      employer: "the employer" },
    ru: { tabs: ["⚡ Быстрый отклик", "Проверить отклик", "Мои отклики"], send: "Отправить отклик 🚀", number: "Номер отклика", follow: "Проверить",
      followThis: "Смотреть мой отклик 👀", status: "Статус", date: "Когда", event: "Что произошло", keep: "Сохранить номер на этом устройстве", remove: "удалить",
      empty: "Откликов пока нет. Найдите работу в разделе 💼 Работа и откликнитесь в один клик!",
      bad: "Это не номер отклика Jılmay. Он выглядит так: JL30614-K7-4811.", none: "Отклик не найден. Проверьте номер.",
      h: "⚡ Быстрый отклик: без регистрации", lead: "Откликайтесь на любую вакансию на Jılmay без регистрации. Ваш телефон увидит только работодатель.",
      job: "Вакансия", name: "Ваше имя", phone: "Телефон", msg: "Пара слов о себе (необязательно)", msgPh: "Опыт, когда можете выйти…", agree: "Я согласен с Правилами Jılmay",
      eName: "Напишите, пожалуйста, имя 🙂", ePhone: "Напишите, пожалуйста, телефон 📱", eAgree: "Нужно согласиться с Правилами Jılmay",
      done: "🎉 Отклик отправлен: {s}! Ваш номер {ref}. Держите телефон включённым: работодатели на Jılmay обычно отвечают в течение недели.",
      gone: "Этого объявления больше нет на Jılmay.", from: "Отправлен {d}",
      back: "← К объявлениям",
      S: { sent: "Отправлен ✉️", seen: "Просмотрен 👀", remind: "Ждём работодателя", fav: "В избранном ⭐", call: "Хотят позвонить 📞", miss: "Пропущенный звонок 📵", choose: "Работодатель выбирает ⏳", filled: "Вакансия закрыта 😔", removed: "Объявление удалено 🗑️", similar: "Вакансия закрыта 😔" },
      T: { sent: "✉️ Отклик отправлен: {s}.", seen: "👀 {s}: ваш отклик просмотрен.", remind: "🔔 {s} не открывает ваш отклик уже 3 дня. Мы отправили напоминание.",
        fav: "⭐ {s} добавил ваш отклик в избранное.", call: "📞 {s} хочет с вами поговорить. Держите телефон включённым!", miss: "📵 {s} пытался вам дозвониться, но не смог.",
        choose: "⏳ {s} ещё выбирает. Мы вам сообщим.", filled: "😔 Вакансия закрыта: место уже занято. Не сдавайтесь!", removed: "🗑️ Продавец удалил объявление.",
        similar: "💼 Новые вакансии в городе {c} ждут вас в разделе «Работа»." },
      employer: "работодатель" },
    ir: { tabs: ["⚡ Tez arız", "Arızdı teksherüü", "Menin arızdarım"], send: "Arızdı jönötüü 🚀", number: "Arızdın nomeri", follow: "Teksherüü",
      followThis: "Arızımdı köröm 👀", status: "Abalı", date: "Kachan", event: "Emne boldu", keep: "Bul nomerdi ushul tüzmöktö saktoo", remove: "öchürüü",
      empty: "Azırınacha arız jok. 💼 Jumush bölümünön jumush taap, bir basuu menen arız beriñiz!",
      bad: "Bul Jılmaydın arız nomeri emes. Al mınday bolot: JL30614-K7-4811.", none: "Arız tabılgan jok. Nomerdi tekshersiñiz.",
      h: "⚡ Tez arız: kattoosuz", lead: "Jılmaydagı kaalagan jumushka kattoosuz arız beriñiz. Telefon nomeriñizdi jumush berüüchü gana köröt.",
      job: "Bosh orun", name: "Atıñız", phone: "Telefon", msg: "Özüñüz jönündö eki-üch söz (mildettüü emes)", msgPh: "Tajırıybañız, kachan bashtay alasız…", agree: "Jılmay Erejelerine makulmun",
      eName: "Atıñızdı jazıñız 🙂", ePhone: "Telefon nomeriñizdi jazıñız 📱", eAgree: "Jılmay Erejelerine makul boluñuz",
      done: "🎉 Arız jönötüldü: {s}! Nomeriñiz {ref}. Telefonuñuzdu öchürböñüz: Jılmaydagı jumush berüüchülör adatta bir jumanın ichinde joop berishet.",
      gone: "Bul jarnak Jılmayda emi jok.", from: "Jönötüldü {d}",
      back: "← Jarnaktarga",
      S: { sent: "Jönötüldü ✉️", seen: "Körüldü 👀", remind: "Jumush berüüchünü kütüüdöbüz", fav: "Tandalmalarda ⭐", call: "Siz menen süylöshkönü jatat 📞", miss: "Kabıl alınbagan chaluu 📵", choose: "Jumush berüüchü tandap jatat ⏳", filled: "Orun eelendi 😔", removed: "Jarnak öchürüldü 🗑️", similar: "Orun eelendi 😔" },
      T: { sent: "✉️ Arız jönötüldü: {s}.", seen: "👀 {s} arızıñızdı kördü.", remind: "🔔 {s} arızıñızdı 3 kündön beri achpay jatat. Eskertme jiberdik.",
        fav: "⭐ {s} arızıñızdı tandalmalarga koshtu.", call: "📞 {s} siz menen süylöshkönü jatat. Telefonuñuzdu öchürböñüz!", miss: "📵 {s} sizge chalıp, jete albadı.",
        choose: "⏳ {s} dagı ele tandap jatat. Sizge kabarlaybız.", filled: "😔 Bosh orun jabıldı: orun eelendi. Kayrattuu boluñuz!", removed: "🗑️ Satuuchu jarnaktı öchürdü.",
        similar: "💼 {c} shaarındagı jañı jumushtar Jumush bölümündö sizdi kütüüdö." },
      employer: "jumush berüüchü" }
  };
  var LANG = "en";
  function L(x) { return x; }
  function tx() { return X[LANG] || X.en; }
  function code(l) { return ("0" + (C.hash("jl" + l.t) % 1296).toString(36).toUpperCase()).slice(-2); }
  function at(d, h) { var x = C.addDays(d, Math.floor(h / 24)); return { d: x, h: h % 24 }; }
  function office(JOBS) {
    function job(c) { return JOBS.filter(function (l) { return code(l) === c; })[0] || null; }
    function body(d, h, c, n) { return "JL" + ("00" + doy(d)).slice(-3) + ("0" + h).slice(-2) + "-" + c + "-" + n; }
    function doy(d) { return Math.round((d - C.day(d.getUTCFullYear() + "-01-01")) / 864e5) + 1; }
    function makeRef(d, h, c, n3) { var b = body(d, h, c, n3 || String(100 + Math.floor(Math.random() * 900))); return b + C.check(b, DIG); }
    function parse(s, today) {
      var m = /^JL(\d{3})(\d{2})([A-Z0-9]{2})(\d{3})(\d)$/.exec(String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""));
      if (!m) return "bad";
      var y = today.getUTCFullYear(), h = +m[2], d0 = C.addDays(C.day(y + "-01-01"), +m[1] - 1);
      if (d0 > today) d0 = C.addDays(C.day((y - 1) + "-01-01"), +m[1] - 1);
      var b = body(d0, h, m[3], m[4]);
      if (+m[1] < 1 || +m[1] > 366 || h > 23 || C.check(b, DIG) !== m[5] || d0 < C.day(START)) return "none";
      return { ref: b + m[5], d0: d0, h0: h, c: m[3], job: job(m[3]) };
    }
    function plan(a) {
      var r = C.rng(C.hash("jlplan" + a.ref)), ev = [], t = a.h0, ri = function (x, y) { return C.ri(r, x, y); }, seen = false;
      function add(k, hrs) { if (hrs < t) hrs = t; t = hrs; var w = at(a.d0, a.h0 + hrs); ev.push({ k: k, d: w.d, h: w.h, v: {} }); }
      t = 0; add("sent", 0);
      if (r() < 0.8) { add("seen", ri(2, 40)); seen = true; }
      else { add("remind", 72); if (r() < 0.5) { add("seen", ri(80, 110)); seen = true; } }
      if (seen && r() < 0.35) add("fav", t + ri(3, 30));
      if (seen && r() < 0.2) { add("call", t + ri(2, 24)); if (r() < 0.5) add("miss", t + ri(1, 8)); }
      var end = ri(6, 8) * 24 + ri(9, 21) - a.h0, x = r();
      if (x < 0.07) { add("removed", end); return { ev: ev }; }
      if (x < 0.12) { add("choose", end); end = t + ri(3, 5) * 24; }
      add("filled", end);
      add("similar", t + 24 - ((a.h0 + t) % 24) + 10);
      return { ev: ev };
    }
    function seller(p) { return p.job ? p.job.s : tx().employer; }
    function fmt(d, h) { var M = (window.JL_I18N && (window.JL_I18N[LANG] || {}).months) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; return d.getUTCDate() + " " + M[d.getUTCMonth()] + (h == null ? "" : ", " + ("0" + h).slice(-2) + ":" + ("0" + (C.hash(String(+d) + h) % 60)).slice(-2)); }
    var O = {
      key: "jl_apps", max: 10, L: L, sample: "JL30614-K7-4811", hashPrefix: "#apply/",
      cls: { tabs: "mvtabs", form: "mvform", btn: "btn-post", btn2: "btn-ghost", warn: "notice", done: "mvdone", note: "notice", box: "mvbox", table: "mvt", num: "mvd" },
      t: null,
      when: function (e) { return fmt(e.d, e.h); },
      status: function (e) { return tx().S[e.k]; },
      head: function (p) { return p.job ? C.esc(p.job.e + " " + p.job.t) + " · " + C.esc(p.job.s) + " · 📍 " + C.esc(p.job.city) : C.esc(tx().gone) + " · " + C.esc(C.fill(tx().from, { d: fmt(p.d0) })); },
      text: function (e, p) { return C.esc(C.fill(tx().T[e.k], { s: seller(p), c: p.job ? p.job.city : "Irad" })); },
      form: function () {
        var T = tx();
        return "<h2>" + C.esc(T.h) + "</h2><p>" + C.esc(T.lead) + "</p>" +
          '<label for="mvj">' + C.esc(T.job) + '</label><select id="mvj">' + JOBS.map(function (l) { return '<option value="' + code(l) + '">' + C.esc(l.e + " " + l.t + " · " + l.city) + "</option>"; }).join("") + "</select>" +
          '<label for="mvnm">' + C.esc(T.name) + '</label><input id="mvnm" type="text" maxlength="40" autocomplete="given-name">' +
          '<label for="mvph">' + C.esc(T.phone) + '</label><input id="mvph" type="tel" maxlength="20" placeholder="+996 39 ___ __ __" autocomplete="tel">' +
          '<label for="mvmsg">' + C.esc(T.msg) + '</label><textarea id="mvmsg" rows="3" maxlength="500" placeholder="' + C.esc(T.msgPh) + '"></textarea>' +
          '<label class="mvchk"><input type="checkbox" id="mv1"> ' + C.esc(T.agree) + "</label>";
      },
      submit: function (f, now) {
        var T = tx();
        if (!(f.querySelector("#mvnm").value || "").trim()) return C.esc(T.eName);
        if ((f.querySelector("#mvph").value || "").replace(/\D/g, "").length < 6) return C.esc(T.ePhone);
        if (!f.querySelector("#mv1").checked) return C.esc(T.eAgree);
        var c = f.querySelector("#mvj").value, ref = makeRef(now.today, now.hour, c), l = job(c);
        return { ref: ref, html: C.fill(C.esc(T.done), { s: C.esc(l ? l.s : T.employer), ref: "<b>" + ref + "</b>" }) };
      },
      parse: parse, plan: plan
    };
    Object.defineProperty(O, "t", { get: function () { return tx(); } });
    O._gen = function (k, d0) { return makeRef(d0, k % 24, code(JOBS[k % JOBS.length]), String(100 + k % 900)); };
    O._final = function (pl) { var e = pl.ev; return e[e.length - 1].k === "similar" ? e[e.length - 2] : e[e.length - 1]; };
    return O;
  }
  var jobs = null, mounted = null, mountedLang = null;
  /* called by app.js when the #apply view is shown, and on a language change */
  function render(el, lang) {
    if (X[lang]) LANG = lang;
    if (!jobs) jobs = ((window.JILMAY || {}).listings || []).filter(function (l) { return l.c === "jobs" && !/^(Looking for |Ищу работу)/i.test(l.t); });
    if (mounted === el && mountedLang === LANG) return;
    mounted = el; mountedLang = LANG;
    el.innerHTML = '<div class="mvwrap"><p><a href="#/?cat=jobs" class="mvback">' + C.esc(tx().back) + '</a></p><div id="mvroot"></div></div>';
    C.mount(el.querySelector("#mvroot"), office(jobs));
  }
  return { render: render, office: office, X: X };
})();
