from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

ROOT = Path(r'C:\Users\stadi\OneDrive\Documents\FindADate app')
OUT = ROOT / '.design-references' / 'young-boyz-better-together-options'
OUT.mkdir(parents=True, exist_ok=True)
SRC = ROOT / 'print-ready' / 'reillustrated' / 'young-boyz-floating-heads-refined' / 'young-boyz-floating-heads-refined-transparent.png'
BASE = ROOT / 'print-ready' / 'latest-shirt-mockups' / 'bases' / 'white-front-back-blank.png'
CANVAS = (3951, 4919)
BLACK = (0,0,0,255)
FONT_DISPLAY = Path(r'C:\Windows\Fonts\georgiaz.ttf')
FONT_SMALL = Path(r'C:\Windows\Fonts\arialbd.ttf')
FONT_CONDENSED = Path(r'C:\Windows\Fonts\impact.ttf')


def bbox(im):
    b = im.getchannel('A').getbbox()
    if not b: raise ValueError('blank')
    return b


def visible(im):
    return im.crop(bbox(im))


def fit(im, maxw, maxh):
    s = min(maxw/im.width, maxh/im.height)
    return im.resize((round(im.width*s), round(im.height*s)), Image.Resampling.LANCZOS)


def text_layer(text, font_path, maxw, maxh, stroke=0, tracking=0):
    size = maxh
    while size > 8:
        font = ImageFont.truetype(str(font_path), size)
        widths=[]; boxes=[]
        for ch in text:
            box = font.getbbox(ch)
            boxes.append(box); widths.append(box[2]-box[0])
        tw = sum(widths) + tracking*(len(text)-1)
        th = max(b[3]-b[1] for b in boxes) + stroke*2
        if tw <= maxw and th <= maxh:
            im = Image.new('RGBA', (tw+stroke*6+12, th+stroke*6+12), (0,0,0,0))
            d = ImageDraw.Draw(im)
            x = stroke*3+6
            for ch, box, w in zip(text, boxes, widths):
                d.text((x-box[0], stroke*3+6-box[1]), ch, font=font, fill=BLACK, stroke_width=stroke, stroke_fill=BLACK)
                x += w + tracking
            return visible(im)
        size -= 2
    raise ValueError(text)


def distress(im, amount=16):
    a = im.getchannel('A')
    edge = a.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(3))
    noise = Image.effect_noise(a.size, amount).convert('L').point(lambda v: 255 if v > 154 else 0)
    cut = ImageChops.multiply(edge, noise).point(lambda v: min(v, 28))
    out = im.copy(); out.putalpha(ImageChops.subtract(a, cut))
    return out


def rotate_place(canvas, im, center, angle=0):
    r = im.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    canvas.alpha_composite(r, (round(center[0]-r.width/2), round(center[1]-r.height/2)))


def make_pocket(kind):
    source = Image.open(SRC).convert('RGBA')
    # center floating head, with a touch of halo line preserved
    head = visible(source.crop((408, 292, 590, 490)))
    head = fit(head, 430, 430)
    em = Image.new('RGBA', (620, 690), (0,0,0,0))
    d = ImageDraw.Draw(em)
    if kind == 'badge':
        d.ellipse((118, 38, 502, 144), outline=BLACK, width=20)
        d.arc((88, 20, 532, 166), 195, 345, fill=BLACK, width=9)
        d.line((210, 585, 410, 585), fill=BLACK, width=12)
    elif kind == 'halo':
        d.ellipse((95, 38, 525, 132), outline=BLACK, width=18)
        d.arc((68, 14, 552, 164), 188, 352, fill=BLACK, width=8)
        for x in [185, 245, 375, 435]:
            d.line((x, 610, x+28, 640), fill=BLACK, width=7)
    else:
        d.ellipse((145, 42, 475, 132), outline=BLACK, width=16)
        d.line((235, 585, 385, 585), fill=BLACK, width=10)
        small = text_layer('DE.LA.COSTA', FONT_SMALL, 220, 28, tracking=1)
        em.alpha_composite(small, ((em.width-small.width)//2, 614))
    em.alpha_composite(head, ((em.width-head.width)//2, 175))
    return visible(distress(em, 10))


def make_back(option):
    art = visible(Image.open(SRC).convert('RGBA'))
    back = Image.new('RGBA', CANVAS, (0,0,0,0))
    # keep the art basically approved-size, slightly reduced only where type needs room
    art_fit = fit(art, 3070, 3660)
    art_x = (CANVAS[0]-art_fit.width)//2
    art_y = 760 if option != 'ground' else 650
    back.alpha_composite(art_fit, (art_x, art_y))
    d = ImageDraw.Draw(back)
    if option == 'halo':
        better = text_layer('Better', FONT_DISPLAY, 980, 250, stroke=1)
        together = text_layer('Together', FONT_DISPLAY, 1230, 250, stroke=1)
        rotate_place(back, distress(better, 10), (1180, 780), -9)
        rotate_place(back, distress(together, 10), (2785, 790), 8)
        # small dots and pin lines matching the existing vertical ornaments
        for x in [980, 3010]:
            d.line((x, 640, x, 1260), fill=BLACK, width=7)
            for y in range(680, 1240, 95):
                d.ellipse((x-9,y-9,x+9,y+9), fill=BLACK)
    elif option == 'handshake':
        txt = text_layer('Better Together', FONT_DISPLAY, 1650, 230, stroke=1)
        rotate_place(back, distress(txt, 10), (CANVAS[0]//2, 3450), -2)
        d.arc((1160, 3255, 2810, 3625), 8, 172, fill=BLACK, width=10)
        d.arc((1280, 3330, 2690, 3645), 10, 170, fill=BLACK, width=4)
    elif option == 'ground':
        better = text_layer('BETTER', FONT_CONDENSED, 1250, 280, stroke=0, tracking=14)
        together = text_layer('TOGETHER', FONT_CONDENSED, 1720, 310, stroke=0, tracking=12)
        better = distress(better, 8); together = distress(together, 8)
        back.alpha_composite(better, ((CANVAS[0]-better.width)//2, 440))
        back.alpha_composite(together, ((CANVAS[0]-together.width)//2, 4210))
        for x in [550, 3390]:
            d.line((x, 950, x, 3880), fill=BLACK, width=8)
            d.line((x-45, 1130, x, 1070), fill=BLACK, width=5)
            d.line((x+45, 3690, x, 3750), fill=BLACK, width=5)
    return back


def place(canvas, artwork, box):
    fitted = fit(visible(artwork), box[2]-box[0], box[3]-box[1])
    canvas.alpha_composite(fitted, (box[0]+((box[2]-box[0])-fitted.width)//2, box[1]+((box[3]-box[1])-fitted.height)//2))


def make_mock(option, title):
    back = make_back(option)
    front = Image.new('RGBA', CANVAS, (0,0,0,0))
    pocket = fit(make_pocket({'halo':'halo','handshake':'badge','ground':'signed'}[option]), 460, 540)
    front.alpha_composite(pocket, (2780-pocket.width//2, 1170-pocket.height//2))
    base = Image.open(BASE).convert('RGBA')
    place(base, front, (420, 418, 485, 492))
    place(base, back, (735, 315, 1130, 972))
    out = OUT / f'{option}-mockup.png'
    base.convert('RGB').save(out, optimize=True)
    # Add label below for review sheet only.
    labeled = Image.new('RGB', (base.width, base.height+86), 'white')
    labeled.paste(base.convert('RGB'), (0,0))
    d = ImageDraw.Draw(labeled)
    font = ImageFont.truetype(str(FONT_SMALL), 38)
    d.text((38, base.height+24), title, fill=(0,0,0), font=font)
    labeled.save(OUT / f'{option}-labeled.png', optimize=True)
    back.save(OUT / f'{option}-back-print-preview.png', optimize=True)
    front.save(OUT / f'{option}-front-print-preview.png', optimize=True)
    return labeled

options = [
    ('halo','A - split script around halos'),
    ('handshake','B - script tucked under handshake'),
    ('ground','C - bold top and ground lettering'),
]
imgs = [make_mock(opt, title) for opt,title in options]
thumbs=[]
for im in imgs:
    thumbs.append(im.resize((520, round(im.height*520/im.width)), Image.Resampling.LANCZOS))
margin=28
sheet = Image.new('RGB', (margin*4 + 520*3, max(t.height for t in thumbs)+margin*2), (245,245,245))
for i,t in enumerate(thumbs): sheet.paste(t, (margin+i*(520+margin), margin))
sheet.save(OUT / 'concept-sheet.png', optimize=True)
print(OUT / 'concept-sheet.png')
