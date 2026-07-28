from __future__ import annotations

from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image

ROOT = Path(r'C:\Users\stadi\OneDrive\Documents\FindADate app')
SOURCE_ART = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined' / 'young-boyz-floating-heads-refined-transparent.png'
LATEST_DIR = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'young-boyz'
PUBLIC_PRODUCTS = ROOT / 'public' / 'products'
BASE = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'bases' / 'white-front-back-blank.png'
CANVAS = (3951, 4919)
DPI = (300, 300)
SAFE_MAX = (3400, 4250)


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


def original_back_canvas():
    art = fit(visible(Image.open(SOURCE_ART).convert('RGBA')), *SAFE_MAX)
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(art, ((CANVAS[0]-art.width)//2, (CANVAS[1]-art.height)//2))
    return canvas


def write_placement(path):
    path.write_text(
        '# Young Boyz Refined - Printify Placement\n\n'
        '- Garment: White\n'
        '- Print method: DTG\n'
        '- Canvas: 3951 x 4919 px at 300 DPI\n'
        '- Safe artwork maximum: 3400 x 4250 px\n'
        '- Back placement: approved Young Boyz character art only, centered upper/mid back\n'
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
    back_path = LATEST_DIR / 'young-boyz-back-print-3951x4919.png'
    front_path = LATEST_DIR / 'young-boyz-front-print-3951x4919.png'
    placement = LATEST_DIR / 'PRINTIFY-PLACEMENT.md'
    package = LATEST_DIR.parent / 'young-boyz-latest-printify-package.zip'
    mockup = LATEST_DIR / 'young-boyz-front-back-shirt-mockup.png'

    back = original_back_canvas()
    front = Image.open(front_path).convert('RGBA')
    back.save(back_path, format='PNG', dpi=DPI, optimize=True)
    write_placement(placement)
    zip_files([front_path, back_path, placement], package)

    canvas = Image.open(BASE).convert('RGBA')
    place(canvas, front, (405, 405, 500, 500))
    place(canvas, back, (760, 335, 1110, 940))
    canvas.convert('RGB').save(mockup, format='PNG', optimize=True)
    copy2(mockup, PUBLIC_PRODUCTS / 'young-boyz-latest-mockup.png')
    refresh_master_zip()
    print('removed back lettering')

if __name__ == '__main__':
    main()
