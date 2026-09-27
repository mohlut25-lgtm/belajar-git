/**
 * ==============================================================================
 * SISTEM LAPORAN KEUANGAN KANTIN & TABUNGAN SANTRI
 * Pondok Pesantren Miftahul Ulum Kebun Baru
 * Frontend JavaScript Application Logic
 * ==============================================================================
 */

// Storage Keys
const STORAGE_KAS = "ppmukb_kas_data";
const STORAGE_SANTRI = "ppmukb_santri_data";
const STORAGE_MUTASI = "ppmukb_mutasi_data";
const STORAGE_CONFIG = "ppmukb_config";

// Global App State
let appData = {
  kas: [],
  santri: [],
  mutasi: [],
  config: {
    gasUrl: ""
  }
};

// Demo initial dataset for Pondok Pesantren Miftahul Ulum Kebun Baru
const initialDemoData = {
  kas: [
    {
      id: "KAS-1710001",
      tanggal: getTodayDate(0),
      jenis: "masuk",
      kategori: "Penjualan Makanan",
      keterangan: "Hasil penjualan sarapan santri & minuman pagi",
      masuk: 450000,
      keluar: 0,
      saldo: 450000,
      createdAt: new Date().toISOString()
    },
    {
      id: "KAS-1710002",
      tanggal: getTodayDate(0),
      jenis: "keluar",
      kategori: "Belanja Bahan Baku",
      keterangan: "Kulakan beras, minyak goreng & telur ke pasar",
      masuk: 0,
      keluar: 275000,
      saldo: 175000,
      createdAt: new Date().toISOString()
    },
    {
      id: "KAS-1710003",
      tanggal: getTodayDate(0),
      jenis: "masuk",
      kategori: "Penjualan Alat Tulis",
      keterangan: "Penjualan kitab & buku tulis santri",
      masuk: 120000,
      keluar: 0,
      saldo: 295000,
      createdAt: new Date().toISOString()
    }
  ],
  santri: [
    {
      id: "SAN-101",
      nis: "2026001",
      nama: "Ahmad Fauzi",
      kamar: "Kamar Al-Ghazali 01",
      saldo: 150000,
      status: "Aktif",
      createdAt: new Date().toISOString()
    },
    {
      id: "SAN-102",
      nis: "2026002",
      nama: "Muhammad Ridwan",
      kamar: "Kamar Ibnu Sina 03",
      saldo: 225000,
      status: "Aktif",
      createdAt: new Date().toISOString()
    },
    {
      id: "SAN-103",
      nis: "2026003",
      nama: "Zainal Arifin",
      kamar: "Kamar As-Syafi'i 02",
      saldo: 80000,
      status: "Aktif",
      createdAt: new Date().toISOString()
    }
  ],
  mutasi: [
    {
      id: "MUT-1710001",
      santriId: "SAN-101",
      namaSantri: "Ahmad Fauzi",
      tanggal: getTodayDate(0),
      jenis: "setor",
      nominal: 200000,
      keterangan: "Setoran tabungan awal dari wali santri",
      saldoAkhir: 200000,
      createdAt: new Date().toISOString()
    },
    {
      id: "MUT-1710002",
      santriId: "SAN-101",
      namaSantri: "Ahmad Fauzi",
      tanggal: getTodayDate(0),
      jenis: "tarik",
      nominal: 50000,
      keterangan: "Belanja makan siang & kitab di kantin",
      saldoAkhir: 150000,
      createdAt: new Date().toISOString()
    }
  ]
};

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromStorage();
  initEventListeners();
  recalculateKasBalances();
  renderAll();

  // Set default dates for form inputs
  const today = getTodayDate();
  document.getElementById("kasTanggal").value = today;
  document.getElementById("tabunganTanggal").value = today;
  document.getElementById("filterKasMulai").value = getMonthStartDate();
  document.getElementById("filterKasSampai").value = today;
  document.getElementById("filterMutasiMulai").value = getMonthStartDate();
  document.getElementById("filterMutasiSampai").value = today;
});

function getTodayDate(offsetDays = 0) {
  const d = new Date();
  if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function getMonthStartDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function formatRupiah(number) {
  const val = Number(number) || 0;
  return "Rp " + val.toLocaleString("id-ID");
}

// ==============================================================================
// DATA PERSISTENCE & STORAGE
// ==============================================================================
function loadDataFromStorage() {
  const localKas = localStorage.getItem(STORAGE_KAS);
  const localSantri = localStorage.getItem(STORAGE_SANTRI);
  const localMutasi = localStorage.getItem(STORAGE_MUTASI);
  const localConfig = localStorage.getItem(STORAGE_CONFIG);

  if (localConfig) {
    try {
      appData.config = JSON.parse(localConfig);
      document.getElementById("gasUrlInput").value = appData.config.gasUrl || "";
    } catch (e) {
      console.error(e);
    }
  }

  if (localKas && localSantri) {
    try {
      appData.kas = JSON.parse(localKas);
      appData.santri = JSON.parse(localSantri);
      appData.mutasi = localMutasi ? JSON.parse(localMutasi) : [];
    } catch (e) {
      console.error(e);
      loadDemoData();
    }
  } else {
    loadDemoData();
  }

  updateConnectionStatusUI();
}

function loadDemoData() {
  appData.kas = JSON.parse(JSON.stringify(initialDemoData.kas));
  appData.santri = JSON.parse(JSON.stringify(initialDemoData.santri));
  appData.mutasi = JSON.parse(JSON.stringify(initialDemoData.mutasi));
  saveDataToStorage();
}

function saveDataToStorage() {
  localStorage.setItem(STORAGE_KAS, JSON.stringify(appData.kas));
  localStorage.setItem(STORAGE_SANTRI, JSON.stringify(appData.santri));
  localStorage.setItem(STORAGE_MUTASI, JSON.stringify(appData.mutasi));
  localStorage.setItem(STORAGE_CONFIG, JSON.stringify(appData.config));
}

// ==============================================================================
// CALCULATION LOGIC
// ==============================================================================
function recalculateKasBalances() {
  // Urutkan berdasarkan tanggal & createdAt
  appData.kas.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
  
  let runningBalance = 0;
  appData.kas.forEach(item => {
    const masuk = Number(item.masuk || 0);
    const keluar = Number(item.keluar || 0);
    runningBalance += (masuk - keluar);
    item.saldo = runningBalance;
  });
  saveDataToStorage();
}

// ==============================================================================
// UI RENDERING
// ==============================================================================
function renderAll() {
  renderSummaryStats();
  renderKasTable();
  renderSantriTable();
  renderSantriSelectOptions();
  renderMutasiTable();
}

function renderSummaryStats() {
  let totalMasuk = 0;
  let totalKeluar = 0;
  
  appData.kas.forEach(item => {
    totalMasuk += Number(item.masuk || 0);
    totalKeluar += Number(item.keluar || 0);
  });
  
  const saldoKantin = totalMasuk - totalKeluar;
  
  let totalTabungan = 0;
  appData.santri.forEach(s => {
    totalTabungan += Number(s.saldo || 0);
  });

  document.getElementById("statSaldoKantin").textContent = formatRupiah(saldoKantin);
  document.getElementById("statTotalMasuk").textContent = formatRupiah(totalMasuk);
  document.getElementById("statTotalKeluar").textContent = formatRupiah(totalKeluar);
  document.getElementById("statTotalTabungan").textContent = formatRupiah(totalTabungan);

  // Widget preview di dashboard
  document.getElementById("dashTotalSantri").textContent = `${appData.santri.length} Santri`;
  document.getElementById("dashTotalTransKas").textContent = `${appData.kas.length} Transaksi`;
}

function renderKasTable() {
  const tbody = document.getElementById("kasTableBody");
  const search = (document.getElementById("searchKas").value || "").toLowerCase();
  const startDate = document.getElementById("filterKasMulai").value;
  const endDate = document.getElementById("filterKasSampai").value;
  const kategori = document.getElementById("filterKasKategori").value;

  tbody.innerHTML = "";

  const filtered = appData.kas.filter(item => {
    const matchSearch = item.keterangan.toLowerCase().includes(search) || 
                        item.kategori.toLowerCase().includes(search) ||
                        item.id.toLowerCase().includes(search);
    const matchDate = (!startDate || item.tanggal >= startDate) && (!endDate || item.tanggal <= endDate);
    const matchKategori = !kategori || item.kategori === kategori;
    return matchSearch && matchDate && matchKategori;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Tidak ada transaksi kas yang sesuai kriteria.</td></tr>`;
    return;
  }

  // Tampilkan data (terbaru di atas)
  const displayList = [...filtered].reverse();

  displayList.forEach((item, index) => {
    const tr = document.createElement("tr");
    const isMasuk = Number(item.masuk || 0) > 0;
    
    tr.innerHTML = `
      <td><strong>${item.tanggal}</strong><br><small style="color:var(--text-muted)">${item.id}</small></td>
      <td><span class="badge badge-kategori">${item.kategori}</span></td>
      <td>${item.keterangan}</td>
      <td style="color: var(--success); font-weight: 600;">${item.masuk > 0 ? formatRupiah(item.masuk) : "-"}</td>
      <td style="color: var(--danger); font-weight: 600;">${item.keluar > 0 ? formatRupiah(item.keluar) : "-"}</td>
      <td style="font-weight: 700; color: var(--primary);">${formatRupiah(item.saldo)}</td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn btn-outline btn-sm" onclick="printReceipt('kas', '${item.id}')" title="Cetak Bukti Transaksi">🖨️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteKas('${item.id}')" title="Hapus Transaksi">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSantriTable() {
  const tbody = document.getElementById("santriTableBody");
  const search = (document.getElementById("searchSantri").value || "").toLowerCase();

  tbody.innerHTML = "";

  const filtered = appData.santri.filter(s => {
    return s.nama.toLowerCase().includes(search) || 
           s.nis.toLowerCase().includes(search) || 
           s.kamar.toLowerCase().includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">Data santri tidak ditemukan.</td></tr>`;
    return;
  }

  filtered.forEach(santri => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${santri.nis}</strong></td>
      <td><span style="font-weight:600; color:var(--primary);">${santri.nama}</span></td>
      <td>${santri.kamar}</td>
      <td style="font-weight: 700; color: var(--success); font-size: 0.95rem;">${formatRupiah(santri.saldo)}</td>
      <td><span class="badge ${santri.status === 'Aktif' ? 'badge-masuk' : 'badge-keluar'}">${santri.status}</span></td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button class="btn btn-success btn-sm" onclick="openModalTabunganQuick('${santri.id}', 'setor')" title="Setor Saldo">➕ Setor</button>
          <button class="btn btn-primary btn-sm" onclick="openModalTabunganQuick('${santri.id}', 'tarik')" title="Tarik / Belanja Kantin">🛒 Belanja</button>
          <button class="btn btn-outline btn-sm" onclick="viewRiwayatSantri('${santri.id}')" title="Lihat Mutasi Santri">📜 Mutasi</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSantri('${santri.id}')" title="Hapus Santri">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSantriSelectOptions() {
  const select = document.getElementById("tabunganSantriSelect");
  select.innerHTML = `<option value="">-- Pilih Santri --</option>`;
  
  appData.santri.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.nama} (${s.nis}) - [Saldo: ${formatRupiah(s.saldo)}]`;
    select.appendChild(opt);
  });
}

function renderMutasiTable() {
  const tbody = document.getElementById("mutasiTableBody");
  const santriFilter = document.getElementById("filterMutasiSantri") ? document.getElementById("filterMutasiSantri").value : "";
  const startDate = document.getElementById("filterMutasiMulai").value;
  const endDate = document.getElementById("filterMutasiSampai").value;

  tbody.innerHTML = "";

  const filtered = appData.mutasi.filter(item => {
    const matchSantri = !santriFilter || item.santriId === santriFilter;
    const matchDate = (!startDate || item.tanggal >= startDate) && (!endDate || item.tanggal <= endDate);
    return matchSantri && matchDate;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Belum ada riwayat mutasi tabungan santri.</td></tr>`;
    return;
  }

  const displayList = [...filtered].reverse();

  displayList.forEach(item => {
    const tr = document.createElement("tr");
    const isSetor = item.jenis === "setor";
    
    tr.innerHTML = `
      <td><strong>${item.tanggal}</strong><br><small style="color:var(--text-muted)">${item.id}</small></td>
      <td><strong>${item.namaSantri}</strong></td>
      <td><span class="badge ${isSetor ? 'badge-masuk' : 'badge-keluar'}">${isSetor ? 'Setoran Tabungan' : 'Tarik / Belanja Kantin'}</span></td>
      <td style="font-weight: 600; color: ${isSetor ? 'var(--success)' : 'var(--danger)'}">
        ${isSetor ? '+' : '-'} ${formatRupiah(item.nominal)}
      </td>
      <td>${item.keterangan}</td>
      <td style="font-weight: 700; color: var(--primary);">${formatRupiah(item.saldoAkhir)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="printReceipt('tabungan', '${item.id}')" title="Cetak Struk Transaksi">🖨️ Struk</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==============================================================================
// MODAL & FORM HANDLERS
// ==============================================================================
function initEventListeners() {
  // Tab Navigation
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Realtime search & filter listeners
  document.getElementById("searchKas").addEventListener("input", renderKasTable);
  document.getElementById("filterKasMulai").addEventListener("change", renderKasTable);
  document.getElementById("filterKasSampai").addEventListener("change", renderKasTable);
  document.getElementById("filterKasKategori").addEventListener("change", renderKasTable);
  document.getElementById("searchSantri").addEventListener("input", renderSantriTable);
  document.getElementById("filterMutasiMulai").addEventListener("change", renderMutasiTable);
  document.getElementById("filterMutasiSampai").addEventListener("change", renderMutasiTable);

  // Form submit: Kas
  document.getElementById("formKas").addEventListener("submit", handleSaveKas);

  // Form submit: Santri
  document.getElementById("formSantri").addEventListener("submit", handleSaveSantri);

  // Form submit: Tabungan
  document.getElementById("formTabungan").addEventListener("submit", handleSaveTabungan);

  // Update dynamic label on kas type change
  document.querySelectorAll("input[name='kasJenis']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      const isMasuk = e.target.value === "masuk";
      document.getElementById("kasNominalLabel").textContent = isMasuk ? "Nominal Uang Masuk (Rp)" : "Nominal Uang Keluar (Rp)";
      populateKasKategoriOptions(isMasuk);
    });
  });
}

function populateKasKategoriOptions(isMasuk) {
  const select = document.getElementById("kasKategori");
  select.innerHTML = "";
  
  const kategoriMasuk = ["Penjualan Makanan", "Penjualan Minuman", "Penjualan Alat Tulis / Kitab", "Kebutuhan Harian Santri", "Infaq / Donasi Kantin", "Lain-lain"];
  const kategoriKeluar = ["Belanja Bahan Baku", "Belanja Snack & Minuman", "Gaji Karyawan Kantin", "Operasional & Kebersihan", "Listrik / Air", "Lain-lain"];
  
  const list = isMasuk ? kategoriMasuk : kategoriKeluar;
  list.forEach(k => {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    select.appendChild(opt);
  });
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// ------------------------------------------------------------------------------
// TRANSAKSI KAS KANTIN
// ------------------------------------------------------------------------------
function openModalTambahKas() {
  document.getElementById("formKas").reset();
  document.getElementById("kasTanggal").value = getTodayDate();
  document.getElementById("kasJenisMasuk").checked = true;
  document.getElementById("kasNominalLabel").textContent = "Nominal Uang Masuk (Rp)";
  populateKasKategoriOptions(true);
  openModal("modalKas");
}

async function handleSaveKas(e) {
  e.preventDefault();
  
  const tanggal = document.getElementById("kasTanggal").value;
  const jenis = document.querySelector("input[name='kasJenis']:checked").value;
  const nominal = Number(document.getElementById("kasNominal").value);
  const kategori = document.getElementById("kasKategori").value;
  const keterangan = document.getElementById("kasKeterangan").value;

  if (nominal <= 0) {
    showToast("Nominal uang harus lebih dari 0", "error");
    return;
  }

  const id = "KAS-" + Date.now().toString().slice(-6);
  const item = {
    id: id,
    tanggal: tanggal,
    jenis: jenis,
    kategori: kategori,
    keterangan: keterangan,
    masuk: jenis === "masuk" ? nominal : 0,
    keluar: jenis === "keluar" ? nominal : 0,
    saldo: 0,
    createdAt: new Date().toISOString()
  };

  appData.kas.push(item);
  recalculateKasBalances();
  renderAll();
  closeModal("modalKas");
  showToast("Transaksi kas berhasil disimpan!", "success");

  // Sync to GAS if URL provided
  if (appData.config.gasUrl) {
    await sendGasRequest("addKas", item);
  }
}

async function deleteKas(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus transaksi kas ini?")) return;
  
  appData.kas = appData.kas.filter(k => k.id !== id);
  recalculateKasBalances();
  renderAll();
  showToast("Data kas berhasil dihapus", "info");

  if (appData.config.gasUrl) {
    await sendGasRequest("deleteKas", null, id);
  }
}

// ------------------------------------------------------------------------------
// DATA SANTRI
// ------------------------------------------------------------------------------
function openModalTambahSantri() {
  document.getElementById("formSantri").reset();
  openModal("modalSantri");
}

async function handleSaveSantri(e) {
  e.preventDefault();
  
  const nis = document.getElementById("santriNis").value.trim();
  const nama = document.getElementById("santriNama").value.trim();
  const kamar = document.getElementById("santriKamar").value.trim();
  const saldoAwal = Number(document.getElementById("santriSaldoAwal").value || 0);

  // Check duplicate NIS
  if (appData.santri.some(s => s.nis === nis)) {
    showToast("NIS sudah terdaftar untuk santri lain!", "error");
    return;
  }

  const santriId = "SAN-" + (appData.santri.length + 101);
  const newSantri = {
    id: santriId,
    nis: nis,
    nama: nama,
    kamar: kamar,
    saldo: saldoAwal,
    status: "Aktif",
    createdAt: new Date().toISOString()
  };

  appData.santri.push(newSantri);

  // Jika ada saldo awal, catat di mutasi
  if (saldoAwal > 0) {
    const mutasiId = "MUT-" + Date.now().toString().slice(-6);
    appData.mutasi.push({
      id: mutasiId,
      santriId: santriId,
      namaSantri: nama,
      tanggal: getTodayDate(),
      jenis: "setor",
      nominal: saldoAwal,
      keterangan: "Saldo awal pembukaan tabungan",
      saldoAkhir: saldoAwal,
      createdAt: new Date().toISOString()
    });
  }

  saveDataToStorage();
  renderAll();
  closeModal("modalSantri");
  showToast(`Santri ${nama} berhasil didaftarkan!`, "success");

  if (appData.config.gasUrl) {
    await sendGasRequest("addSantri", newSantri);
  }
}

async function deleteSantri(id) {
  const santri = appData.santri.find(s => s.id === id);
  if (!confirm(`Hapus data santri ${santri ? santri.nama : ''}? Seluruh riwayat akan dihapus.`)) return;

  appData.santri = appData.santri.filter(s => s.id !== id);
  appData.mutasi = appData.mutasi.filter(m => m.santriId !== id);
  saveDataToStorage();
  renderAll();
  showToast("Data santri telah dihapus", "info");

  if (appData.config.gasUrl) {
    await sendGasRequest("deleteSantri", null, id);
  }
}

// ------------------------------------------------------------------------------
// TRANSAKSI TABUNGAN (SETOR / TARIK / BELANJA)
// ------------------------------------------------------------------------------
function openModalTabungan() {
  document.getElementById("formTabungan").reset();
  document.getElementById("tabunganTanggal").value = getTodayDate();
  document.getElementById("tabJenisSetor").checked = true;
  document.getElementById("infoSaldoSantriSaatIni").textContent = "Pilih santri terlebih dahulu";
  openModal("modalTabungan");
}

function openModalTabunganQuick(santriId, jenis) {
  openModalTabungan();
  document.getElementById("tabunganSantriSelect").value = santriId;
  if (jenis === "tarik") {
    document.getElementById("tabJenisTarik").checked = true;
    document.getElementById("tabunganKeterangan").value = "Belanja di Kantin Santri";
  } else {
    document.getElementById("tabJenisSetor").checked = true;
    document.getElementById("tabunganKeterangan").value = "Setoran Tabungan Santri";
  }
  updateSantriSaldoInfo();
}

function updateSantriSaldoInfo() {
  const santriId = document.getElementById("tabunganSantriSelect").value;
  const santri = appData.santri.find(s => s.id === santriId);
  const infoEl = document.getElementById("infoSaldoSantriSaatIni");
  if (santri) {
    infoEl.innerHTML = `Saldo Sekarang: <strong style="color:var(--primary); font-size:1.05rem;">${formatRupiah(santri.saldo)}</strong> (${santri.kamar})`;
  } else {
    infoEl.textContent = "Pilih santri terlebih dahulu";
  }
}

async function handleSaveTabungan(e) {
  e.preventDefault();

  const santriId = document.getElementById("tabunganSantriSelect").value;
  const tanggal = document.getElementById("tabunganTanggal").value;
  const jenis = document.querySelector("input[name='tabunganJenis']:checked").value;
  const nominal = Number(document.getElementById("tabunganNominal").value);
  let keterangan = document.getElementById("tabunganKeterangan").value.trim();

  if (!santriId) {
    showToast("Silakan pilih santri terlebih dahulu", "error");
    return;
  }
  if (nominal <= 0) {
    showToast("Nominal transaksi harus lebih dari 0", "error");
    return;
  }

  const santri = appData.santri.find(s => s.id === santriId);
  if (!santri) return;

  if (jenis === "tarik" && santri.saldo < nominal) {
    showToast(`Saldo santri (${formatRupiah(santri.saldo)}) tidak mencukupi untuk penarikan ${formatRupiah(nominal)}!`, "error");
    return;
  }

  if (!keterangan) {
    keterangan = jenis === "setor" ? "Setor Tabungan" : "Belanja di Kantin";
  }

  // Update Saldo
  if (jenis === "setor") {
    santri.saldo += nominal;
  } else {
    santri.saldo -= nominal;
  }

  const mutasiId = "MUT-" + Date.now().toString().slice(-6);
  const mutasiItem = {
    id: mutasiId,
    santriId: santri.id,
    namaSantri: santri.nama,
    tanggal: tanggal,
    jenis: jenis,
    nominal: nominal,
    keterangan: keterangan,
    saldoAkhir: santri.saldo,
    createdAt: new Date().toISOString()
  };

  appData.mutasi.push(mutasiItem);
  saveDataToStorage();
  renderAll();
  closeModal("modalTabungan");
  showToast(`Transaksi tabungan ${santri.nama} berhasil!`, "success");

  // Tawari cetak struk
  setTimeout(() => {
    printReceipt('tabungan', mutasiId);
  }, 400);

  if (appData.config.gasUrl) {
    await sendGasRequest("transaksiTabungan", mutasiItem);
  }
}

function viewRiwayatSantri(santriId) {
  // Pindah ke tab mutasi & pasang filter
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  
  const tabMutasiBtn = document.querySelector(".tab-btn[data-tab='tab-mutasi']");
  if (tabMutasiBtn) tabMutasiBtn.classList.add("active");
  document.getElementById("tab-mutasi").classList.add("active");

  if (document.getElementById("filterMutasiSantri")) {
    document.getElementById("filterMutasiSantri").value = santriId;
  }
  renderMutasiTable();
}

// ==============================================================================
// CETAK STRUK & LAPORAN
// ==============================================================================
function printReceipt(type, id) {
  const modal = document.getElementById("modalReceipt");
  const content = document.getElementById("receiptContent");

  if (type === "tabungan") {
    const item = appData.mutasi.find(m => m.id === id);
    if (!item) return;

    const santri = appData.santri.find(s => s.id === item.santriId);

    content.innerHTML = `
      <div class="receipt-card" id="printArea">
        <div class="receipt-header">
          <h4>PONDOK PESANTREN MIFTAHUL ULUM</h4>
          <p style="font-size:0.8rem;">KEBUN BARU - KANTIN SANTRI</p>
          <p style="font-size:0.75rem; color:#64748b;">BUKTI TRANSAKSI TABUNGAN</p>
        </div>
        <div class="receipt-row"><span>No. Bukti</span><span>${item.id}</span></div>
        <div class="receipt-row"><span>Tanggal</span><span>${item.tanggal}</span></div>
        <div class="receipt-row"><span>NIS Santri</span><span>${santri ? santri.nis : '-'}</span></div>
        <div class="receipt-row"><span>Nama Santri</span><strong>${item.namaSantri}</strong></div>
        <div class="receipt-row"><span>Kamar / Kelas</span><span>${santri ? santri.kamar : '-'}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Jenis Transaksi</span><strong style="text-transform:uppercase;">${item.jenis === 'setor' ? 'SETORAN' : 'TARIK / BELANJA'}</strong></div>
        <div class="receipt-row"><span>Keterangan</span><span>${item.keterangan}</span></div>
        <div class="receipt-row" style="font-size:1.05rem; margin-top:0.4rem;">
          <span>Nominal</span><strong>${formatRupiah(item.nominal)}</strong>
        </div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Sisa Saldo Tabungan</span><strong>${formatRupiah(item.saldoAkhir)}</strong></div>
        <div class="receipt-divider"></div>
        <p style="text-align:center; font-size:0.72rem; color:#64748b; margin-top:0.8rem;">
          Simpan struk ini sebagai bukti transaksi resmi.<br>
          <em>Jazaakumullahu Khairan Katsiran</em>
        </p>
      </div>
    `;
  } else if (type === "kas") {
    const item = appData.kas.find(k => k.id === id);
    if (!item) return;

    content.innerHTML = `
      <div class="receipt-card" id="printArea">
        <div class="receipt-header">
          <h4>PONDOK PESANTREN MIFTAHUL ULUM</h4>
          <p style="font-size:0.8rem;">KEBUN BARU - KAS KANTIN</p>
          <p style="font-size:0.75rem; color:#64748b;">BUKTI KAS MASUK / KELUAR</p>
        </div>
        <div class="receipt-row"><span>No. Ref</span><span>${item.id}</span></div>
        <div class="receipt-row"><span>Tanggal</span><span>${item.tanggal}</span></div>
        <div class="receipt-row"><span>Kategori</span><span>${item.kategori}</span></div>
        <div class="receipt-row"><span>Keterangan</span><span>${item.keterangan}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Uang Masuk</span><span>${formatRupiah(item.masuk)}</span></div>
        <div class="receipt-row"><span>Uang Keluar</span><span>${formatRupiah(item.keluar)}</span></div>
        <div class="receipt-divider"></div>
        <div class="receipt-row"><span>Posisi Saldo Kas</span><strong>${formatRupiah(item.saldo)}</strong></div>
      </div>
    `;
  }

  openModal("modalReceipt");
}

function doDirectPrint() {
  window.print();
}

function exportKasCSV() {
  if (appData.kas.length === 0) {
    showToast("Belum ada data kas untuk diekspor", "info");
    return;
  }
  
  let csv = "ID Transaksi,Tanggal,Kategori,Keterangan,Uang Masuk,Uang Keluar,Saldo Kumulatif\n";
  appData.kas.forEach(k => {
    csv += `"${k.id}","${k.tanggal}","${k.kategori}","${k.keterangan.replace(/"/g, '""')}",${k.masuk},${k.keluar},${k.saldo}\n`;
  });

  downloadFile(csv, `Laporan_Kas_Kantin_PPMU_Kebun_Baru_${getTodayDate()}.csv`, "text/csv;charset=utf-8;");
}

function exportSantriCSV() {
  if (appData.santri.length === 0) {
    showToast("Belum ada data santri untuk diekspor", "info");
    return;
  }

  let csv = "ID Santri,NIS,Nama Lengkap,Kamar / Kelas,Saldo Tabungan,Status\n";
  appData.santri.forEach(s => {
    csv += `"${s.id}","${s.nis}","${s.nama.replace(/"/g, '""')}","${s.kamar.replace(/"/g, '""')}",${s.saldo},"${s.status}"\n`;
  });

  downloadFile(csv, `Data_Tabungan_Santri_PPMU_Kebun_Baru_${getTodayDate()}.csv`, "text/csv;charset=utf-8;");
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Berkas berhasil diunduh!", "success");
}

// ==============================================================================
// GOOGLE APPS SCRIPT INTEGRATION (kode.gs API)
// ==============================================================================
function saveGasConfig() {
  const url = document.getElementById("gasUrlInput").value.trim();
  appData.config.gasUrl = url;
  saveDataToStorage();
  updateConnectionStatusUI();
  showToast("URL Google Apps Script berhasil disimpan!", "success");
}

function updateConnectionStatusUI() {
  const badge = document.getElementById("headerGasStatus");
  const indicator = document.getElementById("statusIndicator");
  const text = document.getElementById("statusText");

  if (appData.config.gasUrl) {
    indicator.className = "status-indicator online";
    text.textContent = "Google Sheets Terhubung";
  } else {
    indicator.className = "status-indicator offline";
    text.textContent = "Mode Offline / Lokal";
  }
}

async function testGasConnection() {
  if (!appData.config.gasUrl) {
    showToast("Silakan masukkan URL Web App Google Apps Script terlebih dahulu", "error");
    return;
  }

  showToast("Menguji koneksi ke Google Apps Script...", "info");
  try {
    const res = await fetch(`${appData.config.gasUrl}?action=ping`);
    const data = await res.json();
    if (data.status === "success") {
      showToast("✅ " + data.message, "success");
    } else {
      showToast("Respons error dari server: " + data.message, "error");
    }
  } catch (err) {
    showToast("Gagal terhubung ke Google Apps Script. Pastikan Web App dideploy dengan akses 'Anyone'.", "error");
    console.error(err);
  }
}

async function syncAllToGoogleSheet() {
  if (!appData.config.gasUrl) {
    showToast("URL Google Apps Script belum dikonfigurasi!", "error");
    return;
  }

  if (!confirm("Sinkronkan seluruh data lokal saat ini ke Google Spreadsheet?")) return;

  showToast("Sedang menyinkronkan seluruh data ke Google Spreadsheet...", "info");
  try {
    const payload = {
      action: "syncAll",
      data: {
        kas: appData.kas,
        santri: appData.santri,
        mutasi: appData.mutasi
      }
    };

    const res = await fetch(appData.config.gasUrl, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.status === "success") {
      showToast("✅ " + result.message, "success");
    } else {
      showToast("Error: " + result.message, "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Gagal menyinkronkan ke Google Sheet. Periksa koneksi internet.", "error");
  }
}

async function fetchAllFromGoogleSheet() {
  if (!appData.config.gasUrl) {
    showToast("URL Google Apps Script belum dikonfigurasi!", "error");
    return;
  }

  if (!confirm("Tarik data dari Google Spreadsheet? Data di peramban ini akan diperbarui sesuai Google Spreadsheet.")) return;

  showToast("Mengambil data dari Google Spreadsheet...", "info");
  try {
    const res = await fetch(`${appData.config.gasUrl}?action=getAllData`);
    const json = await res.json();
    if (json.status === "success" && json.data) {
      if (json.data.kas && json.data.kas.length > 0) appData.kas = json.data.kas;
      if (json.data.santri && json.data.santri.length > 0) appData.santri = json.data.santri;
      if (json.data.mutasi && json.data.mutasi.length > 0) appData.mutasi = json.data.mutasi;
      recalculateKasBalances();
      renderAll();
      showToast("✅ Data berhasil diperbarui dari Google Spreadsheet!", "success");
    } else {
      showToast("Data di Spreadsheet masih kosong atau format tidak sesuai.", "info");
    }
  } catch (err) {
    console.error(err);
    showToast("Gagal mengambil data dari Google Sheet.", "error");
  }
}

async function sendGasRequest(action, data = null, id = null) {
  try {
    const payload = { action, data, id };
    await fetch(appData.config.gasUrl, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn("GAS Background Sync warning:", e);
  }
}

// ==============================================================================
// TOAST NOTIFICATION UTILITY
// ==============================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

