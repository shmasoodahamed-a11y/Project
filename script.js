// ==========================================
// 1. FIREBASE CONFIG & GLOBAL VARS
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyC3tVuV5xzYUlNyqi0Qsz5qo3CdaOdkdZk",
  authDomain: "pentagon-53ed4.firebaseapp.com",
  projectId: "pentagon-53ed4",
  storageBucket: "pentagon-53ed4.firebasestorage.app",
  messagingSenderId: "113137921267",
  appId: "1:113137921267:web:08d52af4a16928f1051b86",
  measurementId: "G-MC2E54D49F"
};
let auth, db, currentUser = null;
let isOffline = true; 
let currentDate = new Date(); 

// Try to initialize Firebase
try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        isOffline = false;
        console.log("Cloud Mode: Active");
    } else {
        console.log("Offline Mode: Keys missing or placeholder used.");
    }
} catch(e) {
    console.warn("Offline Mode Force: ", e);
    isOffline = true;
}

// ==========================================
// 2. DATA CONSTANTS
// ==========================================
const UPSC_SYLLABUS = [
    { subject: "History: Modern (Spectrum)", chapters: [{ title: "Advent of Europeans", topics: ["Portuguese in India", "Dutch & English", "French in India", "Carnatic Wars", "Decline of Mughals"] }, { title: "British Expansion", topics: ["Battle of Plassey & Buxar", "Mysore Wars (Tipu Sultan)", "Maratha Wars", "Conquest of Sindh & Punjab", "Policy of Ring Fence & Subsidiary Alliance", "Doctrine of Lapse"] }, { title: "Revolt of 1857", topics: ["Causes (Economic/Admin/Sepoy)", "Centres & Leaders", "Suppression & Failure", "Changes after 1858 Act"] }, { title: "Socio-Religious Reforms", topics: ["Raja Rammohan Roy (Brahmo Samaj)", "Ishwar Chandra Vidyasagar", "Dayanand Saraswati (Arya Samaj)", "Vivekananda", "Aligarh Movement", "Theosophical Society"] }, { title: "Freedom Struggle Begins", topics: ["Pre-Congress Associations", "Formation of INC (1885)", "Moderate Phase (1885-1905)", "Economic Critique of British Rule"] }, { title: "National Movement (1905-18)", topics: ["Partition of Bengal & Swadeshi", "Surat Split", "Revolutionary Activities (Phase 1)", "Ghadar Party", "Home Rule League", "Lucknow Pact"] }, { title: "Mass Nationalism (1919-39)", topics: ["Arrival of Gandhi (Satyagraha)", "Rowlatt Act & Jallianwala", "Non-Cooperation & Khilafat", "Swarajists & No-Changers", "Simon Commission", "Civil Disobedience (Salt March)", "Round Table Conferences", "Karachi Session"] }, { title: "Towards Freedom (1939-47)", topics: ["August Offer", "Individual Satyagraha", "Cripps Mission", "Quit India Movement", "INA & Subhash Bose", "Cabinet Mission", "Mountbatten Plan", "Partition"] }, { title: "Post-Independence", topics: ["Integration of States", "Linguistic Reorganization", "Tribal Policy", "Foreign Policy (Non-Alignment)"] }] },
    { subject: "History: Ancient & Medieval", chapters: [{ title: "Ancient India", topics: ["Indus Valley Civilization", "Vedic Age (Early/Later)", "Mahajanapadas & Magadha", "Mauryan Empire", "Post-Mauryan (Gupta Age)", "Harshavardhana", "Sangam Age"] }, { title: "Medieval India", topics: ["Delhi Sultanate (Slave to Lodi)", "Vijayanagar & Bahmani", "Mughal Empire (Admin/Arch)", "Marathas", "Bhakti & Sufi Movements"] }, { title: "Art & Culture", topics: ["Temple Architecture", "Cave Architecture", "Sculpture forms", "Classical Dances", "Paintings (Mural/Miniature)", "UNESCO Sites"] }] },
    { subject: "Geography: Physical (11th NCERT)", chapters: [{ title: "The Earth", topics: ["Origin of Earth", "Interior of the Earth", "Distribution of Oceans & Continents"] }, { title: "Landforms", topics: ["Minerals & Rocks", "Geomorphic Processes (Weathering/Erosion)", "Landforms & Evolution (Fluvial/Glacial/Wind)"] }, { title: "Climate", topics: ["Composition of Atmosphere", "Insolation & Heat Balance", "Pressure & Winds", "Water in Atmosphere", "World Climate (Koppen)"] }, { title: "Water (Oceanography)", topics: ["Ocean Relief", "Temperature & Salinity", "Movements of Ocean Water (Waves/Tides/Currents)"] }, { title: "Life on Earth", topics: ["Biodiversity & Conservation", "Biogeochemical Cycles"] }] },
    { subject: "Geography: India Phy (11th NCERT)", chapters: [{ title: "Physiography", topics: ["Location & Space", "Structure & Relief (Himalayas/Plains/Plateau)", "Drainage Systems (Himalayan vs Peninsular)"] }, { title: "Climate & Soil", topics: ["Monsoon Mechanism", "Seasons", "Natural Vegetation (Forests)", "Soils of India (Types & Conservation)"] }, { title: "Hazards", topics: ["Natural Hazards", "Disaster Management in India"] }] },
    { subject: "Geography: Human (12th NCERT)", chapters: [{ title: "People", topics: ["Population Distribution & Density", "Population Growth", "Population Composition", "Human Development"] }, { title: "Activities", topics: ["Primary Activities (Agri/Mining)", "Secondary Activities (Manufacturing)", "Tertiary & Quaternary Activities"] }, { title: "Transport & Trade", topics: ["Transport & Communication", "International Trade"] }, { title: "Settlements", topics: ["Human Settlements (Rural vs Urban)", "Urbanization Problems"] }] },
    { subject: "Geography: India People (12th NCERT)", chapters: [{ title: "People & Economy", topics: ["Migration (Types/Causes)", "Human Development in India", "Census Data"] }, { title: "Resources", topics: ["Land Resources & Agriculture", "Water Resources", "Mineral & Energy Resources", "Manufacturing Industries"] }, { title: "Planning", topics: ["Planning in India", "Sustainable Development"] }, { title: "Transport", topics: ["Transport Networks (Road/Rail/Water/Air)", "Communication Networks"] }] },
    { subject: "Geography: Mapping", chapters: [{ title: "India Mapping", topics: ["Mountains & Peaks", "Rivers & Tributaries", "National Parks & Tiger Reserves", "Ramsar Sites", "Ports & Industrial Corridors", "Islands"] }, { title: "World Mapping", topics: ["Major Straits & Canals", "Seas & Lakes", "Grasslands & Deserts", "Mineral Belts", "Conflict Zones (Current Affairs)"] }] },
    { subject: "Polity: Laxmikanth", chapters: [{ title: "Const. Framework", topics: ["Historical Background", "Making of Constitution", "Salient Features", "Preamble", "Union & its Territory", "Citizenship", "Fundamental Rights", "DPSP", "Fundamental Duties", "Amendment of Constitution", "Basic Structure"] }, { title: "System of Govt", topics: ["Parliamentary System", "Federal System", "Centre-State Relations", "Inter-State Relations", "Emergency Provisions"] }, { title: "Central Govt", topics: ["President", "Vice-President", "Prime Minister", "Central Council of Ministers", "Cabinet Committees", "Parliament", "Parliamentary Committees", "Supreme Court"] }, { title: "State Govt", topics: ["Governor", "Chief Minister", "State Council of Ministers", "State Legislature", "High Court", "Subordinate Courts"] }, { title: "Local Govt", topics: ["Panchayati Raj", "Municipalities"] }, { title: "Const. Bodies", topics: ["Election Commission", "UPSC", "SPSC", "Finance Commission", "GST Council", "NCSC", "NCST", "NCBC", "CAG", "Attorney General", "Advocate General"] }, { title: "Non-Const. Bodies", topics: ["NITI Aayog", "NHRC", "SHRC", "CIC", "SIC", "CVC", "CBI", "Lokpal & Lokayuktas"] }] },
    { subject: "Economy: Microeconomics (Class 12)", chapters: [{ title: "Introduction", topics: ["Central Problems of Economy", "PPC (Production Possibility Curve)", "Opportunity Cost"] }, { title: "Consumer Behaviour", topics: ["Utility Analysis", "Indifference Curve", "Demand & Elasticity of Demand"] }, { title: "Producer Behaviour", topics: ["Production Function", "Cost & Revenue Curves", "Supply & Elasticity"] }, { title: "Market Forms", topics: ["Perfect Competition", "Monopoly & Oligopoly", "Price Determination"] }] },
    { subject: "Economy: Macroeconomics (Class 12)", chapters: [{ title: "National Income", topics: ["Circular Flow", "GDP, GNP, NNP", "Real vs Nominal GDP", "GDP Deflator"] }, { title: "Money & Banking", topics: ["Money Supply", "Credit Creation", "RBI Functions", "Monetary Policy Tools (Repo/CRR/SLR)"] }, { title: "Income & Employment", topics: ["Aggregate Demand/Supply", "Propensity to Consume/Save", "Multiplier", "Deficient vs Excess Demand"] }, { title: "Govt Budget", topics: ["Revenue vs Capital", "Deficits (Fiscal/Revenue/Primary)", "Budget Objectives"] }, { title: "BoP & Forex", topics: ["Balance of Payments Components", "Foreign Exchange Rate Determination"] }] },
    { subject: "Economy: Indian Eco Dev (Class 11)", chapters: [{ title: "1947-1990", topics: ["Eve of Independence", "Five Year Plans", "Agriculture & Land Reforms", "IPR 1956"] }, { title: "1991 Reforms", topics: ["Liberalisation, Privatisation, Globalisation (LPG)", "GST & Demonetization"] }, { title: "Current Challenges", topics: ["Poverty", "Human Capital Formation", "Rural Development", "Employment Growth", "Infrastructure", "Sustainable Development"] }, { title: "Comparisons", topics: ["India vs China vs Pakistan Development Experience"] }] },
    { subject: "Economy: Statistics (Class 11)", chapters: [{ title: "Data Basics", topics: ["Collection of Data", "Organization of Data", "Presentation (Tables/Diagrams)"] }, { title: "Statistical Tools", topics: ["Measures of Central Tendency (Mean/Median/Mode)", "Correlation", "Index Numbers (WPI/CPI Basics)"] }] },
    { subject: "Current Affairs & Reports", chapters: [{ title: "Monthly Tracking", topics: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] }, { title: "Major Reports", topics: ["HDR", "Global Hunger Index", "Press Freedom Index", "Gender Gap Report", "ISFR (Forest Report)", "Budget Summary", "Economic Survey"] }, { title: "Schemes", topics: ["Flagship Schemes (Central)", "State Specific Schemes", "New Launches"] }] },
    { subject: "GS IV: Ethics", chapters: [{ title: "Theory", topics: ["Human Interface", "Attitude", "Emotional Intelligence", "Moral Thinkers"] }, { title: "Governance", topics: ["Public Service Values", "Probity", "RTI", "Citizen Charters", "Corruption"] }, { title: "Applied", topics: ["Case Studies"] }] },
    { subject: "Prelims: CSAT", chapters: [{ title: "Quant", topics: ["Number System", "Percentage", "Profit/Loss", "Average", "Ratio", "Time & Work", "Speed Dist"] }, { title: "Reasoning", topics: ["Coding", "Series", "Blood Relations", "Direction", "Syllogism", "Puzzles"] }, { title: "Reading", topics: ["Reading Comprehension", "Interpersonal Skills"] }] }
];

const CONSTITUTION_DATA = [
    {a:"1", t:"Name and territory of the Union"}, {a:"3", t:"Formation of new States and alteration of areas"}, {a:"13", t:"Laws inconsistent with Fundamental Rights"}, {a:"14", t:"Equality before law"}, {a:"15", t:"Prohibition of discrimination"}, {a:"16", t:"Equality of opportunity in public employment"}, {a:"17", t:"Abolition of Untouchability"}, {a:"19", t:"Freedom of speech"}, {a:"21", t:"Protection of life and personal liberty"}, {a:"21A", t:"Right to Education"}, {a:"32", t:"Remedies for enforcement of rights"}, {a:"40", t:"Organisation of village panchayats"}, {a:"44", t:"Uniform civil code"}, {a:"51A", t:"Fundamental Duties"}, {a:"52", t:"The President of India"}, {a:"72", t:"Pardoning powers of President"}, {a:"110", t:"Money Bills"}, {a:"112", t:"Annual Financial Statement (Budget)"}, {a:"280", t:"Finance Commission"}, {a:"352", t:"National Emergency"}, {a:"356", t:"President's Rule"}, {a:"360", t:"Financial Emergency"}
];

// ==========================================
// 3. STATE & INIT
// ==========================================
let appData = {
    goals: { daily: [], weekly: [], monthly: [], halfyearly: [] },
    syllabus: {}, library: [], focusLog: {}, subjectLog: {}, plans: {}, tests: [],
    news: { date: "", hindu: false, edit: false, mag: false },
    manifesto: "", degreeMode: false, deadTime: 0, waterCount: 0, pensUsed: 0,
    btech: { subjects: [], assignments: [] }, darkMode: false,
    timer: { mode: 'timer', endTime: null, startTime: null, active: false, totalDuration: 25, subject: null, chapter: null, remaining: 0, accumulated: 0 },
    flashcards: [], mainsDrafts: [], retros: [], history: [], xp: 0,
    mapPins: [],
    treasury: { budget: 0, expenses: [] },
    sleep: [],
    bio: { weight: 0, workouts: { run: false, gym: false, yoga: false } },
    mood: [],
    gratitude: [],
    watchlist: [],
    bucket: [],
    chef: {},
    dopamine: [],
    inventory: [],
    events: [],
    // --- ADD THESE NEW LINES ---
    retroWell: "",     // For Retro: What went well
    retroBad: "",      // For Retro: What went bad
    retroStrat: "",    // For Retro: Strategy
    tempMainsBody: "", // For Mains: Draft answer
    // ---------------------------
    thoughts: ""
};

function getTodayDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

window.onload = function() {
    // Populate Dropdown immediately
    const subjSelect = document.getElementById('preTimerSubject');
    if(subjSelect) {
        subjSelect.innerHTML = '<option value="" disabled selected>-- Select Subject --</option>';
        UPSC_SYLLABUS.forEach(s => {
            subjSelect.innerHTML += `<option value="${s.subject}">${s.subject}</option>`;
        });
    }

    if (!isOffline && auth) {
        auth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                document.getElementById('btnLogin').style.display = 'none';
                document.getElementById('userProfile').style.display = 'block';
                document.getElementById('userName').innerText = user.displayName;
                db.collection('users').doc(user.uid).onSnapshot((doc) => {
                    if (doc.exists) {
                        appData = { ...appData, ...doc.data() };
                        initializeUI();
                    } else {
                        saveData(); 
                    }
                });
            } else {
                document.getElementById('btnLogin').style.display = 'block';
                document.getElementById('userProfile').style.display = 'none';
                loadLocalData();
            }
        });
    } else {
        document.getElementById('btnLogin').style.display = 'block'; 
        document.getElementById('userProfile').style.display = 'none';
        loadLocalData();
    }
};

function loadLocalData() {
    const saved = localStorage.getItem('upsc_app_data_v19');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appData = { ...appData, ...parsed };
        } catch(e) { console.error("Data Load Error", e); }
    }
    initializeUI();
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const uploadedData = JSON.parse(e.target.result);
            appData = {
                ...appData, 
                ...uploadedData,
                timer: { ...appData.timer, ...(uploadedData.timer || {}) },
                history: uploadedData.history || [],
                mapPins: uploadedData.mapPins || []
            };
            saveData();
            alert("Restored Successfully!");
            location.reload();
        } catch (err) {
            alert("Error restoring file: " + err.message);
        }
    };
    reader.readAsText(file);
}

function initializeUI() {
    // 1. Theme Check
    if(appData.darkMode) document.body.classList.add('dark-mode');
    
    // 2. Restore XP if missing
    if (!appData.xp || appData.xp === 0) {
        let totalMins = 0;
        if(appData.focusLog) {
            totalMins = Object.values(appData.focusLog).reduce((sum, m) => sum + m, 0);
        }
        appData.xp = totalMins * 10;
    }

    // 3. Load all modules safely
    try { checkNewsReset(); } catch(e) {}
    try { renderEvents(); } catch(e) {}
  try { renderMood(); } catch(e) {}
try { renderNotToDo(); } catch(e) {}
    try { renderIdentity(); } catch(e) {}
    try { renderSyllabus(); } catch(e) {}
    try { renderGoals(); } catch(e) {}
    try { renderYearCompass(); } catch(e) {}
    try { renderLibrary(); } catch(e) {}
    try { updateDashboard(); } catch(e) {}
    try { renderCalendar(); } catch(e) {}
    try { renderCharts(); } catch(e) {}
    try { renderSyllabusChart(); } catch(e) {}
    try { renderHeatmap(); } catch(e) {}
    try { renderMockTests(); } catch(e) {}
    try { renderBtech(); } catch(e) {}
    try { renderFlashcard(); } catch(e) {}
    try { renderHistory(); } catch(e) {}
    try { renderTreasury(); } catch(e) {}
    try { renderBio(); } catch(e) {}
    try { renderMonk(); } catch(e) {}
    try { renderWatchlist(); } catch(e) {}
    try { renderBucket(); } catch(e) {}
    try { renderChef(); } catch(e) {}
    try { renderDopamine(); } catch(e) {}
    try { renderInventory(); } catch(e) {}
    try { renderEvents(); } catch(e) {}
  try { renderDojo(); } catch(e) {}
try { renderTribe(); } catch(e) {}
  try { renderLedger(); } catch(e) {}
    try { setupAutosave(); } catch(e) {} // Starts the "Save as you type" listener
    try { document.getElementById('thoughtArea').value = appData.thoughts || ""; } catch(e) {}

    // 4. Restore Subject & Chapter Selection (THE FIX for dropdowns)
    // We use a small delay (50ms) to ensure the dropdown list is built before we select an item
    setTimeout(() => {
        if(appData.timer && appData.timer.subject) {
            const subjSelect = document.getElementById('preTimerSubject');
            const chapSelect = document.getElementById('preTimerChapter');
            
            if(subjSelect) {
                subjSelect.value = appData.timer.subject;
                
                // Manually trigger the "populate chapters" function
                populateTimerChapters(); 
                
                // Now set the chapter if we have one
                if(appData.timer.chapter && chapSelect) {
                    chapSelect.value = appData.timer.chapter;
                }
            }
        }
    }, 50);

    // 5. Handle Timer State (THE FIX for 25:00 display)
    if (appData.timer.active) {
        const now = Date.now();
        if (appData.timer.mode === 'timer') {
            if (appData.timer.endTime && now >= appData.timer.endTime) {
                // Timer finished while app was closed
                completeSession();
            } else {
                // Timer is still running -> Resume & Update Visuals Immediately
                runTimerInterval();
                tick(); // <--- This forces "25:00" to change to the real time instantly
            }
        } else {
            // Stopwatch -> Resume & Update Visuals
            runTimerInterval();
            tick(); // <--- This forces the stopwatch to show the correct time instantly
        }
    }

    // 6. Final UI Polish
    if(document.getElementById('degreeToggle')) {
        document.getElementById('degreeToggle').checked = appData.degreeMode;
    }
    toggleDegreeMode();
    renderHydration();
    
    if(document.getElementById('deadTimeDisplay')) document.getElementById('deadTimeDisplay').innerText = `${appData.deadTime}m`;
    if(document.getElementById('penDisplay')) document.getElementById('penDisplay').innerText = appData.pensUsed;
    
    updateRank();
    updateTimerVisuals(); // Sets the button to "Pause" or "Resume" correctly

    // 7. Network Listeners (Auto-upload when internet returns)
    window.addEventListener('online', () => { console.log("Back Online"); saveData(); });
    setInterval(checkSunset, 60000);
    checkSunset();
}
function saveData() {
    // 1. Instant Local Save (Backup)
    localStorage.setItem('upsc_app_data_v19', JSON.stringify(appData));

    // 2. Cloud Save (Firebase)
    const statusEl = document.getElementById('saveStatus');
    
    if (typeof currentUser !== 'undefined' && currentUser && db) {
        // We use .set() with merge:true so we don't accidentally delete fields
        db.collection('users').doc(currentUser.uid).set(appData, { merge: true })
            .then(() => {
                console.log("Cloud Save Success");
                if (statusEl) {
                    statusEl.innerText = "☁️ Saved";
                    statusEl.style.color = "#10b981"; // Green
                    setTimeout(() => { statusEl.innerText = ""; }, 3000);
                }
            })
            .catch(e => {
                console.error("Cloud Save Error:", e);
                if (statusEl) {
                    statusEl.innerText = "⚠️ Offline (Saved Locally)";
                    statusEl.style.color = "#ef4444"; // Red
                }
            });
    } else {
        // Offline Mode
        if (statusEl) {
            statusEl.innerText = "💾 Saved (Offline)";
            statusEl.style.color = "gray";
            setTimeout(() => { statusEl.innerText = ""; }, 3000);
        }
    }
}
function loginGoogle() {
    if(isOffline) { alert("Please add your Firebase Keys in script.js first!"); return; }
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(e => alert(e.message));
}
function logoutGoogle() {
    if(auth) auth.signOut().then(() => location.reload());
}

// ==========================================
// 4. NAVIGATION & CORE UI
// ==========================================
function showSection(id) {
    document.querySelectorAll('.section').forEach(e => e.classList.remove('active'));
    const el = document.getElementById(id);
    if(el) {
        el.classList.add('active');
      if(id === 'dojo') renderDojo();
       if(id === 'yearCompass') renderYearCompass();
      if(id === 'events') renderEvents();
        if(id === 'tribe') renderTribe();
       if(id === 'mood') renderMood();
if(id === 'nottodo') renderNotToDo();
        if(id === 'ledger') renderLedger();
        if(id === 'identity') renderIdentity();
        if(id==='analytics') { renderCharts(); renderHistory(); renderSyllabusChart(); }
        if(id==='tests') renderMockTests(); 
        if(id==='retro') renderRetroStats(); 
        if(id==='newsroom') refreshNews();
        if(id==='warroom') { setTimeout(() => { if(map) map.invalidateSize(); else initMap(); }, 300); }
        if(id==='whiteboard') { setTimeout(() => initWhiteboard(), 200); }
        if(id==='treasury') renderTreasury();
        if(id==='bio') renderBio();
        if(id==='monk') renderMonk();
        if(id==='watchlist') renderWatchlist();
        if(id==='bucket') renderBucket();
        if(id==='chef') renderChef();
        if(id==='dopamine') renderDopamine();
        if(id==='inventory') renderInventory();
        if(id==='events') renderEvents();
    }
}

function openAppsModal() { document.getElementById('appsModal').style.display = 'flex'; }
function selectApp(id) { document.getElementById('appsModal').style.display = 'none'; showSection(id); }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ==========================================
// 5. TIMER & STOPWATCH LOGIC (FIXED)
// ==========================================
let timerInterval;

function populateTimerChapters() {
    const subject = document.getElementById('preTimerSubject').value;
    const chapSelect = document.getElementById('preTimerChapter');
    chapSelect.innerHTML = '<option value="" disabled selected>-- Select Chapter --</option>';
    
    if(subject) {
        const found = UPSC_SYLLABUS.find(s => s.subject === subject);
        if(found) {
            chapSelect.style.display = 'block'; 
            found.chapters.forEach(c => {
                chapSelect.innerHTML += `<option value="${c.title}" style="font-weight:bold; background:#e5e7eb; color:black;">📂 ${c.title}</option>`;
                c.topics.forEach(t => { chapSelect.innerHTML += `<option value="${t}">   • ${t}</option>`; });
            });
        }
    } else {
        chapSelect.style.display = 'none';
    }
}

function updateTimerVisuals() {
    const btnTimer = document.getElementById('mode-timer');
    const btnStopwatch = document.getElementById('mode-stopwatch');
    const settings = document.getElementById('timerSettingsArea');
    const display = document.getElementById('timer');
    const startBtn = document.getElementById('btnStart');

    if (appData.timer.mode === 'stopwatch') {
        btnStopwatch.style.background = 'var(--bg-card)';
        btnStopwatch.style.color = 'var(--primary)';
        btnStopwatch.style.border = '1px solid var(--primary)';
        btnTimer.style.background = 'transparent';
        btnTimer.style.color = 'var(--text-muted)';
        btnTimer.style.border = '1px solid transparent';
        settings.style.display = 'none';
        
        // Restore Stopwatch Display Logic
        let diff = appData.timer.accumulated;
        if(appData.timer.active) diff += (Date.now() - appData.timer.startTime);
        
        if (diff > 0) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            display.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        } else {
            display.innerText = "00:00:00";
        }

    } else {
        btnTimer.style.background = 'var(--bg-card)';
        btnTimer.style.color = 'var(--primary)';
        btnTimer.style.border = '1px solid var(--primary)';
        btnStopwatch.style.background = 'transparent';
        btnStopwatch.style.color = 'var(--text-muted)';
        btnStopwatch.style.border = '1px solid transparent';
        settings.style.display = 'flex';
        
        if (!appData.timer.active && appData.timer.remaining === 0) {
            const mins = document.getElementById('focusTime').value;
            display.innerText = `${mins.toString().padStart(2, '0')}:00`;
        }
    }
    
    if (appData.timer.active) {
        startBtn.innerText = "Pause";
        startBtn.style.background = "#f59e0b";
    } else {
        startBtn.innerText = (appData.timer.remaining > 0 || appData.timer.accumulated > 0) ? "Resume" : "Start";
        startBtn.style.background = (appData.timer.remaining > 0 || appData.timer.accumulated > 0) ? "var(--success)" : "var(--primary)";
    }
}

function switchTimerMode(mode) {
    appData.timer.mode = mode;
    appData.timer.active = false;
    appData.timer.startTime = null;
    appData.timer.endTime = null;
    appData.timer.remaining = 0;
    appData.timer.accumulated = 0;
    if(timerInterval) clearInterval(timerInterval);
    saveData();
    updateTimerVisuals();
}

function startTimer() {
    if (Notification.permission !== "granted") Notification.requestPermission();

    if (appData.timer.active) {
        pauseTimer();
        return;
    }

    if ((appData.timer.remaining > 0 || appData.timer.accumulated > 0) && !appData.timer.active) {
        if(appData.timer.mode === 'timer') {
            appData.timer.endTime = Date.now() + appData.timer.remaining;
        } else {
            appData.timer.startTime = Date.now();
        }
        appData.timer.active = true;
        updateTimerVisuals();
        saveData();
        runTimerInterval();
        return;
    }

    if (appData.timer.mode === 'timer') {
        const mins = parseInt(document.getElementById('focusTime').value);
        appData.timer.totalDuration = mins;
        appData.timer.endTime = Date.now() + (mins * 60 * 1000);
        appData.timer.remaining = 0;
    } else {
        appData.timer.startTime = Date.now();
        appData.timer.accumulated = 0;
    }

    appData.timer.subject = document.getElementById('preTimerSubject').value || "General";
    appData.timer.chapter = document.getElementById('preTimerChapter').value || "";

    appData.timer.active = true;
    updateTimerVisuals();
    saveData();
    runTimerInterval();
}

function pauseTimer() {
    if (!appData.timer.active) return;
    clearInterval(timerInterval); 
    timerInterval = null; 
    
    const now = Date.now();
    if(appData.timer.mode === 'timer') { 
        appData.timer.remaining = appData.timer.endTime - now; 
        if(appData.timer.remaining < 0) appData.timer.remaining = 0; 
    } 
    else { 
        appData.timer.accumulated += (now - appData.timer.startTime); 
        appData.timer.startTime = null; 
    }
    
    appData.timer.active = false;
    document.title = "Paused - UPSC";
    updateTimerVisuals();
    saveData();
}

function finishEarly() {
    let elapsedMinutes = 0;
    if (appData.timer.mode === 'timer') {
        if(appData.timer.active) {
            const totalMs = appData.timer.totalDuration * 60 * 1000;
            const remainingMs = appData.timer.endTime - Date.now();
            elapsedMinutes = Math.floor((totalMs - remainingMs) / 60000);
        } else {
            const totalMs = appData.timer.totalDuration * 60 * 1000;
            elapsedMinutes = Math.floor((totalMs - appData.timer.remaining) / 60000);
        }
    } else {
        let currentTotal = appData.timer.accumulated;
        if(appData.timer.active) { currentTotal += (Date.now() - appData.timer.startTime); }
        elapsedMinutes = Math.floor(currentTotal / 60000);
    }
    
    if(elapsedMinutes < 1) { alert("Session too short to log (< 1 min)."); return; }
    
    const today = getTodayDate();
    const sub = appData.timer.subject || "General";
    appData.focusLog[today] = (appData.focusLog[today]||0) + elapsedMinutes;
    appData.subjectLog[sub] = (appData.subjectLog[sub]||0) + elapsedMinutes;
    
    appData.xp = (appData.xp || 0) + (elapsedMinutes * 10);
    updateRank();
    
    logSession(sub, appData.timer.chapter, elapsedMinutes, appData.timer.mode === 'timer' ? "Timer" : "Stopwatch");
    saveData();
    
    alert(`Logged ${elapsedMinutes} minutes for ${sub}.`);
    resetTimer(); 
    renderCharts();
    updateDashboard();
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    appData.timer.active = false;
    appData.timer.remaining = 0;
    appData.timer.accumulated = 0;
    appData.timer.endTime = null;
    appData.timer.startTime = null;
    saveData();
    document.title = "UPSC Command Center Ultra";
    updateTimerVisuals();
}

function runTimerInterval() {
    if(timerInterval) clearInterval(timerInterval); 
    timerInterval = setInterval(tick, 1000);
    tick(); 
}

function tick() {
    if (!appData.timer.active) return;
    const now = Date.now();
    const display = document.getElementById('timer');
    
    if(appData.timer.mode === 'timer') {
        const distance = appData.timer.endTime - now;
        if (distance < 0) {
            completeSession(); 
        } else {
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);
            display.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            document.title = `${m}:${s} | Focus`;
        }
    } else {
        const diff = (now - appData.timer.startTime) + appData.timer.accumulated;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const timeStr = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        display.innerText = timeStr;
        document.title = `${timeStr} | Stopwatch`;
    }
}

function completeSession() { 
    clearInterval(timerInterval); timerInterval = null;
    try { new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play(); } catch(e){}
    document.title = "Time's Up!";
    resetTimer();
    
    const sub = appData.timer.subject || "General";
    const mins = appData.timer.totalDuration;
    const today = getTodayDate();
    appData.focusLog[today] = (appData.focusLog[today]||0) + mins;
    appData.subjectLog[sub] = (appData.subjectLog[sub]||0) + mins;
    appData.xp = (appData.xp||0) + (mins * 10);
    
    updateRank();
    logSession(sub, appData.timer.chapter, mins, "Timer");
    saveData();
    
    if (Notification.permission === "granted") new Notification("Session Complete!", { body: `Finished: ${sub}` });
    
    document.getElementById('endSessionTopic').innerText = `Finished: ${sub}`;
    document.getElementById('subjectModal').style.display = 'flex'; 
    renderCharts();
    updateDashboard();
}

// ==========================================
// 6. MODULES (B.TECH, CHEF, ETC)
// ==========================================

// --- B.TECH (Fixed Missing Reference) ---
function toggleDegreeMode() {
    const toggle = document.getElementById('degreeToggle');
    if(toggle) appData.degreeMode = toggle.checked;
    
    const panel = document.getElementById('btech-panel');
    if (panel) {
        panel.style.display = appData.degreeMode ? 'block' : 'none';
    }
    saveData();
}

function renderBtech() {
    const list = document.getElementById('attendanceList');
    if (!list) return;
    list.innerHTML = '';
    
    if (!appData.btech) appData.btech = { subjects: [], assignments: [] };

    appData.btech.subjects.forEach((sub, i) => {
        const pct = sub.total === 0 ? 0 : Math.round((sub.present / sub.total) * 100);
        const color = pct < 75 ? 'var(--danger)' : 'var(--success)';
        
        list.innerHTML += `
            <div class="goal-item">
                <div style="display:flex; justify-content:space-between; width:100%;">
                    <strong>${sub.name}</strong>
                    <span style="color:${color}; font-weight:bold;">${pct}%</span>
                </div>
                <div style="display:flex; gap:10px; margin-top:5px;">
                    <button onclick="updateAttendance(${i}, 1, 1)" style="font-size:0.7rem; background:#10b981;">P</button>
                    <button onclick="updateAttendance(${i}, 0, 1)" style="font-size:0.7rem; background:#ef4444;">A</button>
                    <span style="font-size:0.8rem; color:gray; align-self:center;">${sub.present}/${sub.total}</span>
                    <button onclick="deleteBtechSubject(${i})" style="margin-left:auto; background:none; color:red;">x</button>
                </div>
            </div>
        `;
    });

    const assignList = document.getElementById('assignmentList');
    if(assignList) {
        assignList.innerHTML = '';
        appData.btech.assignments.forEach((task, i) => {
            assignList.innerHTML += `
                <li class="goal-item">
                    <span>${task}</span>
                    <button onclick="deleteAssignment(${i})" style="color:red; background:none;"><i class="fas fa-trash"></i></button>
                </li>
            `;
        });
    }
}

function addBtechSubject() {
    const name = document.getElementById('btechSubName').value;
    if (name) {
        if (!appData.btech) appData.btech = { subjects: [], assignments: [] };
        appData.btech.subjects.push({ name: name, present: 0, total: 0 });
        document.getElementById('btechSubName').value = '';
        saveData();
        renderBtech();
    }
}

function updateAttendance(index, p, t) {
    if (appData.btech && appData.btech.subjects[index]) {
        appData.btech.subjects[index].present += p;
        appData.btech.subjects[index].total += t;
        saveData();
        renderBtech();
    }
}

function deleteBtechSubject(index) {
    if (appData.btech && appData.btech.subjects[index]) {
        appData.btech.subjects.splice(index, 1);
        saveData();
        renderBtech();
    }
}

function addAssignment() {
    const task = document.getElementById('assignName').value;
    if (task) {
        if (!appData.btech) appData.btech = { subjects: [], assignments: [] };
        appData.btech.assignments.push(task);
        document.getElementById('assignName').value = '';
        saveData();
        renderBtech();
    }
}

function deleteAssignment(index) {
    if (appData.btech && appData.btech.assignments[index]) {
        appData.btech.assignments.splice(index, 1);
        saveData();
        renderBtech();
    }
}

// --- CHEF ---
function renderChef() {
    const grid = document.getElementById('mealGrid');
    if(!grid) return;
    grid.innerHTML = '<div style="font-weight:bold;">Day</div><div style="font-weight:bold;">Lunch</div><div style="font-weight:bold;">Dinner</div>';
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if(!appData.chef) appData.chef = {};
    days.forEach(d => {
        if(!appData.chef[d]) appData.chef[d] = {l: "", d: ""};
        grid.innerHTML += `
            <div style="padding:10px; border-bottom:1px solid #374151;">${d}</div>
            <div><input type="text" class="modal-input" style="margin:0;" value="${appData.chef[d].l}" onchange="saveMeal('${d}', 'l', this.value)"></div>
            <div><input type="text" class="modal-input" style="margin:0;" value="${appData.chef[d].d}" onchange="saveMeal('${d}', 'd', this.value)"></div>
        `;
    });
}
function saveMeal(day, type, val) {
    if(!appData.chef) appData.chef = {};
    if(!appData.chef[day]) appData.chef[day] = {l: "", d: ""};
    appData.chef[day][type] = val;
    saveData();
}

// --- PANIC ---
function triggerPanic() {
    document.getElementById('panicModal').style.display = 'flex';
    const textEl = document.getElementById('breatheInstruction');
    if(textEl) {
        textEl.innerText = "Inhale...";
        if(window.panicInterval) clearInterval(window.panicInterval);
        window.panicInterval = setInterval(() => {
            textEl.innerText = "Inhale...";
            setTimeout(() => {
                if(document.getElementById('panicModal').style.display !== 'none') {
                    textEl.innerText = "Exhale...";
                }
            }, 2000); 
        }, 4000); 
    }
}

// --- ZEN ---
function toggleZenMode() {
    const card = document.getElementById('timerCard');
    card.classList.toggle('fullscreen');
    window.scrollTo(0, 0);
}

// --- REST OF HELPERS (Dopamine, Inventory, etc.) ---
function logDistraction() {
    const act = document.getElementById('distractionInput').value;
    const mins = parseInt(document.getElementById('distractionTime').value);
    if(act && mins) {
        if(!appData.dopamine) appData.dopamine = [];
        appData.dopamine.unshift({ a: act, m: mins, d: getTodayDate() });
        document.getElementById('distractionInput').value = '';
        document.getElementById('distractionTime').value = '';
        saveData();
        renderDopamine();
    }
}
function renderDopamine() {
    if(!appData.dopamine) appData.dopamine = [];
    const today = getTodayDate();
    const todayLogs = appData.dopamine.filter(l => l.d === today);
    const total = todayLogs.reduce((s, i) => s + i.m, 0);
    document.getElementById('totalWasted').innerText = total;
    const list = document.getElementById('distractionList');
    list.innerHTML = '';
    todayLogs.forEach(l => { list.innerHTML += `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #374151; padding:5px;"><span>${l.a}</span><span style="color:var(--danger)">${l.m}m</span></div>`; });
}

function addInventory() {
    const item = document.getElementById('invInput').value;
    if(item) {
        if(!appData.inventory) appData.inventory = [];
        appData.inventory.push({ n: item, c: false });
        document.getElementById('invInput').value = '';
        saveData();
        renderInventory();
    }
}
function toggleInventory(i) {
    appData.inventory[i].c = !appData.inventory[i].c;
    saveData(); 
    renderInventory();
}
function deleteInventory(i) {
    appData.inventory.splice(i, 1);
    saveData();
    renderInventory();
}
function renderInventory() {
    const list = document.getElementById('invList');
    if(!appData.inventory) appData.inventory = [];
    list.innerHTML = '';
    appData.inventory.forEach((item, i) => {
        const style = item.c ? 'opacity:0.5; text-decoration:line-through;' : '';
        const check = item.c ? 'checked' : '';
        list.innerHTML += `<div class="inv-item" style="${style}"><label style="display:flex; align-items:center; gap:10px; cursor:pointer;"><input type="checkbox" ${check} onchange="toggleInventory(${i})"><span>${item.n}</span></label><button onclick="deleteInventory(${i})" style="color:red; background:none; padding:0;">x</button></div>`;
    });
}

// 5.4 EVENT HORIZON
function addEvent() {
    const t = document.getElementById('eventTitle').value;
    const d = document.getElementById('eventDate').value;
    if(t && d) {
        if(!appData.events) appData.events = [];
        appData.events.push({ t: t, d: d });
        document.getElementById('eventTitle').value = '';
        saveData();
        renderEvents();
    }
}
function renderEvents() {
    const list = document.getElementById('eventList');
    if(!appData.events) appData.events = [];
    list.innerHTML = '';
    appData.events.sort((a,b) => new Date(a.d) - new Date(b.d));
    appData.events.forEach((ev, i) => {
        const diff = new Date(ev.d) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if(days >= 0) {
            list.innerHTML += `<div class="count-card"><div style="display:flex; justify-content:space-between;"><span style="font-size:1.1rem; font-weight:bold;">${ev.t}</span><span class="count-days">${days} Days</span></div><small style="color:gray;">${ev.d}</small><button onclick="deleteEvent(${i})" style="float:right; color:red; background:none; padding:0;">Delete</button></div>`;
        }
    });
}
function deleteEvent(i) { appData.events.splice(i, 1); saveData(); renderEvents(); }

// 5.5 THOUGHT PAD
function saveThoughts() {
    appData.thoughts = document.getElementById('thoughtArea').value;
    saveData();
}

// --- LIFE OS (PREVIOUS) ---
function setBudget() { const b = prompt("Monthly Budget (₹):", appData.treasury.budget); if(b) { appData.treasury.budget = parseInt(b); saveData(); renderTreasury(); } }
function addExpense() {
    const amt = document.getElementById('expenseAmount').value; const desc = document.getElementById('expenseDesc').value;
    if(amt && desc) { if(!appData.treasury) appData.treasury={budget:0, expenses:[]}; appData.treasury.expenses.unshift({amt:parseInt(amt), desc:desc}); document.getElementById('expenseAmount').value=''; document.getElementById('expenseDesc').value=''; saveData(); renderTreasury(); }
}
function renderTreasury() {
    if(!appData.treasury) appData.treasury={budget:0, expenses:[]};
    const total = appData.treasury.expenses.reduce((s,i)=>s+i.amt,0);
    const pct = appData.treasury.budget>0?(total/appData.treasury.budget)*100:0;
    document.getElementById('budgetDisplay').innerText = appData.treasury.budget;
    document.getElementById('budgetBar').style.width = Math.min(pct,100)+'%';
    const list = document.getElementById('expenseList'); list.innerHTML='';
    appData.treasury.expenses.forEach(e=>{ list.innerHTML+=`<div class="expense-item"><span>${e.desc}</span><span style="color:var(--danger)">-₹${e.amt}</span></div>`; });
}

function logSleep() { const h=document.getElementById('sleepHours').value; if(h){ if(!appData.sleep)appData.sleep=[]; appData.sleep.unshift({date:getTodayDate(), hrs:parseFloat(h)}); saveData(); renderBio(); } }
function saveBio() { if(!appData.bio)appData.bio={}; appData.bio.weight=document.getElementById('weightInput').value; saveData(); }
function renderBio() {
    if(!appData.sleep) appData.sleep=[];
    const total = appData.sleep.reduce((s,i)=>s+i.hrs,0);
    const avg = appData.sleep.length ? (total/appData.sleep.length).toFixed(1) : 0;
    document.getElementById('avgSleep').innerText = avg + "h avg";
    if(appData.bio) document.getElementById('weightInput').value = appData.bio.weight||'';
}

function logMood(m) { document.getElementById('moodStatus').innerText = `Mood: ${m}`; }
function saveGratitude() { const t=document.getElementById('gratitudeText').value; if(t){ if(!appData.gratitude)appData.gratitude=[]; appData.gratitude.unshift({t:t}); saveData(); renderMonk(); } }
function renderMonk() { const l=document.getElementById('gratitudeList'); if(!appData.gratitude)return; l.innerHTML=''; appData.gratitude.slice(0,3).forEach(g=>{ l.innerHTML+=`<div>${g.t}</div>`; }); }

function addWatchItem() { 
    const t = document.getElementById('watchTitle').value; 
    const type = document.getElementById('watchType').value; // Get the type (Movie/Book/Football)
    
    if(t) { 
        if(!appData.watchlist) appData.watchlist = []; 
        // We now save the 'type' along with the title
        appData.watchlist.push({t: t, type: type, watched: false}); 
        
        document.getElementById('watchTitle').value = ''; // Clear input
        saveData(); 
        renderWatchlist(); 
    } 
}
function renderWatchlist() { 
    const d = document.getElementById('watchListContainer'); 
    if(!appData.watchlist) return; 
    d.innerHTML = ''; 
    
    appData.watchlist.forEach((w,i) => { 
        const style = w.watched ? 'opacity:0.5; text-decoration:line-through;' : '';
        
        // Choose the right icon based on the saved type
        let icon = 'fa-film'; // Default to Movie
        if (w.type === 'Book') icon = 'fa-book';
        if (w.type === 'Football') icon = 'fa-futbol'; // Soccer Ball Icon
        
        d.innerHTML += `
            <div class="watch-item" style="${style}; display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas ${icon}" style="color:var(--primary); width:20px; text-align:center;"></i>
                    <strong>${w.t}</strong>
                </div>
                <input type="checkbox" ${w.watched?'checked':''} onchange="toggleWatch(${i})">
            </div>
        `; 
    }); 
}

function addBucketItem() { const t=document.getElementById('bucketItem').value; if(t){ if(!appData.bucket)appData.bucket=[]; appData.bucket.push({t:t, done:false}); saveData(); renderBucket(); } }
function toggleBucket(i) { appData.bucket[i].done = !appData.bucket[i].done; saveData(); renderBucket(); }
function renderBucket() { 
    const l=document.getElementById('bucketListContainer'); if(!appData.bucket)return; l.innerHTML=''; 
    appData.bucket.forEach((b,i)=>{ 
        const cls = b.done ? 'checked' : '';
        l.innerHTML+=`<li class="bucket-item ${cls}"><span>${b.t}</span><input type="checkbox" ${b.done?'checked':''} onchange="toggleBucket(${i})"></li>`; 
    }); 
}

// --- NEWS ---
let currentNewsSource = 'hindu';
function refreshNews() { loadNewsSource(currentNewsSource); }
function loadNewsSource(s) {
    currentNewsSource = s;
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    const tabs = document.querySelectorAll('#newsroom .tab');
    if(s === 'hindu') tabs[0].classList.add('active');
    if(s === 'express') tabs[1].classList.add('active');
    if(s === 'pib') tabs[2].classList.add('active');

    const container = document.getElementById('newsContainer');
    container.innerHTML = '<div style="text-align:center; grid-column:span 3; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Fetching Headlines...</div>';

    // FALLBACK IF API FAILS
    const manualLinks = `
        <div style="text-align:center; grid-column: span 3; color: #9ca3af;">
            <p>Feed unavailable (API Limit). Use direct links:</p>
            <div style="display:flex; gap:10px; justify-content:center;">
                <a href="https://www.thehindu.com/" target="_blank" style="color:var(--primary); text-decoration:none; border:1px solid var(--primary); padding:5px 10px; border-radius:5px;">The Hindu</a>
                <a href="https://indianexpress.com/section/explained/" target="_blank" style="color:var(--primary); text-decoration:none; border:1px solid var(--primary); padding:5px 10px; border-radius:5px;">Indian Express</a>
                <a href="https://pib.gov.in/" target="_blank" style="color:var(--primary); text-decoration:none; border:1px solid var(--primary); padding:5px 10px; border-radius:5px;">PIB</a>
            </div>
        </div>
    `;

    let rssUrl = "";
    if(s === 'hindu') rssUrl = "https://www.thehindu.com/news/national/feeder/default.rss";
    if(s === 'express') rssUrl = "https://indianexpress.com/section/explained/feed/";
    if(s === 'pib') rssUrl = "https://news.google.com/rss/search?q=PIB+India&hl=en-IN&gl=IN&ceid=IN:en";

    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`)
    .then(r=>r.json())
    .then(d=>{
        if(d.status === 'ok') {
            renderNews(d.items);
        } else {
            container.innerHTML = manualLinks;
        }
    })
    .catch(e => {
        container.innerHTML = manualLinks;
    });
}

function renderNews(items) {
    const container = document.getElementById('newsContainer');
    container.innerHTML = '';
    items.slice(0, 9).forEach(item => {
        const cleanDesc = item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '';
        const date = new Date(item.pubDate).toLocaleDateString();
        container.innerHTML += `
            <div class="news-card">
                <span class="news-source">${currentNewsSource.toUpperCase()}</span>
                <span class="news-date">${date}</span>
                <a href="${item.link}" target="_blank" class="news-link">
                    <h3 class="news-title">${item.title}</h3>
                </a>
                <p style="font-size:0.8rem; color:#9ca3af; margin-bottom:0;">${cleanDesc}</p>
            </div>
        `;
    });
}

// --- WAR ROOM ---
let map;
let mapMarkers = [];

function initMap() {
    if(map) return;
    map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    map.on('click', e=>{
        const n=prompt("Name:"); if(n){
            const p={lat:e.latlng.lat, lng:e.latlng.lng, name:n};
            appData.mapPins.push(p); saveData(); addPinToMap(p); renderPinList();
        }
    });
    if(appData.mapPins) { appData.mapPins.forEach(p=>addPinToMap(p)); renderPinList(); }
}
function addPinToMap(p) { const m = L.marker([p.lat,p.lng]).addTo(map).bindPopup(p.name); mapMarkers.push(m); }
function renderPinList() { 
    const l=document.getElementById('pinList'); l.innerHTML=''; 
    if(appData.mapPins) appData.mapPins.forEach((p,i)=>{ l.innerHTML+=`<div class="pin-item" onclick="panToPin(${p.lat},${p.lng})">${p.name} <button onclick="deletePin(event,${i})" style="color:red;float:right;">x</button></div>`; }); 
}
function panToPin(lat,lng){ map.flyTo([lat,lng],8); }
function deletePin(e,i) { 
    e.stopPropagation(); 
    appData.mapPins.splice(i,1); 
    saveData(); 
    mapMarkers.forEach(m => map.removeLayer(m));
    mapMarkers = [];
    appData.mapPins.forEach(p=>addPinToMap(p)); 
    renderPinList(); 
}

// --- WHITEBOARD (SLIDES SYSTEM) ---
let canvas, ctx, painting = false;
let currentSlideIndex = 0;

function initWhiteboard() {
    canvas = document.getElementById('drawingCanvas');
    ctx = canvas.getContext('2d');
    
    // Set size to match container
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    // Default Styles
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fff'; // Default to white
    
    // Event Listeners
    canvas.addEventListener('mousedown', startP);
    canvas.addEventListener('mouseup', endP);
    canvas.addEventListener('mousemove', drawP);
    
    // Touch support (for mobile/tablet)
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startP(e.touches[0]); });
    canvas.addEventListener('touchend', endP);
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); drawP(e.touches[0]); });

    document.getElementById('brushColor').addEventListener('input', e => ctx.strokeStyle = e.target.value);

    // Initialize Slides Data
    if (!appData.slides || appData.slides.length === 0) {
        appData.slides = [""]; // Start with 1 empty slide
    }
    
    loadSlide(0); // Load the first slide
}

// Drawing Functions
function startP(e) { painting = true; drawP(e); }
function endP() { painting = false; ctx.beginPath(); }
function drawP(e) {
    if (!painting) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Slide Management Functions
function updateSlideUI() {
    document.getElementById('slideCounter').innerText = `${currentSlideIndex + 1} / ${appData.slides.length}`;
}

function saveCurrentSlide() {
    // Save current canvas pixels to the array
    appData.slides[currentSlideIndex] = canvas.toDataURL();
    saveData();
    
    // Visual feedback
    const btn = document.querySelector("button[onclick='saveCurrentSlide()']");
    const oldText = btn.innerText;
    btn.innerText = "Saved!";
    setTimeout(() => btn.innerText = oldText, 1000);
}

function loadSlide(index) {
    // 1. Validate index
    if (index < 0) index = 0;
    if (index >= appData.slides.length) index = appData.slides.length - 1;
    currentSlideIndex = index;

    // 2. Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Load Image (if exists)
    const data = appData.slides[currentSlideIndex];
    if (data && data.length > 10) { // Check if it's a real image string
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
        };
        img.src = data;
    }
    
    updateSlideUI();
}

function newSlide() {
    saveCurrentSlide(); // Auto-save current work first
    appData.slides.push(""); // Add new empty slot
    loadSlide(appData.slides.length - 1); // Go to it
    saveData();
}

function changeSlide(direction) {
    saveCurrentSlide(); // Auto-save before leaving
    let newIndex = currentSlideIndex + direction;
    
    // Bounds check
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= appData.slides.length) newIndex = appData.slides.length - 1;
    
    loadSlide(newIndex);
}

function deleteSlide() {
    if (confirm("Delete this slide?")) {
        appData.slides.splice(currentSlideIndex, 1);
        
        // Never allow 0 slides
        if (appData.slides.length === 0) appData.slides.push("");
        
        // Adjust index if we deleted the last one
        if (currentSlideIndex >= appData.slides.length) {
            currentSlideIndex = appData.slides.length - 1;
        }
        
        saveData();
        loadSlide(currentSlideIndex);
    }
}

function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
function downloadCanvas() { const l = document.createElement('a'); l.download = `slide_${currentSlideIndex+1}.png`; l.href = canvas.toDataURL(); l.click(); }

// --- CONSTITUTION ---
function searchConstitution() {
    const q=document.getElementById('constSearch').value.toLowerCase(); const d=document.getElementById('constResults'); d.innerHTML='';
    if(!q)return;
    const matches=CONSTITUTION_DATA.filter(c=>c.a.toLowerCase().includes(q)||c.t.toLowerCase().includes(q));
    matches.forEach(m=>{ d.innerHTML+=`<div class="const-result-item"><strong>Article ${m.a}</strong>: ${m.t}</div>`; });
}

// ==========================================
// 6. RENDER & UTILS (FULL LOGIC)
// ==========================================
function logSession(subject, chapter, duration, mode) {
    const session = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        subject: subject,
        chapter: chapter || "General",
        duration: duration,
        mode: mode
    };
    appData.history.unshift(session);
    if(appData.history.length > 500) appData.history.pop();
    renderHistory();
}

function renderHistory() {
    const tbody = document.getElementById('historyTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    if(appData.history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:10px; color:gray;">No history yet.</td></tr>';
        return;
    }
    appData.history.forEach(s => {
        const badgeColor = s.mode.includes('Timer') ? '#dbeafe' : '#fef3c7';
        tbody.innerHTML += `
            <tr style="border-bottom:1px solid var(--border);">
                <td style="padding:10px;">${s.date} <small style="color:gray;">${s.time}</small></td>
                <td style="padding:10px;">${s.subject}</td>
                <td style="padding:10px;"><small>${s.chapter}</small></td>
                <td style="padding:10px;"><strong>${s.duration}m</strong></td>
                <td style="padding:10px;"><span style="font-size:0.8rem; background:${badgeColor}; color:#000000; padding:2px 6px; border-radius:4px; font-weight:bold;">${s.mode}</span></td>
            </tr>
        `;
    });
}

function clearHistory() {
    if(confirm("Clear all session history?")) {
        appData.history = [];
        saveData();
        renderHistory();
    }
}

function renderSyllabusChart() {
    const ctx = document.getElementById('syllabusChart'); if(!ctx) return;
    if(window.syllChart) window.syllChart.destroy();
    const labels = []; const data = [];
    UPSC_SYLLABUS.forEach(sub => {
        let total = 0, done = 0;
        sub.chapters.forEach(chap => {
            chap.topics.forEach(t => {
                total++;
                const key = `${sub.subject}-${chap.title}-${t}`;
                if(appData.syllabus[key] && appData.syllabus[key].status === 3) done++;
            });
        });
        labels.push(sub.subject.split(':')[0]);
        data.push(total === 0 ? 0 : Math.round((done/total)*100));
    });
    const color = appData.darkMode ? '#fff' : '#000';
    window.syllChart = new Chart(ctx, {
        type: 'bar', data: { labels: labels, datasets: [{ label: '% Completed', data: data, backgroundColor: '#10b981' }] },
        options: { indexAxis: 'y', maintainAspectRatio: false, scales: { x: { beginAtZero: true, max: 100, ticks: { color: color } }, y: { ticks: { color: color } } }, plugins: { legend: { display: false } } }
    });
}

function renderSyllabus() {
    const container = document.getElementById('syllabus-container'); 
    container.innerHTML = '';
    
    let html = '<table><thead><tr><th>Topic</th><th width="30">St</th><th width="30">PYQ</th><th width="80">Rev</th><th width="40">Res</th></tr></thead><tbody>';
    
    UPSC_SYLLABUS.forEach((sub, sIdx) => {
        html += `<tr class="subject-header"><td colspan="5">${sub.subject}</td></tr>`;
        
        sub.chapters.forEach((chap, cIdx) => {
            const chapId = `chap-${sIdx}-${cIdx}`;
            
            // --- THE FIX: Check if this chapter was left open ---
            const isOpen = appData.expanded && appData.expanded.includes(chapId);
            const visibilityClass = isOpen ? 'visible' : ''; 
            // ---------------------------------------------------

            html += `<tr class="chapter-row" onclick="toggleChapter('${chapId}')"><td colspan="5"><i class="fas fa-chevron-right" id="icon-${chapId}"></i> ${chap.title} <small>(${chap.topics.length})</small></td></tr>`;
            
            chap.topics.forEach(top => {
                const key = `${sub.subject}-${chap.title}-${top}`;
                const safeKey = key.replace(/'/g, "\\'"); // Escape quotes
                const data = appData.syllabus[key] || {status:0, pyq:false, rev:0};
                const hasNote = (data.note || data.link) ? 'has-note' : '';
                
                // Add the 'visibilityClass' here so it stays open if needed
                html += `<tr class="topic-row ${chapId} ${visibilityClass}"><td class="topic-name">${top}</td><td><div class="status-btn status-${data.status}" onclick="cycleStatus('${safeKey}', this)"></div></td><td><input type="checkbox" onchange="togglePYQ('${safeKey}')" ${data.pyq?'checked':''}></td><td><div class="rev-box"><button class="rev-btn" onclick="updateRev('${safeKey}', -1, this)">-</button><span>${data.rev||0}</span><button class="rev-btn" onclick="updateRev('${safeKey}', 1, this)">+</button></div></td><td style="text-align:center;"><button class="note-btn ${hasNote}" onclick="openNoteModal('${safeKey}')"><i class="fas fa-sticky-note"></i></button></td></tr>`;
            });
        });
    });
    html += '</tbody></table>'; 
    container.innerHTML = html;
}
function cycleStatus(key, btn) { if(!appData.syllabus[key]) appData.syllabus[key] = {status:0, pyq:false, rev:0}; appData.syllabus[key].status = (appData.syllabus[key].status + 1) % 4; btn.className = `status-btn status-${appData.syllabus[key].status}`; saveData(); updateDashboard(); renderSyllabusChart(); }
function togglePYQ(key) { if(!appData.syllabus[key]) appData.syllabus[key]={status:0, rev:0}; appData.syllabus[key].pyq = !appData.syllabus[key].pyq; saveData(); }
function updateRev(key, change, btn) { if (!appData.syllabus[key]) appData.syllabus[key] = { status: 0, pyq: false, rev: 0 }; let val = (appData.syllabus[key].rev || 0) + change; if(val < 0) val = 0; appData.syllabus[key].rev = val; saveData(); btn.parentElement.querySelector('span').innerText = val; }

function renderCalendar() { 
    const g=document.getElementById('calendarGrid'); const monthYear = document.getElementById('monthYearDisplay'); if(!g) return;
    monthYear.innerText=currentDate.toLocaleString('default',{month:'long',year:'numeric'}); g.innerHTML=''; 
    ['S','M','T','W','T','F','S'].forEach(d=>g.innerHTML+=`<div class="day-header">${d}</div>`); 
    const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const firstDayIndex = new Date(year, month, 1).getDay(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    for(let i=0; i<firstDayIndex; i++) { g.innerHTML += `<div class="day empty"></div>`; }
    const todayStr = getTodayDate();
    if(!appData.plans) appData.plans = {};
    for(let i=1; i<=daysInMonth; i++){ 
        const dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`; 
        const isToday = dStr === todayStr ? 'current-day' : '';
        const p = appData.plans[dStr] ? '<div class="plan-indicator">📌 Plan</div>' : ''; 
        g.innerHTML += `<div class="day ${isToday}" onclick="openPlanModal('${dStr}')"><strong>${i}</strong> ${p}</div>`; 
    } 
}
function changeMonth(d) { currentDate.setMonth(currentDate.getMonth()+d); renderCalendar(); }
function openPlanModal(d) { document.getElementById('modalDate').innerText=d; document.getElementById('planText').value=appData.plans[d]?.plan||''; document.getElementById('journalText').value=appData.plans[d]?.journal||''; document.getElementById('planModal').dataset.date=d; document.getElementById('planModal').style.display='flex'; }
function savePlan() { const d=document.getElementById('planModal').dataset.date; appData.plans[d] = { plan: document.getElementById('planText').value, journal: document.getElementById('journalText').value }; saveData(); closeModal('planModal'); renderCalendar(); }

function renderCharts() {
    const color = appData.darkMode?'#fff':'#000';
    if(!appData.subjectLog) appData.subjectLog = {};
    const activeSubjects = Object.keys(appData.subjectLog).filter(k => appData.subjectLog[k] > 0);
    const subLabels = activeSubjects.length ? activeSubjects : ['No Data'];
    const subData = activeSubjects.length ? activeSubjects.map(k => appData.subjectLog[k]) : [1];
    const subColors = activeSubjects.length ? ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ccc'] : ['#374151']; 
    const ctxS = document.getElementById('subjectChart'); 
    if(window.subChart) window.subChart.destroy();
    window.subChart = new Chart(ctxS, { 
        type: 'pie', data: { labels: subLabels, datasets: [{data: subData, backgroundColor: subColors}] }, 
        options: { maintainAspectRatio: false, plugins: { legend: { labels: { color: color } } } } 
    });
    const ctxF = document.getElementById('focusChart'); if(window.focusChart) window.focusChart.destroy();
    const labels=[], data=[]; for(let i=6; i>=0; i--) { const d=new Date(); d.setDate(d.getDate()-i); const dStr=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; labels.push(dStr); data.push(appData.focusLog[dStr]||0); }
    window.focusChart = new Chart(ctxF, { type:'bar', data: { labels:labels, datasets:[{label:'Mins', data:data, backgroundColor:'#2563eb'}] }, options: { maintainAspectRatio: false, scales:{x:{ticks:{color:color}}, y:{ticks:{color:color}}} } });
}

// UPDATE RANK
function updateRank() {
    if (typeof appData.xp === 'undefined' || isNaN(appData.xp)) {
        appData.xp = 0;
    }
    const xp = Number(appData.xp);
    const xpPerLevel = 500;
    const level = Math.floor(xp / xpPerLevel) + 1;
    const currentLevelXP = xp % xpPerLevel;
    const progressPct = (currentLevelXP / xpPerLevel) * 100;

    let rankName = "Civilian"; 
    if (level >= 2) rankName = "Aspirant";       
    if (level >= 5) rankName = "Serious Player"; 
    if (level >= 10) rankName = "Pro Aspirant";  
    if (level >= 20) rankName = "Mains Ready";   
    if (level >= 50) rankName = "LBSNAA Cadet";  

    const titleEl = document.getElementById('rankTitle');
    const lvlEl = document.getElementById('levelDisplay');
    const barEl = document.getElementById('xpBar');

    if(titleEl) titleEl.innerText = rankName;
    if(lvlEl) lvlEl.innerText = level;
    if(barEl) barEl.style.width = `${progressPct}%`;
}

// COMPLETION CALCULATOR
function calculateCompletion() { 
    try {
        let total = 0, done = 0; 
        UPSC_SYLLABUS.forEach(s => s.chapters.forEach(c => c.topics.forEach(t => { 
            total++; 
            if(appData.syllabus[`${s.subject}-${c.title}-${t}`]?.status === 3) done++; 
        }))); 
        
        if (total === 0) return "N/A";
        const remaining = total - done; 
        if(remaining <= 0) return "Goal Reached!";
        const daysLeft = Math.ceil(remaining / 3); 
        const targetDate = new Date(); 
        targetDate.setDate(targetDate.getDate() + daysLeft); 
        return targetDate.toDateString(); 
    } catch(e) {
        console.error("Calc Error:", e);
        return "Error";
    }
}

function updateDashboard() {
    const today = getTodayDate();
    document.getElementById('todayFocus').innerText = `${appData.focusLog[today]||0} mins`;
    document.getElementById('todayTasks').innerText = appData.goals.daily ? appData.goals.daily.filter(g=>g.completed).length : 0;
    let total=0, done=0;
    UPSC_SYLLABUS.forEach(s => s.chapters.forEach(c => c.topics.forEach(t => { total++; if(appData.syllabus[`${s.subject}-${c.title}-${t}`]?.status === 3) done++; })));
    document.getElementById('totalCoverage').innerText = total===0? '0%' : `${Math.round((done/total)*100)}%`;
    let streak=0; const t=new Date(); for(let i=0;i<365;i++){ const d=new Date(); d.setDate(t.getDate()-i); const dStr=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; if(appData.focusLog[dStr]>0)streak++; else if(i>0)break; }
    document.getElementById('streakDisplay').innerText = `${streak} Days`;
    document.getElementById('completionPredictor').innerText = calculateCompletion();
    updateRank(); 
}

let currentGoalTab = 'daily';
function switchGoalTab(tab) { currentGoalTab = tab; document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); const tabs = document.querySelectorAll('.tab'); if(tab === 'daily') tabs[0].classList.add('active'); if(tab === 'weekly') tabs[1].classList.add('active'); if(tab === 'monthly') tabs[2].classList.add('active'); if(tab === 'halfyearly') tabs[3].classList.add('active'); document.getElementById('newGoalInput').placeholder = `Add a ${tab} goal...`; renderGoals(); }
function renderGoals() { const list = document.getElementById('goalList'); list.innerHTML = ''; const goals = appData.goals[currentGoalTab] || []; if(goals.length === 0) list.innerHTML = `<li style="text-align:center; color:gray; font-size:0.8rem; padding:10px;">No ${currentGoalTab} goals.</li>`; goals.forEach((g,i)=>{ list.innerHTML += `<li class="goal-item ${g.prio?'high-priority':''} ${g.completed?'completed':''}"><span onclick="toggleGoal(${i})">${g.text}</span><button onclick="deleteGoal(${i})" style="color:red;background:none;"><i class="fas fa-trash"></i></button></li>`; }); }
function addGoal() { const txt = document.getElementById('newGoalInput').value.trim(); const prio = document.getElementById('goalPriority').checked; if(txt) { if(!appData.goals[currentGoalTab]) appData.goals[currentGoalTab] = []; appData.goals[currentGoalTab].push({text:txt, completed:false, prio:prio}); document.getElementById('newGoalInput').value = ''; saveData(); renderGoals(); } }
function toggleGoal(i) { 
    appData.goals[currentGoalTab][i].completed = !appData.goals[currentGoalTab][i].completed; 
    if(appData.goals[currentGoalTab][i].completed) appData.xp = (appData.xp||0) + 50;
    else appData.xp = (appData.xp||0) - 50;
    updateRank();
    saveData(); 
    renderGoals(); 
}
function deleteGoal(i) { appData.goals[currentGoalTab].splice(i,1); saveData(); renderGoals(); }

// MISC UTILS
function triggerPanic() { document.getElementById('panicModal').style.display = 'flex'; }
function addDeadTime() { appData.deadTime += 10; document.getElementById('deadTimeDisplay').innerText = `${appData.deadTime}m`; saveData(); }
function renderHydration() { const container = document.getElementById('hydration-tracker'); container.innerHTML = ''; for(let i=0; i<8; i++) { const cls = i < appData.waterCount ? 'filled' : ''; container.innerHTML += `<div class="water-drop ${cls}" onclick="toggleWater(${i})"></div>`; } }
function toggleWater(i) { if(i < appData.waterCount) appData.waterCount = i; else appData.waterCount = i + 1; saveData(); renderHydration(); }
function checkSunset() { const hour = new Date().getHours(); if(hour >= 22 && !appData.darkMode) { toggleTheme(); console.log("Sunset Mode Activated"); } }
function addPen() { appData.pensUsed += 1; document.getElementById('penDisplay').innerText = appData.pensUsed; saveData(); }
function openManifesto() { document.getElementById('manifestoText').value = appData.manifesto || ""; document.getElementById('manifestoModal').style.display = 'flex'; }
function saveManifesto() { appData.manifesto = document.getElementById('manifestoText').value; saveData(); closeModal('manifestoModal'); }
function startMathDrill() { document.getElementById('mathModal').style.display = 'flex'; document.getElementById('mathAnswer').value = ''; document.getElementById('mathAnswer').focus(); nextMathQuestion(); let timeLeft = 120; document.getElementById('mathTimer').innerText = "2:00"; if(mathTimerInt) clearInterval(mathTimerInt); mathTimerInt = setInterval(() => { timeLeft--; const m = Math.floor(timeLeft/60); const s = (timeLeft%60).toString().padStart(2,'0'); document.getElementById('mathTimer').innerText = `${m}:${s}`; if(timeLeft <= 0) { clearInterval(mathTimerInt); alert("Time's Up!"); closeModal('mathModal'); } }, 1000); }
function openOMRModal() { selectedBubbles = {}; renderOMR(); document.getElementById('omrScoreDisplay').innerText = ""; document.getElementById('omrModal').style.display = 'flex'; }
function openCalcModal() { document.getElementById('calcModal').style.display = 'flex'; }
function addTestScore() { appData.tests.push({date:getTodayDate(), type:document.getElementById('testType').value, subject:document.getElementById('testSubject').value, score:document.getElementById('testScore').value, total:document.getElementById('testTotal').value}); saveData(); renderMockTests(); }
function openAIModal() { const sel = document.getElementById('aiTopic'); sel.innerHTML = '<option value="" disabled selected>Select Topic...</option>'; UPSC_SYLLABUS.forEach(s => s.chapters.forEach(c => c.topics.forEach(t => sel.innerHTML += `<option value="${t}">${t}</option>`))); document.getElementById('aiModal').style.display = 'flex'; }
function generateAIPrompt() { const topic = document.getElementById('aiTopic').value; const mode = document.getElementById('aiMode').value; if(!topic) return; let prompt = ""; if(mode === "explain") prompt = `Explain "${topic}" in simple terms.`; if(mode === "quiz") prompt = `Generate 5 MCQs on "${topic}".`; if(mode === "mains") prompt = `Structure a Mains answer for "${topic}".`; if(mode === "facts") prompt = `Key facts for "${topic}".`; document.getElementById('aiOutput').value = prompt; }
function startMainsTimer() { document.getElementById('focusTime').value = 7; startTimer(); }
function setupAutosave() {
    // This list connects the HTML ID to the App Data variable
    const mappings = [
        { id: 'manifestoText', field: 'manifesto' },
        { id: 'thoughtArea', field: 'thoughts' },
        { id: 'retroWell', field: 'retroWell' }, 
        { id: 'retroBad', field: 'retroBad' },
        { id: 'retroStrat', field: 'retroStrat' },
        { id: 'mainsBody', field: 'tempMainsBody' }
    ];

    mappings.forEach(map => {
        const el = document.getElementById(map.id);
        if (el) {
            // 1. Load saved text when app opens
            if (appData[map.field]) {
                el.value = appData[map.field];
            }

            // 2. Listen for typing and trigger save
            el.addEventListener('input', () => {
                appData[map.field] = el.value; // Update variable
                triggerAutoSave(); // Call the smart save function
            });
        }
    });
}
function exportData() { const blob = new Blob([JSON.stringify(appData)], {type:"application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "UPSC_Ultra_Backup.json"; a.click(); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); appData.darkMode = !appData.darkMode; saveData(); renderCharts(); }
function copyToClipboard() { document.getElementById("aiOutput").select(); document.execCommand("copy"); alert("Copied!"); }
function saveRetro() { appData.retros.push({date: new Date().toISOString(), well: document.getElementById('retroWell').value, bad: document.getElementById('retroBad').value, strat: document.getElementById('retroStrat').value}); saveData(); alert("Review Locked!"); }
function renderRetroStats() { let totalMins = 0; const list = document.getElementById('retroStatsList'); list.innerHTML = ''; for(let i=0; i<7; i++) { const d = new Date(); d.setDate(d.getDate() - i); totalMins += (appData.focusLog[getTodayDate()] || 0); } list.innerHTML = `<li><strong>Total Focus:</strong> ${Math.round(totalMins/60)} Hours</li>`; }
function scanSyllabus() { const text = document.getElementById('scanInput').value.toLowerCase(); const resultDiv = document.getElementById('scanResults'); resultDiv.innerHTML = ''; if(!text) return; const keywords = text.split(' ').filter(w => w.length > 3); let matches = []; UPSC_SYLLABUS.forEach(sub => { sub.chapters.forEach(chap => { let score = 0; keywords.forEach(k => { if(chap.title.toLowerCase().includes(k)) score += 2; }); if(score > 0) matches.push({ subject: sub.subject, chapter: chap.title }); }); }); matches.forEach(m => { resultDiv.innerHTML += `<div>${m.subject} - ${m.chapter}</div>`; }); }
function renderMockTests() { const tbody = document.querySelector('#testTable tbody'); tbody.innerHTML = ''; const scores = appData.tests || []; scores.forEach((t, i) => { tbody.innerHTML += `<tr><td>${t.date}</td><td>${t.type}</td><td>${t.subject}</td><td><strong>${t.score}/${t.total}</strong></td><td><button onclick="deleteTest(${i})" style="color:red; background:none;"><i class="fas fa-trash"></i></button></td></tr>`; }); const ctx = document.getElementById('testChart'); if(window.testChartInst) window.testChartInst.destroy(); window.testChartInst = new Chart(ctx, { type: 'line', data: { labels: scores.map(t=>t.date), datasets: [{ label: '%', data: scores.map(t=>(t.score/t.total)*100), borderColor: '#2563eb' }] }, options:{maintainAspectRatio: false, scales:{y:{beginAtZero:true, max:100}}} }); }
function deleteTest(i) { appData.tests.splice(i, 1); saveData(); renderMockTests(); }
function nextMathQuestion() { const ops = ['+', '-', '*']; const op = ops[Math.floor(Math.random()*3)]; let a, b; if(op === '*') { a = Math.floor(Math.random()*15)+2; b = Math.floor(Math.random()*10)+2; } else { a = Math.floor(Math.random()*100); b = Math.floor(Math.random()*100); } currentAns = eval(`${a} ${op} ${b}`); document.getElementById('mathQuestion').innerText = `${a} ${op} ${b} = ?`; }
function checkMathAnswer(e) { if(e.key === 'Enter') { if(parseInt(e.target.value) === currentAns) { e.target.value = ''; nextMathQuestion(); } else { e.target.style.borderColor = 'red'; setTimeout(() => e.target.style.borderColor = '#ccc', 200); } } }
function calc(key) { const disp = document.getElementById('calcInput'); if(key === 'C') disp.value = ''; else if(key === '=') { try { disp.value = eval(disp.value); } catch { disp.value = 'Error'; } } else disp.value += key; }
function toggleChapter(id) {
    // 1. Initialize the storage array if missing
    if (!appData.expanded) appData.expanded = [];

    // 2. Add or Remove the Chapter ID from our "Open List"
    const index = appData.expanded.indexOf(id);
    if (index > -1) {
        appData.expanded.splice(index, 1); // It was open, so remove it (Close)
    } else {
        appData.expanded.push(id); // It was closed, so add it (Open)
    }

    // 3. Update the UI instantly
    const rows = document.querySelectorAll('.' + id);
    rows.forEach(e => e.classList.toggle('visible'));
    
    // 4. Save this preference so it stays open next time
    saveData();
}
function openNoteModal(k) { document.getElementById('noteTopicTitle').innerText=k.split('-')[2]; document.getElementById('noteText').value=appData.syllabus[k]?.note||''; document.getElementById('noteLink').value=appData.syllabus[k]?.link||''; document.getElementById('noteModal').dataset.key=k; document.getElementById('noteModal').style.display='flex'; }
function saveNote() { const k=document.getElementById('noteModal').dataset.key; if(!appData.syllabus[k]) appData.syllabus[k]={status:0}; appData.syllabus[k].note=document.getElementById('noteText').value; appData.syllabus[k].link=document.getElementById('noteLink').value; saveData(); document.getElementById('noteModal').style.display='none'; renderSyllabus(); }
function closeModal(id) { document.getElementById(id).style.display='none'; }
function renderLibrary() { const div = document.getElementById('libraryContainer'); div.innerHTML = ''; appData.library.forEach((b, i) => { const pct = Math.round((b.read / b.pages) * 100); div.innerHTML += `<div class="book-item"><div style="display:flex; justify-content:space-between;"><strong>${b.title}</strong> <small>${b.read}/${b.pages}</small></div><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><div style="margin-top:5px; display:flex; gap:5px;"><button onclick="updateBook(${i}, 10)" style="font-size:0.7rem; padding:2px 5px;">+10</button><button onclick="updateBook(${i}, 50)" style="font-size:0.7rem; padding:2px 5px;">+50</button><button onclick="deleteBook(${i})" style="font-size:0.7rem; background:none; color:red; padding:2px;">Del</button></div></div>`; }); }
function addBook() { const t = document.getElementById('bookTitle').value; const p = document.getElementById('bookPages').value; if(t && p) { appData.library.push({title:t, pages:parseInt(p), read:0}); saveData(); renderLibrary(); } }
function updateBook(i, p) { appData.library[i].read = Math.min(appData.library[i].read + p, appData.library[i].pages); saveData(); renderLibrary(); }
function deleteBook(i) { appData.library.splice(i,1); saveData(); renderLibrary(); }
function checkNewsReset() { const t=getTodayDate(); if(appData.news.date!==t) appData.news={date:t,hindu:false,edit:false,mag:false}; document.getElementById('news-hindu').checked=appData.news.hindu; document.getElementById('news-edit').checked=appData.news.edit; document.getElementById('news-mag').checked=appData.news.mag; }
function toggleNews(k) { appData.news[k]=document.getElementById(`news-${k}`).checked; saveData(); }
function renderHeatmap() { const d=document.getElementById('heatmap'); d.innerHTML=''; for(let i=364; i>=0; i--){ const dt=new Date(); dt.setDate(dt.getDate()-i); const dStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; const m=appData.focusLog[dStr]||0; let c=''; if(m>0)c='heat-1'; if(m>60)c='heat-2'; if(m>180)c='heat-3'; d.innerHTML+=`<div class="heat-box ${c}" title="${m}m"></div>`; } }
function addFlashcard() { const f = document.getElementById('fcFront').value; const b = document.getElementById('fcBack').value; if(f && b) { appData.flashcards.push({front: f, back: b}); document.getElementById('fcFront').value = ''; document.getElementById('fcBack').value = ''; saveData(); renderFlashcard(); alert("Card Added!"); } }
function saveMainsDraft() { const q = document.getElementById('mainsQuestion').value; if(!q) { alert("Enter title"); return; } appData.mainsDrafts.push({q, i: document.getElementById('mainsIntro').value, b: document.getElementById('mainsBody').value, c: document.getElementById('mainsConc').value, date: new Date().toISOString()}); saveData(); alert("Draft Saved!"); }
window.onclick = e => { if(e.target.classList.contains('modal')) e.target.style.display='none'; }
// ==========================================
// NEW LIFE APPS (Dojo & Tribe)
// ==========================================

// --- THE DOJO (Fitness) ---
function renderDojo() {
    const container = document.getElementById('dojoLog');
    if (!container) return; // Stop if HTML is missing
    container.innerHTML = '';
    
    if (!appData.dojo) appData.dojo = [];
    
    // Show last 5 workouts (newest first)
    appData.dojo.slice().reverse().slice(0, 5).forEach((item, i) => {
        const date = new Date(item.date).toLocaleDateString();
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border);">
                <span><b>${item.ex}</b>: ${item.reps}</span>
                <span style="color:gray; font-size:0.8rem;">${date}</span>
            </div>
        `;
    });
}

function logExercise() {
    const ex = document.getElementById('exerciseInput').value;
    const reps = document.getElementById('repsInput').value;
    if (ex) {
        if (!appData.dojo) appData.dojo = [];
        appData.dojo.push({ ex: ex, reps: reps, date: Date.now() });
        
        document.getElementById('exerciseInput').value = '';
        document.getElementById('repsInput').value = '';
        saveData();
        renderDojo();
    }
}

// --- THE TRIBE (Relationships) ---
function renderTribe() {
    const container = document.getElementById('tribeList');
    if (!container) return;
    container.innerHTML = '';
    
    if (!appData.tribe) appData.tribe = [];
    
    appData.tribe.forEach((p, i) => {
        // Calculate days since last contact
        const last = p.lastContact || 0;
        const diff = Date.now() - last;
        const daysAgo = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        // Green if recent, Red if overdue
        const isOverdue = daysAgo > p.freq;
        const color = isOverdue ? 'var(--danger)' : 'var(--success)';
        const status = isOverdue ? `Call! (${daysAgo}d)` : `${daysAgo}d ago`;
        
        container.innerHTML += `
            <div style="border:1px solid ${color}; padding:10px; border-radius:8px; text-align:center; position:relative;">
                <button onclick="deletePerson(${i})" style="position:absolute; top:2px; right:5px; background:none; color:gray; padding:0; cursor:pointer;">&times;</button>
                <div style="font-weight:bold; margin-bottom:5px;">${p.name}</div>
                <div style="font-size:0.8rem; margin-bottom:8px; color:${color}; font-weight:bold;">${status}</div>
                <button onclick="contactPerson(${i})" style="font-size:0.8rem; padding:4px 8px; cursor:pointer;">Mark Contacted</button>
            </div>
        `;
    });
}

function addPerson() {
    const name = document.getElementById('personInput').value;
    const freq = document.getElementById('freqInput').value || 7; // Default 7 days
    if (name) {
        if (!appData.tribe) appData.tribe = [];
        appData.tribe.push({ name: name, freq: parseInt(freq), lastContact: Date.now() });
        
        document.getElementById('personInput').value = '';
        saveData();
        renderTribe();
    }
}

function contactPerson(index) {
    appData.tribe[index].lastContact = Date.now();
    saveData();
    renderTribe();
}

function deletePerson(index) {
    if(confirm("Remove this person?")) {
        appData.tribe.splice(index, 1);
        saveData();
        renderTribe();
    }
}
// --- THE LEDGER (Lent/Borrowed) ---
function addToLedger() {
    const type = document.getElementById('ledgerType').value;
    const person = document.getElementById('ledgerPerson').value;
    const item = document.getElementById('ledgerItem').value;
    
    if(person && item) {
        if(!appData.ledger) appData.ledger = [];
        appData.ledger.unshift({
            type: type,
            person: person,
            item: item,
            date: new Date().toLocaleDateString()
        });
        
        document.getElementById('ledgerPerson').value = '';
        document.getElementById('ledgerItem').value = '';
        saveData();
        renderLedger();
    }
}

function renderLedger() {
    const container = document.getElementById('ledgerList');
    if(!container) return;
    container.innerHTML = '';
    
    if(!appData.ledger) appData.ledger = [];
    
    if(appData.ledger.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:gray; padding:20px;">No active debts. You are free!</div>';
        return;
    }

    appData.ledger.forEach((l, i) => {
        // Green if you gave (Asset), Red if you took (Liability)
        const isGave = l.type === 'gave';
        const color = isGave ? 'var(--success)' : 'var(--danger)';
        const arrow = isGave ? '➔' : '⬅️';
        const phrase = isGave ? `You gave <b>${l.person}</b>` : `You took from <b>${l.person}</b>`;
        
        container.innerHTML += `
            <div style="background:var(--bg); padding:10px; border-left:4px solid ${color}; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:0.9rem; color:gray; margin-bottom:2px;">${l.date}</div>
                    <div>${phrase}: <strong style="font-size:1.1rem;">${l.item}</strong></div>
                </div>
                <button onclick="settleLedger(${i})" style="font-size:0.8rem; background:transparent; border:1px solid var(--text-muted); color:var(--text); padding:4px 8px;">Settle</button>
            </div>
        `;
    });
}

function settleLedger(i) {
    if(confirm("Mark this as settled/returned?")) {
        appData.ledger.splice(i, 1);
        saveData();
        renderLedger();
    }
}
// --- YEAR COMPASS ---
function renderYearCompass() {
    const grid = document.getElementById('weeksGrid');
    const percentDisplay = document.getElementById('yearPercent');
    if(!grid) return;
    
    grid.innerHTML = '';
    
    // 1. Calculate Time
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1); // Jan 1st
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // 2. Calculate Percentage
    const percent = ((dayOfYear / 365) * 100).toFixed(1);
    percentDisplay.innerText = `${percent}%`;
    
    // 3. Render 52 Weeks
    const currentWeek = Math.floor(dayOfYear / 7); // 0 to 51
    
    for(let i = 0; i < 52; i++) {
        let style = '';
        let title = `Week ${i+1}`;
        
        if (i < currentWeek) {
            // Past: Faded Gray
            style = 'background:var(--text); opacity:0.2;'; 
            title += " (Gone)";
        } else if (i === currentWeek) {
            // Present: Bright Primary Color
            style = 'background:var(--primary); box-shadow: 0 0 10px var(--primary); transform:scale(1.2);'; 
            title += " (Now)";
        } else {
            // Future: Empty Border
            style = 'border:1px solid var(--border);'; 
            title += " (Remaining)";
        }
        
        grid.innerHTML += `<div title="${title}" style="height:15px; border-radius:3px; ${style}"></div>`;
    }
}
// --- EVENTS (Countdown) ---
function addEvent() {
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;

    if(name && date) {
        if(!appData.events) appData.events = [];
        appData.events.push({ name, date });
        document.getElementById('eventName').value = '';
        saveData();
        renderEvents();
    }
}

function renderEvents() {
    const container = document.getElementById('eventList');
    if(!container) return;
    container.innerHTML = '';

    if(!appData.events) appData.events = [];

    // Sort by date (Soonest event comes first)
    appData.events.sort((a, b) => new Date(a.date) - new Date(b.date));

    appData.events.forEach((e, i) => {
        const target = new Date(e.date);
        const now = new Date();
        
        // Calculate difference in time
        const diff = target - now;
        // Convert to days (rounding up)
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        let statusHtml = '';
        let color = 'var(--primary)';

        if(days < 0) {
            statusHtml = `<span style="color:gray;">Done (${Math.abs(days)}d ago)</span>`;
            color = 'gray';
        } else if (days === 0) {
            statusHtml = `<span style="color:var(--danger); font-weight:bold;">TODAY!</span>`;
            color = 'var(--danger)';
        } else {
            statusHtml = `<span style="font-size:1.5rem; font-weight:bold; color:var(--primary);">${days}</span> <small>Days Left</small>`;
        }

        container.innerHTML += `
            <div style="background:var(--bg); border-left:4px solid ${color}; padding:15px; border-radius:4px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                <div>
                    <div style="font-weight:bold; font-size:1.1rem;">${e.name}</div>
                    <div style="font-size:0.8rem; opacity:0.7;">${target.toDateString()}</div>
                </div>
                <div style="text-align:right;">
                    <div>${statusHtml}</div>
                    <button onclick="deleteEvent(${i})" style="font-size:0.7rem; color:red; background:none; border:none; cursor:pointer; margin-top:5px;">Remove</button>
                </div>
            </div>
        `;
    });
}

function deleteEvent(i) {
    if(confirm("Delete this countdown?")) {
        appData.events.splice(i, 1);
        saveData();
        renderEvents();
    }
}// --- IDENTITY (My Numbers) ---
function addIdentity() {
    const label = document.getElementById('idLabel').value;
    const val = document.getElementById('idValue').value;

    if(label && val) {
        if(!appData.identity) appData.identity = [];
        appData.identity.push({ label, val });
        
        document.getElementById('idLabel').value = '';
        document.getElementById('idValue').value = '';
        saveData();
        renderIdentity();
    }
}

function renderIdentity() {
    const container = document.getElementById('identityList');
    if(!container) return;
    container.innerHTML = '';

    if(!appData.identity) appData.identity = [];

    appData.identity.forEach((item, i) => {
        container.innerHTML += `
            <div style="background:var(--bg); border:1px solid var(--border); padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                <div style="overflow:hidden;">
                    <div style="font-size:0.8rem; color:gray; text-transform:uppercase; letter-spacing:1px;">${item.label}</div>
                    <div style="font-weight:bold; font-size:1.1rem; font-family:monospace;">${item.val}</div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="copyIdentity('${item.val}')" style="background:var(--primary); padding:5px 10px; font-size:0.9rem;" title="Copy"><i class="fas fa-copy"></i></button>
                    <button onclick="deleteIdentity(${i})" style="background:none; color:red; border:none;">&times;</button>
                </div>
            </div>
        `;
    });
}

function deleteIdentity(i) {
    if(confirm("Delete this ID?")) {
        appData.identity.splice(i, 1);
        saveData();
        renderIdentity();
    }
}

function copyIdentity(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied: " + text);
    });
}// --- MOOD GRID ---
function logMood(rating) {
    if(!appData.moods) appData.moods = {};
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    appData.moods[today] = rating;
    saveData();
    renderMood();
}

function renderMood() {
    const container = document.getElementById('moodGrid');
    if(!container) return;
    container.innerHTML = '';
    
    if(!appData.moods) appData.moods = {};
    
    // Generate last 30 days
    for(let i=29; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const rating = appData.moods[dateKey] || 0;
        
        let color = 'var(--bg)'; // Default (Empty)
        if(rating === 1) color = '#ef4444'; // Red
        if(rating === 2) color = '#f97316'; // Orange
        if(rating === 3) color = '#eab308'; // Yellow
        if(rating === 4) color = '#84cc16'; // Light Green
        if(rating === 5) color = '#22c55e'; // Green
        
        // Border for "Today"
        const border = (i === 0) ? 'border: 2px solid var(--text);' : 'border: 1px solid var(--border);';
        
        container.innerHTML += `
            <div title="${dateKey}: ${rating}/5" style="aspect-ratio:1; background:${color}; border-radius:4px; ${border}"></div>
        `;
    }
}


// --- NOT-TO-DO LIST ---
function addNotToDo() {
    const text = document.getElementById('ntdInput').value;
    if(text) {
        if(!appData.nottodo) appData.nottodo = [];
        appData.nottodo.push({ text: text, lastCheck: null, streak: 0 });
        document.getElementById('ntdInput').value = '';
        saveData();
        renderNotToDo();
    }
}

function renderNotToDo() {
    const container = document.getElementById('ntdList');
    if(!container) return;
    container.innerHTML = '';
    
    if(!appData.nottodo) appData.nottodo = [];
    
    const todayStr = new Date().toDateString();

    appData.nottodo.forEach((item, i) => {
        const isDoneToday = item.lastCheck === todayStr;
        const btnColor = isDoneToday ? 'var(--success)' : 'var(--bg)';
        const btnText = isDoneToday ? 'Success!' : 'I avoided this today';
        
        container.innerHTML += `
            <div style="background:var(--bg); padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border);">
                <div>
                    <div style="font-weight:bold; color:var(--danger);"><i class="fas fa-ban"></i> ${item.text}</div>
                    <div style="font-size:0.8rem; color:gray;">Streak: <span style="color:var(--text); font-weight:bold;">${item.streak} days</span></div>
                </div>
                <div style="text-align:right;">
                     <button onclick="checkNotToDo(${i})" style="font-size:0.8rem; padding:5px 10px; background:${btnColor}; border:1px solid var(--border);">${btnText}</button>
                     <div onclick="deleteNotToDo(${i})" style="font-size:0.7rem; color:red; margin-top:5px; cursor:pointer;">Remove</div>
                </div>
            </div>
        `;
    });
}

function checkNotToDo(i) {
    const todayStr = new Date().toDateString();
    // Only allow checking if not already done today
    if(appData.nottodo[i].lastCheck !== todayStr) {
        appData.nottodo[i].lastCheck = todayStr;
        appData.nottodo[i].streak += 1;
        saveData();
        renderNotToDo();
        
        // Celebration effect
        alert("Good job! Discipline +1");
    }
}

function deleteNotToDo(i) {
    if(confirm("Remove this rule?")) {
        appData.nottodo.splice(i, 1);
        saveData();
        renderNotToDo();
    }
}