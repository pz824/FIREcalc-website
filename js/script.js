const API_KEY = 'd1p84j1r01qu436d58rgd1p84j1r01qu436d58s0';

async function fetchQuote(symbol) {
  const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
  if (!res.ok) {
    throw new Error('Quote request failed');
  }
  return res.json();
}

async function loadMarketData() {
  const indices = [
    { name: 'S&P 500', symbol: 'SPY' },
    { name: 'Dow Jones', symbol: 'DIA' },
    { name: 'NASDAQ', symbol: 'QQQ' }
  ];
  const table = document.getElementById('market-table');
  table.innerHTML = '';
  for (const idx of indices) {
    try {
      const quote = await fetchQuote(idx.symbol);
      const row = document.createElement('tr');
      row.innerHTML = `<td>${idx.name}</td><td>${formatUSD(quote.c)}</td><td>${quote.dp.toFixed(2)}%</td>`;
      table.appendChild(row);
    } catch (e) {
      console.error(e);
    }
  }
}

async function loadNews() {
  const res = await fetch('data/news.json');
  const data = await res.json();
  const list = document.getElementById('news-list');
  data.articles.forEach(article => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = article.url;
    a.textContent = article.title;
    li.appendChild(a);
    list.appendChild(li);
  });
}

function formatUSD(value) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });
}

function calculateFIRE() {
  const netWorth = parseFloat(document.getElementById('net-worth').value) || 0;
  const growth = parseFloat(document.getElementById('growth').value) / 100 || 0;
  const swr = parseFloat(document.getElementById('swr').value) / 100 || 0.04;
  const inflation = parseFloat(document.getElementById('inflation').value) / 100 || 0.03;
  const contrib = parseFloat(document.getElementById('contrib').value) || 0;
  const years = parseInt(document.getElementById('years').value, 10) || 30;
  const spending = parseFloat(document.getElementById('spending').value) || 40000;

  let portfolio = netWorth;
  let target = spending / swr;

  for (let y = 1; y <= years; y++) {
    portfolio = portfolio * (1 + growth) + contrib * 12;
    target = target * (1 + inflation);
    if (portfolio >= target) {
      document.getElementById('results').textContent =
        `You can reach FIRE in ${y} years with a portfolio of ${formatUSD(portfolio)}.`;
      return;
    }
  }

  document.getElementById('results').textContent =
    `After ${years} years, projected portfolio is ${formatUSD(portfolio)}, ` +
    `but target in inflated dollars is ${formatUSD(target)}.`;
}

window.onload = function() {
  loadMarketData();
  loadNews();
  renderWatchlist();
};

async function searchTicker() {
  const input = document.getElementById('ticker-input');
  const symbol = input.value.trim().toUpperCase();
  const resultDiv = document.getElementById('search-result');
  if (!symbol) {
    resultDiv.textContent = 'Please enter a ticker symbol';
    return;
  }
  try {
    const quote = await fetchQuote(symbol);
    resultDiv.innerHTML = `${symbol}: ${formatUSD(quote.c)} (${quote.dp.toFixed(2)}%) ` +
      `<button class="btn btn-sm btn-primary ms-2" onclick="addToWatchlist('${symbol}')">Add to Watchlist</button>`;
  } catch (e) {
    resultDiv.textContent = 'Ticker not found';
  }
}

function getWatchlist() {
  return JSON.parse(localStorage.getItem('watchlist') || '[]');
}

function saveWatchlist(list) {
  localStorage.setItem('watchlist', JSON.stringify(list));
}

function addToWatchlist(symbol) {
  const list = getWatchlist();
  if (!list.includes(symbol)) {
    list.push(symbol);
    saveWatchlist(list);
    renderWatchlist();
  }
}

function removeFromWatchlist(symbol) {
  const list = getWatchlist().filter(s => s !== symbol);
  saveWatchlist(list);
  renderWatchlist();
}

async function renderWatchlist() {
  const table = document.getElementById('watchlist-table');
  if (!table) return;
  table.innerHTML = '';
  const list = getWatchlist();
  for (const symbol of list) {
    try {
      const quote = await fetchQuote(symbol);
      const row = document.createElement('tr');
      row.innerHTML = `<td>${symbol}</td><td>${formatUSD(quote.c)}</td>` +
        `<td>${quote.dp.toFixed(2)}%</td>` +
        `<td><button class="btn btn-sm btn-danger" onclick="removeFromWatchlist('${symbol}')">Remove</button></td>`;
      table.appendChild(row);
    } catch (e) {
      console.error(e);
    }
  }
}
