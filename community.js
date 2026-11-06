// তরুণদের "মাদককে না" অঙ্গীকার ও "স্মার্ট শুভপুর" অগ্রাধিকার ভোট।
// ডিজাইন প্রিভিউ: শুরুর সংখ্যাগুলো নমুনা, দর্শকের নিজের ভোট শুধু তাঁর ব্রাউজারে থাকে।
(function () {
  'use strict';

  var BANGLA = '০১২৩৪৫৬৭৮৯';
  var PLEDGE_KEY = 'wls-pledge-v1';
  var POLL_KEY = 'wls-poll-v1';
  var PLEDGE_BASE = 237;
  var PLEDGE_GOAL = 1000;
  var POLL_BASE = { roads: 142, drugs: 188, jobs: 131, digital: 64, health: 77, clean: 58 };

  function bn(n) { return String(Number(n).toLocaleString('en-US')).replace(/\d/g, function (d) { return BANGLA[d]; }); }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* শুধু এই সেশনে */ } }

  // ---------- অঙ্গীকার ----------
  var pledged = read(PLEDGE_KEY) === '1';
  var pledgeBtn = document.getElementById('pledge-btn');

  function renderPledge() {
    var total = PLEDGE_BASE + (pledged ? 1 : 0);
    document.getElementById('pledge-count').textContent = bn(total);
    document.getElementById('pledge-goal').textContent = bn(PLEDGE_GOAL);
    document.getElementById('pledge-bar').style.width = Math.min(100, (total / PLEDGE_GOAL) * 100) + '%';
    var side = document.getElementById('side-pledge');
    if (side) { side.textContent = bn(total); }
    pledgeBtn.disabled = pledged;
    pledgeBtn.textContent = pledged ? 'আপনি অঙ্গীকার করেছেন ✓' : 'আমি অঙ্গীকার করছি';
    document.getElementById('pledge-done').hidden = !pledged;
  }

  if (pledgeBtn) {
    pledgeBtn.addEventListener('click', function () {
      pledged = true;
      write(PLEDGE_KEY, '1');
      renderPledge();
    });
    renderPledge();
  }

  // ---------- অগ্রাধিকার ভোট ----------
  var poll = document.getElementById('poll');
  if (!poll) { return; }
  var choice = read(POLL_KEY);

  function renderPoll() {
    var counts = Object.assign({}, POLL_BASE);
    if (choice && counts[choice] !== undefined) { counts[choice] += 1; }
    var total = Object.keys(counts).reduce(function (s, k) { return s + counts[k]; }, 0);
    var max = Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; }));
    poll.classList.toggle('is-voted', Boolean(choice));
    poll.querySelectorAll('.poll__opt').forEach(function (btn) {
      var key = btn.dataset.key;
      var pct = Math.round((counts[key] / total) * 100);
      btn.classList.toggle('is-chosen', key === choice);
      btn.classList.toggle('is-leading', Boolean(choice) && counts[key] === max);
      btn.setAttribute('aria-pressed', String(key === choice));
      btn.querySelector('.poll__bar i').style.width = choice ? pct + '%' : '0';
      btn.querySelector('.poll__pct').textContent = choice ? bn(pct) + '%' : '';
    });
    document.getElementById('poll-total').textContent = choice ? 'মোট ' + bn(total) + ' ভোট (নমুনা ভোটসহ)' : '';
    document.getElementById('poll-note').textContent = choice ? 'ধন্যবাদ! আপনার ভোট গোনা হয়েছে। চাইলে অন্যটিতে বদলাতে পারেন।' : 'ভোট দিলে সবার ফলাফল দেখতে পাবেন।';
  }

  poll.querySelectorAll('.poll__opt').forEach(function (btn) {
    btn.addEventListener('click', function () {
      choice = btn.dataset.key;
      write(POLL_KEY, choice);
      renderPoll();
    });
  });
  renderPoll();
})();
