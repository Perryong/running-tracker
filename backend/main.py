#!/usr/bin/env python3
"""
Running Page Backend - Main Entry Point

This is the main application file for the Running Page backend.
It provides a unified CLI interface for all backend operations.
"""

import argparse
import sys
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "run_page"))

from run_page import garmin_sync, gen_svg
from run_page.config import SQL_FILE, JSON_FILE, FOLDER_DICT


def sync_garmin(args):
    """Sync activities from Garmin Connect"""
    print("🔄 Syncing activities from Garmin Connect...")

    secret_string = args.secret
    if secret_string is None:
        # Try to get from environment variable first
        secret_string = os.getenv("GARMIN_SECRET")

        # If not in env, try to read from secret.txt file
        if secret_string is None:
            secret_file = os.path.join(os.path.dirname(__file__), "secret.txt")
            if os.path.exists(secret_file):
                with open(secret_file, "r", encoding="utf-8") as f:
                    secret_string = f.read().strip()

        if secret_string is None or secret_string == "":
            print("❌ Error: No Garmin credentials provided.")
            print("   Options:")
            print("   1. Use --secret flag")
            print("   2. Set GARMIN_SECRET environment variable in .env file")
            print("   3. Create a secret.txt file")
            sys.exit(1)

    auth_domain = "CN" if args.is_cn else "COM"
    file_type = args.format

    import asyncio
    from run_page.garmin_sync import download_new_activities, get_downloaded_ids
    from run_page.utils import make_activities_file

    folder = FOLDER_DICT.get(file_type, "gpx")
    if not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)

    downloaded_ids = get_downloaded_ids(folder)

    if file_type == "fit":
        gpx_folder = FOLDER_DICT["gpx"]
        if not os.path.exists(gpx_folder):
            os.makedirs(gpx_folder, exist_ok=True)
        downloaded_gpx_ids = get_downloaded_ids(gpx_folder)
        downloaded_ids = list(set(downloaded_ids + downloaded_gpx_ids))

    loop = asyncio.get_event_loop()
    future = asyncio.ensure_future(
        download_new_activities(
            secret_string,
            auth_domain,
            downloaded_ids,
            args.only_run,
            folder,
            file_type,
        )
    )
    loop.run_until_complete(future)
    new_ids, id2title = future.result()

    if file_type == "fit":
        make_activities_file(
            SQL_FILE,
            FOLDER_DICT["gpx"],
            JSON_FILE,
            file_suffix="gpx",
            activity_title_dict=id2title,
        )
    make_activities_file(
        SQL_FILE, folder, JSON_FILE, file_suffix=file_type, activity_title_dict=id2title
    )

    print(f"✅ Sync complete! Downloaded {len(new_ids)} new activities.")


def generate_svg(args):
    """Generate SVG visualizations from activity data"""
    print(f"🎨 Generating {args.type} SVG visualization...")

    sys.argv = [
        "gen_svg.py",
        "--type",
        args.type,
        "--output",
        args.output,
    ]

    if args.from_db:
        sys.argv.append("--from-db")
    if args.year:
        sys.argv.extend(["--year", args.year])
    if args.title:
        sys.argv.extend(["--title", args.title])
    if args.language:
        sys.argv.extend(["--language", args.language])
    if args.athlete:
        sys.argv.extend(["--athlete", args.athlete])

    try:
        gen_svg.main()
        print(f"✅ SVG generated: {args.output}")
    except Exception as e:
        print(f"❌ Error generating SVG: {e}")
        sys.exit(1)


def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(
        description="Running Page Backend - Sync and visualize your running activities",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Sync from Garmin:
    python main.py sync-garmin --secret YOUR_SECRET
    python main.py sync-garmin --secret YOUR_SECRET --format fit
  
  Generate visualizations:
    python main.py generate-svg --type github --from-db --output ../data/assets/github.svg
    python main.py generate-svg --type grid --from-db --year 2024 --output ../data/assets/year_2024.svg
  
  Get Garmin secret:
    python run_page/get_garmin_secret.py EMAIL PASSWORD
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    garmin_parser = subparsers.add_parser(
        "sync-garmin", help="Sync activities from Garmin Connect"
    )
    garmin_parser.add_argument(
        "--secret", type=str, help="Garmin authentication secret"
    )
    garmin_parser.add_argument(
        "--is-cn", action="store_true", help="Use Garmin China domain"
    )
    garmin_parser.add_argument(
        "--only-run", action="store_true", help="Only sync running activities"
    )
    garmin_parser.add_argument(
        "--format",
        choices=["gpx", "tcx", "fit"],
        default="gpx",
        help="File format to download",
    )
    garmin_parser.set_defaults(func=sync_garmin)

    svg_parser = subparsers.add_parser(
        "generate-svg", help="Generate SVG visualizations"
    )
    svg_parser.add_argument(
        "--type",
        choices=["github", "grid", "circular", "monthoflife"],
        default="github",
        help="Type of visualization",
    )
    svg_parser.add_argument(
        "--output", type=str, required=True, help="Output SVG file path"
    )
    svg_parser.add_argument(
        "--from-db", action="store_true", help="Load tracks from database"
    )
    svg_parser.add_argument(
        "--year", type=str, help='Filter by year (e.g., "2024" or "2020-2024")'
    )
    svg_parser.add_argument(
        "--title", type=str, help="Custom title for the visualization"
    )
    svg_parser.add_argument(
        "--language", type=str, help="Language for the visualization"
    )
    svg_parser.add_argument("--athlete", type=str, help="Athlete name to display")
    svg_parser.set_defaults(func=generate_svg)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
