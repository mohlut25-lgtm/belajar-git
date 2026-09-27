/**
 * ==============================================================================
 * SISTEM LAPORAN KEUANGAN, TABUNGAN & BARANG TIDAK LAKU KANTIN
 * PONDOK PESANTREN MIFTAHUL ULUM KEBUN BARU
 * Backend Google Apps Script (kode.gs)
 * ==============================================================================
 */

// Konfigurasi Nama Sheet
const SHEET_KAS = "Kas_Operasional_Kantin";
const SHEET_TABUNGAN = "Tabungan_Harian_Kantin";
const SHEET_BARANG_RUSAK = "Barang_Tidak_Laku";

/**
 * Inisialisasi awal struktur Google Spreadsheet jika belum ada.
 * Jalankan fungsi ini sekali melalui menu Run -> setupSpreadsheet di editor Apps Script.
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheet Kas Operasional Kantin
  let kasSheet = ss.getSheetByName(SHEET_KAS);
  if (!kasSheet) {
    kasSheet = ss.insertSheet(SHEET_KAS);
    kasSheet.appendRow([
      "ID Transaksi",
      "Tanggal",
      "Jenis",
      "Kategori",
      "Keterangan",
      "Uang Masuk",
      "Uang Keluar",
      "Saldo Kas",
      "Waktu Catat"
    ]);
    kasSheet.getRange("A1:I1").setBackground("#104c38").setFontColor("#ffffff").setFontWeight("bold");
    kasSheet.setFrozenRows(1);
  }
  
  // 2. Setup Sheet Tabungan Harian Kantin
  let tabunganSheet = ss.getSheetByName(SHEET_TABUNGAN);
  if (!tabunganSheet) {
    tabunganSheet = ss.insertSheet(SHEET_TABUNGAN);
    tabunganSheet.appendRow([
      "ID Transaksi",
      "Tanggal",
      "Jenis Tabungan",
      "Keterangan / Keperluan",
      "Setor Tabungan (+)",
      "Tarik Tabungan (-)",
      "Saldo Tabungan",
      "Waktu Catat"
    ]);
    tabunganSheet.getRange("A1:H1").setBackground("#b45309").setFontColor("#ffffff").setFontWeight("bold");
    tabunganSheet.setFrozenRows(1);
  }

  // 3. Setup Sheet Barang Tidak Laku / Kadaluwarsa / Rusak
  let barangSheet = ss.getSheetByName(SHEET_BARANG_RUSAK);
  if (!barangSheet) {
    barangSheet = ss.insertSheet(SHEET_BARANG_RUSAK);
    barangSheet.appendRow([
      "ID Barang",
      "Tanggal Catat",
      "Nama Barang",
      "Kategori",
      "Jumlah (Qty)",
      "Harga Satuan",
      "Total Nilai (Rp)",
      "Alasan / Keterangan",
      "Tindakan / Status",
      "Waktu Catat"
    ]);
    barangSheet.getRange("A1:J1").setBackground("#991b1b").setFontColor("#ffffff").setFontWeight("bold");
    barangSheet.setFrozenRows(1);
  }
  
  Logger.log("✅ Setup Spreadsheet Pondok Pesantren Miftahul Ulum Kebun Baru selesai dengan sukses!");
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    setupSpreadsheet();
    const action = (e && e.parameter && e.parameter.action) || "getAllData";
    
    if (action === "ping") {
      return createJsonResponse({ status: "success", message: "Koneksi Google Apps Script Aktif!" });
    }
    
    if (action === "getAllData") {
      const data = fetchAllData();
      return createJsonResponse({ status: "success", data: data });
    }
    
    return createJsonResponse({ status: "error", message: "Action tidak dikenali: " + action });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    setupSpreadsheet();
    let body;
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      body = e.parameter;
    }
    
    const action = body.action;
    
    switch (action) {
      // 1. KAS OPERASIONAL KANTIN
      case "addKas":
        return createJsonResponse(handleTambahKas(body.data));
      case "deleteKas":
        return createJsonResponse(handleHapusKas(body.id));
        
      // 2. TABUNGAN HARIAN KANTIN
      case "addTabungan":
        return createJsonResponse(handleTambahTabungan(body.data));
      case "deleteTabungan":
        return createJsonResponse(handleHapusTabungan(body.id));

      // 3. BARANG TIDAK LAKU / KADALUWARSA
      case "addBarangTidakLaku":
        return createJsonResponse(handleTambahBarangTidakLaku(body.data));
      case "deleteBarangTidakLaku":
        return createJsonResponse(handleHapusBarangTidakLaku(body.id));
        
      // 4. SINKRONISASI BULK ALL
      case "syncAll":
        return createJsonResponse(handleSyncAll(body.data));
        
      default:
        return createJsonResponse({ status: "error", message: "Aksi POST tidak valid: " + action });
    }
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

// --------------------------------------------------------------------------
// HELPER & DATA HANDLERS
// --------------------------------------------------------------------------

function fetchAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Kas Operasional Kantin
  const kasSheet = ss.getSheetByName(SHEET_KAS);
  const kasData = getSheetRowsAsObjects(kasSheet, [
    "id", "tanggal", "jenis", "kategori", "keterangan", "masuk", "keluar", "saldo", "createdAt"
  ]);
  
  // Tabungan Harian Kantin
  const tabunganSheet = ss.getSheetByName(SHEET_TABUNGAN);
  const tabunganData = getSheetRowsAsObjects(tabunganSheet, [
    "id", "tanggal", "jenis", "keterangan", "setor", "tarik", "saldo", "createdAt"
  ]);

  // Barang Tidak Laku
  const barangSheet = ss.getSheetByName(SHEET_BARANG_RUSAK);
  const barangData = getSheetRowsAsObjects(barangSheet, [
    "id", "tanggal", "nama", "kategori", "qty", "harga", "total", "alasan", "tindakan", "createdAt"
  ]);
  
  return {
    kas: kasData,
    tabungan: tabunganData,
    barangTidakLaku: barangData
  };
}

function getSheetRowsAsObjects(sheet, headers) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  const values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map(row => {
    let obj = {};
    headers.forEach((h, idx) => {
      let val = row[idx];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      obj[h] = val;
    });
    return obj;
  });
}

function handleTambahKas(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_KAS);
  
  const id = item.id || "KAS-" + new Date().getTime();
  const masuk = Number(item.masuk || 0);
  const keluar = Number(item.keluar || 0);
  const timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    item.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    item.jenis || (masuk > 0 ? "masuk" : "keluar"),
    item.kategori || "Umum",
    item.keterangan || "-",
    masuk,
    keluar,
    Number(item.saldo || 0),
    timestamp
  ]);
  
  return { status: "success", message: "Transaksi Kas Kantin berhasil disimpan", id: id };
}

function handleHapusKas(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_KAS);
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    if (String(sheet.getRange(i, 1).getValue()) === String(id)) {
      sheet.deleteRow(i);
      return { status: "success", message: "Data Kas berhasil dihapus" };
    }
  }
  return { status: "error", message: "Data Kas tidak ditemukan" };
}

function handleTambahTabungan(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_TABUNGAN);
  
  const id = item.id || "TAB-" + new Date().getTime();
  const setor = Number(item.setor || 0);
  const tarik = Number(item.tarik || 0);
  const timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    item.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    item.jenis || (setor > 0 ? "setor" : "tarik"),
    item.keterangan || "-",
    setor,
    tarik,
    Number(item.saldo || 0),
    timestamp
  ]);
  
  return { status: "success", message: "Tabungan Harian Kantin berhasil dicatat", id: id };
}

function handleHapusTabungan(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_TABUNGAN);
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    if (String(sheet.getRange(i, 1).getValue()) === String(id)) {
      sheet.deleteRow(i);
      return { status: "success", message: "Data Tabungan Kantin berhasil dihapus" };
    }
  }
  return { status: "error", message: "Data Tabungan tidak ditemukan" };
}

function handleTambahBarangTidakLaku(item) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_BARANG_RUSAK);
  
  const id = item.id || "BTL-" + new Date().getTime();
  const qty = Number(item.qty || 0);
  const harga = Number(item.harga || 0);
  const total = Number(item.total || (qty * harga));
  const timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    item.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    item.nama || "-",
    item.kategori || "Umum",
    qty,
    harga,
    total,
    item.alasan || "-",
    item.tindakan || "Dimusnahkan",
    timestamp
  ]);
  
  return { status: "success", message: "Barang Tidak Laku berhasil dicatat", id: id };
}

function handleHapusBarangTidakLaku(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_BARANG_RUSAK);
  const lastRow = sheet.getLastRow();
  
  for (let i = 2; i <= lastRow; i++) {
    if (String(sheet.getRange(i, 1).getValue()) === String(id)) {
      sheet.deleteRow(i);
      return { status: "success", message: "Data Barang Tidak Laku berhasil dihapus" };
    }
  }
  return { status: "error", message: "Data Barang Tidak Laku tidak ditemukan" };
}

function handleSyncAll(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupSpreadsheet();
  
  if (data.kas && Array.isArray(data.kas)) {
    const kasSheet = ss.getSheetByName(SHEET_KAS);
    kasSheet.clear();
    kasSheet.appendRow(["ID Transaksi", "Tanggal", "Jenis", "Kategori", "Keterangan", "Uang Masuk", "Uang Keluar", "Saldo Kas", "Waktu Catat"]);
    kasSheet.getRange("A1:I1").setBackground("#104c38").setFontColor("#ffffff").setFontWeight("bold");
    data.kas.forEach(k => {
      kasSheet.appendRow([
        k.id, k.tanggal, k.jenis, k.kategori, k.keterangan, Number(k.masuk || 0), Number(k.keluar || 0), Number(k.saldo || 0), k.createdAt || new Date().toISOString()
      ]);
    });
  }
  
  if (data.tabungan && Array.isArray(data.tabungan)) {
    const tabunganSheet = ss.getSheetByName(SHEET_TABUNGAN);
    tabunganSheet.clear();
    tabunganSheet.appendRow(["ID Transaksi", "Tanggal", "Jenis Tabungan", "Keterangan / Keperluan", "Setor Tabungan (+)", "Tarik Tabungan (-)", "Saldo Tabungan", "Waktu Catat"]);
    tabunganSheet.getRange("A1:H1").setBackground("#b45309").setFontColor("#ffffff").setFontWeight("bold");
    data.tabungan.forEach(t => {
      tabunganSheet.appendRow([
        t.id, t.tanggal, t.jenis, t.keterangan, Number(t.setor || 0), Number(t.tarik || 0), Number(t.saldo || 0), t.createdAt || new Date().toISOString()
      ]);
    });
  }

  if (data.barangTidakLaku && Array.isArray(data.barangTidakLaku)) {
    const barangSheet = ss.getSheetByName(SHEET_BARANG_RUSAK);
    barangSheet.clear();
    barangSheet.appendRow(["ID Barang", "Tanggal Catat", "Nama Barang", "Kategori", "Jumlah (Qty)", "Harga Satuan", "Total Nilai (Rp)", "Alasan / Keterangan", "Tindakan / Status", "Waktu Catat"]);
    barangSheet.getRange("A1:J1").setBackground("#991b1b").setFontColor("#ffffff").setFontWeight("bold");
    data.barangTidakLaku.forEach(b => {
      barangSheet.appendRow([
        b.id, b.tanggal, b.nama, b.kategori, Number(b.qty || 0), Number(b.harga || 0), Number(b.total || 0), b.alasan, b.tindakan, b.createdAt || new Date().toISOString()
      ]);
    });
  }
  
  return { status: "success", message: "Sinkronisasi seluruh data ke Google Spreadsheet berhasil!" };
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
