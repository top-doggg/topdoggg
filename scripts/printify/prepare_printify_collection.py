from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageStat


CANVAS = (3951, 4919)
DPI = (300, 300)
ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "print-ready" / "printify-collection"
PICTURES = Path.home() / "OneDrive" / "Pictures"
INSTAGRAM = ROOT / "public" / "instagram"
PRODUCTS = ROOT / "public" / "products"
SIN_MIEDO = ROOT / "print-ready" / "sin-miedo"


@dataclass(frozen=True)
class Design:
    slug: str
    name: str
    source: Path
    garment: str
    ink: str
    extraction: str
    shadow: bool = False
    crop: tuple[int, int, int, int] | None = None
    preserve_color: bool = False


DESIGNS = (
    Design("no-bad-days", "No Bad Days", PRODUCTS / "no-bad-days-tee.png", "Black", "White", "mockup", False, (755, 310, 1105, 940)),
    Design("old-town-boogie", "Old Town Boogie", PRODUCTS / "old-town-boogie-tee.png", "White", "Black", "mockup", False, (800, 365, 1105, 655)),
    Design("danger-vago-shooter", "Danger, Vago, Shooter", PRODUCTS / "danger-vago-shooter-tee.png", "Black", "White", "mockup", False, (690, 270, 1170, 990)),
    Design("watching-me-closely", "Watching Me Closely", PRODUCTS / "watching-me-closely-light-gray-tee.png", "Light gray", "Black", "mockup", False, (735, 295, 1125, 970)),
    Design("young-boyz", "Young Boyz", PRODUCTS / "young-boyz-balanced-side-legs-tee.png", "White", "Black", "mockup", False, (720, 275, 1125, 950)),
    Design("four-da-town", "4 Da Town", PRODUCTS / "four-da-town-tee.png", "Washed black", "White", "mockup", False, (675, 250, 1175, 1000)),
    Design("sun-jaguar-warrior", "Sun Jaguar Warrior", PRODUCTS / "sun-jaguar-warrior-tee.png", "Bone", "Black", "mockup", False, (725, 260, 1145, 985)),
    Design("prayers", "Prayers", PRODUCTS / "prayers-tee.png", "Dusty rose", "Black", "mockup", False, (770, 300, 1100, 875)),
    Design("warriors-dance", "Warrior's Dance", PICTURES / "warriors dance.jpeg", "Forest green", "White", "dark-to-light", False),
)


def alpha_from_source(source: Path, mode: str) -> Image.Image:
    image = Image.open(source).convert("RGB")
    gray = ImageOps.grayscale(image)

    if mode.endswith("edge"):
        working = gray.filter(ImageFilter.GaussianBlur(1.2)).filter(ImageFilter.FIND_EDGES)
        working = ImageOps.autocontrast(working, cutoff=1)
        alpha = working.point(lambda value: 0 if value < 24 else min(255, round((value - 24) * 1.6)))
    elif mode == "light":
        alpha = ImageOps.autocontrast(gray, cutoff=2).point(
            lambda value: 0 if value < 24 else min(255, round((value - 24) * 1.35))
        )
    else:
        alpha = ImageOps.invert(ImageOps.autocontrast(gray, cutoff=2)).point(
            lambda value: 0 if value < 20 else min(255, round((value - 20) * 1.45))
        )

    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError(f"No artwork detected in {source}")
    return alpha.crop(bbox)


def fit(image: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    scale = min(max_size[0] / image.width, max_size[1] / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    return image.resize(size, Image.Resampling.LANCZOS)


def colored_art(alpha: Image.Image, color: str) -> Image.Image:
    rgb = (255, 255, 255) if color == "White" else (0, 0, 0)
    art = Image.new("RGBA", alpha.size, (*rgb, 0))
    art.putalpha(alpha)
    return art


def mockup_art(source: Path, crop: tuple[int, int, int, int], ink: str, preserve_color: bool) -> Image.Image:
    image = Image.open(source).convert("RGB").crop(crop)
    sample_width = max(8, image.width // 12)
    sample_height = max(8, image.height // 12)
    patches = (
        image.crop((0, 0, sample_width, sample_height)),
        image.crop((image.width - sample_width, 0, image.width, sample_height)),
        image.crop((0, image.height - sample_height, sample_width, image.height)),
        image.crop((image.width - sample_width, image.height - sample_height, image.width, image.height)),
    )
    sample = Image.new("RGB", (sample_width * 4, sample_height))
    for index, patch in enumerate(patches):
        sample.paste(patch, (index * sample_width, 0))
    base = tuple(round(value) for value in ImageStat.Stat(sample).median)

    if preserve_color:
        background = Image.new("RGB", image.size, base)
        difference = ImageChops.difference(image, background).convert("L")
        alpha = difference.point(lambda value: 0 if value < 38 else min(255, round((value - 38) * 5.2)))
    else:
        gray = ImageOps.grayscale(image)
        base_gray = round(sum(base) / 3)
        if ink == "White":
            threshold = min(245, base_gray + 22)
            alpha = gray.point(lambda value: 0 if value < threshold else min(255, round((value - threshold) * 4.4)))
        else:
            threshold = max(12, base_gray - 18)
            alpha = gray.point(lambda value: 0 if value > threshold else min(255, round((threshold - value) * 4.4)))

    alpha = alpha.filter(ImageFilter.MedianFilter(3))
    corner_mask = Image.new("L", alpha.size, 255)
    corner_width = round(alpha.width * 0.22)
    corner_height = round(alpha.height * 0.12)
    corner_mask.paste(0, (0, 0, corner_width, corner_height))
    corner_mask.paste(0, (alpha.width - corner_width, 0, alpha.width, corner_height))
    alpha = ImageChops.multiply(alpha, corner_mask)
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError(f"No approved artwork detected in {source}")
    alpha = alpha.crop(bbox)
    if preserve_color:
        art = image.crop(bbox).convert("RGBA")
        art.putalpha(alpha)
    else:
        art = colored_art(alpha, ink)
    return art

def render_back(design: Design) -> Image.Image:
    if design.crop:
        art = fit(mockup_art(design.source, design.crop, design.ink, design.preserve_color), (3400, 4250))
    else:
        alpha = fit(alpha_from_source(design.source, design.extraction), (3400, 4250))
        art = colored_art(alpha, design.ink)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = round((CANVAS[0] - art.width) / 2)
    y = round((CANVAS[1] - art.height) / 2)

    if design.shadow:
        shadow_alpha = art.getchannel("A").filter(ImageFilter.GaussianBlur(18))
        shadow_color = (0, 0, 0) if design.ink == "White" else (90, 90, 90)
        shadow = Image.new("RGBA", shadow_alpha.size, (*shadow_color, 0))
        shadow.putalpha(shadow_alpha.point(lambda value: round(value * 0.48)))
        canvas.alpha_composite(shadow, (x + 28, y + 34))

    canvas.alpha_composite(art, (x, y))
    return canvas


def recolor_front(source: Path, color: str) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    rgb = (255, 255, 255) if color == "White" else (0, 0, 0)
    front = Image.new("RGBA", image.size, (*rgb, 0))
    front.putalpha(alpha)
    return front


def placement_guide(design: Design) -> str:
    return f"""# {design.name} - Printify Upload Guide

## Product setup

- Garment color: {design.garment}
- Print method: DTG
- Artwork color: {design.ink}
- Print area: 3951 x 4919 px
- Resolution: 300 DPI
- File type: Transparent PNG

## Files to upload

### Front

Upload `{design.slug}-front-print-3951x4919.png` to the front print area.

- Position: Wearer's left chest
- Wording: `DE.LA.COSTA` / `NO FEAR STUDY`
- Keep proportions locked and do not use automatic background removal.

### Back

Upload `{design.slug}-back-print-3951x4919.png` to the back print area.

- Position: Centered upper/mid back
- Keep the complete artwork inside the safe area.
- Keep proportions locked when scaling.

## Before publishing

1. Confirm Printify reports both files as high resolution.
2. Inspect every size in the mockup preview, especially S and 3XL.
3. Order one sample before public release.
4. Check line clarity, ink density, placement, and fine details.
5. Wash the sample once inside-out in cold water before approval.

The website shirt mockup is for presentation only. Upload these transparent print files instead.
"""


def zip_folder(folder: Path, destination: Path) -> None:
    with ZipFile(destination, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(folder.iterdir()):
            if path.is_file():
                archive.write(path, arcname=path.name)


def main() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    front_source = SIN_MIEDO / "sin-miedo-front-print-3951x4919.png"

    collection_files: list[Path] = []
    for design in DESIGNS:
        folder = OUTPUT_ROOT / design.slug
        folder.mkdir(parents=True, exist_ok=True)
        front_path = folder / f"{design.slug}-front-print-3951x4919.png"
        back_path = folder / f"{design.slug}-back-print-3951x4919.png"
        guide_path = folder / "PRINTIFY-PLACEMENT.md"

        front_ink = "White" if design.garment.lower() in {"black", "washed black", "forest green"} else "Black"
        recolor_front(front_source, front_ink).save(front_path, format="PNG", dpi=DPI, optimize=True)
        render_back(design).save(back_path, format="PNG", dpi=DPI, optimize=True)
        guide_path.write_text(placement_guide(design), encoding="ascii")

        zip_path = OUTPUT_ROOT / f"{design.slug}-printify-package.zip"
        zip_folder(folder, zip_path)
        collection_files.extend((front_path, back_path, guide_path, zip_path))

    sin_folder = OUTPUT_ROOT / "sin-miedo"
    sin_folder.mkdir(parents=True, exist_ok=True)
    for source in (
        SIN_MIEDO / "sin-miedo-front-print-3951x4919.png",
        SIN_MIEDO / "sin-miedo-back-print-3951x4919.png",
        SIN_MIEDO / "PRINTIFY-PLACEMENT.md",
    ):
        copy2(source, sin_folder / source.name)
    zip_folder(sin_folder, OUTPUT_ROOT / "sin-miedo-printify-package.zip")

    collection_zip = ROOT / "print-ready" / "de-la-costa-printify-collection.zip"
    with ZipFile(collection_zip, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(OUTPUT_ROOT.rglob("*")):
            if path.is_file() and path.suffix != ".zip":
                archive.write(path, arcname=path.relative_to(OUTPUT_ROOT))

    print(f"Prepared {len(DESIGNS) + 1} Printify packages in {OUTPUT_ROOT}")
    print(collection_zip)


if __name__ == "__main__":
    main()
