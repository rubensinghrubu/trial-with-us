const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const TWU_STATE_PHOTOS = {
  "Arunachal Pradesh": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1100&q=85",
  "Assam": "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1100&q=85",
  "Manipur": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1100&q=85",
  "Meghalaya": "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1100&q=85",
  "Mizoram": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1100&q=85",
  "Nagaland": "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1100&q=85",
  "Sikkim": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85",
  "Tripura": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1100&q=85"
};
const TWU_BANNER_PHOTOS = {
  hikers: TWU_STATE_PHOTOS["Sikkim"], valley: TWU_STATE_PHOTOS["Arunachal Pradesh"],
  bridge: TWU_STATE_PHOTOS["Meghalaya"], boats: TWU_STATE_PHOTOS["Manipur"],
  falls: TWU_STATE_PHOTOS["Meghalaya"], road: TWU_STATE_PHOTOS["Nagaland"],
  gear: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1100&q=85",
  "homestay": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1100&q=85",
  "travel-packages": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1100&q=85",
  "travelling-gear": "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1100&q=85",
  "safety": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1100&q=85"
};
const DESTINATION_CATALOG = [
  {
    place: "Dzükou Valley",
    state: "Nagaland",
    description:
      "A high ridge valley known for seasonal flowers and trekking routes.",
    image: "states/nagaland/dzukou-valley",
  },
  {
    place: "Living Root Bridges",
    state: "Meghalaya",
    description:
      "Living bridges woven from rubber tree roots around Nongriat and the Khasi Hills.",
    image: "states/meghalaya/root-bridge",
  },
  {
    place: "Dawki & Mawlynnong",
    state: "Meghalaya",
    description:
      "Clear river water, village walks and the green hills of the southern Khasi region.",
    image: "states/meghalaya/dawki",
  },
  {
    place: "Kaziranga National Park",
    state: "Assam",
    description:
      "Grasslands and wetlands known for the greater one-horned rhinoceros.",
    image: "states/assam/kaziranga-national-park",
  },
  {
    place: "Majuli Island",
    state: "Assam",
    description:
      "River-island culture, satras, mask making and Mising heritage.",
    image: "states/assam/majuli-island",
  },
  {
    place: "Tawang",
    state: "Arunachal Pradesh",
    description:
      "High Himalayan scenery, Tawang Monastery and mountain passes.",
    image: "states/arunachal-pradesh/tawang",
  },
  {
    place: "Ziro Valley",
    state: "Arunachal Pradesh",
    description: "Apatani villages, pine hills and paddy landscapes.",
    image: "states/arunachal-pradesh/ziro-valley",
  },
  {
    place: "Manas National Park",
    state: "Assam",
    description:
      "Foothill forests and riverine wildlife landscapes near Bhutan.",
    image: "states/assam/manas-national-park",
  },
  {
    place: "Kamakhya Temple",
    state: "Assam",
    description: "A major Shakti pilgrimage site on Nilachal Hill in Guwahati.",
    image: "states/assam/kamakhya-temple",
  },
  {
    place: "Sivasagar Ahom Heritage",
    state: "Assam",
    description:
      "Ahom-era monuments, tanks and historic architecture around Sivasagar.",
    image: "states/assam/sivasagar-ahom-heritage",
  },
  {
    place: "Charaideo Maidams",
    state: "Assam",
    description: "The royal burial mounds of the Ahom dynasty.",
    image: "states/assam/charaideo-maidams",
  },
  {
    place: "Haflong & Haflong Lake",
    state: "Assam",
    description: "A hill town surrounded by forested ridges in Dima Hasao.",
    image: "states/assam/haflong",
  },
  {
    place: "Sela Pass",
    state: "Arunachal Pradesh",
    description:
      "A high mountain pass and lake landscape on the route to Tawang.",
    image: "states/arunachal-pradesh/tawang",
  },
  {
    place: "Dirang",
    state: "Arunachal Pradesh",
    description: "Monpa heritage, apple orchards, valleys and mountain views.",
    image: "states/arunachal-pradesh/dirang",
  },
  {
    place: "Bomdila",
    state: "Arunachal Pradesh",
    description: "Monasteries, craft centres and Himalayan viewpoints.",
    image: "states/arunachal-pradesh/bomdila",
  },
  {
    place: "Mechuka",
    state: "Arunachal Pradesh",
    description:
      "A remote valley with rivers, wooden homes and dramatic mountain scenery.",
    image: "states/arunachal-pradesh/mechuka",
  },
  {
    place: "Namdapha National Park",
    state: "Arunachal Pradesh",
    description:
      "A vast eastern Himalayan biodiversity hotspot in Changlang district.",
    image: "states/arunachal-pradesh/namdapha",
  },
  {
    place: "Shillong",
    state: "Meghalaya",
    description: "A lively hill city, music culture, markets and viewpoints.",
    image: "states/meghalaya/shillong",
  },
  {
    place: "Sohra (Cherrapunji)",
    state: "Meghalaya",
    description: "Rainforest cliffs, waterfalls, caves and monsoon landscapes.",
    image: "states/meghalaya/sohra",
  },
  {
    place: "Laitlum Canyon",
    state: "Meghalaya",
    description: "Wide escarpment views above deep green valleys.",
    image: "states/meghalaya/laitlum-canyons",
  },
  {
    place: "Mawphlang Sacred Forest",
    state: "Meghalaya",
    description: "A community-protected forest with Khasi cultural traditions.",
    image: "states/meghalaya/mawphlang-sacred-forest",
  },
  {
    place: "Krang Suri Falls",
    state: "Meghalaya",
    description: "A blue-green waterfall pool surrounded by forested hills.",
    image: "states/meghalaya/krang-suri-falls",
  },
  {
    place: "Loktak Lake",
    state: "Manipur",
    description:
      "A large freshwater lake with floating phumdis and boat journeys.",
    image: "states/manipur/loktak-lake",
  },
  {
    place: "Keibul Lamjao National Park",
    state: "Manipur",
    description:
      "The floating national park and habitat of the endangered Sangai deer.",
    image: "states/manipur/keibul-lamjao-national-park",
  },
  {
    place: "Kangla Fort, Imphal",
    state: "Manipur",
    description:
      "A historic seat of Meitei power and an important cultural site.",
    image: "states/manipur/kangla-fort",
  },
  {
    place: "Shirui Hills",
    state: "Manipur",
    description:
      "Mountain landscapes known for the rare Shirui lily in its flowering season.",
    image: "states/manipur/shirui-hills",
  },
  {
    place: "Andro Heritage Village",
    state: "Manipur",
    description:
      "A traditional village known for pottery, heritage and local craft.",
    image: "states/manipur/andro-heritage-village",
  },
  {
    place: "Aizawl",
    state: "Mizoram",
    description:
      "A ridge-top capital with lively markets, views and Mizo culture.",
    image: "states/mizoram/aizawl",
  },
  {
    place: "Reiek",
    state: "Mizoram",
    description:
      "A forested hill and heritage village overlooking the surrounding ranges.",
    image: "states/mizoram/reiek",
  },
  {
    place: "Vantawng Falls",
    state: "Mizoram",
    description:
      "A high waterfall surrounded by dense green hills near Thenzawl.",
    image: "states/mizoram/vantawng-falls",
  },
  {
    place: "Phawngpui (Blue Mountain)",
    state: "Mizoram",
    description:
      "Mizoram’s highest peak with cloud forests and panoramic viewpoints.",
    image: "states/mizoram/phawngpui",
  },
  {
    place: "Tam Dil Lake",
    state: "Mizoram",
    description: "A forest-ringed lake popular for quiet nature outings.",
    image: "states/mizoram/tam-dil-lake",
  },
  {
    place: "Hmuifang",
    state: "Mizoram",
    description:
      "A forested hill area with Mizo village culture and outdoor trails.",
    image: "states/mizoram/hmuifang",
  },
  {
    place: "Kohima",
    state: "Nagaland",
    description:
      "The state capital, Naga heritage and the historic war cemetery.",
    image: "states/nagaland/kohima",
  },
  {
    place: "Khonoma Green Village",
    state: "Nagaland",
    description:
      "A community-led conservation village with Angami heritage and walking trails.",
    image: "states/nagaland/khonoma-green-village",
  },
  {
    place: "Mokokchung",
    state: "Nagaland",
    description:
      "Ao Naga culture, lively hill neighbourhoods and nearby villages.",
    image: "states/nagaland/mokokchung",
  },
  {
    place: "Doyang Reservoir",
    state: "Nagaland",
    description:
      "Reservoir scenery and a seasonal gathering place for migratory Amur falcons.",
    image: "states/nagaland/doyang",
  },
  {
    place: "Longwa Village",
    state: "Nagaland",
    description:
      "A Konyak village near the international border, known for its distinctive setting.",
    image: "states/nagaland/longwa",
  },
  {
    place: "Gangtok",
    state: "Sikkim",
    description:
      "A Himalayan city with monasteries, markets and views of Kanchenjunga on clear days.",
    image: "states/sikkim/gangtok",
  },
  {
    place: "Tsomgo (Changu) Lake",
    state: "Sikkim",
    description:
      "A high-altitude glacial lake; access rules and permits can apply.",
    image: "states/sikkim/tsomgo-lake",
  },
  {
    place: "Nathula Pass",
    state: "Sikkim",
    description:
      "A high mountain pass that requires current permit and access checks.",
    image: "states/sikkim/nathula-pass",
  },
  {
    place: "Yumthang Valley",
    state: "Sikkim",
    description:
      "An alpine valley of rivers, meadows and seasonal rhododendrons.",
    image: "states/sikkim/yumthang-valley",
  },
  {
    place: "Gurudongmar Lake",
    state: "Sikkim",
    description:
      "A high-altitude sacred lake; weather, health and permit restrictions matter.",
    image: "states/sikkim/gurudongmar-lake",
  },
  {
    place: "Pelling & Pemayangtse",
    state: "Sikkim",
    description: "Monastery heritage and western Sikkim mountain viewpoints.",
    image: "states/sikkim/pelling",
  },
  {
    place: "Ravangla Buddha Park",
    state: "Sikkim",
    description:
      "A large Buddha statue and peaceful garden views near the foothills.",
    image: "states/sikkim/ravangla-buddha-park",
  },
  {
    place: "Ujjayanta Palace, Agartala",
    state: "Tripura",
    description:
      "A white-domed former royal palace now housing a state museum.",
    image: "states/tripura/ujjayanta-palace",
  },
  {
    place: "Neermahal",
    state: "Tripura",
    description: "A lake palace set in Rudrasagar Lake.",
    image: "states/tripura/neermahal",
  },
  {
    place: "Unakoti",
    state: "Tripura",
    description:
      "Rock-cut Shaivite sculptures and monumental stone reliefs in a forested setting.",
    image: "states/tripura/unakoti",
  },
  {
    place: "Jampui Hills",
    state: "Tripura",
    description: "Cooler hill scenery, viewpoints and orange-growing villages.",
    image: "states/tripura/jampui-hills",
  },
  {
    place: "Tripura Sundari Temple",
    state: "Tripura",
    description: "An important historic temple at Matabari near Udaipur.",
    image: "states/tripura/tripura-sundari-temple",
  },
  {
    place: "Sepahijala Wildlife Sanctuary",
    state: "Tripura",
    description:
      "A protected area with forest trails, wetlands and wildlife attractions.",
    image: "states/tripura/sepahijala-wildlife-sanctuary",
  },
];
const DEST = DESTINATION_CATALOG.map((place) => place.place);
const STATE = DESTINATION_CATALOG.map((place) => place.state);
const DIMG = DESTINATION_CATALOG.map((place) => place.image);
const STATES = [
  "Arunachal Pradesh",
  "Assam",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
];
let VISIBLE_DESTINATION_INDICES = null;
const isDestinationVisible = (index) =>
  VISIBLE_DESTINATION_INDICES === null ||
  VISIBLE_DESTINATION_INDICES.has(index);
window.twuIsDestinationVisible = (placeOrIndex) => {
  const index =
    typeof placeOrIndex === "number"
      ? placeOrIndex
      : DESTINATION_CATALOG.findIndex((place) => place.place === placeOrIndex);
  return index < 0 || isDestinationVisible(index);
};
const STATE_FEATURES = [
  {
    name: "Arunachal Pradesh",
    hero: "Tawang",
    image: TWU_STATE_PHOTOS["Arunachal Pradesh"],
    places: [
      "Tawang",
      "Ziro Valley",
      "Sela Pass",
      "Dirang",
      "Bomdila",
      "Mechuka",
      "Namdapha National Park",
    ],
  },
  {
    name: "Assam",
    hero: "Kaziranga National Park",
    image: TWU_STATE_PHOTOS["Assam"],
    places: [
      "Kaziranga National Park",
      "Majuli Island",
      "Manas National Park",
      "Kamakhya Temple",
      "Sivasagar Ahom Heritage",
      "Charaideo Maidams",
      "Haflong & Haflong Lake",
    ],
  },
  {
    name: "Manipur",
    hero: "Loktak Lake",
    image: TWU_STATE_PHOTOS["Manipur"],
    places: [
      "Loktak Lake",
      "Keibul Lamjao National Park",
      "Kangla Fort, Imphal",
      "Shirui Hills",
      "Andro Heritage Village",
    ],
  },
  {
    name: "Meghalaya",
    hero: "Living Root Bridges",
    image: TWU_STATE_PHOTOS["Meghalaya"],
    places: [
      "Living Root Bridges",
      "Dawki & Mawlynnong",
      "Shillong",
      "Sohra (Cherrapunji)",
      "Laitlum Canyon",
      "Mawphlang Sacred Forest",
      "Krang Suri Falls",
    ],
  },
  {
    name: "Mizoram",
    hero: "Aizawl",
    image: TWU_STATE_PHOTOS["Mizoram"],
    places: [
      "Aizawl",
      "Reiek",
      "Vantawng Falls",
      "Phawngpui (Blue Mountain)",
      "Tam Dil Lake",
      "Hmuifang",
    ],
  },
  {
    name: "Nagaland",
    hero: "Dzükou Valley",
    image: TWU_STATE_PHOTOS["Nagaland"],
    places: [
      "Dzükou Valley",
      "Kohima",
      "Khonoma Green Village",
      "Mokokchung",
      "Doyang Reservoir",
      "Longwa Village",
    ],
  },
  {
    name: "Sikkim",
    hero: "Gangtok",
    image: TWU_STATE_PHOTOS["Sikkim"],
    places: [
      "Gangtok",
      "Tsomgo (Changu) Lake",
      "Nathula Pass",
      "Yumthang Valley",
      "Gurudongmar Lake",
      "Pelling & Pemayangtse",
      "Ravangla Buddha Park",
    ],
  },
  {
    name: "Tripura",
    hero: "Ujjayanta Palace, Agartala",
    image: TWU_STATE_PHOTOS["Tripura"],
    places: [
      "Ujjayanta Palace, Agartala",
      "Neermahal",
      "Unakoti",
      "Jampui Hills",
      "Tripura Sundari Temple",
      "Sepahijala Wildlife Sanctuary",
    ],
  },
];
const LANG = [
    "English",
    "Hindi",
    "Bengali",
    "Assamese",
    "Khasi",
    "Angami",
    "Nepali",
    "Monpa",
    "Apatani",
  ],
  TAGS = ["Trek", "Culture", "Wildlife", "Photography", "Food"],
  HUBS = ["Guwahati", "Dimapur", "Shillong"];
const KM = {
  Guwahati: [360, 160, 175, 190, 350, 480, 430],
  Dimapur: [85, 480, 520, 140, 250, 600, 420],
  Shillong: [570, 55, 80, 250, 440, 560, 530],
};
const STATE_DISTANCES = {
  Guwahati: {
    "Arunachal Pradesh": 360,
    Assam: 145,
    Manipur: 490,
    Meghalaya: 100,
    Mizoram: 530,
    Nagaland: 260,
    Sikkim: 600,
    Tripura: 580,
  },
  Dimapur: {
    "Arunachal Pradesh": 420,
    Assam: 170,
    Manipur: 280,
    Meghalaya: 380,
    Mizoram: 550,
    Nagaland: 95,
    Sikkim: 700,
    Tripura: 490,
  },
  Shillong: {
    "Arunachal Pradesh": 500,
    Assam: 180,
    Manipur: 450,
    Meghalaya: 55,
    Mizoram: 450,
    Nagaland: 500,
    Sikkim: 650,
    Tripura: 400,
  },
};
function estimatedRoadKm(origin, destinationIndex) {
  const exact = KM[origin]?.[destinationIndex];
  if (Number.isFinite(exact)) return exact;
  const state = STATE[destinationIndex] || "Assam";
  const base = STATE_DISTANCES[origin]?.[state] || 250;
  // Publicly labelled planning estimate only; actual route distance depends on road access.
  const localSpread = [0, 18, 32, 45, 60, 75, 90][destinationIndex % 7];
  return base + (destinationIndex >= 51 ? 45 : localSpread);
}
const VEH = [
  ["Shared seat", 7, "🚐"],
  ["Taxi, up to 4", 16, "🚕"],
  ["Private SUV, up to 6", 22, "🚙"],
];
const G = [];
const S = [];
const E = [
  ["Trekking pole", 150, "🥢"],
  ["2-person tent", 600, "⛺"],
  ["Sleeping bag", 350, "🛌"],
  ["Rain jacket", 250, "🧥"],
  ["Backpack 50L", 300, "🎒"],
  ["Headlamp", 100, "🔦"],
  ["Trekking shoes", 400, "🥾"],
];
const P = [
  [
    "Dzükou Weekend",
    3,
    9800,
    "Budget",
    0,
    "Suggested Dzükou itinerary with guide, stay and return transport planning. Price is indicative; providers, permits and availability must be confirmed.",
  ],
  [
    "Roots and Rivers",
    5,
    18500,
    "Mid-range",
    1,
    "Suggested Nongriat trek, Dawki boat ride and Shillong transfer itinerary. Price is indicative; providers and availability must be confirmed.",
  ],
  [
    "Wild Assam",
    4,
    24000,
    "Premium",
    3,
    "Suggested Kaziranga safaris and Majuli river-island itinerary. Price is indicative; safari slots, permits and transport must be confirmed.",
  ],
  [
    "Tawang and Ziro Loop",
    7,
    36000,
    "Premium",
    5,
    "Suggested monastery circuit and Apatani valley itinerary. Price is indicative; local providers and availability must be confirmed.",
  ],
];
const NUM = ["days", "nights", "trav", "gd", "rt"];
let st = {
  state: "All states",
  dest: DEST[0],
  lang: "Any",
  tag: "Any",
  days: 2,
  nights: 2,
  trav: 2,
  from: "Guwahati",
  rt: 0,
  gd: 2,
  gear: {},
  bud: "All",
  cart: [],
  contacts: [],
};
try {
  Object.assign(st, JSON.parse(localStorage.twu || "{}"));
} catch (e) {}
const save = () => {
  try {
    localStorage.twu = JSON.stringify(st);
  } catch (e) {}
};
const di = () => DEST.indexOf(st.dest),
  has = (id) => st.cart.some((c) => c.id == id),
  reg = {};
let redraw = () => {};
const safeText = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const getTwuClient = () => {
  const ready =
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !window.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE") &&
    window.supabase;
  if (!ready) return null;
  return (
    window.__twuSupabase ||
    (window.__twuSupabase = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: window.localStorage,
        },
      },
    ))
  );
};
let publishedPlacePromise = null;
async function loadPublishedPlaces() {
  if (publishedPlacePromise) return publishedPlacePromise;
  publishedPlacePromise = (async () => {
    const client = getTwuClient();
    if (!client) return false;
    const { data, error } = await client
      .from("places")
      .select("id,name,state,description,image_url,is_published,catalog_key")
      .eq("is_published", true)
      .order("created_at", { ascending: true });
    if (error || !Array.isArray(data)) {
      if (error)
        console.warn(
          "Published destination records were not loaded:",
          error.message,
        );
      return false;
    }
    let changed = false;
    const publicCatalogIndices = new Set();
    const mappedPublicIndices = new Set();
    let hasCatalogKeys = false;
    for (const row of data) {
      const name = String(row.name || "").trim(),
        state = String(row.state || "").trim();
      if (!name || !STATES.includes(state)) continue;
      const keyMatch = String(row.catalog_key || "").match(/^dest-(\d{2})$/);
      let index = keyMatch ? Number(keyMatch[1]) : -1;
      if (keyMatch) {
        hasCatalogKeys = true;
        publicCatalogIndices.add(index);
      }
      if (!(index >= 0 && index < DESTINATION_CATALOG.length)) {
        index = DESTINATION_CATALOG.findIndex(
          (place) =>
            place.place.toLowerCase() === name.toLowerCase() &&
            place.state === state,
        );
      }
      const img = String(row.image_url || "").trim();
      const normalizedImage = img.startsWith("assets/")
        ? img.slice(7).replace(/\.jpg$/i, "")
        : /^https:\/\//i.test(img)
          ? img
          : null;
      if (index >= 0) {
        mappedPublicIndices.add(index);
        const place = DESTINATION_CATALOG[index];
        if (
          place.place !== name ||
          place.state !== state ||
          place.description !== String(row.description || place.description)
        )
          changed = true;
        place.place = name;
        place.state = state;
        if (row.description) place.description = row.description;
        if (normalizedImage) place.image = normalizedImage;
        DEST[index] = name;
        STATE[index] = state;
        DIMG[index] = place.image;
      } else if (
        !DESTINATION_CATALOG.some(
          (place) =>
            place.place.toLowerCase() === name.toLowerCase() &&
            place.state === state,
        )
      ) {
        const newIndex = DESTINATION_CATALOG.length;
        DESTINATION_CATALOG.push({
          place: name,
          state,
          description: String(
            row.description ||
              "Explore this Northeast India destination with local context.",
          ),
          image: normalizedImage || "valley",
        });
        DEST.push(name);
        STATE.push(state);
        DIMG.push(normalizedImage || "valley");
        mappedPublicIndices.add(newIndex);
        changed = true;
      }
    }
    // The RPC distinguishes a successfully migrated but fully hidden catalogue from an unconfigured database.
    try {
      const { data: keyRows, error: keyError } = await client.rpc(
        "list_public_destination_keys",
      );
      if (!keyError && Array.isArray(keyRows)) {
        const visible = new Set(
          keyRows
            .map((row) =>
              Number(
                String(row.catalog_key || "").match(/^dest-(\d{2})$/)?.[1],
              ),
            )
            .filter(
              (index) =>
                Number.isInteger(index) &&
                index >= 0 &&
                index < DESTINATION_CATALOG.length,
            ),
        );
        mappedPublicIndices.forEach((index) => visible.add(index));
        if (
          VISIBLE_DESTINATION_INDICES === null ||
          visible.size !== VISIBLE_DESTINATION_INDICES.size ||
          [...visible].some((index) => !VISIBLE_DESTINATION_INDICES.has(index))
        )
          changed = true;
        VISIBLE_DESTINATION_INDICES = visible;
      } else if (hasCatalogKeys) {
        VISIBLE_DESTINATION_INDICES = new Set([
          ...publicCatalogIndices,
          ...mappedPublicIndices,
        ]);
      }
    } catch (_) {
      if (hasCatalogKeys)
        VISIBLE_DESTINATION_INDICES = new Set([
          ...publicCatalogIndices,
          ...mappedPublicIndices,
        ]);
    }
    STATE_FEATURES.forEach((feature) => {
      const visiblePlaces = DESTINATION_CATALOG.filter(
        (place, index) =>
          place.state === feature.name && isDestinationVisible(index),
      );
      feature.places = visiblePlaces.map((place) => place.place);
      // if (visiblePlaces.length)
      //   feature.image = visiblePlaces[0].image || feature.image;
    });
    return changed;
  })().catch((error) => {
    console.warn("Destination sync failed:", error);
    return false;
  });
  return publishedPlacePromise;
}
window.twuLoadPublishedPlaces = loadPublishedPlaces;
window.twuGetSupabaseClient = getTwuClient;
let approvedGuidePromise = null;
async function loadApprovedGuideListings() {
  if (approvedGuidePromise) return approvedGuidePromise;
  approvedGuidePromise = (async () => {
    const client = getTwuClient();
    if (!client) return { loaded: false, changed: false };
    await loadPublishedPlaces();
    const { data, error } = await client.rpc("list_approved_guides");
    if (error || !Array.isArray(data)) {
      console.warn(
        "Approved guide listings could not be loaded. Run supabase-upgrade.sql:",
        error?.message || "Unknown error",
      );
      G.splice(0, G.length);
      window.__twuGuideListingError =
        error?.message || "Approved guide list unavailable";
      return { loaded: true, changed: true };
    }
    const realGuides = data.map((row) => {
      const guideDestinations = Array.isArray(row.destinations)
        ? row.destinations
        : [];
      let destIndex = DESTINATION_CATALOG.findIndex((place) =>
        guideDestinations.some((token) => {
          const a = String(token).toLowerCase(),
            b = place.place.toLowerCase();
          return a === b || a.includes(b) || b.includes(a);
        }),
      );
      if (destIndex < 0) {
        const stateMatch = DESTINATION_CATALOG.findIndex((place) =>
          guideDestinations.some(
            (token) =>
              String(token).toLowerCase() === place.state.toLowerCase(),
          ),
        );
        destIndex = stateMatch >= 0 ? stateMatch : 0;
      }
      const experience = String(
        row.experience || "Local experience and destination knowledge.",
      );
      const interest = /wildlife|safari|bird/i.test(experience)
        ? "Wildlife"
        : /trek|hike|mountain/i.test(experience)
          ? "Trek"
          : /food|cook|cuisine/i.test(experience)
            ? "Food"
            : /photo/i.test(experience)
              ? "Photography"
              : "Culture";
      return [
        String(row.full_name || "Local guide"),
        destIndex,
        (Array.isArray(row.languages) ? row.languages : []).map(String),
        [interest],
        Number(row.daily_rate) > 0 ? Number(row.daily_rate) : 0,
        0,
        experience,
        0,
        0,
        typeof row.avatar_url === "string" &&
        /^https:\/\//i.test(row.avatar_url)
          ? row.avatar_url
          : null,
        true,
        guideDestinations,
        String(row.user_id || ""),
      ];
    });
    G.splice(0, G.length, ...realGuides);
    window.__twuGuideListingError = "";
    return { loaded: true, changed: true };
  })().catch((error) => {
    console.warn("Approved guide sync failed:", error);
    G.splice(0, G.length);
    window.__twuGuideListingError =
      error.message || "Approved guide list unavailable";
    return { loaded: true, changed: true };
  });
  return approvedGuidePromise;
}
function refreshFeaturedGuideCards() {
  const target = $("#fg");
  if (!target) return;
  target.innerHTML = G.length
    ? G.slice(0, 3)
        .map((guide, index) => guideCard(guide, index, null, [], 2))
        .join("")
    : `<div class="empty-state"><span>🧭</span><h2>Meet your local guide</h2><p>Guide listings appear here after a guide has applied and an admin has approved the profile.</p><a class="btn" href="guides.html">Explore destinations and guides</a></div>`;
}
/* illustrations */
function avatar(i, z = 80) {
  const sk = ["#f2cba8", "#dfa97e", "#c68863", "#a86f4a"][i % 4],
    hr = ["#193d2b", "#2a160c", "#3b2a1e", "#14143a"][(i * 3 + 1) % 4],
    sh = ["#477765", "#f4f1e7", "#244d37", "#6c84bf"][(i + 1) % 4],
    bg = ["#f4f1e7", "#477765", "#6c84bf", "#244d37"][i % 4],
    k = i % 3;
  return `<svg viewBox="0 0 100 100" width="${z}" height="${z}" role="img" aria-label="Guide portrait placeholder"><rect width="100" height="100" fill="${bg}"/>${k == 2 ? `<path d="M26 40q0-26 24-26t24 26v34H26z" fill="${hr}"/>` : ""}<path d="M8 100c0-24 18-33 42-33s42 9 42 33z" fill="${sh}"/><rect x="43" y="52" width="14" height="18" fill="${sk}"/><ellipse cx="50" cy="42" rx="17" ry="20" fill="${sk}"/>${k == 0 ? `<path d="M31 38q0-22 19-22t19 22q-19-9-38 0z" fill="${sh === "#f4f1e7" ? "#477765" : hr}"/><rect x="30" y="34" width="40" height="6" fill="${bg == "#f4f1e7" ? "#477765" : "#f4f1e7"}"/>` : k == 1 ? `<path d="M32 40q-2-22 18-22t18 22q-6-10-18-10t-18 10z" fill="${hr}"/>` : `<path d="M33 40q0-20 17-20t17 20q-17-8-34 0z" fill="${hr}"/>`}<circle cx="43" cy="44" r="2" fill="#193d2b"/><circle cx="57" cy="44" r="2" fill="#193d2b"/><path d="M43 52q7 6 14 0" stroke="#193d2b" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
}
function scene(i) {
  const c = [
    ["#477765", "#244d37", "#193d2b"],
    ["#6c84bf", "#477765", "#244d37"],
    ["#f4f1e7", "#477765", "#193d2b"],
  ][i % 3];
  return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice"><rect width="400" height="260" fill="${c[0]}"/><circle cx="${90 + i * 50}" cy="70" r="34" fill="#f4f1e7"/><path d="M0 190l70-80 60 60 80-110 90 120 100-70v150H0z" fill="${c[1]}"/><path d="M0 220l90-60 70 40 90-70 150 90v40H0z" fill="${c[2]}"/><path d="M0 250q100-20 200 0t200 0v10H0z" fill="#f4f1e7" opacity=".8"/></svg>`;
}
const pic = (i, cls = "pic") => {
  const image = DIMG[i];
  const imageUrl =
    typeof image === "string" && /^https:\/\//i.test(image)
      ? image
      : TWU_STATE_PHOTOS[STATE[i]] || TWU_STATE_PHOTOS["Meghalaya"];
  return imageUrl
    ? `<div class="${cls}" role="img" aria-label="${safeText(DEST[i])}" style="background-image:linear-gradient(135deg,rgba(25,61,43,.12),rgba(25,61,43,.34)),url(&quot;${safeText(imageUrl)}&quot;)">`
    : `<div class="${cls}" role="img" aria-label="${safeText(DEST[i])}">${scene(i)}`;
};
/* components */
const btn = (it) => {
  reg[it.id] = it;
  const o = has(it.id);
  return `<button class="btn sm${o ? " on" : ""}" data-id="${it.id}">${o ? "Remove from trip" : "Add to trip"}</button>`;
};
function guideCard(g, i, s, r, days) {
  const rate = Number(g[4]) || 0;
  const it = {
    id: `g${i}-${days}`,
    kind: "guide",
    source_id: g[12],
    quantity: days,
    travellers: st.trav,
    t: "Guide: " + g[0],
    d: `${days} day${days > 1 ? "s" : ""} in ${DEST[g[1]]}`,
    p: rate * days,
  };
  const face = g[9]
    ? `<img src="${safeText(g[9])}" alt="${safeText(g[0])}" loading="lazy" style="width:84px;height:84px;object-fit:cover;border-radius:50%">`
    : avatar(i, 84);
  const proof = g[10]
    ? "Admin-approved guide listing"
    : "Example profile · not a verified provider";
  const interests = Array.isArray(g[3]) ? g[3] : [];
  const languages = Array.isArray(g[2]) ? g[2] : [];
  return `<article class="card"><div class="av"><a class="avl" style="view-transition-name:av-${i}" href="guide.html?id=${i}" aria-label="${safeText(g[0])} profile">${face}</a><div><h3 style="font-size:1.3rem">${safeText(g[0])}</h3><small>${safeText(proof)}${g[10] ? "" : " · sample content"}</small></div></div><div class="cb"><small>📍 ${safeText(DEST[g[1]] || "Northeast India")}, ${safeText(STATE[g[1]] || "")}</small><p>${safeText(g[6])}</p><div class="chips">${languages.map((language) => `<i>${safeText(language)}</i>`).join("")}${interests.map((interest) => `<i>${safeText(interest)}</i>`).join("")}</div>${s != null ? `<div class="match">${Math.min(100, s)}% match${r.length ? " · " + r.map(safeText).join(", ") : ""}<u><em style="width:${Math.min(100, s)}%"></em></u></div>` : ""}<div class="bt"><div><span class="price">${rate > 0 ? inr(it.p) : "Rate not set"}</span><small>${rate > 0 ? `${inr(rate)}/day` : "Confirm the rate before booking"}</small></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><a class="btn sm alt" href="guide.html?id=${i}">Profile</a>${rate > 0 ? btn(it) : ""}</div></div></div></article>`;
}
function matches() {
  return G.map((g, i) => {
    let score = 0,
      reasons = [];
    if (g[1] === di()) {
      score += 50;
      reasons.push("knows " + st.dest);
    }
    if (STATE[g[1]] === st.state && st.state !== "All states") {
      score += 25;
      reasons.push("based in " + st.state);
    }
    if (st.lang === "Any" || g[2].includes(st.lang)) {
      score += 30;
      if (st.lang !== "Any") reasons.push("speaks " + st.lang);
    }
    if (st.tag === "Any" || g[3].includes(st.tag)) {
      score += 20;
      if (st.tag !== "Any") reasons.push(st.tag.toLowerCase());
    }
    return { g, i, s: score, r: reasons };
  })
    .filter(({ g }) => st.state === "All states" || STATE[g[1]] === st.state)
    .sort((a, b) => b.s - a.s || b.g[5] - a.g[5]);
}
function stayCard(h, i) {
  const n = Math.ceil(st.trav / 2),
    it = {
      id: `s${i}-${st.nights}-${n}`,
      t: "Stay: " + h[0],
      d: `${st.nights} night${st.nights > 1 ? "s" : ""}, ${n} room${n > 1 ? "s" : ""}`,
      p: h[1] * st.nights * n,
    };
  return `<article class="card">${pic(i)}<span class="tagc">${i == di() ? "Near your destination" : STATE[i]}</span></div><div class="cb"><h3>${h[0]}</h3><small>📍 ${DEST[i]} · 🍲 ${h[3]}</small><p>${h[2]}</p><div class="bt"><div><span class="price">${inr(it.p)}</span><small>${inr(h[1])} per room, night</small></div>${btn(it)}</div></div></article>`;
}
function gearTot() {
  const l = E.map((e, i) => [
    e,
    st.gear[String(e[4] ?? i)] || st.gear[i] || 0,
  ]).filter((x) => x[1]);
  return {
    l,
    p: Math.round(l.reduce((a, [e, q]) => a + e[1] * q * st.gd, 0) * 100) / 100,
  };
}
/* layout */
const LINKS = [
  ["destinations", "Explore"],
  ["guides", "Local guides"],
  ["stays", "Hill homestays"],
  ["rides", "Local transport"],
  ["gear", "Trek gear"],
  ["packages", "Trip packages"],
  ["gallery", "Gallery"],
  ["safety", "GPS & safety"],
  ["community", "Trekker community"],
];
const IC = (p) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const BAG = IC(
    '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  ),
  CHAT = IC(
    '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.3A8 8 0 1 1 21 12z"/><path d="M8.5 11.5h7M8.5 14.5h4"/>',
  );
function closeTileDetails() {
  const m = $("#tile-modal");
  if (!m) return;
  m.classList.remove("open");
  m.setAttribute("aria-hidden", "true");
  document.body.classList.remove("tile-modal-open");
}
function openTileDetails(card) {
  const modal = $("#tile-modal"),
    content = $("#tile-modal-content"),
    actions = $("#tile-modal-actions");
  if (!modal || !content) return;
  const heading =
    card.querySelector("h3,h2")?.textContent?.trim() ||
    card.querySelector(".tagc")?.textContent?.trim() ||
    "Trip details";
  $("#tile-modal-title").textContent = heading;
  content.replaceChildren();
  actions.replaceChildren();
  let clone;
  if (card.tagName === "A") {
    clone = document.createElement("article");
    clone.className = card.className.replace(/\bhoverable\b/g, "");
    clone.innerHTML = card.innerHTML;
  } else {
    clone = card.cloneNode(true);
  }
  clone.classList.add("tile-detail-card");
  clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
  content.append(clone);
  if (card.tagName === "A" && card.getAttribute("href")) {
    const a = document.createElement("a");
    a.className = "btn tile-open-page";
    a.href = card.getAttribute("href");
    a.textContent = "Open " + heading;
    actions.append(a);
  }
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("tile-modal-open");
  const close = $("#tile-modal-close");
  close?.focus();
}
function layout() {
  const b = document.body.dataset;
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<header class="top"><div class="w"><a class="logo" href="index.html">Trail With Us</a><nav id="nv">${LINKS.map((l) => `<a href="${l[0]}.html" class="${b.page == l[0] ? "on" : ""}">${l[1]}</a>`).join("")}<span class="nav-indicator" aria-hidden="true"></span></nav><div class="top-actions" style="display:flex;gap:10px;align-items:center"><button class="burger" id="bg" aria-label="Open navigation menu" aria-expanded="false"><span></span><span></span><span></span></button><button class="mybtn" id="mt" aria-label="Open my trip" hidden>${BAG}<span>My trip</span><b id="cc">0</b></button><div class="profile-menu" id="profile-menu" hidden><button class="profile-trigger" id="profile-trigger" aria-label="Open profile menu" title="Profile"><span class="profile-avatar" id="profile-avatar" aria-hidden="true">U</span><span id="profile-label" class="profile-label">Profile</span><span class="profile-chevron" aria-hidden="true">▾</span></button><div class="profile-dropdown" id="profile-dropdown"><a href="login.html" id="profile-login">Log in / Create account</a><a href="account.html" id="profile-account" hidden>Edit profile</a><a href="dashboard-user.html" id="profile-dashboard" hidden>Travel dashboard</a><button type="button" id="profile-logout" hidden>Log out</button></div></div></div></div></header>` +
      (b.title
        ? `<div class="ban" style="background-image:linear-gradient(100deg,rgba(12,30,36,.84),rgba(12,30,36,.26)),url(&quot;${TWU_BANNER_PHOTOS[b.img] || TWU_BANNER_PHOTOS.valley}&quot;)"><div class="w"><p class="eyebrow">TRAIL WITH US · NORTHEAST INDIA</p><h1>${b.title}</h1><p>${b.sub}</p></div></div>`
        : ""),
  );
  document.body.insertAdjacentHTML(
    "beforeend",
    `<footer class="ft"><div class="w"><div class="cols"><div><a class="logo" href="index.html" style="display:inline-block;opacity:1">Trail With Us</a><p style="max-width:34ch;margin-top:14px;opacity:.8">Your best travel buddy in Northeast India.</p></div><div><b>Plan</b>${LINKS.slice(
      0,
      6,
    )
      .map((l) => `<a href="${l[0]}.html">${l[1]}</a>`)
      .join(
        "",
      )}</div><div><b>Explore and stay safe</b><a href="gallery.html">Gallery</a><a href="safety.html">GPS tracking & alerts</a><a href="safety.html#sos">SOS</a><a href="community.html">Trekker community</a><a href="trip.html">My trip</a></div><div><b>Account</b><div id="footer-auth-links"><a href="login.html">Log in</a><a href="login.html?mode=signup">Create an account</a></div><a href="dashboard-user.html" id="footer-dashboard-link" hidden>Travel dashboard</a></div></div></div></footer>
<a class="fab" id="sosf" href="safety.html#sos" aria-label="Open emergency SOS tools">SOS</a><button class="fab" id="fab" aria-label="Open Chat With Us">${CHAT}</button>
<div class="cw" id="cw"><h4>Chat With Us<small>Travel planning helper · quick suggestions</small><button type="button" class="chat-close" id="closeChat" aria-label="Close chat">×</button></h4><div class="msgs" id="ms"></div><div class="qs" id="qs"></div><form id="cf"><input id="ci" placeholder="Ask about permits, stays, gear" autocomplete="off"><button class="btn sm">Send</button></form></div><div class="toast" id="ts"></div><div class="ov" id="ov"></div><aside class="td" id="td" aria-label="My trip"></aside><div class="tile-modal" id="tile-modal" aria-hidden="true"><div class="tile-modal-backdrop" data-tile-close></div><section class="tile-modal-panel" role="dialog" aria-modal="true" aria-labelledby="tile-modal-title"><button type="button" class="tile-modal-close" id="tile-modal-close" aria-label="Close details">×</button><h2 id="tile-modal-title">Details</h2><div class="tile-modal-content" id="tile-modal-content"></div><div id="tile-modal-actions" class="tile-modal-actions"></div></section></div>
<nav class="mobile-tabbar" aria-label="Quick navigation">
  <a href="index.html" class="${b.page === "home" ? "on" : ""}"><span aria-hidden="true">⌂</span><small>Home</small></a>
  <a href="destinations.html" class="${b.page === "destinations" ? "on" : ""}"><span aria-hidden="true">⌖</span><small>Explore</small></a>
  <a href="community.html" class="${b.page === "community" ? "on" : ""}"><span aria-hidden="true">◎</span><small>Community</small></a>
  <a href="trip.html" class="${b.page === "trip" ? "on" : ""}"><span aria-hidden="true">♧</span><small>My trip</small></a>
  <a href="login.html" class="${b.page === "login" ? "on" : ""}"><span aria-hidden="true">○</span><small>Account</small></a>
</nav>`, 
  );
  const nv = $("#nv"),
    bg = $("#bg"),
    menu = (o) => {
      nv.classList.toggle("open", o);
      bg.classList.toggle("is-open", !!o);
      bg.setAttribute("aria-expanded", String(!!o));
      bg.setAttribute(
        "aria-label",
        o ? "Close navigation menu" : "Open navigation menu",
      );
      document.body.classList.toggle("nav-open", !!o);
    };
  const navIndicator = nv.querySelector(".nav-indicator");
  const updateNavIndicator = (target) => {
    if (!navIndicator) return;
    if (window.matchMedia("(max-width: 1240px)").matches) {
      navIndicator.style.opacity = "0";
      return;
    }
    const link = target && target.matches("a") ? target : nv.querySelector("a.on");
    if (!link) {
      navIndicator.style.opacity = "0";
      return;
    }
    const navRect = nv.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navIndicator.style.setProperty("--nav-indicator-x", `${linkRect.left - navRect.left}px`);
    navIndicator.style.setProperty("--nav-indicator-width", `${linkRect.width}px`);
    navIndicator.style.opacity = "1";
  };
  if (navIndicator) {
    updateNavIndicator();
    nv.addEventListener("pointerover", (event) => {
      const link = event.target.closest("a");
      if (link && nv.contains(link)) updateNavIndicator(link);
    });
    nv.addEventListener("pointerleave", () => updateNavIndicator());
    nv.addEventListener("focusin", (event) => {
      const link = event.target.closest("a");
      if (link && nv.contains(link)) updateNavIndicator(link);
    });
    nv.addEventListener("focusout", (event) => {
      if (!nv.contains(event.relatedTarget)) updateNavIndicator();
    });
    window.addEventListener("resize", () => updateNavIndicator(), { passive: true });
    window.addEventListener("load", () => updateNavIndicator(), { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => updateNavIndicator());
  }
  const profileTrigger = $("#profile-trigger"),
    profileDropdown = $("#profile-dropdown");
  const getSupabaseClient = () => {
    const configured =
      window.SUPABASE_URL &&
      window.SUPABASE_ANON_KEY &&
      !window.SUPABASE_URL.includes("YOUR-PROJECT") &&
      !window.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE") &&
      window.supabase;
    if (!configured) return null;
    return (
      window.__twuSupabase ||
      (window.__twuSupabase = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            storage: window.localStorage,
          },
        },
      ))
    );
  };
  async function refreshAccountControls() {
    const sb = getSupabaseClient();
    const heroActions = document.querySelector(".hero-auth-actions");
    const footerAuth = $("#footer-auth-links");
    const footerDashboard = $("#footer-dashboard-link");
    const resetLoggedOut = () => {
      // A stored cart from the pre-login-gated version must not remain usable as a guest.
      if (st.cart.length) {
        st.cart = [];
        save();
        cartCount();
      }
      $("#profile-menu").hidden = true;
      $("#mt").hidden = true;
      if (heroActions) heroActions.hidden = false;
      if (footerAuth) footerAuth.hidden = false;
      if (footerDashboard) footerDashboard.hidden = true;
      $("#profile-login").hidden = false;
      $("#profile-account").hidden = true;
      $("#profile-dashboard").hidden = true;
      $("#profile-dashboard").href = "dashboard-user.html";
      $("#profile-dashboard").textContent = "Travel dashboard";
      $("#profile-logout").hidden = true;
      $("#profile-avatar").textContent = "U";
      $("#profile-label").textContent = "Profile";
    };
    if (!sb) {
      resetLoggedOut();
      return;
    }
    try {
      const {
        data: { session },
      } = await sb.auth.getSession();
      const user = session?.user;
      if (!user) {
        resetLoggedOut();
        return;
      }
      if (heroActions) heroActions.hidden = true;
      if (footerAuth) footerAuth.hidden = true;
      if (footerDashboard) footerDashboard.hidden = false;
      $("#profile-menu").hidden = false;
      $("#mt").hidden = false;
      $("#profile-login").hidden = true;
      $("#profile-account").hidden = false;
      $("#profile-dashboard").hidden = false;
      $("#profile-logout").hidden = false;
      $("#profile-label").textContent =
        user.email?.split("@")[0] || "Traveller";
      const { data: prof } = await sb
        .from("profiles")
        .select("role,full_name,avatar_url,guide_status")
        .eq("id", user.id)
        .maybeSingle();
      $("#profile-menu").hidden = false;
      $("#mt").hidden = false;
      $("#profile-login").hidden = true;
      $("#profile-account").hidden = false;
      const isAdmin = prof?.role === "admin";
      const isGuide =
        prof?.role === "guide" || prof?.guide_status === "approved";
      $("#profile-dashboard").hidden = false;
      $("#profile-dashboard").href = isAdmin
        ? "dashboard-admin.html"
        : isGuide
          ? "dashboard-guide.html"
          : "dashboard-user.html";
      $("#profile-dashboard").textContent = isAdmin
        ? "Admin workspace"
        : isGuide
          ? "Guide dashboard"
          : "Travel dashboard";
      if (footerDashboard) {
        footerDashboard.href = isAdmin
          ? "dashboard-admin.html"
          : isGuide
            ? "dashboard-guide.html"
            : "dashboard-user.html";
        footerDashboard.textContent = isAdmin
          ? "Admin workspace"
          : isGuide
            ? "Guide dashboard"
            : "Travel dashboard";
      }
      $("#profile-logout").hidden = false;
      const fullName =
        prof?.full_name || user.email?.split("@")[0] || "Traveller";
      $("#profile-label").textContent = fullName;
      const avatar = $("#profile-avatar");
      avatar.replaceChildren();
      if (prof?.avatar_url && /^https?:\/\//i.test(prof.avatar_url)) {
        const img = document.createElement("img");
        img.src = prof.avatar_url;
        img.alt = "";
        avatar.append(img);
      } else {
        avatar.textContent =
          fullName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((x) => x[0])
            .join("")
            .toUpperCase() || "U";
      }
      if (heroActions) heroActions.hidden = true;
      if (footerAuth) footerAuth.hidden = true;
      if (footerDashboard) footerDashboard.hidden = false;
    } catch (err) {
      console.warn("Session controls could not load", err);
    }
  }
  profileTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("open");
  });
  refreshAccountControls();
  const sbForAuth = getSupabaseClient();
  if (sbForAuth?.auth?.onAuthStateChange) {
    sbForAuth.auth.onAuthStateChange(() => {
      refreshAccountControls();
    });
  }
  profileDropdown?.addEventListener("click", async (e) => {
    if (e.target.closest("#profile-logout")) {
      const sb = getSupabaseClient();
      if (sb) await sb.auth.signOut();
      st.cart = [];
      save();
      location.href = "index.html";
    }
  });
  bg.onclick = (e) => {
    e.stopPropagation();
    menu(!nv.classList.contains("open"));
  };
  nv.onclick = (e) => e.target.closest("a") && menu(false);
  document.addEventListener("click", (e) => {
    if (!e.target.closest("header")) {
      menu(false);
      profileDropdown?.classList.remove("open");
    }
  });
  $("#mt").onclick = () => td(1);
  $("#ov").onclick = () => td(0);
  $("#tile-modal-close").onclick = closeTileDetails;
  $("#tile-modal").addEventListener("click", (e) => {
    if (e.target === $("#tile-modal") || e.target.matches("[data-tile-close]"))
      closeTileDetails();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      td(0);
      menu(false);
      closeTileDetails();
      $("#cw")?.classList.remove("open");
    }
  });
  document.addEventListener("click", (e) => {
    const r = e.target.closest("[data-dr]");
    if (r) {
      st.cart = st.cart.filter((c) => c.id != r.dataset.dr);
      save();
      cartCount();
      redraw(false);
    }
    if (e.target.closest("#tx") || e.target.closest(".td a")) td(0);
  });
  chat();
  cartCount();
  // Editing belongs in the admin workspace, not on top of visitor-facing cards.
  // Tapping a card opens its full details, while its action buttons and inline links keep working.
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (
      !card ||
      e.target.closest("#tile-modal") ||
      e.target.closest("button,select,input,textarea,form,[data-no-tile-modal]")
    )
      return;
    const a = e.target.closest("a");
    if (a && a !== card) return;
    e.preventDefault();
    openTileDetails(card);
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#cw") && !e.target.closest("#fab"))
      $("#cw").classList.remove("open");
  });
}
const td = (o) => {
  $("#td").classList.toggle("on", !!o);
  $("#ov").classList.toggle("on", !!o);
};
function cartCount() {
  const c = $("#cc");
  c && (c.textContent = st.cart.length);
  const d = $("#td");
  if (!d) return;
  const t = st.cart.reduce((a, c) => a + c.p, 0);
  d.innerHTML =
    `<button class="x" id="tx" aria-label="Close">✕</button><h3>My trip</h3>` +
    (st.cart.length
      ? st.cart
          .map(
            (c) =>
              `<div class="it"><div><b>${c.t}</b><small>${c.d}</small><button data-dr="${c.id}">Remove</button></div><b>${inr(c.p)}</b></div>`,
          )
          .join("") +
        `<div class="it" style="align-items:center"><b>Total</b><span class="price">${inr(t)}</span></div><a class="btn" href="trip.html" style="text-align:center">Review and confirm</a><a class="btn alt" href="safety.html" style="text-align:center;margin-top:10px">Set up GPS and SOS</a>`
      : `<p style="margin:10px 0 20px">Nothing here yet. Start with a guide, then add a stay and a ride.</p><a class="btn" href="guides.html" style="text-align:center">Find a guide</a><a class="btn alt" href="packages.html" style="text-align:center;margin-top:10px">Browse packages</a>`);
}
function toast(m) {
  const t = $("#ts");
  t.textContent = m;
  t.classList.add("on");
  clearTimeout(t.h);
  t.h = setTimeout(() => t.classList.remove("on"), 1800);
}
async function requireSignedInForTrip() {
  const configured =
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !window.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE") &&
    window.supabase;
  if (!configured) {
    toast("Sign-in is not configured yet. Please configure Supabase first.");
    return false;
  }
  const sb =
    window.__twuSupabase ||
    (window.__twuSupabase = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: window.localStorage,
        },
      },
    ));
  try {
    const {
      data: { session },
    } = await sb.auth.getSession();
    if (session?.user) return true;
  } catch (err) {
    console.warn("Could not verify login before trip action", err);
  }
  toast("Please sign in before adding items to your trip.");
  const next =
    location.pathname.split("/").pop() + location.search + location.hash;
  setTimeout(() => {
    location.href =
      "login.html?next=" + encodeURIComponent(next || "index.html");
  }, 450);
  return false;
}
async function toggle(it) {
  if (!(await requireSignedInForTrip())) return;
  const i = st.cart.findIndex((c) => c.id == it.id);
  if (i > -1) {
    st.cart.splice(i, 1);
    toast("Removed from your trip");
  } else {
    st.cart.push(it);
    toast("Added to your trip");
  }
  save();
  cartCount();
  redraw(false);
}
function bind(cb) {
  redraw = cb;
  const q = new URLSearchParams(location.search);
  ["state", "dest", "lang", "tag"].forEach((k) => {
    const value = q.get(k);
    if (
      value &&
      (k !== "state" || value === "All states" || STATES.includes(value)) &&
      (k !== "dest" || DEST.includes(value))
    )
      st[k] = value;
  });
  if (!STATES.includes(st.state) && st.state !== "All states")
    st.state = "All states";
  if (
    st.state !== "All states" &&
    !DESTINATION_CATALOG.some(
      (x, index) =>
        isDestinationVisible(index) &&
        x.place === st.dest &&
        x.state === st.state,
    )
  ) {
    const nextPlace = DESTINATION_CATALOG.find(
      (x, index) => isDestinationVisible(index) && x.state === st.state,
    );
    st.dest =
      nextPlace?.place ||
      DEST.find((place, index) => isDestinationVisible(index)) ||
      "";
  }
  const M = {
    state: ["All states", ...STATES],
    dest: DEST.filter((place, index) => isDestinationVisible(index)),
    lang: ["Any", ...LANG],
    tag: ["Any", ...TAGS],
    from: HUBS,
    days: [1, 2, 3, 4, 5, 6, 7],
    nights: [1, 2, 3, 4, 5, 6, 7],
    gd: [1, 2, 3, 4, 5, 6, 7],
    trav: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  };
  const homeCascade = document.body.dataset.page === "home";
  const escapeOption = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const fill = () =>
    $$("select[data-k]").forEach((select) => {
      const key = select.dataset.k;
      let options = M[key];

      // The homepage asks for a state first, then offers places from that state only.
      if (homeCascade && key === "state") {
        const currentState = STATES.includes(st.state) ? st.state : "";
        select.innerHTML =
          `<option value="">Choose a state</option>` +
          STATES.map(
            (option) =>
              `<option value="${escapeOption(option)}">${escapeOption(option)}</option>`,
          ).join("");
        select.value = currentState;
        st.state = currentState;
        return;
      }

      if (key === "dest") {
        const stateSelect = document.querySelector('select[data-k="state"]');
        const chosenState = stateSelect?.value || "All states";
        if (homeCascade) {
          options =
            chosenState && chosenState !== "All states"
              ? DEST.filter(
                  (place, index) =>
                    isDestinationVisible(index) && STATE[index] === chosenState,
                )
              : [];
          const currentPlace = options.includes(st.dest) ? st.dest : "";
          select.disabled = !chosenState || chosenState === "All states";
          select.innerHTML =
            `<option value="">${chosenState && chosenState !== "All states" ? "Choose a place to visit" : "Select a state first"}</option>` +
            options
              .map(
                (option) =>
                  `<option value="${escapeOption(option)}">${escapeOption(option)}</option>`,
              )
              .join("");
          select.value = currentPlace;
          st.dest = currentPlace;
          return;
        }
        options = DEST.filter(
          (place, index) =>
            isDestinationVisible(index) &&
            (chosenState === "All states" || STATE[index] === chosenState),
        );
        if (!options.includes(st.dest)) st.dest = options[0] || DEST[0];
      }
      if (options) {
        const current = options.includes(st[key]) ? st[key] : options[0];
        select.innerHTML = options
          .map(
            (option) =>
              `<option value="${escapeOption(option)}"${option === current ? " selected" : ""}>${escapeOption(option)}</option>`,
          )
          .join("");
        st[key] = current;
      } else select.value = st[key];
    });
  fill();
  const onFilterChange = (event) => {
    const key = event.target?.dataset?.k;
    if (!key) return;
    st[key] = NUM.includes(key) ? +event.target.value : event.target.value;
    if (key === "state" && homeCascade) {
      // A destination chosen for the previous state must not remain selected.
      st.dest = "";
    } else if (
      key === "state" &&
      st.state !== "All states" &&
      !DESTINATION_CATALOG.some(
        (x, index) =>
          isDestinationVisible(index) &&
          x.place === st.dest &&
          x.state === st.state,
      )
    ) {
      st.dest =
        DESTINATION_CATALOG.find(
          (x, index) => isDestinationVisible(index) && x.state === st.state,
        )?.place ||
        DEST.find((place, index) => isDestinationVisible(index)) ||
        "";
    }
    if (key === "dest") {
      const place = DESTINATION_CATALOG.find((x) => x.place === st.dest);
      if (
        place &&
        document.querySelector('select[data-k="state"]') &&
        st.state !== "All states" &&
        place.state !== st.state
      )
        st.state = place.state;
    }
    save();
    fill();
    cb(true);
  };
  document.addEventListener("change", onFilterChange);
  document.addEventListener("input", (event) => {
    if (event.target?.matches("input[data-k],textarea[data-k]"))
      onFilterChange(event);
  });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button[data-id]");
    if (t && reg[t.dataset.id] && !t.closest(".noadd"))
      toggle(reg[t.dataset.id]);
  });
  cb(true);
  const syncTasks = [];
  if (
    ["home", "guides", "guide", "stays", "rides"].includes(
      document.body.dataset.page,
    )
  ) {
    syncTasks.push(loadPublishedPlaces());
  }
  if (["home", "guides", "guide"].includes(document.body.dataset.page)) {
    syncTasks.push(loadApprovedGuideListings());
  }
  if (syncTasks.length)
    Promise.all(syncTasks).then((results) => {
      fill();
      save();
      if (results.some((result) => result === true || result?.changed)) {
        cb(true);
        if (document.body.dataset.page === "home") {
          refreshFeaturedGuideCards();
          window.twuRenderStateFeatures?.();
        }
      }
    });
}
const draw = (el, h, fx) => {
  el.innerHTML = h;
};
/* chat */
function chat() {
  const R = [
    [
      /dz[uü]kou/i,
      "Local guide and entry rules can change by season. Confirm current requirements before departure. Start with a guide profile, then consider a Viswema homestay.",
    ],
    [
      /emergen|injur|lost|accident|sos|danger/i,
      "If anyone is in danger, call 112 now. The Safety demo can prepare a message with your location, but it does not automatically notify contacts or a travel desk.",
    ],
    [
      /gps|track|location/i,
      "Open Safety and tap Start tracking. You can copy a map link for your current coordinates and set a local safe-return reminder.",
    ],
    [
      /guide|language|speak/i,
      "Choose a destination and language on the Guides page. I rank local guide profiles by destination and language match. Check each profile for its verification status.",
    ],
    [
      /stay|homestay|hotel|room/i,
      "Homestays are family run with meals. Rooms are sized to your group, two travellers per room.",
    ],
    [
      /taxi|ride|cab|transport|bus|airport/i,
      "Rides run from Guwahati, Dimapur and Shillong. Pick a shared seat, taxi or private SUV on Rides.",
    ],
    [
      /gear|tent|rent|pole|shoe|jacket/i,
      "Rent poles, tents, bags and shoes by the day on Gear. We hand them over at your first stop.",
    ],
    [
      /price|cost|budget|cheap|how much/i,
      "Budget trips start around ₹9,800 per person for a weekend. Filter on Packages.",
    ],
    [
      /trip|cart|total|booking|booked/i,
      () =>
        st.cart.length
          ? `You have ${st.cart.length} item${st.cart.length > 1 ? "s" : ""} worth ${inr(st.cart.reduce((a, c) => a + c.p, 0))} on your trip.`
          : "Your trip is empty. Want to start with a guide?",
    ],
  ];
  const say = (t, u) => {
    const m = document.createElement("div");
    m.className = "m" + (u ? " u" : "");
    m.textContent = t;
    $("#ms").append(m);
    $("#ms").scrollTop = 1e9;
  };
  const ask = (q) => {
    say(q, 1);
    const t = document.createElement("div");
    t.className = "m";
    t.textContent = "…";
    $("#ms").append(t);
    setTimeout(() => {
      t.remove();
      const r = R.find((r) => r[0].test(q));
      say(
        r
          ? typeof r[1] == "function"
            ? r[1]()
            : r[1]
          : "This demo assistant can help with common trip-planning questions. For help with a real booking, contact the operator directly; for emergencies, call 112. You can also browse guides, stays, rides, gear and safety tools.",
      );
    }, 700);
  };
  $("#fab").onclick = () => $("#cw").classList.toggle("open");
  $("#closeChat").onclick = () => $("#cw").classList.remove("open");
  $("#cf").onsubmit = (e) => {
    e.preventDefault();
    const v = $("#ci").value.trim();
    if (v) {
      ask(v);
      $("#ci").value = "";
    }
  };
  $("#qs").innerHTML = [
    "Do I need a guide for Dzükou?",
    "What is on my trip?",
    "Emergency help",
  ]
    .map((q) => `<button type="button">${q}</button>`)
    .join("");
  $("#qs").onclick = (e) =>
    e.target.tagName == "BUTTON" && ask(e.target.textContent);
  say(
    "Hi, this is the Trail With Us desk. Ask about guides, stays, rides, gear, GPS or permits, day or night.",
  );
  // Keep the hero scrapbook alive: cards glide to new destinations every five seconds.
  if (document.body.dataset.page === "home") {
    const scenes = [
      [TWU_STATE_PHOTOS["Nagaland"], "Dzükou Valley"],
      [TWU_STATE_PHOTOS["Meghalaya"], "Living root bridges"],
      [TWU_STATE_PHOTOS["Manipur"], "River country"],
      [TWU_STATE_PHOTOS["Assam"], "Wild Assam"],
      [TWU_STATE_PHOTOS["Arunachal Pradesh"], "Roads through the hills"],
      [TWU_STATE_PHOTOS["Sikkim"], "Mountain mornings"],
    ];
    let sceneIndex = 0;
    const cards = $$("#pl .pola");
    if (cards.length)
      window.setInterval(() => {
        sceneIndex = (sceneIndex + 1) % scenes.length;
        cards.forEach((card, index) => {
          const scene = scenes[(sceneIndex + index) % scenes.length];
          const inner = card.querySelector("div");
          const caption = card.querySelector("span");
          if (inner) inner.style.backgroundImage = `linear-gradient(135deg,rgba(12,30,36,.08),rgba(12,30,36,.2)),url("${scene[0]}")`;
          if (caption) caption.textContent = scene[1];
        });
        const container = $("#pl");
        const before = new Map(
          cards.map((card) => [card, card.getBoundingClientRect()]),
        );
        // Rotate the scrapbook order, then FLIP each card so it glides to its new place.
        if (container && cards.length > 1) container.appendChild(cards[0]);
        cards.forEach((card) => {
          const a = before.get(card),
            b = card.getBoundingClientRect();
          if (a && b && typeof card.animate === "function") {
            card.animate(
              [
                {
                  transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)`,
                },
                { transform: "translate(0, 0)" },
              ],
              { duration: 720, easing: "cubic-bezier(.2,.8,.2,1)" },
            );
          }
        });
        cards.forEach((card, i) => {
          const scene = scenes[(sceneIndex + i) % scenes.length];
          card.classList.add("is-swapping");
          window.setTimeout(() => {
            const image = card.querySelector("div");
            if (image) image.style.backgroundImage = `url("${scene[0]}")`;
            const label = card.querySelector("span");
            if (label) label.textContent = scene[1];
            card.setAttribute("aria-label", `Explore ${scene[1]} photos`);
            card.classList.remove("is-swapping");
          }, 280);
        });
      }, 5000);
  }
}
document.addEventListener("DOMContentLoaded", layout);
