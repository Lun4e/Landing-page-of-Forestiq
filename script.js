/**
 * FORESTIQ — Landing Page Interactive Scripts
 * Features:
 * - Bilingual Language Switcher (ID / EN)
 * - Sticky Glassmorphism Navbar
 * - Mobile Navigation Drawer
 * - IntersectionObserver Scroll Animations
 * - Real-time IoT Telemetry & FHI Simulator
 * - Interactive Prototype Screen Tab Viewer
 * - B2B Consultation / Pilot Modal Handler
 */

// ==========================================
// 1. BILINGUAL LANGUAGE SWITCHER (ID / EN)
// ==========================================
let currentLang = 'id';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('forestiq_lang', lang);

  // Update navbar language toggles
  document.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes(lang));
  });

  // Switch all elements with data-lang attributes
  document.querySelectorAll('[data-lang-en][data-lang-id]').forEach(el => {
    const text = el.getAttribute(`data-lang-${lang}`);
    if (text) {
      el.textContent = text;
    }
  });

  // Re-trigger simulator AI recommendation in current language
  updateSimulator();
  // Re-render prototype tab content in current language
  renderPrototypeScreen(currentProtoIndex);
}

// ==========================================
// 2. NAVBAR SCROLL & MOBILE DRAWER
// ==========================================
const navbar = document.getElementById('navbar');
const navHamburger = document.getElementById('navHamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

function toggleMobileNav() {
  const isActive = mobileNav.classList.toggle('active');
  mobileOverlay.classList.toggle('active', isActive);
  navHamburger.classList.toggle('active', isActive);
  document.body.style.overflow = isActive ? 'hidden' : '';
}

function closeMobileNav() {
  mobileNav.classList.remove('active');
  mobileOverlay.classList.remove('active');
  navHamburger.classList.remove('active');
  document.body.style.overflow = '';
}

if (navHamburger) navHamburger.addEventListener('click', toggleMobileNav);
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

// Close mobile nav on link click
document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

// ==========================================
// 3. INTERSECTION OBSERVER SCROLL REVEAL
// ==========================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children').forEach(el => {
  revealObserver.observe(el);
});

// ==========================================
// 4. REAL-TIME IOT TELEMETRY & FHI SIMULATOR
// ==========================================
const tempSlider = document.getElementById('tempSlider');
const humSlider = document.getElementById('humSlider');
const soilSlider = document.getElementById('soilSlider');
const drySlider = document.getElementById('drySlider');

const tempVal = document.getElementById('tempVal');
const humVal = document.getElementById('humVal');
const soilVal = document.getElementById('soilVal');
const dryVal = document.getElementById('dryVal');

const fhiOutput = document.getElementById('fhiOutput');
const fhiBadge = document.getElementById('fhiBadge');
const riskOutput = document.getElementById('riskOutput');
const riskBadge = document.getElementById('riskBadge');
const recBox = document.getElementById('recBox');
const recTitle = document.getElementById('recTitle');
const recText = document.getElementById('recText');

function updateSimulator() {
  if (!tempSlider) return;

  const temp = parseFloat(tempSlider.value);
  const hum = parseFloat(humSlider.value);
  const soil = parseFloat(soilSlider.value);
  const dry = parseInt(drySlider.value);

  // Update label displays
  tempVal.textContent = `${temp}°C`;
  humVal.textContent = `${hum}%`;
  soilVal.textContent = `${soil}%`;

  const dryLabels = currentLang === 'en'
    ? ['Low', 'Moderate', 'Elevated', 'High', 'Extreme']
    : ['Rendah', 'Sedang', 'Meningkat', 'Tinggi', 'Ekstrim'];
  dryVal.textContent = dryLabels[dry - 1] || 'Low';

  // Scientific-approximated calculation for FHI (Forest Health Index: 0-100)
  // Optimal: Temp 25-28C, Hum 70-85%, Soil 65-80%, Dry factor 1
  let fhi = 100;

  // Temperature penalty (ideal 25°C, penalty rises rapidly above 32°C)
  if (temp > 28) {
    fhi -= (temp - 28) * 2.8;
  }

  // Humidity penalty (ideal 70%, penalty if below 55%)
  if (hum < 70) {
    fhi -= (70 - hum) * 0.7;
  }

  // Soil moisture penalty (ideal 65%, penalty if dry)
  if (soil < 65) {
    fhi -= (65 - soil) * 0.8;
  }

  // Vegetation dryness penalty
  fhi -= (dry - 1) * 8;

  fhi = Math.round(Math.max(12, Math.min(98, fhi)));

  // Fire Risk probability inversely proportional to FHI with heat amplifier
  let risk = Math.round(100 - fhi * 0.88 - (soil * 0.12));
  if (temp >= 36) risk += 10;
  if (hum <= 30) risk += 12;
  risk = Math.max(8, Math.min(96, risk));

  fhiOutput.textContent = fhi;
  riskOutput.textContent = risk;

  // Visual states based on calculated risk
  if (risk >= 75) {
    // Extreme / High Risk
    riskOutput.style.color = '#EF4444';
    riskBadge.className = 'badge alert';
    riskBadge.textContent = currentLang === 'en' ? 'Critical Fire Risk' : 'Risiko Karhutla Kritis';

    fhiBadge.className = 'badge alert';
    fhiBadge.textContent = currentLang === 'en' ? 'Severe Stress' : 'Vegetasi Kritis';

    recBox.className = 'sim-recommendation-box alert';
    recTitle.textContent = currentLang === 'en' ? '⚠️ WARNING: Imminent Wildfire Threat' : '⚠️ PERINGATAN: Potensi Karhutla Tinggi';
    recText.textContent = currentLang === 'en'
      ? `Critical threshold breach detected: Ambient heat (${temp}°C) and arid soil (${soil}%) induce hyper-dry fuel beds. AI recommends: Immediately elevate patrol readiness in priority sector, deploy drone thermal scouting, and notify CDK / Manggala Agni.`
      : `Ambang batas kritis terlampaui: Suhu ekstrem (${temp}°C) serta tanah kering (${soil}%) meningkatkan potensi terbakar. AI merekomendasikan: Tingkatkan frekuensi patroli di sektor terindikasi, siagakan regu pemadam Manggala Agni, dan verifikasi drone termal.`;
  } else if (risk >= 45) {
    // Moderate / Elevated Risk
    riskOutput.style.color = '#F59E0B';
    riskBadge.className = 'badge';
    riskBadge.style.background = 'rgba(245, 158, 11, 0.2)';
    riskBadge.style.color = '#FBBF24';
    riskBadge.textContent = currentLang === 'en' ? 'Moderate Risk' : 'Risiko Sedang';

    fhiBadge.className = 'badge';
    fhiBadge.style.background = 'rgba(245, 158, 11, 0.2)';
    fhiBadge.style.color = '#FBBF24';
    fhiBadge.textContent = currentLang === 'en' ? 'Mild Stress' : 'Vegetasi Mengering';

    recBox.className = 'sim-recommendation-box';
    recBox.style.borderLeftColor = '#F59E0B';
    recTitle.textContent = currentLang === 'en' ? '⚡ Advisory: Elevated Canopy Dryness' : '⚡ Peringatan Dini: Peningkatan Risiko';
    recText.textContent = currentLang === 'en'
      ? `Microclimate is transitioning toward dehydration. Soil moisture is declining (${soil}%). AI recommends: Increase IoT telemetry frequency to 5-minute intervals and survey ground patrol corridors.`
      : `Kondisi mikroklimat mulai mengering dengan kelembapan tanah turun ke ${soil}%. AI merekomendasikan: Naikkan interval pembacaan sensor menjadi 5 menit sekali dan optimalkan pengawasan pada blok perbatasan.`;
  } else {
    // Normal / Optimal
    riskOutput.style.color = '#34D399';
    riskBadge.className = 'badge';
    riskBadge.style.background = 'rgba(16, 185, 129, 0.2)';
    riskBadge.style.color = '#34D399';
    riskBadge.textContent = currentLang === 'en' ? 'Low Risk' : 'Risiko Rendah';

    fhiBadge.className = 'badge';
    fhiBadge.style.background = 'rgba(16, 185, 129, 0.2)';
    fhiBadge.style.color = '#34D399';
    fhiBadge.textContent = currentLang === 'en' ? 'Optimal Condition' : 'Kondisi Optimal';

    recBox.className = 'sim-recommendation-box';
    recBox.style.borderLeftColor = '#00F5A0';
    recTitle.textContent = currentLang === 'en' ? 'AI System Status: Normal' : 'Status Sistem AI: Normal';
    recText.textContent = currentLang === 'en'
      ? `Microclimate parameters indicate resilient canopy hydration and safe ambient thermal levels. Routine periodic sensor polling active across monitored sectors.`
      : `Parameter mikroklimat menunjukkan hidrasi kanopi hutan stabil dan suhu lingkungan aman. Pemantauan rutin berkala berjalan normal di seluruh sektor.`;
  }
}

[tempSlider, humSlider, soilSlider, drySlider].forEach(slider => {
  if (slider) slider.addEventListener('input', updateSimulator);
});

// ==========================================
// 5. INTERACTIVE PROTOTYPE SCREEN VIEWER
// ==========================================
let currentProtoIndex = 0;

const prototypeScreens = [
  // Screen 0: Forest Intelligence Dashboard
  {
    img: "assets/images/proto_dashboard.png",
    title_id: "Forest Intelligence Dashboard & Map",
    title_en: "Forest Intelligence Dashboard & Map",
    desc_id: "Layar beranda utama yang memberikan pandangan holistik kondisi hutan secara real-time. Dilengkapi skor Forest Health Index (91/100 FHI), grafik tren hidrasi kanopi, indikator Fire Risk (28/100), Forest Change (Normal), Risk Zone (4), serta Peta Vektor Hutan interaktif zonasi risiko (Zone 01 - Zone 08).",
    desc_en: "Primary executive home screen offering holistic real-time forest situational awareness. Features Forest Health Index (FHI 91/100), live microclimate wave telemetry, rapid indicators (Fire Risk 28/100, Normal Change, Risk Zone 4), and an Interactive Multi-Zone Vector Map (Zone 01 to Zone 08).",
    bullets_id: [
      "Live status telemetri 'System Online' dengan sinkronisasi waktu berkala.",
      "Tiga kartu status esensial: Fire Risk (28/100), Forest Change (Normal), dan Risk Zone.",
      "Peta poligon interaktif berlabel dengan kode warna bahaya: Hijau (Low), Kuning (Medium), Merah (High)."
    ],
    bullets_en: [
      "Live telemetry indicator 'System Online' with real-time sync.",
      "Three essential status cards: Fire Risk (28/100), Forest Change (Normal), and Active Risk Zones.",
      "Interactive multi-polygon forest map color-coded by threat: Green (Low), Yellow (Med), Red (High)."
    ]
  },

  // Screen 1: AI Risk Warning Detected (Zone 07)
  {
    img: "assets/images/proto_warning.png",
    title_id: "AI Risk Warning Detected (Zone 07)",
    title_en: "AI Risk Warning Detected (Zone 07)",
    desc_id: "Layar peringatan darurat saat AI mendeteksi lonjakan risiko signifikan pada suatu sektor (seperti Zone 07: Fire Risk melonjak dari 52 menjadi 87). Menyajikan rincian anomali multi-faktor (suhu naik, kelembapan turun, kelembapan tanah turun, kekeringan vegetasi naik), proyeksi bahaya, serta rekomendasi penanganan.",
    desc_en: "Emergency warning screen when AI detects an imminent hazard spike in a sector (such as Zone 07: Fire Risk surging from 52 to 87). Breaks down multi-variable microclimate drivers (rising temperature, declining humidity & soil moisture, arid vegetation), hazard projections, and priority containment.",
    bullets_id: [
      "Banner peringatan mencolok 'WARNING DETECTED' dengan indikator zona spesifik.",
      "Perhitungan perubahan risiko real-time: Fire Risk meningkat 52 → 87.",
      "Rekomendasi instan untuk meningkatkan intensitas pengawasan dan verifikasi lapangan segera."
    ],
    bullets_en: [
      "High-visibility 'WARNING DETECTED' alert banner with localized sector tagging.",
      "Quantified danger trajectory: Fire Risk surge from 52 → 87.",
      "Instant tactical advisory to immediately ramp up patrol frequency and verify ground conditions."
    ]
  },

  // Screen 2: Forest Change Alert (Zone 12)
  {
    img: "assets/images/proto_change.png",
    title_id: "Environmental Change Detection (Zone 12)",
    title_en: "Environmental Change Detection (Zone 12)",
    desc_id: "Layar deteksi perubahan tutupan hutan dan deforestasi yang menggabungkan citra satelit resolusi tinggi dengan data telemetri. Menunjukkan perbandingan luas tutupan sebelumnya (98.4 ha) dengan deteksi terkini (93.7 ha), mengidentifikasi pengurangan kanopi 4.7 ha (-4.77%), dan mengeluarkan status 'Requires Field Verification'.",
    desc_en: "Forest cover alteration and canopy degradation detector fusing high-resolution satellite imagery with ground telemetry. Compares baseline forest cover (98.4 ha) with current reading (93.7 ha), isolates an abrupt 4.7 ha canopy loss (-4.77%), and tags status for immediate field ground-truthing.",
    bullets_id: [
      "Pelacakan luas tutupan hutan otomatis per catchment area (Zone 12 East Sector Catchment).",
      "Perhitungan akurat defisit kanopi: 4.7 ha area change (-4.77%).",
      "Status kepatuhan operasional: 'Requires Field Verification' untuk patroli ranger."
    ],
    bullets_en: [
      "Automated acreage tracking per catchment sector (Zone 12 East Sector Catchment).",
      "High-precision canopy loss calculation: 4.7 ha area change (-4.77%).",
      "Field compliance tagging: 'Requires Field Verification' for ranger dispatch."
    ]
  },

  // Screen 3: AI Recommendation (Priority Zone 07)
  {
    img: "assets/images/proto_recommendation.png",
    title_id: "Predictive AI Recommendations (Priority Zone 07)",
    title_en: "Predictive AI Recommendations (Priority Zone 07)",
    desc_id: "Layar aksi cerdas yang mengubah data mentah telemetri sensor menjadi tindakan pencegahan terukur. Menyajikan prioritas penanganan (Priority Zone: Zone 07, Risk: 🔴 87/100), checklist tindakan lapangan yang direkomendasikan, serta estimasi dampak potensial (deteksi lebih dini, respons lebih cepat, alokasi sumber daya lebih terarah).",
    desc_en: "Decision-intelligence screen translating raw telemetry streams into concrete tactical interventions. Highlights priority hotspots (Zone 07, Risk: 🔴 87/100), field ranger action checklists, and quantified impact (earlier detection, rapid response, targeted resource allocation).",
    bullets_id: [
      "Penentuan zona prioritas otomatis berdasarkan probabilitas risiko tertinggi (Risk: 87/100).",
      "Checklist aksi operasional: verifikasi lapangan, peningkatan frekuensi patroli, dan monitoring lingkungan intensif.",
      "Estimasi dampak nyata: earlier detection, faster response, more targeted field resources."
    ],
    bullets_en: [
      "Automated priority zoning driven by predictive machine learning danger models (Risk: 87/100).",
      "Actionable operational checklist: conduct field verification, increase patrol priority, monitor environmental conditions.",
      "Tangible operational impact: earlier detection, faster response, more targeted field resources."
    ]
  },

  // Screen 4: User & Concession Profile
  {
    img: "assets/images/proto_profile.png",
    title_id: "Concession User Profile & Governance (Cristiano Ifil)",
    title_en: "Concession User Profile & Governance (Cristiano Ifil)",
    desc_id: "Layar manajemen data akun pengguna dan organisasi kehutanan (sebagaimana dirancang pada prototype Cristiano Ifil, mitra Cabang Dinas Kehutanan). Mengatur hak akses tim pengawas, integrasi keamanan autentikasi, serta verifikasi identitas pengelola konsesi.",
    desc_en: "Organizational credential and governance screen (reflecting the Cristiano Ifil prototype design, Forestry partner). Manages administrative privileges, credential encryption, and verified institutional jurisdiction access.",
    bullets_id: [
      "Manajemen kredensial terpusat untuk kepala dinas, manajer konsesi, dan komandan regu patroli.",
      "Enkripsi akun standar B2B SaaS dengan autentikasi berbasis peran (Role-Based Access Control).",
      "Koneksi langsung dengan sistem pelaporan Dinas Kehutanan dan instansi terkait."
    ],
    bullets_en: [
      "Centralized credential management for forestry directors, concession managers, and patrol commanders.",
      "Enterprise-grade B2B SaaS role-based authentication and secure data transmission.",
      "Direct synchronization with regional forestry registries and national reporting channels."
    ]
  }
];

function renderPrototypeScreen(index) {
  const data = prototypeScreens[index];
  if (!data) return;

  const imgEl = document.getElementById('protoActiveImg');
  const titleEl = document.getElementById('protoDescTitle');
  const paraEl = document.getElementById('protoDescPara');
  const bulletsEl = document.getElementById('protoDescBullets');

  if (imgEl) {
    imgEl.style.opacity = '0.3';
    imgEl.style.transform = 'scale(0.97)';
    setTimeout(() => {
      imgEl.src = data.img;
      imgEl.alt = currentLang === 'en' ? data.title_en : data.title_id;
      imgEl.style.opacity = '1';
      imgEl.style.transform = 'scale(1)';
    }, 120);
  }

  if (titleEl) titleEl.textContent = currentLang === 'en' ? data.title_en : data.title_id;
  if (paraEl) paraEl.textContent = currentLang === 'en' ? data.desc_en : data.desc_id;

  if (bulletsEl) {
    const list = currentLang === 'en' ? data.bullets_en : data.bullets_id;
    bulletsEl.innerHTML = list.map(item => `
      <li>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${item}</span>
      </li>
    `).join('');
  }
}

function switchProtoTab(index) {
  currentProtoIndex = index;
  document.querySelectorAll('.proto-tab-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === index);
  });
  renderPrototypeScreen(index);
}

function openScreenZoom(index) {
  const data = prototypeScreens[index];
  if (!data) return;
  const modalImg = document.getElementById('zoomModalImg');
  const modalTitle = document.getElementById('zoomModalTitle');
  if (modalImg) modalImg.src = data.img;
  if (modalTitle) modalTitle.textContent = currentLang === 'en' ? data.title_en : data.title_id;
  openModal('screenZoomModal');
}

// ==========================================
// 6. MODAL HANDLERS & CONSULTATION FORM
// ==========================================
function openModal(modalId, preselectedPlan = '') {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (preselectedPlan && modalId === 'demoModal') {
      const planSelect = document.getElementById('formPlan');
      if (planSelect) planSelect.value = preselectedPlan;
    }
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking outside card or pressing ESC
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    closeMobileNav();
    document.body.style.overflow = '';
  }
});

function openOriginalModal() {
  openModal('originalProtoModal');
}

function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('formName').value;
  const org = document.getElementById('formOrg').value;
  const plan = document.getElementById('formPlan').value;

  const msg = currentLang === 'en'
    ? `Thank you, ${name}! Your consultation request for ${org} (${plan} Package) has been submitted. Our forestry technical team will contact your official email shortly.`
    : `Terima kasih, ${name}! Permohonan konsultasi untuk ${org} (Paket ${plan}) berhasil dikirim. Tim teknis kehutanan kami akan segera menghubungi Anda.`;

  alert(msg);
  closeModal('demoModal');
  e.target.reset();
}

// ==========================================
// 7. INITIALIZATION ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Load saved language or default to ID
  const savedLang = localStorage.getItem('forestiq_lang') || 'id';
  setLanguage(savedLang);

  // Initialize prototype screen
  renderPrototypeScreen(0);

  // Initialize simulator
  updateSimulator();
});
