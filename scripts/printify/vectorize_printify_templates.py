from __future__ import annotations

import re
import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image


CANVAS = (3951, 4919)
ROOT = Path(__file__).resolve().parents[1]
COLLECTION = ROOT / "print-ready" / "printify-collection"
TRACE_DIR = ROOT / "print-ready" / ".vector-trace"
VTRACER_RUNTIME = Path(r"C:\tmp\vtracer-runtime")

TEMPLATES = {
    "watching-me-closely": "black",
    "warriors-dance": "white",
    "young-boyz": "black",
}


def trace_input(source: Path, destination: Path) -> tuple[int, int]:
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    mask = Image.new("L", image.size, 255)
    mask.paste(0, mask=alpha.point(lambda value: 255 if value >= 56 else 0))
    size = (1976, 2460)
    mask.resize(size, Image.Resampling.LANCZOS).save(destination, format="PNG", optimize=True)
    return size


def normalize_svg(path: Path, ink: str, trace_size: tuple[int, int]) -> None:
    svg = path.read_text(encoding="utf-8")
    root_match = re.search(r"<svg\b[^>]*>", svg)
    if root_match is None:
        raise ValueError(f"No SVG root element found in {path}")

    root = root_match.group(0)
    root = re.sub(r'\sxmlns="[^"]+"', "", root)
    root = re.sub(r'\swidth="[^"]+"', "", root)
    root = re.sub(r'\sheight="[^"]+"', "", root)
    root = re.sub(r'\sviewBox="[^"]+"', "", root)
    root = re.sub(r'\spreserveAspectRatio="[^"]+"', "", root)
    root = root[:-1] + (
        f' xmlns="http://www.w3.org/2000/svg" width="{CANVAS[0]}" height="{CANVAS[1]}"'
        f' viewBox="0 0 {trace_size[0]} {trace_size[1]}" preserveAspectRatio="xMidYMid meet">'
    )
    color = "#ffffff" if ink == "white" else "#000000"
    svg = re.sub(r'fill="(?:#[0-9a-fA-F]{3,8}|rgb\([^)]*\)|black|white)"', f'fill="{color}"', svg)
    metadata = (
        f'<metadata>DE.LA.COSTA / TRST STUDIOS; Printify template; '
        f'{CANVAS[0]} x {CANVAS[1]}; {ink} ink</metadata>'
    )
    svg = svg[: root_match.start()] + root + f"\n  {metadata}" + svg[root_match.end() :]
    path.write_text(svg, encoding="utf-8")


def rebuild_packages() -> None:
    for slug in TEMPLATES:
        folder = COLLECTION / slug
        destination = COLLECTION / f"{slug}-printify-package.zip"
        with ZipFile(destination, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
            for path in sorted(folder.iterdir()):
                if path.is_file():
                    archive.write(path, arcname=path.name)

    collection_zip = ROOT / "print-ready" / "de-la-costa-printify-collection.zip"
    with ZipFile(collection_zip, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(COLLECTION.rglob("*")):
            if path.is_file() and path.suffix.lower() != ".zip":
                archive.write(path, arcname=path.relative_to(COLLECTION))


def main() -> None:
    sys.path.insert(0, str(VTRACER_RUNTIME))
    import vtracer

    TRACE_DIR.mkdir(parents=True, exist_ok=True)
    for slug, ink in TEMPLATES.items():
        folder = COLLECTION / slug
        source = folder / f"{slug}-back-print-3951x4919.png"
        trace_png = TRACE_DIR / f"{slug}-trace.png"
        destination = folder / f"{slug}-back-vector-3951x4919.svg"
        trace_size = trace_input(source, trace_png)
        vtracer.convert_image_to_svg_py(
            str(trace_png),
            str(destination),
            colormode="binary",
            mode="spline",
            filter_speckle=7,
            corner_threshold=58,
            length_threshold=5.0,
            max_iterations=10,
            splice_threshold=45,
            path_precision=2,
        )
        normalize_svg(destination, ink, trace_size)
        print(f"{slug}: {destination.stat().st_size / 1024 / 1024:.2f} MiB")
    rebuild_packages()


if __name__ == "__main__":
    main()
