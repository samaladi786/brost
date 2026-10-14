// ==========================================
// CENTRAL CONFIGURATION - MULTI-SHOP POS
// ==========================================

// മാസ്റ്റർ അഡ്മിൻ PIN (എല്ലാ ഷോപ്പുകളും ആക്സസ് ചെയ്യാൻ)
window.MASTER_PIN = "0000";

// ജീവനക്കാർക്ക് ഡിലീറ്റ് ചെയ്യാൻ അനുവദനീയമായ ദിവസ പരിധി
window.STAFF_DELETE_LIMIT_DAYS = 2;

// എക്സ്റ്റേണൽ റിപ്പോർട്ട് പോർട്ടൽ ലിങ്ക്
window.GLOBAL_REPORT_PORTAL_URL = "https://samaladi786.github.io/aladi/";

// കമ്പ്യൂട്ടറിന്റെ ലോക്കൽ സെർവർ IP (LAN / Offline SQLite Sync)
window.LOCAL_SERVER_IP = "192.168.100.90";

// ഷോപ്പുകളുടെ കോൺഫിഗറേഷൻ
window.SHOPS_CONFIG = [
  {
    id: 'shop1',
    name: 'BROST',
    tagline: 'BROST POS',
    url: 'https://rgsoehlmucocfmoblxvr.supabase.co',
    key: 'sb_publishable_HBaYFMLtuNSD2ZcKffAbzA_-dkXWKCU',
    pin: '1111', // ഈ ഷോപ്പിന്റെ 4-അക്ക POS PIN
    themeGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    accentColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    logo: 'shop1.png'
  }
];
