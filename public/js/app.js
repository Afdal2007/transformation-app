// ==================== AUTHENTIFICATION ====================
window.addEventListener('load', () => {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  
  if (!userId) {
    window.location.href = 'login.html';
    return;
  }
  
  document.getElementById('username').textContent = `👤 ${username}`;
});

function logout() {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}

// ==================== API ET APP ====================
 const API = 'http://localhost/transformation-app/api';
let chart = null;

const domaines = {
  1: 'Corps Physique & Énergie',
  2: 'Bonheur & Récréation',
  3: 'Développement Personnel',
  4: 'Relations Sociales',
  5: 'Relation Conjugale',
  6: 'Carrière & Profession'
};

async function saveEval() {
  const domaine = document.getElementById('domaine').value;
  const score = document.getElementById('score').value;
  
  if (!domaine) return alert('Choisis un domaine');
  
  await fetch(API + '/evaluations.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domaine_id: domaine,
      score: score,
      date: new Date().toISOString().split('T')[0]
    })
  });
  
  document.getElementById('domaine').value = '';
  document.getElementById('score').value = 3;
  loadData();
}

async function addRituel() {
  const domaine = document.getElementById('rituelDomaine').value;
  const desc = document.getElementById('rituelDesc').value;
  const moment = document.getElementById('rituelMoment').value;
  
  if (!domaine || !desc) return alert('Remplis les champs');
  
  await fetch(API + '/rituels.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domaine_id: domaine,
      description: desc,
      moment: moment,
      date: new Date().toISOString().split('T')[0]
    })
  });
  
  document.getElementById('rituelDesc').value = '';
  loadData();
}

async function toggleRituel(id, completed) {
  await fetch(API + '/rituels.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: id, completed: !completed })
  });
  loadData();
}

let historyChart = null;

function displayHistoryChart(evals) {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  const last30 = evals.filter(e => new Date(e.date_eval) >= thirtyDaysAgo);
  
  const byDate = {};
  last30.forEach(e => {
    if (!byDate[e.date_eval]) byDate[e.date_eval] = [];
    byDate[e.date_eval].push(e.score);
  });
  
  const dates = Object.keys(byDate).sort();
  const averages = dates.map(date => {
    const scores = byDate[date];
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  });
  
  const ctx = document.getElementById('historyChart').getContext('2d');
  if (historyChart) historyChart.destroy();
  
  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates.map(d => new Date(d).toLocaleDateString('fr-FR')),
      datasets: [{
        label: 'Moyenne 30 jours',
        data: averages,
        borderColor: '#764ba2',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#764ba2'
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
async function loadData() {
  const evals = await fetch(API + '/evaluations.php').then(r => r.json());
  const rituels = await fetch(API + '/rituels.php').then(r => r.json());
  
  displayScores(evals);
  displayChart(evals);
  displayHistoryChart(evals);
  displayRituels(rituels);
  displayStats(evals, rituels);
}

function displayScores(evals) {
  const grouped = {};
  const domaineIds = {};
  
  evals.forEach(e => {
    if (!grouped[e.nom]) {
      grouped[e.nom] = [];
      domaineIds[e.nom] = e.domaine_id;
    }
    grouped[e.nom].push(e.score);
  });
  
  const html = Object.entries(grouped).map(([nom, scores]) => {
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    const domaineId = domaineIds[nom];
    return `
      <div class="score-item" style="cursor: pointer;" onclick="goToDetail(${domaineId})">
        <span>${nom}</span>
        <strong>${avg}/5</strong>
      </div>
    `;
  }).join('');
  
  document.getElementById('scores').innerHTML = html;
}

function goToDetail(domaineId) {
  window.location.href = `detail.html?id=${domaineId}`;
}

function displayChart(evals) {
  const grouped = {};
  evals.forEach(e => {
    if (!grouped[e.domaine_id]) {
      grouped[e.domaine_id] = { nom: e.nom, scores: [] };
    }
    grouped[e.domaine_id].scores.push(e.score);
  });
  
  const labels = Object.values(grouped).map(g => g.nom);
  const avg = Object.values(grouped).map(g => 
    (g.scores.reduce((a, b) => a + b, 0) / g.scores.length).toFixed(1)
  );
  
  const ctx = document.getElementById('chart').getContext('2d');
  if (chart) chart.destroy();
  
  chart = new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets: [{ label: 'Score', data: avg, borderColor: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.1)' }] },
    options: { responsive: true, scales: { r: { min: 0, max: 5 } } }
  });
}

function displayRituels(rituels) {
  const today = new Date().toISOString().split('T')[0];
  const todayRituels = rituels.filter(r => r.date_ritual === today);
  
  const grouped = { matin: [], jour: [], soir: [] };
  todayRituels.forEach(r => grouped[r.moment].push(r));
  
  const html = Object.entries(grouped).map(([moment, list]) => `
    <div class="ritual-group">
      <h3>${moment === 'matin' ? '🌅 Matin' : moment === 'jour' ? '☀️ Jour' : '🌙 Soir'}</h3>
      ${list.map(r => `
        <div class="ritual-item ${r.completed ? 'done' : ''}">
          <input type="checkbox" ${r.completed ? 'checked' : ''} onchange="toggleRituel(${r.id}, ${r.completed})">
          <span>${r.description}</span>
        </div>
      `).join('')}
    </div>
  `).join('');
  
  document.getElementById('rituels').innerHTML = html || '<p>Pas de rituels aujourd\'hui</p>';
}

function displayStats(evals, rituels) {
  const totalRituels = rituels.length;
  const completedRituels = rituels.filter(r => r.completed).length;
  const pctCompleted = totalRituels > 0 ? ((completedRituels / totalRituels) * 100).toFixed(0) : 0;
  
  const avgAll = evals.length > 0 ? (evals.reduce((a, b) => a + b.score, 0) / evals.length).toFixed(1) : 0;
  
  const html = `
    <div class="stat-card">
      <p><strong>Rituels complétés :</strong> ${completedRituels}/${totalRituels} (${pctCompleted}%)</p>
      <p><strong>Moyenne générale :</strong> ${avgAll}/5</p>
      <p><strong>Total évaluations :</strong> ${evals.length}</p>
    </div>
  `;
  
  document.getElementById('stats').innerHTML = html;
}

document.getElementById('score').addEventListener('change', e => {
  document.getElementById('scoreVal').textContent = e.target.value;
});

loadData();
