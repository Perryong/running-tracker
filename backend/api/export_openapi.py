import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api.main import app


def main() -> None:
    output_path = Path(__file__).resolve().parent / "openapi.json"
    schema = app.openapi()
    output_path.write_text(
        json.dumps(schema, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(f"OpenAPI exported to {output_path}")


if __name__ == "__main__":
    main()
