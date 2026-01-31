let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    updateMastheadDate();
    getLocalWeather();
    if (typeof baseCsvUrl !== 'undefined') initDirectory();
    
    const modal = document.getElementById('premium-modal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closePremiumModal(); });
});

function initDirectory() {
    Papa.parse(baseCsvUrl, {
        download: true, header: true, skipEmptyLines: 'greedy',
        complete: function(results) {
            masterData = results.data.filter(row => (row.name || row.Name));
            populateCategoryFilter(masterData); // This fixes the dropdown!
            populateTownFilter(masterData);
            displayData(masterData);
            updateListingCount(masterData.length);
        }
    });
}

function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || biz.Tier || 'basic').toLowerCase().trim();
        const bizName = (biz.name || biz.Name || "").trim();
        const town = (biz.town || biz.Town || "Clay County").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const cleanID = bizName.replace(/[^a-zA-Z0-9]/g, '');

        const card = document.createElement('div');
        card.className = `card ${tier}`;
        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid || biz.ImageID)}</div>
            <h3>${bizName}</h3>
            <div class="town-bar ${townClass}-bar">${town}</div>
            ${tier !== 'basic' ? `<p><b>${biz.phone || biz.Phone || ""}</b></p>` : ''}
            <p class="category-tag"><i>${biz.category || biz.Category || ""}</i></p>
            ${tier === 'premium' ? `<button class="read-more-btn" onclick="openPremiumModal('${cleanID}')">Read More</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// RESTORED PREMIUM POP-OUT (Full Splendor)
function openPremiumModal(cleanID) {
    const biz = masterData.find(b => (b.name || b.Name || "").replace(/[^a-zA-Z0-9]/g, '') === cleanID);
    if (!biz) return;

    const modal = document.getElementById('premium-modal');
    const modalContainer = document.querySelector('#premium-modal .modal-content');
    
    if (modalContainer) {
        const town = (biz.town || biz.Town || "Clay County").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const address = biz.address || biz.Address || "Contact for Address";
        const phone = biz.phone || biz.Phone || "N/A";
        const rawHours = (biz.hours || biz.Hours || "").trim();
        const displayHours = (rawHours === "" || rawHours.toLowerCase() === "n/a") ? "Please Call for Hours" : rawHours;
        const rawWeb = (biz.website || biz.Website || "").trim();
        const websiteUrl = (rawWeb && !rawWeb.startsWith('http')) ? `https://${rawWeb}` : rawWeb;
        const rawFB = (biz.facebook || biz.Facebook || "").trim();
        const fbUrl = (rawFB && !rawFB.startsWith('http')) ? `https://${rawFB}` : rawFB;
        const mapAddress = encodeURIComponent(`${address}, ${town}, IL`);

        modalContainer.innerHTML = `
            <span onclick="closePremiumModal()" style="position:absolute; top:8px; right:15px; font-size:45px; cursor:pointer; color:#fff; font-weight:bold; z-index:1000001; line-height:0.8;">×</span>
            
            <div style="margin: -40px -40px 25px -40px; text-align: center;">
                <div style="background: #d4af37; color: #fff; padding: 12px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 4px; font-size: 0.9rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-bottom: 2px solid #b38728;">
                    PREMIUM COMMUNITY PARTNER
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 10px;">
                <div style="text-align: center;">
                    <div style="height: 100px; margin-bottom: 12px; display:flex; align-items:center; justify-content:center;">
                        ${getSmartImage(biz.imageid || biz.ImageID).replace('<img', '<img style="max-height:100%; max-width:100%;"')}
                    </div>
                    <h2 style="font-family:serif; font-size: 1.4rem; margin: 0;">${biz.name || biz.Name}</h2>
                    <p style="color: #666; font-style: italic; margin-top: 5px; font-size: 0.9rem;">${biz.category || biz.Category || ""}</p>
                </div>

                <div style="border-left: 1px solid #ccc; padding-left: 20px; text-align: left; font-size: 0.95rem;">
                    <p style="margin: 10px 0;"><strong>📍 Address:</strong><br>${address}</p>
                    <p style="margin: 10px 0;"><strong>📞 Phone:</strong><br>${phone}</p>
                    ${websiteUrl ? `<p style="margin: 10px 0;"><strong>🌐 Website:</strong><br><a href="${websiteUrl}" target="_blank" style="color:#0044cc; text-decoration:underline;">Visit Website</a></p>` : ''}
                    ${fbUrl ? `<p style="margin: 10px 0;"><strong>📘 Facebook:</strong><br><a href="${fbUrl}" target="_blank" style="color:#1877F2; text-decoration:underline;">Facebook Page</a></p>` : ''}
                </div>
            </div>

            <div class="town-bar ${townClass}-bar" style="margin: 15px -40px; width: calc(100% + 80px); text-align: center; padding: 10px 0; font-weight: bold; text-transform: uppercase;">
                ${town}
            </div>
            
            <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div style="height: 180px; border: 1px solid #222;">
                    <iframe width="100%" height="100%" frameborder="0" src="https://maps.google.com/maps?q=${mapAddress}&output=embed"></iframe>
                </div>
                <div style="background:#fff; border: 1px solid #222; padding: 15px; font-size: 0.85rem;">
                    <h4 style="margin:0 0 10px 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">HOURS</h4>
                    <div style="line-height:1.4;">${displayHours}</div>
                </div>
            </div>

            <div style="border: 3px dashed #cc0000; padding: 25px; text-align: center; background-color: #fff;">
                <p style="color:#cc0000; font-weight:bold; font-size:1.2rem; margin:0;">DIGITAL COMMUNITY COUPON</p>
                <p style="margin:8px 0 0 0; font-size:0.95rem;">Show this screen to redeem!</p>
            </div>
        `;
        modal.style.display = 'flex';
    }
}

// SEARCH & FILTERS
function quickFilterByCategory(catName) {
    const filtered = masterData.filter(biz => {
        const bCat = (biz.category || biz.Category || "").toLowerCase();
        const target = catName.toLowerCase();
        if (target === "dining") return bCat.includes("dining") || bCat.includes("restaurant");
        if (target === "retail" || target === "shopping") return bCat.includes("retail") || bCat.includes("shopping");
        return bCat.includes(target);
    });
    displayData(filtered);
    updateListingCount(filtered.length);
}

function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    const categories = [...new Set(data.map(item => item.category || item.Category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `📁 ${cat}`;
        select.appendChild(opt);
    });
}

function populateTownFilter(data) {
    const select = document.getElementById('town-select');
    if (!select) return;
    const towns = [...new Set(data.map(item => item.town || item.Town))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📍 All Towns</option>';
    towns.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        select.appendChild(opt);
    });
}

// REMAINING HELPERS (Search, Tiers, Weather, Date)
function toggleSearchBar() {
    const el = document.getElementById('search-input-wrapper');
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}

function searchBusinesses() {
    const term = document.getElementById('directory-search').value.toLowerCase();
    const filtered = masterData.filter(biz => (biz.name || biz.Name || "").toLowerCase().includes(term) || (biz.category || biz.Category || "").toLowerCase().includes(term));
    displayData(filtered);
    updateListingCount(filtered.length);
}

function filterByTier(tier) {
    if (tier === 'all') { displayData(masterData); updateListingCount(masterData.length); }
    else { const filtered = masterData.filter(biz => (biz.tier || biz.Tier || "").toLowerCase().trim() === tier); displayData(filtered); updateListingCount(filtered.length); }
}

function applyFilters() {
    const twn = document.getElementById('town-select').value;
    const cat = document.getElementById('cat-select').value;
    const filtered = masterData.filter(biz => (twn === "All" || (biz.town || biz.Town) === twn) && (cat === "All" || (biz.category || biz.Category) === cat));
    displayData(filtered);
    updateListingCount(filtered.length);
}

function closePremiumModal() { document.getElementById('premium-modal').style.display = 'none'; }
function getSmartImage(id) {
    const placeholder = "https://placehold.co/150?text=SMLC";
    if (!id || id === "N/A" || id === "") return `<img src="${placeholder}">`;
    if (id.startsWith('http')) return `<img src="${id}">`;
    return `<img src="https://raw.githubusercontent.com/skventuresigns-design/media/main/${id}">`;
}
function updateListingCount(count) { document.getElementById('listing-count').innerText = `${count} Listings Found`; }
function updateMastheadDate() { document.getElementById('masthead-date').innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
async function getLocalWeather() { try { const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true'); const data = await res.json(); document.getElementById('weather-box').innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`; } catch (e) {} }
