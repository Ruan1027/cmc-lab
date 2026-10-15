#!/usr/bin/env python3
"""生成 CMC Lab 的 PWA 图标（纯标准库，无需 Pillow / ImageMagick）。

产出：
  public/icons/icon.svg        矢量图标（manifest 的 any 图标）
  public/icons/icon-192.png    192x192 圆角方块 + ∑
  public/icons/icon-512.png    512x512 同上
  public/icons/maskable-512.png 512x512 满铺背景（maskable 安全区）

设计沿用 favicon：蓝色 (#2563eb) 圆角方块 + 白色 ∑。
"""

import os
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
BLUE = (37, 99, 235)
WHITE = (255, 255, 255)


def new_image(w: int, h: int) -> bytearray:
    # RGBA，全透明
    return bytearray(w * h * 4)


def set_px(buf: bytearray, w: int, x: int, y: int, rgb):
    h = len(buf) // (w * 4)
    if x < 0 or y < 0 or x >= w or y >= h:
        return
    i = (y * w + x) * 4
    buf[i] = rgb[0]
    buf[i + 1] = rgb[1]
    buf[i + 2] = rgb[2]
    buf[i + 3] = 255


def fill_rounded_rect(buf, w, h, x0, y0, x1, y1, r, rgb):
    for y in range(h):
        for x in range(w):
            if not (x0 <= x <= x1 and y0 <= y <= y1):
                continue
            # 四个圆角：超出圆角的区域裁掉（透明）
            if x < x0 + r and y < y0 + r:
                cx, cy = x0 + r, y0 + r
                if (x - cx) ** 2 + (y - cy) ** 2 > r * r:
                    continue
            elif x > x1 - r and y < y0 + r:
                cx, cy = x1 - r, y0 + r
                if (x - cx) ** 2 + (y - cy) ** 2 > r * r:
                    continue
            elif x < x0 + r and y > y1 - r:
                cx, cy = x0 + r, y1 - r
                if (x - cx) ** 2 + (y - cy) ** 2 > r * r:
                    continue
            elif x > x1 - r and y > y1 - r:
                cx, cy = x1 - r, y1 - r
                if (x - cx) ** 2 + (y - cy) ** 2 > r * r:
                    continue
            set_px(buf, w, x, y, rgb)


def fill_full_rect(buf, w, h, rgb):
    for y in range(h):
        for x in range(w):
            set_px(buf, w, x, y, rgb)


def dist_to_seg(px, py, ax, ay, bx, by):
    dx = bx - ax
    dy = by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    cx = ax + t * dx
    cy = ay + t * dy
    return ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5


def draw_sigma(buf, w, h, left, right, top, bottom, half, rgb):
    segs = [
        (left, top, right, top),       # 顶横
        (right, top, left, bottom),    # 斜笔（右上→左下）
        (left, bottom, right, bottom), # 底横
    ]
    for y in range(h):
        for x in range(w):
            d = min(dist_to_seg(x, y, *s) for s in segs)
            if d <= half:
                set_px(buf, w, x, y, rgb)


def write_png(path, w, h, buf):
    raw = bytearray()
    for y in range(h):
        raw.append(0)  # filter type 0
        raw.extend(buf[y * w * 4 : (y + 1) * w * 4])

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        c += struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        return c

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    with open(path, "wb") as f:
        f.write(sig)
        f.write(chunk(b"IHDR", ihdr))
        f.write(chunk(b"IDAT", idat))
        f.write(chunk(b"IEND", b""))


def build(size, maskable):
    w = h = size
    buf = new_image(w, h)
    if maskable:
        fill_full_rect(buf, w, h, BLUE)
        # 安全区：符号缩到中心 ~60%
        w_sym = size * 0.6
        h_sym = size * 0.5
    else:
        r = int(size * 0.22)
        fill_rounded_rect(buf, w, h, 0, 0, w - 1, h - 1, r, BLUE)
        w_sym = size * 0.586
        h_sym = size * 0.469
    cx = cy = size / 2
    left = int(cx - w_sym / 2)
    right = int(cx + w_sym / 2)
    top = int(cy - h_sym / 2)
    bottom = int(cy + h_sym / 2)
    half = max(2, int(size * 0.04))
    draw_sigma(buf, w, h, left, right, top, bottom, half, WHITE)
    return buf


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for size in (192, 512):
        buf = build(size, maskable=False)
        write_png(os.path.join(OUT_DIR, f"icon-{size}.png"), size, size, buf)
        print(f"wrote icon-{size}.png")
    buf = build(512, maskable=True)
    write_png(os.path.join(OUT_DIR, "maskable-512.png"), 512, 512, buf)
    print("wrote maskable-512.png")


if __name__ == "__main__":
    main()
