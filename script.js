/* ============================================================
   HANSZ — Web Developer
   Linktree · Brutalist Terminal
   Vanilla JS · no dependencies · no animation loops

   01  UTILS
   02  TANGGAL (tahun + tanggal, otomatis)
   03  DROPDOWN (layanan)
   04  PLACEHOLDER LINKS (toast)
   05  BACK TO TOP
   06  KEYBOARD SHORTCUT (1-4)
   07  MATRIX RAIN (background)
   08  CONFIRM MODAL (loading -> alert)
   08a URL DISPLAY (nomor & email disembunyikan)
   09  BOOT
   ============================================================ */
(function () {
  "use strict";

  var $ = function (s, c) {
    return (c || document).querySelector(s);
  };
  var $$ = function (s, c) {
    return Array.prototype.slice.call((c || document).querySelectorAll(s));
  };
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 01  UTILS ---------- */
  var toastEl, toastMsg, toastTimer;

  function toast(msg) {
    toastEl = toastEl || $('#toast');
    toastMsg = toastMsg || $('#toastMsg');
    if (!toastEl) return;
    toastMsg.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* ---------- 02  TANGGAL ----------
     Tahun + tanggal hari ini dibikin otomatis dari jam lokal user,
     jadi tidak perlu diedit tiap tahun. */
  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function year() {
    var now = new Date();
    var y = $('#year');
    if (y) y.textContent = now.getFullYear();

    var d = $('#date');
    if (d) d.textContent = now.getDate() + ' ' + BULAN[now.getMonth()] + ' ' + now.getFullYear();
  }

  /* ---------- 03  DROPDOWN ---------- */
  function dropdown() {
    var trigger = $('[data-menu]');
    if (!trigger) return;

    var group = trigger.closest(".lk-group");

    function setOpen(open) {
      if (!group) return;
      group.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!(group && group.classList.contains("is-open")));
    });

    /* click outside -> close */
    document.addEventListener("click", function (e) {
      if (!group || !group.classList.contains("is-open")) return;
      if (group !== e.target && !group.contains(e.target)) setOpen(false);
    });

    /* Escape -> close */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !group || !group.classList.contains("is-open"))
        return;
      setOpen(false);
      trigger.focus();
    });
  }

  /* ---------- 04  PLACEHOLDER LINKS ----------
     href="#" belum diisi link asli — kasih tahu, jangan diam-diam gagal. */
  function placeholders() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("[data-placeholder]") : null;
      if (!a || a.hasAttribute("data-confirm")) return;
      e.preventDefault();
      toast('error: link ini belum diisi — ganti href="#" di index.html');
    });
  }

  /* ---------- 05  BACK TO TOP ---------- */
  function toTop() {
    var btn = $('#toTop');
    if (!btn) return;

    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      btn.classList.toggle("is-on", y > 520);
    }

    function request() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    request();
  }

  /* ---------- 06  KEYBOARD SHORTCUT ----------
     Tekan 1-5 untuk membuka link / kanal, kayak shortcut di terminal. */
  function shortcuts() {
    document.addEventListener("keydown", function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      var el = $('[data-key="' + e.key + '"]');
      if (!el || el.classList.contains("is-load")) return;
      e.preventDefault();
      el.click();
      el.focus();
    });
  }

  /* ---------- 07  MATRIX RAIN ----------
   Overlay "hujan kode" di belakang konten.
   Sengaja dibuat jarang + pelan + tajam, biar tidak bikin pusing dan
   tidak mengganggu teks. Semua posisi dihitung dalam pixel (bukan sel),
   jadi kecepatannya stabil di monitor 60Hz maupun 120Hz. */
  function rain() {
    var cv = $('#rain');
    if (!cv) return;

    var ctx = cv.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var FS = 14; /* ukuran font          */
    var STEP = 32; /* jarak antar kolom    */
    var W = 0,
      H = 0,
      cols = 0,
      drops = [],
      raf = null,
      sizeT;

    var GLYPHS = (
      "01{}[]<>/*+-=$#@&|\\;:$_~^%" +
      "<div></div><p>const</p><p>let</p><p>async</p><p>()=>{}</p><p>npm</p><p>git</p><p>api</p><p>css</p><p>html</p><p>fn</p>"
    ).match(/.{1,3}/g);

    var HEAD = "0,52,30";
    var TAIL = "16,64,42";

    function makeDrop(y) {
      return {
        y: y /* posisi kepala, px */,
        v: (14 + Math.random() * 34) / 60 /* 14-48 px per detik */,
        len: 6 + Math.floor(Math.random() * 8) /* panjang jejak      */,
      };
    }

    function sizeCanvas() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = "700 " + FS + 'px "JetBrains Mono", ui-monospace, monospace';
      ctx.textBaseline = "top";

      cols = Math.ceil(W / STEP) + 1;
      drops = [];
      for (var i = 0; i < cols; i++) drops.push(makeDrop(Math.random() * H));
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;

      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < cols; i++) {
        var d = drops[i];
        var x = i * STEP + 2;

        for (var j = 0; j < d.len; j++) {
          var y = d.y - j * FS;
          if (y < -FS || y > H) continue;
          /* ekor cepat memudar -> huruf tetap tajam, bukan blur */
          var a = j === 0 ? 1 : Math.pow(1 - j / d.len, 2.4) * 0.85;
          ctx.fillStyle =
            "rgba(" + (j === 0 ? HEAD : TAIL) + "," + a.toFixed(3) + ")";
          ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], x, y);
        }

        d.y += d.v;
        if (d.y - d.len * FS > H) drops[i] = makeDrop(-Math.random() * 80 - 10);
      }
    }

    sizeCanvas();
    frame(); /* gambar langsung, tak nunggu frame berikutnya */

    if (REDUCED) {
      cancelAnimationFrame(raf);
      return;
    }

    window.addEventListener(
      "resize",
      function () {
        clearTimeout(sizeT);
        sizeT = setTimeout(sizeCanvas, 220);
      },
      { passive: true },
    );
  }

  /* ---------- 08  CONFIRM MODAL ----------
   Semua link (dan tombol sosmed) tidak langsung dibuka:
   1. klik  -> tombol masuk status loading (spinner)
   2. selesai -> muncul alert kustom ala sweetalert
   3. "buka link" -> baru navigate / buka tab baru
   Tutup: tombol batal, klik backdrop, atau Escape. */
  function confirmModal() {
    var mdl = $('#mdl');
    var ico = $('#mdlIco');
    var title = $('#mdlTitle');
    var desc = $('#mdlDesc');
    var url = $('#mdlUrl');
    var warn = $('#mdlWarn');
    var warnTxt = $('#mdlWarnTxt');
    var cmd = $('#mdlCmd');
    var target = $('#mdlTarget');
    var yesTxt = $('#mdlYesTxt');
    var yes = $('#mdlYes');
    var no = $('#mdlNo');
    var noTxt = $('#mdlNoTxt');
    if (!mdl || !yes || !no) return;

    var LOAD_MS = 620; /* durasi animasi loading */
    var timer = null;
    var lastFocus = null;

    /* link yang mau dibuka setelah user konfirmasi */
    var pending = null;

    function busy(on) {
      yes.disabled = on;
      no.disabled = on;
    }

    /* ---------- 08a  URL DISPLAY ----------
     Nomor HP & email tidak boleh kelihatan di alert — yang Ditampilkan
     cuma host generik. Data aslinya tetap ada di href buat navigasi. */
    function safeUrl(href) {
      if (href.indexOf("mailto:") === 0)
        return "mailto: [alamat email HANSZ]";
      if (href.indexOf("tel:") === 0) return "tel: [nomor HANSZ]";

      var host = href.replace(/^https?:\/\//, "").split(/[/?#]/)[0];
      if (/wa\.me|whatsapp|api\.whatsapp/i.test(host))
        return "whatsapp · [nomor HANSZ]";

      /* host biasa: buang "www." yang tidak perlu */
      return host.replace(/^www\./, "");
    }

    function close() {
      clearTimeout(timer);
      timer = null;
      mdl.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    function open(d) {
      lastFocus = d.el;

      /* warna aksen ikut warna link aslinya */
      var color = getComputedStyle(d.el).getPropertyValue("--c").trim();
      mdl.style.setProperty("--c", color || "var(--yellow)");

      /* avatar (data-avatar) menggantikan ikon fontawesome kalau ada */
      if (d.avatar) {
        ico.className = "mdl__ico mdl__ico--ava";
        ico.innerHTML =
          '<img src="' + d.avatar + '" alt="" width="120" height="120">';
      } else {
        ico.className = "mdl__ico";
        ico.innerHTML = '<i class="' + d.icon + '" aria-hidden="true"></i>';
      }

      title.textContent = d.title;
      desc.textContent = d.desc;

      cmd.textContent = d.cmd;
      target.textContent = d.target;

      if (d.url) {
        /* link siap -> tampil host, tombol "buka link" aktif */
        url.hidden = false;
        warn.hidden = true;
        url.textContent = safeUrl(d.url);
        yesTxt.textContent = d.cta;
        yes.hidden = false;
        noTxt.textContent = "batal";
        busy(false);
      } else {
        /* link belum jadi -> kasih tahu statusnya, tombol buka disembunyikan */
        url.hidden = true;
        yes.hidden = true;
        noTxt.textContent = "paham";
        if (d.warn) {
          warnTxt.textContent = d.warn;
          warn.hidden = false;
        } else {
          warn.hidden = true;
        }
      }

      mdl.hidden = false;
      document.body.style.overflow = "hidden";
      (d.url ? yes : no).focus();
    }

    /* klik link / tombol sosmed -> loading dulu, baru alert */
    document.addEventListener("click", function (e) {
      var el = e.target.closest ? e.target.closest("[data-confirm]") : null;
      if (!el || el.classList.contains("is-load")) return;

      e.preventDefault();

      var data = el.dataset;
      var icon = el.querySelector("[data-icon]");
      var name = el.querySelector("[data-title]");
      var note = el.querySelector("[data-desc]");
      var href = data.url || el.getAttribute("href") || "";

      pending = {
        el: el,
        icon: icon ? icon.className : "fa-solid fa-link",
        title: name ? name.textContent.trim() : "Buka link",
        desc: note
          ? note.textContent.trim()
          : "Klik tombol di bawah untuk lanjut.",
        cmd: data.cmd || "open",
        target: data.target || "./link",
        cta: data.cta || "buka link",
        avatar: data.avatar || "",
        warn: data.warn || "",
        url: href && href !== "#" ? href : "",
      };

      /* 1. status loading di tombol */
      el.classList.add("is-load");
      busy(true);

      /* 2. munculkan alert */
      timer = setTimeout(function () {
        el.classList.remove("is-load");
        timer = null;
        open(pending);
      }, LOAD_MS);
    });

    yes.addEventListener("click", function () {
      if (!pending || !pending.url) return;
      var href = pending.url;
      close();

      if (href.indexOf("mailto:") === 0) {
        window.location.href = href;
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    });

    no.addEventListener("click", close);

    /* klik backdrop -> tutup */
    mdl.addEventListener("click", function (e) {
      if (e.target === mdl) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mdl.hidden) close();
    });
  }

  /* ---------- 09  BOOT ---------- */
  function init() {
    year();
    dropdown();
    placeholders();
    toTop();
    shortcuts();
    rain();
    confirmModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
