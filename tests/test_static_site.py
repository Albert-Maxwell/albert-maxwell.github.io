from __future__ import annotations

import re
import unittest
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
EXTERNAL_SCHEMES = {"data", "http", "https", "mailto", "tel"}


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        del tag
        for name, value in attrs:
            if value is None:
                continue
            if name == "id":
                self.ids.append(value)
            elif name in {"href", "src"}:
                self.references.append(value)


def local_path(reference: str, source: Path) -> Path | None:
    parsed = urlsplit(reference)
    if parsed.scheme in EXTERNAL_SCHEMES or parsed.netloc or not parsed.path:
        return None
    relative = unquote(parsed.path.lstrip("/"))
    base = ROOT if parsed.path.startswith("/") else source.parent
    return (base / relative).resolve()


class StaticSiteContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.index = ROOT / "index.html"
        cls.parser = SiteParser()
        cls.parser.feed(cls.index.read_text(encoding="utf-8"))

    def test_html_ids_are_unique(self) -> None:
        duplicates = sorted(
            identifier
            for identifier, count in Counter(self.parser.ids).items()
            if count > 1
        )
        self.assertEqual(duplicates, [], f"duplicate HTML ids: {duplicates}")

    def test_local_html_references_exist(self) -> None:
        missing = sorted(
            reference
            for reference in self.parser.references
            if (path := local_path(reference, self.index)) is not None
            and not path.exists()
        )
        self.assertEqual(missing, [], f"missing local references: {missing}")

    def test_local_fragments_exist(self) -> None:
        known_ids = set(self.parser.ids)
        missing = sorted(
            reference
            for reference in self.parser.references
            if (fragment := urlsplit(reference).fragment) and fragment not in known_ids
        )
        self.assertEqual(missing, [], f"missing local fragments: {missing}")

    def test_css_assets_exist(self) -> None:
        missing: list[str] = []
        for stylesheet in (ROOT / "css").glob("*.css"):
            contents = stylesheet.read_text(encoding="utf-8")
            for raw in re.findall(r"url\(([^)]+)\)", contents):
                reference = raw.strip(" \t\r\n\"'")
                path = local_path(reference, stylesheet)
                if path is not None and not path.exists():
                    missing.append(f"{stylesheet.relative_to(ROOT)}: {reference}")
        self.assertEqual(sorted(missing), [], f"missing CSS assets: {missing}")


if __name__ == "__main__":
    unittest.main()
