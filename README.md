# Chiefs Kingdom Collection Vault

A single-page museum gallery of fictional signed Kansas City Chiefs memorabilia. The page is plain HTML, CSS, and JavaScript. There is no build step and there are no dependencies. Every piece shipped in this repo is sample data.

## Local preview

`fetch` cannot read `items.json` when you open `index.html` as a file (`file://`). From this folder, start a local server and open the URL it prints:

```bash
python3 -m http.server
```

Then visit `http://127.0.0.1:8000/`.

On GitHub Pages the site is served from `/chiefs-kingdom-vault/`. Styles, scripts, images, and `items.json` use relative paths, so the same files work there.

## How to edit items.json

The collection lives in `items.json` at the repository root. The page loads that file in the browser when it opens. Edit the JSON, save, and refresh. You do not need to rebuild anything.

The file is an array. Each object is one piece:

| Field | Type | What to put |
| --- | --- | --- |
| `id` | string | A unique id, such as `sample-0013` |
| `title` | string | The name on the card and in the Hall of Fame |
| `signer` | string | The player who signed the piece. Vault totals group pieces by this name |
| `category` | string | A short label such as `helmet`, `jersey`, `football`, `photo`, `card`, or `program` |
| `yearSigned` | number | The year the signature was added |
| `coaAuthority` | string | Who issued the certificate of authenticity |
| `coaCert` | string | The certificate number. Sample pieces use placeholders such as `SAMPLE-0001` |
| `purchasePrice` | number | What was paid, in US dollars |
| `estimatedValue` | number | The current estimate, in US dollars |
| `image` | string | A relative path under `img/`, such as `img/sample-0001-white-shell-helmet.svg` |
| `description` | string | One or two sentences. Say that a piece is a sample when it is not a real item |
| `featured` | boolean | `true` includes the piece in the Hall of Fame. Anything else leaves it out |

Example:

```json
{
  "id": "sample-0013",
  "title": "Sample mini helmet",
  "signer": "Patrick Mahomes",
  "category": "helmet",
  "yearSigned": 2024,
  "coaAuthority": "Sample Authentication Bureau",
  "coaCert": "SAMPLE-0013",
  "purchasePrice": 120,
  "estimatedValue": 180,
  "image": "img/sample-0001-white-shell-helmet.svg",
  "description": "Sample record of a fictional mini helmet. This sample is not a real autograph.",
  "featured": false
}
```

Put image files in `img/` and commit them with the repo. Point `image` at a relative path. Do not hotlink images, and do not add team logos or player photographs. The sample plates repeat the same internal SVG ids, so leave each file as its own image and let the page load it with an `img` element. Pasting several of those files into the page would make those ids collide.

`featured: true` adds a piece to the Hall of Fame, which cycles those pieces until a visitor hovers or focuses the spotlight. Previous and Next move through the same list. Vault totals, the count of pieces per player, and the best deal are calculated in the browser. The best deal is the piece with the largest current estimate divided by the purchase price. A purchase price of zero is left out of that comparison.

If `items.json` cannot be fetched, the page shows a message instead of an empty gallery.

## GitHub Pages

`.github/workflows/pages.yml` deploys this folder with GitHub Actions on every push to `main`. In the repository settings, open **Settings > Pages** and set **Source** to **GitHub Actions** before that workflow can publish.

## Disclaimer

This is an unofficial demo. It is not affiliated with the Kansas City Chiefs, the NFL, or any player. The sample certificates are not real certificates of authenticity.
