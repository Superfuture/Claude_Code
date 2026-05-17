// Lightweight astronomical calculations for Cusp.
// Calculates sun sign, today's moon phase, current zodiac season, and whether
// Mercury is in retrograde. NOT a full ephemeris — for weekend MVP we give the
// AI enough signal to write a meaningfully personalized ritual without
// embedding 50MB of astronomical tables.

const ZODIAC = [
  { name: "Capricorn",   element: "earth", quality: "cardinal", start: [12, 22] },
  { name: "Aquarius",    element: "air",   quality: "fixed",    start: [1, 20] },
  { name: "Pisces",      element: "water", quality: "mutable",  start: [2, 19] },
  { name: "Aries",       element: "fire",  quality: "cardinal", start: [3, 21] },
  { name: "Taurus",      element: "earth", quality: "fixed",    start: [4, 20] },
  { name: "Gemini",      element: "air",   quality: "mutable",  start: [5, 21] },
  { name: "Cancer",      element: "water", quality: "cardinal", start: [6, 21] },
  { name: "Leo",         element: "fire",  quality: "fixed",    start: [7, 23] },
  { name: "Virgo",       element: "earth", quality: "mutable",  start: [8, 23] },
  { name: "Libra",       element: "air",   quality: "cardinal", start: [9, 23] },
  { name: "Scorpio",     element: "water", quality: "fixed",    start: [10, 23] },
  { name: "Sagittarius", element: "fire",  quality: "mutable",  start: [11, 22] },
];

// Mercury retrograde dates 2025–2027 (approximate, UTC).
// Real production should pull these from an ephemeris API, but for weekend MVP
// a hardcoded table is fine — Mercury retrogrades ~3x/year.
const MERCURY_RETROGRADE = [
  { start: "2025-03-15", end: "2025-04-07" },
  { start: "2025-07-18", end: "2025-08-11" },
  { start: "2025-11-09", end: "2025-11-29" },
  { start: "2026-02-26", end: "2026-03-20" },
  { start: "2026-06-29", end: "2026-07-23" },
  { start: "2026-10-24", end: "2026-11-13" },
  { start: "2027-02-09", end: "2027-03-03" },
  { start: "2027-06-10", end: "2027-07-04" },
  { start: "2027-10-07", end: "2027-10-28" },
];

/** Sun sign from a birth date (Y/M/D). */
export function sunSign(year, month, day) {
  // Walk zodiac entries; signs use start-of-period (e.g. Aries 3/21 → 4/19)
  for (let i = 0; i < ZODIAC.length; i++) {
    const z = ZODIAC[i];
    const [sm, sd] = z.start;
    const next = ZODIAC[(i + 1) % ZODIAC.length];
    const [nm, nd] = next.start;
    if (afterOrEqual(month, day, sm, sd) && before(month, day, nm, nd)) {
      return z;
    }
  }
  return ZODIAC[0]; // Late December → Capricorn (wraps)
}

function afterOrEqual(m1, d1, m2, d2) {
  return m1 > m2 || (m1 === m2 && d1 >= d2);
}
function before(m1, d1, m2, d2) {
  // Wrap: Capricorn extends across year boundary
  if (m2 < m1) return true;
  return m1 < m2 || (m1 === m2 && d1 < d2);
}

/** Approximate moon phase for a given Date. Returns { name, illumination 0–1 }. */
export function moonPhase(date) {
  // Conway-style approximation, accurate to ~1 day
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  let r = y % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = (r * 11) % 30;
  r += m + d;
  if (m < 3) r += 2;
  r -= y < 2000 ? 4 : 8.3;
  const phase = ((r + 30) % 30) / 30; // 0..1 cycle
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  let name = "Waning Crescent";
  if (phase < 0.05 || phase > 0.95) name = "New Moon";
  else if (phase < 0.20) name = "Waxing Crescent";
  else if (phase < 0.30) name = "First Quarter";
  else if (phase < 0.45) name = "Waxing Gibbous";
  else if (phase < 0.55) name = "Full Moon";
  else if (phase < 0.70) name = "Waning Gibbous";
  else if (phase < 0.80) name = "Last Quarter";
  return { name, illumination };
}

/** Is Mercury retrograde on the given date? */
export function mercuryRetrograde(date) {
  const iso = date.toISOString().slice(0, 10);
  return MERCURY_RETROGRADE.some(p => iso >= p.start && iso <= p.end);
}

/** Current zodiac season (sun's position today). */
export function currentSeason(date = new Date()) {
  return sunSign(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

/** Day-of-week → planetary correspondence (used in ritual timing) */
const PLANET_OF_DAY = [
  "Sun",     // Sunday
  "Moon",    // Monday
  "Mars",    // Tuesday
  "Mercury", // Wednesday
  "Jupiter", // Thursday
  "Venus",   // Friday
  "Saturn",  // Saturday
];

export function planetOfDay(date = new Date()) {
  return PLANET_OF_DAY[date.getUTCDay()];
}

/** Compose all "today" astrological context for the AI. */
export function todayContext(date = new Date()) {
  return {
    date: date.toISOString().slice(0, 10),
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    season: currentSeason(date),
    moon: moonPhase(date),
    mercuryRetrograde: mercuryRetrograde(date),
    planetOfDay: planetOfDay(date),
  };
}
