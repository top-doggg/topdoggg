from pathlib import Path

from PIL import Image


CANVAS = (3951, 4919)
DPI = (300, 300)
ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "print-ready" / "sin-miedo"


def black_artwork(source: Path) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError(f"No visible artwork found in {source}")

    alpha = alpha.crop(bbox)
    artwork = Image.new("RGBA", alpha.size, (0, 0, 0, 0))
    artwork.putalpha(alpha)
    return artwork


def fit(image: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    scale = min(max_size[0] / image.width, max_size[1] / image.height)
    size = (round(image.width * scale), round(image.height * scale))
    return image.resize(size, Image.Resampling.LANCZOS)


def save_on_canvas(
    source: Path,
    destination: Path,
    max_size: tuple[int, int],
    center: tuple[int, int],
) -> None:
    artwork = fit(black_artwork(source), max_size)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    position = (
        round(center[0] - artwork.width / 2),
        round(center[1] - artwork.height / 2),
    )
    canvas.alpha_composite(artwork, position)
    canvas.save(destination, format="PNG", dpi=DPI, optimize=True)


def main() -> None:
    save_on_canvas(
        SOURCE_DIR / "sin-miedo-back-alpha.png",
        SOURCE_DIR / "sin-miedo-back-print-3951x4919.png",
        max_size=(3556, 4427),
        center=(CANVAS[0] // 2, CANVAS[1] // 2),
    )

    # Viewer-right placement corresponds to the wearer's left chest.
    save_on_canvas(
        SOURCE_DIR / "sin-miedo-front-brand-alpha.png",
        SOURCE_DIR / "sin-miedo-front-print-3951x4919.png",
        max_size=(1050, 1050),
        center=(2780, 1050),
    )


if __name__ == "__main__":
    main()

