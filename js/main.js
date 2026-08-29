/**
 * KHOJI NEPAL — Rasuwa Flood Information & Response Platform
 * Main Data Store, Global Helpers & State Management (Vanilla JS)
 */

window.KhojiStore = {
  currentLang: localStorage.getItem('khoji_lang') || 'en',
  
  // Realistically curated Rasuwa Flood Demo Data
  stats: {
    missing: 1248,
    rescued: 3521,
    reliefCenters: 86,
    activeRequests: 157,
    deceased: 278,
    lastUpdated: '29 Aug 2026, 10:45 AM'
  },

  missingPersons: [
    {
      id: "MP-2026-001",
      name: "Suvas Phuyal",
      nameNe: "सुवास फुयाल",
      age: 27,
      gender: "Male",
      genderNe: "पुरुष",
      location: "Timure, Rasuwa",
      locationNe: "टिमुरे, रसुवा",
      missingDate: "28 Aug 2026",
      status: "Missing",
      statusNe: "हराइरहेको",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      description: "Last seen near the Timure customs checkpoint wearing a black jacket and blue jeans during the flash flood.",
      contactPerson: "Ram Phuyal (Brother) - 9841234567"
    },
    {
      id: "MP-2026-002",
      name: "Sushmita Kunwar",
      nameNe: "सुस्मिता कुँवर",
      age: 23,
      gender: "Female",
      genderNe: "महिला",
      location: "Syabrubesi, Rasuwa",
      locationNe: "स्याफ्रुबेसी, रसुवा",
      missingDate: "28 Aug 2026",
      status: "Missing",
      statusNe: "हराइरहेको",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      description: "Was at the Syabrubesi market area near the river bank. Wearing a red kurtha suruwal.",
      contactPerson: "Gita Kunwar (Mother) - 9851098765"
    },
    {
      id: "MP-2026-003",
      name: "Subindra Nepali",
      nameNe: "सुबिन्द्र नेपाली",
      age: 31,
      gender: "Male",
      genderNe: "पुरुष",
      location: "Bhotekoshi, Rasuwa",
      locationNe: "भोटेकोशी, रसुवा",
      missingDate: "27 Aug 2026",
      status: "Missing",
      statusNe: "हराइरहेको",
      photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      description: "Truck driver stranded during landslide. Vehicle found near Ghattekhola bridge.",
      contactPerson: "Bikash Nepali (Cousin) - 9812345678"
    },
    {
      id: "MP-2026-004",
      name: "Pasang Lhamu Tamang",
      nameNe: "पासाङ ल्हामु तामाङ",
      age: 45,
      gender: "Female",
      genderNe: "महिला",
      location: "Gatlang, Rasuwa",
      locationNe: "गत्लाङ, रसुवा",
      missingDate: "28 Aug 2026",
      status: "Under Verification",
      statusNe: "प्रमाणीकरणमा",
      photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      description: "Reported rescued at Dhunche camp, biometric verification currently underway by Nepal Red Cross.",
      contactPerson: "Dawa Tamang (Son) - 9801122334"
    },
    {
      id: "MP-2026-005",
      name: "Mingmar Sherpa",
      nameNe: "मिङ्मार शेर्पा",
      age: 34,
      gender: "Male",
      genderNe: "पुरुष",
      location: "Langtang Trail, Rasuwa",
      locationNe: "लाङटाङ पदमार्ग, रसुवा",
      missingDate: "28 Aug 2026",
      status: "Rescued",
      statusNe: "उद्धार गरिएको",
      photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      description: "Airlifted by Nepali Army helicopter to Dhunche Military Base Hospital. Stable condition.",
      contactPerson: "Army Liaison Office - 101"
    },
    {
      id: "MP-2026-006",
      name: "Aarati Shrestha",
      nameNe: "आरती श्रेष्ठ",
      age: 19,
      gender: "Female",
      genderNe: "महिला",
      location: "Dhunche Bazar, Rasuwa",
      locationNe: "धुन्चे बजार, रसुवा",
      missingDate: "29 Aug 2026",
      status: "Found",
      statusNe: "भेटिएको",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      description: "Sheltered at Community Hall, Dhunche. Safely in touch with family.",
      contactPerson: "Dhunche Ward Office"
    }
  ],

  reliefCenters: [
    {
      id: "RC-01",
      name: "Syabrubesi Relief Center",
      nameNe: "स्याफ्रुबेसी राहत केन्द्र",
      location: "Syabrubesi, Rasuwa",
      locationNe: "स्याफ्रुबेसी, रसुवा",
      supplies: "Food, Water, Medicine",
      suppliesNe: "खाना, पानी, औषधि",
      status: "available",
      distance: "2.3 km",
      managedBy: "Nepal Red Cross & District Administration",
      phone: "+977-10-540122",
      capacity: "500 people"
    },
    {
      id: "RC-02",
      name: "Timure Relief Point",
      nameNe: "टिमुरे राहत स्थल",
      location: "Timure, Rasuwa",
      locationNe: "टिमुरे, रसुवा",
      supplies: "Food, Water, Blankets",
      suppliesNe: "खाना, पानी, कम्बल",
      status: "limited",
      distance: "5.7 km",
      managedBy: "Armed Police Force (APF) Base",
      phone: "+977-10-540199",
      capacity: "250 people"
    },
    {
      id: "RC-03",
      name: "Bhotekoshi Relief Camp",
      nameNe: "भोटेकोशी राहत शिविर",
      location: "Bhotekoshi, Rasuwa",
      locationNe: "भोटेकोशी, रसुवा",
      supplies: "Food, Water, Medicine",
      suppliesNe: "खाना, पानी, औषधि",
      status: "available",
      distance: "8.9 km",
      managedBy: "Nepali Army Disaster Response Unit",
      phone: "+977-10-540144",
      capacity: "800 people"
    },
    {
      id: "RC-04",
      name: "Dhunche High School Shelter",
      nameNe: "धुन्चे मावि अस्थायी आवास",
      location: "Dhunche, Rasuwa",
      locationNe: "धुन्चे, रसुवा",
      supplies: "Full Ration, Medical, Warm Clothes",
      suppliesNe: "रासन, स्वास्थ्य, न्यानो लुगा",
      status: "available",
      distance: "12.4 km",
      managedBy: "Gosaikunda Rural Municipality",
      phone: "+977-10-540111",
      capacity: "600 people"
    }
  ],

  governmentUpdates: [
    {
      id: "GOV-01",
      organization: "Government of Nepal",
      orgNe: "नेपाल सरकार",
      date: "29 Aug 2026, 10:30 AM",
      isNew: true,
      title: "Helicopter search and rescue deployed to upper Rasuwa river belt",
      titleNe: "रसुवाको माथिल्लो नदी तटीय क्षेत्रमा हेलिकप्टरबाट उद्धार जारी",
      description: "Search and rescue operations continue in Rasuwa district. Helicopters deployed by Nepali Army to airlift stranded victims from Timure.",
      emblem: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/200px-Emblem_of_Nepal.svg.png"
    },
    {
      id: "GOV-02",
      organization: "NDRRMA",
      orgNe: "राष्ट्रिय विपद् जोखिम न्यूनीकरण तथा व्यवस्थापन प्राधिकरण",
      date: "29 Aug 2026, 09:45 AM",
      isNew: true,
      title: "Relief distribution mobilized for 8 affected village clusters",
      titleNe: "प्रभावित ८ वटा बस्तीमा राहत सामग्री परिचालन",
      description: "Relief distribution is ongoing in affected areas. More teams mobilized with emergency drinking water purification units.",
      emblem: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/200px-Emblem_of_Nepal.svg.png"
    },
    {
      id: "GOV-03",
      organization: "Nepal Police",
      orgNe: "नेपाल प्रहरी",
      date: "29 Aug 2026, 09:20 AM",
      isNew: false,
      title: "Information regarding missing persons: Contact 100 or local posts",
      titleNe: "हराएका व्यक्तिहरूको सूचना नजिकको प्रहरी कार्यालय वा १०० मा दिनुहोस्",
      description: "Information regarding missing persons please contact local police stations or dial 100. Emergency verification desks set up at all checkpoints.",
      emblem: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/200px-Emblem_of_Nepal.svg.png"
    }
  ],

  emergencyContacts: [
    { agency: "Nepal Police", agencyNe: "नेपाल प्रहरी", number: "100", icon: "shield" },
    { agency: "Armed Police Force", agencyNe: "सशस्त्र प्रहरी बल", number: "103", icon: "shield-alert" },
    { agency: "Nepal Army Disaster Cell", agencyNe: "नेपाली सेना विपद् उद्धार", number: "101", icon: "crosshair" },
    { agency: "Health Emergency / Ambulance", agencyNe: "स्वास्थ्य आपतकाल / एम्बुलेन्स", number: "102", icon: "heart-pulse" },
    { agency: "Rasuwa District Administration (CDO)", agencyNe: "जिल्ला प्रशासन कार्यालय रसुवा", number: "010-540199", icon: "phone" },
    { agency: "Syabrubesi Police Post", agencyNe: "स्याफ्रुबेसी प्रहरी चौकी", number: "010-540122", icon: "phone" },
    { agency: "Dhunche District Hospital", agencyNe: "धुन्चे जिल्ला अस्पताल", number: "010-540144", icon: "activity" }
  ],

  mapMarkers: [
    { id: "m1", title: "Syabrubesi", type: "missing", x: 38, y: 44, count: "48 Missing" },
    { id: "m2", title: "Timure Border", type: "missing", x: 42, y: 72, count: "62 Missing" },
    { id: "m3", title: "Gatlang Camp", type: "rescued", x: 30, y: 55, count: "120 Rescued" },
    { id: "m4", title: "Dhunche Hospital", type: "hospital", x: 48, y: 56, count: "80 Beds Ready" },
    { id: "m5", title: "Bhotekoshi Relief", type: "relief", x: 55, y: 48, count: "Food & Water" },
    { id: "m6", title: "Langtang Shelter", type: "shelter", x: 60, y: 65, count: "300 Capacity" },
    { id: "m7", title: "Timure Heli Pad", type: "helipad", x: 62, y: 52, count: "3 Choppers Active" }
  ]
};

// Global Toast Alert Helper
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-text">${message}</div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Emergency Call 112 trigger
window.triggerEmergencyCall = function() {
  window.openRescueModal('112 Emergency Fast Dispatch');
};

// Language Toggle Logic
window.setLanguage = function(lang) {
  window.KhojiStore.currentLang = lang;
  localStorage.setItem('khoji_lang', lang);
  
  const currentLangLabel = document.getElementById('current-lang-text');
  if (currentLangLabel) {
    currentLangLabel.textContent = lang === 'ne' ? '🇳🇵 NE' : '🇳🇵 EN';
  }

  // Toggle language dropdown if open
  const dropdown = document.getElementById('lang-dropdown');
  if (dropdown) dropdown.classList.remove('show');

  // Trigger language change event for dynamic page elements
  document.dispatchEvent(new CustomEvent('khoji_lang_change', { detail: { lang } }));
  window.showToast(lang === 'ne' ? 'भाषा नेपालीमा परिवर्तन गरियो' : 'Language set to English', 'info');
};

document.addEventListener('DOMContentLoaded', () => {
  // Set initial language label
  const langText = document.getElementById('current-lang-text');
  if (langText && window.KhojiStore.currentLang === 'ne') {
    langText.textContent = '🇳🇵 NE';
  }

  // Global search input handling
  const searchForm = document.getElementById('top-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchForm.querySelector('input').value.trim();
      if (query) {
        window.location.href = `missing-persons.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
});
