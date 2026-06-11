// ─── STATE MANAGEMENT ───
let current = 0;
const TOTAL = 17;
const slides = document.querySelectorAll('.slide');
let walletBal = 500;
let demoRunning = false;
let demoMode = 'payment'; // 'payment' | 'attendance'

// ─── NAV ENGINE ───
function show(n) {
  slides[current].classList.remove('active');
  slides[current].classList.add('exit');
  const prev_idx = current;
  current = n;
  setTimeout(() => slides[prev_idx].classList.remove('exit'), 520);
  slides[current].classList.add('active');
  document.getElementById('progress').style.width = ((current + 1) / TOTAL * 100) + '%';
  document.getElementById('slide-counter').textContent = (current + 1) + ' / ' + TOTAL;

  if (current === 11) resetDemo();           // Live Demo slide (index 11 = slide 12)
  if (current === 3)  startHowItWorks();     // How It Works slide (index 3 = slide 4)
  if (current === 4)  startMarketCountUp();  // Market Opportunity (index 4 = slide 5)
}

function next() { if (current < TOTAL - 1) show(current + 1); }
function prev() { if (current > 0) show(current - 1); }

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// ─── HOW IT WORKS ANIMATION ───
let howAnimRunning = false;
function startHowItWorks() {
  if (howAnimRunning) return;
  howAnimRunning = true;
  const steps = document.querySelectorAll('#howSteps .how-step');
  steps.forEach(s => s.classList.remove('how-step-active', 'how-step-done'));
  steps.forEach((step, i) => {
    setTimeout(() => {
      if (i > 0) steps[i - 1].classList.remove('how-step-active');
      if (i > 0) steps[i - 1].classList.add('how-step-done');
      step.classList.add('how-step-active');
      if (i === steps.length - 1) {
        setTimeout(() => { step.classList.add('how-step-done'); howAnimRunning = false; }, 700);
      }
    }, i * 600);
  });
}

function replayHowItWorks() {
  howAnimRunning = false;
  const steps = document.querySelectorAll('#howSteps .how-step');
  steps.forEach(s => s.classList.remove('how-step-active', 'how-step-done'));
  setTimeout(startHowItWorks, 100);
}

// ─── MARKET COUNT-UP ───
let marketDone = false;
function startMarketCountUp() {
  if (marketDone) return;
  marketDone = true;
  countUp('mc1', 0, 35000, 1200, v => v >= 1000 ? (v/1000).toFixed(0)+'K+' : v+'');
  countUp('mc2', 0, 12, 1400, v => v + 'M+');
  countUp('mc3', 0, 2.3, 1300, v => 'KES ' + v.toFixed(1) + 'B+');

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.market-bar-fill').forEach(el => {
      el.style.width = el.style.getPropertyValue('--bar-w') || el.getAttribute('style').match(/--bar-w:([^;]+)/)?.[1] || '0%';
    });
  }, 300);
}

function countUp(id, from, to, duration, fmt) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function frame(now) {
    const pct = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    const val = from + (to - from) * eased;
    el.textContent = fmt(val);
    if (pct < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ─── DEMO MODE TOGGLE ───
function setDemoMode(mode) {
  demoMode = mode;
  resetDemo();
  const payBtn = document.getElementById('modePayBtn');
  const attBtn = document.getElementById('modeAttBtn');
  if (mode === 'payment') {
    payBtn.classList.add('active-mode-pay');
    payBtn.classList.remove('active-mode-att');
    attBtn.classList.remove('active-mode-pay', 'active-mode-att');
    document.getElementById('demo-tagline').style.background = 'var(--blue-50)';
    document.getElementById('demo-tagline').style.color = 'var(--blue-600)';
    document.getElementById('tapBtn').style.background = 'linear-gradient(135deg,var(--blue-700),var(--blue-500))';
  } else {
    attBtn.classList.add('active-mode-att');
    attBtn.classList.remove('active-mode-pay');
    payBtn.classList.remove('active-mode-pay', 'active-mode-att');
    document.getElementById('demo-tagline').style.background = '#f0fdf4';
    document.getElementById('demo-tagline').style.color = '#16a34a';
    document.getElementById('tapBtn').style.background = 'linear-gradient(135deg,#15803d,#22c55e)';
  }
}

// ─── NFC BEEP (Web Audio API) ───
function playNfcBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}

// ─── DEMO ENGINE ───
const demoModes = {
  payment: [
    { icon: 'fa-satellite-dish', color: 'var(--blue-500)', text: 'Card Detected & Verified' },
    { icon: 'fa-receipt', color: '#22c55e', text: 'Transaction Logged — KES 50 deducted' },
    { icon: 'fa-wallet', color: '#22c55e', text: 'Wallet Balance Updated in Real-time' },
    { icon: 'fa-circle-check', color: '#22c55e', text: 'Payment Complete — Receipt Sent to Parent' },
  ],
  attendance: [
    { icon: 'fa-satellite-dish', color: '#16a34a', text: 'Card Scanned at Gate Reader' },
    { icon: 'fa-id-card', color: '#16a34a', text: 'Student ID Matched — Karani, Brian M.' },
    { icon: 'fa-calendar-check', color: '#16a34a', text: 'Attendance Logged — ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) },
    { icon: 'fa-bell', color: '#16a34a', text: 'Parent Notified: Brian arrived at school ✓' },
  ]
};

function buildDemoSteps() {
  const results = document.getElementById('demoResults');
  // Remove old steps but keep tagline
  results.querySelectorAll('.demo-step').forEach(s => s.remove());
  const tagline = document.getElementById('demo-tagline');
  const steps = demoModes[demoMode];
  steps.forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'demo-step';
    div.id = 'ds' + (i + 1);
    div.innerHTML = `<i class="fa-solid ${s.icon}" style="color:${s.color}"></i> ${s.text}`;
    results.insertBefore(div, tagline);
  });
}

function resetDemo() {
  demoRunning = false;
  buildDemoSteps();
  ['ds1','ds2','ds3','ds4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('show');
  });
  const btn = document.getElementById('tapBtn');
  if (btn) btn.classList.remove('pulsing');
  const hint = document.getElementById('demo-hint');
  if (hint) hint.textContent = 'Click to simulate an NFC tap';
}

function runDemo() {
  if (demoRunning) return;
  demoRunning = true;
  playNfcBeep();
  const btn = document.getElementById('tapBtn');
  btn.classList.add('pulsing');
  document.getElementById('demo-hint').textContent = demoMode === 'payment' ? 'Processing payment…' : 'Scanning student card…';
  const steps = ['ds1','ds2','ds3','ds4'];
  steps.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.classList.add('show');
      if (i === steps.length - 1) {
        btn.classList.remove('pulsing');
        document.getElementById('demo-hint').textContent = 'Tap again to run another scan';
        demoRunning = false;
      }
    }, 400 + i * 500);
  });
}

// ─── SIMULATION: STUDENT DIGITAL WALLET ───
function buyItem(name, amount, emoji) {
  if (walletBal < amount) {
    document.getElementById('wallet-feedback').textContent = '❌ Insufficient balance!';
    setTimeout(() => document.getElementById('wallet-feedback').textContent = '', 2000);
    return;
  }
  walletBal -= amount;
  document.getElementById('wallet-num').textContent = walletBal;
  document.getElementById('wallet-feedback').textContent = `✅ ${name} purchased successfully!`;
  addTx(emoji, name, '-KES ' + amount, false);
  setTimeout(() => document.getElementById('wallet-feedback').textContent = '', 2000);
}

function topUp() {
  walletBal += 200;
  document.getElementById('wallet-num').textContent = walletBal;
  document.getElementById('wallet-feedback').textContent = '💳 Top up successful!';
  addTx('💳', 'Top Up', '+KES 200', true);
  setTimeout(() => document.getElementById('wallet-feedback').textContent = '', 2000);
}

function addTx(icon, name, amt, isPos) {
  const list = document.getElementById('wallet-tx-list');
  const div = document.createElement('div');
  div.className = 'tx-item';
  div.style.opacity = '0';
  div.style.transition = 'opacity .4s';
  div.innerHTML = `<div class="tx-icon">${icon}</div><div class="tx-info"><strong>${name}</strong><span>Just now</span></div><div class="tx-amt ${isPos?'pos':'neg'}">${amt}</div>`;
  list.prepend(div);
  setTimeout(() => div.style.opacity = '1', 50);
  while (list.children.length > 4) list.removeChild(list.lastChild);
}

// ─── MODAL CONTROLLERS ───
function openDash() { document.getElementById('modal').classList.add('open'); }
function closeDash() { document.getElementById('modal').classList.remove('open'); }
function openParentDash() { document.getElementById('parentModal').classList.add('open'); }
function closeParentDash() { document.getElementById('parentModal').classList.remove('open'); }
function openLibDash() { document.getElementById('libraryModal').classList.add('open'); }
function closeLibDash() { document.getElementById('libraryModal').classList.remove('open'); }
function openSportsDash() { document.getElementById('sportsModal').classList.add('open'); }
function closeSportsDash() { document.getElementById('sportsModal').classList.remove('open'); }
function updateLimitValue(val) { document.getElementById('limitValDisplay').textContent = 'KES ' + val + '.00'; }

window.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) e.target.classList.remove('open');
});

// Init demo steps on page load
buildDemoSteps();
