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

Weekly data: sheet id `1404558085` (hardcoded).

## Environment

See [`.env.example`](.env.example).

| Variable | Purpose |
|----------|---------|
| `GOOGLE_*` | Sheet access (service account) |
| `VK_API_TOKEN` | User OAuth token (`wall`, `photos`) for uploads and wall posts |
| `VK_GROUP_TOKENS` | JSON `{"groupId":"communityKey",...}` — **only** for promo link comments (`from_group: 1`) |

### VK token notes

- Use a **Standalone** VK app and `redirect_uri=https://oauth.vk.com/blank.html`.  
- User tokens are often **bound to the IP** where you authorized → may fail on Netlify with `Code №5`.  
- If so, run tile generation **locally** (`npm run tiles:all`) and keep Netlify for fetch/post only, or use a VPS with a stable IP for the same token.

## Manual runs

```bash
yarn install
cp .env.example .env

# Tiles (not tied to cron minute)
npm run tiles:sign -- aries
npm run tiles:all

npm run vk:group-tokens-template
npm run vk:test-group-token -- 219706249

# Netlify HTTP (after deploy)
# /.netlify/functions/manual-daily-tiles?sign=aries
```

Do not invoke `schedule-post-daily-tile-image` outside minutes `0–11` — it exits early by design.

## Promo

Every post gets a footer; a short link comment is added **from the community** (`from_group: 1`) using `VK_GROUP_TOKENS` — not from your personal account. Texts: `src/post/promoTexts.js`.

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
