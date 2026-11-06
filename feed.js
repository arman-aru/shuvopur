// শুভপুর ফিড: পোস্ট দেখানো, ফিল্টার, প্রতিক্রিয়া, বাম্প ও নতুন পোস্ট।
// ব্যাকএন্ড ছাড়া ডিজাইন প্রিভিউ: দর্শকের কাজ শুধু তাঁর ব্রাউজারে (localStorage) থাকে।
(function () {
  'use strict';

  var STORE_KEY = 'wls-feed-v1';
  var HOUR = 3600 * 1000;
  var BANGLA = '০১২৩৪৫৬৭৮৯';
  var TYPES = {
    problem: { label: 'সমস্যা', cls: 'problem' },
    good: { label: 'ভালো খবর', cls: 'good' },
    change: { label: 'পরিবর্তন হয়েছে', cls: 'change' },
    idea: { label: 'পরামর্শ', cls: 'idea' }
  };
  var STATUS = {
    pending: { label: 'অপেক্ষমাণ', cls: 'pending' },
    working: { label: 'কাজ চলছে', cls: 'working' },
    solved: { label: 'সমাধান হয়েছে', cls: 'solved' }
  };
  var REACTIONS = [
    { key: 'like', label: 'লাইক', pair: 'dislike' },
    { key: 'dislike', label: 'ডিসলাইক', pair: 'like' },
    { key: 'true', label: 'সত্যি', pair: 'false' },
    { key: 'false', label: 'মিথ্যা', pair: 'true' },
    { key: 'agree', label: 'সহমত' },
    { key: 'celebrate', label: 'উদযাপন' }
  ];

  // নমুনা পোস্ট (আসল ঘটনা নয়): ডিজাইন দেখানোর জন্য
  var SAMPLE_POSTS = [
    { id: 's1', type: 'problem', ward: '০৩', hoursAgo: 5, status: 'pending', text: 'জয়চাঁদপুরের প্রধান রাস্তাটি বর্ষায় কাদায় ডুবে থাকে। স্কুলের বাচ্চারা জুতা হাতে নিয়ে যাতায়াত করে।', c: { like: 34, dislike: 1, true: 41, false: 2, agree: 38, celebrate: 0, bump: 57 } },
    { id: 's2', type: 'good', ward: '০৫', hoursAgo: 26, author: 'রাকিব হাসান', text: 'দারোগার হাট বাজারে এলাকার তরুণরা মিলে পরিচ্ছন্নতা অভিযান চালিয়েছে। বাজার এখন অনেক পরিষ্কার।', c: { like: 88, dislike: 0, true: 52, false: 1, agree: 20, celebrate: 64, bump: 21 } },
    { id: 's3', type: 'change', ward: '০৬', hoursAgo: 50, status: 'solved', text: 'চম্পকনগরের ভাঙা কালভার্টটি অবশেষে মেরামত হয়েছে। মানুষের সম্মিলিত দাবির ফল।', c: { like: 70, dislike: 2, true: 45, false: 0, agree: 12, celebrate: 71, bump: 18 } },
    { id: 's4', type: 'problem', ward: '০৭', hoursAgo: 8, status: 'working', text: 'সন্ধ্যার পর বাজারের পেছনে অচেনা লোকের আড্ডা বসে, মাদকের সন্দেহ। অভিভাবকরা চিন্তিত।', c: { like: 25, dislike: 3, true: 29, false: 4, agree: 45, celebrate: 0, bump: 63 } },
    { id: 's5', type: 'idea', ward: '০১', hoursAgo: 30, author: 'সুমাইয়া আক্তার', text: 'প্রতিটি ওয়ার্ডে সপ্তাহে একদিন বিনামূল্যে কম্পিউটার শেখানোর ক্লাস চালু করা যায়। স্কুলের ল্যাব ব্যবহার করা যেতে পারে।', c: { like: 50, dislike: 1, true: 0, false: 0, agree: 40, celebrate: 6, bump: 27 } },
    { id: 's6', type: 'problem', ward: '০৪', hoursAgo: 75, status: 'pending', text: 'বল্লভপুরের খাল ভরাট হয়ে গেছে। একটু বৃষ্টিতেই জমিতে পানি জমে ফসল নষ্ট হয়।', c: { like: 30, dislike: 0, true: 33, false: 1, agree: 29, celebrate: 0, bump: 33 } },
    { id: 's7', type: 'good', ward: '০৯', hoursAgo: 14, author: 'তানভীর আহমেদ', text: 'উত্তর মন্দিয়ার তরুণদের ফুটবল দল উপজেলা টুর্নামেন্টের ফাইনালে উঠেছে! সবাই দোয়া করবেন।', c: { like: 112, dislike: 0, true: 40, false: 0, agree: 8, celebrate: 96, bump: 30 } },
    { id: 's8', type: 'problem', ward: '০২', hoursAgo: 144, status: 'solved', text: 'স্কুলের সামনের রাস্তায় কোনো সড়কবাতি ছিল না। গত সপ্তাহে দুটি বাতি লাগানো হয়েছে।', c: { like: 41, dislike: 0, true: 36, false: 1, agree: 10, celebrate: 35, bump: 12 } },
    { id: 's9', type: 'idea', ward: '০৮', hoursAgo: 96, text: 'বর্ষার আগে খাল পরিষ্কারে প্রতিটি পাড়ায় তরুণ স্বেচ্ছাসেবক দল গঠন করা হোক।', c: { like: 27, dislike: 0, true: 0, false: 0, agree: 31, celebrate: 4, bump: 15 } },
    { id: 's10', type: 'good', ward: '০৫', hoursAgo: 180, text: 'কৈয়ারা দিঘির পাড়ে বৃক্ষরোপণ কর্মসূচিতে ২০০টি চারা লাগানো হয়েছে।', c: { like: 64, dislike: 0, true: 30, false: 0, agree: 5, celebrate: 48, bump: 9 } }
  ];

  var listEl = document.getElementById('feed-list');
  if (!listEl) { return; }

  var view = { type: 'all', ward: 'all', sort: 'new' };
  var state = load();
  var basePosts = SAMPLE_POSTS.map(function (p) {
    return { id: p.id, type: p.type, ward: p.ward, text: p.text, author: p.author || null, status: p.status || null, sample: true, time: Date.now() - p.hoursAgo * HOUR, c: p.c };
  });

  // ---------- সংরক্ষণ ----------
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return { userPosts: Array.isArray(raw.userPosts) ? raw.userPosts : [], mine: raw.mine && typeof raw.mine === 'object' ? raw.mine : {} };
    } catch (e) {
      return { userPosts: [], mine: {} };
    }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* জায়গা না থাকলে শুধু এই সেশনে চলবে */ }
  }

  // ---------- সহায়ক ----------
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BANGLA[d]; }); }
  function bnNum(n) { return bn(Number(n).toLocaleString('en-US')); }

  function timeAgo(t) {
    var mins = Math.max(1, Math.round((Date.now() - t) / 60000));
    if (mins < 60) { return bn(mins) + ' মিনিট আগে'; }
    var hours = Math.round(mins / 60);
    if (hours < 24) { return bn(hours) + ' ঘণ্টা আগে'; }
    return bn(Math.round(hours / 24)) + ' দিন আগে';
  }

  function allPosts() { return state.userPosts.concat(basePosts); }
  function mineOf(id) { return state.mine[id] || []; }
  function count(post, key) { return (post.c[key] || 0) + (mineOf(post.id).indexOf(key) !== -1 ? 1 : 0); }
  function popularity(p) { return count(p, 'like') + count(p, 'agree') + count(p, 'celebrate') + count(p, 'true') - count(p, 'dislike') - count(p, 'false'); }
  function totalReactions(p) { return REACTIONS.reduce(function (sum, r) { return sum + count(p, r.key); }, 0) + count(p, 'bump'); }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  // ---------- প্রতিক্রিয়া ----------
  function toggle(postId, key, pair) {
    var mine = mineOf(postId).slice();
    var at = mine.indexOf(key);
    if (at !== -1) {
      mine.splice(at, 1);
    } else {
      mine.push(key);
      if (pair) { mine = mine.filter(function (k) { return k !== pair; }); }
    }
    state.mine = Object.assign({}, state.mine);
    state.mine[postId] = mine;
    save();
    renderAll();
  }

  // ---------- কার্ড ----------
  function card(post) {
    var type = TYPES[post.type];
    var art = el('article', 'post post--' + type.cls);
    art.id = 'post-' + post.id;

    var head = el('div', 'post__head');
    head.appendChild(el('span', 'post__type post__type--' + type.cls, type.label));
    head.appendChild(el('span', 'post__meta', 'ওয়ার্ড ' + post.ward + ' · ' + timeAgo(post.time)));
    if (post.status && STATUS[post.status]) {
      head.appendChild(el('span', 'post__status post__status--' + STATUS[post.status].cls, STATUS[post.status].label));
    }
    if (post.sample) { head.appendChild(el('span', 'post__sample', 'নমুনা')); }
    art.appendChild(head);

    art.appendChild(el('p', 'post__text', post.text));
    art.appendChild(el('p', 'post__author', post.author ? '— ' + post.author : '— নাম গোপন'));

    var t = count(post, 'true'), f = count(post, 'false');
    if (t + f > 0) {
      var pct = Math.round((t / (t + f)) * 100);
      var meter = el('div', 'truth');
      meter.appendChild(el('span', 'truth__label', 'সত্যতা ' + bn(pct) + '%'));
      var bar = el('span', 'truth__bar');
      var fill = el('i');
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      meter.appendChild(bar);
      meter.appendChild(el('span', 'truth__votes', bnNum(t + f) + ' জনের যাচাই'));
      art.appendChild(meter);
    }

    var actions = el('div', 'post__actions');
    var bumped = mineOf(post.id).indexOf('bump') !== -1;
    var bump = el('button', 'react react--bump' + (bumped ? ' is-on' : ''));
    bump.type = 'button';
    bump.setAttribute('aria-pressed', String(bumped));
    bump.appendChild(el('span', 'react__icon', '▲'));
    bump.appendChild(el('span', 'react__label', 'বাম্প'));
    bump.appendChild(el('b', '', bnNum(count(post, 'bump'))));
    bump.addEventListener('click', function () { toggle(post.id, 'bump'); });
    actions.appendChild(bump);

    REACTIONS.forEach(function (r) {
      var on = mineOf(post.id).indexOf(r.key) !== -1;
      var btn = el('button', 'react react--' + r.key + (on ? ' is-on' : ''));
      btn.type = 'button';
      btn.setAttribute('aria-pressed', String(on));
      btn.appendChild(el('span', 'react__label', r.label));
      btn.appendChild(el('b', '', bnNum(count(post, r.key))));
      btn.addEventListener('click', function () { toggle(post.id, r.key, r.pair); });
      actions.appendChild(btn);
    });
    art.appendChild(actions);
    return art;
  }

  // ---------- রেন্ডার ----------
  function filtered() {
    var posts = allPosts().filter(function (p) {
      return (view.type === 'all' || p.type === view.type) && (view.ward === 'all' || p.ward === view.ward);
    });
    var sorters = {
      new: function (a, b) { return b.time - a.time; },
      bump: function (a, b) { return count(b, 'bump') - count(a, 'bump'); },
      popular: function (a, b) { return popularity(b) - popularity(a); }
    };
    return posts.slice().sort(sorters[view.sort]);
  }

  function renderFeed() {
    var posts = filtered();
    listEl.textContent = '';
    posts.forEach(function (p) { listEl.appendChild(card(p)); });
    document.getElementById('feed-empty').hidden = posts.length > 0;
    document.getElementById('feed-count').textContent = bn(posts.length) + 'টি পোস্ট দেখানো হচ্ছে';
  }

  function renderSide() {
    var posts = allPosts();
    var trend = posts.slice().sort(function (a, b) { return count(b, 'bump') - count(a, 'bump'); }).slice(0, 5);
    var ol = document.getElementById('trend-list');
    ol.textContent = '';
    trend.forEach(function (p) {
      var li = el('li');
      var a = el('a', '', p.text.length > 60 ? p.text.slice(0, 60) + '…' : p.text);
      a.href = '#post-' + p.id;
      a.addEventListener('click', function () { highlight(p.id); });
      li.appendChild(a);
      li.appendChild(el('span', 'trend-list__bump', '▲ ' + bnNum(count(p, 'bump'))));
      ol.appendChild(li);
    });

    var solved = posts.filter(function (p) { return p.status === 'solved'; }).length;
    var good = posts.filter(function (p) { return p.type === 'good' || p.type === 'change'; }).length;
    var reactions = posts.reduce(function (s, p) { return s + totalReactions(p); }, 0);
    document.getElementById('side-solved').textContent = bn(solved);
    document.getElementById('stat-posts').textContent = bnNum(posts.length);
    document.getElementById('stat-good').textContent = bnNum(good);
    document.getElementById('stat-solved').textContent = bnNum(solved);
    document.getElementById('stat-reactions').textContent = bnNum(reactions);
    document.getElementById('stat-top').textContent = trend[0] ? (trend[0].text.slice(0, 48) + '…') : '';
  }

  function renderAll() { renderFeed(); renderSide(); }

  function highlight(id) {
    view = { type: 'all', ward: 'all', sort: view.sort };
    syncControls();
    renderFeed();
    var node = document.getElementById('post-' + id);
    if (node) {
      node.classList.add('is-highlight');
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () { node.classList.remove('is-highlight'); }, 2200);
    }
  }

  // ---------- নিয়ন্ত্রণ ----------
  function syncControls() {
    document.querySelectorAll('.type-tab').forEach(function (b) { b.classList.toggle('is-active', b.dataset.type === view.type); });
    document.querySelectorAll('.sort-tab').forEach(function (b) { b.classList.toggle('is-active', b.dataset.sort === view.sort); });
    document.getElementById('filter-ward').value = view.ward;
  }

  document.querySelectorAll('.type-tab').forEach(function (b) {
    b.addEventListener('click', function () { view.type = b.dataset.type; syncControls(); renderFeed(); });
  });
  document.querySelectorAll('.sort-tab').forEach(function (b) {
    b.addEventListener('click', function () { view.sort = b.dataset.sort; syncControls(); renderFeed(); });
  });
  document.getElementById('filter-ward').addEventListener('change', function (e) { view.ward = e.target.value; renderFeed(); });

  document.querySelectorAll('.ward-item[data-ward]').forEach(function (b) {
    b.addEventListener('click', function () {
      view.ward = b.dataset.ward;
      view.type = 'all';
      syncControls();
      renderFeed();
      document.getElementById('feed').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // ---------- নতুন পোস্ট ----------
  var form = document.getElementById('compose');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var errorEl = document.getElementById('c-error');
    var text = document.getElementById('c-text').value.trim();
    var ward = document.getElementById('c-ward').value;
    var type = (form.querySelector('input[name="c-type"]:checked') || {}).value || 'problem';
    var anon = document.getElementById('c-anon').checked;
    var name = document.getElementById('c-name').value.trim();
    var problem = text.length < 15 ? 'অন্তত এক লাইনে বিস্তারিত লিখুন (১৫ অক্ষরের বেশি)।' : (!ward ? 'অনুগ্রহ করে ওয়ার্ড বেছে নিন।' : '');
    if (problem) { errorEl.textContent = problem; errorEl.hidden = false; return; }
    errorEl.hidden = true;

    var post = {
      id: 'u' + Date.now(), type: type, ward: ward, text: text,
      author: anon || !name ? null : name,
      status: type === 'problem' ? 'pending' : null, sample: false, time: Date.now(),
      c: { like: 0, dislike: 0, true: 0, false: 0, agree: 0, celebrate: 0, bump: 0 }
    };
    state.userPosts = [post].concat(state.userPosts);
    save();
    form.reset();
    view = { type: 'all', ward: 'all', sort: 'new' };
    syncControls();
    renderAll();
    highlight(post.id);
  });

  renderAll();
})();
