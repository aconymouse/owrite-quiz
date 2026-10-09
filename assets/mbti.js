(function () {
  "use strict";

  var root = document.querySelector("[data-omb]");
  var data = window.OwriteMbtiData;
  var config = window.OwriteMbtiConfig || {};
  if (!root || !data) return;

  var KUNCI = "owrite_mbti";
  var KUTUB = ["E", "I", "S", "N", "T", "F", "J", "P"];
  var PASANGAN = [["E", "I"], ["S", "N"], ["T", "F"], ["J", "P"]];

  var T = {
    id: {
      judul: "Tes Kepribadian MBTI",
      pengantar: "Jawab dengan jujur, pilih yang paling terasa seperti kamu. Gak ada jawaban benar atau salah, dan hasilnya langsung terlihat tanpa daftar.",
      modeLabel: "Pilih versi tes",
      lengkap: ["Lengkap", "60 soal, sekitar 12 menit"],
      singkat: ["Singkat", "24 soal, sekitar 5 menit"],
      mulai: "Mulai tes",
      lanjutkan: function (n, total) { return "Lanjutkan dari soal " + n + " dari " + total; },
      mulaiUlang: "Mulai dari awal",
      soalKe: function (n, total) { return "Soal " + n + " dari " + total; },
      dimensi: { EI: "Energi dan dunia sosial", SN: "Cara menyerap informasi", TF: "Cara mengambil keputusan", JP: "Gaya menjalani hari" },
      kembali: "Kembali",
      lanjut: "Lanjut",
      selesai: "Lihat hasil",
      hasilKamu: "Hasil tes kamu",
      modeHasil: { lengkap: "Versi lengkap, 60 soal", singkat: "Versi singkat, 24 soal" },
      preferensi: "Kecenderungan kamu",
      kutub: { E: "Ekstrover", I: "Introver", S: "Pengindra", N: "Intuitif", T: "Pemikir", F: "Perasa", J: "Terencana", P: "Spontan" },
      info: function (p, kutub) {
        var total = p.menangN + p.kalahN;
        if (p.seri) {
          return ["Dari " + total + " soal " + p.menang + "/" + p.kalah + ", jawabanmu imbang " + p.menangN + " lawan " + p.kalahN + ". Kalau seri begini, huruf " + p.menang + " yang dipakai di kode kamu.", "Di sini kamu seimbang: " + p.persen + "% " + kutub[p.menang] + ", " + (100 - p.persen) + "% " + kutub[p.kalah] + "."];
        }
        return ["Dari " + total + " soal " + p.menang + "/" + p.kalah + ", " + p.menangN + " jawabanmu condong ke " + kutub[p.menang] + " dan " + p.kalahN + " ke " + kutub[p.kalah] + ". Angka yang di bawah itu sisanya, bukan skor terpisah.", p.persen + "% kamu " + kutub[p.menang] + ", " + (100 - p.persen) + "%-nya " + kutub[p.kalah] + "."];
      },
      unduh: "Unduh PDF",
      bagikan: "Bagikan",
      tersalin: "Tautan tersalin",
      tesUlang: "Tes ulang",
      tentang: "Tentang tipe ini",
      kekuatan: "Kekuatan",
      tantangan: "Tantangan",
      karier: "Karier yang cocok",
      emailJudul: "Mau PDF lengkapnya dikirim ke email?",
      emailPlaceholder: "Alamat email",
      emailKirim: "Kirim",
      emailTerkirim: "Terkirim, cek kotak masukmu.",
      emailGagal: "Gagal mengirim, coba lagi sebentar.",
      emailTidakValid: "Alamat emailnya belum benar.",
    },
    en: {
      judul: "MBTI Personality Test",
      pengantar: "Answer honestly and pick whichever feels most like you. There are no right or wrong answers, and your result shows up right away, no sign-up.",
      modeLabel: "Choose a version",
      lengkap: ["Full", "60 questions, about 12 minutes"],
      singkat: ["Short", "24 questions, about 5 minutes"],
      mulai: "Start the test",
      lanjutkan: function (n, total) { return "Continue from question " + n + " of " + total; },
      mulaiUlang: "Start over",
      soalKe: function (n, total) { return "Question " + n + " of " + total; },
      dimensi: { EI: "Energy and social world", SN: "How you take in information", TF: "How you make decisions", JP: "How you run your day" },
      kembali: "Back",
      lanjut: "Next",
      selesai: "See results",
      hasilKamu: "Your result",
      modeHasil: { lengkap: "Full version, 60 questions", singkat: "Short version, 24 questions" },
      preferensi: "Your tendencies",
      kutub: { E: "Extravert", I: "Introvert", S: "Sensing", N: "Intuitive", T: "Thinking", F: "Feeling", J: "Judging", P: "Perceiving" },
      info: function (p, kutub) {
        var total = p.menangN + p.kalahN;
        if (p.seri) {
          return ["Out of " + total + " " + p.menang + "/" + p.kalah + " questions, your answers tied " + p.menangN + " to " + p.kalahN + ". On a tie like this, the letter " + p.menang + " goes into your code.", "You're balanced here: " + p.persen + "% " + kutub[p.menang] + ", " + (100 - p.persen) + "% " + kutub[p.kalah] + "."];
        }
        return ["Out of " + total + " " + p.menang + "/" + p.kalah + " questions, " + p.menangN + " of your answers leaned " + kutub[p.menang] + " and " + p.kalahN + " leaned " + kutub[p.kalah] + ". The number below is the remainder, not a separate score.", "You're " + p.persen + "% " + kutub[p.menang] + ", " + (100 - p.persen) + "% " + kutub[p.kalah] + "."];
      },
      unduh: "Download PDF",
      bagikan: "Share",
      tersalin: "Link copied",
      tesUlang: "Retake the test",
      tentang: "About this type",
      kekuatan: "Strengths",
      tantangan: "Challenges",
      karier: "Careers that fit",
      emailJudul: "Want the full PDF sent to your email?",
      emailPlaceholder: "Email address",
      emailKirim: "Send",
      emailTerkirim: "Sent, check your inbox.",
      emailGagal: "Could not send, try again in a moment.",
      emailTidakValid: "That email address doesn't look right.",
    },
  };

  var state = {
    tahap: "intro",
    mode: "lengkap",
    bahasa: "id",
    jawaban: {},
    posisi: 0,
    hasil: null,
    info: null,
    idRespons: 0,
    status: "",
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function t() {
    return T[state.bahasa];
  }

  function daftarSoal(mode) {
    return mode === "singkat"
      ? data.soal.filter(function (s) { return data.singkat.indexOf(s.nomor) > -1; })
      : data.soal;
  }

  function hitung(soal, jawaban) {
    var skor = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    soal.forEach(function (s) {
      var j = jawaban[s.nomor];
      if (j) skor[j === "A" ? s.kutubA : s.kutubB] += 1;
    });
    return skor;
  }

  function tipeDari(skor) {
    return PASANGAN.map(function (p) { return skor[p[0]] >= skor[p[1]] ? p[0] : p[1]; }).join("");
  }

  function preferensi(skor) {
    return PASANGAN.map(function (p) {
      var total = skor[p[0]] + skor[p[1]] || 1;
      var menang = skor[p[0]] >= skor[p[1]] ? p[0] : p[1];
      var kalah = menang === p[0] ? p[1] : p[0];
      return { menang: menang, kalah: kalah, persen: Math.round((skor[menang] / total) * 100), menangN: skor[menang], kalahN: skor[kalah], seri: skor[p[0]] === skor[p[1]] };
    });
  }

  function dominan(pref) {
    return pref.reduce(function (top, p) { return p.persen > top.persen ? p : top; }).menang;
  }

  function simpan() {
    if (state.tahap !== "soal") return;
    try {
      sessionStorage.setItem(KUNCI, JSON.stringify({ mode: state.mode, bahasa: state.bahasa, jawaban: state.jawaban, posisi: state.posisi }));
    } catch (e) {}
  }

  function hapusSimpanan() {
    try {
      sessionStorage.removeItem(KUNCI);
    } catch (e) {}
  }

  function bacaSimpanan() {
    try {
      var raw = sessionStorage.getItem(KUNCI);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || typeof s.jawaban !== "object" || !Object.keys(s.jawaban).length) return null;
      return s;
    } catch (e) {
      return null;
    }
  }

  function toggleBahasa() {
    return '<div class="omb-bahasa" role="group" aria-label="Bahasa / Language">' +
      ["id", "en"].map(function (b) {
        return '<button type="button" data-bahasa="' + b + '" aria-pressed="' + (state.bahasa === b) + '">' + b + "</button>";
      }).join("") + "</div>";
  }

  function tampilIntro() {
    var s = bacaSimpanan();
    var x = t();
    var tombol;
    if (s) {
      var total = daftarSoal(s.mode).length;
      var n = Math.min(s.posisi, total - 1) + 1;
      tombol = '<button type="button" class="omb-btn omb-btn-utama" data-aksi="lanjutkan">' + esc(x.lanjutkan(n, total)) + "</button>" +
        '<button type="button" class="omb-btn omb-btn-teks" data-aksi="mulai">' + esc(x.mulaiUlang) + "</button>";
    } else {
      tombol = '<button type="button" class="omb-btn omb-btn-utama" data-aksi="mulai">' + esc(x.mulai) + "</button>";
    }
    return '<div class="omb-atas"><p class="omb-pengantar">' + esc(x.pengantar) + "</p>" + toggleBahasa() + "</div>" +
      '<fieldset class="omb-mode"><legend class="omb-eyebrow">' + esc(x.modeLabel) + "</legend><div class=\"omb-mode-grid\">" +
      ["lengkap", "singkat"].map(function (m) {
        var aktif = state.mode === m;
        return '<label class="omb-mode-kartu' + (aktif ? " is-aktif" : "") + '"><input type="radio" name="omb-mode" value="' + m + '"' + (aktif ? " checked" : "") + "><span class=\"omb-radio\"></span><span><strong>" + esc(x[m][0]) + "</strong><small>" + esc(x[m][1]) + "</small></span></label>";
      }).join("") + "</div></fieldset>" +
      '<div class="omb-aksi">' + tombol + "</div>";
  }

  function tampilSoal() {
    var x = t();
    var soal = daftarSoal(state.mode);
    var q = soal[state.posisi];
    var teks = q[state.bahasa] || q.id;
    var pilih = state.jawaban[q.nomor];
    var terakhir = state.posisi === soal.length - 1;
    var persen = Math.round((state.posisi / soal.length) * 100);
    return '<div class="omb-atas omb-atas-soal"><p class="omb-progres-teks">' + esc(x.soalKe(state.posisi + 1, soal.length)) + "</p>" + toggleBahasa() + "</div>" +
      '<div class="omb-progres" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + persen + '"><div style="width:' + Math.max(2, persen) + '%"></div></div>' +
      '<div class="omb-kartu omb-masuk"><p class="omb-eyebrow">' + esc(x.dimensi[q.dimensi]) + '</p><h2 class="omb-tanya">' + esc(teks.q) + "</h2><div class=\"omb-opsi\">" +
      ["A", "B"].map(function (o) {
        return '<button type="button" class="omb-opsi-btn" data-pilih="' + o + '" aria-pressed="' + (pilih === o) + '"><span class="omb-opsi-huruf">' + o + "</span><span>" + esc(o === "A" ? teks.a : teks.b) + "</span></button>";
      }).join("") + "</div></div>" +
      '<div class="omb-nav"><button type="button" class="omb-btn omb-btn-teks" data-aksi="kembali"' + (state.posisi === 0 ? " disabled" : "") + ">" + esc(x.kembali) + "</button>" +
      (terakhir
        ? '<button type="button" class="omb-btn omb-btn-utama" data-aksi="selesai"' + (pilih ? "" : " disabled") + ">" + esc(x.selesai) + "</button>"
        : '<button type="button" class="omb-btn omb-btn-teks" data-aksi="lanjut"' + (pilih ? "" : " disabled") + ">" + esc(x.lanjut) + "</button>") +
      "</div>";
  }

  function daftar(items) {
    return "<ul>" + items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }

  function tampilHasil() {
    var x = t();
    var h = state.hasil;
    var tipe = data.tipe[h.kode][state.bahasa] || data.tipe[h.kode].id;
    var pref = preferensi(h.skor);
    var dom = dominan(pref);
    var huruf = h.kode.split("").map(function (c) {
      return '<span class="' + (c === dom ? "is-dominan" : "") + '">' + c + "</span>";
    }).join("");
    var bar = pref.map(function (p) {
      var terbuka = state.info === p.menang;
      var info = x.info(p, x.kutub);
      return '<li class="omb-bar" data-info-wadah="' + p.menang + '">' +
        '<div class="omb-bar-judul"><span><b>' + p.menang + "</b>" + esc(x.kutub[p.menang]) + "</span><span>" + p.persen + "%</span></div>" +
        '<div class="omb-bar-rel"><div class="omb-bar-isi' + (p.menang === dom ? " is-dominan" : "") + '" style="width:' + p.persen + '%"></div></div>' +
        '<button type="button" class="omb-bar-info" data-info="' + p.menang + '" aria-expanded="' + terbuka + '">' + (100 - p.persen) + "% " + esc(x.kutub[p.kalah]) + "</button>" +
        (terbuka ? '<div class="omb-tip omb-masuk" role="note"><p>' + esc(info[0]) + "</p><p><strong>" + esc(info[1]) + "</strong></p></div>" : "") +
        "</li>";
    }).join("");
    var email;
    if (state.status === "terkirim") {
      email = '<p class="omb-email-status">' + esc(x.emailTerkirim) + "</p>";
    } else {
      email = '<form class="omb-email" data-email><label class="omb-eyebrow" for="omb-email">' + esc(x.emailJudul) + '</label><div class="omb-email-baris"><input id="omb-email" type="email" required placeholder="' + esc(x.emailPlaceholder) + '" autocomplete="email"><button type="submit" class="omb-btn omb-btn-utama"' + (state.status === "mengirim" ? " disabled" : "") + ">" + esc(x.emailKirim) + "</button></div>" +
        (state.status === "gagal" ? '<p class="omb-email-status is-gagal">' + esc(x.emailGagal) + "</p>" : "") +
        (state.status === "tidak-valid" ? '<p class="omb-email-status is-gagal">' + esc(x.emailTidakValid) + "</p>" : "") +
        "</form>";
    }
    return '<div class="omb-atas"><p class="omb-eyebrow">' + esc(x.hasilKamu) + "</p>" + toggleBahasa() + "</div>" +
      '<header class="omb-hero"><p class="omb-huruf" aria-label="' + h.kode + '">' + huruf + "</p><h2 class=\"omb-nama\">" + esc(tipe.nama) + "<small>" + esc(tipe.namaLain) + "</small></h2><p class=\"omb-tagline\">" + esc(tipe.tagline) + "</p></header>" +
      '<section class="omb-panel"><div class="omb-panel-judul"><h3 class="omb-eyebrow">' + esc(x.preferensi) + "</h3><span>" + esc(x.modeHasil[state.mode]) + "</span></div><ul class=\"omb-bar-grid\">" + bar + "</ul>" +
      '<div class="omb-aksi"><button type="button" class="omb-btn omb-btn-utama" data-aksi="unduh">' + esc(x.unduh) + '</button><button type="button" class="omb-btn omb-btn-garis" data-aksi="bagikan">' + esc(state.status === "tersalin" ? x.tersalin : x.bagikan) + '</button><button type="button" class="omb-btn omb-btn-teks" data-aksi="ulang">' + esc(x.tesUlang) + "</button></div>" +
      email + "</section>" +
      '<section class="omb-bagian"><h3 class="omb-eyebrow">' + esc(x.tentang) + '</h3><div class="omb-prosa">' + tipe.deskripsi.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></section>" +
      '<div class="omb-dua"><section class="omb-bagian"><h3 class="omb-eyebrow">' + esc(x.kekuatan) + "</h3>" + daftar(tipe.kekuatan) + '</section><section class="omb-bagian"><h3 class="omb-eyebrow">' + esc(x.tantangan) + "</h3>" + daftar(tipe.tantangan) + "</section></div>" +
      '<section class="omb-bagian"><h3 class="omb-eyebrow">' + esc(x.karier) + '</h3><ul class="omb-chip">' + tipe.karier.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul></section>";
  }

  function render() {
    root.setAttribute("lang", state.bahasa);
    root.innerHTML = state.tahap === "intro" ? tampilIntro() : state.tahap === "soal" ? tampilSoal() : tampilHasil();
    simpan();
  }

  function mulai(lanjut) {
    var s = lanjut ? bacaSimpanan() : null;
    if (s) {
      state.mode = s.mode;
      state.bahasa = s.bahasa;
      state.jawaban = s.jawaban;
      state.posisi = Math.min(s.posisi, daftarSoal(s.mode).length - 1);
    } else {
      hapusSimpanan();
      state.jawaban = {};
      state.posisi = 0;
    }
    state.tahap = "soal";
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function kirimRespons(kode, skor) {
    if (!config.ajax) return;
    var fd = new FormData();
    fd.append("action", "omb_mbti_save");
    fd.append("nonce", config.nonce);
    fd.append("type", kode);
    fd.append("lang", state.bahasa);
    fd.append("mode", state.mode);
    fd.append("scores", JSON.stringify(skor));
    fetch(config.ajax, { method: "POST", body: fd })
      .then(function (r) { return r.json(); })
      .then(function (res) { if (res && res.success && res.data) state.idRespons = res.data.id || 0; })
      .catch(function () {});
  }

  function selesai() {
    var soal = daftarSoal(state.mode);
    var skor = hitung(soal, state.jawaban);
    var kode = tipeDari(skor);
    state.hasil = { kode: kode, skor: skor };
    state.tahap = "hasil";
    hapusSimpanan();
    state.status = "";
    state.info = null;
    render();
    kirimRespons(kode, skor);
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function dataPdf() {
    var h = state.hasil;
    var x = t();
    var pref = preferensi(h.skor);
    return {
      kode: h.kode,
      skor: h.skor,
      mode: state.mode,
      bahasa: state.bahasa,
      tipe: data.tipe[h.kode][state.bahasa] || data.tipe[h.kode].id,
      preferensi: pref,
      dominan: dominan(pref),
      kutub: x.kutub,
      modeTeks: x.modeHasil[state.mode],
      judul: x.judul,
      labelTentang: x.tentang,
      labelKekuatan: x.kekuatan,
      labelTantangan: x.tantangan,
      labelKarier: x.karier,
      site: config.site || "",
      url: config.url || "",
    };
  }

  function unduh() {
    if (!window.OwriteMbtiPdf) return;
    window.OwriteMbtiPdf.buat(dataPdf()).save("mbti-" + state.hasil.kode.toLowerCase() + ".pdf");
  }

  function bagikan() {
    var x = t();
    var url = config.url || window.location.href;
    try {
      var u = new URL(url, window.location.href);
      u.searchParams.set("utm_source", "mbti");
      u.searchParams.set("utm_medium", "share");
      u.searchParams.set("utm_campaign", "mbti-share");
      url = u.toString();
    } catch (e) {}
    var judul = state.hasil.kode + " · " + x.judul;
    if (navigator.share) {
      navigator.share({ title: judul, url: url }).catch(function () {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        state.status = "tersalin";
        render();
        setTimeout(function () { if (state.status === "tersalin") { state.status = ""; render(); } }, 2000);
      }).catch(function () {});
    }
  }

  function kirimEmail(form) {
    var input = form.querySelector("input[type=email]");
    var email = (input.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      state.status = "tidak-valid";
      render();
      return;
    }
    if (!window.OwriteMbtiPdf || !config.ajax) return;
    state.status = "mengirim";
    render();
    var doc = window.OwriteMbtiPdf.buat(dataPdf());
    var fd = new FormData();
    fd.append("action", "omb_email_pdf");
    fd.append("nonce", config.nonce);
    fd.append("email", email);
    fd.append("type", state.hasil.kode);
    fd.append("id", String(state.idRespons));
    fd.append("pdf", doc.output("datauristring").split(",")[1]);
    fetch(config.ajax, { method: "POST", body: fd })
      .then(function (r) { return r.json(); })
      .then(function (res) { state.status = res && res.success ? "terkirim" : "gagal"; render(); })
      .catch(function () { state.status = "gagal"; render(); });
  }

  root.addEventListener("click", function (e) {
    var el = e.target.closest("[data-bahasa],[data-aksi],[data-pilih],[data-info]");
    if (!el || !root.contains(el)) {
      if (state.info) { state.info = null; render(); }
      return;
    }
    if (el.dataset.bahasa) {
      state.bahasa = el.dataset.bahasa;
      render();
      return;
    }
    if (el.dataset.info) {
      state.info = state.info === el.dataset.info ? null : el.dataset.info;
      render();
      return;
    }
    if (el.dataset.pilih) {
      var soal = daftarSoal(state.mode);
      state.jawaban[soal[state.posisi].nomor] = el.dataset.pilih;
      if (state.posisi < soal.length - 1) {
        render();
        setTimeout(function () { state.posisi += 1; render(); }, 320);
      } else {
        render();
      }
      return;
    }
    switch (el.dataset.aksi) {
      case "mulai": mulai(false); break;
      case "lanjutkan": mulai(true); break;
      case "kembali": if (state.posisi > 0) { state.posisi -= 1; render(); } break;
      case "lanjut": state.posisi += 1; render(); break;
      case "selesai": selesai(); break;
      case "unduh": unduh(); break;
      case "bagikan": bagikan(); break;
      case "ulang":
        hapusSimpanan();
        state.tahap = "intro";
        state.hasil = null;
        state.jawaban = {};
        state.posisi = 0;
        state.idRespons = 0;
        render();
        break;
    }
  });

  root.addEventListener("change", function (e) {
    if (e.target.name === "omb-mode") {
      state.mode = e.target.value;
      render();
    }
  });

  root.addEventListener("submit", function (e) {
    if (e.target.matches("[data-email]")) {
      e.preventDefault();
      kirimEmail(e.target);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.info) { state.info = null; render(); }
  });

  document.addEventListener("pointerdown", function (e) {
    if (state.info && !root.contains(e.target)) { state.info = null; render(); }
  });

  render();
})();
