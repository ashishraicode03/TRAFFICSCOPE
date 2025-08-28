
# TrafficScope — Website Traffic Analyzer (Chrome Extension)

TrafficScope is a lightweight Chrome extension that estimates website traffic, top countries, and top referrers for any domain. It uses a Similarweb‑compatible API available on RapidAPI. When no API key is set, it runs in **Demo Mode** with mock data so reviewers can test the UX instantly.

## How it works
- Open the popup, type a domain (or click **Use current tab**).
- Click **Analyze** to fetch:
  - **Estimated Visits**
  - **Top Countries** (share)
  - **Top Referrers** (share)
- Data comes from your configured RapidAPI provider (e.g., "Similarweb" APIs). If the API call fails or no key is set, mock data is shown (clearly labeled).

## Features
- Manifest V3, background service worker.
- Options page to configure provider:
  - Base URL
  - Endpoints (visits, top countries, top referrers)
  - RapidAPI **Host** and **Key** headers
  - Toggle **Demo Mode**
- Clean UI and resilient fallback to mock data.

## Setup
1. (Optional) Get a RapidAPI key and subscribe to a Similarweb‑compatible API. Example providers on RapidAPI list endpoints for visits, geography/top countries, and referrals/referrers.
2. In Chrome, visit `chrome://extensions` → **Developer mode** → **Load unpacked** → select the `TrafficScope` folder.
3. Open **Options** and paste:
   - **Base URL** (e.g., `https://similarweb12.p.rapidapi.com`)
   - **Host header** (e.g., `similarweb12.p.rapidapi.com`)
   - **Endpoints** (suffixes), for example:
     - `/v1/website/visits?domain=`
     - `/v1/website/top-countries?domain=`
     - `/v1/website/top-referrers?domain=`
   - **RapidAPI Key**.
4. Click **Save**, open the popup, and analyze any domain.

## Notes
- Endpoints differ by provider; use the Options page to adjust. The extension gracefully falls back to mock data if the API is unreachable.
- This project is for educational/demo purposes and is not affiliated with Similarweb.

## Folder structure
```
TrafficScope/
├── assets/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── background.js
├── manifest.json
├── options.html
├── options.js
├── popup.html
├── popup.js
├── styles.css
└── README.md
```
<img width="1920" height="1080" alt="Screenshot (15)" src="https://github.com/user-attachments/assets/9e1b1511-4c92-4ca6-94c2-8e6f79cb5057" />
<img width="1920" height="1080" alt="Screenshot (14)" src="https://github.com/user-attachments/assets/438551fb-8c8f-47d8-bf31-765ad94e731d" />
