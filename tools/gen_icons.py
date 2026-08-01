from PIL import Image, ImageDraw
import os

OUT = "/home/claude/Sustansya/icons"
os.makedirs(OUT, exist_ok=True)

BG1 = (32, 54, 42, 255)     # surface-top
BG2 = (16, 28, 22, 255)     # surface-bottom
MANGO = (255, 157, 66, 255)
CALAMANSI = (199, 221, 91, 255)
CHILI = (255, 107, 87, 255)

def rounded_bg(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0,0,0,0))
    # diagonal gradient background
    grad = Image.new("RGBA", (size, size), (0,0,0,0))
    gd = ImageDraw.Draw(grad)
    for y in range(size):
        t = y / size
        r = int(BG1[0]*(1-t) + BG2[0]*t)
        g = int(BG1[1]*(1-t) + BG2[1]*t)
        b = int(BG1[2]*(1-t) + BG2[2]*t)
        gd.line([(0,y),(size,y)], fill=(r,g,b,255))
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    radius = int(size * radius_ratio)
    md.rounded_rectangle([0,0,size-1,size-1], radius=radius, fill=255)
    img.paste(grad, (0,0), mask)
    return img

def draw_plate_mark(img, size, ring_scale=0.30, ring_width_ratio=0.11, maskable=False):
    d = ImageDraw.Draw(img)
    cx = cy = size / 2
    r = size * ring_scale
    width = max(3, int(size * ring_width_ratio))
    bbox = [cx - r, cy - r, cx + r, cy + r]
    # track (subtle)
    d.ellipse(bbox, outline=(255,255,255,40), width=width)
    # progress arc ~70% (mango), rounded feel via multiple overlapping arcs
    start = -90
    extent = 250
    d.arc(bbox, start=start, end=start+extent, fill=MANGO, width=width)
    # small calamansi dot garnish at the arc's leading end
    import math
    ang = math.radians(start + extent)
    dot_r = width * 0.62
    dx = cx + r * math.cos(ang)
    dy = cy + r * math.sin(ang)
    d.ellipse([dx-dot_r, dy-dot_r, dx+dot_r, dy+dot_r], fill=CALAMANSI)
    # center dot (chili) small accent
    cr = size * 0.035
    d.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=CHILI)
    return img

def make_icon(size, maskable=False):
    radius_ratio = 0.5 if maskable else 0.22
    img = rounded_bg(size, radius_ratio=radius_ratio)
    scale = 0.24 if maskable else 0.30
    img = draw_plate_mark(img, size, ring_scale=scale, ring_width_ratio=0.10, maskable=maskable)
    return img

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for s in sizes:
    make_icon(s).save(f"{OUT}/icon-{s}.png")

make_icon(192, maskable=True).save(f"{OUT}/icon-maskable-192.png")
make_icon(512, maskable=True).save(f"{OUT}/icon-maskable-512.png")

print("done", os.listdir(OUT))
