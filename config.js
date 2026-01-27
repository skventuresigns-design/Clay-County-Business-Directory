const baseCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRDgQs5fH6y8PWw9zJ7_3237SB2lxlsx8Gnw8o8xvTr94vVtWwzs6qqidajKbPepQDS36GNo97bX_4b/pub?gid=0&single=true&output=csv"; 

const placeholderImg = "https://raw.githubusercontent.com/KFruti88/images/main/placeholder.png";

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
