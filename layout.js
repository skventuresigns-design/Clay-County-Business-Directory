/**
 * LAYOUT.JS - The Directory Engine (Defensive Version)
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    console.log("System Check: DOM Loaded");
    
    // Safety check for config variables
    if (typeof baseCsvUrl === 'undefined') {
        console.error("CRITICAL: baseCsvUrl is missing from config.js");
    } else {
        initDirectory();
    }
    
    getLocalWeather();
});

// 2. FETCH DATA
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (!grid) {
        console.error("CRITICAL: Could not find 'directory-grid' in your HTML");
        return;
    }
    
    grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            console.log("Data Received:", results.data.length, "rows");
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
            } else {
                grid.innerHTML = '<p>No listings found in the spreadsheet.</p>';
            }
        },
        error: function(err) {
            console.error("PapaParse Error:", err);
            grid.innerHTML = '<p>Error loading data. Check console.</p>';
        }
    });
}

// 3. RENDER LISTINGS
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || 'basic').toLowerCase();
        const card = document.createElement('div');
        card.className = `card ${tier}`;
        
        // Basic fallback for town colors
        const townClean = (biz.town || "Local").split(',')[0].replace(" IL", "").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name || 'Unnamed Business'}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            <p>${biz.phone || ''}</p>
            <p><i>${biz.category || ''}</i></p>
        `;
        grid.appendChild(card);
    });
}

// 4. IMAGE HANDLER (Uses the config.js mediaRepoBase)
function getSmartImage(id) {
    const placeholder = "https://via.placeholder.com/150?text=SMLC";
    const repo = (typeof mediaRepoBase !== 'undefined') ? mediaRepoBase : "";

    if (!id || id === "N/A" || id.trim() === "") return `<img src="${placeholder}" alt="Logo">`;
    if (id.startsWith('http')) return `<img src="${id}" alt="Logo" onerror="this.src='${placeholder}'">`;
    
    return `<img src="${repo}${id.trim()}" alt="Logo" onerror="this.src='${placeholder}'">`;
}

// 5. WEATHER
async function getLocalWeather() {
    const weatherBox = document.getElementById('weather-box');
    if (!weatherBox) return;
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await response.json();
        if (data && data.current_weather) {
            weatherBox.innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`;
        }
    } catch (e) { 
        console.log("Weather service unreachable"); 
    }
}

// 6. DROPDOWN GENERATOR
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        const emoji = (typeof catEmojis !== 'undefined' && catEmojis[cat]) ? catEmojis[cat] : '📁';
        opt.textContent = `${emoji} ${cat}`;
        select.appendChild(opt);
    });
}
