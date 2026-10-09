(function () {
  "use strict";

  var LEBAR = 210;
  var TINGGI = 297;
  var KIRI = 20;
  var KANAN = 190;
  var AKSEN = [229, 255, 17];
  var ABU = [115, 115, 115];
  var HITAM = [17, 17, 17];

  function kepala(doc, d) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor.apply(doc, HITAM);
    doc.text((d.site || "").toUpperCase(), KIRI, 16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor.apply(doc, ABU);
    doc.text(d.judul, KANAN, 16, { align: "right" });
    doc.setDrawColor.apply(doc, HITAM);
    doc.setLineWidth(0.6);
    doc.line(KIRI, 20, KANAN, 20);
  }

  function kaki(doc, d) {
    var total = doc.getNumberOfPages();
    for (var i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(KIRI, TINGGI - 16, KANAN, TINGGI - 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor.apply(doc, ABU);
      doc.text(d.url || "", KIRI, TINGGI - 10);
      doc.text(i + " / " + total, KANAN, TINGGI - 10, { align: "right" });
    }
  }

  function eyebrow(doc, teks, y, x) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor.apply(doc, ABU);
    doc.text(teks.toUpperCase(), x || KIRI, y, { charSpace: 0.6 });
  }

  function paragraf(doc, teks, y, lebar) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    var baris = doc.splitTextToSize(teks, lebar || KANAN - KIRI);
    doc.text(baris, KIRI, y);
    return y + baris.length * 5.2;
  }

  function butir(doc, items, x, y, lebar) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    items.forEach(function (item) {
      doc.setFillColor.apply(doc, HITAM);
      doc.circle(x + 1.2, y - 1.3, 0.8, "F");
      var baris = doc.splitTextToSize(item, lebar - 6);
      doc.text(baris, x + 5, y);
      y += baris.length * 5.2 + 1.5;
    });
    return y;
  }

  function buat(d) {
    var doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    kepala(doc, d);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(64);
    doc.setTextColor.apply(doc, HITAM);
    doc.text(d.kode, KIRI - 1, 50);
    var lebarKode = doc.getTextWidth(d.kode);
    doc.setFillColor.apply(doc, AKSEN);
    doc.rect(KIRI - 1, 53, lebarKode, 2.2, "F");

    doc.setFontSize(20);
    doc.text(d.tipe.nama, KIRI, 68);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor.apply(doc, ABU);
    doc.text(d.tipe.namaLain.toUpperCase(), KIRI + doc.getTextWidth(d.tipe.nama) * 2.1 + 4, 68, { charSpace: 0.5 });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    var tag = doc.splitTextToSize(d.tipe.tagline, KANAN - KIRI);
    doc.text(tag, KIRI, 77);
    var y = 77 + tag.length * 6 + 6;

    eyebrow(doc, d.modeTeks, y);
    y += 7;
    var kolom = (KANAN - KIRI - 10) / 2;
    d.preferensi.forEach(function (p, i) {
      var x = KIRI + (i % 2) * (kolom + 10);
      var yy = y + Math.floor(i / 2) * 18;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor.apply(doc, HITAM);
      doc.text(p.menang + "  " + d.kutub[p.menang], x, yy);
      doc.setFont("helvetica", "normal");
      doc.setTextColor.apply(doc, ABU);
      doc.text(p.persen + "%", x + kolom, yy, { align: "right" });
      doc.setFillColor(229, 229, 229);
      doc.roundedRect(x, yy + 2.5, kolom, 2.2, 1.1, 1.1, "F");
      doc.setFillColor.apply(doc, p.menang === d.dominan ? AKSEN : HITAM);
      doc.roundedRect(x, yy + 2.5, Math.max(2.2, (p.persen / 100) * kolom), 2.2, 1.1, 1.1, "F");
      doc.setFontSize(8);
      doc.text((100 - p.persen) + "% " + d.kutub[p.kalah], x, yy + 9);
    });
    y += 42;

    eyebrow(doc, d.labelTentang, y);
    y += 7;
    d.tipe.deskripsi.forEach(function (p) {
      if (y > TINGGI - 40) {
        doc.addPage();
        kepala(doc, d);
        y = 32;
      }
      y = paragraf(doc, p, y) + 3;
    });

    if (y > TINGGI - 80) {
      doc.addPage();
      kepala(doc, d);
      y = 32;
    }
    y += 4;
    eyebrow(doc, d.labelKekuatan, y);
    eyebrow(doc, d.labelTantangan, y, KIRI + kolom + 10);
    y += 7;
    var y1 = butir(doc, d.tipe.kekuatan, KIRI, y, kolom);
    var y2 = butir(doc, d.tipe.tantangan, KIRI + kolom + 10, y, kolom);
    y = Math.max(y1, y2) + 6;

    if (y > TINGGI - 40) {
      doc.addPage();
      kepala(doc, d);
      y = 32;
    }
    eyebrow(doc, d.labelKarier, y);
    y += 7;
    paragraf(doc, d.tipe.karier.join("  ·  "), y);

    kaki(doc, d);
    return doc;
  }

  window.OwriteMbtiPdf = { buat: buat };
})();
