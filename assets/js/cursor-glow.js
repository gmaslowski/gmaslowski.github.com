(function () {
  'use strict';

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0';
  document.body.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var W, H, contentLeft = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    var el = document.querySelector('.block-right');
    contentLeft = el ? el.getBoundingClientRect().left : 336;
  }
  window.addEventListener('resize', resize);
  resize();

  // Bias toward 0 and 1 — more particles near edges and corners
  function edgeBias() {
    var t = Math.pow(Math.random(), 0.3);
    return Math.random() < 0.5 ? t : 1 - t;
  }

  var COUNT = 72;
  var R = '79,177,186';

  function mkParticle() {
    var z = Math.random();
    var cw = W - contentLeft;
    return {
      x: contentLeft + edgeBias() * cw,
      y: edgeBias() * H,
      z: z,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 0.8 + z * 2.2,
      a: 0.15 + z * 0.45
    };
  }

  var pts = [];
  for (var i = 0; i < COUNT; i++) pts.push(mkParticle());

  var CONNECT = 125;
  var MAX_SPEED = 0.55;
  var EDGE_PAD = 18;

  function frame() {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(contentLeft, 0, W - contentLeft, H);
    ctx.clip();

    // Connections
    for (var i = 0; i < COUNT; i++) {
      for (var j = i + 1; j < COUNT; j++) {
        var a = pts[i], b = pts[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(' + R + ',' + ((1 - d / CONNECT) * 0.11) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    var cw = W - contentLeft;
    var midX = contentLeft + cw / 2;
    var midY = H / 2;

    // Update + draw
    for (var i = 0; i < COUNT; i++) {
      var p = pts[i];

      // Gentle push away from center → keeps particles near edges/corners
      p.vx += (p.x - midX) * 0.00012;
      p.vy += (p.y - midY) * 0.00012;

      // Dampen
      p.vx *= 0.991;
      p.vy *= 0.991;

      // Speed cap
      var spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd > MAX_SPEED) { p.vx = p.vx / spd * MAX_SPEED; p.vy = p.vy / spd * MAX_SPEED; }

      p.x += p.vx;
      p.y += p.vy;

      // Soft bounce off all four walls
      if (p.x < contentLeft + EDGE_PAD) p.vx += 0.04;
      if (p.x > W - EDGE_PAD)           p.vx -= 0.04;
      if (p.y < EDGE_PAD)               p.vy += 0.04;
      if (p.y > H - EDGE_PAD)           p.vy -= 0.04;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + R + ',' + p.a + ')';
      ctx.fill();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }

  frame();
}());
