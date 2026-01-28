/**
 * CONFIG.JS - Global Settings & Data
 */

// 1. Your Google Sheet CSV link (Business Cards Tab)
const baseCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOri1Xv-jHW8JnLbK0lBG_Or0e99RcIXqoBHc31HE5RxppszjFz3akDCHXaZxFmrepuCOUTD9jLL0B/pub?gid=0&single=true&output=csv";

// 2. Local images folder path
const placeholderImg = "images/placeholder.png";

// 3. GitHub Media Repository Path
const mediaRepoBase = "https://raw.githubusercontent.com/skventuresigns-design/media/main/";

// 4. Category Emojis & Mapping
const catEmojis = {
    "Agriculture": "🚜",
    "Automotive": "🚗",
    "Beauty": "💇‍♀️",
    "Construction": "🏗️",
    "Church": "⛪",
    "Education": "🎓",   
    "Entertainment": "🍿",
    "Financial": "💵",
    "Government": "🏛️",
    "Healthcare": "🏥",
    "Legal": "⚖️",
    "Manufacturing": "🏭",
    "Real Estate": "🏠",
    "Retail": "🛍️",
    "Restaurant": "🍴",
    "Services": "🛠️",
    "Technology": "💻",
    "Other": "📁"
};

// 5. Helper Function
function mapCategory(cat) {
    if (!cat) return "Other";
    const clean = cat.trim();
    return catEmojis[clean] ? clean : "Other";
}
