/* Mantis ambient background — drifting halftone screen (exploration 2a).
   A dot screen defined in DOCUMENT space: dot pitch coarsens as you descend, and a slow
   lobed field decides how present the screen is at each point, so some regions carry
   texture and others thin out to almost bare ink. The lobes creep over tens of seconds.
   Dots are batched into a few alpha buckets so a full viewport is 6 fills, not 15,000. */
(function () {
  var TAU = Math.PI * 2;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* smooth, deterministic, several lobes per screenful */
  function lobeField(x, y) {
    return 0.5 + 0.32 * Math.sin(x * 0.0042 + y * 0.0027 + 1.4)
               + 0.26 * Math.sin(x * 0.0023 - y * 0.0050 + 3.9)
               + 0.20 * Math.sin((x + y) * 0.0065 + 0.5);
  }

  function AmbientField(canvas) {
    this.c = canvas;
    canvas.__field = this;
    this.ctx = canvas.getContext('2d');
    this.mode = 'screen';
    this.density = 1;
    this.intensity = 1;
    this.t = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._onResize = this.resize.bind(this);
    this._onScroll = this.requestDraw.bind(this);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this.reduced.addEventListener('change', this._onResize);
    this.resize();
    this.loop();
  }

  AmbientField.prototype.set = function (o) {
    if (o.mode) this.mode = o.mode;
    if (o.density) this.density = o.density;
    if (o.intensity != null) this.intensity = o.intensity;
    this.requestDraw();
  };

  AmbientField.prototype.resize = function () {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    this.vw = window.innerWidth; this.vh = window.innerHeight;
    this.c.width = Math.round(this.vw * dpr);
    this.c.height = Math.round(this.vh * dpr);
    this.dpr = dpr;
    this.docH = Math.max(document.documentElement.scrollHeight, this.vh * 2);
    this.requestDraw();
  };

  AmbientField.prototype.requestDraw = function () {
    if (this._pending) return;
    var self = this;
    this._pending = requestAnimationFrame(function () { self._pending = 0; self.draw(); });
  };

  /* the screen only needs a repaint when it drifts, so run it slow and cheap */
  AmbientField.prototype.loop = function () {
    var self = this, last = performance.now();
    var frame = function (now) {
      self._loopId = requestAnimationFrame(frame);
      if (self.reduced.matches || document.hidden) return;
      if (now - last < 180) return;
      self.t += (now - last) / 1000;
      last = now;
      self.draw();
    };
    this._loopId = requestAnimationFrame(frame);
  };

  AmbientField.prototype.draw = function () {
    var ctx = this.ctx, sy = window.scrollY;
    var cs = getComputedStyle(this.c);
    var rgb = (cs.getPropertyValue('--field-rgb') || '210,228,228').trim();
    var k = this.intensity * (parseFloat(cs.getPropertyValue('--field-a')) || 1);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.vw, this.vh);
    if (k <= 0 || this.mode === 'none') return;

    var drift = this.reduced.matches ? 0 : this.t;
    var ox = drift * 1.6, oy = drift * -1.1;      /* lobes creep; regions fade over tens of seconds */
    var BUCKETS = 6, paths = [], i;
    for (i = 0; i < BUCKETS; i++) paths.push([]);

    var top = sy, bottom = sy + this.vh;
    /* walk the document-space grid, but only the rows on screen */
    var y = 0, pitch;
    while (y < bottom) {
      var p = y / this.docH;
      pitch = (9 + 5 * p) / this.density;
      if (y + pitch < top) { y += pitch; continue; }
      for (var x = 0; x < this.vw + pitch; x += pitch) {
        var lobe = clamp((lobeField(x + ox, y + oy) - 0.34) / 0.42, 0, 1);
        var presence = 0.3 + 0.7 * lobe;
        var f = 0.5 + 0.5 * Math.sin(x * 0.02 + y * 0.012);
        var a = (0.028 + 0.05 * presence) * k;
        var b = clamp(Math.floor(a / 0.014), 0, BUCKETS - 1);
        paths[b].push(x, y - sy, 0.35 + f * 1.5 * presence);
      }
      y += pitch;
    }

    for (i = 0; i < BUCKETS; i++) {
      var arr = paths[i];
      if (!arr.length) continue;
      ctx.fillStyle = 'rgba(' + rgb + ',' + ((i + 0.5) * 0.014).toFixed(4) + ')';
      ctx.beginPath();
      for (var j = 0; j < arr.length; j += 3) {
        ctx.moveTo(arr[j] + arr[j + 2], arr[j + 1]);
        ctx.arc(arr[j], arr[j + 1], arr[j + 2], 0, TAU);
      }
      ctx.fill();
    }
  };

  AmbientField.prototype.destroy = function () {
    cancelAnimationFrame(this._loopId);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('scroll', this._onScroll);
    this.reduced.removeEventListener('change', this._onResize);
  };

  window.AmbientField = AmbientField;
})();
