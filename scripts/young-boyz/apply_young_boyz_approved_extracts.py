from __future__ import annotations

from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image

ROOT = Path(r'C:\Users\stadi\OneDrive\Documents\FindADate app')
APPROVED_SHEET = ROOT / 'public' / 'young-boyz-isolated-lettering-pocket-smile-no-ear.png'
SOURCE_ART = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined' / 'young-boyz-floating-heads-refined-transparent.png'
LATEST_DIR = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'young-boyz'
PUBLIC_PRODUCTS = ROOT / 'public' / 'products'
BASE = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'bases' / 'white-front-back-blank.png'
SOURCE_DIR = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined'
CANVAS = (3951, 4919)
DPI = (300, 300)
SAFE = (321, 334, 3630, 4584)


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel('A').getbbox()
    if bbox is None:
        raise ValueError('blank image')
    return bbox


def visible(image: Image.Image) -> Image.Image:
    return image.crop(alpha_bbox(image))


def fit(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    scale = min(max_width / image.width, max_height / image.height)
    return image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.Resampling.LANCZOS)


def extract_black(crop: Image.Image) -> Image.Image:
    rgba = crop.convert('RGBA')
    pixels = rgba.load()
    w, h = rgba.size
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            darkness = 255 - ((r + g + b) // 3)
            if darkness > 34:
                alpha = min(255, max(0, (darkness - 34) * 3))
                op[x, y] = (0, 0, 0, alpha)
    return visible(out)


def source_back_art() -> Image.Image:
    art = Image.open(SOURCE_ART).convert('RGBA')
    return visible(art)


def extract_approved_assets() -> tuple[Image.Image, Image.Image]:
    sheet = Image.open(APPROVED_SHEET).convert('RGB')
    # These crops come from the approved no-ear sheet. They intentionally exclude the labels.
    lettering = extract_black(sheet.crop((95, 145, 930, 760)))
    pocket = extract_black(sheet.crop((1060, 145, 1395, 740)))
    return lettering, pocket


def make_back_print(lettering: Image.Image) -> Image.Image:
    safe_w = SAFE[2] - SAFE[0]
    safe_h = SAFE[3] - SAFE[1]
    art = source_back_art()
    lettering = fit(lettering, 1780, 470)
    gap = 65
    art_max_h = safe_h - lettering.height - gap
    art_fit = fit(art, safe_w, art_max_h)

    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    group_h = art_fit.height + gap + lettering.height
    y0 = SAFE[1] + (safe_h - group_h) // 2
    canvas.alpha_composite(art_fit, ((CANVAS[0] - art_fit.width) // 2, y0))
    canvas.alpha_composite(lettering, ((CANVAS[0] - lettering.width) // 2, y0 + art_fit.height + gap))
    return canvas


def make_front_print(pocket_mark: Image.Image) -> Image.Image:
    mark = fit(pocket_mark, 620, 720)
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    cx, cy = 2780, 1125
    canvas.alpha_composite(mark, (cx - mark.width // 2, cy - mark.height // 2))
    return canvas


def place(canvas: Image.Image, artwork: Image.Image, box: tuple[int, int, int, int]) -> None:
    fitted = fit(visible(artwork), box[2] - box[0], box[3] - box[1])
    x = box[0] + ((box[2] - box[0]) - fitted.width) // 2
    y = box[1] + ((box[3] - box[1]) - fitted.height) // 2
    canvas.alpha_composite(fitted, (x, y))


def make_mockup(front: Image.Image, back: Image.Image, destination: Path) -> None:
    canvas = Image.open(BASE).convert('RGBA')
    place(canvas, front, (405, 405, 500, 500))
    place(canvas, back, (760, 335, 1110, 1000))
    canvas.convert('RGB').save(destination, format='PNG', optimize=True)


def write_placement(path: Path) -> None:
    path.write_text(
        '# Young Boyz Refined - Better Together Printify Placement\n\n'
        '- Garment: White\n'
        '- Print method: DTG\n'
        '- Canvas: 3951 x 4919 px at 300 DPI\n'
        '- Safe artwork maximum: 3400 x 4250 px\n'
        '- Back placement: original Young Boyz art preserved; approved Better Together lettering extracted from concept sheet and placed below\n'
        '- Front placement: approved no-ear smiling halo-head pocket logo extracted from concept sheet\n'
        '- Keep proportions locked and do not use automatic background removal.\n',
        encoding='ascii',
    )


def zip_files(paths: list[Path], destination: Path) -> None:
    with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in paths:
            archive.write(path, arcname=path.name)


def refresh_master_zip() -> None:
    collection = ROOT / 'print-ready' / 'latest-shirt-mockups'
    master = ROOT / 'print-ready' / 'latest-three-designs-printify.zip'
    paths = []
    for slug in ['young-boyz', 'watching-me-closely', 'warriors-dance']:
        folder = collection / slug
        paths.extend([
            folder / f'{slug}-front-print-3951x4919.png',
            folder / f'{slug}-back-print-3951x4919.png',
            folder / 'PRINTIFY-PLACEMENT.md',
        ])
    with ZipFile(master, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in paths:
            archive.write(path, arcname=path.relative_to(collection))


def main() -> None:
    LATEST_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_PRODUCTS.mkdir(parents=True, exist_ok=True)

    lettering, pocket = extract_approved_assets()
    back = make_back_print(lettering)
    front = make_front_print(pocket)

    lettering_path = SOURCE_DIR / 'approved-better-together-lettering-extracted.png'
    pocket_path = SOURCE_DIR / 'approved-smiling-head-pocket-extracted.png'
    source_back_path = SOURCE_DIR / 'young-boyz-approved-art-plus-extracted-lettering.png'
    source_front_path = SOURCE_DIR / 'young-boyz-approved-pocket-print.png'
    back_path = LATEST_DIR / 'young-boyz-back-print-3951x4919.png'
    front_path = LATEST_DIR / 'young-boyz-front-print-3951x4919.png'
    placement = LATEST_DIR / 'PRINTIFY-PLACEMENT.md'
    package = LATEST_DIR.parent / 'young-boyz-latest-printify-package.zip'
    mockup = LATEST_DIR / 'young-boyz-front-back-shirt-mockup.png'

    lettering.save(lettering_path, format='PNG', dpi=DPI, optimize=True)
    pocket.save(pocket_path, format='PNG', dpi=DPI, optimize=True)
    back.save(source_back_path, format='PNG', dpi=DPI, optimize=True)
    front.save(source_front_path, format='PNG', dpi=DPI, optimize=True)
    back.save(back_path, format='PNG', dpi=DPI, optimize=True)
    front.save(front_path, format='PNG', dpi=DPI, optimize=True)
    write_placement(placement)
    zip_files([front_path, back_path, placement], package)
    make_mockup(front, back, mockup)
    copy2(mockup, PUBLIC_PRODUCTS / 'young-boyz-latest-mockup.png')
    refresh_master_zip()
    print('applied extracted approved concept assets')

if __name__ == '__main__':
    main()
