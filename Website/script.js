const PATIENTS = [
    {
        id: "brendon",
        name: "Brendon Rogers",
        group: "Cardiology",
        avatar: "https://i.pravatar.cc/150?img=12",
        avatarLarge: "https://i.pravatar.cc/200?img=12",
        headlineDiagnosis: "Coronary atherosclerosis",
        info: [
            ["Date of birth", "March 9, 1990"],
            ["Age", "36 years old"],
            ["Sex", "Male"],
            ["Race", "White"],
            ["Nationality", "Canadian"],
            ["Preferred language", "English"],
        ],
        diagnoses: [
            { icon: "fa-heartbeat", title: "Coronary atherosclerosis", date: "May 4, 2020" },
            { icon: "fa-lungs", title: "Allergic rhinitis", date: "March 2, 2020" },
            { icon: "fa-brain", title: "Depressive disorder", date: "October 7, 2019" },
            { icon: "fa-thermometer-half", title: "Viral upper respiratory infection", date: "January 14, 2019" },
        ],
        visits: [
            { title: "Cardiology follow-up", meta: "May 2, 2026 — Dr. Patel" },
            { title: "Lab review (lipid panel)", meta: "Apr 18, 2026 — Virtual" },
            { title: "Primary care annual", meta: "Nov 3, 2025 — Clinic" },
        ],
        labs: [
            { title: "Lipid panel", meta: "Apr 18, 2026 — LDL 98 mg/dL" },
            { title: "HbA1c", meta: "Nov 3, 2025 — 5.4%" },
            { title: "CBC", meta: "Nov 3, 2025 — WNL" },
        ],
        prescriptions: [
            { title: "Atorvastatin 40 mg", meta: "Once daily — Refills: 2" },
            { title: "Aspirin 81 mg", meta: "Once daily" },
            { title: "Lisinopril 10 mg", meta: "Each morning" },
        ],
    },
    {
        id: "beatrice",
        name: "Beatrice Jones",
        group: "Respiratory",
        avatar: "https://i.pravatar.cc/150?img=32",
        avatarLarge: "https://i.pravatar.cc/200?img=32",
        headlineDiagnosis: "SARS (history)",
        info: [
            ["Date of birth", "July 21, 1985"],
            ["Age", "40 years old"],
            ["Sex", "Female"],
            ["Race", "Black"],
            ["Nationality", "American"],
            ["Preferred language", "English"],
        ],
        diagnoses: [
            { icon: "fa-virus", title: "SARS (recovered)", date: "June 2003" },
            { icon: "fa-wind", title: "Mild persistent asthma", date: "August 12, 2018" },
        ],
        visits: [
            { title: "Pulmonology", meta: "Mar 9, 2026 — In-person" },
            { title: "Immunization review", meta: "Jan 8, 2026" },
        ],
        labs: [
            { title: "Spirometry summary", meta: "Mar 9, 2026 — FEV1 92% pred" },
            { title: "IgE panel", meta: "Jan 8, 2026 — elevated dust mite" },
        ],
        prescriptions: [
            { title: "Albuterol inhaler", meta: "As needed" },
            { title: "Fluticasone nasal spray", meta: "Daily during allergy season" },
        ],
    },
    {
        id: "francis",
        name: "Francis Hamilton",
        group: "Genetics",
        avatar: "https://i.pravatar.cc/150?img=22",
        avatarLarge: "https://i.pravatar.cc/200?img=22",
        headlineDiagnosis: "Pax Syndrome",
        info: [
            ["Date of birth", "February 2, 1998"],
            ["Age", "28 years old"],
            ["Sex", "Male"],
            ["Race", "Asian"],
            ["Nationality", "British"],
            ["Preferred language", "English"],
        ],
        diagnoses: [
            { icon: "fa-dna", title: "Pax Syndrome", date: "Diagnosed 2016" },
            { icon: "fa-eye", title: "Refractive error", date: "April 4, 2024" },
        ],
        visits: [
            { title: "Genetics counseling", meta: "Feb 20, 2026 — Telehealth" },
            { title: "Ophthalmology", meta: "Apr 4, 2024" },
        ],
        labs: [
            { title: "Metabolic panel", meta: "Feb 20, 2026 — WNL" },
        ],
        prescriptions: [
            { title: "Custom supplement protocol", meta: "Per genetics team" },
        ],
    },
    {
        id: "freddie",
        name: "Freddie Townsend",
        group: "Urgent Care",
        avatar: "https://i.pravatar.cc/150?img=25",
        avatarLarge: "https://i.pravatar.cc/200?img=25",
        headlineDiagnosis: "Influenza",
        info: [
            ["Date of birth", "October 30, 1992"],
            ["Age", "33 years old"],
            ["Sex", "Male"],
            ["Race", "White"],
            ["Nationality", "Canadian"],
            ["Preferred language", "English"],
        ],
        diagnoses: [
            { icon: "fa-head-side-virus", title: "Influenza A", date: "March 28, 2026" },
            { icon: "fa-tint", title: "Mild dehydration", date: "March 28, 2026" },
        ],
        visits: [
            { title: "Urgent care", meta: "Mar 28, 2026" },
            { title: "Phone follow-up", meta: "Mar 31, 2026" },
        ],
        labs: [
            { title: "Rapid flu + COVID", meta: "Mar 28, 2026 — Flu A positive" },
        ],
        prescriptions: [
            { title: "Oseltamivir (Tamiflu)", meta: "5-day course — completed" },
            { title: "Acetaminophen", meta: "PRN fever" },
        ],
    },
    {
        id: "gabriel",
        name: "Gabriel Burgess",
        group: "Endocrinology",
        avatar: "https://i.pravatar.cc/150?img=45",
        avatarLarge: "https://i.pravatar.cc/200?img=45",
        headlineDiagnosis: "Type 2 diabetes mellitus",
        info: [
            ["Date of birth", "December 11, 1980"],
            ["Age", "45 years old"],
            ["Sex", "Male"],
            ["Race", "Hispanic"],
            ["Nationality", "American"],
            ["Preferred language", "Spanish"],
        ],
        diagnoses: [
            { icon: "fa-syringe", title: "Type 2 diabetes mellitus", date: "September 2022" },
            { icon: "fa-weight", title: "Obesity", date: "September 2022" },
        ],
        visits: [
            { title: "Endocrinology", meta: "Apr 2, 2026" },
            { title: "Diabetes education", meta: "Jan 14, 2026" },
        ],
        labs: [
            { title: "HbA1c", meta: "Apr 2, 2026 — 7.1%" },
            { title: "CMP", meta: "Apr 2, 2026 — eGFR stable" },
        ],
        prescriptions: [
            { title: "Metformin 1000 mg", meta: "Twice daily with meals" },
            { title: "Semaglutide", meta: "Weekly injection" },
        ],
    },
];

const SCHEDULE_PREVIEW = [
    { title: "Telehealth — Brendon Rogers", meta: "Today · 2:15 PM" },
    { title: "In-office — Beatrice Jones", meta: "Thu · 10:00 AM" },
    { title: "Lab-only visit — Gabriel Burgess", meta: "Fri · 8:30 AM" },
];

const MESSAGES_PREVIEW = [
    { title: "Dr. Patel", meta: "“Lipids look improved — keep current statin dose.”" },
    { title: "City Pharmacy", meta: "Refill ready for pickup (Metformin)." },
    { title: "Care coordinator", meta: "Reminder: diabetes class next week." },
];

const NOTIFICATIONS_PREVIEW = [
    { title: "New lab result", meta: "Gabriel Burgess · HbA1c posted 2h ago" },
    { title: "Refill due", meta: "Francis Hamilton · Supplement protocol in 5 days" },
    { title: "Portal message", meta: "Freddie Townsend replied to visit summary" },
];

// Richer view data (UI-only demo)
const APPOINTMENTS = [
    { id: "apt-1", dateIso: "2026-05-20", time: "2:15 PM", type: "telehealth", title: "Telehealth follow-up", who: "Brendon Rogers" },
    { id: "apt-2", dateIso: "2026-05-21", time: "10:00 AM", type: "in-person", title: "Asthma check", who: "Beatrice Jones" },
    { id: "apt-3", dateIso: "2026-05-23", time: "8:30 AM", type: "in-person", title: "Lab-only visit", who: "Gabriel Burgess" },
    { id: "apt-4", dateIso: "2026-05-27", time: "4:00 PM", type: "telehealth", title: "Genetics consult", who: "Francis Hamilton" },
];

const MESSAGE_THREADS = [
    {
        id: "thr-1",
        title: "Dr. Patel",
        preview: "Lipids look improved — keep current statin dose.",
        updated: "Today",
        unread: true,
        messages: [
            { from: "Dr. Patel", text: "Lipids look improved — keep current statin dose. Any new symptoms?", meta: "10:12 AM" },
            { from: "Me", text: "No new symptoms. Thanks!", meta: "10:15 AM" },
        ],
    },
    {
        id: "thr-2",
        title: "City Pharmacy",
        preview: "Refill ready for pickup (Metformin).",
        updated: "Yesterday",
        unread: false,
        messages: [
            { from: "City Pharmacy", text: "Your refill is ready for pickup. Hours: 9–6.", meta: "Yesterday · 3:40 PM" },
        ],
    },
    {
        id: "thr-3",
        title: "Care coordinator",
        preview: "Reminder: diabetes class next week.",
        updated: "Mon",
        unread: true,
        messages: [
            { from: "Care coordinator", text: "Reminder: diabetes class next week. Want to reserve a spot?", meta: "Mon · 9:05 AM" },
        ],
    },
];

const NOTIFS = [
    { id: "n1", when: "today", title: "New lab result", desc: "Gabriel Burgess · HbA1c posted 2h ago", meta: "2h", kind: "lab" },
    { id: "n2", when: "today", title: "Refill reminder", desc: "Francis Hamilton · Supplement protocol due in 5 days", meta: "4h", kind: "refill" },
    { id: "n3", when: "earlier", title: "Portal message", desc: "Freddie Townsend replied to visit summary", meta: "Mon", kind: "message" },
    { id: "n4", when: "earlier", title: "Appointment confirmed", desc: "Beatrice Jones · Thu 10:00 AM", meta: "Sun", kind: "calendar" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Prescription model inputs (mirrors `models/feature_columns.json`)
// Data source: `Data_Generator.py` in this repo.
// ─────────────────────────────────────────────────────────────────────────────

const FACILITY_NUM = {
    paediatric_ward: 0,
    health_centre: 1,
    outpatient_clinic: 2,
    community_health: 3,
};

// A focused subset of your generator’s drug reference table for demo prescribing.
// These are pediatric-style guideline ranges; later you can swap to API/model scoring.
const DRUG_REFERENCE = {
    Paracetamol: {
        dose_per_kg_min: 10.0,
        dose_per_kg_max: 15.0,
        freq_per_day_options: [3, 4, 6],
        max_single_dose_mg: 1000.0,
        min_weight_kg: 2.5,
        min_age_months: 0,
        drug_class: "analgesic_antipyretic",
    },
    Amoxicillin: {
        dose_per_kg_min: 8.0,
        dose_per_kg_max: 15.0,
        freq_per_day_options: [3],
        max_single_dose_mg: 500.0,
        min_weight_kg: 2.5,
        min_age_months: 0,
        drug_class: "antibiotic_penicillin",
    },
    Cotrimoxazole: {
        dose_per_kg_min: 4.0,
        dose_per_kg_max: 6.0,
        freq_per_day_options: [2],
        max_single_dose_mg: 480.0,
        min_weight_kg: 3.0,
        min_age_months: 2,
        drug_class: "antibiotic_sulfonamide",
    },
    Ibuprofen: {
        dose_per_kg_min: 5.0,
        dose_per_kg_max: 10.0,
        freq_per_day_options: [3, 4],
        max_single_dose_mg: 400.0,
        min_weight_kg: 7.0,
        min_age_months: 3,
        drug_class: "analgesic_nsaid",
    },
    Metronidazole: {
        dose_per_kg_min: 7.0,
        dose_per_kg_max: 10.0,
        freq_per_day_options: [3],
        max_single_dose_mg: 500.0,
        min_weight_kg: 2.5,
        min_age_months: 0,
        drug_class: "antibiotic_nitroimidazole",
    },
    Chloramphenicol: {
        dose_per_kg_min: 12.0,
        dose_per_kg_max: 25.0,
        freq_per_day_options: [4],
        max_single_dose_mg: 1000.0,
        min_weight_kg: 4.0,
        min_age_months: 1,
        drug_class: "antibiotic_broad",
    },
    Gentamicin: {
        dose_per_kg_min: 2.0,
        dose_per_kg_max: 7.5,
        freq_per_day_options: [1, 2],
        max_single_dose_mg: 320.0,
        min_weight_kg: 1.5,
        min_age_months: 0,
        drug_class: "antibiotic_aminoglycoside",
    },
    Ceftriaxone: {
        dose_per_kg_min: 25.0,
        dose_per_kg_max: 50.0,
        freq_per_day_options: [1, 2],
        max_single_dose_mg: 2000.0,
        min_weight_kg: 2.0,
        min_age_months: 0,
        drug_class: "antibiotic_cephalosporin",
    },
    Ampicillin: {
        dose_per_kg_min: 25.0,
        dose_per_kg_max: 50.0,
        freq_per_day_options: [4],
        max_single_dose_mg: 2000.0,
        min_weight_kg: 1.5,
        min_age_months: 0,
        drug_class: "antibiotic_penicillin",
    },
    Phenobarbital: {
        dose_per_kg_min: 1.5,
        dose_per_kg_max: 5.0,
        freq_per_day_options: [1, 2],
        max_single_dose_mg: 200.0,
        min_weight_kg: 2.0,
        min_age_months: 0,
        drug_class: "anticonvulsant",
    },
    Fluconazole: {
        dose_per_kg_min: 3.0,
        dose_per_kg_max: 12.0,
        freq_per_day_options: [1],
        max_single_dose_mg: 400.0,
        min_weight_kg: 3.0,
        min_age_months: 0,
        drug_class: "antifungal",
    },
    Zinc_Sulfate: {
        dose_per_kg_min: null,
        dose_per_kg_max: null,
        freq_per_day_options: [1],
        max_single_dose_mg: 20.0,
        min_weight_kg: 2.5,
        min_age_months: 0,
        drug_class: "micronutrient",
        fixed_dose_rules: { under_6m: 10.0, over_6m: 20.0 },
    },
    Artemether_Lumefantrine: {
        dose_per_kg_min: null,
        dose_per_kg_max: null,
        freq_per_day_options: [2],
        max_single_dose_mg: 80.0,
        min_weight_kg: 5.0,
        min_age_months: 2,
        drug_class: "antimalarial",
        fixed_dose_rules_by_weight: {
            "5_to_15": 20.0,
            "15_to_25": 40.0,
            "25_plus": 60.0,
        },
    },
    Ferrous_Sulfate: {
        dose_per_kg_min: 3.0,
        dose_per_kg_max: 6.0,
        freq_per_day_options: [1, 2],
        max_single_dose_mg: 200.0,
        min_weight_kg: 3.0,
        min_age_months: 1,
        drug_class: "micronutrient",
    },
    Zidovudine_Lamivudine: {
        dose_per_kg_min: 6.0,
        dose_per_kg_max: 9.0,
        freq_per_day_options: [2],
        max_single_dose_mg: 300.0,
        min_weight_kg: 3.0,
        min_age_months: 0,
        drug_class: "antiretroviral",
    },
};

const AGE_GROUP_MAP = {
    neonate: 0,
    infant: 1,
    toddler: 2,
    child: 3,
    adolescent: 4,
};

const DRUG_CLASSES = Array.from(
    new Set(Object.values(DRUG_REFERENCE).map((r) => r.drug_class)),
).sort();
const CLASS_MAP = Object.fromEntries(DRUG_CLASSES.map((c, i) => [c, i]));

const state = {
    currentPatientId: PATIENTS[0].id,
    currentView: "dashboard",
    toastTimer: null,
    useApi: false,
    apiBaseUrl: "",
    apiHealthy: false,
    calendar: {
        monthOffset: 0,
        selectedDateIso: null,
        filter: "all",
    },
    messages: {
        activeThreadId: null,
        query: "",
    },
    notifications: {
        cleared: false,
    },
    groups: {
        active: "All",
        open: false,
    },
};

const els = {
    patientList: document.querySelector(".patient-list"),
    sidebar: document.querySelector(".sidebar"),
    search: document.getElementById("patient-search"),
    profileImg: document.getElementById("profile-img"),
    profileName: document.getElementById("profile-name"),
    profileSubtitle: document.getElementById("profile-subtitle"),
    diagnosisGrid: document.getElementById("diagnosis-grid"),
    infoTable: document.getElementById("info-table"),
    visitsList: document.getElementById("visits-list"),
    labsList: document.getElementById("labs-list"),
    prescriptionsList: document.getElementById("prescriptions-list"),
    tabs: () => document.querySelectorAll(".tabs .tab"),
    tabPanels: () => document.querySelectorAll(".tab-panel"),
    views: () => document.querySelectorAll(".app-view"),
    navIcons: () => document.querySelectorAll(".icon-bar .icon[data-view]"),
    schedulePreview: document.getElementById("schedule-preview"),
    messagesList: document.getElementById("messages-list"),
    notificationsList: document.getElementById("notifications-list"),
    toast: document.getElementById("toast"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modalVideo: document.getElementById("modal-video"),
    modalAdd: document.getElementById("modal-add"),
    modalDx: document.getElementById("modal-diagnoses"),
    videoPatientName: document.getElementById("video-patient-name"),
    diagnosesAllList: document.getElementById("diagnoses-all-list"),
    addMedName: document.getElementById("add-med-name"),
    addMedInstructions: document.getElementById("add-med-instructions"),
    settingCompact: document.getElementById("setting-compact"),
    settingSounds: document.getElementById("setting-sounds"),
    settingUseApi: document.getElementById("setting-use-api"),
    settingApiBase: document.getElementById("setting-api-base"),
    btnApiTest: document.getElementById("btn-api-test"),
    apiStatus: document.getElementById("api-status"),

    btnCalToday: document.getElementById("btn-cal-today"),
    btnCalNew: document.getElementById("btn-cal-new"),
    btnCalPrev: document.getElementById("btn-cal-prev"),
    btnCalNext: document.getElementById("btn-cal-next"),
    calMonthLabel: document.getElementById("cal-month-label"),
    calGrid: document.getElementById("cal-grid"),
    agendaTitle: document.getElementById("agenda-title"),
    agendaList: document.getElementById("agenda-list"),

    msgSearch: document.getElementById("msg-search"),
    btnMsgNew: document.getElementById("btn-msg-new"),
    msgUnreadCount: document.getElementById("msg-unread-count"),
    msgInbox: document.getElementById("msg-inbox"),
    msgThreadTitle: document.getElementById("msg-thread-title"),
    msgThread: document.getElementById("msg-thread"),
    msgCompose: document.getElementById("msg-compose"),
    btnMsgSend: document.getElementById("btn-msg-send"),
    btnMsgMarkRead: document.getElementById("btn-msg-mark-read"),
    btnMsgArchive: document.getElementById("btn-msg-archive"),

    btnNotifClear: document.getElementById("btn-notif-clear"),
    notifToday: document.getElementById("notif-today"),
    notifEarlier: document.getElementById("notif-earlier"),

    sidebarDate: document.getElementById("sidebar-date"),
    btnGroups: document.getElementById("btn-groups"),
    groupMenu: document.getElementById("group-menu"),
    btnAddPatient: document.getElementById("btn-add-patient"),

    rxForm: document.getElementById("rx-form"),
    rxDrug: document.getElementById("rx-drug"),
    rxWeight: document.getElementById("rx-weight"),
    rxAgeMonths: document.getElementById("rx-age-months"),
    rxDoseMg: document.getElementById("rx-dose-mg"),
    rxFreq: document.getElementById("rx-freq"),
    rxFormulation: document.getElementById("rx-formulation"),
    rxFacility: document.getElementById("rx-facility"),
    btnFillGuideline: document.getElementById("btn-fill-guideline"),
    btnAddToPatient: document.getElementById("btn-add-to-patient"),
    rxResult: document.getElementById("rx-result"),
    rxBadge: document.getElementById("rx-badge"),
    rxResultTitle: document.getElementById("rx-result-title"),
    rxResultMsg: document.getElementById("rx-result-msg"),
    rxMetrics: document.getElementById("rx-metrics"),
};

function showToast(message) {
    const t = els.toast;
    if (!t) return;
    t.textContent = message;
    t.hidden = false;
    if (state.toastTimer) clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
        t.hidden = true;
    }, 3200);
}

function getPatient() {
    return PATIENTS.find((p) => p.id === state.currentPatientId) || PATIENTS[0];
}

function renderSimpleList(ul, items) {
    if (!ul) return;
    ul.innerHTML = items
        .map(
            (item) =>
                `<li><span class="li-title">${escapeHtml(item.title)}</span><span class="li-meta">${escapeHtml(item.meta)}</span></li>`,
        )
        .join("");
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
}

function setSidebarDate() {
    if (!els.sidebarDate) return;
    const d = new Date();
    els.sidebarDate.textContent = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getGroupCounts() {
    const counts = {};
    for (const p of PATIENTS) {
        counts[p.group] = (counts[p.group] || 0) + 1;
    }
    return counts;
}

function renderGroupMenu() {
    if (!els.groupMenu) return;
    const counts = getGroupCounts();
    const groups = ["All", ...Object.keys(counts).sort()];

    els.groupMenu.innerHTML = groups
        .map((g) => {
            const active = g === state.groups.active;
            const count = g === "All" ? PATIENTS.length : counts[g] || 0;
            return `<button type="button" class="group-option${active ? " group-option--active" : ""}" data-group="${escapeHtml(g)}" role="option" aria-selected="${active ? "true" : "false"}">
                <span>${escapeHtml(g)}</span>
                <span class="li-meta">${count}</span>
            </button>`;
        })
        .join("");

    els.groupMenu.querySelectorAll(".group-option").forEach((b) => {
        b.addEventListener("click", () => {
            state.groups.active = b.dataset.group;
            state.groups.open = false;
            els.groupMenu.hidden = true;
            els.btnGroups?.setAttribute("aria-expanded", "false");
            renderGroupMenu();
            renderPatientList(els.search.value);
            showToast(`Group: ${state.groups.active}`);
        });
    });
}

function wireGroups() {
    if (!els.btnGroups || !els.groupMenu) return;
    renderGroupMenu();
    els.btnGroups.addEventListener("click", () => {
        state.groups.open = !state.groups.open;
        els.groupMenu.hidden = !state.groups.open;
        els.btnGroups.setAttribute("aria-expanded", state.groups.open ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
        if (!state.groups.open) return;
        const inside = els.groupMenu.contains(e.target) || els.btnGroups.contains(e.target);
        if (!inside) {
            state.groups.open = false;
            els.groupMenu.hidden = true;
            els.btnGroups.setAttribute("aria-expanded", "false");
        }
    });

    els.btnAddPatient?.addEventListener("click", () => {
        showToast("Add patient (demo).");
    });
}

function getAgeGroup(ageMonths) {
    if (ageMonths < 1) return "neonate";
    if (ageMonths < 12) return "infant";
    if (ageMonths < 36) return "toddler";
    if (ageMonths < 144) return "child";
    return "adolescent";
}

function getDrugRef(drug) {
    return DRUG_REFERENCE[drug] || null;
}

function getGuidelineDose(drug, weightKg, ageMonths) {
    const ref = getDrugRef(drug);
    if (!ref) return null;

    // Weight-band fixed dose (generator parity)
    if (drug === "Artemether_Lumefantrine") {
        const rules = ref.fixed_dose_rules_by_weight || {};
        const doseMg = weightKg < 15 ? rules["5_to_15"] : weightKg < 25 ? rules["15_to_25"] : rules["25_plus"];
        return { dose_mg: doseMg, freq_per_day: 2, note: "Weight-band fixed dose" };
    }

    // Zinc fixed dose (age band)
    if (ref.fixed_dose_rules) {
        const doseMg = ageMonths < 6 ? ref.fixed_dose_rules.under_6m : ref.fixed_dose_rules.over_6m;
        return { dose_mg: doseMg, freq_per_day: Math.max(...ref.freq_per_day_options), note: "Age-band fixed dose" };
    }

    // Standard weight-based dosing: midpoint of guideline band, clamped to max single dose
    const lo = ref.dose_per_kg_min ?? 0;
    const hi = ref.dose_per_kg_max ?? lo;
    const midpoint = (lo + hi) / 2;
    const doseMg = clamp(midpoint * weightKg, 0, ref.max_single_dose_mg);
    const freq = Math.max(...ref.freq_per_day_options);
    return { dose_mg: Math.round(doseMg * 10) / 10, freq_per_day: freq, note: "Guideline midpoint" };
}

function buildModelPayload({ drug, weightKg, ageMonths, doseMg, freqPerDay, formulation, facility }) {
    const ref = getDrugRef(drug);
    const wt = Math.max(0, Number(weightKg) || 0);
    const ageM = Math.max(0, Number(ageMonths) || 0);
    const dose = Math.max(0, Number(doseMg) || 0);
    const freq = Math.max(0, Number(freqPerDay) || 0);

    const dailyDoseMg = dose * freq;
    const dosePerKg = wt > 0 ? dose / wt : 0;
    const dailyDosePerKg = wt > 0 ? dailyDoseMg / wt : 0;

    const ageGroup = getAgeGroup(ageM);
    const ageGroupNum = AGE_GROUP_MAP[ageGroup] ?? 3;

    const maxFreq = ref ? Math.max(...(ref.freq_per_day_options || [1])) : 1;
    const maxDose = ref ? ref.max_single_dose_mg : 9999;

    let deviationFromGuideline = 0;
    if (ref && ref.dose_per_kg_min != null && ref.dose_per_kg_max != null) {
        const midpoint = (ref.dose_per_kg_min + ref.dose_per_kg_max) / 2;
        deviationFromGuideline = midpoint > 0 ? (dosePerKg - midpoint) / midpoint : 0;
    }

    const drugClass = ref ? ref.drug_class : "";
    const drugClassNum = CLASS_MAP[drugClass] ?? 0;

    const minAge = ref ? ref.min_age_months : 0;
    const minWt = ref ? ref.min_weight_kg : 0;
    const minTherapeutic = ref && ref.dose_per_kg_min != null ? ref.dose_per_kg_min * wt * 0.4 : 0;

    const payload = {
        weight_kg: wt,
        age_months: ageM,
        age_group_num: ageGroupNum,
        dose_mg: dose,
        freq_per_day: freq,
        daily_dose_mg: dailyDoseMg,
        dose_per_kg: wt > 0 ? dosePerKg : 0,
        daily_dose_per_kg: wt > 0 ? dailyDosePerKg : 0,
        deviation_from_guideline: deviationFromGuideline,
        dose_to_max_ratio: maxDose > 0 ? dose / maxDose : 0,
        dose_zscore: 0, // not available client-side; API/model can compute/learn it
        freq_ratio: maxFreq > 0 ? freq / maxFreq : 0,
        drug_class_num: drugClassNum,
        is_above_max_dose: Number(dose > maxDose),
        is_below_min_therapeutic: Number(dose > 0 && minTherapeutic > 0 && dose < minTherapeutic),
        is_freq_above_guideline: Number(freq > maxFreq),
        is_age_contraindicated: Number(ageM < minAge || wt < minWt),
        is_tablet_split: Number(formulation === "adult_tablet_split"),
        facility_type_num: FACILITY_NUM[facility] ?? 0,
    };

    // Matches `feature_columns.json`: it has `dose_to_max_ratio` and `daily_dose_mg` keys.
    // The API will ignore any extra keys (it reads only FEATURE_COLUMNS), but we keep it tight.
    return payload;
}

function normalizeApiBase(url) {
    return String(url || "").trim().replace(/\/+$/, "");
}

function setApiStatus(text, ok = null) {
    if (!els.apiStatus) return;
    els.apiStatus.textContent = text;
    els.apiStatus.style.color = ok == null ? "" : ok ? "#156a38" : "#8a1111";
}

async function apiHealthCheck(baseUrl) {
    const base = normalizeApiBase(baseUrl);
    if (!base) throw new Error("Missing API base URL");
    const res = await fetch(`${base}/health`, { method: "GET" });
    if (!res.ok) throw new Error(`Health check failed (${res.status})`);
    return await res.json();
}

async function apiPredict(baseUrl, payload) {
    const base = normalizeApiBase(baseUrl);
    if (!base) throw new Error("Missing API base URL");
    const res = await fetch(`${base}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.error ? String(data.error) : `Predict failed (${res.status})`;
        throw new Error(msg);
    }
    return data;
}

function mapApiResponseToUi(apiResponse) {
    // app.py returns: risk_band SAFE/WARNING/DANGER, risk_score, message, recommendation, explainability
    const band = String(apiResponse?.risk_band || "").toUpperCase();
    const score = apiResponse?.risk_score;
    const recommendation = apiResponse?.recommendation || "";
    const message = apiResponse?.message || "";

    const status = band === "SAFE" ? "OK" : band === "WARNING" ? "NEEDS_WORK" : "NOT_OK";
    const title =
        status === "OK"
            ? "Medication looks OK"
            : status === "NEEDS_WORK"
              ? "Needs pharmacist review"
              : "Not OK — revise order";

    const pills = [];
    if (typeof score === "number") pills.push(`Model risk: ${score.toFixed(4)}`);
    if (band) pills.push(`Band: ${band}`);
    if (apiResponse?.risk_level) pills.push(`Level: ${apiResponse.risk_level}`);
    if (apiResponse?.explainability?.key_factor) pills.push(`Key factor: ${apiResponse.explainability.key_factor}`);

    return {
        status,
        title,
        message: [message, recommendation].filter(Boolean).join(" — "),
        pills,
    };
}

function evaluatePrescriptionLocal(input) {
    const p = buildModelPayload(input);
    const drug = input.drug;
    const ref = getDrugRef(drug);

    const reasons = [];
    let status = "OK"; // OK | NEEDS_WORK | NOT_OK

    if (!ref) {
        return {
            status: "NEEDS_WORK",
            title: "Unknown drug reference",
            message: "This demo can’t validate this drug yet. Use the API/model later for full support.",
            modelPayload: p,
            pills: [`Drug: ${drug}`],
        };
    }

    if (p.is_age_contraindicated) {
        status = "NOT_OK";
        reasons.push(`Age/weight contraindication (min ${ref.min_age_months}m, ${ref.min_weight_kg}kg).`);
    }
    if (p.is_above_max_dose) {
        status = "NOT_OK";
        reasons.push(`Dose exceeds max single dose (${ref.max_single_dose_mg}mg).`);
    }
    if (p.is_freq_above_guideline) {
        status = "NOT_OK";
        reasons.push(`Frequency exceeds guideline (${Math.max(...ref.freq_per_day_options)}×/day).`);
    }

    const deviationAbs = Math.abs(p.deviation_from_guideline || 0);
    if (status !== "NOT_OK") {
        if (p.is_below_min_therapeutic) {
            status = "NEEDS_WORK";
            reasons.push("Likely sub-therapeutic dose (below minimum therapeutic band).");
        }
        if (deviationAbs > 0.25) {
            status = "NEEDS_WORK";
            reasons.push("Dose per kg deviates materially from guideline midpoint.");
        }
        if (p.is_tablet_split) {
            status = "NEEDS_WORK";
            reasons.push("Adult tablet split formulation increases dosing error risk.");
        }
    }

    const title =
        status === "OK"
            ? "Medication looks OK"
            : status === "NEEDS_WORK"
              ? "Needs pharmacist review"
              : "Not OK — revise order";

    const message =
        status === "OK"
            ? "Within expected guideline range based on entered age/weight and typical dosing bands."
            : reasons.join(" ");

    const pills = [
        `Dose/kg: ${p.dose_per_kg.toFixed(2)} mg/kg`,
        `Daily: ${p.daily_dose_mg.toFixed(1)} mg`,
        `Freq ratio: ${p.freq_ratio.toFixed(2)}`,
        `Max ratio: ${p.dose_to_max_ratio.toFixed(2)}`,
    ];

    return { status, title, message, modelPayload: p, pills };
}

function setRxResult(result) {
    if (!els.rxResult) return;
    els.rxResult.hidden = false;

    els.rxBadge.classList.remove("rx-badge--warning", "rx-badge--danger");
    if (result.status === "NEEDS_WORK") els.rxBadge.classList.add("rx-badge--warning");
    if (result.status === "NOT_OK") els.rxBadge.classList.add("rx-badge--danger");

    els.rxBadge.textContent =
        result.status === "OK" ? "OK" : result.status === "NEEDS_WORK" ? "NEEDS WORK" : "NOT OK";

    els.rxResultTitle.textContent = result.title;
    els.rxResultMsg.textContent = result.message;
    els.rxMetrics.innerHTML = result.pills.map((p) => `<span class="rx-pill">${escapeHtml(p)}</span>`).join("");
}

function populateDrugSelect() {
    if (!els.rxDrug) return;
    const drugs = Object.keys(DRUG_REFERENCE).sort();
    els.rxDrug.innerHTML = drugs.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d.replaceAll("_", " "))}</option>`).join("");
}

function getRxInputFromForm() {
    return {
        drug: els.rxDrug.value,
        weightKg: Number(els.rxWeight.value),
        ageMonths: Number(els.rxAgeMonths.value),
        doseMg: Number(els.rxDoseMg.value),
        freqPerDay: Number(els.rxFreq.value),
        formulation: els.rxFormulation.value,
        facility: els.rxFacility.value,
    };
}

function fillGuidelineIntoForm() {
    const drug = els.rxDrug.value;
    const wt = Number(els.rxWeight.value);
    const ageM = Number(els.rxAgeMonths.value);
    const g = getGuidelineDose(drug, wt, ageM);
    if (!g) {
        showToast("No guideline rule available for that drug.");
        return;
    }
    els.rxDoseMg.value = String(g.dose_mg);
    els.rxFreq.value = String(g.freq_per_day);
    showToast(`Filled guideline dose (${g.note}).`);
}

function addCurrentRxToPatient(result) {
    const patient = getPatient();
    const drugLabel = els.rxDrug.value.replaceAll("_", " ");
    const meta = `${els.rxDoseMg.value} mg · ${els.rxFreq.value}×/day · ${els.rxWeight.value} kg · ${els.rxAgeMonths.value} m · ${result.status}`;
    patient.prescriptions.unshift({ title: drugLabel, meta });
    renderPatientDetail();
    showToast("Added prescription to patient list.");
}

function wireRx() {
    if (!els.rxForm) return;

    populateDrugSelect();

    els.btnFillGuideline?.addEventListener("click", fillGuidelineIntoForm);

    els.rxForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = getRxInputFromForm();
        const local = evaluatePrescriptionLocal(input);
        const payload = local.modelPayload;

        // Store payload so you can POST it to `/predict`
        els.rxForm.dataset.modelPayload = JSON.stringify(payload);

        if (state.useApi && state.apiBaseUrl) {
            try {
                setApiStatus("Scoring…", null);
                const api = await apiPredict(state.apiBaseUrl, payload);
                const mapped = mapApiResponseToUi(api);
                setRxResult({
                    ...local,
                    status: mapped.status,
                    title: mapped.title,
                    message: mapped.message,
                    pills: [...mapped.pills, ...local.pills],
                });
                setApiStatus("Connected", true);
            } catch (err) {
                setApiStatus(`API error: ${err?.message || err}`, false);
                setRxResult(local);
                showToast("API scoring failed — using local rules.");
            }
        } else {
            setRxResult(local);
        }
    });

    els.btnAddToPatient?.addEventListener("click", () => {
        if (!els.rxForm.dataset.modelPayload) {
            showToast("Evaluate the prescription first.");
            return;
        }
        const input = getRxInputFromForm();
        const result = evaluatePrescriptionLocal(input);
        setRxResult(result);
        addCurrentRxToPatient(result);
    });
}

function renderPatientList(filter = "") {
    const q = filter.trim().toLowerCase();
    const list = PATIENTS.filter(
        (p) =>
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.headlineDiagnosis.toLowerCase().includes(q),
    );

    const grouped = list.filter((p) => state.groups.active === "All" || p.group === state.groups.active);

    els.patientList.innerHTML = list
        .filter((p) => grouped.includes(p))
        .map((p) => {
            const active = p.id === state.currentPatientId ? " active" : "";
            return `<div class="patient${active}" role="listitem" data-patient-id="${escapeHtml(p.id)}" tabindex="0">
                <img src="${escapeHtml(p.avatar)}" alt="">
                <div class="patient-info">
                    <h4>${escapeHtml(p.name)}</h4>
                    <p>${escapeHtml(p.headlineDiagnosis)}</p>
                </div>
                <span class="patient-badge" aria-hidden="true"></span>
            </div>`;
        })
        .join("");

    els.patientList.querySelectorAll(".patient").forEach((row) => {
        row.addEventListener("click", () => selectPatient(row.dataset.patientId));
        row.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectPatient(row.dataset.patientId);
            }
        });
    });
}

function renderPatientDetail() {
    const p = getPatient();

    els.profileImg.src = p.avatarLarge;
    els.profileImg.alt = p.name;
    els.profileName.textContent = p.name;
    els.profileSubtitle.textContent = `${p.headlineDiagnosis} — Latest diagnosis`;

    const topDx = p.diagnoses.slice(0, 3);
    els.diagnosisGrid.innerHTML = topDx
        .map(
            (d) =>
                `<div class="diagnosis">
                    <i class="fas ${escapeHtml(d.icon)}" aria-hidden="true"></i>
                    <h3>${escapeHtml(d.title)}</h3>
                    <p>${escapeHtml(d.date)}</p>
                </div>`,
        )
        .join("");

    els.infoTable.innerHTML = p
        .info.slice(0, 6)
        .map(
            ([label, value]) =>
                `<div class="info-row">
                    <span class="label">${escapeHtml(label)}</span>
                    <span>${escapeHtml(value)}</span>
                </div>`,
        )
        .join("");

    renderSimpleList(els.visitsList, p.visits);
    renderSimpleList(els.labsList, p.labs);
    renderSimpleList(els.prescriptionsList, p.prescriptions);
}

function selectPatient(id) {
    if (!PATIENTS.some((p) => p.id === id)) return;
    state.currentPatientId = id;
    if (state.currentView !== "dashboard") {
        selectAppView("dashboard");
    }
    renderPatientList(els.search.value);
    renderPatientDetail();
    showToast(`Showing record for ${getPatient().name}`);
}

function selectTab(tabId) {
    els.tabs().forEach((tab) => {
        const on = tab.dataset.tab === tabId;
        tab.classList.toggle("active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    els.tabPanels().forEach((panel) => {
        const on = panel.dataset.tab === tabId;
        panel.classList.toggle("tab-panel--active", on);
    });
}

function selectAppView(viewName) {
    state.currentView = viewName;
    els.views().forEach((view) => {
        const on = view.dataset.viewName === viewName;
        view.classList.toggle("app-view--active", on);
        view.setAttribute("aria-hidden", on ? "false" : "true");
    });

    els.navIcons().forEach((btn) => {
        const target = btn.dataset.view;
        if (!target) return;
        btn.classList.toggle("active", target === viewName);
    });
}

function openModal(el) {
    if (!el) return;
    els.modalBackdrop.hidden = false;
    el.hidden = false;
}

function closeModals() {
    [els.modalVideo, els.modalAdd, els.modalDx].forEach((m) => {
        if (m) m.hidden = true;
    });
    if (els.modalBackdrop) els.modalBackdrop.hidden = true;
}

function wireTabs() {
    els.tabs().forEach((tab) => {
        tab.addEventListener("click", () => selectTab(tab.dataset.tab));
    });
}

function wireNav() {
    const go = (v) => {
        selectAppView(v);
        const labels = {
            dashboard: "Patients",
            calendar: "Schedule",
            messages: "Messages",
            notifications: "Notifications",
            settings: "Settings",
        };
        showToast(labels[v] ? `${labels[v]} view` : "View updated");
    };

    document.getElementById("btn-home-logo").addEventListener("click", () => go("dashboard"));

    els.navIcons().forEach((btn) => {
        btn.addEventListener("click", () => {
            const v = btn.dataset.view;
            if (v) go(v);
        });
    });
}

function wireSearch() {
    els.search.addEventListener("input", () => {
        renderPatientList(els.search.value);
    });
}

function wireTopbar() {
    document.getElementById("btn-video").addEventListener("click", () => {
        els.videoPatientName.textContent = getPatient().name;
        openModal(els.modalVideo);
    });

    document.getElementById("btn-add-new").addEventListener("click", () => {
        els.addMedName.value = "";
        els.addMedInstructions.value = "";
        openModal(els.modalAdd);
    });

    document.getElementById("btn-see-all-diagnoses").addEventListener("click", () => {
        const p = getPatient();
        els.diagnosesAllList.innerHTML = p.diagnoses
            .map(
                (d) =>
                    `<li><span class="li-title">${escapeHtml(d.title)}</span><span class="li-meta">${escapeHtml(d.date)}</span></li>`,
            )
            .join("");
        openModal(els.modalDx);
    });

    document.getElementById("btn-join-call").addEventListener("click", () => {
        showToast("Connecting to video visit (demo)…");
        closeModals();
    });

    document.getElementById("btn-save-prescription").addEventListener("click", () => {
        const med = els.addMedName.value.trim();
        const instr = els.addMedInstructions.value.trim();
        if (!med) {
            showToast("Enter a medication name to save.");
            return;
        }
        const p = getPatient();
        p.prescriptions.unshift({
            title: med,
            meta: instr || "Added from dashboard",
        });
        renderPatientDetail();
        showToast("Prescription note added.");
        closeModals();
    });
}

function wireModals() {
    els.modalBackdrop.addEventListener("click", closeModals);
    document.querySelectorAll("[data-close-modal]").forEach((b) => {
        b.addEventListener("click", closeModals);
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModals();
    });
}

function wireSettings() {
    const applyCompact = () => {
        els.sidebar.classList.toggle("patient-list--compact", els.settingCompact.checked);
    };
    els.settingCompact.addEventListener("change", () => {
        applyCompact();
        showToast(els.settingCompact.checked ? "Compact list on" : "Compact list off");
    });
    els.settingSounds.addEventListener("change", () => {
        showToast(els.settingSounds.checked ? "Sounds enabled (demo)" : "Sounds muted");
    });
    applyCompact();

    // API settings (persisted)
    const savedUseApi = localStorage.getItem("mediscript.useApi");
    const savedApiBase = localStorage.getItem("mediscript.apiBaseUrl");
    state.useApi = savedUseApi === "true";
    state.apiBaseUrl = savedApiBase || "";

    if (els.settingUseApi) els.settingUseApi.checked = state.useApi;
    if (els.settingApiBase) els.settingApiBase.value = state.apiBaseUrl;
    setApiStatus(state.useApi ? "Not connected" : "Disabled", null);

    els.settingUseApi?.addEventListener("change", () => {
        state.useApi = Boolean(els.settingUseApi.checked);
        localStorage.setItem("mediscript.useApi", String(state.useApi));
        setApiStatus(state.useApi ? "Not connected" : "Disabled", null);
        showToast(state.useApi ? "API scoring enabled" : "API scoring disabled");
    });

    els.settingApiBase?.addEventListener("change", () => {
        state.apiBaseUrl = normalizeApiBase(els.settingApiBase.value);
        els.settingApiBase.value = state.apiBaseUrl;
        localStorage.setItem("mediscript.apiBaseUrl", state.apiBaseUrl);
        setApiStatus(state.apiBaseUrl ? "Not connected" : "Missing URL", null);
    });

    els.btnApiTest?.addEventListener("click", async () => {
        try {
            setApiStatus("Testing…", null);
            const res = await apiHealthCheck(state.apiBaseUrl);
            state.apiHealthy = true;
            setApiStatus(`Connected (features: ${res.features}, threshold: ${res.threshold})`, true);
            showToast("API health check OK.");
        } catch (err) {
            state.apiHealthy = false;
            setApiStatus(`Not connected: ${err?.message || err}`, false);
            showToast("API health check failed.");
        }
    });
}

function initSecondaryViews() {
    // Old placeholders removed; these views are now rendered below.
}

function formatIsoToLabel(iso) {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function renderCalendar() {
    if (!els.calGrid) return;

    const base = new Date();
    const month = new Date(base.getFullYear(), base.getMonth() + state.calendar.monthOffset, 1);
    const year = month.getFullYear();
    const m = month.getMonth();
    els.calMonthLabel.textContent = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

    const startDow = new Date(year, m, 1).getDay(); // 0 Sun
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const prevDays = new Date(year, m, 0).getDate();

    const cells = [];
    for (let i = 0; i < startDow; i++) {
        const dayNum = prevDays - (startDow - 1 - i);
        cells.push({ muted: true, date: new Date(year, m - 1, dayNum) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ muted: false, date: new Date(year, m, d) });
    }
    while (cells.length % 7 !== 0) {
        const last = cells[cells.length - 1].date;
        cells.push({ muted: true, date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1) });
    }

    const apptByIso = new Set(APPOINTMENTS.map((a) => a.dateIso));

    els.calGrid.innerHTML = cells
        .map((c) => {
            const iso = c.date.toISOString().slice(0, 10);
            const has = apptByIso.has(iso);
            return `<button type="button" class="cal-day${c.muted ? " cal-day--muted" : ""}" data-iso="${iso}">
                <div class="cal-day__num">${c.date.getDate()}</div>
                ${has ? `<span class="cal-dot" aria-hidden="true"></span>` : ""}
            </button>`;
        })
        .join("");

    els.calGrid.querySelectorAll(".cal-day").forEach((b) => {
        b.addEventListener("click", () => {
            state.calendar.selectedDateIso = b.dataset.iso;
            renderAgenda();
        });
    });
}

function renderAgenda() {
    if (!els.agendaList) return;
    const selected = state.calendar.selectedDateIso;
    const filter = state.calendar.filter;

    const list = APPOINTMENTS.filter((a) => {
        if (selected && a.dateIso !== selected) return false;
        if (filter !== "all" && a.type !== filter) return false;
        return true;
    }).sort((a, b) => (a.dateIso + a.time).localeCompare(b.dateIso + b.time));

    els.agendaTitle.textContent = selected ? `Agenda · ${formatIsoToLabel(selected)}` : "Agenda";

    if (list.length === 0) {
        els.agendaList.innerHTML = `<div class="list-item"><div class="list-item__desc">No appointments for this selection.</div></div>`;
        return;
    }

    els.agendaList.innerHTML = list
        .map(
            (a) => `<div class="list-item" data-apt-id="${escapeHtml(a.id)}">
                <div class="list-item__top">
                    <div class="list-item__title">${escapeHtml(a.title)}</div>
                    <div class="list-item__meta">${escapeHtml(a.time)}</div>
                </div>
                <div class="list-item__desc">${escapeHtml(a.who)} · ${escapeHtml(formatIsoToLabel(a.dateIso))} · ${escapeHtml(a.type)}</div>
            </div>`,
        )
        .join("");

    els.agendaList.querySelectorAll(".list-item").forEach((row) => {
        row.addEventListener("click", () => {
            const apt = APPOINTMENTS.find((x) => x.id === row.dataset.aptId);
            if (!apt) return;
            showToast(`Appointment: ${apt.title} (${apt.time})`);
        });
    });
}

function wireCalendar() {
    els.btnCalToday?.addEventListener("click", () => {
        state.calendar.monthOffset = 0;
        state.calendar.selectedDateIso = new Date().toISOString().slice(0, 10);
        renderCalendar();
        renderAgenda();
    });
    els.btnCalPrev?.addEventListener("click", () => {
        state.calendar.monthOffset -= 1;
        renderCalendar();
    });
    els.btnCalNext?.addEventListener("click", () => {
        state.calendar.monthOffset += 1;
        renderCalendar();
    });
    els.btnCalNew?.addEventListener("click", () => {
        showToast("New appointment (demo).");
    });
    document.querySelectorAll("[data-cal-filter]").forEach((chip) => {
        chip.addEventListener("click", () => {
            document.querySelectorAll("[data-cal-filter]").forEach((c) => c.classList.remove("chip--active"));
            chip.classList.add("chip--active");
            state.calendar.filter = chip.dataset.calFilter;
            renderAgenda();
        });
    });
}

function renderInbox() {
    if (!els.msgInbox) return;

    const q = (state.messages.query || "").trim().toLowerCase();
    const threads = MESSAGE_THREADS.filter((t) => !q || t.title.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q));

    const unread = MESSAGE_THREADS.filter((t) => t.unread).length;
    if (els.msgUnreadCount) els.msgUnreadCount.textContent = String(unread);

    els.msgInbox.innerHTML = threads
        .map((t) => {
            const active = t.id === state.messages.activeThreadId;
            return `<div class="list-item${active ? " list-item--active" : ""}" data-thread-id="${escapeHtml(t.id)}">
                <div class="list-item__top">
                    <div class="list-item__title">${escapeHtml(t.title)}${t.unread ? " · <span class=\"badge\">New</span>" : ""}</div>
                    <div class="list-item__meta">${escapeHtml(t.updated)}</div>
                </div>
                <div class="list-item__desc">${escapeHtml(t.preview)}</div>
            </div>`;
        })
        .join("");

    els.msgInbox.querySelectorAll(".list-item").forEach((row) => {
        row.addEventListener("click", () => {
            state.messages.activeThreadId = row.dataset.threadId;
            renderInbox();
            renderThread();
        });
    });
}

function renderThread() {
    if (!els.msgThread) return;
    const t = MESSAGE_THREADS.find((x) => x.id === state.messages.activeThreadId);
    if (!t) {
        els.msgThreadTitle.textContent = "Select a conversation";
        els.msgThread.innerHTML = "";
        return;
    }
    els.msgThreadTitle.textContent = t.title;
    els.msgThread.innerHTML = t.messages
        .map((m) => {
            const me = m.from === "Me";
            return `<div class="bubble${me ? " bubble--me" : ""}">
                <div>${escapeHtml(m.text)}</div>
                <div class="bubble__meta">${escapeHtml(m.from)} · ${escapeHtml(m.meta)}</div>
            </div>`;
        })
        .join("");
}

function wireMessages() {
    els.msgSearch?.addEventListener("input", () => {
        state.messages.query = els.msgSearch.value;
        renderInbox();
    });
    els.btnMsgNew?.addEventListener("click", () => showToast("New message (demo)."));
    els.btnMsgSend?.addEventListener("click", () => {
        const t = MESSAGE_THREADS.find((x) => x.id === state.messages.activeThreadId);
        const text = String(els.msgCompose?.value || "").trim();
        if (!t) return showToast("Select a conversation first.");
        if (!text) return showToast("Type a message to send.");
        t.messages.push({ from: "Me", text, meta: "Just now" });
        t.preview = text;
        t.updated = "Now";
        els.msgCompose.value = "";
        renderThread();
        renderInbox();
    });
    els.btnMsgMarkRead?.addEventListener("click", () => {
        const t = MESSAGE_THREADS.find((x) => x.id === state.messages.activeThreadId);
        if (!t) return;
        t.unread = false;
        renderInbox();
        showToast("Marked as read.");
    });
    els.btnMsgArchive?.addEventListener("click", () => {
        const idx = MESSAGE_THREADS.findIndex((x) => x.id === state.messages.activeThreadId);
        if (idx < 0) return;
        MESSAGE_THREADS.splice(idx, 1);
        state.messages.activeThreadId = MESSAGE_THREADS[0]?.id || null;
        renderInbox();
        renderThread();
        showToast("Archived.");
    });
}

function renderNotifications() {
    const today = NOTIFS.filter((n) => n.when === "today");
    const earlier = NOTIFS.filter((n) => n.when === "earlier");

    const render = (arr) =>
        arr
            .map(
                (n) => `<div class="list-item" data-notif-id="${escapeHtml(n.id)}">
                    <div class="list-item__top">
                        <div class="list-item__title">${escapeHtml(n.title)}</div>
                        <div class="list-item__meta">${escapeHtml(n.meta)}</div>
                    </div>
                    <div class="list-item__desc">${escapeHtml(n.desc)}</div>
                </div>`,
            )
            .join("");

    if (els.notifToday) els.notifToday.innerHTML = render(today);
    if (els.notifEarlier) els.notifEarlier.innerHTML = render(earlier);
}

function wireNotifications() {
    els.btnNotifClear?.addEventListener("click", () => {
        NOTIFS.length = 0;
        renderNotifications();
        showToast("Cleared notifications.");
    });
}

function init() {
    wireTabs();
    wireNav();
    wireSearch();
    wireTopbar();
    wireModals();
    wireSettings();
    wireRx();
    wireCalendar();
    wireMessages();
    wireNotifications();
    wireGroups();
    initSecondaryViews();
    renderPatientList();
    renderPatientDetail();
    selectTab("patient-info");
    selectAppView("dashboard");
    setSidebarDate();

    // Initial render for views
    state.calendar.selectedDateIso = new Date().toISOString().slice(0, 10);
    renderCalendar();
    renderAgenda();
    state.messages.activeThreadId = MESSAGE_THREADS[0]?.id || null;
    renderInbox();
    renderThread();
    renderNotifications();
}

init();
