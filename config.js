/**
 * CONFIG.JS - Global Settings & Data
 */

// 1. Your NEW Google Sheet CSV link
const baseCsvUrl = "https://docs.google.com/spreadsheets/d/1wKw8hZ_heUkZaX15JKY2J7XT2qVuvGmt/edit?gid=1262621087#gid=1262621087;

// 2. Local images folder path
const placeholderImg = "images/placeholder.png";

const catEmojis = {
    "Automotive": "🚗",
    "Beauty": "💇‍♀️",
    "Construction": "🏗️",
    "Dining": "🍔",
    "Entertainment": "🍿",
    "Financial": "💵",
    "Health": "🏥",
    "Legal": "⚖️",
    "Manufacturing": "🏭",
    "Real Estate": "🏠",
    "Retail": "🛍️",
    "Services": "🤝",
    "Technology": "💻",
    "Other": "📁"
};

function mapCategory(cat) {
    if (!cat) return "Other";
    const clean = cat.trim();
    return catEmojis[clean] ? clean : "Other";
}
