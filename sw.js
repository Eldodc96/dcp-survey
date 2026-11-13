/* Pelayan luring DCP Survey.
   Kerangka aplikasi disimpan agar tetap terbuka tanpa sinyal.
   Ubin citra peta TIDAK diurus di sini; ubin disimpan aplikasi sendiri
   di IndexedDB lewat tombol "Unduh wilayah trase". */
var VERSI = "dcp-survey-v1";
var ISI = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(
    caches.open(VERSI).then(function (c) { return c.addAll(ISI); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (k) {
      return Promise.all(k.map(function (n) { return n === VERSI ? null : caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (ev) {
  var permintaan = ev.request;
  if (permintaan.method !== "GET") return;
  var alamat = new URL(permintaan.url);
  /* permintaan ke luar (ubin citra) dilewatkan apa adanya */
  if (alamat.origin !== location.origin) return;

  ev.respondWith(
    caches.match(permintaan).then(function (tersimpan) {
      var jaringan = fetch(permintaan).then(function (balasan) {
        if (balasan && balasan.ok) {
          var salinan = balasan.clone();
          caches.open(VERSI).then(function (c) { c.put(permintaan, salinan); });
        }
        return balasan;
      }).catch(function () { return tersimpan; });
      return tersimpan || jaringan;
    })
  );
});
