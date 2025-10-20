# 🏃 My Running Page

A personal visualization of my running journey, synced from Garmin Connect.

![Running Page Demo](https://user-images.githubusercontent.com/15976103/98808834-c02f1d80-2457-11eb-9a7c-70e91faa5e30.gif)

## 📊 Stats Overview

Track my running activities with beautiful visualizations including:
- Interactive map showing all running routes
- Calendar heatmap of activities
- Yearly and monthly statistics
- Location-based running data

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Map**: Mapbox GL JS
- **Data Source**: Garmin Connect
- **Visualization**: SVG heatmaps and charts

## 🚀 Setup

### Prerequisites

- Python >= 3.11
- Node.js >= 20
- Garmin Connect account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd running_page
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Configure Garmin credentials**
   
   Create `config.yaml`:
   ```yaml
   sync:
     garmin:
       authentication_domain: Global  # or CN for China
       email: your-email@example.com
       password: your-password
   ```

### Syncing Data

1. **Get Garmin authentication secret**
   ```bash
   python run_page/get_garmin_secret.py your-email@example.com your-password
   ```
   This will save credentials to `secret.txt`

2. **Sync activities from Garmin**
   ```bash
   python run_page/garmin_sync.py
   ```

3. **Generate SVG visualizations**
   ```bash
   # GitHub-style calendar
   python run_page/gen_svg.py --from-db --title "Running Page" --type github --athlete "Your Name" --special-distance 10 --special-distance2 20 --special-color yellow --special-color2 red --output assets/github.svg --use-localtime --min-distance 0.5

   # Grid layout
   python run_page/gen_svg.py --from-db --title "Running Grid" --type grid --athlete "Your Name" --output assets/grid.svg --min-distance 0.5 --special-color yellow --special-color2 red --special-distance 10 --special-distance2 20 --use-localtime
   ```

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to view your running page.

## ⚙️ Configuration

### Map Settings

Edit `src/utils/const.ts` to customize:

```typescript
// Map display
const PRIVACY_MODE = false;        // Hide background map
const LIGHTS_ON = false;           // Show/hide map details
const USE_DASH_LINE = true;        // Dashed route lines
const LINE_OPACITY = 0.4;          // Route transparency
const MAP_HEIGHT = 600;            // Map height in pixels

// Features
const SHOW_ELEVATION_GAIN = false; // Show elevation data
const ROAD_LABEL_DISPLAY = true;   // Show street names
```

### Site Metadata

Edit `src/static/site-metadata.ts`:

```typescript
const data = {
  siteTitle: 'Running Page',
  siteUrl: 'https://your-url.com',
  description: 'Personal running page',
  navLinks: [
    {
      name: 'Summary',
      url: '/summary',
    },
  ],
};
```

## 📦 Project Structure

```
running_page/
├── run_page/              # Python sync scripts
│   ├── garmin_sync.py    # Sync Garmin data
│   ├── gen_svg.py        # Generate visualizations
│   └── utils.py          # Helper functions
├── src/                   # React frontend
│   ├── components/       # UI components
│   ├── pages/           # Page components
│   ├── static/          # Static data & config
│   └── utils/           # Frontend utilities
├── GPX_OUT/              # Downloaded GPX files
├── assets/               # Generated SVG assets
└── activities.json       # Processed activity data
```

## 🎨 Customization

### Colors

Routes are color-coded by activity type in `src/utils/const.ts`:
- Running: Light blue (`#47b8e0`)
- Trail Running: Orange
- Cycling: Green
- Hiking/Walking: Purple

### Theme

Toggle between light/dark mode using the theme switcher in the UI.

## 📝 License

MIT

## 🙏 Credits

Based on [yihong0618/running_page](https://github.com/yihong0618/running_page)

---

**Keep running, keep tracking!** 🏃‍♂️💨
