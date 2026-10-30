/* Lost & Found and Will Swap: a fresh set every week (Monday, Irad Time), the same for everyone.
   Picks from the pools below by the week number and spreads the posting times over the week so far,
   so new ads keep turning up until Sunday. Loaded after data.js and before app.js. */
(function () {
  "use strict";
  var D = window.JILMAY;
  if (!D) return;

  var LOST = [
    ["🐴", "Lost: bay gelding with white star, answers to Ak-Tash, reward", "Ran off when the dogs fought at the jailoo above Kara-Buura. Old saddle sores on the back, brand like a fork on left hip. He comes for sugar.", "Kara-Buura"],
    ["🐎", "Lost: two mares and a foal, last seen going down to the river", "Grey mare, chestnut mare and a small black foal who follows the grey. If they come into your field, please keep them, I will pay for the hay.", "Toktogul"],
    ["🔑", "Lost: keys on a red ribbon with a small Aigyr bottle opener", "Somewhere between the Central Bazaar and the 7 marshrutka stop. 3 keys and a key for a garage. Without them I sleep at my brother-in-law.", "Talas"],
    ["📱", "Lost: Nokia phone, very old, in a sock", "It is in a woolen sock because the cover broke. Inside are the numbers of all my clients. The phone is worth nothing, the numbers are worth everything.", "Nurzhan"],
    ["👛", "Lost: purse with photos and a pension card", "Brown, with a clasp, my grandmother's. Money was not much. The photos are of my husband in the army, please return them.", "Iyık Janyl"],
    ["🪪", "Lost: TSU student card and library card, name on them", "Faculty of Veterinary. Without the library card they will not let me take the books for my exam. Please leave at the main building porter.", "Talas"],
    ["🐕", "Lost: small brown dog, three legs, very fast", "He is called Tez. He lost one leg to a car but not his speed. Wears a collar from a belt. Children are crying.", "Chu"],
    ["🐈", "Lost: grey cat, fat, very lazy, how did he even go", "He never leaves the balcony. Now he is gone. 4th floor, building 12. Maybe he is in the basement, maybe in love.", "Nurzhan"],
    ["🦅", "Lost: hunting eagle, female, with jesses, answers to nobody", "Flew off at the Kara-Köl hills after a fox and did not come back. Has a leather hood in her bag (I have the bag). Do not try to hold her without a glove.", "Kara-Köl"],
    ["🐐", "Lost: goat with a bell, she opened the gate herself", "White and black, the bell sounds like a broken telephone. She is smarter than the gate. Last seen near the school.", "Sary-Bulak"],
    ["🐓", "Lost: rooster, red, very loud at 4:30", "If you are woken at 4:30 by a rooster you do not own, it is mine. Neighbours say it is good he is gone. I say bring him back.", "Mailuu-Suu"],
    ["🎒", "Lost: school bag with all homework, 5th class", "Blue, with a horse on it. The homework is finished, the teacher will not believe it. Left in the marshrutka 112.", "Talas"],
    ["👓", "Lost: glasses in brown case, +3.5", "I cannot see to write this ad well. Somewhere near the post office or the polyclinic or my house.", "Tash-Kömür"],
    ["💍", "Lost: silver ring with a red stone, from my mother", "Fell off while I was washing carpets in the aryk. Maybe the water took it down the street. Big reward for honest person.", "Iyık Janyl"],
    ["🧢", "Lost: white kalpak, at the wedding at the Ak-Saray restaurant", "Someone took my kalpak and left a smaller one. I think you have a big head now and I have a small one. Let us swap back.", "Talas"],
    ["🚲", "Lost (stolen?): blue Kama bicycle, no brakes", "Whoever took it, be careful, it has no brakes. Bring it back before you get hurt.", "Chu"],
    ["📄", "Lost: folder with land documents, plot near Semiz", "Green paper folder with stamps. Useless to anyone but me, I promise. Lost between the district office and the notary.", "Talas"],
    ["🐑", "Lost: 11 sheep, blue mark on the back, ear cut on the left", "Went with someone else's flock coming down from the jailoo. Please check your sheep, maybe you have more than you think.", "Kara-Buura"],
    ["🧣", "Lost: grey shawl, Orenburg, very warm", "At the cathedral on Sunday, 9:30 Qurbana, left on the bench by the north door. My mother knitted it.", "Iyık Janyl"],
    ["🐴", "Lost: old horse, white, half blind, called Boz", "He is 24 and goes where his nose tells him. Please do not sell him to anyone. He was my father's.", "Toktogul"],
    ["📦", "Lost: parcel from Bishkek, Jılmay Cargo, box 40 × 30", "Tracking says delivered. I say not delivered. Neighbour says nothing. Inside: car mirror and a child's shoes.", "Nurzhan"],
    ["🎻", "Lost: komuz in black case, after the evening at the Philharmonic", "Left it in the taxi, a white Lada 07. The komuz has a crack my grandfather mended with glue. Please, it is not worth money.", "Talas"]
  ];
  var FOUND = [
    ["🐎", "Found: chestnut mare with a halter, near the Chu bridge", "Very polite, eats only what she is given. Is in my yard with water. Owner, tell me the brand and she is yours.", "Chu"],
    ["🔑", "Found: car key, Toyota, at the Jıldız Market car park", "With a small felt yurt keyring. Left with the guard at the gate, ask for Daniyar.", "Nurzhan"],
    ["🐕", "Found: big shepherd dog, very sad, at the bus station", "Has a broken chain on his collar. I think he came down with the flocks and got lost. Now eats at my house, a lot.", "Sary-Bulak"],
    ["👞", "Found: one shoe, man's, size 43, on the road to the hippodrome", "After the Sunday races. Somebody went home with one shoe. Maybe you lost more than a bet.", "Talas"],
    ["🪪", "Found: passport in the name of a citizen of Tash-Kömür", "I will not write the name here. Handed in to the jandarm post at the bridge. Go there with another document.", "Tash-Kömür"],
    ["🐑", "Found: 4 sheep with green paint, came with our flock", "Green mark on the neck, ears cut on the right. They are eating our grass. Come and take them before the toi.", "Kara-Buura"],
    ["🧸", "Found: child's toy horse, wooden, at the park swings", "Wheels on the legs, red saddle painted. Hanging on the fence by the swings so the child sees it.", "Iyık Janyl"],
    ["📚", "Found: library book, TSU National Library stamp, very late", "Due back in 2019. I found it in a flat I rented. I will take it back myself, but if it is yours, the fine is yours too.", "Talas"],
    ["🐈", "Found: white kitten in the engine of my car", "Heard a noise in the morning. Now she lives in my kitchen and looks at me like I am the guest. Owner or new home wanted.", "Nurzhan"],
    ["🧤", "Found: pair of children's mittens on a string", "Red with white snowflakes. Hung on the post office door handle.", "Mailuu-Suu"],
    ["🐴", "Found: young horse, no saddle, eating our apricot trees", "Has a rope halter and a lot of confidence. Please come quickly, the trees are suffering.", "Kara-Köl"],
    ["💼", "Found: briefcase with drawings, maybe an engineer", "Left on the bench at the Toktogul dam viewpoint. Drawings of a pipe. Very important pipe, I think. Now at the café.", "Toktogul"]
  ];
  var SWAP = [
    ["🚗", "Will swap: Lada 2106 for a good horse", "Car goes, mostly. Horse must go always. Will add a saddle if the horse is very good.", "Talas"],
    ["🐏", "Swap: 2 rams for a washing machine (automatic)", "Rams are healthy and strong, one is a bit aggressive. The machine must spin. My wife says this is the most important.", "Kara-Buura"],
    ["📱", "Swap: iPhone 7, screen cracked, for a saddle", "Phone works but I am never on it, I am on the horse. Saddle for a 14-hand mare. No bovine offers please (Rules §4.2).", "Toktogul"],
    ["👰", "Will swap: wedding dress, worn once, for a komuz", "The wedding was good, the dress is in the wardrobe crying. I want to learn the komuz.", "Nurzhan"],
    ["🍺", "Swap: 214 Aigyr Lager cans (collection) for anything useful", "All different, some from 2009. My wife has decided they go. Will swap for shelves, preferably to put something else on.", "Talas"],
    ["🏢", "Swap: 2-room flat in Nurzhan for a house in Talas", "4th floor, balcony glazed, heating works in theory. Want a house with a yard, can be old. Difference in dollars by agreement.", "Nurzhan"],
    ["🧀", "Will swap: 5 kg kurut for 3 litres of mountain honey", "Kurut is from our own sheep, very salty, very good. Honey must be real, I will check with a spoon.", "Sary-Bulak"],
    ["🏍️", "Swap: Ural motorcycle with sidecar for Japanese car parts", "Runs, sidecar has a hole where my uncle's foot was. Want parts for a Honda Fit, right-hand drive.", "Mailuu-Suu"],
    ["🐶", "Will swap: puppy (half Alabai) for 10 chickens", "Will be very big. Already eats like 10 chickens. Chickens must lay.", "Chu"],
    ["🎹", "Swap: piano 'Krasny Oktyabr' for anything that fits in a car", "Moving to a smaller flat. Piano is good but I am not. You carry it.", "Iyık Janyl"],
    ["📚", "Swap: textbooks for 9th class for textbooks for 10th class", "All complete, a bit of drawing inside but the answers are right. Good exchange for both families.", "Talas"],
    ["⌨️", "Will swap: help installing the Iradi keyboard for a lunch", "I can make your computer write ş, ı, ö, ü, ç and ñ, Windows or Mac. You make plov. Fair exchange.", "Talas"],
    ["📷", "Swap: Soviet camera Zenit for a mobile phone that works", "Camera works, film you must find. I need a phone because my daughter worries.", "Tash-Kömür"],
    ["🎟️", "Swap: tickets to Aigyr Ulak Nights (2) for winter tyres", "Good seats, near the Nurik Boost sign. Tyres R14, must have tread.", "Talas"],
    ["🧥", "Will swap: sheepskin coat (tulup) for a down jacket", "Tulup is warm but weighs like a sheep. I want something I can sit in a marshrutka in.", "Nurzhan"],
    ["🧶", "Swap: a carpet 3 × 4 for a smaller carpet and a television", "Carpet is Turkmen pattern, from my mother-in-law. Television must have more than IradOne.", "Iyık Janyl"],
    ["🌾", "Swap: hay, 40 bales, for firewood, 2 cubic metres", "Hay is this year's from the upper field. Need wood before the snow.", "Kara-Köl"],
    ["🎸", "Will swap: guitar for a komuz (or the other way, if you want)", "Bought the guitar for my son, he wants a komuz now. I think next year he will want a drum.", "Chu"],
    ["🍑", "Swap: apricots, dried, 10 kg, for a bicycle for a child", "Apricots from Kara-Köl, the best. Bicycle for 7 years, brakes please, we have hills.", "Kara-Köl"],
    ["✏️", "Swap: old Talas Herald crosswords (solved) for unsolved ones", "I have 6 years of Saturday crosswords, all solved, some wrongly. Want new ones. Kestrel is my enemy.", "Talas"],
    ["🧦", "Will swap: hand-knitted socks (12 pairs) for a sack of flour", "Wool from our own sheep. All sizes, mostly large.", "Sary-Bulak"],
    ["🛻", "Swap: horse trailer for a car trailer", "Horse trailer is good but we sold the horses. Want to carry things that do not kick.", "Toktogul"]
  ];
  var MEN = ["Aibek", "Nurlan", "Kanat", "Ermek", "Bakyt", "Almaz", "Azamat", "Ruslan", "Marat", "Daniyar", "Talgat", "Sergei", "Oleg"];
  var WOMEN = ["Aigul", "Gulnara", "Nazira", "Asel", "Cholpon", "Ainura", "Dinara", "Meerim", "Zarina", "Elmira", "Natalya", "Olga", "Kanykei"];
  var LAST = ["Toktosunov", "Abdrakhmanov", "Sydykov", "Usenov", "Asanov", "Kadyrov", "Moldoev", "Ismailov", "Joldoshev", "Alymkulov",
              "Kenjebekov", "Turdubaev", "Sultanov", "Omurov", "Petrenko", "Kim", "Li", "Bekov", "Shaimbetov", "Esenaliev"];

  // Irad Time (UTC+6); a week starts on Monday at midnight. Last week's ads stay up beside this week's.
  var now = Date.now(), irt = now + 6 * 3600000;
  var day = Math.floor(irt / 86400000), thisWeek = Math.floor((day + 3) / 7), seed = 0, seen = {};
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  function pick(arr, n) {
    var a = arr.slice(), out = [];
    while (out.length < n && a.length) out.push(a.splice(Math.floor(rnd() * a.length), 1)[0]);
    return out;
  }
  function person() {
    var w = rnd() < 0.5, names = w ? WOMEN : MEN;
    var f = names[Math.floor(rnd() * names.length)], l = LAST[Math.floor(rnd() * LAST.length)];
    if (w && /(ov|ev|in)$/.test(l)) l += "a";
    return f + " " + l;
  }
  function add(list, n, cat, kind, weekStart) {
    pick(list, n).forEach(function (x) {
      var at = weekStart + Math.floor(rnd() * 7 * 86400000);
      var m = Math.round((now - at) / 60000), name = person(), vip = rnd() < 0.06;
      if (m < 0 || seen[x[1]]) return;
      seen[x[1]] = 1;
      D.listings.push({ c: cat, e: x[0], t: x[1], d: x[2], p: kind === "swap" ? null : 0, x: kind, city: x[3], s: name, m: m, vip: vip });
    });
  }
  [thisWeek, thisWeek - 1].forEach(function (w) {
    seed = w * 2654435761 % 4294967296;
    var start = (w * 7 - 3) * 86400000 - 6 * 3600000;
    add(LOST, 6, "lost", "lost", start);
    add(FOUND, 4, "lost", "found", start);
    add(SWAP, 7, "swap", "swap", start);
  });
})();
