/**
 * LAYOUT.JS - The Directory Engine
 * Combined version: Fixes Dropdowns, Images, and Weather
 */

let masterData = [];

// 1. DATA SOURCE & CONFIG
const baseCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOri1Xv-jHW8JnLbK0lBG_Or0e99RcIXqoBHc31HE5RxppszjFz3akDCHXaZxFmrepuCOUTD9jLL0B/pub?gid=0&single=true&output=csv";
const mediaRepoBase = "https://raw.githubusercontent.com/skventuresigns-design/media/main/";

// 2. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
    getLocalWeather();
});

// 3. FETCH DATA FROM GOOGLE SHEET
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Clean out any rows that don't have a name
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
            } else {
                if (grid) grid.innerHTML = '<p>No listings found.</p>';
            }
        },
        error: function(err) {
            console.error("CSV Load Error:", err);
        }
    });
}

// 4. RENDER THE LISTINGS (With Tiered Logic)
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    const countElement = document.getElementById('listing-count');
    
    if (!grid) return;
    grid.innerHTML = '';

    if (countElement) {
        countElement.innerText = `Showing ${data.length} Local Businesses`;
    }

    data.forEach(biz => {
        // Town Formatting
        const townRaw = (biz.town || "Clay County").trim().split(',')[0];
        const townClean = townRaw.replace(" IL", "").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');
        
        // Tier Logic
        const tier = (biz.tier || 'basic').toLowerCase();
        const card = document.createElement('div');
        card.className = `card ${tier}`;
        
        // Content Setup based on Tier
        let cardContent = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
        `;

        // PLUS & PREMIUM get the phone number
        if (tier === 'plus' || tier === 'premium') {
            cardContent += `<p class="phone-number">${biz.phone || ''}</p>`;
        }

        // PREMIUM gets the Category and the Read More button
        if (tier === 'premium') {
            cardContent += `
                <p class="category-text"><i>${biz.category || ''}</i></p>
                <button class="read-more-btn" onclick="openPremiumModal('${encodeURIComponent(biz.name)}')">Read More</button>
            `;
        } else {
            // Basic and Plus show Category at the bottom as discussed
            cardContent += `<p class="category-tag">${biz.category || ''}</p>`;
        }

        card.innerHTML = cardContent;
        grid.appendChild(card);
    });
}

// 5. SMART IMAGE HANDLER (Points to your Media Repo)
function getSmartImage(id) {
    const placeholder = "https://via.placeholder.com/150?text=SMLC";

    if (!id || id === "N/A" || id.trim() === "") {
        return `<img src="${placeholder}" alt="Logo">`;
    }
    
    // If it's a direct web link (e.g. from Facebook)
    if (id.startsWith('http')) {
        return `<img src="${id}" alt="Logo" onerror="this.src='${placeholder}'">`;
    }

    // Default: Pull from your specific GitHub media repository
    return `<img src="${mediaRepoBase}${id.trim()}" alt="Logo" onerror="this.src='${placeholder}'">`;
}

// 6. THE FILTERING ENGINE
function applyFilters() {
    const townVal = document.getElementById('town-select').value;
    const catVal = document.getElementById('cat-select').value;
    
    let filtered = masterData.filter(biz => {
        const bizTown = (biz.town || "").toLowerCase();
        const selectedTown = townVal.toLowerCase();
        const matchesTown = (townVal === 'All' || bizTown.includes(selectedTown));
        
        const bizCat = (biz.category || "");
        const matchesCat = (catVal === 'All' || bizCat === catVal);
        
        return matchesTown && matchesCat;
    });
    
    displayData(filtered);
}

// 7. DYNAMIC CATEGORY DROPDOWN
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        // Using catEmojis if defined, otherwise default folder
        const emoji = (typeof catEmojis !== 'undefined' && catEmojis[cat]) ? catEmojis[cat] : '📁';
        opt.textContent = `${emoji} ${cat}`;
        select.appendChild(opt);
    });
}

// 8. WEATHER WIDGET
async function getLocalWeather() {
    const weatherBox = document.getElementById('weather-box');
    if (!weatherBox) return;
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await response.json();
        if (data.current_weather) {
            weatherBox.innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`;
        }
    } catch (e) { console.log("Weather failed"); }
}

// 9. PREMIUM MODAL (Placeholder for now)
function openPremiumModal(bizName) {
    console.log("Opening details for:", decodeURIComponent(bizName));
    // We will build this pop-out functionality next!
    alert("Full Profile for " + decodeURIComponent(bizName) + " coming soon!");
}
