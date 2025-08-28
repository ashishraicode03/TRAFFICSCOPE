
// TrafficScope background service worker (Manifest V3)
const DEFAULT_PROVIDER = {
  name: "RapidAPI Similarweb",
  baseUrl: "https://similarweb12.p.rapidapi.com", // example provider on RapidAPI
  // Endpoints vary per provider. We keep them customizable and documented.
  endpoints: {
    visits: "/v1/website/visits?domain=",          // ?domain=example.com
    geography: "/v1/website/top-countries?domain=",// ?domain=example.com
    referrals: "/v1/website/top-referrers?domain=" // ?domain=example.com
  },
  headers: {
    "X-RapidAPI-Key": "__REPLACE__",
    "X-RapidAPI-Host": "similarweb12.p.rapidapi.com"
  },
};

// Demo/mock data used when no API key is set or a request fails.
const MOCK = {
  visits: { domain: "example.com", month: "2025-07", visits: 1234567 },
  geography: {
    domain: "example.com",
    topCountries: [
      { country: "US", share: 0.36 },
      { country: "IN", share: 0.22 },
      { country: "GB", share: 0.08 },
      { country: "DE", share: 0.06 },
      { country: "CA", share: 0.04 },
    ]
  },
  referrals: {
    domain: "example.com",
    topReferrers: [
      { domain: "google.com", share: 0.44 },
      { domain: "github.com", share: 0.12 },
      { domain: "stackoverflow.com", share: 0.07 },
      { domain: "linkedin.com", share: 0.05 },
      { domain: "bing.com", share: 0.03 },
    ]
  }
};

chrome.runtime.onInstalled.addListener(async () => {
  // Initialize storage with defaults if empty
  const { provider, useMock } = await chrome.storage.sync.get(["provider", "useMock"]);
  if (!provider) {
    await chrome.storage.sync.set({ provider: DEFAULT_PROVIDER });
  }
  if (useMock === undefined) {
    await chrome.storage.sync.set({ useMock: true });
  }
});

// Central fetch helper
async function fetchJSON(url, headers, useMock, mockDataKey) {
  try {
    if (useMock) {
      // Simulate small delay for nicer UX in popup
      await new Promise(res => setTimeout(res, 300));
      return { ok: true, data: MOCK[mockDataKey], source: "mock" };
    }
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data, source: "api" };
  } catch (err) {
    console.warn("TrafficScope API error:", err.message);
    // Fall back to mock on error
    return { ok: false, data: MOCK[mockDataKey], source: "fallback-mock", error: err.message };
  }
}

// Handle requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "ANALYZE_DOMAIN") {
      const domain = (message.domain || "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0];
      const { provider, useMock } = await chrome.storage.sync.get(["provider", "useMock"]);
      const p = provider || DEFAULT_PROVIDER;
      const headers = Object.fromEntries(Object.entries(p.headers || {}).map(([k, v]) => [k, v.replace("__REPLACE__", (p.apiKey || ""))]));

      // build URLs
      const urls = {
        visits: `${p.baseUrl}${p.endpoints.visits}${encodeURIComponent(domain)}`,
        geography: `${p.baseUrl}${p.endpoints.geography}${encodeURIComponent(domain)}`,
        referrals: `${p.baseUrl}${p.endpoints.referrals}${encodeURIComponent(domain)}`
      };

      const [visits, geography, referrals] = await Promise.all([
        fetchJSON(urls.visits, headers, useMock || !headers["X-RapidAPI-Key"], "visits"),
        fetchJSON(urls.geography, headers, useMock || !headers["X-RapidAPI-Key"], "geography"),
        fetchJSON(urls.referrals, headers, useMock || !headers["X-RapidAPI-Key"], "referrals"),
      ]);

      sendResponse({ domain, visits, geography, referrals });
    }
  })();
  return true; // keep message channel open for async
});
