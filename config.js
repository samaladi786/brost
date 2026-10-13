// ==========================================
// CENTRAL CONFIGURATION - MULTI-SHOP POS
// ==========================================

// മാസ്റ്റർ അഡ്മിൻ PIN (എല്ലാ ഷോപ്പുകളും ആക്സസ് ചെയ്യാൻ)
window.MASTER_PIN = "0000";

// ജീവനക്കാർക്ക് ഡിലീറ്റ് ചെയ്യാൻ അനുവദനീയമായ ദിവസ പരിധി
window.STAFF_DELETE_LIMIT_DAYS = 2;

// എക്സ്റ്റേണൽ റിപ്പോർട്ട് പോർട്ടൽ ലിങ്ക്
window.GLOBAL_REPORT_PORTAL_URL = "https://samaladi786.github.io/aladi/";

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
  
  // ഭാവിയിൽ രണ്ടാമതൊരു ഷോപ്പ് വരുമ്പോൾ താഴെ ഇതേപോലെ കോമയിട്ട് ചേർത്താൽ മതിയാകും:
  /*
  ,{
    id: 'shop2',
    name: 'BURGER HOUSE',
    tagline: 'BURGER POS',
    url: 'https://xxxxxx.supabase.co',
    key: 'sb_publishable_xxxxxx',
    pin: '2222',
    themeGradient: 'from-amber-950 via-slate-900 to-orange-950',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    logo: 'shop2.png'
  }
  */
];
