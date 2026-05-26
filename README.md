# PH Ludwigsburg – SoLE Kooperationspartner-Karte

Interactive map application for visualizing cooperation partners, educational institutions, and SoLE-related practice locations of Pädagogische Hochschule Ludwigsburg.

The application is built with Leaflet and uses CSV-based data maintained in Excel.

---

# Features

## Interactive Map

* Leaflet-based interactive map
* OpenStreetMap tiles
* Marker clustering
* Responsive desktop/mobile layout
* Category-specific icons

## Data Management

* Excel as single source of truth
* Simple CSV workflow
* Easy maintenance

## Search & Filtering

Search by:

* Name
* Address
* Offer
* Target group
* Cooperation status

Filter by:

* Einrichtung/Projekt category
* SoLE cooperation status

## PH Ludwigsburg Design

The interface follows the visual direction of the PH Ludwigsburg corporate design:

* institutional green color palette
* structured academic layout
* responsive interface
* minimal UI

## Export & Sharing

* Export filtered results as CSV
* Share filtered map state via URL

---

# Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── PraxisstellenSoLE_Karte.csv
└── README.md
```

---

# Data Workflow

The project uses a lightweight CSV workflow.

```text
Excel Template
    ↓
Add coordinates
    ↓
Export as CSV UTF-8
    ↓
Upload to repository
    ↓
Map updates automatically
```

No backend or build step is required.

---

# Excel Template

The Excel file must contain the following columns:

| Column                           | Description          |
| -------------------------------- | -------------------- |
| Art der Einrichtung/des Projekts | Institution category |
| Name                             | Institution name     |
| Zielgruppe                       | Target group         |
| Angebot                          | Offer/services       |
| Adresse                          | Full address         |
| Kontaktperson                    | Contact person       |
| Mail                             | Email                |
| Telefon                          | Phone number         |
| SoLE-Kooperation                 | Cooperation status   |
| Was                              | Additional details   |
| Lat                              | Latitude             |
| Lng                              | Longitude            |

---

# Adding Coordinates

Coordinates are added manually using Google Maps or OpenStreetMap.

## Option 1 — Google Maps

1. Open [Google Maps](https://maps.google.com?utm_source=chatgpt.com)
2. Search for the address
3. Right click the location
4. Copy coordinates
5. Paste into `Lat` and `Lng`

Example:

```text
48.8974, 9.1916
```

becomes:

| Lat     | Lng    |
| ------- | ------ |
| 48.8974 | 9.1916 |

---

## Option 2 — OpenStreetMap

1. Open [OpenStreetMap](https://www.openstreetmap.org?utm_source=chatgpt.com)
2. Search the address
3. Right click → “Show address”
4. Copy coordinates into Excel

---

# Important CSV Rules

## Use Full Addresses

Good:

```text
Erdmannhäuserstraße 7, Ludwigsburg
```

Avoid incomplete addresses.

---

## Every Row Must Have All Columns

Even empty columns need separators.

Correct:

```text
Kontakt;;48.9090;9.1772
```

Incorrect:

```text
Kontakt;48.9090;9.1772
```

---

## Coordinates Must Use Decimal Points

Correct:

```text
48.9090
```

Incorrect:

```text
48,9090
```

---

# Export Excel as CSV

In Excel:

```text
Datei → Speichern unter → CSV UTF-8
```

Save as:

```text
PraxisstellenSoLE_Karte.csv
```

Replace the existing CSV file in the repository.

---

# Running the Application

## Local Development

Use a local web server.

Example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Do not open `index.html` directly via double-click because CSV loading requires a local server.

---

# Layout

## Desktop

```text
Header
Search
Filters + Map
Results
```

## Mobile

```text
Header
Search
Filters
Map
Results
```

---

# Technologies

* Leaflet
* Leaflet MarkerCluster
* PapaParse
* OpenStreetMap
* Font Awesome

---

# Credits

Developed for the SoLE cooperation partner mapping initiative at Pädagogische Hochschule Ludwigsburg.

Map data © OpenStreetMap contributors.
