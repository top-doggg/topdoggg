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
DPI = (300, 300)
SAFE = (321, 334, 3630, 4584)
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
    # Same approved character art, slightly smaller and anchored to the top of the safe area
    # so the composition rides higher without leaving Printify bounds.
    art = visible(Image.open(SOURCE_ART).convert('RGBA'))
    art = fit(art, 3260, 4075)
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - art.width) // 2
    y = SAFE[1]
    canvas.alpha_composite(art, (x, y))
    return canvas


def sparkle(draw: ImageDraw.ImageDraw, x: int, y: int, size: int, width: int = 6):
    draw.line((x, y-size, x, y+size), fill=BLACK, width=width)
    draw.line((x-size, y, x+size, y), fill=BLACK, width=width)
    draw.line((x-size//2, y-size//2, x+size//2, y+size//2), fill=BLACK, width=max(3, width-2))
    draw.line((x-size//2, y+size//2, x+size//2, y-size//2), fill=BLACK, width=max(3, width-2))


def build_front():
    lettering = fit(visible(Image.open(LETTERING).convert('RGBA')), 700, 300)
    mark = Image.new('RGBA', (lettering.width + 190, lettering.height + 170), (0, 0, 0, 0))
    d = ImageDraw.Draw(mark)
    cx = mark.width // 2

    # More illustrated/animated halo: tilted stacked rings, motion trails, dot orbit.
    d.ellipse((cx - 155, 18, cx + 155, 92), outline=BLACK, width=13)
    d.ellipse((cx - 128, 32, cx + 128, 78), outline=BLACK, width=5)
    d.arc((cx - 198, -2, cx + 198, 112), 198, 338, fill=BLACK, width=6)
    d.arc((cx - 214, 10, cx + 214, 130), 24, 154, fill=BLACK, width=4)
    for i, (dx, dy) in enumerate([(-186, 40), (-210, 62), (178, 34), (205, 58), (0, 104)]):
        r = 4 + (i % 2)
        d.ellipse((cx+dx-r, dy-r, cx+dx+r, dy+r), fill=BLACK)

    sparkle(d, cx - 250, 92, 28, 6)
    sparkle(d, cx + 250, 95, 28, 6)
    sparkle(d, cx - 195, 178, 20, 5)
    sparkle(d, cx + 198, 178, 20, 5)
    sparkle(d, cx, mark.height - 36, 24, 5)

    # Small motion marks under the halo to make the logo feel alive but still print-clean.
    d.arc((cx - 96, 102, cx - 18, 146), 205, 332, fill=BLACK, width=4)
    d.arc((cx + 18, 102, cx + 96, 146), 208, 335, fill=BLACK, width=4)
    d.ellipse((cx - 5, 140, cx + 5, 150), fill=BLACK)

    mark.alpha_composite(lettering, (95, 128))
    mark = visible(mark)
    mark = fit(mark, 635, 500)

    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    cx_print, cy_print = 2780, 1090
    canvas.alpha_composite(mark, (cx_print - mark.width // 2, cy_print - mark.height // 2))
    return canvas


def make_mock(front, back, destination):
    mock = Image.open(BASE).convert('RGBA')
    place(mock, front, (405, 405, 500, 500))
    # Slightly higher visual placement on garment preview too.
    place(mock, back, (760, 300, 1110, 940))
    mock.convert('RGB').save(destination, optimize=True)


def write_placement(path):
    path.write_text(
        '# Young Boyz Refined - Printify Placement\n\n'
        '- Garment: White\n'
        '- Print method: DTG\n'
        '- Canvas: 3951 x 4919 px at 300 DPI\n'
        '- Safe artwork maximum: 3400 x 4250 px\n'
        '- Back placement: approved Young Boyz character art only, moved higher within Printify safe bounds\n'
        '- Front placement: wearer\'s left chest Better Together script with illustrated animated halo/stars, no face\n'
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
    for slug in ['young-boyz', 'watching-me-closly', 'warriors-dance']:
        folder = collection / slug
        if not folder.exists():
            continue
        paths.extend([folder / f'{slug}-front-print-3951x4919.png', folder / f'{slug}-back-print-3951x4919.png', folder / 'PRINTIFY-PLACEMENT.md'])
    # Correct spelling folder included separately to avoid disrupting older names.
    folder = collection / 'watching-me-closely'
    if folder.exists():
        paths.extend([folder / 'watching-me-closely-front-print-3951x4919.png', folder / 'watching-me-closely-back-print-3951x4919.png', folder / 'PRINTIFY-PLACEMENT.md'])
    with ZipFile(master, 'w', compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path in paths:
            if path.exists():
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
    source_front = SOURCE_DIR / 'young-boyz-animated-halo-pocket-print.png'
    source_back = SOURCE_DIR / 'young-boyz-characters-higher-back-print.png'

    back.save(back_path, format='PNG', dpi=DPI, optimize=True)
    front.save(front_path, format='PNG', dpi=DPI, optimize=True)
    back.save(source_back, format='PNG', dpi=DPI, optimize=True)
    front.save(source_front, format='PNG', dpi=DPI, optimize=True)
    write_placement(placement)
    zip_files([front_path, back_path, placement], package)
    make_mock(front, back, mockup)
    copy2(mockup, PUBLIC_PRODUCTS / 'young-boyz-latest-mockup.png')
    refresh_master_zip()
    print('updated halo/stars and raised back art')

if __name__ == '__main__':
    main()
