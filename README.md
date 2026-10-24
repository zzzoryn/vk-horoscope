# vk-horoscope

Automated horoscope posting for 17 VK communities. Texts from [ignio.com](https://ignio.com) → Google Sheets → image tiles → VK wall posts via Netlify scheduled functions.

## Flow

1. **Fetch** daily/weekly XML into Google Sheet  
2. **Generate** PNG tiles (Sharp + Noto Sans) and upload to VK  
3. **Post** collages (5 type groups) and sign posts (12 groups) — one wall post per cron minute (Netlify scheduled ~30s limit)  

## VK groups

- **5 type groups:** common, business, love, health, erotic — see `src/constants.js`  
- **12 sign groups:** Aries … Pisces  

## Schedule (UTC)

Daily sheet is filled **in the evening before posts**, so if publish fails you can still manually post the next calendar day while the sheet still holds that day’s texts/tiles.

| Cron | Function | MSK |
|------|----------|-----|
| `0 16 * * *` | `schedule-fetch-daily-data` (texts + `content_date`) | 19:00 |
| `0-11 17 * * *` | `schedule-post-daily-tile-image` (1 sign × 5 types / min) | 20:00 |
| `0-11 18 * * *` | `schedule-post-daily-tile-image-pm` (backup tiles) | 21:00 |
| `0-21 19,20 * * *` | `schedule-post-daily-horo` (1 post / min; 20:xx = repair) | 22:00 / 23:00 |
| Sun `15 4 * * 0` | `schedule-fetch-weekly-data` | вс 07:15 |
| Sun `0-16 6 * * 0` | `schedule-post-weekly-tile-image` | вс 09:00 |
| Sun+Mon `0-16 18 * * 0,1` | `schedule-post-weekly-horo` (1 post+pin / min; Mon = repair) | 21:00 |

MSK = UTC+3.

### Daily post slots (`minute` = slot)

| Slot | What |
|------|------|
| 0–4 | Collage part 1 (common → erotic) |
| 5–9 | Collage part 2 |
| 10–21 | Sign groups (aries → pisces) |

Post steps **do not** regenerate tiles: if `*_image_date` is stale, the slot fails fast. Generate tiles via tile crons (or locally) first.

### Weekly post slots

| Slot | What |
|------|------|
| 0–4 | Type group weekly summary + pin |
| 5–16 | Sign group weekly post + pin |

## Google Sheet

Add columns per row: `content_date`, `common_image_date`, `business_image_date`, `love_image_date`, `health_image_date`, `erotic_image_date`.

`content_date` is written by evening fetch (e.g. `25 октября`). Daily posts use it for the wall date / tile freshness, so next-day manual `manual-daily-horo?slot=…` still targets the prepared day until the next evening fetch.

### Function logs tab

Create a sheet tab named **`logs`** (or set `FUNCTION_LOGS_SHEET`) with header row:

`function | updated_at | status | status_code | message | detail`

Each Netlify function upserts its row (slot/minute runs get keys like `schedule-post-daily-horo#m=5`). Status goes `running` → `ok` / `error`. If a row stays `running`, the invoke likely timed out.

### Google credentials (local)

If you see `error:1E08010C:DECODER routines::unsupported`, the private key in `.env` is malformed. **Use the JSON file from Google Cloud** instead of pasting the key:

```env
GOOGLE_SHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_JSON=./service-account.json
```

```bash
npm run validate:google
npm run vk:push-group-tokens
```

On Netlify keep `GOOGLE_PRIVATE_KEY` + `GOOGLE_SERVICE_ACCOUNT_EMAIL` (one key only, no 17 VK tokens in env).

Weekly data: sheet id `1404558085` (hardcoded).

## Environment

See [`.env.example`](.env.example).

| Variable | Purpose |
|----------|---------|
| `GOOGLE_*` | Sheet access (service account) |
| `VK_API_TOKEN` | User OAuth token (`wall`, `photos`) for **photo uploads** and **pinning** weekly posts (admin in all groups) |
| `VK_GROUP_TOKENS` | Local only: JSON `{"groupId":"key",...}`. **Netlify:** store same JSON in Google Sheet tab `group_tokens` cell **A1** (see below) |

### VK token notes

- Use a **Standalone** VK app and `redirect_uri=https://oauth.vk.com/blank.html`.  
- User tokens are often **bound to the IP** where you authorized → may fail on Netlify with `Code №5`.  
- If so, run tile generation **locally** (`npm run tiles:all`) and keep Netlify for fetch/post only, or use a VPS with a stable IP for the same token.

### Netlify: group tokens in Google Sheet (4KB env limit)

AWS Lambda allows **4KB total** for all environment variables. Seventeen community keys in `VK_GROUP_TOKENS` exceed that together with `GOOGLE_PRIVATE_KEY`.

1. Keep `VK_GROUP_TOKENS` in local `.env` for development.  
2. Run `npm run vk:push-group-tokens` (writes `.env` JSON to sheet tab **`group_tokens`**, cell **A1**).  
3. In **Netlify → Environment variables**, **delete** `VK_GROUP_TOKENS`.  
4. Redeploy.

Functions load tokens from the sheet when `VK_GROUP_TOKENS` is unset. Optional: `VK_GROUP_TOKENS_SHEET` to use another tab name.

## Manual runs

```bash
yarn install
cp .env.example .env

# Tiles (not tied to cron minute)
npm run tiles:sign -- aries
npm run tiles:all

npm run vk:group-tokens-template
npm run vk:push-group-tokens
npm run vk:test-group-token -- 219706249

# Netlify HTTP (after deploy)
# /.netlify/functions/manual-daily-tiles?sign=aries
# /.netlify/functions/manual-weekly-tiles?sign=aries
# /.netlify/functions/manual-weekly-tiles?bg=love
# /.netlify/functions/manual-weekly-tiles?slot=0
# /.netlify/functions/manual-daily-horo?slot=0
# /.netlify/functions/manual-weekly-horo?slot=5
```

Do not invoke `schedule-post-daily-tile-image` outside minutes `0–11` — it exits early by design. Same for post crons outside their slot minutes.

## Promo

Posts and promo comments go **from the community** (`from_group: 1`) via `VK_GROUP_TOKENS`; the user token is only for uploading tile images. Texts: `src/post/promoTexts.js`.

```bash
npm run vk:group-tokens-template   # JSON skeleton for all 17 groupIds
npm run vk:test-group-token -- 219706249
```

Community keys: each group → **Управление** → **Работа с API** → create key (wall / messages access).

## Local dev

```bash
nvm use 18   # Netlify uses Node 18
npm run dev
```

## License

ISC
