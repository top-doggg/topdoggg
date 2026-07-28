from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PRINT_ROOT = ROOT / "print-ready" / "latest-shirt-mockups"
BASES = PRINT_ROOT / "bases"


@dataclass(frozen=True)
class Mockup:
    slug: str
    base: Path
    back: Path
    front: Path
    back_box: tuple[int, int, int, int]
    pocket_box: tuple[int, int, int, int]


MOCKUPS = (
    Mockup(
        "young-boyz",
        BASES / "white-front-back-blank.png",
        ROOT / "print-ready" / "reillustrated" / "young-boyz-floating-heads-refined" / "young-boyz-floating-heads-refined-transparent.png",
        ROOT / "print-ready" / "reillustrated" / "young-boyz-floating-heads-refined" / "young-boyz-front-pocket-original.png",
        (760, 335, 1110, 940),
        (405, 405, 500, 500),
    ),
    Mockup(
        "watching-me-closely",
        BASES / "light-gray-front-back-blank.png",
        ROOT / "print-ready" / "reillustrated" / "watching-me-closely-clean" / "watching-me-closely-clean-transparent.png",
        ROOT / "print-ready" / "reillustrated" / "watching-me-closely-clean" / "watching-me-closely-front-pocket-matched.png",
        (770, 345, 1110, 920),
        (405, 410, 500, 505),
    ),
    Mockup(
        "warriors-dance",
        BASES / "white-front-back-blank.png",
        ROOT / "print-ready" / "reillustrated" / "warriors-dance-original-pattern" / "warriors-dance-original-pattern-transparent.png",
        ROOT / "print-ready" / "reillustrated" / "warriors-dance-original-pattern" / "warriors-dance-front-pocket-original.png",
        (760, 335, 1110, 940),
        (405, 405, 500, 500),
    ),
)


def visible_art(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError(f"No visible artwork in {path}")
    return image.crop(bbox)


def fit_in_box(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    width = box[2] - box[0]
    height = box[3] - box[1]
    scale = min(width / image.width, height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def place(canvas: Image.Image, artwork: Image.Image, box: tuple[int, int, int, int]) -> None:
    fitted = fit_in_box(artwork, box)
    x = box[0] + ((box[2] - box[0]) - fitted.width) // 2
    y = box[1] + ((box[3] - box[1]) - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))


def main() -> None:
    for mockup in MOCKUPS:
        canvas = Image.open(mockup.base).convert("RGBA")
        place(canvas, visible_art(mockup.front), mockup.pocket_box)
        place(canvas, visible_art(mockup.back), mockup.back_box)
        destination = PRINT_ROOT / mockup.slug / f"{mockup.slug}-front-back-shirt-mockup.png"
        canvas.convert("RGB").save(destination, format="PNG", optimize=True)


if __name__ == "__main__":
    main()
