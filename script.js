// Initialize map centered on Ludwigsburg
const map = L.map('map').setView([48.9000, 8.9000], 13);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Create marker cluster group
const markerClusterGroup = L.markerClusterGroup();

// Store all markers for filtering
let allMarkers = {};
let filteredMarkers = [];
let selectedTypes = new Set(['primary', 'secondary', 'gymnasium', 'vocational']);

/**
 * Create custom marker icon
 */
function createMarkerIcon(color) {
    return L.divIcon({
        html: `<div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
        "></div>`,
        iconSize: [36, 36],
        className: 'custom-marker'
    });
}

/**
 * Create popup content
 */
function createPopupContent(school) {
    return `
        <div class="popup-content">
            <h3>${school.name}</h3>
            <span class="popup-type">${capitalizeFirst(school.type)}</span>
            <p><strong>📍</strong> ${school.address}</p>
            <p><strong>📞</strong> <a href="tel:${school.contact}">${school.contact}</a></p>
            <p><strong>🌐</strong> <a href="${school.website}" target="_blank">Website</a></p>
            <p><strong>📅</strong> <a href="${school.event}" target="_blank">Collaboration Events</a></p>
            <p><em>${school.description}</em></p>
        </div>
    `;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Add markers to map
 */
function addMarkers() {
    schools.forEach(school => {
        const color = typeColors[school.type];
        const marker = L.marker([school.lat, school.lng], {
            icon: createMarkerIcon(color)
        });
        
        marker.bindPopup(createPopupContent(school), {
            maxWidth: 300,
            className: 'school-popup'
        });
        
        // Store marker reference
        allMarkers[school.id] = {
            marker: marker,
            school: school
        };
        
        // Add to cluster group
        markerClusterGroup.addLayer(marker);
    });
    
    // Add cluster group to map
    map.addLayer(markerClusterGroup);
}

/**
 * Filter schools by search term and type
 */
function filterSchools(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // Clear all markers
    markerClusterGroup.clearLayers();
    filteredMarkers = [];
    
    // Filter by search term and type
    Object.values(allMarkers).forEach(item => {
        const school = item.school;
        
        // Check if type is selected
        const typeMatches = selectedTypes.has(school.type);
        
        // Check if search term matches
        let searchMatches = true;
        if (term !== '') {
            searchMatches = 
                school.name.toLowerCase().includes(term) ||
                school.address.toLowerCase().includes(term) ||
                school.type.toLowerCase().includes(term) ||
                school.description.toLowerCase().includes(term);
        }
        
        // Add marker if both conditions are met
        if (typeMatches && searchMatches) {
            markerClusterGroup.addLayer(item.marker);
            filteredMarkers.push(school);
        }
    });
    
    // Update results list
    updateResultsList();
}

/**
 * Update results list display
 */
function updateResultsList() {
    const resultsList = document.getElementById('resultsList');
    
    if (filteredMarkers.length === 0) {
        resultsList.innerHTML = '<div class="results-empty">No schools match your filters.</div>';
        return;
    }
    
    // Sort by name
    const sortedSchools = [...filteredMarkers].sort((a, b) => a.name.localeCompare(b.name));
    
    resultsList.innerHTML = sortedSchools.map(school => {
        const color = typeColors[school.type];
        return `
            <div class="result-card" data-school-id="${school.id}">
                <div class="result-card-header">
                    <div class="result-card-icon" style="background-color: ${color};"></div>
                    <h4>${school.name}</h4>
                </div>
                <div style="margin-bottom: 8px;">
                    <span class="result-card-type">${capitalizeFirst(school.type)}</span>
                </div>
                <div class="result-card-content">
                    <p><strong>📍</strong> ${school.address}</p>
                    <p><strong>📞</strong> <a href="tel:${school.contact}" style="color: #667eea; text-decoration: none;">${school.contact}</a></p>
                    <p><strong>🌐</strong> <a href="${school.website}" target="_blank" style="color: #667eea; text-decoration: none;">Website</a></p>
                </div>
            </div>
        `;
    }).join('');
    
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
 * Search input handler
 */
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
 * Type filter checkboxes handler
 */
document.querySelectorAll('.type-filter').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            selectedTypes.add(e.target.value);
        } else {
            selectedTypes.delete(e.target.value);
        }
        filterSchools(document.getElementById('searchInput').value);
    });
});

/**
 * Clear filters button
 */
document.getElementById('clearFilters').addEventListener('click', () => {
    document.querySelectorAll('.type-filter').forEach(checkbox => {
        checkbox.checked = true;
    });
    document.getElementById('searchInput').value = '';
    selectedTypes = new Set(['primary', 'secondary', 'gymnasium', 'vocational']);
    filterSchools('');
});

// Initialize map
addMarkers();

// Center map on Ludwigsburg
map.setView([48.9000, 8.9000], 13);

// Optional: Log info to console
console.log(`Map initialized with ${schools.length} schools`);
