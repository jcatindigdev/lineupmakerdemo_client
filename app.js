const { createApp } = Vue;

//const API_BASE = "http://localhost:5000/api";

const API_BASE = "https://lineupmakerdemo-server.onrender.com/api";

// ── Voice / Instrument parts ────────────────────────────────
const SINGER_PARTS = ["fullSong", "soprano", "alto", "tenor", "bass", "baritone", "solo"];
const INSTRUMENT_PARTS = [
  "electricGuitar1", "electricGuitar2", "electricGuitar3",
  "acousticGuitar1", "acousticGuitar2",
  "violin", "viola", "keys",
];
const ALL_VOICE_PARTS = [...SINGER_PARTS, ...INSTRUMENT_PARTS];

const VOICE_LABELS = {
  fullSong: "Full Song", soprano: "Soprano", alto: "Alto",
  tenor: "Tenor", bass: "Bass", baritone: "Baritone", solo: "Solo",
  electricGuitar1: "Electric Guitar 1", electricGuitar2: "Electric Guitar 2",
  electricGuitar3: "Electric Guitar 3", acousticGuitar1: "Acoustic Guitar 1",
  acousticGuitar2: "Acoustic Guitar 2", violin: "Violin", viola: "Viola", keys: "Keys",
};

const EMPTY_VOICINGS = () => ({
  fullSong: "", soprano: "", alto: "", tenor: "", bass: "", baritone: "", solo: "",
  electricGuitar1: "", electricGuitar2: "", electricGuitar3: "",
  acousticGuitar1: "", acousticGuitar2: "",
  violin: "", viola: "", keys: "",
});

// ── Guitar Chord Chart ──────────────────────────────────────
// positions: [lowE, A, D, G, B, highE]  |  -1=muted  0=open  n=fret
const ROOTS = ['A','Bb','B','C','Db','D','Eb','E','F','Gb','G','Ab'];

const CHORD_DB = {
  'A': [
    { label:'A',     pos:[-1,0,2,2,2,0],  base:1, barres:[] },
    { label:'Am',    pos:[-1,0,2,2,1,0],  base:1, barres:[] },
    { label:'A7',    pos:[-1,0,2,0,2,0],  base:1, barres:[] },
    { label:'Am7',   pos:[-1,0,2,0,1,0],  base:1, barres:[] },
    { label:'Amaj7', pos:[-1,0,2,1,2,0],  base:1, barres:[] },
    { label:'A6',    pos:[-1,0,2,2,2,2],  base:1, barres:[] },
    { label:'A9',    pos:[-1,0,2,4,2,4],  base:1, barres:[] },
    { label:'Asus4', pos:[-1,0,2,2,3,0],  base:1, barres:[] },
    { label:'Adim',  pos:[-1,-1,0,1,0,1], base:1, barres:[] },
    { label:'Aaug',  pos:[-1,0,3,2,2,1],  base:1, barres:[] },
  ],
  'Bb': [
    { label:'Bb',     pos:[-1,1,3,3,3,1], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bbm',    pos:[-1,1,3,3,2,1], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bb7',    pos:[-1,1,3,1,3,1], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bbm7',   pos:[-1,1,3,1,2,1], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bbmaj7', pos:[-1,1,3,2,3,1], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bb6',    pos:[-1,1,3,3,3,3], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bb9',    pos:[-1,1,3,1,4,1], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bbsus4', pos:[-1,1,3,3,4,1], base:1, barres:[{fret:1,from:1,to:5}] },
    { label:'Bbdim',  pos:[-1,-1,1,2,1,2],base:1, barres:[] },
    { label:'Bbaug',  pos:[-1,1,4,3,3,2], base:1, barres:[] },
  ],
  'B': [
    { label:'B',     pos:[-1,2,4,4,4,2],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'Bm',    pos:[-1,2,4,4,3,2],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'B7',    pos:[-1,2,4,2,4,2],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'Bm7',   pos:[-1,2,4,2,3,2],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'Bmaj7', pos:[-1,2,4,3,4,2],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'B6',    pos:[-1,2,4,4,4,4],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'B9',    pos:[-1,2,4,2,5,2],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'Bsus4', pos:[-1,2,4,4,5,2],  base:2, barres:[{fret:2,from:1,to:5}] },
    { label:'Bdim',  pos:[-1,-1,1,2,1,2], base:2, barres:[] },
    { label:'Baug',  pos:[-1,2,5,4,4,3],  base:2, barres:[] },
  ],
  'C': [
    { label:'C',     pos:[-1,3,2,0,1,0],  base:1, barres:[] },
    { label:'Cm',    pos:[-1,3,5,5,4,3],  base:3, barres:[{fret:3,from:1,to:5}] },
    { label:'C7',    pos:[-1,3,2,3,1,0],  base:1, barres:[] },
    { label:'Cm7',   pos:[-1,3,5,3,4,3],  base:3, barres:[{fret:3,from:1,to:5}] },
    { label:'Cmaj7', pos:[-1,3,2,0,0,0],  base:1, barres:[] },
    { label:'C6',    pos:[-1,3,2,2,1,0],  base:1, barres:[] },
    { label:'C9',    pos:[-1,3,2,3,3,3],  base:1, barres:[] },
    { label:'Csus4', pos:[-1,3,3,0,1,1],  base:1, barres:[] },
    { label:'Cdim',  pos:[-1,-1,1,2,1,2], base:3, barres:[] },
    { label:'Caug',  pos:[-1,3,2,1,1,0],  base:1, barres:[] },
  ],
  'Db': [
    { label:'Db',     pos:[-1,4,6,6,6,4], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Dbm',    pos:[-1,4,6,6,5,4], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Db7',    pos:[-1,4,6,4,6,4], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Dbm7',   pos:[-1,4,6,4,5,4], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Dbmaj7', pos:[-1,4,6,5,6,4], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Db6',    pos:[-1,4,6,6,6,6], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Db9',    pos:[-1,4,6,4,7,4], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Dbsus4', pos:[-1,4,6,6,7,4], base:4, barres:[{fret:4,from:1,to:5}] },
    { label:'Dbdim',  pos:[-1,-1,1,2,1,2],base:4, barres:[] },
    { label:'Dbaug',  pos:[-1,4,7,6,6,5], base:4, barres:[] },
  ],
  'D': [
    { label:'D',     pos:[-1,-1,0,2,3,2], base:1, barres:[] },
    { label:'Dm',    pos:[-1,-1,0,2,3,1], base:1, barres:[] },
    { label:'D7',    pos:[-1,-1,0,2,1,2], base:1, barres:[] },
    { label:'Dm7',   pos:[-1,-1,0,2,1,1], base:1, barres:[] },
    { label:'Dmaj7', pos:[-1,-1,0,2,2,2], base:1, barres:[] },
    { label:'D6',    pos:[-1,-1,0,2,0,2], base:1, barres:[] },
    { label:'D9',    pos:[-1,0,0,2,1,2],  base:1, barres:[] },
    { label:'Dsus4', pos:[-1,-1,0,2,3,3], base:1, barres:[] },
    { label:'Ddim',  pos:[-1,-1,0,1,0,1], base:1, barres:[] },
    { label:'Daug',  pos:[-1,-1,0,3,3,2], base:1, barres:[] },
  ],
  'Eb': [
    { label:'Eb',     pos:[-1,6,8,8,8,6], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Ebm',    pos:[-1,6,8,8,7,6], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Eb7',    pos:[-1,6,8,6,8,6], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Ebm7',   pos:[-1,6,8,6,7,6], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Ebmaj7', pos:[-1,6,8,7,8,6], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Eb6',    pos:[-1,6,8,8,8,8], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Eb9',    pos:[-1,6,8,6,9,6], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Ebsus4', pos:[-1,6,8,8,9,6], base:6, barres:[{fret:6,from:1,to:5}] },
    { label:'Ebdim',  pos:[-1,-1,1,2,1,2],base:5, barres:[] },
    { label:'Ebaug',  pos:[-1,6,9,8,8,7], base:6, barres:[] },
  ],
  'E': [
    { label:'E',     pos:[0,2,2,1,0,0],   base:1, barres:[] },
    { label:'Em',    pos:[0,2,2,0,0,0],   base:1, barres:[] },
    { label:'E7',    pos:[0,2,0,1,0,0],   base:1, barres:[] },
    { label:'Em7',   pos:[0,2,0,0,0,0],   base:1, barres:[] },
    { label:'Emaj7', pos:[0,2,1,1,0,0],   base:1, barres:[] },
    { label:'E6',    pos:[0,2,2,1,2,0],   base:1, barres:[] },
    { label:'E9',    pos:[0,2,2,1,3,2],   base:1, barres:[] },
    { label:'Esus4', pos:[0,2,2,2,0,0],   base:1, barres:[] },
    { label:'Edim',  pos:[-1,-1,2,3,2,3], base:1, barres:[] },
    { label:'Eaug',  pos:[0,3,2,1,1,0],   base:1, barres:[] },
  ],
  'F': [
    { label:'F',     pos:[1,1,2,3,3,1],   base:1, barres:[{fret:1,from:0,to:5}] },
    { label:'Fm',    pos:[1,1,3,3,2,1],   base:1, barres:[{fret:1,from:0,to:5}] },
    { label:'F7',    pos:[1,1,2,1,3,1],   base:1, barres:[{fret:1,from:0,to:5}] },
    { label:'Fm7',   pos:[1,1,3,1,2,1],   base:1, barres:[{fret:1,from:0,to:5}] },
    { label:'Fmaj7', pos:[-1,-1,3,2,1,0], base:1, barres:[] },
    { label:'F6',    pos:[1,1,2,3,3,3],   base:1, barres:[{fret:1,from:0,to:5}] },
    { label:'F9',    pos:[1,1,2,1,4,1],   base:1, barres:[{fret:1,from:0,to:5}] },
    { label:'Fsus4', pos:[1,1,3,3,1,1],   base:1, barres:[{fret:1,from:0,to:5}] },
    { label:'Fdim',  pos:[-1,-1,3,4,3,4], base:1, barres:[] },
    { label:'Faug',  pos:[-1,-1,3,2,2,1], base:1, barres:[] },
  ],
  'Gb': [
    { label:'Gb',     pos:[2,2,4,4,4,2],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gbm',    pos:[2,2,4,4,3,2],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gb7',    pos:[2,2,4,3,5,2],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gbm7',   pos:[2,2,4,2,3,2],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gbmaj7', pos:[2,2,4,3,4,2],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gb6',    pos:[2,2,4,4,4,4],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gb9',    pos:[2,2,4,2,5,2],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gbsus4', pos:[2,2,4,4,5,2],  base:2, barres:[{fret:2,from:0,to:5}] },
    { label:'Gbdim',  pos:[-1,-1,4,5,4,5],base:2, barres:[] },
    { label:'Gbaug',  pos:[-1,2,5,4,4,3], base:2, barres:[] },
  ],
  'G': [
    { label:'G',     pos:[3,2,0,0,0,3],   base:1, barres:[] },
    { label:'Gm',    pos:[3,5,5,3,3,3],   base:3, barres:[{fret:3,from:0,to:5}] },
    { label:'G7',    pos:[3,2,0,0,0,1],   base:1, barres:[] },
    { label:'Gm7',   pos:[3,5,3,3,3,3],   base:3, barres:[{fret:3,from:0,to:5}] },
    { label:'Gmaj7', pos:[3,2,0,0,0,2],   base:1, barres:[] },
    { label:'G6',    pos:[3,2,0,0,0,0],   base:1, barres:[] },
    { label:'G9',    pos:[3,2,0,2,0,3],   base:1, barres:[] },
    { label:'Gsus4', pos:[3,3,0,0,1,3],   base:1, barres:[] },
    { label:'Gdim',  pos:[-1,-1,5,3,4,3], base:3, barres:[] },
    { label:'Gaug',  pos:[3,2,1,0,0,3],   base:1, barres:[] },
  ],
  'Ab': [
    { label:'Ab',     pos:[4,4,6,6,6,4],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Abm',    pos:[4,4,6,6,5,4],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Ab7',    pos:[4,4,6,4,6,4],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Abm7',   pos:[4,4,6,4,5,4],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Abmaj7', pos:[4,4,6,5,6,4],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Ab6',    pos:[4,4,6,6,6,6],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Ab9',    pos:[4,4,6,4,7,4],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Absus4', pos:[4,4,6,6,7,4],  base:4, barres:[{fret:4,from:0,to:5}] },
    { label:'Abdim',  pos:[-1,-1,1,2,1,2],base:4, barres:[] },
    { label:'Abaug',  pos:[-1,4,7,6,6,5], base:4, barres:[] },
  ],
};

// ── SVG Chord Diagram Renderer ──────────────────────────────
function buildChordSVG(chord) {
  const SS = 11, FS = 13, FRETS = 4, STR = 6;
  const OX = 14, OY = 26;
  const W = OX + (STR - 1) * SS + 22;
  const H = OY + FRETS * FS + 8;
  const sx = (i) => OX + i * SS;
  const fy = (rel) => OY + (rel - 1) * FS + FS / 2;
  const rel = (abs) => abs - chord.base + 1;

  let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`;

  // Nut or fret position label
  if (chord.base === 1) {
    svg += `<rect x="${OX}" y="${OY}" width="${(STR-1)*SS}" height="3" rx="1" fill="#222"/>`;
  } else {
    svg += `<text x="${OX+(STR-1)*SS+4}" y="${OY+FS}" font-size="8" fill="#777" font-family="sans-serif">${chord.base}fr</text>`;
  }

  // Fret lines
  for (let f = 0; f <= FRETS; f++) {
    svg += `<line x1="${OX}" y1="${OY+f*FS}" x2="${OX+(STR-1)*SS}" y2="${OY+f*FS}" stroke="#ccc" stroke-width="0.7"/>`;
  }

  // String lines
  for (let s = 0; s < STR; s++) {
    svg += `<line x1="${sx(s)}" y1="${OY}" x2="${sx(s)}" y2="${OY+FRETS*FS}" stroke="#888" stroke-width="0.8"/>`;
  }

  // Barres
  (chord.barres || []).forEach(b => {
    const rf = rel(b.fret);
    if (rf < 1 || rf > FRETS) return;
    svg += `<rect x="${sx(b.from)-4}" y="${fy(rf)-4.5}" width="${sx(b.to)-sx(b.from)+8}" height="9" rx="4.5" fill="#1a1a2e"/>`;
  });

  // Dots and mute/open indicators
  chord.pos.forEach((absF, s) => {
    const x = sx(s);
    if (absF === -1) {
      svg += `<line x1="${x-3}" y1="10" x2="${x+3}" y2="16" stroke="#888" stroke-width="1.5"/>`;
      svg += `<line x1="${x+3}" y1="10" x2="${x-3}" y2="16" stroke="#888" stroke-width="1.5"/>`;
    } else if (absF === 0) {
      svg += `<circle cx="${x}" cy="13" r="3.5" fill="none" stroke="#555" stroke-width="1.2"/>`;
    } else {
      const isBarre = (chord.barres||[]).some(b => b.fret===absF && s>=b.from && s<=b.to);
      if (!isBarre) {
        const rf = rel(absF);
        if (rf >= 1 && rf <= FRETS) {
          svg += `<circle cx="${x}" cy="${fy(rf)}" r="4.5" fill="#1a1a2e"/>`;
        }
      }
    }
  });

  svg += `</svg>`;
  return svg;
}

//python3 -m http.server 3000
createApp({
  data() {
    return {
      activeTab: "library",
      alert: { message: "", type: "success" },

      // ── Song Library ──────────────────────────────────────
      contentItems: [],
      loading: false,
      searchQuery: "",
      categoryFilter: "",
      currentPage: 1,
      totalPages: 1,
      searchDebounce: null,

      // ── Chord Library ─────────────────────────────────────
      chordItems: [],
      chordLoading: false,
      chordSearchQuery: "",
      chordCategoryFilter: "",
      chordCurrentPage: 1,
      chordTotalPages: 1,
      chordSearchDebounce: null,

      // ── Detail Page ───────────────────────────────────────
      detailItem: null,
      detailFromTab: "library",

      // ── Guitar Chord Chart ────────────────────────────────
      selectedRoot: "A",

      // ── Builder (shared) ──────────────────────────────────
      selectedItems: [],
      dragIndex: null,
      dragTargetIndex: null,

      // ── Upload form ───────────────────────────────────────
      form: {
        title: "",
        body: "",
        author: "",
        category: "",
        tags: "",
        fileType: "",
        contentType: "song",
        voicings: EMPTY_VOICINGS(),
        scoreUrl: "",
      },
      uploading: false,

      // ── Export / Builder settings ─────────────────────────
      pdfSettings: { title: "", author: "", includeMetadata: true },
      exportFormat: "pdf",
      generating: false,
      previewData: [],

      // ── Auth ──────────────────────────────────────────────
      user: null,
      loggingIn: false,
      loginForm: { email: "", password: "" },
      registerForm: { username: "", email: "", password: "", isAdmin: false },
      adminCreateForm: { username: "", email: "", password: "", isAdmin: false },

      // ── Edit modal ────────────────────────────────────────
      editForm: {
        _id: "", title: "", body: "", author: "", category: "", tags: "",
        contentType: "song",
        voicings: EMPTY_VOICINGS(),
        scoreUrl: "",
      },
      updating: false,
    };
  },

  computed: {
    isAdminUser() {
      return this.user && this.user.isAdmin === true;
    },
    // Pre-rendered chord diagrams for the selected root
    activeChordDiagrams() {
      return (CHORD_DB[this.selectedRoot] || []).map(chord => ({
        ...chord,
        svg: buildChordSVG(chord),
      }));
    },
    chordRoots() {
      return ROOTS;
    },
  },

  watch: {
    categoryFilter()      { this.fetchContent(1); },
    chordCategoryFilter() { this.fetchChords(1);  },
  },

  mounted() {
    this.checkAuth();
  },

  methods: {

    // ── Auth ────────────────────────────────────────────────
    getToken() { return localStorage.getItem("token"); },

    async checkAuth() {
      const token = this.getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          this.user = data.user;
          this.fetchContent();
          this.fetchChords();
        } else { localStorage.removeItem("token"); this.user = null; }
      } catch (err) { console.error("Auth check failed:", err); }
    },

    logout() {
      localStorage.removeItem("token");
      this.user = null;
      this.showAlert("Logged out.");
    },

    async login() {
      this.loggingIn = true;
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.loginForm),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("token", data.token);
          this.user = data.user;
          const modalEl = document.getElementById("loginModal");
          if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
          this.showAlert("Login successful.");
          this.loginForm = { email: "", password: "" };
        } else { this.showAlert(data.message, "danger"); }
      } catch { this.showAlert("Login failed.", "danger"); }
    },

    async register() {
      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
          body: JSON.stringify(this.registerForm),
        });
        const data = await res.json();
        if (data.success) {
          this.showAlert("Account created successfully.");
          const modalEl = document.getElementById("registerModal");
          if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
          this.registerForm = { username: "", email: "", password: "" };
        } else { this.showAlert(data.message, "danger"); }
      } catch { this.showAlert("Registration failed.", "danger"); }
    },

    async createUser() {
      try {
        const res = await fetch(`${API_BASE}/auth/admin/create-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
          body: JSON.stringify(this.adminCreateForm),
        });
        const data = await res.json();
        if (data.success) {
          this.showAlert(data.message);
          this.adminCreateForm = { username: "", email: "", password: "", isAdmin: false };
          const modalEl = document.getElementById("createUserModal");
          if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        } else { this.showAlert(data.message, "danger"); }
      } catch (error) { console.error(error); this.showAlert("Failed to create user.", "danger"); }
    },

    // ── Navigation ──────────────────────────────────────────
    switchTab(tab) {
      this.activeTab = tab;
      const navbar = document.getElementById("navbarNav");
      if (navbar && navbar.classList.contains("show")) {
        const bsc = bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar, { toggle: false });
        bsc.hide();
      }
    },

    switchToUpload(contentType = "song") {
      this.form.contentType = contentType;
      this.switchTab("upload");
    },

    // ── Detail Page ──────────────────────────────────────────
    openDetail(item, fromTab = "library") {
      this.detailItem   = { ...item };
      this.detailFromTab = fromTab;
      this.switchTab("detail");
    },

    goBackFromDetail() {
      this.switchTab(this.detailFromTab);
    },

    // ── Helpers ─────────────────────────────────────────────
    showAlert(message, type = "success") {
      this.alert = { message, type };
      setTimeout(() => (this.alert.message = ""), 4000);
    },

    truncate(text, len) {
      if (!text) return "";
      return text.length > len ? text.slice(0, len) + "…" : text;
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    },

    // ── Resource helpers ─────────────────────────────────────
    activeSingers(item) {
      if (!item?.voicings) return [];
      return SINGER_PARTS.filter(p => item.voicings[p]);
    },

    activeInstruments(item) {
      if (!item?.voicings) return [];
      return INSTRUMENT_PARTS.filter(p => item.voicings[p]);
    },

    activeVoicings(item) {
      if (!item?.voicings) return [];
      return ALL_VOICE_PARTS.filter(p => item.voicings[p]);
    },

    hasResources(item) {
      return this.activeVoicings(item).length > 0 || !!(item?.scoreUrl);
    },

    voicingLabel(part) {
      return VOICE_LABELS[part] || part;
    },

    // ── Song Library ─────────────────────────────────────────
    async fetchContent(page = 1) {
      this.loading = true;
      try {
        const params = new URLSearchParams({ page, limit: 12, contentType: "song" });
        if (this.searchQuery.trim()) params.append("search", this.searchQuery.trim());
        if (this.categoryFilter) params.append("category", this.categoryFilter);
        const res = await fetch(`${API_BASE}/content?${params}`);
        const data = await res.json();
        if (data.success) {
          this.contentItems = data.data;
          this.totalPages   = data.totalPages;
          this.currentPage  = data.page;
        } else { this.showAlert(data.message || "Failed to load songs.", "danger"); }
      } catch { this.showAlert("Cannot reach the server.", "danger"); }
      finally  { this.loading = false; }
    },

    debouncedSearch() {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => this.fetchContent(1), 350);
    },

    clearSearch() {
      this.searchQuery = "";
      this.categoryFilter = "";
      this.fetchContent(1);
    },

    goToPage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.fetchContent(p);
    },

    // ── Chord Library ─────────────────────────────────────────
    async fetchChords(page = 1) {
      this.chordLoading = true;
      try {
        const params = new URLSearchParams({ page, limit: 12, contentType: "chord" });
        if (this.chordSearchQuery.trim()) params.append("search", this.chordSearchQuery.trim());
        if (this.chordCategoryFilter) params.append("category", this.chordCategoryFilter);
        const res = await fetch(`${API_BASE}/content?${params}`);
        const data = await res.json();
        if (data.success) {
          this.chordItems       = data.data;
          this.chordTotalPages  = data.totalPages;
          this.chordCurrentPage = data.page;
        } else { this.showAlert(data.message || "Failed to load chords.", "danger"); }
      } catch { this.showAlert("Cannot reach the server.", "danger"); }
      finally  { this.chordLoading = false; }
    },

    debouncedChordSearch() {
      clearTimeout(this.chordSearchDebounce);
      this.chordSearchDebounce = setTimeout(() => this.fetchChords(1), 350);
    },

    clearChordSearch() {
      this.chordSearchQuery    = "";
      this.chordCategoryFilter = "";
      this.fetchChords(1);
    },

    goToChordPage(p) {
      if (p < 1 || p > this.chordTotalPages) return;
      this.fetchChords(p);
    },

    // ── Selection (shared builder) ───────────────────────────
    isSelected(id) { return this.selectedItems.some(i => i._id === id); },

    toggleSelect(item) {
      const idx = this.selectedItems.findIndex(i => i._id === item._id);
      if (idx === -1) this.selectedItems.push({ ...item });
      else this.selectedItems.splice(idx, 1);
    },

    clearSelection() { this.selectedItems = []; },

    // ── Delete ───────────────────────────────────────────────
    async deleteItem(id) {
      if (!confirm("Delete this item? This cannot be undone.")) return;
      try {
        const res = await fetch(`${API_BASE}/content/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${this.getToken()}` },
        });
        const data = await res.json();
        if (data.success) {
          this.showAlert("Item deleted.");
          // If detail page is showing this item, go back
          if (this.activeTab === "detail" && this.detailItem?._id === id) {
            this.switchTab(this.detailFromTab);
            this.detailItem = null;
          }
          this.contentItems  = this.contentItems.filter(i => i._id !== id);
          this.chordItems    = this.chordItems.filter(i => i._id !== id);
          this.selectedItems = this.selectedItems.filter(i => i._id !== id);
        } else { this.showAlert(data.message, "danger"); }
      } catch { this.showAlert("Delete failed.", "danger"); }
    },

    // ── Edit modal ───────────────────────────────────────────
    openEditModal(item) {
      this.editForm = {
        _id:         item._id,
        title:       item.title,
        body:        item.body,
        author:      item.author      || "",
        category:    item.category    || "",
        tags:        Array.isArray(item.tags) ? item.tags.join(", ") : "",
        contentType: item.contentType || "song",
        voicings: {
          fullSong: item.voicings?.fullSong || "",
          soprano:  item.voicings?.soprano  || "",
          alto:     item.voicings?.alto     || "",
          tenor:    item.voicings?.tenor    || "",
          bass:     item.voicings?.bass     || "",
          baritone: item.voicings?.baritone || "",
          solo:     item.voicings?.solo     || "",
          electricGuitar1: item.voicings?.electricGuitar1 || "",
          electricGuitar2: item.voicings?.electricGuitar2 || "",
          electricGuitar3: item.voicings?.electricGuitar3 || "",
          acousticGuitar1: item.voicings?.acousticGuitar1 || "",
          acousticGuitar2: item.voicings?.acousticGuitar2 || "",
          violin:          item.voicings?.violin          || "",
          viola:           item.voicings?.viola           || "",
          keys:            item.voicings?.keys            || "",
        },
        scoreUrl: item.scoreUrl || "",
      };
      const modalEl = document.getElementById("editModal");
      if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).show();
    },

    async updateContent() {
      if (!this.editForm.title.trim() || !this.editForm.body.trim() || !this.editForm.category) {
        this.showAlert("Title, body, and category are required.", "danger");
        return;
      }
      this.updating = true;
      try {
        const v = this.editForm.voicings;
        const payload = {
          title:       this.editForm.title.trim(),
          body:        this.editForm.body.trim(),
          author:      this.editForm.author.trim() || "Anonymous",
          category:    this.editForm.category,
          contentType: this.editForm.contentType,
          tags:        this.editForm.tags.split(",").map(t => t.trim()).filter(Boolean),
          voicings: {
            fullSong: v.fullSong.trim(), soprano: v.soprano.trim(),
            alto: v.alto.trim(), tenor: v.tenor.trim(),
            bass: v.bass.trim(), baritone: v.baritone.trim(), solo: v.solo.trim(),
            electricGuitar1: v.electricGuitar1.trim(), electricGuitar2: v.electricGuitar2.trim(),
            electricGuitar3: v.electricGuitar3.trim(), acousticGuitar1: v.acousticGuitar1.trim(),
            acousticGuitar2: v.acousticGuitar2.trim(), violin: v.violin.trim(),
            viola: v.viola.trim(), keys: v.keys.trim(),
          },
          scoreUrl: this.editForm.scoreUrl.trim(),
        };
        const res = await fetch(`${API_BASE}/content/${this.editForm._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          this.showAlert("Details updated successfully!");
          const modalEl = document.getElementById("editModal");
          if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
          // Update detailItem if we're viewing this item
          if (this.detailItem && this.detailItem._id === this.editForm._id) {
            this.detailItem = { ...this.detailItem, ...data.data };
          }
          if (this.editForm.contentType === "chord") this.fetchChords(this.chordCurrentPage);
          else this.fetchContent(this.currentPage);
        } else { this.showAlert(data.message || "Failed to update.", "danger"); }
      } catch (err) {
        console.error(err);
        this.showAlert("Failed to connect to the server.", "danger");
      } finally { this.updating = false; }
    },

    // ── Upload ───────────────────────────────────────────────
    async uploadContent() {
      if (!this.form.title.trim() || !this.form.body.trim() || !this.form.category || !this.form.fileType) {
        this.showAlert("Title, body, category, and content type are required.", "danger");
        return;
      }
      this.uploading = true;
      try {
        const v = this.form.voicings;
        const payload = {
          title:       this.form.title.trim(),
          body:        this.form.body.trim(),
          author:      this.form.author.trim() || "Anonymous",
          category:    this.form.category,
          tags:        this.form.tags.split(",").map(t => t.trim()).filter(Boolean),
          fileType:    this.form.fileType,
          contentType: this.form.contentType || "song",
          voicings: {
            fullSong: v.fullSong.trim(), soprano: v.soprano.trim(),
            alto: v.alto.trim(), tenor: v.tenor.trim(),
            bass: v.bass.trim(), baritone: v.baritone.trim(), solo: v.solo.trim(),
            electricGuitar1: v.electricGuitar1.trim(), electricGuitar2: v.electricGuitar2.trim(),
            electricGuitar3: v.electricGuitar3.trim(), acousticGuitar1: v.acousticGuitar1.trim(),
            acousticGuitar2: v.acousticGuitar2.trim(), violin: v.violin.trim(),
            viola: v.viola.trim(), keys: v.keys.trim(),
          },
          scoreUrl: this.form.scoreUrl.trim(),
        };
        const res = await fetch(`${API_BASE}/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          this.showAlert("Saved to database!");
          const wasChord = this.form.contentType === "chord";
          this.resetForm();
          this.switchTab(wasChord ? "chords" : "library");
          if (wasChord) this.fetchChords(1);
          else this.fetchContent(1);
        } else { this.showAlert(data.message || "Failed to save.", "danger"); }
      } catch { this.showAlert("Upload failed. Check server connection.", "danger"); }
      finally  { this.uploading = false; }
    },

    resetForm() {
      this.form = {
        title: "", body: "", author: "", category: "", tags: "", fileType: "",
        contentType: "song",
        voicings: EMPTY_VOICINGS(),
        scoreUrl: "",
      };
    },

    // ── Builder drag/sort ────────────────────────────────────
    moveItem(from, to) {
      const arr = [...this.selectedItems];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      this.selectedItems = arr;
      this.previewData   = [];
    },

    removeFromBuilder(idx) {
      this.selectedItems.splice(idx, 1);
      this.previewData = [];
    },

    dragStart(idx) { this.dragIndex = idx; },

    dragOver(idx) {
      if (this.dragIndex === null || this.dragIndex === idx) return;
      this.dragTargetIndex = idx;
      const arr = [...this.selectedItems];
      const [item] = arr.splice(this.dragIndex, 1);
      arr.splice(idx, 0, item);
      this.selectedItems = arr;
      this.dragIndex = idx;
    },

    dragEnd() {
      this.dragIndex = null;
      this.dragTargetIndex = null;
      this.previewData = [];
    },

    // ── Export dispatcher ────────────────────────────────────
    generateFile() {
      if (this.exportFormat === "pdf")  this.generatePDF();
      else if (this.exportFormat === "docx") this.generateDOCX();
      else if (this.exportFormat === "txt")  this.generateTXT();
    },

    // ── PDF ──────────────────────────────────────────────────
    async generatePDF() {
      if (!this.user) { this.showAlert("Authentication required.", "danger"); return; }
      if (!this.selectedItems.length) { this.showAlert("Add at least one item.", "danger"); return; }
      this.generating = true;
      try {
        const payload = {
          items: this.selectedItems.map((item, idx) => ({ id: item._id, order: idx })),
          title: this.pdfSettings.title || "My Document",
          author: this.pdfSettings.author || "",
          includeMetadata: this.pdfSettings.includeMetadata,
        };
        const res = await fetch(`${API_BASE}/pdf/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || "PDF generation failed."); }
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = (this.pdfSettings.title || "document").replace(/[^a-z0-9_\-]/gi, "_") + ".pdf";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showAlert("PDF downloaded successfully!");
      } catch (err) { this.showAlert(err.message || "PDF generation failed.", "danger"); }
      finally { this.generating = false; }
    },

    // ── DOCX ─────────────────────────────────────────────────
    async generateDOCX() {
      if (!this.user) { this.showAlert("Authentication required.", "danger"); return; }
      if (!this.selectedItems.length) { this.showAlert("Add at least one item.", "danger"); return; }
      this.generating = true;
      try {
        const payload = {
          items: this.selectedItems.map((item, idx) => ({ id: item._id, order: idx })),
          title: this.pdfSettings.title || "My Document",
          author: this.pdfSettings.author || "",
          includeMetadata: this.pdfSettings.includeMetadata,
        };
        const res = await fetch(`${API_BASE}/pdf/generate-docx`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.getToken()}` },
          body: JSON.stringify(payload),
        });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || "DOCX generation failed."); }
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = (this.pdfSettings.title || "document").replace(/[^a-z0-9_\-]/gi, "_") + ".docx";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showAlert("DOCX downloaded successfully!");
      } catch (err) { this.showAlert(err.message || "DOCX generation failed.", "danger"); }
      finally { this.generating = false; }
    },

    // ── TXT ──────────────────────────────────────────────────
    generateTXT() {
      if (!this.user) { this.showAlert("Authentication required.", "danger"); return; }
      if (!this.selectedItems.length) { this.showAlert("Add at least one item.", "danger"); return; }

      const docTitle  = this.pdfSettings.title  || "My Document";
      const docAuthor = this.pdfSettings.author || "";
      const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const LINE = "=".repeat(72);
      const DASH = "-".repeat(72);

      let txt = LINE + "\n" + docTitle.toUpperCase() + "\n";
      if (docAuthor) txt += `Prepared by: ${docAuthor}\n`;
      txt += `Generated: ${date}\n` + LINE + "\n\n";

      txt += "TABLE OF CONTENTS\n\n";
      this.selectedItems.forEach((item, idx) => {
        const label = item.contentType === "chord" ? `[Chords] ${item.title}` : item.title;
        txt += `  ${String(idx + 1).padStart(2, " ")}. ${label}\n`;
      });
      txt += "\n" + LINE + "\n\n";

      this.selectedItems.forEach((item, idx) => {
        const isChord = item.contentType === "chord";
        txt += `[${idx + 1}] ${item.title.toUpperCase()}${isChord ? " [CHORDS]" : ""}\n`;
        if (this.pdfSettings.includeMetadata) {
          const meta = [];
          if (item.author && item.author !== "Anonymous") meta.push(`Author: ${item.author}`);
          if (item.category) meta.push(`Category: ${item.category}`);
          if (item.tags?.length) meta.push(`Tags: ${item.tags.join(", ")}`);
          if (meta.length) txt += meta.join("  |  ") + "\n";
        }
        txt += DASH + "\n\n" + (item.body || "") + "\n\n";
        const singers     = this.activeSingers(item);
        const instruments = this.activeInstruments(item);
        if (singers.length || instruments.length || item.scoreUrl) {
          txt += "Resources:\n";
          if (singers.length) {
            txt += "  Singers:\n";
            singers.forEach(p => { txt += `    ${this.voicingLabel(p)}: ${item.voicings[p]}\n`; });
          }
          if (instruments.length) {
            txt += "  Instruments:\n";
            instruments.forEach(p => { txt += `    ${this.voicingLabel(p)}: ${item.voicings[p]}\n`; });
          }
          if (item.scoreUrl) txt += `  Music Score: ${item.scoreUrl}\n`;
          txt += "\n";
        }
        txt += LINE + "\n\n";
      });

      const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = docTitle.replace(/[^a-z0-9_\-]/gi, "_") + ".txt";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showAlert("TXT downloaded successfully!");
    },

    // ── Print Preview ─────────────────────────────────────────
    async previewPDF() {
      if (!this.selectedItems.length) return;

      const docTitle    = this.pdfSettings.title  || "My Document";
      const docAuthor   = this.pdfSettings.author || "";
      const includeMeta = this.pdfSettings.includeMetadata;
      const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const coverHTML = `
        <div class="preview-cover">
          <div class="preview-cover__title">${docTitle}</div>
          ${docAuthor ? `<div class="preview-cover__author">by ${docAuthor}</div>` : ""}
          <div class="preview-cover__date">${date}</div>
          <div class="preview-cover__count">${this.selectedItems.length} section${this.selectedItems.length !== 1 ? "s" : ""}</div>
        </div>`;

      const tocHTML = `
        <div class="preview-toc">
          <div class="preview-toc__title">Table of Contents</div>
          <hr class="preview-toc__divider"/>
          <ul class="preview-toc__list">
            ${this.selectedItems.map((item, idx) => {
              const label = item.contentType === "chord" ? `<span class="preview-chord-tag">[Chords]</span> ${item.title}` : item.title;
              return `<li class="preview-toc__item">
                <span><span class="preview-toc__num">${idx + 1}.</span>
                <span class="preview-toc__item-title">${label}</span></span>
                <span class="preview-toc__item-cat">${item.category || ""}</span>
              </li>`;
            }).join("")}
          </ul>
        </div>`;

      const pagesHTML = this.selectedItems.map((item, idx) => {
        const isChord     = item.contentType === "chord";
        const singers     = this.activeSingers(item);
        const instruments = this.activeInstruments(item);
        const hasScore    = !!item.scoreUrl;
        const resourcesHTML = (singers.length || instruments.length || hasScore) ? `
          <div class="preview-page__resources">
            <div class="preview-page__resources-title">Resources</div>
            ${singers.length ? `<div class="preview-page__resource-group">Singers</div>${singers.map(p=>`<div class="preview-page__resource-row"><span>${this.voicingLabel(p)}:</span><a href="${item.voicings[p]}" target="_blank">Open audio</a></div>`).join("")}` : ""}
            ${instruments.length ? `<div class="preview-page__resource-group">Instruments</div>${instruments.map(p=>`<div class="preview-page__resource-row"><span>${this.voicingLabel(p)}:</span><a href="${item.voicings[p]}" target="_blank">Open audio</a></div>`).join("")}` : ""}
            ${hasScore ? `<div class="preview-page__resource-row"><span>Music Score:</span><a href="${item.scoreUrl}" target="_blank">View music score</a></div>` : ""}
          </div>` : "";

        return `
          <div class="preview-page">
            <div class="preview-page__bar"></div>
            <div class="preview-page__inner">
              <div class="preview-page__header">
                <div class="preview-page__badge">${idx + 1}</div>
                <div>
                  <div class="preview-page__title">${item.title}</div>
                  ${isChord ? `<div class="preview-chord-tag" style="font-size:11px;color:#c9a96e;margin-top:2px">[Chords]</div>` : ""}
                </div>
              </div>
              ${includeMeta ? `<div class="preview-page__meta">
                ${item.author && item.author !== "Anonymous" ? `<span>Author: ${item.author}</span>` : ""}
                ${item.category ? `<span>Category: ${item.category}</span>` : ""}
                ${item.tags?.length ? `<span>Tags: ${item.tags.join(", ")}</span>` : ""}
              </div>` : ""}
              <hr class="preview-page__divider"/>
              <div class="preview-page__body${isChord ? " preview-page__body--chord" : ""}">${item.body}</div>
              ${resourcesHTML}
            </div>
            <div class="preview-page__footer">${docTitle} &mdash; Section ${idx + 1} of ${this.selectedItems.length}</div>
          </div>`;
      }).join("");

      document.getElementById("preview-document").innerHTML = `
        <style>
          #preview-document{background:#d8d8d8;padding:28px;font-family:Georgia,serif}
          .preview-cover{background:#1a1a2e;color:#e8d5b7;min-height:420px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;margin-bottom:20px;border-radius:4px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.18)}
          .preview-cover__title{font-size:30px;font-weight:700;margin-bottom:14px;line-height:1.2}
          .preview-cover__author{font-size:14px;color:#a09080;margin-bottom:10px;font-style:italic}
          .preview-cover__date{font-size:12px;color:#706050;margin-bottom:4px}
          .preview-cover__count{font-size:11px;color:#504030}
          .preview-toc{background:white;padding:40px 52px 36px;margin-bottom:20px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.10)}
          .preview-toc__title{font-size:22px;font-weight:700;color:#1a1a2e;margin-bottom:14px}
          .preview-toc__divider{border:none;border-top:1.5px solid #c9a96e;margin-bottom:16px}
          .preview-toc__list{list-style:none;padding:0;margin:0}
          .preview-toc__item{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
          .preview-toc__item:last-child{border-bottom:none}
          .preview-toc__num{color:#c9a96e;font-weight:700;margin-right:10px;min-width:20px}
          .preview-toc__item-title{font-weight:500;flex:1}
          .preview-toc__item-cat{font-size:11px;color:#888;background:#f5f5f5;padding:2px 9px;border-radius:999px;margin-left:8px}
          .preview-chord-tag{color:#c9a96e;font-size:11px;font-style:italic}
          .preview-page{background:white;padding:0 0 56px 0;margin-bottom:20px;border-radius:4px;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.10);overflow:hidden}
          .preview-page__bar{height:7px;background:#c9a96e;width:100%}
          .preview-page__inner{padding:24px 52px 0}
          .preview-page__header{display:flex;align-items:flex-start;gap:14px;margin-bottom:6px}
          .preview-page__badge{width:30px;height:30px;background:#1a1a2e;color:#e8d5b7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;margin-top:2px}
          .preview-page__title{font-size:20px;font-weight:700;color:#1a1a2e;line-height:1.3}
          .preview-page__meta{font-size:11px;color:#999;display:flex;gap:14px;flex-wrap:wrap;margin:4px 0 10px 44px}
          .preview-page__divider{border:none;border-top:1px solid #e8e0d8;margin:10px 0 16px}
          .preview-page__body{font-size:13px;color:#2c2c2c;line-height:1.85;white-space:pre-wrap}
          .preview-page__body--chord{font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.6}
          .preview-page__resources{margin-top:16px;padding-top:12px;border-top:1px solid #e8d5b7}
          .preview-page__resources-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#c9a96e;margin-bottom:6px}
          .preview-page__resource-group{font-size:10px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.04em;margin:6px 0 3px 8px}
          .preview-page__resource-row{font-size:11px;color:#666;display:flex;gap:6px;margin-bottom:3px;padding-left:16px}
          .preview-page__resource-row a{color:#1a5ca8;text-decoration:underline}
          .preview-page__footer{position:absolute;bottom:0;left:0;right:0;padding:10px 52px;font-size:10px;color:#bbb;text-align:center;border-top:1px solid #f0f0f0;background:white}
        </style>
        ${coverHTML}${tocHTML}${pagesHTML}`;

      this.previewData = this.selectedItems.map((item, idx) => ({
        order: idx + 1, id: item._id, title: item.title, category: item.category,
      }));

      const modalEl = document.getElementById("previewModal");
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    },

  },
}).mount("#app");
