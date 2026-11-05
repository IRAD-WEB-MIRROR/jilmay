/* Ticket resale: people selling tickets they can't use for the circus, the opera and the philharmonic.
   Each ad is for a performance the venue itself lists, posted a few days before it and gone once it starts.
   The same for everyone (seeded by the performance), nothing stored. Loaded after data.js and before app.js. */
(function () {
  "use strict";
  var D = window.JILMAY;
  if (!D) return;

  // Venues: link, tiers [name, face value in som, rows].
  var VENUES = {
    opera: { name: "Opera Theatre", url: "https://talas-opera.korkom.org/afisha.html", link: "Talas Opera calendar", e: "🩰", meet: "the Opera Theatre, Theatre Square",
      tiers: [["stalls", 1500, 18], ["box", 1500, 0], ["balcony", 700, 6], ["gallery", 300, 5]] },
    phil: { name: "Philharmonic", url: "https://philharmonic.korkom.org/", link: "Talas Philharmonic season", e: "🎻", meet: "the Philharmonic, Liberty Boulevard" },
    circus: { name: "Equestrian Circus", url: "https://circus.korkom.org/tickets.html", link: "Equestrian Circus tickets", e: "🎪", meet: "the covered ring, Hippodrome Road",
      tiers: [["adult", 300, 12], ["child", 150, 12]] }
  };

  // Performances as the venues list them (talas-opera afisha.html, philharmonic index.html, circus index and
  // tickets pages, 3-5 Nov 2026): [venue, date, time, title, sold out, min som, max som].
  // When the shared culture season file exists, build this list from it instead (same fields).
  var SHOWS = [
    ["opera", "2026-11-08", "18:30", "La Traviata"], ["opera", "2026-11-14", "18:30", "La Traviata"], ["opera", "2026-11-15", "18:30", "Janyl (ballet)"],
    ["opera", "2026-11-20", "18:30", "Swan Lake", 1], ["opera", "2026-11-21", "18:30", "Swan Lake"], ["opera", "2026-11-22", "18:30", "Swan Lake"],
    ["opera", "2026-11-28", "18:30", "Eugene Onegin"], ["opera", "2026-11-29", "17:00", "Ballet School gala"],
    ["opera", "2026-12-05", "18:30", "The Nutcracker", 1], ["opera", "2026-12-06", "18:30", "The Nutcracker", 1], ["opera", "2026-12-12", "18:30", "Carmen"],
    ["opera", "2026-12-13", "18:30", "Giselle"], ["opera", "2026-12-19", "18:30", "The Nutcracker"], ["opera", "2026-12-20", "12:00", "The Nutcracker", 1],
    ["opera", "2026-12-26", "18:30", "The Nutcracker"], ["opera", "2026-12-27", "18:30", "The Nutcracker"], ["opera", "2026-12-30", "18:30", "New Year gala", 1],
    ["opera", "2027-01-09", "18:30", "Janyl (ballet)"], ["opera", "2027-01-10", "18:30", "Eugene Onegin"], ["opera", "2027-01-16", "18:30", "Swan Lake"],
    ["opera", "2027-01-17", "18:30", "La Traviata"],
    ["phil", "2026-11-07", "18:00", "The Desert Suites", 0, 300, 900], ["phil", "2026-11-21", "18:00", "Tchaikovsky 5", 0, 300, 900],
    ["phil", "2026-11-28", "18:00", "Ak-Kuu Folk Dance Ensemble", 0, 200, 600], ["phil", "2026-12-05", "18:00", "Janyl Baatyr evening", 0, 300, 700],
    ["phil", "2026-12-20", "17:00", "Christmas Oratorio", 0, 300, 900], ["phil", "2026-12-27", "17:00", "Ak-Kuu New Year concert", 0, 200, 600],
    ["phil", "2026-12-31", "21:00", "New Year's Eve Gala", 0, 1500, 3000], ["phil", "2027-01-16", "18:00", "Shostakovich 7", 0, 300, 900],
    ["phil", "2027-02-06", "18:00", "Young Soloists", 0, 200, 600],
    ["circus", "2026-12-28", "17:00", "New Year show"], ["circus", "2026-12-29", "17:00", "New Year show"], ["circus", "2026-12-30", "13:00", "New Year show", 1]
  ];
  // Summer season at the covered ring: 1 June - 15 September, Wednesday to Sunday at 17:00.
  (function () {
    for (var y = 2027; y <= 2030; y++) {
      for (var t = Date.UTC(y, 5, 1); t <= Date.UTC(y, 8, 15); t += 86400000) {
        var wd = new Date(t).getUTCDay();
        if (wd === 0 || wd >= 3) SHOWS.push(["circus", new Date(t).toISOString().slice(0, 10), "17:00", "Summer show", wd === 6 ? 1 : 0]);
      }
    }
  })();

  var WHY = [
    "Bought for my mother's birthday but she will be in Bishkek that week.",
    "My husband says he will not go to the ballet again, so it is my loss.",
    "Work trip to Nurzhan, cannot go. Real tickets from the box office.",
    "Child is sick, doctor says stay home. Selling at what I paid.",
    "Bought too many, my cousins changed their mind. Seats together.",
    "School concert on the same day, my daughter is singing, so I go there.",
    "Present from my work, I do not understand this music. Somebody enjoy.",
    "Wedding in the village that weekend. Can show photo of the tickets.",
    "Booked twice by mistake, once me, once my wife. Very good seats.",
    "Our guests from Almaty cancelled. No profit, just want my money back."
  ];
  var MEN = ["Aibek", "Nurlan", "Kanat", "Ermek", "Bakyt", "Almaz", "Azamat", "Marat", "Daniyar", "Talgat", "Sergei", "Oleg"];
  var WOMEN = ["Aigul", "Gulnara", "Nazira", "Asel", "Cholpon", "Ainura", "Dinara", "Meerim", "Zarina", "Elmira", "Natalya", "Kanykei"];
  var LAST = ["Toktosunov", "Sydykov", "Usenov", "Kadyrov", "Moldoev", "Ismailov", "Joldoshev", "Alymkulov", "Kenjebekov", "Omurov", "Petrenko", "Kim", "Bekov", "Esenaliev"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var now = Date.now(), seed = 0;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
  function pickOf(a) { return a[Math.floor(rnd() * a.length)]; }
  function person() {
    var w = rnd() < 0.55, f = pickOf(w ? WOMEN : MEN), l = pickOf(LAST);
    if (w && /(ov|ev|in)$/.test(l)) l += "a";
    return f + " " + l;
  }
  function round50(x) { return Math.max(50, Math.round(x / 50) * 50); }

  SHOWS.forEach(function (s) {
    var v = VENUES[s[0]], start = Date.parse(s[1] + "T" + s[2] + ":00+06:00");
    if (start < now || start - now > 21 * 86400000) return;
    seed = hash(s.join("|"));
    if (rnd() > (s[4] ? 0.95 : 0.65)) return;
    var ads = s[4] && rnd() < 0.5 ? 2 : 1;
    for (var k = 0; k < ads; k++) {
      var posted = start - Math.floor((1 + rnd() * 16) * 86400000);
      if (posted > now) continue;
      var tiers = v.tiers || [["stalls", s[6], 20], ["stalls, back", Math.round((s[5] + s[6]) / 2), 10], ["balcony", s[5], 6]];
      var tr = pickOf(tiers), n = rnd() < 0.15 ? 1 : rnd() < 0.75 ? 2 : 3 + Math.floor(rnd() * 2);
      var face = tr[1], f = pickOf([0.9, 1, 1, 1, 1.1, 1.2]), price = round50(face * n * f);
      var seat = tr[0] === "box" ? "box " + (1 + Math.floor(rnd() * 8)) : v === VENUES.circus ? "sector " + "ABCD".charAt(Math.floor(rnd() * 4)) + ", row " + (1 + Math.floor(rnd() * tr[2])) : tr[0] + ", row " + (1 + Math.floor(rnd() * tr[2]));
      var d = new Date(start + 6 * 3600000), when = DOW[d.getUTCDay()] + " " + d.getUTCDate() + " " + MON[d.getUTCMonth()];
      var desc = pickOf(WHY) + " " + v.name + ", " + s[3] + ", " + when + " at " + s[2] + ". " +
        (n > 1 ? "Price for all " + n + ", face value " + face + " som each. " : "Face value " + face + " som. ") +
        (s[4] ? "Box office has nothing left. " : "") + "Meet at " + v.meet + " before the show.";
      D.listings.push({
        c: "personal", e: v.e, city: "Talas", s: person(), m: Math.round((now - posted) / 60000), p: price,
        t: (n > 1 ? n + " tickets " : "1 ticket ") + s[3] + ", " + when + ", " + seat,
        d: desc, u: v.url, un: v.link, vip: rnd() < 0.05
      });
    }
  });
})();
