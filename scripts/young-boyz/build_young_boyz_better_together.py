from __future__ import annotations

from pathlib import Path
from shutil import copy2
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(r'C:\Users\stadi\OneDrive\Documents\FindADate app')
SOURCE_ART = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined' / 'young-boyz-floating-heads-refined-transparent.png'
LATEST_DIR = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'young-boyz'
PUBLIC_PRODUCTS = ROOT / 'public' / 'products'
BASE = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'bases' / 'white-front-back-blank.png'
SOURCE_DIR = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined'
CANVAS = (3951, 4919)
DPI = (300, 300)
BLACK = (0, 0, 0, 255)
SCRIPT = Path(r'C:\Windows\Fonts\Gabriola.ttf')
BOLD = Path(r'C:\Windows\Fonts\arialbd.ttf')


def bbox(im: Image.Image) -> tuple[int, int, int, int]:
    b = im.getchannel('A').getbbox()
    if not b:
        raise ValueError('blank image')
    return b


def visible(im: Image.Image) -> Image.Image:
    return im.crop(bbox(im))


def fit(im: Image.Image, maxw: int, maxh: int) -> Image.Image:
    s = min(maxw / im.width, maxh / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.Resampling.LANCZOS)


def source_back_art() -> Image.Image:
    art = visible(Image.open(SOURCE_ART).convert('RGBA'))
    return fit(art, 3170, 3945)


def distress(im: Image.Image, amount: int = 8) -> Image.Image:
    a = im.getchannel('A')
    edge = a.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))
    noise = Image.effect_noise(a.size, amount).convert('L').point(lambda v: 255 if v > 166 else 0)
    cut = ImageChops.multiply(edge, noise).point(lambda v: min(v, 18))
    out = im.copy()
    out.putalpha(ImageChops.subtract(a, cut))
    return out


def script_text(text: str, maxw: int, maxh: int) -> Image.Image:
    size = maxh
    while size > 24:
        font = ImageFont.truetype(str(SCRIPT), size)
        probe = Image.new('RGBA', (maxw + 220, maxh + 200), (0, 0, 0, 0))
        d = ImageDraw.Draw(probe)
        b = d.textbbox((0, 0), text, font=font)
        w, h = b[2] - b[0], b[3] - b[1]
        if w <= maxw and h <= maxh:
            layer = Image.new('RGBA', (w + 170, h + 110), (0, 0, 0, 0))
            d = ImageDraw.Draw(layer)
            d.text((85 - b[0], 48 - b[1]), text, font=font, fill=BLACK)
            return visible(distress(layer, 5))
        size -= 4
    raise ValueError('text did not fit')


def lettering_lockup() -> Image.Image:
    layer = script_text('Better Together', 1780, 430)
    pad = 120
    out = Image.new('RGBA', (layer.width + pad * 2, layer.height + 150), (0, 0, 0, 0))
    out.alpha_composite(layer, (pad, 0))
    d = ImageDraw.Draw(out)
    y = layer.height + 6
    d.arc((pad + 110, y - 115, out.width - pad - 110, y + 64), 8, 172, fill=BLACK, width=6)
    d.line((out.width // 2 - 40, y + 26, out.width // 2 + 40, y + 26), fill=BLACK, width=5)
    d.ellipse((out.width // 2 - 8, y + 50, out.width // 2 + 8, y + 66), fill=BLACK)
    return visible(distress(out, 5))


def make_back_print() -> Image.Image:
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    art = source_back_art()
    art_x = (CANVAS[0] - art.width) // 2
    art_y = 334
    canvas.alpha_composite(art, (art_x, art_y))
    lettering = lettering_lockup()
    # Keep lettering below the approved art and inside Printify safe height.
    canvas.alpha_composite(lettering, ((CANVAS[0] - lettering.width) // 2, 4042))
    return canvas


def make_pocket_mark() -> Image.Image:
    mark = Image.new('RGBA', (760, 820), (0, 0, 0, 0))
    d = ImageDraw.Draw(mark)
    # Approved no-ear, no-tongue smiling head with halo.
    d.ellipse((205, 142, 555, 492), outline=BLACK, width=17)
    d.arc((266, 42, 494, 118), 0, 360, fill=BLACK, width=13)
    d.arc((282, 58, 478, 104), 0, 360, fill=BLACK, width=5)
    d.arc((284, 260, 352, 322), 180, 360, fill=BLACK, width=9)
    d.arc((408, 260, 476, 322), 180, 360, fill=BLACK, width=9)
    d.ellipse((309, 298, 324, 314), fill=BLACK)
    d.ellipse((436, 298, 451, 314), fill=BLACK)
    d.arc((330, 328, 432, 430), 18, 160, fill=BLACK, width=9)
    d.line((378, 318, 390, 345), fill=BLACK, width=6)
    # small sparkle accents, not protrusions from the face
    for x, y in [(178, 160), (592, 164), (164, 520), (604, 520)]:
        d.line((x, y - 22, x, y + 22), fill=BLACK, width=5)
        d.line((x - 22, y, x + 22, y), fill=BLACK, width=5)
    better = script_text('Better', 360, 115)
    together = script_text('Together', 430, 115)
    mark.alpha_composite(better, ((mark.width - better.width) // 2, 505))
    mark.alpha_composite(together, ((mark.width - together.width) // 2, 592))
    d.arc((248, 682, 512, 748), 10, 170, fill=BLACK, width=5)
    return visible(distress(mark, 4))


def make_front_print() -> Image.Image:
    canvas = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    mark = fit(make_pocket_mark(), 610, 680)
    cx, cy = 2780, 1125
    canvas.alpha_composite(mark, (cx - mark.width // 2, cy - mark.height // 2))
    return canvas


def place(canvas: Image.Image, artwork: Image.Image, box: tuple[int, int, int, int]) -> None:
    fitted = fit(visible(artwork), box[2] - box[0], box[3] - box[1])
    canvas.alpha_composite(fitted, (box[0] + ((box[2] - box[0]) - fitted.width) // 2, box[1] + ((box[3] - box[1]) - fitted.height) // 2))


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
        '- Back placement: approved Young Boyz back art unchanged, Better Together lettering added below the scene\n'
        '- Front placement: wearer\'s left chest smiling halo-head pocket logo\n'
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
    PUBLIC_PRODUCTS.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)

    back = make_back_print()
    front = make_front_print()
    mark = make_pocket_mark()
    lettering = lettering_lockup()

    source_back = SOURCE_DIR / 'young-boyz-floating-heads-refined-better-together-transparent.png'
    source_front = SOURCE_DIR / 'young-boyz-smiling-head-pocket-print.png'
    source_mark = SOURCE_DIR / 'young-boyz-smiling-head-pocket-mark.png'
    source_lettering = SOURCE_DIR / 'better-together-lettering-lockup.png'
    back_path = LATEST_DIR / 'young-boyz-back-print-3951x4919.png'
    front_path = LATEST_DIR / 'young-boyz-front-print-3951x4919.png'
    placement = LATEST_DIR / 'PRINTIFY-PLACEMENT.md'
    package = LATEST_DIR.parent / 'young-boyz-latest-printify-package.zip'
    mockup = LATEST_DIR / 'young-boyz-front-back-shirt-mockup.png'

    back.save(source_back, format='PNG', dpi=DPI, optimize=True)
    back.save(back_path, format='PNG', dpi=DPI, optimize=True)
    front.save(source_front, format='PNG', dpi=DPI, optimize=True)
    front.save(front_path, format='PNG', dpi=DPI, optimize=True)
    mark.save(source_mark, format='PNG', dpi=DPI, optimize=True)
    lettering.save(source_lettering, format='PNG', dpi=DPI, optimize=True)
    write_placement(placement)
    zip_files([front_path, back_path, placement], package)
    make_mockup(front, back, mockup)
    copy2(mockup, PUBLIC_PRODUCTS / 'young-boyz-latest-mockup.png')
    refresh_master_zip()
    print('finalized Young Boyz Better Together package')

if __name__ == '__main__':
    main()
