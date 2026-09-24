// ==================== AUTHENTIFICATION ====================
window.addEventListener('load', () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (!userId) {
    window.location.href = 'login.html';
    return;
  }
  
  document.getElementById('username').textContent = `👤 ${username}`;
  loadDetail();
});

function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

function goBack() {
  window.location.href = 'index.html';
}

// ==================== API ====================
const API = 'http://localhost/transformation-app/api';
const domaines = {
  1: 'Santé', 2: 'Finances', 3: 'Travail', 4: 'Relations',
  5: 'Croissance', 6: 'Loisirs', 7: 'Spirituel', 8: 'Environnement'
};

// ==================== DÉTAILS ====================
async function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const domaineId = params.get('id');
  
  if (!domaineId) {
    window.location.href = 'index.html';
    return;
  }
  
  document.getElementById('domaineName').textContent = domaines[domaineId];
  
  const evals = await fetch(API + '/evaluations.php').then(r => r.json());
  const rituels = await fetch(API + '/rituels.php').then(r => r.json());
  
  const domaineEvals = evals.filter(e => e.domaine_id == domaineId);
  const domaineRituels = rituels.filter(r => r.domaine_id == domaineId);
  
  displayChart(domaineEvals);
  displayStats(domaineEvals, domaineRituels);
  displayRituels(domaineRituels);
  displayHistory(domaineEvals);
}

function displayChart(evals) {
  if (evals.length === 0) {
    document.getElementById('detailChart').style.display = 'none';
    return;
  }
  
  const dates = evals.map(e => new Date(e.date_eval).toLocaleDateString('fr-FR')).reverse();
  const scores = evals.map(e => e.score).reverse();
  
  const ctx = document.getElementById('detailChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Score',
        data: scores,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#667eea'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { min: 0, max: 5 }
      }
    }
  });
}

function displayStats(evals, rituels) {
  if (evals.length === 0) {
    document.getElementById('detailStats').innerHTML = '<p>Pas encore d\'évaluations</p>';
    return;
  }
  
  const avg = (evals.reduce((a, b) => a + b.score, 0) / evals.length).toFixed(1);
  const max = Math.max(...evals.map(e => e.score));
  const min = Math.min(...evals.map(e => e.score));
  const completed = rituels.filter(r => r.completed).length;
  const total = rituels.length;
  const pct = total > 0 ? ((completed / total) * 100).toFixed(0) : 0;
  
  const html = `
    <div class="stat-card">
      <p><strong>Moyenne :</strong> <span>${avg}/5</span></p>
      <p><strong>Max :</strong> <span>${max}/5</span></p>
      <p><strong>Min :</strong> <span>${min}/5</span></p>
      <p><strong>Rituels complétés :</strong> <span>${completed}/${total} (${pct}%)</span></p>
    </div>
  `;
  
  document.getElementById('detailStats').innerHTML = html;
}

function displayRituels(rituels) {
  if (rituels.length === 0) {
    document.getElementById('detailRituels').innerHTML = '<p>Pas de rituels pour ce domaine</p>';
    return;
  }
  
  const grouped = { matin: [], jour: [], soir: [] };
  rituels.forEach(r => grouped[r.moment].push(r));
  
  const html = Object.entries(grouped).map(([moment, list]) => {
    if (list.length === 0) return '';
    return `
      <div class="ritual-group">
        <h3>${moment === 'matin' ? '🌅 Matin' : moment === 'jour' ? '☀️ Jour' : '🌙 Soir'}</h3>
        ${list.map(r => `
          <div class="ritual-item ${r.completed ? 'done' : ''}">
            <span>${r.description}</span>
            <span>${r.completed ? '✅' : '⏳'}</span>
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
  
  document.getElementById('detailRituels').innerHTML = html;
}

function displayHistory(evals) {
  if (evals.length === 0) {
    document.getElementById('detailHistory').innerHTML = '<p>Pas d\'historique</p>';
    return;
  }
  
  const html = evals.map(e => `
    <div class="history-item">
      <span>${new Date(e.date_eval).toLocaleDateString('fr-FR')}</span>
      <strong>${e.score}/5</strong>
    </div>
  `).reverse().join('');
  
  document.getElementById('detailHistory').innerHTML = html;
}