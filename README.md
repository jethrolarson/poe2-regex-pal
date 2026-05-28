# POE2 Regex Pal

A free, static web tool that builds optimized regex strings for **Path of Exile 2's in-game search bars** (vendors, stash). Compose what you're hunting for, and it generates a search string you paste straight into the game.

**Live:** https://jethrolarson.github.io/poe2-regex-pal/

## Why?

POE2's search bars accept regex. Speedrunner guides share hand-crafted strings full of opaque fragments like `nter's` or `rwh`, with no explanation, re-tuned by hand every patch. Hard to learn, tedious to maintain, easy to get wrong. I thought I could do this in a programmatic way so nobody has to guess what 'rwh' means or whether it's actually unique and easily build compressed regexes without knowing how to code or reading through thousands of affixes.

## How it works

Add Affix categories to your regex and check the boxes of what you want included. Everything you select gets ORed together into a single regex. I've done some processing of the affix names to compress the strings as best as possible while avoiding false negatives. In some cases you may see more things highlighted than intended but I figure that's better than missing something important.

For the most part I'm matching on affix name ("Sprinter's" compressed as "inter'") but for implicits I have to match on the stat line such as "to maximum Life".

A solver builds the fragments from datamined affix data (from [RePoE Fork](https://repoe-fork.github.io/poe2/)), then each name is shortened to the shortest substring still unique against the full corpus of affix names, stat lines, and base-item names. Every fragment stays a substring of the original, so this can't introduce false negatives -- the guiding rule throughout (missing a good item is worse than highlighting an extra one). It typically shrinks a string 35–45%. This is less critical now that search can take 250 characters but using affix names (while better for specificity) eats up space quickly.

## Development

Requires [pnpm](https://pnpm.io/) and Node 22+ (the data script uses `--experimental-strip-types`).

```bash
pnpm install
pnpm dev        # local dev server
pnpm test       # vitest
pnpm typecheck  # tsc --noEmit
pnpm lint       # eslint
pnpm build      # production build to dist/
```

Refresh the bundled affix data (re-pulls from RePoE Fork; run per patch):

```bash
node --experimental-strip-types scripts/build_affixes.ts
```

Deploys to GitHub Pages via GitHub Actions on push to `main`.

## Stack

TypeScript (strict) · [@fun-land](https://github.com/jethrolarson/fun-land) (fun-web, fun-state, accessor) · [vanilla-extract](https://vanilla-extract.style/) · Vite · pnpm

## Credits

Inspired by [_A System for Regex Shopping in Path of Exile 2_](https://www.youtube.com/watch?v=eIZmlyucrtk) by CrimsonCasts. Affix data from [RePoE Fork](https://repoe-fork.github.io/poe2/).

## License

[MIT](LICENSE)
