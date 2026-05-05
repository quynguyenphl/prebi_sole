# PH Ludwigsburg School Collaborations Map

An interactive Leaflet map showing partner schools collaborating with Pädagogische Hochschule Ludwigsburg.

## Features

**Interactive Map**
- Centered on Ludwigsburg, Germany
- OpenStreetMap base layer
- Smooth zoom and pan controls

**School Markers**
- 8 partner schools marked with colored pins
- Different colors by school type:
  - 🔴 Red: Primary Schools
  - 🔵 Blue: Gymnasiums
  - 🟢 Teal: Secondary Schools
  - 🟠 Light Salmon: Vocational Schools

**Search & Filter**
- Search schools by name, address, or type
- Real-time filtering as you type
- Clear button to reset search

**Marker Clustering**
- Automatic clustering of nearby markers
- Click to expand clusters
- Smooth zoom animations

**Rich Popups**
- School name and type
- Full address with contact info
- Website links
- Links to collaboration events
- School description

## Technologies

- **Leaflet.js** - Interactive map library
- **Leaflet.markercluster** - Marker clustering
- **OpenStreetMap** - Base map tiles
- **Vanilla JavaScript** - Interactivity
- **CSS3** - Responsive design

## Files

- `index.html` - Main map page
- `script.js` - Map logic and interactivity
- `styles.css` - Styling and responsive design
- `data.js` - School data and configuration
- `README.md` - This file

## Local Development

1. Clone or download this repository
2. Open `index.html` in a web browser
3. The map will load immediately

No build process or server required!

## TYPO3 Integration

Embed the map in TYPO3 as an iframe:

```html
<iframe 
    src="https://quynguyenphl.github.io/prebi_sole/" 
    width="100%" 
    height="700"
    style="border: none; border-radius: 8px;"
    title="PH Ludwigsburg School Collaborations Map"
>
</iframe>
```

## Customization

### Adding Schools
Edit `data.js` and add to the `schools` array:

```javascript
{
    id: 9,
    name: "Your School",
    type: "gymnasium", // primary, secondary, gymnasium, vocational
    lat: 48.XXXX,
    lng: 8.XXXX,
    address: "Street Address",
    contact: "+49 7141 XXX",
    website: "https://example.com",
    event: "https://events-page",
    description: "School description"
}
```

### Changing Colors
Edit `typeColors` in `data.js`:

```javascript
const typeColors = {
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    gymnasium: "#45B7D1",
    vocational: "#FFA07A"
};
```

### Map Styling
Edit `styles.css` for colors, fonts, and layout.

## License

Creative Commons Attribution 4.0 International
