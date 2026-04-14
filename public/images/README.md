# Site images

All images used by the site live in this folder and are served at
`<BASE_URL>/images/<filename>` (e.g. `/sawoow-luzze/images/hero.svg` in
production). They are imported through `src/components/PlaceholderImage.jsx`,
which falls back to a gradient if a file is missing.

## Current files

| File | Where it's used | Recommended size |
|---|---|---|
| `hero.svg` | Right-hand column of the Home hero section | ~1200×1500 portrait |
| `founder.svg` | Founder portrait on the Why Luzze page | ~900×1200 portrait |

The current files are SVG placeholders that match the site's colour palette.
Replace them with real photography before launch.

## Replacing a placeholder with a real photo

1. Save the photo as `hero.jpg` (or `.webp`, `.png`) inside this folder.
2. Open `src/pages/Home.jsx` (or `src/pages/WhyLuzze.jsx` for the founder image)
   and change the `src` prop on the `<PlaceholderImage>` component to match
   the new filename — e.g. `src="/images/hero.jpg"`.
3. Commit both files.

## Conventions

- JPG / WebP for photography, SVG for icons/placeholders.
- Compress before committing (< 400 KB for hero, < 300 KB for portraits).
- No Git LFS — commit the binary directly.
- Keep filenames lowercase and hyphenated.
