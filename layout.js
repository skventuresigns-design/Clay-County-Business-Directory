/**
 * LAYOUT.JS - The Directory Engine
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    console.log("System Check: DOM Loaded");
    
    // Safety checks for helper functions
    if (typeof updateMastheadDate === 'function') updateMastheadDate();
    if (typeof getLocalWeather === 'function') getLocalWeather();

    if (typeof baseCsvUrl === 'undefined') {
        console.error("CRITICAL: baseCsvUrl is missing from config.js");
    } else {
        initDirectory();
    }
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
            // Assumes lowercase headers 'name'
            masterData = results.data.filter(row => {
                const n = row.name || row.Name;
                return n && n.trim() !== "";
            });
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                populateTownFilter(masterData);
                displayData(masterData);
                updateListingCount(masterData.length);
            } else {
                grid.innerHTML = '<p>No listings found in the spreadsheet.</p>';
            }
        },
        error: function(err) {
            console.error("PapaParse Error:", err);
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
        const townClean = (biz.town || "Clay County").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');
        const bizName = biz.name || "Unnamed Business";

        const card = document.createElement('div');
        card.className = `card ${tier}`;

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${bizName}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            <p class="phone">${biz.phone || ""}</p>
            <p class="category-tag"><i>${biz.category || ""}</i></p>
            ${tier === 'premium' ? `<button class="read-more-btn" onclick="openPremiumModal('${encodeURIComponent(bizName)}')">Read More</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// 4. IMAGE HANDLER
function getSmartImage(id) {
    const placeholder = "https://placehold.co/150?text=SMLC";
    const repo = (typeof mediaRepoBase !== 'undefined') ? mediaRepoBase : "";

    if (!id || id === "N/A" || id.trim() === "") return `<img src="${placeholder}" alt="Logo">`;
    if (id.toString().startsWith('http')) return `<img src="${id}" alt="Logo" onerror="this.src='${placeholder}'">`;
    
    return `<img src="${repo}${id.toString().trim()}" alt="Logo" onerror="this.src='${placeholder}'">`;
}

// 5. THE DYNAMIC POP-OUT (Bypasses ID Errors)
// 5. THE DYNAMIC POP-OUT (Metallic Gold Update)
function openPremiumModal(encodedName) {
    const name = decodeURIComponent(encodedName);
    const biz = masterData.find(b => (b.name || b.Name) === name);

    if (!biz) return;

    const modalContent = document.querySelector('#premium-modal .modal-content');
    if (modalContent) {
        modalContent.innerHTML = `
            <span class="close-modal" onclick="closePremiumModal()">&times;</span>
            <div class="premium-logo-frame" style="text-align:center; margin-bottom:20px;">
                ${getSmartImage(biz.imageid)}
            </div>
            <h2 id="modal-name" style="font-family:serif; border-bottom:3px solid #222; color:#222; text-align:center;">${biz.name}</h2>
            <div style="text-align:center; margin-bottom:15px;">
                <span class="modal-town-label ${(biz.town || "clay-county").toLowerCase().replace(/\s+/g, '-')}-bar" style="padding:5px 15px; color:#fff; font-weight:bold; text-transform:uppercase;">${biz.town || 'Clay County'}</span>
            </div>
            <div class="premium-info-grid" style="color:#222; margin-top:20px;">
                <p><strong>📍 Address:</strong> ${biz.address || 'Contact for Address'}</p>
                <p><strong>📞 Phone:</strong> ${biz.phone || 'N/A'}</p>
                <p><strong>📂 Category:</strong> ${biz.category || 'Local Business'}</p>
            </div>
            <div class="premium-coupon-box" style="border:2px dashed #cc0000; padding:15px; margin-top:20px; background:#fff; text-align:center;">
                <span style="color:#cc0000; font-weight:bold;">COMMUNITY COUPON</span>
                <p style="margin:5px 0 0 0; font-size:0.9rem; color:#222;">Show this screen to the business for a special local offer!</p>
            </div>
            
            <a href="tel:${(biz.phone || "").replace(/\D/g,'')}" 
               class="premium-call-btn" 
               style="display:block; background: linear-gradient(45deg, #bf953f, #fcf6ba, #aa771c); color:#222 !important; text-align:center; padding:18px; margin-top:20px; text-decoration:none; font-weight:bold; border:2px solid #222; text-transform:uppercase; letter-spacing:1px;">
               CALL BUSINESS NOW
            </a>
        `;
        document.getElementById('premium-modal').style.display = 'flex';
    }
}

// 6. FILTERS
function applyFilters() {
    const selectedTown = document.getElementById('town-select').value;
    const selectedCat = document.getElementById('cat-select').value;

    const filtered = masterData.filter(biz => {
        const bTown = biz.town || biz.Town || "";
        const bCat = biz.category || biz.Category || "";
        const townMatch = (selectedTown === "All" || bTown === selectedTown);
        const catMatch = (selectedCat === "All" || bCat === selectedCat);
        return townMatch && catMatch;
    });

    displayData(filtered);
    updateListingCount(filtered.length);
}

// 7. HELPERS
function updateListingCount(count) {
    const el = document.getElementById('listing-count');
    if (el) el.innerText = `${count} Listings Found`;
}

function updateMastheadDate() {
    const el = document.getElementById('masthead-date');
    if (el) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        el.innerText = new Date().toLocaleDateString('en-US', options);
    }
}

async function getLocalWeather() {
    const el = document.getElementById('weather-box');
    if (!el) return;
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await response.json();
        if (data.current_weather) {
            el.innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`;
        }
    } catch (e) { console.log("Weather service unreachable"); }
}

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

function populateTownFilter(data) {
    const select = document.getElementById('town-select');
    if (!select) return;
    const towns = [...new Set(data.map(item => item.town || item.Town))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📍 All Towns</option>';
    towns.forEach(town => {
        const opt = document.createElement('option');
        opt.value = town;
        opt.textContent = town;
        select.appendChild(opt);
    });
}
