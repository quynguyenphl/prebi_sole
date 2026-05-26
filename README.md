# PH Ludwigsburg – SoLE Kooperationspartner-Karte

Interactive map application for visualizing cooperation partners, educational institutions, and SoLE-related practice locations of Pädagogische Hochschule Ludwigsburg.

The application is built with Leaflet and uses real Excel-based data transformed into map-ready JSON/JavaScript objects.

---

## Features

### Interactive Map

* Leaflet-based interactive map
* OpenStreetMap tiles
* Marker clustering
* Responsive desktop/mobile layout

### Real Data Pipeline

* Excel (`.xlsx`) as single source of truth
* Automatic transformation into `data.js`
* Address geocoding with latitude/longitude generation
* Local geocode caching

### Search & Filtering

Search by:

* Name
* Address
* Offer
* Target group
* Cooperation status

Filter by:

* Einrichtung/Projekt category
* SoLE cooperation status

### PH Ludwigsburg Design

The interface is visually aligned with the corporate design of PH Ludwigsburg:

* institutional green color palette
* structured academic layout
* minimal UI
* responsive desktop/mobile design

### Export & Sharing

* Export filtered results as CSV
* Share filtered map state via URL

---

# Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── data.js
├── PraxisstellenSoLE_Karte.xlsx
├── geocode-cache.json
├── package.json
└── scripts
    └── generate-data.js
```

---

# Data Structure

The application uses a normalized structure generated from Excel rows.

Example:

```js
{
  id: 1,
  name: "KiFaZ Poppenweiler",
  category: "Kinder- und Familienzentrum",
  targetGroup: "(Klein-)Kinder, Familien",
  offer: "Offene Treffs, Betreuung, Kurse",
  address: "Erdmannhäuserstraße 7, Ludwigsburg",
  contactPerson: "Max Mustermann",
  email: "example@example.de",
  phone: "07141 123456",
  cooperationStatus: "Seminarkooperation",
  details: "Zusätzliche Informationen",
  lat: 48.8974,
  lng: 9.1916
}
```

---

# Excel Template

The generator expects the following columns:

| Excel Column                     | Description        |
| -------------------------------- | ------------------ |
| Art der Einrichtung/des Projekts | Category           |
| Name                             | Institution name   |
| Zielgruppe                       | Target group       |
| Angebot                          | Offer/services     |
| Adresse                          | Postal address     |
| Kontaktperson                    | Contact person     |
| Mail                             | Email              |
| Telefon                          | Phone number       |
| SoLE-Kooperation                 | Cooperation status |
| Was                              | Additional details |

---

# Installation

## 1. Clone repository

```bash
git clone https://github.com/quynguyenphl/prebi_sole.git
cd prebi_sole
```

## 2. Install dependencies

```bash
npm install
```

---

# Generate Data from Excel

Run:

```bash
npm run generate-data
```

This will:

1. Read the Excel file
2. Validate rows
3. Geocode addresses
4. Cache coordinates
5. Generate `data.js`

---

# Geocoding

The project uses OpenStreetMap Nominatim for address geocoding.

Workflow:

```text
Excel Address
    ↓
Geocoding
    ↓
Latitude / Longitude
    ↓
data.js
```

To avoid repeated requests, coordinates are cached in:

```text
geocode-cache.json
```

---

# Running the Application

Open locally with:

```bash
npx serve
```

or use VSCode Live Server.

Then visit:

```text
http://localhost:3000
```

---

# Layout

Desktop layout:

```text
Header
Search
Filters + Map
Results
```

Mobile layout:

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
* OpenStreetMap
* Node.js
* XLSX
* Font Awesome

---

# Credits

Developed for the SoLE cooperation partner mapping initiative at Pädagogische Hochschule Ludwigsburg.

Map data © OpenStreetMap contributors.
