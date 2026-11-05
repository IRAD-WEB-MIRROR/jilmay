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
      box: 1 },
    phil: { name: "Philharmonic", url: "https://philharmonic.korkom.org/", link: "Talas Philharmonic season", e: "🎻", meet: "the Philharmonic, Liberty Boulevard" },
    akkuu: { name: "Philharmonic", url: "https://akkuu.korkom.org/tours.html", link: "Ak-Kuu concert dates", e: "💃", meet: "the Philharmonic, Liberty Boulevard" },
    circus: { name: "Equestrian Circus", url: "https://circus.korkom.org/tickets.html", link: "Equestrian Circus tickets", e: "🎪", meet: "the covered ring, Hippodrome Road",
      tiers: [["adult", 300, 12], ["child", 150, 12]] }
  };

  // Performances from the shared culture season file of the Körköm venues, written by the desk:
  // [venue, date, time, title, sold out, min som, max som]. Do not edit by hand.
  // SHOWS:start
  var SHOWS = [
    ["phil", "2026-10-03", "18:00", "Season Opening: Jumabaev and Tchaikovsky", 0, 300, 900],
    ["opera", "2026-10-03", "18:30", "Swan Lake", 0, 300, 1500],
    ["opera", "2026-10-04", "18:30", "Swan Lake", 0, 300, 1500],
    ["phil", "2026-10-10", "11:00", "Hello, Orchestra!", 0, 100, 100],
    ["opera", "2026-10-10", "18:30", "La Traviata", 0, 300, 1500],
    ["opera", "2026-10-11", "18:30", "Giselle", 0, 300, 1500],
    ["phil", "2026-10-17", "18:00", "Dvořák: From the New World", 0, 300, 900],
    ["opera", "2026-10-17", "18:30", "Carmen", 0, 300, 1500],
    ["opera", "2026-10-18", "18:30", "Janyl", 0, 300, 1500],
    ["phil", "2026-10-24", "11:00", "The Komuz and the Violin", 0, 100, 100],
    ["opera", "2026-10-24", "18:30", "Eugene Onegin", 0, 300, 1500],
    ["opera", "2026-10-25", "18:30", "La Traviata", 0, 300, 1500],
    ["phil", "2026-10-31", "18:00", "Rachmaninov and Borodin", 0, 300, 900],
    ["opera", "2026-10-31", "18:30", "Giselle", 0, 300, 1500],
    ["opera", "2026-11-01", "18:30", "Janyl", 0, 300, 1500],
    ["phil", "2026-11-07", "18:00", "The Desert Suites", 0, 300, 900],
    ["opera", "2026-11-08", "18:30", "La Traviata", 0, 300, 1500],
    ["phil", "2026-11-14", "11:00", "Who Lives in the Orchestra?", 0, 100, 100],
    ["opera", "2026-11-14", "18:30", "La Traviata", 0, 300, 1500],
    ["opera", "2026-11-15", "18:30", "Janyl", 0, 300, 1500],
    ["opera", "2026-11-20", "18:30", "Swan Lake", 1, 300, 1500],
    ["phil", "2026-11-21", "18:00", "Tchaikovsky 5", 0, 300, 900],
    ["opera", "2026-11-21", "18:30", "Swan Lake", 0, 300, 1500],
    ["opera", "2026-11-22", "18:30", "Swan Lake", 0, 300, 1500],
    ["phil", "2026-11-28", "18:00", "Concert", 0, 200, 600],
    ["opera", "2026-11-28", "18:30", "Eugene Onegin", 0, 300, 1500],
    ["phil", "2026-12-05", "18:00", "Janyl Baatyr", 0, 300, 700],
    ["opera", "2026-12-05", "18:30", "The Nutcracker", 1, 300, 1500],
    ["opera", "2026-12-06", "12:00", "The Nutcracker", 1, 300, 1500],
    ["opera", "2026-12-06", "18:30", "The Nutcracker", 1, 300, 1500],
    ["phil", "2026-12-12", "11:00", "Winter Animals", 0, 100, 100],
    ["opera", "2026-12-12", "18:30", "Carmen", 0, 300, 1500],
    ["opera", "2026-12-13", "18:30", "Giselle", 0, 300, 1500],
    ["opera", "2026-12-19", "18:30", "The Nutcracker", 0, 300, 1500],
    ["opera", "2026-12-20", "12:00", "The Nutcracker", 1, 300, 1500],
    ["phil", "2026-12-20", "17:00", "Christmas Oratorio", 0, 300, 900],
    ["opera", "2026-12-20", "18:30", "The Nutcracker", 1, 300, 1500],
    ["opera", "2026-12-26", "18:30", "The Nutcracker", 0, 300, 1500],
    ["opera", "2026-12-27", "12:00", "The Nutcracker", 0, 300, 1500],
    ["phil", "2026-12-27", "17:00", "New Year concert", 0, 200, 600],
    ["opera", "2026-12-27", "18:30", "The Nutcracker", 0, 300, 1500],
    ["circus", "2026-12-28", "13:00", "New Year at the Circus", 0, 150, 300],
    ["circus", "2026-12-28", "17:00", "New Year at the Circus", 0, 150, 300],
    ["circus", "2026-12-29", "13:00", "New Year at the Circus", 0, 150, 300],
    ["circus", "2026-12-29", "17:00", "New Year at the Circus", 0, 150, 300],
    ["circus", "2026-12-30", "13:00", "New Year at the Circus", 0, 150, 300],
    ["circus", "2026-12-30", "17:00", "New Year at the Circus", 0, 150, 300],
    ["opera", "2026-12-30", "18:30", "New Year gala", 1, 1000, 3000],
    ["phil", "2026-12-31", "21:00", "New Year's Eve Gala", 0, 1500, 3000],
    ["opera", "2027-01-09", "18:30", "Janyl", 0, 300, 1500],
    ["opera", "2027-01-10", "18:30", "Eugene Onegin", 0, 300, 1500],
    ["phil", "2027-01-16", "18:00", "Shostakovich 7", 0, 300, 900],
    ["opera", "2027-01-16", "18:30", "Swan Lake", 0, 300, 1500],
    ["opera", "2027-01-17", "18:30", "La Traviata", 0, 300, 1500],
    ["phil", "2027-01-23", "11:00", "The Komuz Has Three Strings", 0, 100, 100],
    ["opera", "2027-01-23", "18:30", "Giselle", 0, 300, 1500],
    ["opera", "2027-01-24", "18:30", "Carmen", 0, 300, 1500],
    ["phil", "2027-01-30", "18:00", "Mozart and Haydn", 0, 300, 900],
    ["opera", "2027-01-30", "18:30", "Janyl", 0, 300, 1500],
    ["opera", "2027-01-31", "18:30", "La Traviata", 0, 300, 1500],
    ["phil", "2027-02-06", "18:00", "Young Soloists", 0, 200, 600],
    ["opera", "2027-02-06", "18:30", "Eugene Onegin", 0, 300, 1500],
    ["opera", "2027-02-07", "18:30", "Swan Lake", 0, 300, 1500],
    ["phil", "2027-02-13", "11:00", "The Snow Leopard and the Flute", 0, 100, 100],
    ["opera", "2027-02-14", "18:30", "Giselle", 0, 300, 1500],
    ["phil", "2027-02-20", "18:00", "Sibelius and Grieg", 0, 300, 900],
    ["opera", "2027-02-20", "18:30", "Carmen", 0, 300, 1500],
    ["opera", "2027-02-21", "18:30", "Janyl", 0, 300, 1500],
    ["phil", "2027-02-27", "11:00", "Drums of the World", 0, 100, 100],
    ["opera", "2027-02-27", "18:30", "La Traviata", 0, 300, 1500],
    ["opera", "2027-02-28", "18:30", "Swan Lake", 0, 300, 1500],
    ["phil", "2027-03-06", "18:00", "Women Composers", 0, 300, 900],
    ["opera", "2027-03-06", "18:30", "Eugene Onegin", 0, 300, 1500],
    ["opera", "2027-03-07", "18:30", "Giselle", 0, 300, 1500],
    ["phil", "2027-03-13", "11:00", "Spring Is Coming", 0, 100, 100],
    ["opera", "2027-03-13", "18:30", "Janyl", 0, 300, 1500],
    ["opera", "2027-03-14", "18:30", "Janyl", 0, 300, 1500],
    ["circus", "2027-03-20", "12:00", "Nooruz at the Circus", 0, 150, 300],
    ["circus", "2027-03-20", "17:00", "Nooruz at the Circus", 0, 150, 300],
    ["opera", "2027-03-20", "18:30", "La Traviata", 0, 300, 1500],
    ["circus", "2027-03-21", "12:00", "Nooruz at the Circus", 0, 150, 300],
    ["circus", "2027-03-21", "17:00", "Nooruz at the Circus", 0, 150, 300],
    ["phil", "2027-03-21", "17:00", "Nooruz Gala, with the orchestra", 0, 300, 1000],
    ["circus", "2027-03-22", "12:00", "Nooruz at the Circus", 0, 150, 300],
    ["circus", "2027-03-22", "17:00", "Nooruz at the Circus", 0, 150, 300],
    ["phil", "2027-03-27", "18:00", "Beethoven 5 and the Emperor", 0, 300, 900],
    ["opera", "2027-03-27", "18:30", "Swan Lake", 0, 300, 1500],
    ["opera", "2027-03-28", "18:30", "Carmen", 0, 300, 1500],
    ["opera", "2027-04-17", "18:30", "Giselle", 0, 300, 1500],
    ["opera", "2027-04-18", "18:30", "Eugene Onegin", 0, 300, 1500],
    ["phil", "2027-04-24", "18:00", "Back from the Districts", 0, 200, 600],
    ["opera", "2027-04-24", "18:30", "Swan Lake", 0, 300, 1500],
    ["opera", "2027-04-25", "18:30", "Janyl", 0, 300, 1500],
    ["phil", "2027-05-01", "11:00", "The Orchestra Goes Outside", 0, 100, 100],
    ["opera", "2027-05-01", "18:30", "La Traviata", 0, 300, 1500],
    ["opera", "2027-05-02", "18:30", "Giselle", 0, 300, 1500],
    ["phil", "2027-05-08", "18:00", "Mahler 1", 0, 300, 900],
    ["opera", "2027-05-08", "18:30", "Carmen", 0, 300, 1500],
    ["opera", "2027-05-09", "18:30", "Swan Lake", 0, 300, 1500],
    ["phil", "2027-05-15", "11:00", "Last Family Morning", 0, 100, 100],
    ["opera", "2027-05-15", "18:30", "Eugene Onegin", 0, 300, 1500],
    ["opera", "2027-05-16", "18:30", "Janyl", 0, 300, 1500],
    ["phil", "2027-05-22", "18:00", "Season Finale: Beethoven 9", 0, 400, 1200],
    ["opera", "2027-05-22", "18:30", "La Traviata", 0, 300, 1500],
    ["opera", "2027-05-29", "18:30", "Season closing gala", 0, 500, 2000],
    ["circus", "2027-06-02", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-03", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-04", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-05", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-05", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-06", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-06", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-09", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-10", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-11", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-12", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-12", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-13", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-13", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-16", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-17", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-18", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-19", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-19", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-20", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-20", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-23", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-24", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-25", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-26", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-26", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-27", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-27", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-06-30", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-01", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-02", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-03", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-03", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-04", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-04", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-07", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-08", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-09", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-10", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-10", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-11", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-11", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-14", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-15", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-16", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-17", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-17", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-18", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-18", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-21", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-22", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-23", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-24", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-24", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-25", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-25", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-28", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-29", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-30", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-31", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-07-31", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-01", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-01", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-04", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-05", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-06", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-07", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-07", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-08", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-08", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-11", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-12", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-13", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-14", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-14", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-15", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-15", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-18", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-19", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-20", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-21", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-21", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-22", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-22", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-25", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-26", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-27", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-28", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-28", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-29", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-08-29", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-01", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-02", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-03", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-04", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-04", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-05", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-05", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-08", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-09", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-10", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-11", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-11", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-12", "12:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-12", "17:00", "Summer show", 0, 150, 300],
    ["circus", "2027-09-15", "17:00", "Summer show", 0, 150, 300]
  ];
  // SHOWS:end

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
      var mid = round50((s[5] + s[6]) / 2);
      var tiers = v.tiers || (v.box ? [["stalls", s[6], 18], ["box", s[6], 0], ["balcony", mid, 6], ["gallery", s[5], 5]]
        : [["stalls", s[6], 20], ["stalls, back", mid, 10], ["balcony", s[5], 6]]);
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
