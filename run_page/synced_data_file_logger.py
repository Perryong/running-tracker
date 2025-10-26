"""Simple logger for synced data files to avoid re-syncing."""

import os


def load_synced_file_list():
    """Load list of synced file names from file."""
    synced_file_path = os.path.join(os.path.dirname(__file__), "synced_files.txt")
    try:
        with open(synced_file_path, "r") as f:
            return [line.strip() for line in f]
    except FileNotFoundError:
        return []


def save_synced_data_file_list(synced_files):
    """Save list of synced file names to file."""
    synced_file_path = os.path.join(os.path.dirname(__file__), "synced_files.txt")
    with open(synced_file_path, "a") as f:
        for file in synced_files:
            f.write(file + "\n")
