/**
 * LAYOUT.JS - The Directory Engine
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    console.log("System Check: DOM Loaded");
    
    if (typeof updateMastheadDate === 'function') updateMastheadDate();
    if (typeof getLocalWeather === 'function') getLocalWeather();

    if (typeof baseCsvUrl === 'undefined') {
        console.error("CRITICAL: baseCsvUrl is missing from config.js");
    } else {
        initDirectory();
    }

    // Close modal if user clicks the dark background
    const modal = document.getElementById('premium-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePremiumModal();
        });
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

// 3. RENDER LISTINGS (Logic for Tiers & Hidden Phone Numbers)
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || 'basic').toLowerCase();
        const townClean = (biz.town || "Clay County").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');
        const bizName = biz.name || "Unnamed Business";

        // Logic: Phone numbers only appear for Plus and Premium members
        const phoneHtml = tier !== 'basic' ? `<p class="phone">${biz.phone || ""}</p>` : '';

        const card = document.createElement('div');
        card.className = `card ${tier}`;

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${bizName}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            ${phoneHtml} 
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

// 5. THE DYNAMIC POP-OUT (Metallic Gold Style)
function openPremiumModal(encodedName) {
    const name = decodeURIComponent(encodedName);
    const biz = masterData.find(b => (b.name || b.Name) === name);
    if (!biz) return;

    const modalContainer = document.querySelector('#premium-modal .modal-content');
    
    if (modalContainer) {
        // Logic: Use a big photo if available, fallback to logo
        const heroImg = biz.popupimage && biz.popupimage !== "" ? getSmartImage(biz.popupimage) : getSmartImage(biz.imageid);
        const mapAddress = encodeURIComponent(`${biz.address}, ${biz.town}, IL`);

        modalContainer.innerHTML = `
            <span onclick="closePremiumModal()" style="position:absolute; top:10px; right:20px; font-size:40px; cursor:pointer; color:#fff; font-weight:bold; z-index:100; text-shadow: 2px 2px 4px #000;">&times;</span>
            
            <div style="margin: -40px -40px 20px -40px; height: 250px; overflow: hidden; border-bottom: 4px solid #d4af37;">
                ${heroImg.replace('<img', '<img style="width:100%; height:100%; object-fit:cover;"')}
            </div>

            <h2 style="font-family:serif; color:#222; text-align:center; margin-bottom:5px; font-size:2.2rem;">${biz.name}</h2>
            <p style="text-align:center; color:#666; font-style:italic; margin-bottom:20px;">${biz.category} | ${biz.town}</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; text-align: left;">
                
                <div style="background: #fff; padding: 15px; border: 1px solid #ddd;">
                    <h3 style="margin-top:0; border-bottom: 2px solid #222; font-size: 1rem;">CONTACT DETAILS</h3>
                    <p><strong>📍 Address:</strong><br>${biz.address || 'Contact for Address'}</p>
                    <p><strong>📞 Phone:</strong><br>${biz.phone || 'N/A'}</p>
                    <p><strong>⏰ Hours:</strong><br>${biz.hours || 'See Website'}</p>
                </div>

                <div style="border: 1px solid #ddd; background: #eee; height: 200px;">
                    <iframe width="100%" height="100%" frameborder="0" style="border:0" 
                        src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY_HERE&q=${mapAddress}" allowfullscreen>
                    </iframe>
                </div>
            </div>

            <a href="tel:${(biz.phone || "").replace(/\D/g,'')}" 
               style="display:block; background: linear-gradient(45deg, #bf953f, #fcf6ba, #aa771c); color:#222 !important; text-align:center; padding:18px; margin-top:25px; text-decoration:none; font-weight:900; border:1px solid #222; text-transform:uppercase; letter-spacing:2px;">
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
