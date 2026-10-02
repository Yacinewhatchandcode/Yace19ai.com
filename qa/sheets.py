"""Arrange captured route screenshots for human visual inspection."""
from pathlib import Path
from PIL import Image, ImageDraw

files = sorted(p for p in Path("qa-evidence/final/screenshots").glob("*.jpg") if not p.stem.endswith("-full"))
for start in range(0, len(files), 15):
    subset = files[start:start + 15]
    sheet = Image.new("RGB", (1500, 1050), "#171717")
    draw = ImageDraw.Draw(sheet)
    for i, path in enumerate(subset):
        image = Image.open(path)
        image.thumbnail((296, 320))
        x, y = (i % 5) * 300, (i // 5) * 350
        sheet.paste(image, (x, y + 24))
        draw.text((x + 4, y + 4), path.stem[:44], fill="white")
    sheet.save(f"qa-evidence/route-sheet-{start // 15 + 1}.jpg", quality=85)
