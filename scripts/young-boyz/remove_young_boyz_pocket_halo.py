from __future__ import annotations

from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image

ROOT = Path(r'C:\Users\stadi\OneDrive\Documents\FindADate app')
LETTERING = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined' / 'approved-better-together-lettering-extracted.png'
LATEST_DIR = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'young-boyz'
SOURCE_DIR = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined'
PUBLIC_PRODUCTS = ROOT / 'public' / 'products'
BASE = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'bases' / 'white-front-back-blank.png'
CANVAS = (3951, 4919)
DPI = (300, 300)


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


def build_front_no_halo():
    mark = fit(visible(Image.open(LETTERING).convert('RGBA')), 455, 205)
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    cx, cy = 2780, 1095
    canvas.alpha_composite(mark, (cx - mark.width // 2, cy - mark.height // 2))
    return canvas


def write_placement(path):
    path.write_text(
        '# Young Boyz Refined - Printify Placement\n\n'
        '- Garment: White\n'
        '- Print method: DTG\n'
        '- Canvas: 3951 x 4919 px at 300 DPI\n'
        '- Safe artwork maximum: 3400 x 4250 px\n'
        '- Back placement: approved Young Boyz character art only, top-aligned to safe area for shoulder-area placement\n'
        '- Front placement: smaller wearer\'s left chest Better Together script only, no halo\n'
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
            if path.exists():
                archive.write(path, arcname=path.relative_to(collection))


def main():
    front = build_front_no_halo()
    back_path = LATEST_DIR / 'young-boyz-back-print-3951x4919.png'
    front_path = LATEST_DIR / 'young-boyz-front-print-3951x4919.png'
    placement = LATEST_DIR / 'PRINTIFY-PLACEMENT.md'
    package = LATEST_DIR.parent / 'young-boyz-latest-printify-package.zip'
    mockup = LATEST_DIR / 'young-boyz-front-back-shirt-mockup.png'
    source_front = SOURCE_DIR / 'young-boyz-pocket-script-no-halo-print.png'

    front.save(front_path, format='PNG', dpi=DPI, optimize=True)
    front.save(source_front, format='PNG', dpi=DPI, optimize=True)
    write_placement(placement)
    zip_files([front_path, back_path, placement], package)

    back = Image.open(back_path).convert('RGBA')
    mock = Image.open(BASE).convert('RGBA')
    place(mock, front, (414, 415, 486, 482))
    place(mock, back, (750, 245, 1120, 930))
    mock.convert('RGB').save(mockup, optimize=True)
    copy2(mockup, PUBLIC_PRODUCTS / 'young-boyz-latest-mockup.png')
    refresh_master_zip()
    print('removed front pocket halo')

if __name__ == '__main__':
    main()
