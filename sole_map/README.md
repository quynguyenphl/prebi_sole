# SoLE Map TYPO3 extension

TYPO3 v12 LTS and v13 LTS content plugin for the PH Ludwigsburg SoLE cooperation partner map.

## Installation

### Composer installation

Copy this directory to `packages/sole_map` in the TYPO3 project, add it as a path repository if necessary, and run:

```bash
composer req ph-ludwigsburg/sole-map:@dev
vendor/bin/typo3 extension:setup
vendor/bin/typo3 cache:flush
```

### Classic installation

Copy this directory to `typo3conf/ext/sole_map`, activate **SoLE Kooperationspartner-Karte** in the Extension Manager, and flush all caches.

## Add the map to a page

1. Edit a TYPO3 page.
2. Add a new **Plugin** content element.
3. Select **SoLE Kooperationspartner-Karte**.
4. Save and publish the page.

The TypoScript setup is registered by the extension. No database migration or scheduler task is required.

## Test before installing in production

### Quick map-only dry run

This verifies the CSV data, markers, search, filters, export, sharing, and responsive layout without TYPO3.

1. From the repository root, start a local web server:

	```bash
	python3 -m http.server 8000
	```

2. Open `http://localhost:8000` in a browser.
3. Check that every expected location appears and that the browser console contains no errors.
4. Test search, every filter, CSV export, the share button, and a narrow mobile-sized browser window.

Do not open `index.html` directly because browsers block the CSV request from a `file://` URL. This test exercises the standalone frontend, not TYPO3 registration or Fluid rendering.

### TYPO3 dry run

Use a disposable local TYPO3 installation or a staging copy that has the same TYPO3 major version and site package as production. Do not use the production site for the first installation.

For a complete beginner walkthrough using DDEV on macOS, follow [Disposable local TYPO3 tutorial](Documentation/LocalTypo3Tutorial.md). It covers installation from an empty computer through plugin testing and cleanup.

1. Install the extension using the Composer or classic steps above.
2. Run `vendor/bin/typo3 extension:setup` when using Composer mode.
3. Flush all TYPO3 caches.
4. Add **SoLE Kooperationspartner-Karte** to a hidden test page.
5. Open the page in the frontend and complete this checklist:

	- The map and OpenStreetMap tiles load.
	- The number of results matches the valid CSV rows.
	- Search, category filters, cooperation filters, sorting, popups, export, and sharing work.
	- The page works at desktop and mobile widths.
	- The browser console and Network panel show no JavaScript, CSV, CSP, or `404` errors.
	- A normal TYPO3 text or image element on the same page keeps its existing styling.

After this passes, deploy the same tested extension version to production through the site's normal release process.

### Network requirement

“Local” means the web server runs on your computer. The current extension is not fully offline: it needs internet access for its JavaScript/CSS libraries and OpenStreetMap tiles. A fully disconnected version must package the libraries locally and use a separately hosted tile service or tile archive.

## Update the data

Keep Excel as the source of truth. Use this process for each update:

1. Export the sheet as **CSV UTF-8** with semicolons.
2. Keep the filename `PraxisstellenSoLE_Karte.csv`.
3. Confirm that the header contains these 12 columns in this order:

	```text
	Art der Einrichtung/des Projekts;Name;Zielgruppe;Angebot;Adresse;Kontaktperson;Mail;Telefon;SoLE-Kooperation;Was;Lat;Lng
	```

4. Keep empty cells as empty CSV fields. Use decimal points, not commas, in `Lat` and `Lng`.
5. Replace the root `PraxisstellenSoLE_Karte.csv` and perform the quick map-only dry run above.
6. After approval, copy the same tested file to:

```text
Resources/Public/Data/PraxisstellenSoLE_Karte.csv
```

7. Test the extension on the hidden TYPO3 test page.
8. Deploy the updated extension package and flush TYPO3's frontend caches. Hard-refresh the browser when checking the result.

In a Composer installation, update the source under `packages/sole_map` or the extension's source repository and run the normal Composer deployment. Do not edit `vendor/ph-ludwigsburg/sole-map`, because the next Composer install or deployment will overwrite that change.

For classic TYPO3 installations, replace the CSV under `typo3conf/ext/sole_map/Resources/Public/Data/` and flush all caches. Keep a copy of the changed extension in version control so the update is reproducible.

## External services

The frontend currently loads libraries and map tiles from these HTTPS hosts:

```text
cdnjs.cloudflare.com
cdn.jsdelivr.net
*.tile.openstreetmap.org
```

These hosts must be permitted by the site's Content Security Policy and firewall. For a site that forbids CDN assets, download Leaflet, MarkerCluster, and PapaParse into `Resources/Public/Vendor` and change the asset URLs in `Resources/Private/Templates/Map/Show.html`.