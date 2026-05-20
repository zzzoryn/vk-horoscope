# vk-horoscope

Automated horoscope posting for 17 VK communities. Texts from [ignio.com](https://ignio.com) → Google Sheets → image tiles → VK wall posts via Netlify scheduled functions.

## Flow

1. **Fetch** daily/weekly XML into Google Sheet  
2. **Generate** PNG tiles (Sharp + Noto Sans) and upload to VK  
3. **Post** collages (5 type groups), sign posts (12 groups), promo footer + link comment  

## VK groups

- **5 type groups:** common, business, love, health, erotic — see `src/constants.js`  
- **12 sign groups:** Aries … Pisces  

## Schedule (UTC)

| Cron | Function |
|------|----------|
| `0 4 * * *` | `schedule-fetch-daily-data` |
| `0-11 5 * * *` | `schedule-post-daily-tile-image` (1 sign × 5 types / min) |
| `0-11 17 * * *` | `schedule-post-daily-tile-image-pm` (backup tiles) |
| `0,5,10,15 19 * * *` | `schedule-post-daily-horo` (steps 1–4) |
| Sun `15 4 * * 0` | `schedule-fetch-weekly-data` |
| Sun `0-16 6 * * 0` | `schedule-post-weekly-tile-image` |
| Sun `0,5,10 18 * * 0` | `schedule-post-weekly-horo` |

MSK = UTC+3 (e.g. `19:00 UTC` → 22:00 MSK).

## Google Sheet

Add columns per row: `common_image_date`, `business_image_date`, `love_image_date`, `health_image_date`, `erotic_image_date`.

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
| `VK_API_TOKEN` | User OAuth token (`wall`, `photos`) for **photo uploads** only |
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
```

Do not invoke `schedule-post-daily-tile-image` outside minutes `0–11` — it exits early by design.

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
