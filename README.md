# Chiefs Kingdom Collection Vault

Gage's signed Chiefs collection. The page is plain HTML, CSS, and JavaScript. There is no build step and there are no dependencies.

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
| `id` | string | A unique id |
| `title` | string | The name on the card and in the Hall of Fame |
| `signer` | string | Who signed the piece. Separate two names with `&` so each player is counted |
| `category` | string | A short label such as `jersey` or `card` |
| `yearSigned` | number | Optional. The year the signature was added. Omitted fields are not shown |
| `coaAuthority` | string | Optional. Who issued the certificate, or the card company for an on-card auto |
| `coaCert` | string | Optional. The certificate number. Leave it out when there is none |
| `purchasePrice` | number | Optional. What was paid, in US dollars |
| `estimatedValue` | number | Optional. The current estimate, in US dollars |
| `image` | string | A relative path under `img/` |
| `description` | string | One or two factual sentences |
| `featured` | boolean | `true` includes the piece in the Hall of Fame. Anything else leaves it out |

`SHOW_PRICES` at the top of `app.js` defaults to `false`. While it is false, or while no piece has both a purchase price and an estimated value, the page hides paid, current value, gain, the money totals, and the best deal. Piece count and pieces per player stay visible.

Put image files in `img/` and commit them with the repo. Point `image` at a relative path. Do not hotlink images, and do not add team logos or player photographs. Load each illustration with an `img` element rather than pasting the SVG markup into the page.

`featured: true` adds a piece to the Hall of Fame, which cycles those pieces until a visitor hovers or focuses the spotlight. Previous and Next move through the same list. The order in `items.json` is the spotlight order.

If `items.json` cannot be fetched, the page shows a message instead of an empty gallery.

## GitHub Pages

Pages publishes this folder from a branch. In the repository settings, open **Settings > Pages**, set **Source** to **Deploy from a branch**, and choose the branch that holds the site. There is no GitHub Actions workflow.

## Disclaimer

This is an unofficial collection. It is not affiliated with the Kansas City Chiefs, the NFL, or any player.
