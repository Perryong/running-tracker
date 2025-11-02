import os
from collections import namedtuple

# getting content root directory
current = os.path.dirname(os.path.realpath(__file__))
backend_dir = os.path.dirname(current)
root_dir = os.path.dirname(backend_dir)

OUTPUT_DIR = os.path.join(root_dir, "data", "activities")
GPX_FOLDER = os.path.join(root_dir, "data", "GPX_OUT")
TCX_FOLDER = os.path.join(root_dir, "data", "TCX_OUT")
FIT_FOLDER = os.path.join(root_dir, "data", "FIT_OUT")
FOLDER_DICT = {
    "gpx": GPX_FOLDER,
    "tcx": TCX_FOLDER,
    "fit": FIT_FOLDER,
}
SQL_FILE = os.path.join(backend_dir, "run_page", "data.db")
JSON_FILE = os.path.join(root_dir, "data", "activities.json")
SYNCED_FILE = os.path.join(root_dir, "data", "imported.json")


BASE_TIMEZONE = "Asia/Shanghai"
UTC_TIMEZONE = "UTC"

start_point = namedtuple("start_point", "lat lon")
run_map = namedtuple("polyline", "summary_polyline")
