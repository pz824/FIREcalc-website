async function loadMarketData() {
  const res = await fetch('data/market_data.json');
  const data = await res.json();
  const table = document.getElementById('market-table');
  data.indices.forEach(idx => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${idx.name}</td><td>${idx.oneDay}%</td><td>${idx.oneMonth}%</td><td>${idx.ytd}%</td><td>${idx.oneYear}%</td>`;
    table.appendChild(row);
  });
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
        `You can reach FIRE in ${y} years with a portfolio of $${portfolio.toFixed(2)}.`;
      return;
    }
  }

  document.getElementById('results').textContent =
    `After ${years} years, projected portfolio is $${portfolio.toFixed(2)}, ` +
    `but target in inflated dollars is $${target.toFixed(2)}.`;
}

window.onload = function() {
  loadMarketData();
  loadNews();
};
