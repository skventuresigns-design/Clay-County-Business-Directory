/**
 * LAYOUT.JS - The Directory Engine
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    console.log("System Check: DOM Loaded");
    
    // Run the clock/date first
    updateMastheadDate();

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
    if (!grid) return;
    
    grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Flexible check for 'name' or 'Name'
            masterData = results.data.filter(row => {
                const n = row.name || row.Name;
                return n && n.trim() !== "";
            });
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
            } else {
                grid.innerHTML = '<p>No listings found in the spreadsheet.</p>';
            }
        },
        error: function(err) {
            console.error("PapaParse Error:", err);
        }
    });
}

// 3. RENDER LISTINGS (The Final Clean Version)
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || biz.Tier || 'basic').toLowerCase();
        
        // Town is now clean directly from Column B of Master Data!
        const townClean = (biz.town || biz.Town || "Clay County").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');

        const bizName = biz.name || biz.Name || "Unnamed Business";
        const bizPhone = biz.phone || biz.Phone || "";
        const bizCat = biz.category || biz.Category || "";
        const imgFile = biz.imageid || biz.ImageID || "";

        const card = document.createElement('div');
        card.className = `card ${tier}`;
        card.style.backgroundColor = "#fcf6de"; // Your preferred listings color

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(imgFile)}</div>
            <h3>${bizName}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            <p class="phone">${bizPhone}</p>
            <p class="category-tag"><i>${bizCat}</i></p>
            ${tier === 'premium' ? `<button class="read-more-btn" onclick="openPremiumModal('${encodeURIComponent(bizName)}')">Read More</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// 4. IMAGE HANDLER
function getSmartImage(id) {
    const placeholder = "https://via.placeholder.com/150?text=SMLC";
    const repo = (typeof mediaRepoBase !== 'undefined') ? mediaRepoBase : "";

    if (!id || id === "N/A" || id.trim() === "") return `<img src="${placeholder}" alt="Logo">`;
    if (id.toString().startsWith('http')) return `<img src="${id}" alt="Logo" onerror="this.src='${placeholder}'">`;
    
    return `<img src="${repo}${id.toString().trim()}" alt="Logo" onerror="this.src='${placeholder}'">`;
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
    } catch (e) { console.log("Weather service unreachable"); }
}

// 6. DROPDOWN GENERATOR
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    
    const categories = [...new Set(data.map(item => item.category || item.Category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        const emoji = (typeof catEmojis !== 'undefined' && catEmojis[cat]) ? catEmojis[cat] : '📁';
        opt.textContent = `${emoji} ${cat}`;
        select.appendChild(opt);
    });
}

// 7. DATE HANDLER
function updateMastheadDate() {
    const dateElement = document.getElementById('masthead-date');
    if (dateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        dateElement.innerText = today.toLocaleDateString('en-US', options);
    }
}
