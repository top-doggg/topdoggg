from __future__ import annotations

from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageDraw

ROOT = Path(r'C:\Users\stadi\OneDrive\Documents\FindADate app')
SOURCE_ART = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined' / 'young-boyz-floating-heads-refined-transparent.png'
LETTERING = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined' / 'approved-better-together-lettering-extracted.png'
LATEST_DIR = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'young-boyz'
SOURCE_DIR = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined'
PUBLIC_PRODUCTS = ROOT / 'public' / 'products'
BASE = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'bases' / 'white-front-back-blank.png'
CANVAS = (3951, 4919)
SAFE = (321, 334, 3630, 4584)
DPI = (300, 300)
BLACK = (0, 0, 0, 255)


def bbox(im):
    b = im.getchannel('A').getbbox()
    if not b:
        raise ValueError('blank')
    return b


def visible(im):
    return im.crop(bbox(im))


def fit(im, maxw, maxh):
    s = min(maxw / im.width, maxh / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.Resampling.LANCZOS)


def place(canvas, artwork, box):
    art = fit(visible(artwork), box[2]-box[0], box[3]-box[1])
    canvas.alpha_composite(art, (box[0]+((box[2]-box[0])-art.width)//2, box[1]+((box[3]-box[1])-art.height)//2))


def build_back():
    art = visible(Image.open(SOURCE_ART).convert('RGBA'))
    lettering = visible(Image.open(LETTERING).convert('RGBA'))
    safe_w = SAFE[2] - SAFE[0]
    safe_h = SAFE[3] - SAFE[1]
    lettering = fit(lettering, 2470, 560)
    gap = 18
    art_max_h = safe_h - lettering.height - gap
    art_fit = fit(art, safe_w, art_max_h)
    group_h = lettering.height + gap + art_fit.height
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    y0 = SAFE[1] + (safe_h - group_h) // 2
    canvas.alpha_composite(lettering, ((CANVAS[0]-lettering.width)//2, y0))
    canvas.alpha_composite(art_fit, ((CANVAS[0]-art_fit.width)//2, y0 + lettering.height + gap))
    return canvas


def build_front():
    lettering = visible(Image.open(LETTERING).convert('RGBA'))
    lettering = fit(lettering, 680, 290)
    pad_x, pad_top, pad_bottom = 70, 96, 52
    mark = Image.new('RGBA', (lettering.width + pad_x * 2, lettering.height + pad_top + pad_bottom), (0,0,0,0))
    draw = ImageDraw.Draw(mark)
    cx = mark.width // 2
    draw.ellipse((cx - 126, 20, cx + 126, 78), outline=BLACK, width=15)
    draw.ellipse((cx - 104, 31, cx + 104, 66), outline=BLACK, width=5)
    for x, y in [(cx - 195, 63), (cx + 195, 63), (cx, 100)]:
        draw.line((x, y - 20, x, y + 20), fill=BLACK, width=5)
        draw.line((x - 20, y, x + 20, y), fill=BLACK, width=5)
    mark.alpha_composite(lettering, (pad_x, pad_top))
    mark = fit(visible(mark), 610, 480)
    canvas = Image.new('RGBA', CANVAS, (0,0,0,0))
    cx, cy = 2780, 1090
    canvas.alpha_composite(mark, (cx-mark.width//2, cy-mark.height//2))
    return canvas


def make_mock(front, back, destination):
    mock = Image.open(BASE).convert('RGBA')
    place(mock, front, (405,405,500,500))
    place(mock, back, (735,300,1135,1015))
    mock.convert('RGB').save(destination, optimize=True)


def write_placement(path):
    path.write_text(
        '# Young Boyz Refined - Better Together Printify Placement\n\n'
        '- Garment: White\n'
        '- Print method: DTG\n'
        '- Canvas: 3951 x 4919 px at 300 DPI\n'
        '- Safe artwork maximum: 3400 x 4250 px\n'
        '- Back placement: approved Better Together lettering at top, tightened close to unchanged Young Boyz character art\n'
        '- Front placement: wearer\'s left chest Better Together script with halo, no face\n'
        '- Keep proportions locked and do not use automatic background removal.\n',
        encoding='ascii',
    )


def zip_files(paths, destination):
    with ZipFile(destination, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in paths:
            archive.write(path, arcname=path.name)


def refresh_master_zip():
    collection = ROOT / 'print-ready' / 'latest-shirt-mockups'
    master = ROOT / 'print-ready' / 'latest-three-designs-printify.zip'
    paths = []
    for slug in ['young-boyz', 'watching-me-closely', 'warriors-dance']:
        folder = collection / slug
        paths.extend([folder / f'{slug}-front-print-3951x4919.png', folder / f'{slug}-back-print-3951x4919.png', folder / 'PRINTIFY-PLACEMENT.md'])
    with ZipFile(master, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in paths:
            archive.write(path, arcname=path.relative_to(collection))


def main():
    LATEST_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_PRODUCTS.mkdir(parents=True, exist_ok=True)
    back = build_back()
    front = build_front()
    back_path = LATEST_DIR / 'young-boyz-back-print-3951x4919.png'
    front_path = LATEST_DIR / 'young-boyz-front-print-3951x4919.png'
    placement = LATEST_DIR / 'PRINTIFY-PLACEMENT.md'
    package = LATEST_DIR.parent / 'young-boyz-latest-printify-package.zip'
    mockup = LATEST_DIR / 'young-boyz-front-back-shirt-mockup.png'
    source_back = SOURCE_DIR / 'young-boyz-approved-top-lettering-tight-print.png'
    source_front = SOURCE_DIR / 'young-boyz-halo-lettering-pocket-print.png'
    back.save(back_path, format='PNG', dpi=DPI, optimize=True)
    front.save(front_path, format='PNG', dpi=DPI, optimize=True)
    back.save(source_back, format='PNG', dpi=DPI, optimize=True)
    front.save(source_front, format='PNG', dpi=DPI, optimize=True)
    write_placement(placement)
    zip_files([front_path, back_path, placement], package)
    make_mock(front, back, mockup)
    copy2(mockup, PUBLIC_PRODUCTS / 'young-boyz-latest-mockup.png')
    refresh_master_zip()
    print('applied tight top lettering layout')

if __name__ == '__main__':
    main()
