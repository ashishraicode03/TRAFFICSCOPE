
const $ = (id) => document.getElementById(id);

async function load(){
  const { provider, useMock } = await chrome.storage.sync.get(["provider", "useMock"]);
  const p = provider || {};
  $("baseUrl").value = p.baseUrl || "https://similarweb12.p.rapidapi.com";
  $("hostHeader").value = (p.headers && p.headers["X-RapidAPI-Host"]) || "similarweb12.p.rapidapi.com";
  $("epVisits").value = (p.endpoints && p.endpoints.visits) || "/v1/website/visits?domain=";
  $("epGeo").value = (p.endpoints && p.endpoints.geography) || "/v1/website/top-countries?domain=";
  $("epRef").value = (p.endpoints && p.endpoints.referrals) || "/v1/website/top-referrers?domain=";
  $("apiKey").value = p.apiKey || "";
  $("useMock").checked = !!useMock;
}

async function save(){
  const provider = {
    name: "RapidAPI Similarweb",
    baseUrl: $("baseUrl").value.trim(),
    endpoints: {
      visits: $("epVisits").value.trim(),
      geography: $("epGeo").value.trim(),
      referrals: $("epRef").value.trim(),
    },
    headers: {
      "X-RapidAPI-Key": "__REPLACE__", // replaced at runtime
      "X-RapidAPI-Host": $("hostHeader").value.trim()
    },
    apiKey: $("apiKey").value.trim()
  };
  await chrome.storage.sync.set({ provider, useMock: $("useMock").checked });
  alert("Saved!");
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  $("saveBtn").addEventListener("click", save);
});
