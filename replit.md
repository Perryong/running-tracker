# Running Page - Perry's Running Tracker

## Overview
A personal running tracker application built with React, Vite, and Mapbox GL that visualizes running activities with interactive maps and statistics. Successfully migrated from Vercel to Replit and reorganized with clean frontend/backend separation on October 26, 2025.

**Supported Data Sources**: Garmin Connect and Strava only.

## Current State
The application is successfully running on Replit with:
- Clean separation of frontend and backend code
- Development server running on port 5000 from `/frontend` directory
- All dependencies installed via pnpm
- Vite configured for Replit environment (0.0.0.0:5000)
- Deployment configuration set for autoscale
- Shared data directory accessible to both frontend and backend

## Tech Stack
- **Frontend**: React 18.2.0, TypeScript
- **Build Tool**: Vite 7.1.2
- **Maps**: Mapbox GL 2.15.0, react-map-gl 7.1.6
- **Styling**: Tailwind CSS 4.1.10
- **Package Manager**: pnpm 8.9.0
- **Backend**: Python 3.x for data processing (Garmin sync, SVG generation)

## Project Structure
```
/
├── frontend/              # React/Vite application
│   ├── src/              # React source code
│   │   ├── components/   # UI components (ActivityList, RunMap, Header, etc.)
│   │   ├── pages/        # Route pages (index, total, 404)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   ├── styles/       # CSS files
│   │   └── static/       # Static TypeScript data (city.ts, run_countries.ts)
│   ├── public/           # Static assets
│   ├── vite.config.ts    # Vite configuration
│   ├── tsconfig.json     # TypeScript configuration
│   ├── package.json      # Node dependencies
│   └── index.html        # HTML entry point
│
├── backend/              # Python data processing
│   ├── main.py           # Main entry point for all backend operations
│   ├── run_page/         # Python scripts
│   │   ├── generator/    # Activity data generators
│   │   ├── gpxtrackposter/ # SVG poster generation
│   │   ├── config.py     # Backend configuration
│   │   ├── garmin_sync.py # Garmin data sync
│   │   ├── gen_svg.py    # SVG generation script
│   │   ├── utils.py      # Utility functions
│   │   └── data.db       # SQLite database
│   ├── requirements.txt  # Python dependencies
│   ├── pyproject.toml    # Python project config
│   └── config-example.yaml # Example Garmin config
│
├── data/                 # Shared data (accessed by both frontend & backend)
│   ├── GPX_OUT/         # GPX activity files (downloaded from Garmin/Strava)
│   ├── FIT_OUT/         # FIT activity files (downloaded from Garmin/Strava)
│   ├── TCX_OUT/         # TCX activity files (downloaded from Garmin/Strava)
│   ├── activities/      # Processed activity data
│   ├── assets/          # Generated SVG files (github.svg, year_*.svg)
│   └── activities.json  # Generated activities JSON (consumed by frontend)
│
├── README.md            # Project documentation
├── LICENSE              # License file
└── replit.md           # This file
```

## Recent Changes
- **2025-10-26**: Migrated from Vercel to Replit
  - Updated vite.config.ts with server configuration for Replit (host: 0.0.0.0, port: 5000)
  - Configured development workflow to run from `frontend/` directory
  - Set up autoscale deployment with build and preview commands
  - Installed dependencies with pnpm

- **2025-10-26**: Reorganized codebase for clean separation
  - Separated frontend code into `/frontend` directory
  - Separated backend code into `/backend` directory
  - Created shared `/data` directory for activity data and generated assets
  - Updated all path references in Python scripts to point to `/data`
  - Updated TypeScript configuration with proper module resolution
  - Fixed import paths in frontend code to reference shared data
  - Added Vite resolve aliases for @data and @assets paths

- **2025-10-27**: Cleaned up data sources and reorganized backend
  - Removed Endomondo support (keeping only Garmin and Strava)
  - Removed ENDOMONDO_FILE_DIR and PNG_FOLDER from backend configuration
  - Created main.py as the primary backend entry point
  - Organized backend with standard Python CLI structure

## Mapbox Configuration
The application uses a Mapbox token in `frontend/src/utils/const.ts` (line 6). 

**For production use**, it's recommended to:
1. Create your own Mapbox account at https://www.mapbox.com/
2. Generate a new access token with URL restrictions
3. Replace the `MAPBOX_TOKEN` value in `frontend/src/utils/const.ts`

## Supported Data Sources
This application supports **Garmin Connect** and **Strava** only:
- **Garmin Connect**: Sync activities directly from your Garmin account
- **Strava**: Sync activities from your Strava account

Other data sources (Endomondo, Nike+, etc.) are not supported.

## Backend Data Processing
The Python backend scripts handle:
- Syncing activity data from Garmin Connect and Strava
- Processing GPX/FIT/TCX files
- Generating SVG visualizations (GitHub-style activity heatmap, yearly summaries)
- Creating `activities.json` for frontend consumption

### Configuration
- Garmin credentials should be in `backend/config.yaml` (see `backend/config-example.yaml`)
- Strava API credentials configured in backend scripts
- All data is stored in the `/data` directory
- SQLite database is at `backend/run_page/data.db`

## Available Scripts

### Frontend (run from `frontend/` directory)
- `pnpm run dev` - Start development server (port 5000)
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier

### Backend (run from `backend/` directory)

**Main Entry Point**: Use `main.py` for all backend operations

**Sync Activities:**
- `python3 main.py sync-garmin --secret YOUR_SECRET` - Sync from Garmin Connect
- `python3 main.py sync-garmin --secret YOUR_SECRET --format fit` - Sync FIT files
- `python3 main.py sync-garmin --secret YOUR_SECRET --is-cn` - Use Garmin China

**Generate Visualizations:**
- `python3 main.py generate-svg --type github --from-db --output ../data/assets/github.svg` - GitHub-style heatmap
- `python3 main.py generate-svg --type grid --from-db --year 2024 --output ../data/assets/year_2024.svg` - Yearly grid
- `python3 main.py generate-svg --type circular --from-db --output ../data/assets/circular.svg` - Circular poster

**Get Garmin Secret:**
- `python3 run_page/get_garmin_secret.py EMAIL PASSWORD` - Get authentication secret for Garmin
- `python3 run_page/get_garmin_secret.py EMAIL PASSWORD --is-cn` - For Garmin China accounts

**Legacy Scripts** (still available):
- `python3 run_page/garmin_sync.py` - Direct Garmin sync script
- `python3 run_page/gen_svg.py` - Direct SVG generation script

## Deployment
Configured for Replit autoscale deployment:
- Build: `cd frontend && pnpm run build`
- Run: `cd frontend && pnpm run preview`
- Serves the built Vite app on port 5000

## Development Workflow
1. **Frontend Development**: Run `cd frontend && pnpm run dev` to start the dev server
2. **Backend Processing**: Run Python scripts from the root or backend directory to process activity data
3. **Data Flow**: Backend generates `data/activities.json` and SVG files → Frontend imports and displays them

## Notes
- The project uses a monorepo structure with clear separation of concerns
- Activity data is stored in `/data` and accessible to both frontend and backend
- Frontend is completely static and can be deployed to any CDN
- Backend scripts are run separately to process and sync activity data
- TypeScript module resolution set to "bundler" for optimal Vite compatibility
- Path aliases configured: `@/` (src), `@assets/` (data/assets), `@data/` (data)
