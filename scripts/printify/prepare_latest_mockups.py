from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image


CANVAS = (3951, 4919)
DPI = (300, 300)
MAX_BACK = (3400, 4250)
ROOT = Path(__file__).resolve().parents[1]
REILLUSTRATED = ROOT / "print-ready" / "reillustrated"
COLLECTION = ROOT / "print-ready" / "latest-shirt-mockups"


@dataclass(frozen=True)
class Product:
    slug: str
    name: str
    garment: str
    back: Path
    front: Path


PRODUCTS = (
    Product(
        "young-boyz",
        "Young Boyz - Refined Floating Heads",
        "White",
        REILLUSTRATED / "young-boyz-floating-heads-refined" / "young-boyz-floating-heads-refined-transparent.png",
        REILLUSTRATED / "young-boyz-floating-heads-refined" / "young-boyz-front-pocket-original.png",
    ),
    Product(
        "watching-me-closely",
        "Watching Me Closely",
        "Light gray",
        REILLUSTRATED / "watching-me-closely-codex-edition" / "watching-me-closely-codex-transparent.png",
        REILLUSTRATED / "watching-me-closely-codex-edition" / "watching-me-closely-front-pocket-original.png",
    ),
    Product(
        "warriors-dance",
        "Warriors Dance - Original Pattern",
        "White",
        REILLUSTRATED / "warriors-dance-original-pattern" / "warriors-dance-original-pattern-transparent.png",
        REILLUSTRATED / "warriors-dance-original-pattern" / "warriors-dance-front-pocket-original.png",
    ),
)


def fit_visible(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError(f"No visible artwork found in {source}")
    artwork = image.crop(bbox)
    scale = min(MAX_BACK[0] / artwork.width, MAX_BACK[1] / artwork.height)
    size = (round(artwork.width * scale), round(artwork.height * scale))
    return artwork.resize(size, Image.Resampling.LANCZOS)


def back_canvas(source: Path) -> Image.Image:
    artwork = fit_visible(source)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(
        artwork,
        ((CANVAS[0] - artwork.width) // 2, (CANVAS[1] - artwork.height) // 2),
    )
    return canvas


def guide(product: Product) -> str:
    return f"""# {product.name} - Printify Placement

- Garment: {product.garment}
- Print method: DTG
- Canvas: 3951 x 4919 px at 300 DPI
- Safe artwork maximum: 3400 x 4250 px
- Back placement: centered upper/mid back
- Front placement: wearer's left chest
- Keep proportions locked and do not use automatic background removal.
"""


def zip_files(paths: list[Path], destination: Path) -> None:
    with ZipFile(destination, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in paths:
            archive.write(path, arcname=path.name)


def main() -> None:
    COLLECTION.mkdir(parents=True, exist_ok=True)
    all_files: list[Path] = []
    for product in PRODUCTS:
        folder = COLLECTION / product.slug
        folder.mkdir(parents=True, exist_ok=True)
        back = folder / f"{product.slug}-back-print-3951x4919.png"
        front = folder / f"{product.slug}-front-print-3951x4919.png"
        placement = folder / "PRINTIFY-PLACEMENT.md"
        package = COLLECTION / f"{product.slug}-latest-printify-package.zip"

        back_canvas(product.back).save(back, format="PNG", dpi=DPI, optimize=True)
        copy2(product.front, front)
        placement.write_text(guide(product), encoding="ascii")
        zip_files([front, back, placement], package)
        all_files.extend([front, back, placement])

    master = ROOT / "print-ready" / "latest-three-designs-printify.zip"
    with ZipFile(master, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in all_files:
            archive.write(path, arcname=path.relative_to(COLLECTION))


if __name__ == "__main__":
    main()
