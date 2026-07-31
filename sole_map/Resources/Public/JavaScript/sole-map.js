(function () {
    'use strict';

    const center = [48.8974, 9.1916];
    const categoryColors = {
        'Kinder- und Familienzentrum': '#c7473d',
        'Offenes Angebot': '#25857d',
        'Bibliothek': '#287aa1',
        'Bildungshaus': '#bd6c3f',
        'Seniorenzentrum': '#56826f',
        default: '#5d6570'
    };

    const escapeHtml = (value) => String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    function initialize(root) {
        const find = (selector) => root.querySelector(selector);
        const findAll = (selector) => root.querySelectorAll(selector);
        const search = find('[data-role="search"]');
        const results = find('[data-role="results"]');
        const error = find('[data-role="error"]');
        const map = L.map(find('[data-role="map"]')).setView(center, 13);
        const clusters = L.markerClusterGroup();
        const selectedCategories = new Set();
        const selectedStatuses = new Set();
        const markers = new Map();
        let locations = [];
        let filtered = [];
        let sortBy = 'name';

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        map.addLayer(clusters);

        function colorFor(category) {
            return categoryColors[category] || categoryColors.default;
        }

        function markerIcon(category) {
            return L.divIcon({
                html: `<span class="sole-map-marker" style="--marker-color:${colorFor(category)}" aria-hidden="true"></span>`,
                iconSize: [32, 40],
                iconAnchor: [16, 40],
                popupAnchor: [0, -36],
                className: ''
            });
        }

        function popup(location) {
            return `<div class="sole-map-popup">
                <h3>${escapeHtml(location.name)}</h3>
                <span>${escapeHtml(location.category)}</span>
                <p><strong>Adresse</strong><br>${escapeHtml(location.address)}</p>
                ${location.targetGroup ? `<p><strong>Zielgruppe</strong><br>${escapeHtml(location.targetGroup)}</p>` : ''}
                ${location.offer ? `<p><strong>Angebot</strong><br>${escapeHtml(location.offer)}</p>` : ''}
                ${location.status ? `<p><strong>SoLE-Kooperation</strong><br>${escapeHtml(location.status)}</p>` : ''}
            </div>`;
        }

        function addMarkers() {
            locations.forEach((location) => {
                if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
                    return;
                }
                const marker = L.marker([location.lat, location.lng], {
                    icon: markerIcon(location.category)
                }).bindPopup(popup(location), { maxWidth: 320 });
                markers.set(location.id, marker);
            });
        }

        function sortedLocations() {
            return [...filtered].sort((first, second) => {
                if (sortBy === 'category') {
                    return first.category.localeCompare(second.category, 'de') || first.name.localeCompare(second.name, 'de');
                }
                if (sortBy === 'status') {
                    return first.status.localeCompare(second.status, 'de') || first.name.localeCompare(second.name, 'de');
                }
                return first.name.localeCompare(second.name, 'de');
            });
        }

        function renderResults() {
            if (!filtered.length) {
                results.innerHTML = '<p class="sole-map-empty">Keine Einrichtungen gefunden.</p>';
                return;
            }

            results.innerHTML = `<div class="sole-map-sort">
                <label>Sortierung:
                    <select data-role="sort">
                        <option value="name"${sortBy === 'name' ? ' selected' : ''}>Nach Name</option>
                        <option value="category"${sortBy === 'category' ? ' selected' : ''}>Nach Kategorie</option>
                        <option value="status"${sortBy === 'status' ? ' selected' : ''}>Nach Kooperation</option>
                    </select>
                </label>
                <strong>${filtered.length} Treffer</strong>
            </div>${sortedLocations().map((location) => `
                <button type="button" class="sole-map-result" data-location-id="${location.id}" style="--result-color:${colorFor(location.category)}">
                    <span class="sole-map-result-title">${escapeHtml(location.name)}</span>
                    <span class="sole-map-tags">${escapeHtml(location.category)}${location.status ? ` · ${escapeHtml(location.status)}` : ''}</span>
                    <span>${escapeHtml(location.address)}</span>
                    ${location.targetGroup ? `<span>Zielgruppe: ${escapeHtml(location.targetGroup)}</span>` : ''}
                </button>`).join('')}`;

            find('[data-role="sort"]').addEventListener('change', (event) => {
                sortBy = event.target.value;
                renderResults();
            });
            findAll('[data-location-id]').forEach((card) => card.addEventListener('click', () => {
                const marker = markers.get(Number(card.dataset.locationId));
                map.setView(marker.getLatLng(), 15);
                marker.openPopup();
                find('[data-role="map"]').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }));
        }

        function applyFilters() {
            const term = search.value.trim().toLocaleLowerCase('de');
            clusters.clearLayers();
            filtered = locations.filter((location) => {
                const text = [location.name, location.address, location.category, location.targetGroup, location.offer, location.status, location.details]
                    .join(' ').toLocaleLowerCase('de');
                return selectedCategories.has(location.category)
                    && (!selectedStatuses.size || selectedStatuses.has(location.status))
                    && (!term || text.includes(term));
            });
            filtered.forEach((location) => clusters.addLayer(markers.get(location.id)));
            renderResults();
        }

        function createFilter(container, value, selected, set, className) {
            const label = document.createElement('label');
            label.className = 'sole-map-filter-option';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = value;
            checkbox.checked = selected;
            checkbox.className = className;
            const swatch = document.createElement('span');
            swatch.className = 'sole-map-swatch';
            swatch.style.backgroundColor = colorFor(value);
            label.append(checkbox, swatch, document.createTextNode(value));
            container.append(label);
            if (selected) set.add(value);
            checkbox.addEventListener('change', () => {
                checkbox.checked ? set.add(value) : set.delete(value);
                applyFilters();
            });
        }

        function createFilters() {
            const categories = [...new Set(locations.map((location) => location.category).filter(Boolean))].sort();
            const statuses = [...new Set(locations.map((location) => location.status).filter(Boolean))].sort();
            const categoryContainer = find('[data-role="category-filters"]');
            const statusContainer = find('[data-role="cooperation-filters"]');
            categories.forEach((category) => createFilter(categoryContainer, category, true, selectedCategories, 'sole-map-category'));
            statuses.forEach((status) => createFilter(statusContainer, status, false, selectedStatuses, 'sole-map-status'));
            statusContainer.querySelectorAll('.sole-map-swatch').forEach((swatch) => swatch.classList.add('sole-map-status-swatch'));
        }

        function exportCsv() {
            if (!filtered.length) return;
            const values = (cells) => cells.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(';');
            const rows = filtered.map((location) => values([
                location.category, location.name, location.targetGroup, location.offer, location.address,
                location.contact, location.email, location.phone, location.status, location.details,
                location.lat, location.lng
            ]));
            const csv = `\uFEFF${values(['Art der Einrichtung/des Projekts', 'Name', 'Zielgruppe', 'Angebot', 'Adresse', 'Kontaktperson', 'Mail', 'Telefon', 'SoLE-Kooperation', 'Was', 'Lat', 'Lng'])}\n${rows.join('\n')}`;
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
            link.download = `sole-map-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        }

        function share() {
            const url = new URL(window.location.href);
            search.value ? url.searchParams.set('sole-search', search.value) : url.searchParams.delete('sole-search');
            navigator.clipboard.writeText(url.toString()).then(() => window.alert('Link in Zwischenablage kopiert.'));
        }

        search.addEventListener('input', applyFilters);
        find('[data-action="clear-search"]').addEventListener('click', () => {
            search.value = '';
            applyFilters();
        });
        find('[data-action="clear-filters"]').addEventListener('click', () => {
            findAll('.sole-map-category').forEach((checkbox) => { checkbox.checked = true; selectedCategories.add(checkbox.value); });
            findAll('.sole-map-status').forEach((checkbox) => { checkbox.checked = false; });
            selectedStatuses.clear();
            search.value = '';
            applyFilters();
        });
        find('[data-action="export"]').addEventListener('click', exportCsv);
        find('[data-action="share"]').addEventListener('click', share);

        Papa.parse(root.dataset.csvUrl, {
            download: true,
            header: true,
            delimiter: ';',
            skipEmptyLines: true,
            complete: ({ data }) => {
                locations = data.map((row, index) => ({
                    id: index + 1,
                    category: row['Art der Einrichtung/des Projekts'] || '',
                    name: row.Name || '',
                    targetGroup: row.Zielgruppe || '',
                    offer: row.Angebot || '',
                    address: row.Adresse || '',
                    contact: row.Kontaktperson || '',
                    email: row.Mail || '',
                    phone: row.Telefon || '',
                    status: row['SoLE-Kooperation'] || '',
                    details: row.Was || '',
                    lat: Number.parseFloat(row.Lat),
                    lng: Number.parseFloat(row.Lng)
                })).filter((location) => Number.isFinite(location.lat) && Number.isFinite(location.lng));
                addMarkers();
                createFilters();
                search.value = new URL(window.location.href).searchParams.get('sole-search') || '';
                applyFilters();
                map.invalidateSize();
            },
            error: () => {
                error.hidden = false;
                error.textContent = 'Die Kartendaten konnten nicht geladen werden.';
            }
        });
    }

    window.addEventListener('DOMContentLoaded', () => {
        if (typeof L === 'undefined' || typeof Papa === 'undefined') return;
        document.querySelectorAll('.sole-map-app').forEach(initialize);
    });
}());