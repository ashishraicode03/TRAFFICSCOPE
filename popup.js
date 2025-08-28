
function qs(id){return document.getElementById(id);}
function percent(p){return (p*100).toFixed(1)+'%';}
function formatNumber(n){
  try{ return new Intl.NumberFormat().format(Number(n)); }catch{ return String(n); }
}

async function getActiveTabDomain(){
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  if (!tab || !tab.url) return "";
  try{
    const u = new URL(tab.url);
    return u.hostname.replace(/^www\./i, "");
  }catch{ return ""; }
}

async function analyze(domain){
  qs('results').classList.remove('hidden');
  qs('status').textContent = 'Loading...';
  qs('visits').textContent = '';
  qs('countries').innerHTML = '';
  qs('referrers').innerHTML = '';

  const res = await chrome.runtime.sendMessage({ type: 'ANALYZE_DOMAIN', domain });
  const { visits, geography, referrals } = res;

  const badge = (x) => `<span class="badge ${x.source}">${x.source}</span>`;

  if (visits?.data){
    const v = visits.data;
    const display = v.visits || v.totalVisits || v.value || 0;
    qs('visits').innerHTML = `<div class="big">${formatNumber(display)}</div>${badge(visits)}`;
  }

  if (geography?.data){
    const list = geography.data.topCountries || geography.data.countries || geography.data;
    (list || []).slice(0,5).forEach(c => {
      const code = c.country || c.code || '?';
      const share = c.share ?? c.percent ?? 0;
      const li = document.createElement('li');
      li.innerHTML = `<span class="code">${code}</span><span class="fill"><span class="bar" style="width:${Math.min(100, Math.round((share*100)||share))}%"></span></span><span class="val">${percent(share)}</span>`;
      qs('countries').appendChild(li);
    });
    qs('countries').insertAdjacentHTML('beforeend', badge(geography));
  }

  if (referrals?.data){
    const list = referrals.data.topReferrers || referrals.data.referrers || referrals.data;
    (list || []).slice(0,5).forEach(r => {
      const d = r.domain || r.source || '?';
      const s = r.share ?? r.percent ?? 0;
      const li = document.createElement('li');
      li.innerHTML = `<span class="domain">${d}</span><span class="val">${percent(s)}</span>`;
      qs('referrers').appendChild(li);
    });
    qs('referrers').insertAdjacentHTML('beforeend', badge(referrals));
  }

  qs('status').textContent = `Domain: ${res.domain}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const current = await getActiveTabDomain();
  if (current) qs('domainInput').value = current;

  qs('gotoPage').addEventListener('click', async (e) => {
    e.preventDefault();
    const d = await getActiveTabDomain();
    if (d) { qs('domainInput').value = d; analyze(d); }
  });

  qs('analyzeBtn').addEventListener('click', () => {
    const d = qs('domainInput').value.trim();
    if (d) analyze(d);
  });

  qs('openOptions').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
