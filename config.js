/**
 * CONFIG.JS - Global Settings & Data
 */

// 1. Your NEW Google Sheet CSV link
const baseCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSHo8m-VL73xWyDrXNDjsIZbhSOvIibF-2jIGVAJdCjvV5YyFv2as07dprg8G0jMw/pub?gid=1262621087&single=true&output=csv";

// 2. Local images folder path
const placeholderImg = "images/placeholder.png";

const catEmojis = {
    "Agriculture": "🚜",
    "Automotive": "🚗",
    "Beauty": "💇‍♀️",
    "Church": "⛪",
    "Education": "🎓"
    "Government": "🏛️",
    "Healthcare": "🏥",    
    "Real Estate": "🏠",
    "Retail": "🛍️",
    "Restaurant": "🍴",
    "Services": "🛠️"
};

function mapCategory(cat) {
    if (!cat) return "Other";
    const clean = cat.trim();
    return catEmojis[clean] ? clean : "Other";
}
