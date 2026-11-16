(function () {
  'use strict';

  var SPOTLIGHT_MS = 5000;
  var FETCH_ERROR = 'The collection could not be loaded from items.json. Opening this page as a file (file://) blocks that fetch. From the project folder, run python3 -m http.server and open the local URL it prints.';

  function money(value) {
    var amount = Number(value);
    if (!Number.isFinite(amount)) return '—';
    var negative = amount < 0;
    var cents = Math.round(Math.abs(amount) * 100);
    var whole = Math.floor(cents / 100);
    var frac = cents % 100;
    var body = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (frac) body += '.' + String(frac).padStart(2, '0');
    return (negative ? '−' : '') + '$' + body;
  }

  function signedMoney(value) {
    var amount = Number(value);
    if (!Number.isFinite(amount)) return '—';
    if (amount > 0) return '+' + money(amount);
    if (amount < 0) return '−' + money(Math.abs(amount));
    return money(0);
  }

  function categoryLabel(value) {
    var text = String(value || 'piece');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function finePointer() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  function motionOk() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function figureFor(item, showBadge) {
    var figure = document.createElement('figure');
    var img = document.createElement('img');
    if (item.image) img.src = item.image;
    img.alt = 'Sample illustration for ' + (item.title || 'a collection piece');
    img.width = 640;
    img.height = 400;
    figure.appendChild(img);
    if (showBadge) figure.appendChild(el('p', 'badge', 'Hall of Fame'));
    return figure;
  }

  function coaBlock(item) {
    var block = el('p', 'coa');
    block.appendChild(el('span', 'coa-label', 'Certificate of authenticity'));
    block.appendChild(el('span', 'coa-auth', item.coaAuthority || 'Unknown authority'));
    block.appendChild(el('span', 'cert', item.coaCert || 'No certificate number'));
    return block;
  }

  function valuePair(label, value, className) {
    var wrap = document.createElement('div');
    wrap.appendChild(el('dt', '', label));
    wrap.appendChild(el('dd', className, value));
    return wrap;
  }

  function moneyList(item) {
    var paid = Number(item.purchasePrice);
    var current = Number(item.estimatedValue);
    var list = el('dl', 'values');
    var changeLabel = 'Change';
    var changeText = '—';
    var changeClass = '';
    if (Number.isFinite(paid) && Number.isFinite(current)) {
      var gain = current - paid;
      if (gain > 0) {
        changeLabel = 'Gain';
        changeClass = 'gain';
      } else if (gain < 0) {
        changeLabel = 'Loss';
        changeClass = 'loss';
      }
      changeText = signedMoney(gain);
    }
    list.appendChild(valuePair('Paid', money(paid), ''));
    list.appendChild(valuePair('Now', money(current), ''));
    list.appendChild(valuePair(changeLabel, changeText, changeClass));
    return list;
  }

  function copyBlock(item, heading, markSpotlight) {
    var copy = el('div', 'card-copy');
    var meta = el('p', 'meta', categoryLabel(item.category) + ' · Signed ' + (item.yearSigned != null ? item.yearSigned : '—'));
    var title = el(heading, '', item.title || 'Untitled piece');
    if (markSpotlight) title.id = 'spotlight-title';
    var signer = el('p', 'signer', item.signer || 'Unknown signer');
    var desc = el('p', 'desc', item.description || '');
    copy.appendChild(meta);
    copy.appendChild(title);
    copy.appendChild(signer);
    copy.appendChild(desc);
    copy.appendChild(coaBlock(item));
    copy.appendChild(moneyList(item));
    return copy;
  }

  function bindTilt(card) {
    var glare = card.querySelector('.glare');
    if (!glare || card.dataset.tiltBound === 'true') return;
    card.dataset.tiltBound = 'true';

    card.addEventListener('pointermove', function (event) {
      if (!finePointer() || !motionOk() || event.pointerType === 'touch') return;
      var rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = (event.clientX - rect.left) / rect.width;
      var py = (event.clientY - rect.top) / rect.height;
      var rotY = (px - 0.5) * 14;
      var rotX = (0.5 - py) * 12;
      card.style.transition = 'none';
      card.style.transform = 'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      glare.style.opacity = '1';
      glare.style.background = 'radial-gradient(circle at ' + (px * 100) + '% ' + (py * 100) + '%, rgba(255,255,255,0.42), rgba(255,184,28,0.16) 26%, transparent 58%)';
    });

    function reset() {
      card.style.transition = '';
      card.style.transform = '';
      glare.style.opacity = '0';
    }

    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
  }

  function renderStats(items) {
    var paid = 0;
    var current = 0;
    var counts = new Map();
    var best = null;

    items.forEach(function (item) {
      var paidN = Number(item.purchasePrice);
      var valueN = Number(item.estimatedValue);
      var name = item.signer || 'Unknown signer';
      counts.set(name, (counts.get(name) || 0) + 1);
      if (!Number.isFinite(paidN) || !Number.isFinite(valueN)) return;
      paid += paidN;
      current += valueN;
      if (paidN > 0) {
        var ratio = valueN / paidN;
        var gain = valueN - paidN;
        if (!best || ratio > best.ratio || (ratio === best.ratio && gain > best.gain)) {
          best = { item: item, ratio: ratio, gain: gain };
        }
      }
    });

    var gain = current - paid;
    document.getElementById('stat-paid').textContent = money(paid);
    document.getElementById('stat-value').textContent = money(current);
    var gainEl = document.getElementById('stat-gain');
    gainEl.textContent = signedMoney(gain);
    gainEl.classList.toggle('gain', gain > 0);
    gainEl.classList.toggle('loss', gain < 0);
    document.getElementById('stat-gain-label').textContent = gain < 0 ? 'Overall loss' : 'Overall gain';

    var rows = Array.from(counts.entries()).sort(function (a, b) {
      return b[1] - a[1] || a[0].localeCompare(b[0], 'en');
    });
    var tbody = document.getElementById('player-counts');
    tbody.replaceChildren();
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = row[0];
      tr.appendChild(th);
      tr.appendChild(el('td', '', String(row[1])));
      tbody.appendChild(tr);
    });

    var bestText = document.getElementById('stat-best');
    if (!best) {
      bestText.textContent = 'No priced pieces to compare.';
      return;
    }
    bestText.textContent = best.item.title + ', signed by ' + best.item.signer + ', is valued at ' + best.ratio.toFixed(2) + '× what was paid (' + money(best.item.purchasePrice) + ' to ' + money(best.item.estimatedValue) + ').';
  }

  function renderCards(items) {
    var list = document.getElementById('card-grid');
    var fragment = document.createDocumentFragment();
    items.forEach(function (item) {
      var slot = el('li', 'card-slot');
      var article = el('article', 'tilt');
      if (item.id) article.dataset.id = item.id;
      var glare = el('div', 'glare');
      glare.setAttribute('aria-hidden', 'true');
      var body = el('div', 'card-body');
      body.appendChild(figureFor(item, item.featured === true));
      body.appendChild(copyBlock(item, 'h3'));
      article.appendChild(glare);
      article.appendChild(body);
      bindTilt(article);
      slot.appendChild(article);
      fragment.appendChild(slot);
    });
    list.replaceChildren(fragment);
    document.getElementById('collection-count').textContent = items.length + (items.length === 1 ? ' piece' : ' pieces');
  }

  function showFailure(message) {
    document.getElementById('loading').hidden = true;
    var error = document.getElementById('load-error');
    error.hidden = false;
    error.textContent = message;
    document.getElementById('spotlight-count').textContent = 'Unavailable';
    document.getElementById('spot-prev').disabled = true;
    document.getElementById('spot-next').disabled = true;
    var body = document.getElementById('spotlight-body');
    body.replaceChildren(el('p', 'desc placeholder', 'Featured pieces could not be loaded.'));
  }

  function setupSpotlight(items) {
    var featured = items.filter(function (item) { return item.featured === true; });
    var root = document.getElementById('spotlight');
    var body = document.getElementById('spotlight-body');
    var prev = document.getElementById('spot-prev');
    var next = document.getElementById('spot-next');
    var count = document.getElementById('spotlight-count');
    var status = document.getElementById('spotlight-status');
    var index = 0;
    var timer = 0;
    var hovered = false;

    function focusedInside() {
      return root.contains(document.activeElement);
    }

    function show(announce) {
      if (!featured.length) {
        count.textContent = 'No featured pieces';
        body.replaceChildren(el('p', 'desc placeholder', 'No featured pieces. Set featured to true on an item in items.json.'));
        prev.disabled = true;
        next.disabled = true;
        return;
      }
      var item = featured[index];
      count.textContent = 'Piece ' + (index + 1) + ' of ' + featured.length;
      var layout = el('div', 'spotlight-layout');
      layout.appendChild(figureFor(item, false));
      layout.appendChild(copyBlock(item, 'h3', true));
      body.replaceChildren(layout);
      var canMove = featured.length > 1;
      prev.disabled = !canMove;
      next.disabled = !canMove;
      if (announce) {
        status.textContent = 'Showing ' + item.title + ', signed by ' + item.signer + '. Piece ' + (index + 1) + ' of ' + featured.length + '.';
      }
    }

    function step(delta, announce) {
      if (featured.length < 2) return;
      index = (index + delta + featured.length) % featured.length;
      show(announce);
    }

    function stop() {
      window.clearInterval(timer);
      timer = 0;
    }

    function play() {
      stop();
      if (!motionOk() || featured.length < 2 || hovered || focusedInside()) return;
      timer = window.setInterval(function () { step(1, false); }, SPOTLIGHT_MS);
    }

    prev.addEventListener('click', function () { step(-1, true); });
    next.addEventListener('click', function () { step(1, true); });
    root.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1, true);
    });
    root.addEventListener('mouseenter', function () {
      hovered = true;
      stop();
    });
    root.addEventListener('mouseleave', function () {
      hovered = false;
      play();
    });
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) play();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else play();
    });
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', play);

    show(false);
    play();
  }

  function initBackdrop() {
    var canvas = document.getElementById('backdrop');
    if (!canvas) return;
    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    var arrows = [
      { x: 0.08, y: 0.18, size: 130, rot: 0.4, vy: 0.000015, vr: 0.00004, alpha: 0.18 },
      { x: 0.72, y: 0.62, size: 170, rot: 2.2, vy: 0.000012, vr: -0.00003, alpha: 0.14 },
      { x: 0.34, y: 0.84, size: 100, rot: 1.1, vy: 0.000018, vr: 0.00005, alpha: 0.2 },
      { x: 0.88, y: 0.28, size: 150, rot: 3.5, vy: 0.000014, vr: 0.00002, alpha: 0.13 },
      { x: 0.22, y: 0.48, size: 86, rot: 4.3, vy: 0.00002, vr: -0.00004, alpha: 0.16 },
      { x: 0.55, y: 0.08, size: 120, rot: 5.2, vy: 0.000016, vr: 0.000025, alpha: 0.15 }
    ];
    var motes = [];
    var i;
    for (i = 0; i < 22; i += 1) {
      motes.push({
        x: ((i * 47) % 100) / 100,
        y: ((i * 29) % 100) / 100,
        r: 1.2 + (i % 3),
        v: 0.00003 + (i % 5) * 0.000008,
        a: 0.18 + (i % 4) * 0.06
      });
    }
    var spots = [
      { x: 0.18, y: 0.22, r: 0.55, color: '227,24,55', alpha: 0.55, speed: 0.15, phase: 0.2 },
      { x: 0.78, y: 0.72, r: 0.48, color: '140,12,32', alpha: 0.7, speed: 0.11, phase: 1.4 },
      { x: 0.52, y: 0.4, r: 0.32, color: '227,24,55', alpha: 0.35, speed: 0.18, phase: 2.3 },
      { x: 0.3, y: 0.8, r: 0.28, color: '255,184,28', alpha: 0.1, speed: 0.09, phase: 0.8 }
    ];

    var width = 0;
    var height = 0;
    var dpr = 1;
    var raf = 0;
    var last = 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    }

    function drawArrow(x, y, size, rot, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.72, size * 0.58);
      ctx.lineTo(0, size * 0.16);
      ctx.lineTo(-size * 0.72, size * 0.58);
      ctx.closePath();
      ctx.fillStyle = 'rgba(227,24,55,' + alpha + ')';
      ctx.fill();
      ctx.restore();
    }

    function draw(time, dt) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#4a0712';
      ctx.fillRect(0, 0, width, height);

      var s;
      for (s = 0; s < spots.length; s += 1) {
        var spot = spots[s];
        var ox = Math.sin(time * spot.speed + spot.phase) * width * 0.06;
        var oy = Math.cos(time * spot.speed * 0.8 + spot.phase) * height * 0.05;
        var cx = spot.x * width + ox;
        var cy = spot.y * height + oy;
        var radius = spot.r * Math.max(width, height);
        var gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(' + spot.color + ',' + spot.alpha + ')');
        gradient.addColorStop(1, 'rgba(74,7,18,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      var a;
      for (a = 0; a < arrows.length; a += 1) {
        var arrow = arrows[a];
        if (dt) {
          arrow.y -= arrow.vy * dt;
          arrow.rot += arrow.vr * dt;
          if (arrow.y < -0.25) arrow.y = 1.25;
        }
        drawArrow(arrow.x * width, arrow.y * height, arrow.size, arrow.rot, arrow.alpha);
      }

      var m;
      for (m = 0; m < motes.length; m += 1) {
        var mote = motes[m];
        var y = mote.y;
        if (dt) {
          y = mote.y - mote.v * dt;
          mote.y = y < -0.05 ? 1.05 : y;
        }
        ctx.globalAlpha = mote.a;
        ctx.fillStyle = '#FFB81C';
        ctx.beginPath();
        ctx.arc(mote.x * width, mote.y * height, mote.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      var vignette = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.2, width / 2, height / 2, Math.max(width, height) * 0.72);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(20,0,6,0.45)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);
    }

    function stopLoop() {
      window.cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    }

    function frame(now) {
      var dt = last ? Math.min(34, now - last) : 16;
      last = now;
      draw(now * 0.001, reduce.matches ? 0 : dt);
      if (!reduce.matches && !document.hidden) raf = window.requestAnimationFrame(frame);
    }

    function start() {
      stopLoop();
      resize();
      if (reduce.matches || document.hidden) {
        draw(0, 0);
        return;
      }
      raf = window.requestAnimationFrame(frame);
    }

    window.addEventListener('resize', function () {
      resize();
      if (reduce.matches || document.hidden || !raf) draw(0, 0);
    });
    document.addEventListener('visibilitychange', start);
    reduce.addEventListener('change', start);
    start();
  }

  async function loadItems() {
    try {
      var response = await fetch('items.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var data = await response.json();
      if (!Array.isArray(data)) throw new Error('items.json must be an array');
      var items = data.filter(function (item) { return item && typeof item === 'object'; });
      if (!items.length) {
        showFailure('items.json loaded, but it has no pieces to display.');
        return;
      }
      document.getElementById('loading').hidden = true;
      renderStats(items);
      renderCards(items);
      setupSpotlight(items);
    } catch (err) {
      showFailure(FETCH_ERROR);
    }
  }

  bindTilt(document.getElementById('spotlight-slide'));
  initBackdrop();
  loadItems();
})();
