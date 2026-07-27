# OG card fonts

Three subset `ttf` files, used by `src/app/opengraph-image.tsx` and
`src/app/icon.tsx` and by nothing else. The page itself keeps loading Poppins
and Inter through `next/font/google` in `layout.tsx` — these are a second copy
for a renderer that cannot use the first one.

**Why a second copy.** `ImageResponse` rasterises through Satori, which reads
`ttf`, `otf` and `woff` and **not** `woff2`. `next/font/google` emits `woff2`
only. There is no way to hand the page's fonts to the card, so the card gets
its own.

**Why subset.** The full pair is 1.0MB. Everything the card and the icon draw
is Basic Latin plus a middot, so the three files together are 31KB. Editing the
card's copy is safe as long as it stays inside that range; a glyph outside it
renders as a blank box rather than failing the build, so check the image after
changing the wording.

## Regenerating

Sources are the upstream Google Fonts repository. Inter ships only as a
variable font, so it is instanced to a fixed weight before subsetting — Satori
would otherwise render every weight at the variable default.

```bash
curl -sSfL -o Poppins-Bold.ttf \
  https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf
curl -sSfL -o Inter-var.ttf \
  'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf'

python3 -m fontTools.varLib.instancer Inter-var.ttf wght=400 opsz=28 -o Inter-400.ttf
python3 -m fontTools.varLib.instancer Inter-var.ttf wght=500 opsz=28 -o Inter-500.ttf

UNI='U+0020-007E,U+00A0,U+00B7,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026'
for pair in "Poppins-Bold.ttf Poppins-Bold" "Inter-400.ttf Inter-Regular" "Inter-500.ttf Inter-Medium"; do
  set -- $pair
  pyftsubset "$1" --unicodes="$UNI" --output-file="$2.subset.ttf" \
    --layout-features='' --no-hinting --desubroutinize \
    --drop-tables+=DSIG --name-IDs='*' --recalc-bounds
done
```

`pyftsubset` and `fontTools.varLib.instancer` both come from `fonttools`
(`pip install fonttools`); neither is a project dependency, because this runs
by hand roughly never.

## Licensing

Both families are SIL Open Font License 1.1. The licences are kept beside the
files they cover — `Poppins-OFL.txt` and `Inter-OFL.txt` — because the OFL
requires the notice to travel with the font, and subsetting does not exempt a
derivative from that.
