# 🏃 My Running Page

A personal visualization of my running journey, synced from Garmin Connect.

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
   cd backend
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Garmin credentials** (Choose one method)

   **Option A: Using .env file (Recommended)**
   
   Create `backend/.env` file:
   ```bash
   cd backend
   python run_page/get_garmin_secret.py your-email@example.com your-password
   ```
   
   Then create `.env` file:
   ```
   GARMIN_SECRET=your_secret_string_here
   ```

   **Option B: Using secret.txt file**
   
   Save your Garmin secret to `backend/secret.txt`:
   ```bash
   cd backend
   python run_page/get_garmin_secret.py your-email@example.com your-password > secret.txt
   ```

### Syncing Data

1. **Sync activities from Garmin**
   ```bash
   cd backend
   python main.py sync-garmin
   ```
   
   The app will automatically use credentials from `.env` file or `secret.txt`.
   
   You can also pass credentials directly:
   ```bash
   python main.py sync-garmin --secret YOUR_SECRET
   ```

2. **Generate SVG visualizations**
   ```bash
   cd backend
   # GitHub-style calendar
   python main.py generate-svg --type github --from-db --output ../data/assets/github.svg
   
   # Grid layout by year
   python main.py generate-svg --type grid --from-db --year 2025 --output ../data/assets/year_2025.svg
   ```

### Running Locally

```bash
cd backend
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 5001
```

In a second terminal:

```bash
cd frontend
pnpm run dev
```

Visit `http://localhost:5000` to view your running page. Vite proxies `/api` requests to the backend on port `5001`.

The frontend uses static generated data by default. To opt into the FastAPI endpoints during development, start the frontend with `VITE_USE_TYPED_API=true pnpm run dev`.

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
