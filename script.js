// Initialize map centered on Ludwigsburg
const PH_LUDWIGSBURG_CENTER = [48.8974, 9.1916];

const map = L.map('map').setView(PH_LUDWIGSBURG_CENTER, 13);



// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Create marker cluster group
const markerClusterGroup = L.markerClusterGroup();

// Global variables
let schools = [];

// Store all markers for filtering
let allMarkers = {};
let filteredMarkers = [];
let selectedCategories = new Set();
let selectedCooperationStatus = new Set();
let currentSort = 'name'; // 'name', 'category', 'status'

async function loadCSVData() {
    return new Promise((resolve, reject) => {

        Papa.parse("PraxisstellenSoLE_Karte.csv", {
            download: true,
            header: true,
            delimiter: ";",
            skipEmptyLines: true,

            complete: function(results) {

                schools = results.data.map((row, index) => ({
                    id: index + 1,

                    category: row["Art der Einrichtung/des Projekts"] || "",
                    name: row["Name"] || "",
                    targetGroup: row["Zielgruppe"] || "",
                    offer: row["Angebot"] || "",
                    address: row["Adresse"] || "",
                    contactPerson: row["Kontaktperson"] || "",
                    email: row["Mail"] || "",
                    phone: row["Telefon"] || "",
                    cooperationStatus: row["SoLE-Kooperation"] || "",
                    details: row["Was"] || "",

                    lat: parseFloat(row["Lat"]),
                    lng: parseFloat(row["Lng"])
                }));

                resolve();
            },

            error: function(err) {
                reject(err);
            }
        });

    });
}

/**
 * Category to color mapping (based on real data categories from Excel)
 */
const categoryColors = {
    'Kinder- und Familienzentrum': '#FF6B6B',     // Red - Children/Family
    'Offenes Angebot': '#4ECDC4',                 // Teal - Open Offer
    'Bibliothek': '#45B7D1',                      // Blue - Library
    'Bildungshaus': '#FFA07A',                    // Salmon - Educational House
    'Seniorenzentrum': '#98D8C8',                 // Mint - Senior Center
    'default': '#667EEA'                          // Purple - Default
};

const categoryIcons = {
    'Bibliothek': 'fa-book',
    'Seniorenzentrum': 'fa-user-group',
    'Kinder- und Familienzentrum': 'fa-children',
    'Bildungshaus': 'fa-school',
    'Offenes Angebot': 'fa-palette',
    'default': 'fa-location-dot'
};

/**
 * Create custom marker icon
 */
function createMarkerIcon(category) {
    const color = getCategoryColor(category);
    const iconClass = categoryIcons[category] || categoryIcons['default'];

    return L.divIcon({
        html: `
            <div class="custom-marker-icon"
                 style="background-color:${color}">
                <i class="fa-solid ${iconClass}"></i>
            </div>
        `,
        iconSize: [40, 40],
        className: ''
    });
}

/**
 * Create popup content from Excel schema
 */
function createPopupContent(school) {
    return `
        <div class="popup-content">
            <h3>${school.name}</h3>
            <span class="popup-type">${school.category}</span>
            <hr style="margin: 8px 0; border: none; border-top: 1px solid #eee;">
            
            <p><strong>Adresse</strong><br>${school.address}</p>
            
            ${school.targetGroup ? `<p><strong>Zielgruppe</strong><br>${school.targetGroup}</p>` : ''}
            
            ${school.offer ? `<p><strong>Angebot</strong><br>${school.offer}</p>` : ''}
            
            ${school.cooperationStatus ? `<p><strong>SoLE-Kooperation</strong><br>${school.cooperationStatus}</p>` : ''}
            
        </div>
    `;
}

/**
 * Get color for category
 */
function getCategoryColor(category) {
    return categoryColors[category] || categoryColors['default'];
}

/**
 * Add markers to map
 */
function addMarkers() {
    schools.forEach(school => {
        if (!Number.isFinite(school.lat) || !Number.isFinite(school.lng)) {
            console.warn(`Skipping ${school.name}: invalid coordinates`);
            return;
        }

        const marker = L.marker([school.lat, school.lng], {
            icon: createMarkerIcon(school.category)
        });

        marker.bindPopup(createPopupContent(school), {
            maxWidth: 300,
            className: 'school-popup'
        });

        allMarkers[school.id] = {
            marker: marker,
            school: school
        };

        markerClusterGroup.addLayer(marker);
    });

    map.addLayer(markerClusterGroup);
}

/**
 * Filter schools by search term, category, and cooperation status
 */
function filterSchools(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Clear all markers
    markerClusterGroup.clearLayers();
    filteredMarkers = [];
    
    // Filter by search term, category, and cooperation status
    Object.values(allMarkers).forEach(item => {
        const school = item.school;
        
        // Check if category is selected
        const categoryMatches = selectedCategories.has(school.category);
        
        // Check if cooperation status is selected (if any are selected)
        const cooperationMatches = selectedCooperationStatus.size === 0 || 
                                   selectedCooperationStatus.has(school.cooperationStatus);
        
        // Check if search term matches
        let searchMatches = true;
        if (term !== '') {
            searchMatches = 
                school.name.toLowerCase().includes(term) ||
                school.address.toLowerCase().includes(term) ||
                school.category.toLowerCase().includes(term) ||
                school.targetGroup.toLowerCase().includes(term) ||
                school.offer.toLowerCase().includes(term) ||
                school.cooperationStatus.toLowerCase().includes(term) ||
                school.details.toLowerCase().includes(term);
        }
        
        // Add marker if all conditions are met
        if (categoryMatches && cooperationMatches && searchMatches) {
            markerClusterGroup.addLayer(item.marker);
            filteredMarkers.push(school);
        }
    });
    
    // Update results list with sorting
    updateResultsList();
}

/**
 * Sort schools array
 */
function sortSchools(schools) {
    const sorted = [...schools];
    
    switch(currentSort) {
        case 'category':
            sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
            break;
        case 'status':
            sorted.sort((a, b) => a.cooperationStatus.localeCompare(b.cooperationStatus) || a.name.localeCompare(b.name));
            break;
        case 'name':
        default:
            sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return sorted;
}

/**
 * Update results list display with sorting
 */
function updateResultsList() {
    const resultsList = document.getElementById('resultsList');
    
    if (filteredMarkers.length === 0) {
        resultsList.innerHTML = '<div class="results-empty">Keine Einrichtungen gefunden, die Ihren Filtern entsprechen.</div>';
        return;
    }
    
    // Sort schools according to current sort preference
    const sortedSchools = sortSchools(filteredMarkers);
    
    // Create sorting controls
    const sortControls = `
        <div class="sort-controls">
            <label for="sortSelect">Sortierung:</label>
            <select id="sortSelect" class="sort-select">
                <option value="name" ${currentSort === 'name' ? 'selected' : ''}>Nach Name</option>
                <option value="category" ${currentSort === 'category' ? 'selected' : ''}>Nach Kategorie</option>
                <option value="status" ${currentSort === 'status' ? 'selected' : ''}>Nach Kooperation</option>
            </select>
            <span class="results-count">${filteredMarkers.length} Treffer</span>
        </div>
    `;
    
    const resultsHTML = sortedSchools.map(school => {
        const color = getCategoryColor(school.category);
        return `
            <div class="result-card" data-school-id="${school.id}">
                <div class="result-card-header">
                    <div class="result-card-icon" style="background-color: ${color};"></div>
                    <h4>${school.name}</h4>
                </div>
                <div style="margin-bottom: 8px;">
                    <span class="result-card-type">${school.category}</span>
                    ${school.cooperationStatus ? `<span class="result-card-status">${school.cooperationStatus}</span>` : ''}
                </div>
                <div class="result-card-content">
                    <p><strong>📍</strong> ${school.address}</p>
                    ${school.phone ? `<p><strong>📞</strong> <a href="tel:${school.phone.replace(/\s+/g, '')}" style="color: #667eea; text-decoration: none;">${school.phone}</a></p>` : ''}
                    ${school.targetGroup ? `<p><strong>👥</strong> ${school.targetGroup}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    resultsList.innerHTML = sortControls + resultsHTML;
    
    // Add sort selector event listener
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            updateResultsList();
        });
    }
    
    // Add click handlers to result cards
    document.querySelectorAll('.result-card').forEach(card => {
        card.addEventListener('click', () => {
            const schoolId = parseInt(card.dataset.schoolId);
            const marker = allMarkers[schoolId].marker;
            marker.openPopup();
            map.setView(marker.getLatLng(), 15);
        });
    });
}

/**
 * Initialize category filters from data
 */
function initializeCategoryFilters() {
    const categories = [...new Set(schools.map(s => s.category))].sort();
    const filterBox = document.querySelector('.filter-options');
    
    // Clear existing filters
    filterBox.innerHTML = '';
    
    // Add filter checkbox for each category
    categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'filter-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'category-filter';
        checkbox.value = category;
        checkbox.checked = true;
        
        const marker = document.createElement('span');
        marker.className = 'filter-marker';
        marker.style.backgroundColor = getCategoryColor(category);
        
        const text = document.createElement('span');
        text.textContent = category;
        
        label.appendChild(checkbox);
        label.appendChild(marker);
        label.appendChild(text);
        filterBox.appendChild(label);
        
        // Initialize selected set
        selectedCategories.add(category);
    });
    
    // Add change handlers
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedCategories.add(e.target.value);
            } else {
                selectedCategories.delete(e.target.value);
            }
            filterSchools(document.getElementById('searchInput').value);
        });
    });
}

/**
 * Initialize cooperation status filters (Phase 4)
 */
function initializeCooperationFilters() {
    const cooperationStatuses = [...new Set(schools.map(s => s.cooperationStatus).filter(s => s))].sort();
    const cooperationBox = document.querySelector('.cooperation-filter-options');
    
    if (!cooperationBox || cooperationStatuses.length === 0) return;
    
    // Clear existing filters
    cooperationBox.innerHTML = '';
    
    cooperationStatuses.forEach(status => {
        const label = document.createElement('label');
        label.className = 'filter-label cooperation-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'cooperation-filter';
        checkbox.value = status;
        
        const dot = document.createElement('span');
        dot.className = 'cooperation-dot';
        dot.textContent = '●';
        
        const text = document.createElement('span');
        text.textContent = status;
        
        label.appendChild(checkbox);
        label.appendChild(dot);
        label.appendChild(text);
        cooperationBox.appendChild(label);
    });
    
    // Add change handlers
    document.querySelectorAll('.cooperation-filter').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedCooperationStatus.add(e.target.value);
            } else {
                selectedCooperationStatus.delete(e.target.value);
            }
            filterSchools(document.getElementById('searchInput').value);
        });
    });
}

/**
 * Export filtered results to CSV (Phase 4)
 */
function exportToCSV() {
    if (filteredMarkers.length === 0) {
        alert('Keine Ergebnisse zum Exportieren verfügbar.');
        return;
    }
    
    // Prepare CSV header
    const headers = ['Name', 'Kategorie', 'Zielgruppe', 'Angebot', 'Adresse', 'Ansprechperson', 'Email', 'Telefon', 'SoLE-Kooperation', 'Details'];
    
    // Prepare CSV rows
    const rows = filteredMarkers.map(school => [
        school.name,
        school.category,
        school.targetGroup,
        school.offer,
        school.address,
        school.contactPerson,
        school.email,
        school.phone,
        school.cooperationStatus,
        school.details
    ]);
    
    // Escape CSV values
    const escapedRows = rows.map(row => 
        row.map(cell => {
            const str = String(cell || '');
            return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(',')
    );
    
    // Create CSV content
    const csv = [headers.join(','), ...escapedRows].join('\n');
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sole-map-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✓ Exported ${filteredMarkers.length} locations to CSV`);
}

/**
 * Share filtered results (Phase 4)
 */
function shareResults() {
    const params = new URLSearchParams();
    
    // Add selected filters to URL
    if (selectedCategories.size > 0) {
        params.set('categories', Array.from(selectedCategories).join(','));
    }
    
    if (selectedCooperationStatus.size > 0) {
        params.set('cooperation', Array.from(selectedCooperationStatus).join(','));
    }
    
    const searchTerm = document.getElementById('searchInput').value;
    if (searchTerm) {
        params.set('search', searchTerm);
    }
    
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
     
    // Try native share API
    if (navigator.share) {
        navigator.share({
            title: 'PH Ludwigsburg - SoLE Karte',
            text: `${filteredMarkers.length} Einrichtungen gefunden`,
            url: url
        }).catch(err => {
            if (err.name !== 'AbortError') {
                fallbackShare(url);
            }
        });
    } else {
        fallbackShare(url);
    }
}

/**
 * Fallback share function
 */
function fallbackShare(url) {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Link in Zwischenablage kopiert!');
}
document.getElementById('searchInput').addEventListener('keyup', (e) => {
    filterSchools(e.target.value);
});

/**
 * Clear search button
 */
document.getElementById('clearSearch').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    filterSchools('');
});

/**
 * Clear filters button
 */
document.getElementById('clearFilters').addEventListener('click', () => {
    // Reset category filters
    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.checked = true;
        selectedCategories.add(checkbox.value);
    });
    
    // Reset cooperation filters
    document.querySelectorAll('.cooperation-filter').forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedCooperationStatus.clear();
    
    // Reset search and sorting
    document.getElementById('searchInput').value = '';
    currentSort = 'name';
    
    filterSchools('');
});

/**
 * Export button (Phase 4)
 */
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
}

/**
 * Share button (Phase 4)
 */
const shareBtn = document.getElementById('shareBtn');
if (shareBtn) {
    shareBtn.addEventListener('click', shareResults);
}

async function initializeApp() {

    await loadCSVData();

    addMarkers();
    initializeCategoryFilters();
    initializeCooperationFilters();

    filterSchools('');

    console.log(`Loaded ${schools.length} locations`);
}

initializeApp();

// Log info to console
console.log(`Map initialized with ${schools.length} locations from ${selectedCategories.size} categories`);
