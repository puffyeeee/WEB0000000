/* =============================================================================
   PFO CRM Lite - Unified Backend (日本語ラベル行 / 会計レポート / 同期対応 版)
   ========================================================================== */

// === シート名（統合版） ===
const SHEET_NAMES = {
  CUSTOMERS: 'お客様カルテ',
  PETS: 'ご愛犬カルテ',
  SERVICES: '登録(施術メニュー)',
  VISITS: '来店記録',     
  ORDER_ITEMS: '明細',    
  STAFF: '担当者',
  PAYMENTS: '登録(支払い方法)',
  STORES: '店舗',
  CHANGEBOARD: '変更/申請',
  IMAGES: '撮影データ',
  PET_JOURNAL: 'ご愛犬施術記録',
  RESERVATIONS: '予約',
  STAFF_NOTES: 'スタッフ連絡',
  // ★ 追加（会員・前受金）
  MEMBERS: 'STORES会員一覧',
  PREPAID: '前受金台帳',
  ACCOUNTING: '会計',
  MERCH: '物販マスタ',
  INVENTORY: '在庫管理',
  PURCHASE_ORDERS: '発注管理',
  EVENTS: 'イベント管理'
};

const RESERVATION_HEADERS = ['ReservationID','CustomerID','PetID','ServiceID','Staff','Date','Start','End','Title','Notes','CreatedAt','StoreID','ReminderEnabled'];

// === 日本語ラベル（ヘッダ1行目の英語キー直下に表示） ===
const JP_LABELS = {
  [SHEET_NAMES.CUSTOMERS]: {
    CustomerID:'顧客ID', StoreID:'店舗ID', Name:'氏名', Kana:'フリガナ', Gender:'性別', Phone:'電話', Email:'メール',
    Zip:'郵便番号', Pref:'都道府県', Addr1:'住所1', Addr2:'住所2',
    ContactPolicy:'連絡方針', LineUserID:'LINEユーザーID', LineDisplayName:'LINE表示名', LineLinkedAt:'LINE連携日時',
    LineOptIn:'LINE通知同意', Tags:'タグ', AllergyNotes:'アレルギー', NGStaff:'NG担当者',
    ProfilePhotoURL:'プロフィール写真URL', MemoPinned:'メモピン留め', MemoDue:'メモ期限', Notes:'メモ',
    CreatedAt:'作成日時', UpdatedAt:'更新日時'
  },
  [SHEET_NAMES.PETS]: {
    DogName:'お名前(ご愛犬)', Kana:'フリガナ(ご愛犬)',PetID:'ID(ご愛犬)', Name:'お名前(お客様)', CustomerID:'お客様ID', StoreID:'店舗ID', Species:'ご愛犬/ご愛猫',
    Breed:'犬種', Sex:'性別', DOB:'ご愛犬の生年月日', WeightKg:'体重(kg)', Color:'毛色', Hospital:'かかりつけの病院',
    NeuterStatus:'避妊/去勢', NeuterDate:'手術日', RabiesDate:'狂犬病ワクチン接種日', Condition:'持病', OnsetDate:'発症日', Treatment:'治療',
    Allergy:'アレルギー',Diet:'普段食べているフード',Personality:'性格', Tags:'タグ', MemoPinned:'メモピン留め', MemoDue:'メモ期限',
    Supplements:'サプリメント', Snacks:'おやつ/ご褒美', PersonalityTags:'性格タグ',
    FacePhotoURL:'顔写真URL', BodyPhotoURL:'全身写真URL',ProfilePhotoURL:'お気に入り写真URL',
    Notes:'メモ', CreatedAt:'作成日時', UpdatedAt:'更新日時'
  },
  [SHEET_NAMES.SERVICES]: {
    ServiceID:'サービスID', Name:'名称', Category:'カテゴリ', DurationMin:'所要(分)',
    Price:'価格(税抜)', TaxRate:'税率', EffectiveFrom:'適用開始', EffectiveTo:'適用終了', Active:'有効'
  },
  [SHEET_NAMES.VISITS]: {
    OrderID:'会計ID', StoreID:'店舗ID', VisitDate:'来店日', CustomerID:'顧客ID', PetID:'ペットID',
    PaymentMethod:'支払方法', Staff:'担当', Channel:'経路', Notes:'備考',
    Subtotal:'小計(税抜)', Tax:'消費税', Total:'合計(税込)',
    PrepaidUsed:'前受金消化', CashPortion:'現金入金', ARPortion:'未収入金', CreatedAt:'作成日時'
  },
  [SHEET_NAMES.ORDER_ITEMS]: {
    OrderItemID:'明細ID', OrderID:'会計ID', StoreID:'店舗ID', ServiceID:'サービスID', ServiceName:'サービス名',
    Category:'カテゴリ', Quantity:'数量', UnitPrice:'単価(税抜)', TaxRate:'税率',
    LineSubtotal:'小計(税抜)', LineTax:'消費税', LineTotal:'合計(税込)'
  },
  [SHEET_NAMES.STAFF]: {
    StaffID:'担当者ID', Name:'氏名', Role:'役割', Active:'有効'
  },
  [SHEET_NAMES.PAYMENTS]: {
    PaymentCode:'コード', Name:'名称', FeeRate:'手数料率', PayoutDay:'入金日', Type:'種別', Active:'有効'
  },
  [SHEET_NAMES.STORES]: {
    StoreID:'店舗ID', Name:'店舗名', Type:'種別', Color:'テーマカラー', Description:'説明', Sort:'表示順', Active:'有効'
  },
  [SHEET_NAMES.CHANGEBOARD]: {
    TicketID:'チケットID', Datetime:'日時', Author:'申請者', Category:'カテゴリ', Title:'件名',
    Description:'内容', Impact:'影響', RelatedID:'関連ID', Assignee:'担当者', Status:'状態',
    Due:'期限', ApprovedBy:'承認者', EffectiveFrom:'適用開始'
  },
  [SHEET_NAMES.IMAGES]: {
    ImageID:'画像ID', VisitID:'会計ID', PetID:'ペットID', BodyPartCode:'部位コード',
    Symptom:'症状', ImageURL:'画像URL', ShotAt:'撮影日', Note:'備考', CreatedAt:'作成日時'
  },
  [SHEET_NAMES.PET_JOURNAL]: {
    EntryID:'記録ID', PetID:'ご愛犬ID', VisitID:'会計ID', PerformedAt:'施術日', Staff:'担当', Title:'タイトル',
    Summary:'内容', PhotoURL:'写真URL', Tags:'タグ', CreatedAt:'作成日時', UpdatedAt:'更新日時'
  },
  [SHEET_NAMES.RESERVATIONS]: {
    ReservationID:'予約ID', CustomerID:'顧客ID', PetID:'ペットID', ServiceID:'サービスID',
    Staff:'担当', Date:'日付', Start:'開始', End:'終了', Title:'件名', Notes:'備考',
    CreatedAt:'作成日時', StoreID:'店舗ID', ReminderEnabled:'リマインド送付'
  },
  [SHEET_NAMES.STAFF_NOTES]: {
    NoteID:'ID', Category:'カテゴリ', Title:'タイトル', Audience:'配信先', Pinned:'ピン留め', Body:'本文', CreatedAt:'作成日時'
  },
  [SHEET_NAMES.MEMBERS]: {
    MemberID:'会員ID', CustomerID:'顧客ID', PlanName:'プラン名', MonthlyFee:'月額(税抜)',
    StartDate:'開始日', EndDate:'終了日', Active:'有効', LastChargedMonth:'最終計上月'
  },
  [SHEET_NAMES.PREPAID]: {
    EntryID:'エントリID', CustomerID:'顧客ID', PetID:'ペットID', Type:'種類',
    Amount:'金額', Date:'日付', RelatedID:'関連ID', Memo:'メモ', CreatedAt:'作成日時'
  },
  [SHEET_NAMES.MERCH]: {
    ProductID:'商品ID', SKU:'SKU', Name:'商品名', Category:'カテゴリ', Price:'価格(税抜)', TaxRate:'税率',
    Unit:'単位', StoreID:'店舗ID', Active:'有効', Description:'説明', ReorderPoint:'警戒在庫'
  },
  [SHEET_NAMES.INVENTORY]: {
    EntryID:'在庫ID', ProductID:'商品ID', StoreID:'店舗ID', OnHand:'在庫数', SafetyStock:'安全在庫',
    UpdatedAt:'更新日', Memo:'メモ'
  },
  [SHEET_NAMES.PURCHASE_ORDERS]: {
    OrderID:'発注ID', ProductID:'商品ID', StoreID:'店舗ID', Quantity:'数量', UnitPrice:'発注単価',
    Status:'状態', OrderedAt:'発注日', ExpectedAt:'入荷予定日', Vendor:'仕入先', Memo:'メモ'
  },
  [SHEET_NAMES.EVENTS]: {
    EventID:'イベントID', Title:'タイトル', StartDate:'開始日', EndDate:'終了日', StartTime:'開始時刻', EndTime:'終了時刻',
    Location:'場所', Capacity:'定員', Staff:'担当スタッフ', StoreID:'店舗ID', Status:'状態', Description:'説明'
   }
  };

// === 同期（フォーム更新用） ===
const SYNC_CONF = {
  PROP_REV: 'SYNC_REV',         // 整数カウンタ
  PROP_LAST: 'SYNC_LAST_EVENT'  // 直近イベントのJSON
};

// === Webアプリ骨格 ===
function doGet(){
  const t = HtmlService.createTemplateFromFile('Index');
  t.appTitle = 'PFO CRM Lite';
  return t.evaluate().setTitle('PFO CRM Lite')
           .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(name){ return HtmlService.createHtmlOutputFromFile(name).getContent(); }

/* =============================================================================
   初期化：統合ヘッダを規格化（日本語ラベル行対応）
   ========================================================================== */

function initializeSheetsUnified(){
  const defs = [
    [SHEET_NAMES.CUSTOMERS, [
      'CustomerID','StoreID','Name','Kana','Gender','Phone','Email','Zip','Pref','Addr1','Addr2',
      'ContactPolicy','LineUserID','LineDisplayName','LineLinkedAt','LineOptIn','Tags','AllergyNotes','NGStaff',
      'ProfilePhotoURL','MemoPinned','MemoDue','Notes','CreatedAt','UpdatedAt'
    ]],
    [SHEET_NAMES.PETS, [
      'PetID','CustomerID','StoreID','DogName','Kana','Species','Breed','Sex','DOB','WeightKg','Color','Hospital',
      'NeuterStatus','NeuterDate',
      // ▼ カルテ統合（最新値）
      'VaccineDate','RabiesDate','NextVaccine','NextRabies','Condition','OnsetDate','Treatment',
      'AllergyFood','AllergyEnv','Diet','Supplements','Snacks','PersonalityTags','Tags','MemoPinned','MemoDue',
      'FacePhotoURL','BodyPhotoURL','ProfilePhotoURL','Notes','CreatedAt','UpdatedAt'
    ]],
    [SHEET_NAMES.SERVICES, [
      'ServiceID','Name','Category','DurationMin','Price','TaxRate','EffectiveFrom','EffectiveTo','Active'
    ]],
    [SHEET_NAMES.VISITS, [
      'OrderID','StoreID','VisitDate','CustomerID','PetID','PaymentMethod','Staff','Channel','Notes',
      'Subtotal','Tax','Total', 'PrepaidUsed','CashPortion','ARPortion', 'CreatedAt'
    ]],
    [SHEET_NAMES.ORDER_ITEMS, [
      'OrderItemID','OrderID','StoreID','ServiceID','ServiceName','Category',
      'Quantity','UnitPrice','TaxRate','LineSubtotal','LineTax','LineTotal'
    ]],
    [SHEET_NAMES.STORES, [
      'StoreID','Name','Type','Color','Description','Sort','Active','CreatedAt','UpdatedAt'
    ]],
    [SHEET_NAMES.STAFF,    ['StaffID','Name','Role','Active']],
    [SHEET_NAMES.PAYMENTS, ['PaymentCode','Name','FeeRate','PayoutDay','Type','Active']],
    [SHEET_NAMES.CHANGEBOARD, ['TicketID','Datetime','Author','Category','Title','Description','Impact','RelatedID','Assignee','Status','Due','ApprovedBy','EffectiveFrom']],
    [SHEET_NAMES.IMAGES,   ['ImageID','VisitID','PetID','BodyPartCode','Symptom','ImageURL','ShotAt','Note','CreatedAt']],
    [SHEET_NAMES.PET_JOURNAL, ['EntryID','PetID','VisitID','PerformedAt','Staff','Title','Summary','PhotoURL','Tags','CreatedAt','UpdatedAt']],
    [SHEET_NAMES.RESERVATIONS, RESERVATION_HEADERS],
    [SHEET_NAMES.STAFF_NOTES, ['NoteID','Category','Title','Audience','Pinned','Body','CreatedAt']],
    [SHEET_NAMES.MEMBERS, ['MemberID','CustomerID','PlanName','MonthlyFee','StartDate','EndDate','Active','LastChargedMonth']],
    [SHEET_NAMES.PREPAID, ['EntryID','CustomerID','PetID','Type','Amount','Date','Source','RelatedID','Memo','CreatedAt']],
    [SHEET_NAMES.MERCH, ['ProductID','SKU','Name','Category','Price','TaxRate','Unit','StoreID','Active','Description','ReorderPoint']],
    [SHEET_NAMES.INVENTORY, ['EntryID','ProductID','StoreID','OnHand','SafetyStock','UpdatedAt','Memo']],
    [SHEET_NAMES.PURCHASE_ORDERS, ['OrderID','ProductID','StoreID','Quantity','UnitPrice','Status','OrderedAt','ExpectedAt','Vendor','Memo']],
    [SHEET_NAMES.EVENTS, ['EventID','Title','StartDate','EndDate','StartTime','EndTime','Location','Capacity','Staff','StoreID','Status','Description']]
    
  ];
  defs.forEach(([n, heads])=>ensureSheet_(n, heads));
  seedIfEmptyUnified_();
  ensureRealtimeSyncTriggers();  // ← 初回のみ作成、二重作成は抑止
  return {ok:true};
}

function seedIfEmptyUnified_(){
  const now = new Date();
  ensureSheet_(SHEET_NAMES.STORES, ['StoreID','Name','Type','Color','Description','Sort','Active','CreatedAt','UpdatedAt']);
  const storeSheet = getSheet_(SHEET_NAMES.STORES);
  if (storeSheet && isEmptyData_(storeSheet)){
    ensureDefaultStores_([]).forEach(def=>{
      appendRow_(SHEET_NAMES.STORES, Object.assign({}, def, {
        CreatedAt: now,
        UpdatedAt: now
      }));
    });
  }
}

/* =============================================================================
   シートI/Oユーティリティ（2行ヘッダ対応・同期通知内蔵）
   ========================================================================== */
function getSheet_(name){ return SpreadsheetApp.getActive().getSheetByName(name); }

function getHeaderRows_(sh){
  if (!sh) return 1;
  const lastCol = sh.getLastColumn() || 1;
  const heads = sh.getRange(1,1,1,lastCol).getValues()[0] || [];
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 1;

  const row2 = sh.getRange(2,1,1,lastCol).getValues()[0] || [];

  // 「実使用ヘッダ列」（1行目が空でない最終列）までを対象にする
  let usedCols = 0;
  for (let i=0; i<heads.length; i++){
    if (String(heads[i]||'').trim() !== '') usedCols = i+1;
  }
  if (usedCols === 0) usedCols = lastCol;

  const h1 = heads.slice(0, usedCols);
  const h2 = row2.slice(0, usedCols);

  const hasAny = h2.some(v => String(v||'').trim() !== '');
  const differs = h2.some((v,i) => String(v||'') !== String(h1[i]||''));

  return (hasAny && differs) ? 2 : 1;
}

function dataStartRow_(sh){ return getHeaderRows_(sh) + 1; }
function isEmptyData_(sh){ return (sh.getLastRow() <= getHeaderRows_(sh)); }

function ensureSheet_(name, headers){
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);

  const normalizedHeaders = Array.isArray(headers)
    ? headers.filter(h => h !== undefined && h !== null).map(h => String(h))
    : [];

  const headerCount = normalizedHeaders.length || Math.max(1, sh.getLastColumn());

  const curCols = sh.getMaxColumns();
  if(curCols < headers.length) sh.insertColumnsAfter(curCols, headers.length-curCols);

  // 1行目（英語キー）
  sh.getRange(1,1,1,headers.length).setValues([headers]);

  // 2行目（日本語ラベル）— 必要なら行を挿入してから設定
  const labelsMap = JP_LABELS[name] || {};
  const labels = headers.map(h => labelsMap[h] || '');
  const needLabelRow = labels.some(v => String(v||'').trim()!=='');
  const hdrRows = getHeaderRows_(sh);
  if (needLabelRow && hdrRows === 1 && sh.getLastRow() >= 2){
    // 既にデータが2行目以降にある状況 → 2行目を挿入してデータを1行下げる
    sh.insertRowsAfter(1,1);
  }
  if (needLabelRow) {
    sh.getRange(2, 1, 1, normalizedHeaders.length).setValues([labels]);
    sh.setFrozenRows(2);
  } else {
    sh.setFrozenRows(1);
  }

  if (typeof formatSheetForReadability_ === 'function') {
    formatSheetForReadability_(sh, headerCount);
  }
}

function formatSheetForReadability_(sh, columnCount){
}

function readTable_(sheetName){
  const sh = getSheet_(sheetName); if(!sh) return [];
  const last = sh.getLastRow(); if(last<2) return [];
  const hdrRows = getHeaderRows_(sh);
  const heads = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0];
  const start = hdrRows + 1;
  if (last < start) return [];
  const vals  = sh.getRange(start,1,last - hdrRows, heads.length).getValues();
  return vals.map(row => Object.fromEntries(heads.map((h,i)=>[h,row[i]])));
}

function appendRow_(sheetName, obj){
  const sh = getSheet_(sheetName);
  const heads = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0];
  const row = heads.map(h=> obj[h] ?? '');
  sh.appendRow(row);
  bumpSyncRev_({sheet:sheetName, reason:'appendRow', count:1});
  return obj;
}

function appendRows_(sheetName, objs){
  if(!objs || !objs.length) return;
  const sh = getSheet_(sheetName);
  const heads = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0];
  const rows = objs.map(o => heads.map(h => o[h] ?? ''));
  sh.getRange(sh.getLastRow()+1, 1, rows.length, heads.length).setValues(rows);
  bumpSyncRev_({sheet:sheetName, reason:'appendRows', count:objs.length});
}

function findRowById_(sh, headerName, id){
  if (!sh) throw new Error('シートがありません');
  if (id == null || id === '') return -1;
  const heads = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0] || [];
  const col = heads.indexOf(headerName) + 1;
  if (col <= 0) throw new Error('ヘッダーが見つかりません: ' + headerName);
  const last = sh.getLastRow();
  const hdrRows = getHeaderRows_(sh);
  if (last < hdrRows+1) return -1;
  const numRows = last - hdrRows;
  const vals = sh.getRange(hdrRows+1, col, numRows, 1).getValues().map(r => String(r[0] ?? ''));
  const idx = vals.indexOf(String(id));
  return idx === -1 ? -1 : (idx + hdrRows + 1);
}

/** Code.gs (Apps Script サーバ側) **/

/**
 * 明日分の予約に前日リマインドを送信する
 * 時間主導トリガー（毎日 09:00 等）に紐づけ
 */
function sendTomorrowReminders() {
  const tz = Session.getScriptTimeZone() || 'Asia/Tokyo';
  const now = new Date();
  const tmr = new Date(now);
  tmr.setDate(tmr.getDate() + 1);
  const ds = Utilities.formatDate(tmr, tz, 'yyyy-MM-dd');

  const reservations = listReservationsFromStore();
  const customersMap = loadCustomersEmailMap();

  const targets = reservations.filter(r => r.Date === ds && r.ReminderEnabled);
  let sent = 0, skipped = 0;

  targets.forEach(r=>{
    const c = customersMap[r.CustomerID];
    const email = c && c.Email;
    if (!email) { skipped++; return; }

    const subject = `[ご予約リマインド] ${r.Title || ''}（${r.Date} ${r.Start}〜）`;
    const body =
`【ご予約の前日リマインド】
${c.Name || 'お客様'} 様

ご予約日時：${r.Date} ${r.Start}〜${r.End}
担当者：${r.Staff}
施術：${r.ServiceID}
メモ：${r.Notes || '-'}

ご来店お待ちしております。`;

    GmailApp.sendEmail(email, subject, body);
    sent++;
  });

  console.log(`sendTomorrowReminders: send=${sent}, skip=${skipped}, date=${ds}`);
}

function normalizeReservationRecord_(row){
  if (!row) return null;
  const reminderRaw = (row.ReminderEnabled !== undefined) ? row.ReminderEnabled : row.reminderEnabled;
  const reminder = (reminderRaw === undefined || reminderRaw === '') ? true : isTrue_(reminderRaw);
  const normalizedDate = normalizeYMD_(row.Date || row.date);
  return {
    ReservationID: String(row.ReservationID || row.reservationId || '').trim(),
    CustomerID: String(row.CustomerID || row.customerId || '').trim(),
    PetID: String(row.PetID || row.petId || '').trim(),
    ServiceID: String(row.ServiceID || row.serviceId || '').trim(),
    Staff: String(row.Staff || row.staff || '').trim(),
    Date: normalizedDate,
    Start: String(row.Start || row.start || '').trim(),
    End: String(row.End || row.end || '').trim(),
    Title: String(row.Title || row.title || '').trim(),
    Notes: String(row.Notes || row.notes || '').trim(),
    ReminderEnabled: reminder,
    StoreID: resolveStoreId_(row.StoreID || row.storeId || ''),
    CreatedAt: row.CreatedAt || row.createdAt || ''
  };
}

function listReservationsFromStore(storeFilter){
  const reservations = readTable_(SHEET_NAMES.RESERVATIONS)
    .map(normalizeReservationRecord_)
    .filter(Boolean);
  if (!reservations.length) return [];

  const want = resolveStoreId_(storeFilter || '');
  if (!want) return reservations;

  const customerStores = new Map(
    readTable_(SHEET_NAMES.CUSTOMERS)
      .map(c => [String(c.CustomerID || '').trim(), resolveStoreId_(c.StoreID || c.storeId || '')])
  );

  return reservations.filter(rec => {
    const recordStore = rec.StoreID || customerStores.get(rec.CustomerID) || '';
    return recordStore && String(recordStore).trim() === want;
  });
}
function loadCustomersEmailMap(){
    const out = {};
  readTable_(SHEET_NAMES.CUSTOMERS).forEach(row => {
    const id = String(row.CustomerID || row.customerId || '').trim();
    if (!id) return;
    const emailRaw = row.Email || row.email || '';
    out[id] = {
      Name: String(row.Name || row.name || '').trim(),
      Email: String(emailRaw || '').trim(),
      StoreID: resolveStoreId_(row.StoreID || row.storeId || '')
    };
  });
  return out;

}

/* =============================================================================
   共通ユーティリティ
   ========================================================================== */
function toDateOnly_(d){ if(!d) return ''; const n=new Date(d); n.setHours(0,0,0,0); return n; }
function toYMD_(d){ const y=d.getFullYear(); const m=('0'+(d.getMonth()+1)).slice(-2); const dd=('0'+d.getDate()).slice(-2); return `${y}-${m}-${dd}`; }

function normalizeYMD_(v){
  if (!v) return "";
  if (Object.prototype.toString.call(v) === "[object Date]") return toYMD_(v);

  const s = String(v).trim();
  if (!s) return "";

  // 各種区切りを '-' に揃える
  const cleaned = s.replace(/[\/.]/g, "-");

  // Date に通せるならそれを採用（時刻は切り捨て）
  const d = new Date(cleaned);
  if (!isNaN(d)) return toYMD_(d);

  // フォールバック：YYYY-M-D をゼロ詰め
  const m = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${('0'+m[2]).slice(-2)}-${('0'+m[3]).slice(-2)}`;

  return cleaned.slice(0,10);
}


function isTrue_(v){
  if (v === true) return true;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.trim().toLowerCase() === "true" || v.trim() === "1";
  return false;
}

function mapToHeaders_(headers, src, overrides){
  const out={};
  headers.forEach(h=>{
    if(overrides && h in overrides) out[h]=overrides[h];
    else if(src && h in src) out[h]=src[h];
  });
  return out;
}
function normalizeIncomingTags_(value){
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)){
    try{ return JSON.stringify(value); }catch(e){ return ''; }
  }
  try{ return JSON.stringify(value); }catch(e){ return ''; }
}

function formatTagObj_(tag){
  if (!tag) return null;
  if (typeof tag === 'string'){
    const trimmed = tag.trim();
    if (!trimmed) return null;
    const parts = trimmed.split('|');
    const label = (parts[0]||'').trim();
    if (!label) return null;
    let color = (parts[1]||'').trim();
    if (color && !color.startsWith('#')) color = '#' + color.replace(/[^0-9a-f]/ig,'').slice(0,6);
    if (color.length>7) color = color.slice(0,7);
    return { label, color };
  }
  const label = String(tag.label || tag.name || tag.Label || '').trim();
  if (!label) return null;
  let color = '';
  if (tag.color != null) color = String(tag.color).trim();
  else if (tag.Color != null) color = String(tag.Color).trim();
  if (color && !color.startsWith('#')) color = '#' + color.replace(/[^0-9a-f]/ig,'').slice(0,6);
  if (color.length>7) color = color.slice(0,7);
  return { label, color };
}

function parseTagsCell_(value){
  if (!value) return [];
  if (Array.isArray(value)) return value.map(formatTagObj_).filter(Boolean);
  if (typeof value === 'string'){
    const text = value.trim();
    if (!text) return [];
    try{
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed.map(formatTagObj_).filter(Boolean);
    }catch(e){
      return text.split(/[,\n]/).map(formatTagObj_).filter(Boolean);
    }
    return [];
  }
  return [];
}
function formatYen_(value){
  const num = Number(value||0);
  if (!isFinite(num)) return '¥0';
  return '¥' + num.toLocaleString('ja-JP');
}

function diffDays_(from, to){
  const a = toDateOnly_(from);
  const b = toDateOnly_(to);
  if (!a || !b) return 0;
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function formatReservationItem_(rec, customersMap, petsMap, servicesMap, todayStr){
  if (!rec) return null;
  const cust = customersMap.get(String(rec.CustomerID || '')) || {};
  const pet = petsMap.get(String(rec.PetID || '')) || {};
  const service = servicesMap.get(String(rec.ServiceID || '')) || {};
  const diff = diffDays_(rec.Date, todayStr);
  let status = 'UPCOMING';
  let statusLabel = '';
  if (diff === 0){ status = 'TODAY'; statusLabel = '本日'; }
  else if (diff < 0){ status = 'PAST'; statusLabel = '完了'; }
  else { status = 'UPCOMING'; statusLabel = diff === 1 ? '明日' : `あと${diff}日`; }
  const time = [rec.Start, rec.End].filter(Boolean).join('〜');
  const meta = [
    service.Name ? `施術:${service.Name}` : '',
    pet.DogName ? `ご愛犬:${pet.DogName}` : '',
    rec.Staff ? `担当:${rec.Staff}` : '',
    rec.Notes ? `メモ:${rec.Notes}` : ''
  ].filter(Boolean);
  return {
    type: 'reservation',
    id: rec.ReservationID || '',
    title: `${rec.Date || ''} ${time}`.trim(),
    subtitle: cust.Name ? `顧客:${cust.Name}` : '',
    meta,
    date: rec.Date || '',
    dateLabel: rec.Date || '',
    time,
    customerName: cust.Name || '',
    petName: pet.DogName || '',
    staff: rec.Staff || '',
    status,
    statusLabel
  };
}
function resolveStoreId_(input){
  if (!input) return '';
  if (typeof input === 'string') return String(input).trim();
  if (typeof input === 'object'){
    if (input.storeId) return String(input.storeId).trim();
    if (input.StoreID) return String(input.StoreID).trim();
    if (input.id) return String(input.id).trim();
  }
  return '';
}

function matchesStore_(recordStoreId, requested){
  const want = resolveStoreId_(requested);
  if (!want) return true;
  return String(recordStoreId||'').trim() === want;
}

function normalizeStoreType_(value){
  const raw = String(value || 'PET').trim().toUpperCase();
  return (raw === 'HUMAN') ? 'HUMAN' : 'PET';
}

function normalizeStoreRecord_(row){
  if (!row) return { StoreID:'', Name:'', Type:'PET', Color:'', Description:'', Sort:0, Active:true, CreatedAt:'', UpdatedAt:'' };
  const storeId = String(row.StoreID || row.storeId || row.Id || row.id || '').trim();
  const activeRaw = (row.Active !== undefined) ? row.Active : (row.active !== undefined ? row.active : undefined);
  const active = (activeRaw === undefined) ? true : isTrue_(activeRaw);
  return {
    StoreID: storeId,
    Name: String(row.Name || row.StoreName || '').trim(),
    Type: normalizeStoreType_(row.Type || row.StoreType),
    Color: String(row.Color || '').trim(),
    Description: String(row.Description || '').trim(),
    Sort: Number(row.Sort || 0) || 0,
    Active: active,
    CreatedAt: row.CreatedAt || '',
    UpdatedAt: row.UpdatedAt || ''
  };
}
function ensureDefaultStores_(list){
  if (!Array.isArray(list)) list = [];
  const defaults = [
    {StoreID:'PAW', Name:'Pawfect One', Type:'PET', Color:'#6ecad1', Description:'ドッグケア（犬）', Sort:1, Active:true},
    {StoreID:'TBL', Name:'TBL', Type:'HUMAN', Color:'#fbbf24', Description:'ビューティーケア（人）', Sort:2, Active:true},
    {StoreID:'TBL-ACU', Name:'TBL(鍼灸)', Type:'HUMAN', Color:'#f97316', Description:'ビューティーケア（人）/鍼灸', Sort:3, Active:true}
  ];
  const seen = new Set(list.map(s=> String((s && s.StoreID) || '').trim()));
  defaults.forEach(def=>{
    const id = String(def.StoreID||'').trim();
    if (!id || seen.has(id)) return;
    list.push(normalizeStoreRecord_(def));
    seen.add(id);
  });
  return list;
}

function getStoreMap_(){
  const rows = ensureDefaultStores_(readTable_(SHEET_NAMES.STORES));
  const map = new Map();
  rows.forEach(r => {
    const store = normalizeStoreRecord_(r);
    if (store.StoreID) map.set(store.StoreID, store);
  });
  return map;
}

function getStoreById_(storeId){
  const id = resolveStoreId_(storeId);
  if (!id) return null;
  const map = getStoreMap_();
  return map.get(id) || null;
}

function listStores(){
  ensureSheet_(SHEET_NAMES.STORES, ['StoreID','Name','Type','Color','Description','Sort','Active','CreatedAt','UpdatedAt']);
  const list = ensureDefaultStores_(readTable_(SHEET_NAMES.STORES)).map(normalizeStoreRecord_);
  list.sort((a,b)=> (Number(a.Sort||0) - Number(b.Sort||0)) || a.Name.localeCompare(b.Name,'ja'));
  return list;
}

function saveStore(payload){
  const p = payload || {};
  ensureSheet_(SHEET_NAMES.STORES, ['StoreID','Name','Type','Color','Description','Sort','Active','CreatedAt','UpdatedAt']);
  const sh = getSheet_(SHEET_NAMES.STORES);
  const heads = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0] || [];
  const now = new Date();
  const storeId = resolveStoreId_(p) || Utilities.getUuid();
  let row = findRowById_(sh, 'StoreID', storeId);

  const baseActive = (p.Active !== undefined) ? p.Active : (p.active !== undefined ? p.active : undefined);
  const active = (baseActive === undefined) ? true : isTrue_(baseActive);
  const record = {
    StoreID: storeId,
    Name: String(p.Name || p.StoreName || '').trim() || '未設定',
    Type: normalizeStoreType_(p.Type || p.StoreType),
    Color: String(p.Color || '').trim(),
    Description: String(p.Description || '').trim(),
    Sort: Number(p.Sort || 0) || 0,
    Active: active,
    UpdatedAt: now
  };

  if (row > 0){
    // Preserve CreatedAt when updating
    const headsMap = heads.reduce((m,h,i)=>{ m[h]=i; return m; }, {});
    if (headsMap['CreatedAt'] != null){
      const existing = sh.getRange(row, headsMap['CreatedAt']+1, 1, 1).getValues()[0][0];
      record.CreatedAt = existing || record.CreatedAt || '';
    }
    const rowVals = heads.map(h => (record[h] !== undefined) ? record[h] : '');
    sh.getRange(row, 1, 1, heads.length).setValues([rowVals]);
  }else{
    record.CreatedAt = now;
    const rowVals = heads.map(h => (record[h] !== undefined) ? record[h] : '');
    sh.appendRow(rowVals);
  }

  bumpSyncRev_({sheet:SHEET_NAMES.STORES, reason: row>0 ? 'update' : 'insert'});
  return normalizeStoreRecord_(record);
}
/* =============================================================================
   ルックアップ（選択肢）
   ========================================================================== */
function getLookups(){
  const today = toYMD_(new Date());
  const services = readTable_(SHEET_NAMES.SERVICES)
    .filter(r => isTrue_(r.Active))
    .filter(r => {
      const f = normalizeYMD_(r.EffectiveFrom);
      const t = normalizeYMD_(r.EffectiveTo);
      return (!f || today >= f) && (!t || today <= t);
    })
    .map(s => ({
      ServiceID: String(s.ServiceID||'').trim(),
      Name: String(s.Name||'').trim(),
      Category: String(s.Category||'').trim(),
      DurationMin: Number(s.DurationMin||0),
      Price: Number(s.Price||0),
      TaxRate: s.TaxRate===''? '' : Number(s.TaxRate)
    }));
  const staff = readTable_(SHEET_NAMES.STAFF)
    .filter(r => r.Active === undefined || isTrue_(r.Active))
    .map(s => ({ Name: String(s.Name||'').trim(), Role: String(s.Role||'') }));
  const payments = readTable_(SHEET_NAMES.PAYMENTS)
    .filter(r => r.Active === undefined || isTrue_(r.Active))
    .map(p => ({ PaymentCode: String(p.PaymentCode||'').trim(), Name: String(p.Name||'').trim() }));
  const stores = listStores()
    .filter(s => s.Active !== false)
    .map(s => ({
      StoreID: String(s.StoreID||'').trim(),
      Name: String(s.Name||'').trim(),
      Type: normalizeStoreType_(s.Type),
      Color: String(s.Color||'').trim(),
      Description: String(s.Description||'').trim(),
      Sort: Number(s.Sort||0)
    }))
    .sort((a,b)=> (Number(a.Sort||0) - Number(b.Sort||0)) || a.Name.localeCompare(b.Name,'ja'));
  return { services, staff, payments, stores };
}

/* =============================================================================
   顧客・ペット（Lite）
   ========================================================================== */
function listCustomersLite(filter){
  const storeId = resolveStoreId_(filter);
  const balMap = getPrepaidBalancesMap_();
  const cus = readTable_(SHEET_NAMES.CUSTOMERS).filter(c => matchesStore_(c.StoreID, storeId));
  const pets = readTable_(SHEET_NAMES.PETS).filter(p => matchesStore_(p.StoreID, storeId));
  const byOwner = new Map();
  pets.forEach(p=>{
    const k = String(p.CustomerID||'');
    const a = byOwner.get(k)||[];
    a.push(p); byOwner.set(k,a);
  });
  return cus.map(c => {
    const customerId = String(c.CustomerID||'');
    const updatedRaw = c.UpdatedAt || '';
    const updated = updatedRaw ? (normalizeYMD_(updatedRaw) || String(updatedRaw)) : '';
    return {
      CustomerID: customerId,
      StoreID: String(c.StoreID||''),
      Name: String(c.Name||''),
      Phone: String(c.Phone||''),
      Email: String(c.Email||''),
      Address: [c.Addr1, c.Addr2].map(x=>String(x||'').trim()).filter(Boolean).join(' ') || String(c.Address||''),
      Notes: String(c.Notes||''),
      MemoDue: normalizeYMD_(c.MemoDue||''),
      MemoPinned: isTrue_(c.MemoPinned),
      Tags: parseTagsCell_(c.Tags),
      LineUserID: String(c.LineUserID||''),
      LineDisplayName: String(c.LineDisplayName||''),
      LineLinkedAt: normalizeYMD_(c.LineLinkedAt||''),
      LineOptIn: String(c.LineOptIn||''),
      ProfilePhotoURL: String(c.ProfilePhotoURL||''),
      PrepaidBalance: Number(balMap.get(customerId)||0),
      UpdatedAt: updated,
      Pets: (byOwner.get(customerId)||[]).map(p=>({
        PetID: String(p.PetID||''),
        StoreID: String(p.StoreID||''),
        DogName: String(p.DogName||''),
        Name: String(p.DogName||''),
        Breed: String(p.Breed||'')
      }))
    };
  });
}
function listPets(customerId, options){
  const storeId = resolveStoreId_(options);
  const pets = readTable_(SHEET_NAMES.PETS)
    .filter(p => String(p.CustomerID) === String(customerId))
    .filter(p => matchesStore_(p.StoreID, storeId));
  return pets.map(p => ({
    PetID:String(p.PetID||''),
    Name:String(p.DogName||''),
    DogName:String(p.DogName||''),
    Breed:String(p.Breed||''),
    StoreID:String(p.StoreID||'')
  }));

}

/* =============================================================================
   検索
   ========================================================================== */
function normalizeSearchText_(value){
  if (value == null) return '';
  return String(value).toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/[‐－―ー−]/g, '-');
}

function tokenizeSearch_(value){
  return normalizeSearchText_(value).split(/\s+/).filter(Boolean);
}

function searchOwners(keyword, filters){
  const f = filters||{};
  const tokens = tokenizeSearch_(keyword);
  const tagKw = normalizeSearchText_(f.tag||'');
  const notesKw = normalizeSearchText_(f.notes||'');
  const list = listCustomersLite(f);
  return list.filter(c => {
    const combined = normalizeSearchText_([c.CustomerID, c.Name, c.Phone, c.Email, c.Address].join(' '));
    const combinedPlain = combined.replace(/-/g,'');
    const tagText = normalizeSearchText_((c.Tags||[]).map(t=> t.label||'').join(' '));
    const notesText = normalizeSearchText_(c.Notes||'');
    if (tokens.length && !tokens.every(tok => combined.includes(tok) || combinedPlain.includes(tok.replace(/-/g,'')) || tagText.includes(tok))) {
      return false;
    }
    if (notesKw && !notesText.includes(notesKw)) return false;
    if (tagKw && !(Array.isArray(c.Tags) && c.Tags.some(t => normalizeSearchText_(t.label).includes(tagKw)))) return false;
    return true;
  });
}

function searchPets(keyword, filters){
  const f = filters||{};
  const tokens = tokenizeSearch_(keyword);
  const tagKw = normalizeSearchText_(f.tag||'');
  const notesKw = normalizeSearchText_(f.notes||'');
  const storeId = resolveStoreId_(f);
  const pets = readTable_(SHEET_NAMES.PETS).filter(p => matchesStore_(p.StoreID, storeId));
  const owners = new Map(readTable_(SHEET_NAMES.CUSTOMERS).map(o=>[String(o.CustomerID), o]));
  const visits = readTable_(SHEET_NAMES.VISITS).filter(v => matchesStore_(v.StoreID, storeId));
  const latestByPet = new Map();
  visits.forEach(v => {
    const pid = String(v.PetID||'');
    if (!pid) return;
    const date = normalizeYMD_(v.VisitDate||'');
    if (!date) return;
    const cur = latestByPet.get(pid);
    if (!cur || String(cur) < date) latestByPet.set(pid, date);
  });
  const hit = pets.filter(p => {
    const tags = parseTagsCell_(p.Tags);
    const owner = owners.get(String(p.CustomerID)) || {};
    const combined = normalizeSearchText_([p.PetID, p.CustomerID, p.DogName, p.Breed, p.Sex, owner.Name].join(' '));
    const tagText = normalizeSearchText_(tags.map(t=> t.label||'').join(' '));
    const notesText = normalizeSearchText_(p.Notes||'');
    if (tokens.length && !tokens.every(tok => combined.includes(tok) || tagText.includes(tok))) return false;
    if (notesKw && !notesText.includes(notesKw)) return false;
    if (tagKw && !tags.some(t => normalizeSearchText_(t.label).includes(tagKw))) return false;
    return true;
  }).map(p => ({
    PetID: String(p.PetID||''),
    StoreID: String(p.StoreID||''),
    PetName: String(p.Name||''),
    Name: String(p.DogName||''),
    Breed: String(p.Breed||''),
    Sex: String(p.Sex||''),
    WeightKg: p.WeightKg||'',
    OwnerName: String((owners.get(String(p.CustomerID))||{}).Name||''),
    CustomerID: String(p.CustomerID||''),
    CustomerStoreID: String((owners.get(String(p.CustomerID))||{}).StoreID||''),
    LatestVisit: String(latestByPet.get(String(p.PetID||''))||''),
    Notes: String(p.Notes||''),
    MemoDue: normalizeYMD_(p.MemoDue||''),
    MemoPinned: isTrue_(p.MemoPinned),
    Tags: parseTagsCell_(p.Tags)
  }));
  return hit;
}
function globalSearch(keyword, options){
  const opt = options || {};
  const storeId = resolveStoreId_(opt);
  const limit = Math.max(1, Number(opt.limit || 5));
  const query = String(keyword || '').trim();
  const tokens = tokenizeSearch_(query);
  const hasTokens = tokens.length > 0;
  const today = toDateOnly_(new Date());
  const todayStr = normalizeYMD_(today);

  const customersMap = new Map(readTable_(SHEET_NAMES.CUSTOMERS).map(c => [String(c.CustomerID || ''), c]));
  const petsMap = new Map(readTable_(SHEET_NAMES.PETS).map(p => [String(p.PetID || ''), p]));
  const servicesMap = new Map(readTable_(SHEET_NAMES.SERVICES).map(s => [String(s.ServiceID || ''), s]));

  const results = { query, customers: [], pets: [], reservations: [], invoices: [], notes: [], tickets: [] };

  if (hasTokens){
    const customerHits = searchOwners(query, { storeId }).slice(0, limit);
    results.customers = customerHits.map(c => ({
      type: 'customer',
      id: c.CustomerID || '',
      title: c.Name || '(無名)',
      subtitle: `CID:${c.CustomerID || ''}${c.Phone ? ` / ${c.Phone}` : ''}`,
      meta: [
        c.Address ? `住所:${c.Address}` : '',
        Array.isArray(c.Pets) && c.Pets.length ? `ご愛犬:${c.Pets.map(p => p.Name || p.DogName || '').join('・')}` : '',
        Array.isArray(c.Tags) && c.Tags.length ? `タグ:${c.Tags.map(t => t.label || '').join('・')}` : '',
        c.MemoDue ? `メモ期限:${normalizeYMD_(c.MemoDue)}` : ''
      ].filter(Boolean),
      keyword: c.CustomerID || query
    }));

    const petHits = searchPets(query, { storeId }).slice(0, limit);
    results.pets = petHits.map(p => ({
      type: 'pet',
      id: p.PetID || '',
      title: p.PetName || p.Name || '(無名)',
      subtitle: `PID:${p.PetID || ''}${p.OwnerName ? ` / 飼い主:${p.OwnerName}` : ''}`,
      meta: [
        p.Breed ? `犬種:${p.Breed}` : '',
        p.Sex ? `性別:${p.Sex}` : '',
        p.LatestVisit ? `最新来店:${p.LatestVisit}` : '',
        Array.isArray(p.Tags) && p.Tags.length ? `タグ:${p.Tags.map(t => t.label || '').join('・')}` : ''
      ].filter(Boolean),
      keyword: p.PetID || p.PetName || query
    }));
  }

  const reservationsRaw = listReservationsFromStore(storeId) || [];
  const reservationLimit = hasTokens ? limit : Math.min(limit, 6);
  const filteredReservations = reservationsRaw.filter(rec => {
    if (!hasTokens){
      const diff = diffDays_(rec.Date, todayStr);
      return diff >= -1 && diff <= 7;
    }
    const cust = customersMap.get(String(rec.CustomerID || '')) || {};
    const pet = petsMap.get(String(rec.PetID || '')) || {};
    const service = servicesMap.get(String(rec.ServiceID || '')) || {};
    const hay = [
      rec.Date, rec.Start, rec.End, rec.Staff, rec.ServiceID,
      service.Name, cust.Name, cust.Phone, cust.Email, pet.DogName, pet.Breed, rec.Notes
    ].join(' ').toLowerCase();
    return tokens.every(tok => hay.includes(tok));
  }).sort((a,b)=> `${a.Date || ''} ${a.Start || ''}`.localeCompare(`${b.Date || ''} ${b.Start || ''}`));

  results.reservations = filteredReservations.slice(0, reservationLimit)
    .map(rec => formatReservationItem_(rec, customersMap, petsMap, servicesMap, todayStr))
    .filter(Boolean);

  const invoiceRes = searchInvoices(query, { storeId, limit: limit * 2 });
  const invoiceList = Array.isArray(invoiceRes?.results) ? invoiceRes.results : [];
  const invoiceSource = hasTokens ? invoiceList : invoiceList.filter(row => String(row.Status || '').toUpperCase() === 'PENDING');
  results.invoices = invoiceSource.slice(0, limit).map(row => ({
    type: 'invoice',
    id: row.OrderID || row.VisitID || '',
    title: `${row.OrderID || '(請求)'} ${formatYen_(row.Total || 0)}`,
    subtitle: row.CustomerName ? `顧客:${row.CustomerName}` : '',
    meta: [
      row.PetName ? `ご愛犬:${row.PetName}` : '',
      row.VisitDate ? `来店日:${row.VisitDate}` : '',
      row.PaymentName ? `支払:${row.PaymentName}` : '',
      Number(row.Balance || 0) > 0 ? `未収:${formatYen_(row.Balance || 0)}` : ''
    ].filter(Boolean),
    orderId: row.OrderID || '',
    status: row.Status || '',
    statusLabel: row.StatusLabel || ''
  }));

  const noteList = listStaffNotes(50) || [];
  const noteFiltered = noteList
    .filter(note => hasTokens ? true : isTrue_(note.Pinned))
    .filter(note => {
      if (!hasTokens) return true;
      const hay = [note.Title, note.Category, note.Audience, note.Body].join(' ').toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    })
    .sort((a,b)=> {
      const pinnedDiff = (isTrue_(b.Pinned) ? 1 : 0) - (isTrue_(a.Pinned) ? 1 : 0);
      if (pinnedDiff !== 0) return pinnedDiff;
      return new Date(b.CreatedAt || 0) - new Date(a.CreatedAt || 0);
    })
    .slice(0, limit);
  results.notes = noteFiltered.map(note => ({
    type: 'note',
    id: note.NoteID || '',
    title: note.Title || '(無題)',
    subtitle: note.Category ? `カテゴリ:${note.Category}` : '',
    meta: [
      note.Audience ? `対象:${note.Audience}` : '',
      note.CreatedAt ? `登録:${normalizeYMD_(note.CreatedAt)}` : ''
    ].filter(Boolean),
    pinned: isTrue_(note.Pinned),
    status: isTrue_(note.Pinned) ? 'PINNED' : '',
    statusLabel: isTrue_(note.Pinned) ? 'PIN' : ''
  }));

  const ticketList = listTickets(50) || [];
  const ticketFiltered = ticketList
    .filter(ticket => {
      if (!hasTokens) return !['完了','クローズ','対応済'].includes(String(ticket.Status || '').trim());
      const hay = [ticket.Title, ticket.Category, ticket.Assignee, ticket.Description, ticket.Impact, ticket.RelatedID].join(' ').toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    })
    .slice(0, limit);
  results.tickets = ticketFiltered.map(ticket => ({
    type: 'ticket',
    id: ticket.TicketID || '',
    title: ticket.Title || '(申請)',
    subtitle: ticket.Category ? `カテゴリ:${ticket.Category}` : '',
    meta: [
      ticket.Assignee ? `担当:${ticket.Assignee}` : '',
      ticket.Status ? `状態:${ticket.Status}` : '',
      ticket.Datetime ? `登録:${normalizeYMD_(ticket.Datetime)}` : ''
    ].filter(Boolean),
    status: ticket.Status || '',
    statusLabel: ticket.Status || '',
    relatedId: ticket.RelatedID || ''
  }));

  return results;
}

function getOpsSnapshot(options){
  const opt = options || {};
  const storeId = resolveStoreId_(opt);
  const today = toDateOnly_(new Date());
  const todayStr = normalizeYMD_(today);
  const customersMap = new Map(readTable_(SHEET_NAMES.CUSTOMERS).map(c => [String(c.CustomerID || ''), c]));
  const petsMap = new Map(readTable_(SHEET_NAMES.PETS).map(p => [String(p.PetID || ''), p]));
  const servicesMap = new Map(readTable_(SHEET_NAMES.SERVICES).map(s => [String(s.ServiceID || ''), s]));

  const reservations = (listReservationsFromStore(storeId) || [])
    .filter(rec => {
      const diff = diffDays_(rec.Date, todayStr);
      return diff >= -1 && diff <= 7;
    })
    .sort((a,b)=> `${a.Date || ''} ${a.Start || ''}`.localeCompare(`${b.Date || ''} ${b.Start || ''}`))
    .slice(0, 8)
    .map(rec => formatReservationItem_(rec, customersMap, petsMap, servicesMap, todayStr))
    .filter(Boolean);

  const invoiceRes = searchInvoices('', { storeId, status: 'PENDING', limit: 20 });
  const invoicesRaw = Array.isArray(invoiceRes?.results) ? invoiceRes.results : [];
  const invoices = invoicesRaw.slice(0, 10).map(row => ({
    type: 'invoice',
    id: row.OrderID || row.VisitID || '',
    title: `${row.OrderID || '(請求)'} ${formatYen_(row.Total || 0)}`,
    subtitle: row.CustomerName ? `顧客:${row.CustomerName}` : '',
    meta: [
      row.PetName ? `ご愛犬:${row.PetName}` : '',
      row.VisitDate ? `来店日:${row.VisitDate}` : '',
      row.PaymentName ? `支払:${row.PaymentName}` : '',
      Number(row.Balance || 0) > 0 ? `未収:${formatYen_(row.Balance || 0)}` : ''
    ].filter(Boolean),
    orderId: row.OrderID || '',
    status: row.Status || '',
    statusLabel: row.StatusLabel || ''
  }));

  const notesRaw = listStaffNotes(30) || [];
  const notes = notesRaw
    .sort((a,b)=> {
      const pinnedDiff = (isTrue_(b.Pinned) ? 1 : 0) - (isTrue_(a.Pinned) ? 1 : 0);
      if (pinnedDiff !== 0) return pinnedDiff;
      return new Date(b.CreatedAt || 0) - new Date(a.CreatedAt || 0);
    })
    .slice(0, 10)
    .map(note => ({
      type: 'note',
      id: note.NoteID || '',
      title: note.Title || '(無題)',
      subtitle: note.Category ? `カテゴリ:${note.Category}` : '',
      meta: [
        note.Audience ? `対象:${note.Audience}` : '',
        note.CreatedAt ? `登録:${normalizeYMD_(note.CreatedAt)}` : ''
      ].filter(Boolean),
      pinned: isTrue_(note.Pinned),
      status: isTrue_(note.Pinned) ? 'PINNED' : '',
      statusLabel: isTrue_(note.Pinned) ? 'PIN' : ''
    }));

  const ticketsRaw = listTickets(30) || [];
  const tickets = ticketsRaw
    .filter(ticket => !['完了','クローズ','対応済'].includes(String(ticket.Status || '').trim()))
    .sort((a,b)=> new Date(b.Datetime || 0) - new Date(a.Datetime || 0))
    .slice(0, 10)
    .map(ticket => ({
      type: 'ticket',
      id: ticket.TicketID || '',
      title: ticket.Title || '(申請)',
      subtitle: ticket.Category ? `カテゴリ:${ticket.Category}` : '',
      meta: [
        ticket.Assignee ? `担当:${ticket.Assignee}` : '',
        ticket.Status ? `状態:${ticket.Status}` : '',
        ticket.Datetime ? `登録:${normalizeYMD_(ticket.Datetime)}` : ''
      ].filter(Boolean),
      status: ticket.Status || '',
      statusLabel: ticket.Status || ''
    }));

  return {
    reservations,
    invoices,
    notes,
    tickets
  };
}
/* =============================================================================
   バンドル（顧客/ペット詳細＋履歴）
   ========================================================================== */
function getCustomerBundle(customerId){
  const services = new Map(readTable_(SHEET_NAMES.SERVICES).map(s=>[String(s.ServiceID), s]));
  const customer = readTable_(SHEET_NAMES.CUSTOMERS).find(c=> String(c.CustomerID)===String(customerId)) || null;
  const storeId = customer ? customer.StoreID : '';
  const orders = readTable_(SHEET_NAMES.VISITS)
    .filter(v => String(v.CustomerID) === String(customerId))
    .filter(v => matchesStore_(v.StoreID, storeId));
  const items  = readTable_(SHEET_NAMES.ORDER_ITEMS);
  const itemsByOrder = new Map();
  items.forEach(it=>{
    const k = String(it.OrderID||'');
    const a = itemsByOrder.get(k)||[];
    a.push(it); itemsByOrder.set(k,a);
  });
  const visitsFlatten = [];
  orders.sort((a,b)=> toDateOnly_(b.VisitDate) - toDateOnly_(a.VisitDate));
  orders.forEach(o=>{
    const lines = itemsByOrder.get(String(o.OrderID))||[];
    lines.forEach(line=>{
      visitsFlatten.push({
        VisitDate: toDateOnly_(o.VisitDate),
        ServiceID: String(line.ServiceID||''),
        ServiceName: String(line.ServiceName || (services.get(String(line.ServiceID))||{}).Name || ''),
        Quantity: Number(line.Quantity||0),
        PaymentMethod: String(o.PaymentMethod||''),
        Staff: String(o.Staff||''),
        Total: Number(line.LineTotal||0),
        Notes: String(o.Notes||'')
      });
    });
  });
  const petsList = readTable_(SHEET_NAMES.PETS)
    .filter(p=> String(p.CustomerID)===String(customerId))
    .filter(p=> matchesStore_(p.StoreID, storeId));
  return {
    customer,
    pets: petsList,
    visits: visitsFlatten
  };
}

function getPetBundleUnified(petId){
  const services = new Map(readTable_(SHEET_NAMES.SERVICES).map(s=>[String(s.ServiceID), s]));
  const pet = (readTable_(SHEET_NAMES.PETS).find(p => String(p.PetID) === String(petId)) || null);
  const storeId = pet ? pet.StoreID : '';
  const orders = readTable_(SHEET_NAMES.VISITS)
    .filter(v => String(v.PetID) === String(petId))
    .filter(v => matchesStore_(v.StoreID, storeId));
  const items  = readTable_(SHEET_NAMES.ORDER_ITEMS);
  const itemsByOrder = new Map();
  items.forEach(it=>{
    const k = String(it.OrderID||''); const a = itemsByOrder.get(k)||[]; a.push(it); itemsByOrder.set(k,a);
  });
  const visits = [];
  orders.sort((a,b)=> toDateOnly_(b.VisitDate) - toDateOnly_(a.VisitDate));
  orders.forEach(o=>{
    (itemsByOrder.get(String(o.OrderID))||[]).forEach(line=>{
      visits.push({
        VisitDate: toDateOnly_(o.VisitDate),
        ServiceID: String(line.ServiceID||''),
        ServiceName: String(line.ServiceName || (services.get(String(line.ServiceID))||{}).Name || ''),
        Quantity: Number(line.Quantity||0),
        PaymentMethod: String(o.PaymentMethod||''),
        Staff: String(o.Staff||''),
        Total: Number(line.LineTotal||0),
        Notes: String(o.Notes||'')
      });
    });
  });
  const images = readTable_(SHEET_NAMES.IMAGES)
    .filter(r => String(r.PetID) === String(petId))
    .map(r => ({ ImageURL:String(r.ImageURL||''), BodyPartCode:String(r.BodyPartCode||''), Symptom:String(r.Symptom||''), ShotAt:String(r.ShotAt||'') }));
  const journal = readTable_(SHEET_NAMES.PET_JOURNAL)
    .filter(r => String(r.PetID) === String(petId))
    .map(r => ({
      EntryID: String(r.EntryID||''),
      VisitID: String(r.VisitID||''),
      PerformedAt: normalizeYMD_(r.PerformedAt||''),
      Staff: String(r.Staff||''),
      Title: String(r.Title||''),
      Summary: String(r.Summary||''),
      PhotoURL: String(r.PhotoURL||''),
      Tags: parseTagsCell_(r.Tags||''),
      CreatedAt: r.CreatedAt || '',
      UpdatedAt: r.UpdatedAt || ''
    }))
    .sort((a,b)=> (new Date(b.PerformedAt||b.UpdatedAt||b.CreatedAt||0)) - (new Date(a.PerformedAt||a.UpdatedAt||a.CreatedAt||0)));
  return { pet, visits, images, journal };
}

/* =============================================================================
   Upsert 系
   ========================================================================== */
function upsertCustomerCard(data){
  if (data == null) data = {};
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e){ data = {}; } }
  if (typeof data !== 'object') data = {};
  const sh = getSheet_(SHEET_NAMES.CUSTOMERS);
  if (!sh) throw new Error('シートがありません: ' + SHEET_NAMES.CUSTOMERS);
  const heads = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0] || [];
  const now = new Date();
  let row = -1;
  if (data.CustomerID) row = findRowById_(sh, 'CustomerID', data.CustomerID);
  const rec = Object.assign({
    CustomerID: data.CustomerID || Utilities.getUuid(),
    CreatedAt: now
  }, mapToHeaders_(heads, data, { UpdatedAt: now }));
  const rowVals = heads.map(h => rec[h] ?? '');
  if (row > 0) {
    sh.getRange(row, 1, 1, heads.length).setValues([rowVals]);
    bumpSyncRev_({sheet:SHEET_NAMES.CUSTOMERS, reason:'update'});
  } else {
    sh.appendRow(rowVals);
    bumpSyncRev_({sheet:SHEET_NAMES.CUSTOMERS, reason:'insert'});
  }
  return { ok:true, CustomerID: rec.CustomerID };
}

function upsertPetCard(data){
  if (data == null) data = {};
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e){ data = {}; } }
  if (typeof data !== 'object') data = {};
  const sh = getSheet_(SHEET_NAMES.PETS);
  if (!sh) throw new Error('シートがありません: ' + SHEET_NAMES.PETS);
  const heads = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0] || [];
  const now = new Date();
  let row = -1;
  if (data.PetID) row = findRowById_(sh, 'PetID', data.PetID);

  // CustomerID の補完（既存行 or 既存レコード参照）
  if ((!data.CustomerID || data.CustomerID === '') && row > 0) {
    const headsMap = heads.reduce((m,h,i)=> (m[h]=i, m), {});
    const existing = sh.getRange(row, 1, 1, heads.length).getValues()[0];
    const cidCol = headsMap['CustomerID'];
    if (cidCol != null) data.CustomerID = existing[cidCol] || data.CustomerID;
  }
  if ((!data.CustomerID || data.CustomerID === '') && data.PetID) {
    const all = readTable_(SHEET_NAMES.PETS);
    const found = all.find(r => String(r.PetID) === String(data.PetID));
    if (found && found.CustomerID) data.CustomerID = found.CustomerID;
  }
  if (!data.CustomerID) throw new Error('CustomerID は必須です（PetIDから補完できませんでした）');

  const rec = Object.assign({
    PetID: data.PetID || Utilities.getUuid(),
    CreatedAt: now
  }, mapToHeaders_(heads, data, { UpdatedAt: now }));
  const rowVals = heads.map(h => rec[h] ?? '');
  if (row > 0) {
    sh.getRange(row, 1, 1, heads.length).setValues([rowVals]);
    bumpSyncRev_({sheet:SHEET_NAMES.PETS, reason:'update'});
  } else {
    sh.appendRow(rowVals);
    bumpSyncRev_({sheet:SHEET_NAMES.PETS, reason:'insert'});
  }
  return { ok:true, PetID: rec.PetID, CustomerID: rec.CustomerID };
}

/* =============================================================================
   画像保存
   ========================================================================== */
const DRIVE_CONF = { ROOT: 'PFO CRM_Uploads' };

function getOrCreateRootFolder_(){
  const it = DriveApp.getFoldersByName(DRIVE_CONF.ROOT);
  return it.hasNext()? it.next(): DriveApp.createFolder(DRIVE_CONF.ROOT);
}
function getOrCreatePetFolder_(pid, pname){
  const root = getOrCreateRootFolder_();
  const safe = String(pname||'').replace(/[\/:*?"<>|]/g,'_').slice(0,60);
  const name = `PID-${pid}${safe?` [${safe}]`:''}`;
  const it = root.getFoldersByName(name);
  return it.hasNext()? it.next(): root.createFolder(name);
}
function createImageRecord(data){
  const now=new Date();
  return appendRow_(SHEET_NAMES.IMAGES,{
    ImageID: Utilities.getUuid(),
    VisitID: data.VisitID||'',
    PetID: data.PetID||'',
    BodyPartCode: data.BodyPartCode||'',
    Symptom: data.Symptom||'',
    ImageURL: data.ImageURL||'',
    ShotAt: data.ShotAt ? toDateOnly_(data.ShotAt) : '',
    Note: data.Note||'',
    CreatedAt: now
  });
}
function savePetImage(data){
  if(!data || !data.PetID) throw new Error('PetID は必須です');
  const pet = readTable_(SHEET_NAMES.PETS).find(p=> String(p.PetID)===String(data.PetID));
  if(!pet) throw new Error('PetID が見つかりません');
  const bytes = Utilities.base64Decode(data.base64);
  const blob  = Utilities.newBlob(bytes, data.mimeType||'application/octet-stream', data.filename||'upload');
  const folder= getOrCreatePetFolder_(pet.PetID, pet.Name);
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const file  = folder.createFile(blob).setName(`${stamp}_${data.filename||'photo'}`);
  return { ok:true, fileUrl:file.getUrl(), fileId:file.getId(),
           image: createImageRecord({VisitID:data.VisitID||'', PetID:pet.PetID, ImageURL:file.getUrl(),
                                     BodyPartCode:data.BodyPartCode||'', Symptom:data.Symptom||'',
                                     ShotAt:data.ShotAt||'', Note:data.Note||''}) };
}
/* =============================================================================
   ご愛犬施術記録ブック
   ========================================================================== */
function listPetJournal(petId){
  if (!petId) return [];
  return (getPetBundleUnified(petId)||{}).journal || [];
}

function savePetJournalEntry(payload){
  let data = payload || {};
  if (typeof data === 'string'){
    try { data = JSON.parse(data); } catch(e){ data = {}; }
  }
  if (typeof data !== 'object' || !data) data = {};
  if (!data.PetID) throw new Error('PetID は必須です');
  const sh = getSheet_(SHEET_NAMES.PET_JOURNAL);
  if (!sh) throw new Error('シートがありません: ' + SHEET_NAMES.PET_JOURNAL);
  const heads = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0] || [];
  const now = new Date();
  let row = -1;
  if (data.EntryID) row = findRowById_(sh, 'EntryID', data.EntryID);
  let created = now;
  if (row > 0){
    const current = sh.getRange(row,1,1,heads.length).getValues()[0] || [];
    const idxCreated = heads.indexOf('CreatedAt');
    if (idxCreated >= 0 && current[idxCreated]) created = current[idxCreated];
  }
  const rec = Object.assign({
    EntryID: data.EntryID || Utilities.getUuid(),
    PetID: data.PetID,
    CreatedAt: created
  }, mapToHeaders_(heads, data, { UpdatedAt: now }));
  const rowVals = heads.map(h => rec[h] ?? '');
  if (row > 0){
    sh.getRange(row,1,1,heads.length).setValues([rowVals]);
    bumpSyncRev_({sheet:SHEET_NAMES.PET_JOURNAL, reason:'update'});
  } else {
    sh.appendRow(rowVals);
    bumpSyncRev_({sheet:SHEET_NAMES.PET_JOURNAL, reason:'insert'});
  }
  return { ok:true, EntryID: rec.EntryID };
}

function deletePetJournalEntry(entryId){
  if (!entryId) throw new Error('EntryID が指定されていません');
  const sh = getSheet_(SHEET_NAMES.PET_JOURNAL);
  if (!sh) throw new Error('シートがありません: ' + SHEET_NAMES.PET_JOURNAL);
  const row = findRowById_(sh, 'EntryID', entryId);
  if (row > 0){
    sh.deleteRow(row);
    bumpSyncRev_({sheet:SHEET_NAMES.PET_JOURNAL, reason:'delete'});
    return { ok:true };
  }
  return { ok:false, message:'対象が見つかりません' };
}

function updateCustomerLineLink(payload){
  let data = payload || {};
  if (typeof data === 'string'){
    try { data = JSON.parse(data); } catch(e){ data = {}; }
  }
  if (typeof data !== 'object' || !data) data = {};
  const customerId = data.CustomerID || data.customerId;
  if (!customerId) throw new Error('CustomerID は必須です');
  const sh = getSheet_(SHEET_NAMES.CUSTOMERS);
  if (!sh) throw new Error('シートがありません: ' + SHEET_NAMES.CUSTOMERS);
  const row = findRowById_(sh, 'CustomerID', customerId);
  if (row <= 0) throw new Error('お客様情報が見つかりません');
  const heads = sh.getRange(1,1,1,Math.max(1, sh.getLastColumn())).getValues()[0] || [];
  const now = new Date();
  const record = mapToHeaders_(heads, data, {
    CustomerID: customerId,
    UpdatedAt: now,
    LineLinkedAt: data.LineUserID ? (data.LineLinkedAt || now) : ''
  });
  const current = sh.getRange(row,1,1,heads.length).getValues()[0] || [];
  const merged = heads.map((h,i)=> record[h] !== undefined ? record[h] : current[i]);
  sh.getRange(row,1,1,heads.length).setValues([merged]);
  bumpSyncRev_({sheet:SHEET_NAMES.CUSTOMERS, reason:'update'});
  return { ok:true, CustomerID: customerId };
}
/* =============================================================================
   価格選択＆来店登録
   ========================================================================== */
function pickServicePrice_(serviceId, whenDate){
  const list = readTable_(SHEET_NAMES.SERVICES).filter(s=> String(s.ServiceID)===String(serviceId));
  if (!list.length) return null;
  const d = toDateOnly_(whenDate); let best = null;
  list.forEach(s=>{
    const f = s.EffectiveFrom? toDateOnly_(s.EffectiveFrom): new Date('2000-01-01');
    const t = s.EffectiveTo?   toDateOnly_(s.EffectiveTo):   new Date('2999-12-31');
    if (d>=f && d<=t) if (!best || f > toDateOnly_(best.EffectiveFrom||'2000-01-01')) best = s;
  });
  return best || list[0];
}

function createOrderWithItems(order){
  const errors=[];
  if(!order.CustomerID) errors.push('お客様情報が未選択です');
  if(!order.PaymentMethod) errors.push('支払方法が未選択です');
  if(!Array.isArray(order.Items)||!order.Items.length) errors.push('明細が空です');
  const storeId = resolveStoreId_(order);
  const store = storeId ? getStoreById_(storeId) : null;
  const storeType = normalizeStoreType_(store ? store.Type : order.StoreType);
  const requirePet = storeType !== 'HUMAN';
  const pet = order.PetID ? readTable_(SHEET_NAMES.PETS).find(p=> String(p.PetID)===String(order.PetID)) : null;
  if(requirePet && !order.PetID) errors.push('ご愛犬情報が未選択です');
  if(requirePet && !pet) errors.push('ペットIDに誤りがあります');
  if(pet && String(pet.CustomerID)!==String(order.CustomerID)) errors.push('ご愛犬のカルテにお客様情報が登録されていません');
  const payCodes = readTable_(SHEET_NAMES.PAYMENTS).map(p=> String(p.PaymentCode));
  if(!payCodes.includes(String(order.PaymentMethod))) errors.push('この支払方法は登録されていません');
  if(errors.length) throw new Error(errors.join(' / '));

  const visitDate = order.VisitDate ? toDateOnly_(order.VisitDate) : toDateOnly_(new Date());
  const n = x=>Number(x||0);

  const items = order.Items.map((it,i)=>{
    const s = pickServicePrice_(it.ServiceID, visitDate);
    if(!s) throw new Error(`サービス未登録: ${it.ServiceID} (明細${i+1})`);
    const qty  = Math.max(1, Math.min(100, n(it.Quantity||1)));
    const unit = it.UnitPrice!=null ? n(it.UnitPrice) : n(s.Price);
    const rate = n(s.TaxRate||0);
    const sub  = unit*qty, tax = Math.round(sub*rate), tot=sub+tax;
    return { OrderItemID: Utilities.getUuid(), OrderID:'', ServiceID:String(it.ServiceID),
      ServiceName:s.Name, Category:s.Category||'(未分類)', Quantity:qty, UnitPrice:unit,
      TaxRate:rate, LineSubtotal:sub, LineTax:tax, LineTotal:tot };
  });

  const subtotal = items.reduce((a,x)=>a+x.LineSubtotal,0);
  const tax      = items.reduce((a,x)=>a+x.LineTax,0);
  const total    = subtotal + tax;

  const orderId = Utilities.getUuid(), now=new Date();

  // ★ 前受金の自動消化（未指定なら既定で true）
  const usePrepaid = (order.UsePrepaid == null) ? true : isTrue_(order.UsePrepaid);
  let prepaidUsed = 0;
  if (usePrepaid){
    const bal = getPrepaidBalance(order.CustomerID);
    prepaidUsed = Math.min(Number(bal||0), total);
    if (prepaidUsed>0){
      postPrepaidDebit_(order.CustomerID, order.PetID, prepaidUsed, visitDate, orderId, '施術代 前受金消化');
    }
  }
  const remain = Math.max(0, total - prepaidUsed);

  // ★ 現金=売上金、非現金=未収入金（カード/振込/STORES 等）
  const isCash = String(order.PaymentMethod||'')==='CASH';
  const cashPortion = isCash ? remain : 0;
  const arPortion   = isCash ? 0 : remain;

  // ★ ここだけ1回 append（前受金・区分込み）
  appendRow_(SHEET_NAMES.VISITS, {
    OrderID: orderId, StoreID: storeId || '', VisitDate: visitDate, CustomerID: order.CustomerID,
    PetID: order.PetID||'', PaymentMethod: order.PaymentMethod, Staff: order.Staff||'',
    Channel: order.Channel||'', Notes: order.Notes||'',
    Subtotal: subtotal, Tax: tax, Total: total,
    PrepaidUsed: prepaidUsed, CashPortion: cashPortion, ARPortion: arPortion,
    CreatedAt: now
  });

  items.forEach(it=> {
    it.OrderID = orderId;
    it.StoreID = storeId || '';
  });
  appendRows_(SHEET_NAMES.ORDER_ITEMS, items);
  return { ok:true };
}

/* =============================================================================
   掲示板
   ========================================================================== */
function createTicket(t){
  const now = new Date();
  const related = (t.RelatedID != null ? t.RelatedID : (t.Related || ''));
  const description = (t.Description != null ? t.Description : (t.Desc || ''));
  appendRow_(SHEET_NAMES.CHANGEBOARD, {
    TicketID: Utilities.getUuid(),
    Datetime: now,
    Author: Session.getActiveUser().getEmail()||'',
    Category: String(t.Category||''),
    Title: String(t.Title||''),
    Description: String(description),
    Impact: String(t.Impact||''),
    RelatedID: String(related),
    Assignee: String(t.Assignee||''),
    Status: '受付',
    Due: '',
    ApprovedBy: '',
    EffectiveFrom: ''
  });
  return { ok:true };
}

function listTickets(limit){
  const lim = Number(limit||50);
  const list = readTable_(SHEET_NAMES.CHANGEBOARD)
    .sort((a,b)=> (new Date(b.Datetime)) - (new Date(a.Datetime)));
  return list.slice(0, lim);
}

/* =============================================================================
   前受金・会員ユーティリティ
   ========================================================================== */
function ensurePrepaidSheets_(){
  ensureSheet_(SHEET_NAMES.MEMBERS, ['MemberID','CustomerID','PlanName','MonthlyFee','StartDate','EndDate','Active','LastChargedMonth']);
  ensureSheet_(SHEET_NAMES.PREPAID, ['EntryID','CustomerID','PetID','Type','Amount','Date','Source','RelatedID','Memo','CreatedAt']);
}
function yyyymm_(d){ const x=new Date(d); const y=x.getFullYear(); const m=('0'+(x.getMonth()+1)).slice(-2); return `${y}-${m}`; }
function firstOfMonth_(d){ const x=new Date(d||new Date()); return new Date(x.getFullYear(), x.getMonth(), 1); }

function getPrepaidBalancesMap_(){
  ensurePrepaidSheets_();
  const rows = readTable_(SHEET_NAMES.PREPAID);
  const map = new Map();
  rows.forEach(r=>{
    const cid = String(r.CustomerID||''); if (!cid) return;
    const t = (String(r.Type||'').toUpperCase());
    const amt = Number(r.Amount||0) || 0;
    const sign = (t==='CREDIT')? +1 : (t==='DEBIT')? -1 : 0;
    if (!sign || !amt) return;
    map.set(cid, (map.get(cid)||0) + sign*amt);
  });
  return map;
}
function getPrepaidBalance(customerId){
  const m = getPrepaidBalancesMap_();
  return Number(m.get(String(customerId))||0);
}
function postPrepaidCredit_(customerId, amount, date, source, related, memo){
  ensurePrepaidSheets_();
  const now = new Date();
  appendRow_(SHEET_NAMES.PREPAID, {
    EntryID: Utilities.getUuid(),
    CustomerID: String(customerId||''),
    PetID: '',
    Type: 'CREDIT',
    Amount: Number(amount||0) || 0,
    Date: toDateOnly_(date||now),
    Source: String(source||''),
    RelatedID: String(related||''),
    Memo: String(memo||''),
    CreatedAt: now
  });
}
function postPrepaidDebit_(customerId, petId, amount, date, orderId, memo){
  ensurePrepaidSheets_();
  const now = new Date();
  appendRow_(SHEET_NAMES.PREPAID, {
    EntryID: Utilities.getUuid(),
    CustomerID: String(customerId||''),
    PetID: String(petId||''),
    Type: 'DEBIT',
    Amount: Number(amount||0) || 0,
    Date: toDateOnly_(date||now),
    Source: 'VISIT',
    RelatedID: String(orderId||''),
    Memo: String(memo||'前受金消化'),
    CreatedAt: now
  });
}

/* =============================================================================
   ここからフロント対応の新規API
   ========================================================================== */

// --- 顧客 ---
function createCustomer(payload){
  const p = payload || {};
  const storeId = resolveStoreId_(p);
  const res = upsertCustomerCard({
    CustomerID: p.CustomerID||'',
    StoreID: storeId || '',
    Name: p.Name||'',
    Phone: p.Phone||'',
    Email: p.Email||'',
    Addr1: p.Address||'',
    Gender: p.Gender||'',
    Notes: p.Notes||'',
    MemoDue: p.MemoDue||'',
    MemoPinned: p.MemoPinned ? true : false,
    Tags: normalizeIncomingTags_(p.Tags)
  });
  return Object.assign({ ok:true }, res);
}

// --- ペット ---
function createPet(payload){
  const p = payload || {};
  if (!p.CustomerID) throw new Error('CustomerID は必須です');

  let storeId = resolveStoreId_(p);
  if (!storeId){
    const owner = readTable_(SHEET_NAMES.CUSTOMERS).find(c => String(c.CustomerID) === String(p.CustomerID));
    if (owner && owner.StoreID) storeId = String(owner.StoreID);
  }

  const res = upsertPetCard({
    PetID: p.PetID||'',
    CustomerID: p.CustomerID,
    StoreID: storeId || '',
    Name: p.Name||'',
    Kana: p.NameKana||'',
    Species: p.Species||'ご愛犬',
    Breed: p.Breed||'',
    Sex: p.Sex||'',
    DOB: p.DOB||'',
    WeightKg: p.WeightKg||'',
    Color: p.Color||'',
    Hospital: p.Hospital||'',
    NeuterStatus: p.NeuterStatus||'',
    NeuterDate: p.NeuterDate||'',

    // 予防関連（追加）
    VaccineDate: p.VaccineDate||'',
    RabiesDate: p.RabiesDate||'',
    NextVaccine: p.NextVaccine||'',
    NextRabies: p.NextRabies||'',

    // 病歴
    Condition: p.Condition||'',
    OnsetDate: p.OnsetDate||'',
    Treatment: p.Treatment||'',

    // アレルギー・食事
    AllergyFood: p.AllergyFood || p.Allergies || '',
    AllergyEnv: p.AllergyEnv || '',
    Diet: p.Diet||'',
    Supplements: p.Supplements||'',
    Snacks: p.Snacks||'',

    // 性格タグ
    PersonalityTags: p.PersonalityTags || p.Personality || '',

    Notes: p.Notes||'',
    Tags: normalizeIncomingTags_(p.Tags),
    MemoDue: p.MemoDue||'',
    MemoPinned: p.MemoPinned ? true : false
  });
  return Object.assign({ ok:true }, res);
}


function getPetsByCustomer(customerId, options){
  const opts = options ? Object.assign({}, options) : {};
  if (!opts.storeId){
    const owner = readTable_(SHEET_NAMES.CUSTOMERS).find(c => String(c.CustomerID) === String(customerId));
    if (owner && owner.StoreID) opts.storeId = owner.StoreID;
  }
  return listPets(customerId, opts);
}

// --- 会員マスタ ---
function upsertMember(payload){
  ensurePrepaidSheets_();
  const p = payload||{};
  if (!p.CustomerID) throw new Error('CustomerID は必須です');
  const sh = getSheet_(SHEET_NAMES.MEMBERS);
  const heads = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];
  const all = readTable_(SHEET_NAMES.MEMBERS);
  const hit = all.find(r => String(r.CustomerID) === String(p.CustomerID));
  const rec = mapToHeaders_(heads, {
    MemberID: hit? hit.MemberID : Utilities.getUuid(),
    CustomerID: String(p.CustomerID),
    PlanName: p.PlanName || '月額会員',
    MonthlyFee: Number(p.MonthlyFee||13000),
    StartDate: p.StartDate || '',
    EndDate: p.EndDate || '',
    Active: (p.Active===false)? false : true,
    LastChargedMonth: hit? (hit.LastChargedMonth||'') : ''
  });
  if (hit){
    const row = findRowById_(sh,'MemberID',hit.MemberID);
    sh.getRange(row,1,1,heads.length).setValues([heads.map(h=> rec[h] ?? '')]);
    bumpSyncRev_({sheet:SHEET_NAMES.MEMBERS, reason:'update'});
  }else{
    appendRow_(SHEET_NAMES.MEMBERS, rec);
  }
  return { ok:true };
}
function listMembers(limit){
  ensurePrepaidSheets_();
  const lim=Number(limit||200);
  return readTable_(SHEET_NAMES.MEMBERS).slice(0,lim);
}

// 毎月1日の STORES 引き落とし（前受金=Credit）を自動記帳
function postMonthlyMembershipCharges(runDate){
  ensurePrepaidSheets_();
  const when = runDate? new Date(runDate) : new Date();
  const first = firstOfMonth_(when);
  const ym = yyyymm_(first); // 'YYYY-MM'
  const sh = getSheet_(SHEET_NAMES.MEMBERS);
  const heads = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]||[];
  const colLCM = heads.indexOf('LastChargedMonth')+1;

  const list = readTable_(SHEET_NAMES.MEMBERS).filter(m=>{
    if (m.Active===false || (m.Active && !isTrue_(m.Active))) return false;
    const s = m.StartDate? toDateOnly_(m.StartDate) : new Date('2000-01-01');
    const e = m.EndDate?   toDateOnly_(m.EndDate)   : new Date('2999-12-31');
    return (first>=s && first<=e);
  });

  let count = 0;
  list.forEach(m=>{
    if (String(m.LastChargedMonth||'') === ym) return; // 二重計上防止
    const fee = Number(m.MonthlyFee||13000)||13000;
    postPrepaidCredit_(m.CustomerID, fee, first, 'MEMBERSHIP', ym, 'STORES 月会費');
    const row = findRowById_(sh,'MemberID', m.MemberID);
    if (row>0 && colLCM>0) sh.getRange(row, colLCM, 1, 1).setValue(ym);
    count++;
  });
  bumpSyncRev_({sheet:SHEET_NAMES.PREPAID, reason:'monthlyCharge', count});
  return { ok:true, month: ym, charged: count };
}

// （任意）毎月1日実行のトリガーを作成
function ensureMonthlyPrepaidTrigger(){
  const fn = 'postMonthlyMembershipCharges';
  const has = ScriptApp.getProjectTriggers().some(t=> t.getHandlerFunction()===fn);
  if (!has){
    ScriptApp.newTrigger(fn).timeBased().onMonthDay(1).atHour(6).create(); // 現地 06:00
  }
  return { ok:true };
}

// 前受金 残高一覧や個別明細
function listPrepaidLedger(customerId, limit){
  ensurePrepaidSheets_();
  const list = readTable_(SHEET_NAMES.PREPAID).filter(r => !customerId || String(r.CustomerID)===String(customerId));
  list.sort((a,b)=> new Date(b.Date) - new Date(a.Date));
  return (limit? list.slice(0,Number(limit)): list);
}

// --- 施術マスタ ---
function createService(payload){
  const p = payload || {};
  if (!p.ServiceID) throw new Error('ServiceID は必須です');
  if (!p.Name) throw new Error('施術名 は必須です');
  const sh = getSheet_(SHEET_NAMES.SERVICES);
  const heads = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0];
  const row = findRowById_(sh, 'ServiceID', p.ServiceID);
  const rec = mapToHeaders_(heads, {
    ServiceID: p.ServiceID,
    Name: p.Name,
    Category: p.Category||'',
    DurationMin: Number(p.Duration||p.DurationMin||0),
    Price: Number(p.Price||0),
    TaxRate: (p.Tax!=null? Number(p.Tax) : (p.TaxRate!=null? Number(p.TaxRate): '')),
    EffectiveFrom: p.From||p.EffectiveFrom||'',
    EffectiveTo: p.To||p.EffectiveTo||'',
    Active: (p.Active===false)? false : true
  });
  if (row>0){
    sh.getRange(row,1,1,heads.length).setValues([heads.map(h=> rec[h] ?? '')]);
    bumpSyncRev_({sheet:SHEET_NAMES.SERVICES, reason:'update'});
  }else{
    appendRow_(SHEET_NAMES.SERVICES, rec);
  }
  return { ok:true, ServiceID: p.ServiceID };
}

// --- 担当者 ---
function createStaff(payload){
  const p = payload || {};
  if (!p.Name) throw new Error('名前の入力 は必須です');
  const sh = getSheet_(SHEET_NAMES.STAFF);
  const heads = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0];
  const list = readTable_(SHEET_NAMES.STAFF);
  const hit = list.find(r => String(r.Name) === String(p.Name));
  const rec = mapToHeaders_(heads, {
    StaffID: hit? hit.StaffID : Utilities.getUuid(),
    Name: p.Name,
    Role: p.Role||'',
    Active: (p.Active===false)? false : true
  });
  if (hit){
    const row = findRowById_(sh, 'StaffID', hit.StaffID);
    sh.getRange(row,1,1,heads.length).setValues([heads.map(h=> rec[h] ?? '')]);
    bumpSyncRev_({sheet:SHEET_NAMES.STAFF, reason:'update'});
  }else{
    appendRow_(SHEET_NAMES.STAFF, rec);
  }
  return { ok:true };
}

// --- 支払い方法 ---
function createPayment(payload){
  const p = payload || {};
  if (!p.Code) throw new Error('Code は必須です');
  if (!p.Name) throw new Error('Name は必須です');
  const sh = getSheet_(SHEET_NAMES.PAYMENTS);
  const heads = sh.getRange(1,1,1, sh.getLastColumn()).getValues()[0];
  const row = findRowById_(sh, 'PaymentCode', p.Code);

  const rec = mapToHeaders_(heads, {
    PaymentCode: p.Code,
    Name: p.Name,
    FeeRate: (p.FeeRate != null ? Number(p.FeeRate) : ''),
    PayoutDay: p.PayoutDay || '',
    Type: p.Type || '',
    Active: (p.Active === false) ? false : true
  });

  if (row>0){
    sh.getRange(row,1,1,heads.length).setValues([heads.map(h=> rec[h] ?? '')]);
    bumpSyncRev_({sheet:SHEET_NAMES.PAYMENTS, reason:'update'});
  }else{
    appendRow_(SHEET_NAMES.PAYMENTS, rec);
  }
  return { ok:true };
}


// --- 来店記録（記録タブの保存） ---
function createVisit(payload){
  const p = payload || {};
  if (!p.CustomerID) throw new Error('CustomerID は必須です');
  if (!p.ServiceID) throw new Error('ServiceID は必須です');
  if (!p.PaymentMethod) throw new Error('PaymentMethod は必須です');
  if (!p.Staff) throw new Error('施術担当者 は必須です');
  let storeId = resolveStoreId_(p);
  if (!storeId){
    const owner = readTable_(SHEET_NAMES.CUSTOMERS).find(c => String(c.CustomerID) === String(p.CustomerID));
    if (owner && owner.StoreID) storeId = String(owner.StoreID);
  }
  const store = storeId ? getStoreById_(storeId) : null;
  const storeType = normalizeStoreType_(store ? store.Type : (p.StoreType || 'PET'));
  const requirePet = storeType !== 'HUMAN';
  if (requirePet && !p.PetID) throw new Error('PetID は必須です');
  const order = {
    StoreID: storeId || '',
    StoreType: storeType,
    CustomerID: p.CustomerID,
    PetID: requirePet ? p.PetID : '',
    PaymentMethod: p.PaymentMethod,
    Staff: p.Staff,
    Notes: p.Notes||'',
    VisitDate: p.VisitDate || new Date(),
    Items: [{ ServiceID: p.ServiceID, Quantity: Number(p.Quantity||1) }],
    UsePrepaid: (p.UsePrepaid == null) ? true : isTrue_(p.UsePrepaid)
  };
  return createOrderWithItems(order);
}

// --- 顧客の来店履歴（記録タブ下部リスト） ---
function listVisitsByCustomer(customerId){
  const services = new Map(readTable_(SHEET_NAMES.SERVICES).map(s=>[String(s.ServiceID), s]));
  const owner = readTable_(SHEET_NAMES.CUSTOMERS).find(c => String(c.CustomerID) === String(customerId));
  const storeId = owner ? owner.StoreID : '';
  const orders = readTable_(SHEET_NAMES.VISITS)
    .filter(v => String(v.CustomerID) === String(customerId))
    .filter(v => matchesStore_(v.StoreID, storeId));
  const items  = readTable_(SHEET_NAMES.ORDER_ITEMS);
  const itemsByOrder = new Map();
  items.forEach(it=>{
    const k = String(it.OrderID||'');
    const a = itemsByOrder.get(k)||[];
    a.push(it); itemsByOrder.set(k,a);
  });
  const out = [];
  orders.forEach(o=>{
    (itemsByOrder.get(String(o.OrderID))||[]).forEach(line=>{
      out.push({
        VisitDate: toDateOnly_(o.VisitDate),
        ServiceID: String(line.ServiceID||''),
        ServiceName: String(line.ServiceName || (services.get(String(line.ServiceID))||{}).Name || ''),
        Quantity: Number(line.Quantity||0),
        PaymentMethod: String(o.PaymentMethod||''),
        Staff: String(o.Staff||''),
        Total: Number(line.LineTotal||0),
        Notes: String(o.Notes||'')
      });
    });
  });
  out.sort((a,b)=> toDateOnly_(b.VisitDate) - toDateOnly_(a.VisitDate));
  return out.slice(0, 50);
}

// --- 予約（カレンダー） ---
function createReservation(payload){
  const p = payload || {};
  const required = ['CustomerID','PetID','ServiceID','Staff','Date','Start','End'];
  const miss = required.filter(k=> !p[k]);
  if (miss.length) throw new Error('必須項目が未入力: ' + miss.join(', '));
  ensureSheet_(SHEET_NAMES.RESERVATIONS, RESERVATION_HEADERS);
  const now = new Date();
  const storeId = resolveStoreId_(p.StoreID || p.storeId || p.Store || p.store || '');
  const reminderRaw = (p.ReminderEnabled !== undefined) ? p.ReminderEnabled : p.reminderEnabled;
  const reminder = (reminderRaw === undefined || reminderRaw === '') ? true : isTrue_(reminderRaw);
  appendRow_(SHEET_NAMES.RESERVATIONS, {
    ReservationID: Utilities.getUuid(),
    CustomerID: String(p.CustomerID),
    PetID: String(p.PetID),
    ServiceID: String(p.ServiceID),
    Staff: String(p.Staff),
    Date: toDateOnly_(p.Date),
    Start: String(p.Start),
    End: String(p.End),
    Title: String(p.Title||''),
    Notes: String(p.Notes||''),
    CreatedAt: now,
    StoreID: storeId,
    ReminderEnabled: reminder
  });
  return { ok:true };
}

function listReservations(limit){
  const lim = Number(limit||50);
  ensureSheet_(SHEET_NAMES.RESERVATIONS, RESERVATION_HEADERS);
  const list = readTable_(SHEET_NAMES.RESERVATIONS)
    .map(normalizeReservationRecord_)
    .filter(Boolean)
    .sort((a,b)=>{
      const as = `${a.Date || ''} ${a.Start || ''}`.trim();
      const bs = `${b.Date || ''} ${b.Start || ''}`.trim();
      return as.localeCompare(bs);
    });
  return list.slice(0, lim);
}

// --- スタッフ連絡事項 ---
function createStaffNote(payload){
  const p = payload || {};
  if (!p.Title) throw new Error('タイトル は必須です');
  ensureSheet_(SHEET_NAMES.STAFF_NOTES, ['NoteID','Category','Title','Audience','Pinned','Body','CreatedAt']);
  appendRow_(SHEET_NAMES.STAFF_NOTES, {
    NoteID: Utilities.getUuid(),
    Category: String(p.Category||''),
    Title: String(p.Title||''),
    Audience: String(p.Audience||''),
    Pinned: !!p.Pinned,
    Body: String(p.Body||''),
    CreatedAt: new Date()
  });
  return { ok:true };
}

function listStaffNotes(limit){
  const lim = Number(limit||50);
  ensureSheet_(SHEET_NAMES.STAFF_NOTES, ['NoteID','Category','Title','Audience','Pinned','Body','CreatedAt']);
  const list = readTable_(SHEET_NAMES.STAFF_NOTES)
    .sort((a,b)=> (new Date(b.CreatedAt)) - (new Date(a.CreatedAt)));
  return list.slice(0, lim);
}

/* =============================================================================
   期間集計（既存APIそのまま維持）
   ========================================================================== */
function getAccountingSummary(from, to){
  const f = normalizeYMD_(from)||'0000-01-01';
  const t = normalizeYMD_(to)||'9999-12-31';
  const inRange = (d)=> {
    const s = normalizeYMD_(d)||''; return (s && s>=f && s<=t);
  };
  const visits = readTable_(SHEET_NAMES.VISITS).filter(v=> inRange(v.VisitDate));
  const total = visits.reduce((a,x)=> a + Number(x.Total||0), 0);
  const cash  = visits.reduce((a,x)=> a + Number(x.CashPortion||0), 0);
  const ar    = visits.reduce((a,x)=> a + Number(x.ARPortion||0), 0);
  const used  = visits.reduce((a,x)=> a + Number(x.PrepaidUsed||0), 0);

  const pre = readTable_(SHEET_NAMES.PREPAID).filter(r=> inRange(r.Date));
  const credit = pre.filter(r=> String(r.Type).toUpperCase()==='CREDIT').reduce((a,x)=> a+Number(x.Amount||0),0);
  const debit  = pre.filter(r=> String(r.Type).toUpperCase()==='DEBIT').reduce((a,x)=> a+Number(x.Amount||0),0);

  return { ok:true, period:{from:f,to:t},
    salesTotal: total, cashSales: cash, uncollected: ar,
    prepaid: { credit, debit, net: credit - debit },
    prepaidUsedInVisits: used
  };
}

function searchInvoices(query, options){
  const q = String(query||'').trim().toLowerCase();
  const opt = options || {};
  const from = normalizeYMD_(opt.from) || '';
  const to = normalizeYMD_(opt.to) || '';
  const status = String(opt.status||'').toUpperCase();
  const payment = String(opt.payment||'').trim();
  const limit = Number(opt.limit||0);

  const visits = readTable_(SHEET_NAMES.VISITS) || [];
  const customers = new Map(readTable_(SHEET_NAMES.CUSTOMERS).map(c=>[String(c.CustomerID), c]));
  const pets = new Map(readTable_(SHEET_NAMES.PETS).map(p=>[String(p.PetID), p]));
  const paymentsMaster = new Map(readTable_(SHEET_NAMES.PAYMENTS).map(p=>[String(p.PaymentCode), p]));

  const results = [];
  visits.forEach(v=>{
    const date = normalizeYMD_(v.VisitDate) || '';
    if (from && date && date < from) return;
    if (to && date && date > to) return;
    if (payment && String(v.PaymentMethod||'') !== payment) return;
    const pending = Number(v.ARPortion||0) > 0;
    if (status === 'PENDING' && !pending) return;
    if (status === 'PAID' && pending) return;

    if (q){
      const cust = customers.get(String(v.CustomerID)) || {};
      const pet = pets.get(String(v.PetID)) || {};
      const hay = [
        v.OrderID, v.VisitID, v.CustomerID, v.PetID,
        cust.Name, pet.DogName || pet.Name, v.Notes,
        v.PaymentMethod
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return;
    }

    const customer = customers.get(String(v.CustomerID)) || {};
    const pet = pets.get(String(v.PetID)) || {};
    const pay = paymentsMaster.get(String(v.PaymentMethod)) || {};
    const balance = pending ? Number(v.ARPortion||0) : 0;
    results.push({
      OrderID: v.OrderID || v.VisitID || '',
      VisitDate: date,
      CustomerID: v.CustomerID || '',
      CustomerName: customer.Name || '',
      PetID: v.PetID || '',
      PetName: pet.DogName || pet.Name || '',
      PaymentMethod: v.PaymentMethod || '',
      PaymentName: pay.Name || v.PaymentMethod || '',
      PaymentMemo: pay.Type ? `種別:${pay.Type}` : '',
      Total: Number(v.Total||0),
      Balance: balance,
      Status: pending ? 'PENDING' : 'PAID',
      StatusLabel: pending ? '支払待ち' : '支払済み',
      Notes: v.Notes || '',
      Staff: v.Staff || ''
    });
  });

  results.sort((a,b)=> String(b.VisitDate||'').localeCompare(String(a.VisitDate||'')) || String(b.OrderID||'').localeCompare(String(a.OrderID||'')));
  if (limit && limit > 0 && results.length > limit){ results.length = limit; }

  const pendingRows = results.filter(r=> r.Status === 'PENDING');
  const summary = {
    count: results.length,
    total: results.reduce((sum,row)=> sum + Number(row.Total||0), 0),
    pendingCount: pendingRows.length,
    pendingTotal: pendingRows.reduce((sum,row)=> sum + Number(row.Balance||0), 0),
    period: { from: from||'', to: to||'' }
  };

  return { ok:true, results, summary };
}
function searchInvoices(query, options){
  const q = String(query||'').trim().toLowerCase();
  const opt = options || {};
  const from = normalizeYMD_(opt.from) || '';
  const to = normalizeYMD_(opt.to) || '';
  const status = String(opt.status||'').toUpperCase();
  const payment = String(opt.payment||'').trim();
  const limit = Number(opt.limit||0);
  const storeId = resolveStoreId_(opt);

  const visits = readTable_(SHEET_NAMES.VISITS) || [];
  const customers = new Map(readTable_(SHEET_NAMES.CUSTOMERS).map(c=>[String(c.CustomerID), c]));
  const pets = new Map(readTable_(SHEET_NAMES.PETS).map(p=>[String(p.PetID), p]));
  const paymentsMaster = new Map(readTable_(SHEET_NAMES.PAYMENTS).map(p=>[String(p.PaymentCode), p]));

  const results = [];
  visits.forEach(v=>{
    if (!matchesStore_(v.StoreID, storeId)) return;
    const date = normalizeYMD_(v.VisitDate) || '';
    if (from && date && date < from) return;
    if (to && date && date > to) return;
    if (payment && String(v.PaymentMethod||'') !== payment) return;
    const pending = Number(v.ARPortion||0) > 0;
    if (status === 'PENDING' && !pending) return;
    if (status === 'PAID' && pending) return;

    if (q){
      const cust = customers.get(String(v.CustomerID)) || {};
      const pet = pets.get(String(v.PetID)) || {};
      const hay = [
        v.OrderID, v.VisitID, v.CustomerID, v.PetID,
        cust.Name, pet.DogName || pet.Name, v.Notes,
        v.PaymentMethod
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return;
    }

    const customer = customers.get(String(v.CustomerID)) || {};
    const pet = pets.get(String(v.PetID)) || {};
    const pay = paymentsMaster.get(String(v.PaymentMethod)) || {};
    const balance = pending ? Number(v.ARPortion||0) : 0;
    results.push({
      OrderID: v.OrderID || v.VisitID || '',
      StoreID: String(v.StoreID||''),
      VisitDate: date,
      CustomerID: v.CustomerID || '',
      CustomerName: customer.Name || '',
      PetID: v.PetID || '',
      PetName: pet.DogName || pet.Name || '',
      PaymentMethod: v.PaymentMethod || '',
      PaymentName: pay.Name || v.PaymentMethod || '',
      PaymentMemo: pay.Type ? `種別:${pay.Type}` : '',
      Total: Number(v.Total||0),
      Balance: balance,
      Status: pending ? 'PENDING' : 'PAID',
      StatusLabel: pending ? '支払待ち' : '支払済み',
      Notes: v.Notes || '',
      Staff: v.Staff || ''
    });
  });

  results.sort((a,b)=> String(b.VisitDate||'').localeCompare(String(a.VisitDate||'')) || String(b.OrderID||'').localeCompare(String(a.OrderID||'')));
  if (limit && limit > 0 && results.length > limit){ results.length = limit; }

  const pendingRows = results.filter(r=> r.Status === 'PENDING');
  const uniqueCustomers = new Set(results.map(r => String(r.CustomerID||'').trim()).filter(Boolean));
  const summary = {
    count: results.length,
    total: results.reduce((sum,row)=> sum + Number(row.Total||0), 0),
    pendingCount: pendingRows.length,
    pendingTotal: pendingRows.reduce((sum,row)=> sum + Number(row.Balance||0), 0),
    period: { from: from||'', to: to||'' },
    uniqueCustomers: uniqueCustomers.size,
    unitPrice: uniqueCustomers.size ? (results.reduce((sum,row)=> sum + Number(row.Total||0), 0) / uniqueCustomers.size) : 0
  };

  return { ok:true, results, summary };
}
/* =============================================================================
   ★ 追加：会計レポート・API
   ========================================================================== */

function _currentMonthRange_(){
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth()+1, 0);
  return {from: toYMD_(from), to: toYMD_(to)};
}

function _inRangeYMD_(d, f, t){
  const s = normalizeYMD_(d)||''; return (s && s>=f && s<=t);
}

function getAccountingData(from, to){
  const range = (from && to) ? {from:normalizeYMD_(from), to:normalizeYMD_(to)} : _currentMonthRange_();
  const f = range.from, t = range.to;

  const visits = readTable_(SHEET_NAMES.VISITS).filter(v => _inRangeYMD_(v.VisitDate, f, t));
  const items  = readTable_(SHEET_NAMES.ORDER_ITEMS);
  const paymentsMaster = new Map(readTable_(SHEET_NAMES.PAYMENTS).map(p=>[String(p.PaymentCode), p]));

  const itemsByOrder = new Map();
  items.forEach(it=>{
    const k = String(it.OrderID||''); const a = itemsByOrder.get(k)||[]; a.push(it); itemsByOrder.set(k,a);
  });

  // ① サマリー
  const subtotal = visits.reduce((a,x)=> a + Number(x.Subtotal||0), 0);
  const tax      = visits.reduce((a,x)=> a + Number(x.Tax||0), 0);
  const total    = visits.reduce((a,x)=> a + Number(x.Total||0), 0);
  const cash     = visits.reduce((a,x)=> a + Number(x.CashPortion||0), 0);
  const ar       = visits.reduce((a,x)=> a + Number(x.ARPortion||0), 0);
  const prepaidUsed = visits.reduce((a,x)=> a + Number(x.PrepaidUsed||0), 0);
  const pre = readTable_(SHEET_NAMES.PREPAID).filter(r=> _inRangeYMD_(r.Date, f, t));
  const credit = pre.filter(r=> String(r.Type).toUpperCase()==='CREDIT').reduce((a,x)=> a+Number(x.Amount||0),0);
  const debit  = pre.filter(r=> String(r.Type).toUpperCase()==='DEBIT').reduce((a,x)=> a+Number(x.Amount||0),0);

  // ② 日次売上
  const byDate = new Map();
  visits.forEach(v=>{
    const d = normalizeYMD_(v.VisitDate);
    const cur = byDate.get(d) || {date:d, count:0, subtotal:0, tax:0, total:0, cash:0, ar:0, prepaidUsed:0};
    cur.count += 1;
    cur.subtotal += Number(v.Subtotal||0);
    cur.tax      += Number(v.Tax||0);
    cur.total    += Number(v.Total||0);
    cur.cash     += Number(v.CashPortion||0);
    cur.ar       += Number(v.ARPortion||0);
    cur.prepaidUsed += Number(v.PrepaidUsed||0);
    byDate.set(d, cur);
  });
  const daily = Array.from(byDate.values()).sort((a,b)=> a.date.localeCompare(b.date));

  // ③ 決済別
  const byPay = new Map();
  visits.forEach(v=>{
    const code = String(v.PaymentMethod||'');
    const cur = byPay.get(code) || {PaymentCode:code, Name:'', count:0, total:0, cash:0, ar:0};
    cur.count += 1;
    cur.total += Number(v.Total||0);
    cur.cash  += Number(v.CashPortion||0);
    cur.ar    += Number(v.ARPortion||0);
    const m = paymentsMaster.get(code)||{};
    cur.Name = m.Name || code;
    byPay.set(code, cur);
  });
  const byPayment = Array.from(byPay.values()).sort((a,b)=> b.total - a.total);

  // ④ サービスカテゴリ別（明細×会計日）
  const services = new Map(readTable_(SHEET_NAMES.SERVICES).map(s=>[String(s.ServiceID), s]));
  const orderDateMap = new Map(visits.map(v=>[String(v.OrderID), normalizeYMD_(v.VisitDate)]));
  const categoryAgg = new Map();
  items.forEach(it=>{
    const oid = String(it.OrderID||''); const d = orderDateMap.get(oid);
    if (!d || !_inRangeYMD_(d, f, t)) return;
    const s = services.get(String(it.ServiceID)) || {};
    const cat = String(s.Category||'(未分類)');
    const cur = categoryAgg.get(cat) || {Category:cat, qty:0, subtotal:0, tax:0, total:0};
    cur.qty += Number(it.Quantity||0);
    cur.subtotal += Number(it.LineSubtotal||0);
    cur.tax      += Number(it.LineTax||0);
    cur.total    += Number(it.LineTotal||0);
    categoryAgg.set(cat, cur);
  });
  const byCategory = Array.from(categoryAgg.values()).sort((a,b)=> b.total - a.total);

  // ⑤ 前受金台帳（期間内）
  const prepaidRows = pre.slice().sort((a,b)=> (normalizeYMD_(a.Date)||'').localeCompare(normalizeYMD_(b.Date)||''));

  return {
    ok:true,
    period:{from:f, to:t},
    summary:{ subtotal, tax, total, cash, ar, prepaidUsed, prepaid:{credit, debit, net: credit-debit} },
    daily,
    byPayment,
    byCategory,
    prepaid: prepaidRows
  };
}

// ★ 会計シートを再構築（今月が既定）
function rebuildAccountingSheet(from, to){
  const data = getAccountingData(from, to);
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAMES.ACCOUNTING);
  if (!sh) sh = ss.insertSheet(SHEET_NAMES.ACCOUNTING);
  sh.clear();

  let r = 1;

  // ① 期間サマリー
  const H1 = ['Key','JP','Value'];
  const J1 = ['キー','日本語','値'];
  const rows1 = [
    ['periodFrom','期間(自)','' + data.period.from],
    ['periodTo','期間(至)','' + data.period.to],
    ['subtotal','小計(税抜)', data.summary.subtotal],
    ['tax','消費税', data.summary.tax],
    ['total','合計(税込)', data.summary.total],
    ['cash','現金入金', data.summary.cash],
    ['ar','未収入金', data.summary.ar],
    ['prepaidUsed','前受金消化(売上側)', data.summary.prepaidUsed],
    ['prepaidCredit','前受金 計上(+)', data.summary.prepaid.credit],
    ['prepaidDebit','前受金 消化(-)', data.summary.prepaid.debit],
    ['prepaidNet','前受金 純増減', data.summary.prepaid.net]
  ];
  r = _writeTable_(sh, r, H1, J1, rows1);

  r += 2;

  // ② 日次売上
  const H2 = ['Date','JP','Count','Subtotal','Tax','Total','Cash','AR','PrepaidUsed'];
  const J2 = ['日付','日本語','件数','小計(税抜)','消費税','合計(税込)','現金入金','未収入金','前受金消化'];
  const rows2 = data.daily.map(d => [d.date,'',d.count,d.subtotal,d.tax,d.total,d.cash,d.ar,d.prepaidUsed]);
  r = _writeTable_(sh, r, H2, J2, rows2);

  r += 2;

  // ③ 決済別
  const H3 = ['PaymentCode','Name','Count','Total','Cash','AR'];
  const J3 = ['決済コード','決済名称','件数','税込合計','現金入金','未収入金'];
  const rows3 = data.byPayment.map(p => [p.PaymentCode, p.Name, p.count, p.total, p.cash, p.ar]);
  r = _writeTable_(sh, r, H3, J3, rows3);

  r += 2;

  // ④ サービスカテゴリ別
  const H4 = ['Category','Qty','Subtotal','Tax','Total'];
  const J4 = ['カテゴリ','数量','小計(税抜)','消費税','合計(税込)'];
  const rows4 = data.byCategory.map(c => [c.Category, c.qty, c.subtotal, c.tax, c.total]);
  r = _writeTable_(sh, r, H4, J4, rows4);

  r += 2;

  // ⑤ 前受金台帳（期間）
  const H5 = ['Date','Type','Amount','CustomerID','PetID','RelatedID','Memo','CreatedAt'];
  const J5 = ['日付','種類','金額','顧客ID','ペットID','関連ID','メモ','作成日時'];
  const rows5 = data.prepaid.map(x => [normalizeYMD_(x.Date), x.Type, Number(x.Amount||0), x.CustomerID||'', x.PetID||'', x.RelatedID||'', x.Memo||'', x.CreatedAt||'']);
  r = _writeTable_(sh, r, H5, J5, rows5);

  // 体裁（1列目広め）
  sh.setColumnWidths(1, 1, 140);

  bumpSyncRev_({sheet:SHEET_NAMES.ACCOUNTING, reason:'rebuild'});
  return { ok:true, period: data.period, rows: {summary: rows1.length, daily: rows2.length, payment: rows3.length, category: rows4.length, prepaid: rows5.length} };
}

function _writeTable_(sh, startRow, heads, jlabels, rows){
  sh.getRange(startRow, 1, 1, heads.length).setValues([heads]);
  sh.getRange(startRow+1, 1, 1, jlabels.length).setValues([jlabels]);
  if (rows && rows.length){
    sh.getRange(startRow+2, 1, rows.length, heads.length).setValues(rows);
  }
  // 見やすさのため枠線
  const totalRows = 2 + (rows? rows.length : 0);
  sh.getRange(startRow, 1, totalRows, heads.length).setBorder(true,true,true,true,true,true);
  return startRow + totalRows;
}

// 今月分ショートカット
function rebuildAccountingSheetCurrentMonth(){
  return rebuildAccountingSheet();
}

function downloadMonthlySales(options){
  const payload = (typeof options === 'string' || options instanceof String)
    ? { month: String(options) }
    : (options || {});
  const ym = (String(payload.month||payload.Month||'').trim() || yyyymm_(new Date()));
  const parts = ym.split('-');
  const year = Number(parts[0]) || new Date().getFullYear();
  const monthIdx = (Number(parts[1])||1) - 1;
  const from = toYMD_(new Date(year, monthIdx, 1));
  const to = toYMD_(new Date(year, monthIdx + 1, 0));

  const storeId = resolveStoreId_(payload);
  const invoiceRes = searchInvoices('', {from, to, storeId});
  const invoices = invoiceRes?.results || [];

  const items = readTable_(SHEET_NAMES.ORDER_ITEMS) || [];
  const itemsByOrder = new Map();
  items.forEach(it=>{
    const key = String(it.OrderID||'');
    if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
    itemsByOrder.get(key).push(it);
  });

  const header = ['VisitDate','OrderID','StoreID','CustomerID','CustomerName','PetID','PetName','PaymentMethod','PaymentName','Status','Total','Balance','ServiceID','ServiceName','Quantity','UnitPrice','LineTotal'];
  const rows = [header];

  invoices.forEach(inv=>{
    const orderItems = itemsByOrder.get(String(inv.OrderID)) || [];
    if (!orderItems.length){
      rows.push([
        inv.VisitDate||'', inv.OrderID||'', inv.StoreID||'', inv.CustomerID||'', inv.CustomerName||'',
        inv.PetID||'', inv.PetName||'', inv.PaymentMethod||'', inv.PaymentName||'',
        inv.StatusLabel || inv.Status || '', Number(inv.Total||0), Number(inv.Balance||0), '', '', '', '', ''
      ]);
      return;
    }
    orderItems.forEach(it=>{
      rows.push([
        inv.VisitDate||'', inv.OrderID||'', inv.StoreID||'', inv.CustomerID||'', inv.CustomerName||'',
        inv.PetID||'', inv.PetName||'', inv.PaymentMethod||'', inv.PaymentName||'',
        inv.StatusLabel || inv.Status || '', Number(inv.Total||0), Number(inv.Balance||0),
        it.ServiceID||'', it.ServiceName||'', it.Quantity||'', it.UnitPrice||'', it.LineTotal||''
      ]);
    });
  });

  const csv = rows.map(r=> r.map(csvEscape_).join(',')).join('\r\n');
  const filename = `sales-${ym}.csv`;
  const blob = Utilities.newBlob(csv, 'text/csv', filename);
  const base64 = Utilities.base64Encode(blob.getBytes());
  return { ok:true, filename, mimeType:'text/csv', base64, period:{from, to} };
}

function resolveDailyRange_(range){
  const input = range || {};
  let from = normalizeYMD_(input.from) || '';
  let to = normalizeYMD_(input.to) || '';
  if (!from || !to){
    const daysRaw = Number(input.preset || input.days || 30);
    const days = (isFinite(daysRaw) && daysRaw > 0) ? Math.round(daysRaw) : 30;
    const end = new Date(); end.setHours(0,0,0,0);
    const start = new Date(end); start.setDate(start.getDate() - (days-1));
    from = toYMD_(start); to = toYMD_(end);
    return { from, to, preset: String(days) };
  }
  if (from > to){ const tmp = from; from = to; to = tmp; }
  return { from, to, preset: input.preset ? String(input.preset) : '' };
}

function getDailySalesReport(range){
  const resolved = resolveDailyRange_(range);
  const from = resolved.from;
  const to = resolved.to;
  const storeId = resolveStoreId_(range);

  const visits = readTable_(SHEET_NAMES.VISITS) || [];
  const customers = new Map((readTable_(SHEET_NAMES.CUSTOMERS)||[]).map(c=>[String(c.CustomerID||''), c]));
  const pets = new Map((readTable_(SHEET_NAMES.PETS)||[]).map(p=>[String(p.PetID||''), p]));
  const payments = new Map((readTable_(SHEET_NAMES.PAYMENTS)||[]).map(p=>[String(p.PaymentCode||''), p]));
  const services = new Map((readTable_(SHEET_NAMES.SERVICES)||[]).map(s=>[String(s.ServiceID||''), s]));

  const items = readTable_(SHEET_NAMES.ORDER_ITEMS) || [];
  const itemsByOrder = new Map();
  items.forEach(it=>{
    const key = String(it.OrderID||'');
    if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
    itemsByOrder.get(key).push(it);
  });

  const dailyMap = new Map();
  const details = {};
  const summaryCustomers = new Set();

  visits.forEach(v=>{
    if (!matchesStore_(v.StoreID, storeId)) return;
    const date = normalizeYMD_(v.VisitDate) || '';
    if (!date || date < from || date > to) return;
    if (!dailyMap.has(date)) dailyMap.set(date, { date, total:0, count:0, cash:0, ar:0, prepaid:0, customers: new Set() });
    const entry = dailyMap.get(date);
    const total = Number(v.Total||0);
    entry.total += total;
    entry.count += 1;
    entry.cash += Number(v.CashPortion||0);
    entry.ar += Number(v.ARPortion||0);
    entry.prepaid += Number(v.PrepaidUsed||0);
    const customerKey = String(v.CustomerID||'').trim();
    if (customerKey){
      entry.customers.add(customerKey);
      summaryCustomers.add(customerKey);
    }

    const orderId = String(v.OrderID || v.VisitID || '');
    const cust = customers.get(String(v.CustomerID||'')) || {};
    const pet = pets.get(String(v.PetID||'')) || {};
    const pay = payments.get(String(v.PaymentMethod||'')) || {};
    const orderItems = itemsByOrder.get(orderId) || [];

    const visitDetail = {
      orderId,
      visitId: String(v.VisitID||''),
      visitDate: date,
      customerId: String(v.CustomerID||''),
      customerName: String(cust.Name||''),
      petId: String(v.PetID||''),
      petName: String(pet.Name||''),
      storeId: String(v.StoreID||''),
      paymentMethod: String(v.PaymentMethod||''),
      paymentName: String(pay.Name||v.PaymentMethod||''),
      total,
      balance: Number(v.ARPortion||0),
      cashPortion: Number(v.CashPortion||0),
      prepaidUsed: Number(v.PrepaidUsed||0),
      staff: String(v.Staff||''),
      notes: String(v.Notes||''),
      items: []
    };

    if (orderItems.length){
      visitDetail.items = orderItems.map(it=>({
        serviceId: String(it.ServiceID||''),
        serviceName: String(it.ServiceName||services.get(String(it.ServiceID||''))?.Name||''),
        quantity: Number(it.Quantity||0),
        unitPrice: Number(it.UnitPrice||0),
        lineTotal: Number(it.LineTotal||0)
      }));
    }else if (v.ServiceID || v.ServiceName){
      visitDetail.items = [{
        serviceId: String(v.ServiceID||''),
        serviceName: String(v.ServiceName||services.get(String(v.ServiceID||''))?.Name||''),
        quantity: Number(v.Quantity||1) || 1,
        unitPrice: Number(v.UnitPrice||0),
        lineTotal: total
      }];
    }

    (details[date] || (details[date] = [])).push(visitDetail);
  });

  const daily = Array.from(dailyMap.values()).map(row => {
    const unique = row.customers ? row.customers.size : 0;
    return {
      date: row.date,
      total: row.total,
      count: row.count,
      cash: row.cash,
      ar: row.ar,
      prepaid: row.prepaid,
      uniqueCustomers: unique,
      unitPrice: unique ? row.total / unique : (row.count ? row.total / row.count : 0)
    };
  }).sort((a,b)=> a.date.localeCompare(b.date));
  const summaryTotal = daily.reduce((sum,row)=> sum + Number(row.total||0), 0);
  const summaryCount = daily.reduce((sum,row)=> sum + Number(row.count||0), 0);
  const summary = {
    total: summaryTotal,
    count: summaryCount,
    average: daily.length ? summaryTotal / daily.length : 0,
    max: daily.reduce((m,row)=> Math.max(m, Number(row.total||0)), 0),
    cash: daily.reduce((sum,row)=> sum + Number(row.cash||0), 0),
    ar: daily.reduce((sum,row)=> sum + Number(row.ar||0), 0),
    prepaid: daily.reduce((sum,row)=> sum + Number(row.prepaid||0), 0),
    uniqueCustomers: summaryCustomers.size,
    unitPrice: summaryCustomers.size ? (summaryTotal / summaryCustomers.size) : (summaryCount ? summaryTotal / summaryCount : 0)
  };

  return { ok:true, period: { from, to }, summary, daily, details };
}

function downloadDailySalesCsv(range){
  const report = getDailySalesReport(range) || { period:{}, daily:[] };
  const rows = [['Date','Sales','VisitCount','CashPortion','ARPortion','PrepaidUsed','UniqueCustomers','CustomerUnitPrice']];
  (report.daily||[]).forEach(row=>{
    rows.push([
      row.date||'',
      Number(row.total||0),
      Number(row.count||0),
      Number(row.cash||0),
      Number(row.ar||0),
      Number(row.prepaid||0),
      Number(row.uniqueCustomers||0),
      Number(row.unitPrice||0)
    ]);
  });
  const csv = rows.map(r=> r.map(csvEscape_).join(',')).join('\r\n');
  const labelFrom = report.period?.from || 'start';
  const labelTo = report.period?.to || 'end';
  const filename = `daily-sales-${labelFrom}-${labelTo}.csv`;
  const blob = Utilities.newBlob(csv, 'text/csv', filename);
  const base64 = Utilities.base64Encode(blob.getBytes());
  return { ok:true, filename, mimeType:'text/csv', base64, period: report.period };
}

function csvEscape_(value){
  const str = String(value ?? '');
  if (/[",\n]/.test(str)){ return '"' + str.replace(/"/g,'""') + '"'; }
  return str;
}
/* =============================================================================
   物販・会員・イベント管理
   ========================================================================== */
function listStoreMembers(filter){
  const storeId = resolveStoreId_(filter);
  const todayStr = toYMD_(new Date());
  const customersMap = new Map((readTable_(SHEET_NAMES.CUSTOMERS) || []).map(c => [String(c.CustomerID || ''), c]));
  const rows = readTable_(SHEET_NAMES.MEMBERS) || [];
  const list = [];

  rows.forEach(row => {
    const customerId = String(row.CustomerID || '').trim();
    const customer = customersMap.get(customerId) || {};
    const explicitStore = String(row.StoreID || '').trim();
    const inferredStore = explicitStore || String(customer.StoreID || '').trim();
    if (storeId && inferredStore && !matchesStore_(inferredStore, storeId)) return;
    const start = normalizeYMD_(row.StartDate || row.Start || '');
    const end = normalizeYMD_(row.EndDate || row.End || '');
    const activeFlag = row.Active === undefined ? true : isTrue_(row.Active);
    const active = activeFlag && (!end || end >= todayStr);
    const remaining = end ? diffDays_(end, todayStr) : null;
    list.push({
      MemberID: String(row.MemberID || row.Id || row.ID || '').trim(),
      CustomerID: customerId,
      CustomerName: String(row.CustomerName || customer.Name || '').trim(),
      PlanName: String(row.PlanName || row.Plan || '').trim(),
      MonthlyFee: Number(row.MonthlyFee || row.Fee || 0) || 0,
      StartDate: start,
      EndDate: end,
      Status: active ? 'ACTIVE' : 'INACTIVE',
      Active: active,
      RawActive: activeFlag,
      RemainingDays: remaining,
      StoreID: inferredStore,
      LastChargedMonth: String(row.LastChargedMonth || row.LastCharged || '').trim()
    });
  });

  list.sort((a, b) => {
    if (a.Active !== b.Active) return a.Active ? -1 : 1;
    const endA = a.EndDate || '';
    const endB = b.EndDate || '';
    if (endA && endB && endA !== endB) return endA.localeCompare(endB);
    return (a.CustomerName || '').localeCompare(b.CustomerName || '', 'ja');
  });

  const activeCount = list.filter(m => m.Active).length;
  const inactiveCount = list.length - activeCount;
  const endingSoon = list.filter(m => m.Active && typeof m.RemainingDays === 'number' && m.RemainingDays >= 0 && m.RemainingDays <= 30).length;
  const monthlyFee = list.filter(m => m.Active).reduce((sum, m) => sum + Number(m.MonthlyFee || 0), 0);

  return {
    ok: true,
    members: list,
    summary: {
      total: list.length,
      active: activeCount,
      inactive: inactiveCount,
      endingSoon,
      monthlyFee
    }
  };
}

function listMerchandiseCatalog_(options){
  const storeId = resolveStoreId_(options);
  const rows = readTable_(SHEET_NAMES.MERCH) || [];
  const goods = rows.filter(row => {
    const rowStore = String(row.StoreID || '').trim();
    if (!storeId) return true;
    if (!rowStore) return true;
    return matchesStore_(rowStore, storeId);
  }).map(row => ({
    ProductID: String(row.ProductID || row.Id || '').trim(),
    SKU: String(row.SKU || row.Sku || '').trim(),
    Name: String(row.Name || '').trim() || '(未設定)',
    Category: String(row.Category || '').trim(),
    Price: Number(row.Price || 0) || 0,
    TaxRate: row.TaxRate === '' ? '' : Number(row.TaxRate || 0) || 0,
    Unit: String(row.Unit || '').trim() || '個',
    StoreID: String(row.StoreID || '').trim(),
    Active: row.Active === undefined ? true : isTrue_(row.Active),
    Description: String(row.Description || '').trim(),
    ReorderPoint: Number(row.ReorderPoint || row.SafetyStock || 0) || 0
  }));
  goods.sort((a, b) => (a.Name || '').localeCompare(b.Name || '', 'ja'));
  return goods;
}

function buildInventoryDashboard_(goods, options){
  const storeId = resolveStoreId_(options);
  const goodsMap = new Map(goods.map(g => [String(g.ProductID || ''), g]));
  const rows = readTable_(SHEET_NAMES.INVENTORY) || [];
  const seen = new Set();
  const items = rows.filter(row => {
    const rowStore = String(row.StoreID || '').trim();
    if (!storeId) return true;
    if (!rowStore) return true;
    return matchesStore_(rowStore, storeId);
  }).map(row => {
    const productId = String(row.ProductID || '').trim();
    const product = goodsMap.get(productId) || {};
    const onHand = Number(row.OnHand || row.Quantity || 0) || 0;
    const safety = row.SafetyStock === '' ? 0 : Number(row.SafetyStock || row.Safety || product.ReorderPoint || 0) || 0;
    const reorderPoint = safety || Number(product.ReorderPoint || 0) || 0;
    let status = 'OK';
    if (onHand <= 0) status = 'OUT';
    else if (reorderPoint && onHand <= reorderPoint) status = 'LOW';
    const storeValue = String(row.StoreID || product.StoreID || '').trim();
    seen.add(`${productId}::${storeValue || storeId || ''}`);
    return {
      EntryID: String(row.EntryID || row.Id || '').trim(),
      ProductID: productId,
      ProductName: product.Name || String(row.ProductName || ''),
      Category: product.Category || String(row.Category || ''),
      SKU: product.SKU || String(row.SKU || ''),
      OnHand: onHand,
      SafetyStock: reorderPoint,
      Status: status,
      StoreID: storeValue,
      UpdatedAt: normalizeYMD_(row.UpdatedAt || row.Date || ''),
      Memo: String(row.Memo || '').trim(),
      ReorderRecommended: status !== 'OK'
    };
  });

  const applicableGoods = goods.filter(g => {
    if (!storeId) return true;
    if (!g.StoreID) return true;
    return matchesStore_(g.StoreID, storeId);
  });

  applicableGoods.forEach(g => {
    const key = `${g.ProductID}::${storeId || g.StoreID || ''}`;
    if (seen.has(key)) return;
    items.push({
      EntryID: '',
      ProductID: g.ProductID,
      ProductName: g.Name,
      Category: g.Category,
      SKU: g.SKU,
      OnHand: 0,
      SafetyStock: Number(g.ReorderPoint || 0) || 0,
      Status: 'MISSING',
      StoreID: storeId || g.StoreID || '',
      UpdatedAt: '',
      Memo: '',
      ReorderRecommended: true
    });
  });

  const priority = status => {
    switch(String(status || '').toUpperCase()){
      case 'OUT': return 0;
      case 'LOW': return 1;
      case 'MISSING': return 2;
      default: return 3;
    }
  };
  items.sort((a, b) => {
    const diff = priority(a.Status) - priority(b.Status);
    if (diff !== 0) return diff;
    return (a.ProductName || '').localeCompare(b.ProductName || '', 'ja');
  });

  const totalOnHand = items.reduce((sum, item) => sum + Number(item.OnHand || 0), 0);
  const lowStock = items.filter(item => item.Status !== 'OK').length;

  return {
    items,
    summary: {
      tracked: items.length,
      totalOnHand,
      lowStock,
      storeId: storeId || ''
    }
  };
}

function buildPurchaseDashboard_(goods, options){
  const storeId = resolveStoreId_(options);
  const goodsMap = new Map(goods.map(g => [String(g.ProductID || ''), g]));
  const rows = readTable_(SHEET_NAMES.PURCHASE_ORDERS) || [];
  const items = rows.filter(row => {
    const rowStore = String(row.StoreID || '').trim();
    if (!storeId) return true;
    if (!rowStore){
      const product = goodsMap.get(String(row.ProductID || '').trim());
      if (product && product.StoreID && !matchesStore_(product.StoreID, storeId)) return false;
      return true;
    }
    return matchesStore_(rowStore, storeId);
  }).map(row => {
    const productId = String(row.ProductID || '').trim();
    const product = goodsMap.get(productId) || {};
    const quantity = Number(row.Quantity || 0) || 0;
    const unitPrice = Number(row.UnitPrice || 0) || 0;
    const status = String(row.Status || '').trim() || '発注中';
    return {
      OrderID: String(row.OrderID || row.Id || '').trim(),
      ProductID: productId,
      ProductName: product.Name || String(row.ProductName || ''),
      Quantity: quantity,
      UnitPrice: unitPrice,
      Total: quantity * unitPrice,
      Status: status,
      StoreID: String(row.StoreID || product.StoreID || '').trim(),
      OrderedAt: normalizeYMD_(row.OrderedAt || row.OrderDate || ''),
      ExpectedAt: normalizeYMD_(row.ExpectedAt || row.ArrivalDate || ''),
      Vendor: String(row.Vendor || '').trim(),
      Memo: String(row.Memo || '').trim()
    };
  });

  const statusPriority = status => {
    const text = String(status || '').toLowerCase();
    if (!text) return 0;
    if (/cancel|キャンセル/.test(text)) return 4;
    if (/完了|入荷済|受領|closed|done/.test(text)) return 3;
    if (/発送|入荷中|出荷|shipping/.test(text)) return 1;
    return 0;
  };

  items.sort((a, b) => {
    const diff = statusPriority(a.Status) - statusPriority(b.Status);
    if (diff !== 0) return diff;
    const dateA = a.ExpectedAt || a.OrderedAt || '';
    const dateB = b.ExpectedAt || b.OrderedAt || '';
    return dateA.localeCompare(dateB);
  });

  const pending = items.filter(item => statusPriority(item.Status) < 3);
  const incomingQuantity = pending.reduce((sum, item) => sum + Number(item.Quantity || 0), 0);
  const nextArrival = pending.map(item => item.ExpectedAt).filter(Boolean).sort()[0] || '';

  return {
    items,
    summary: {
      totalOrders: items.length,
      pendingOrders: pending.length,
      incomingQuantity,
      nextArrival
    }
  };
}

function getMerchandiseDashboard(options){
  const goods = listMerchandiseCatalog_(options);
  const inventory = buildInventoryDashboard_(goods, options);
  const purchases = buildPurchaseDashboard_(goods, options);
  const activeGoods = goods.filter(g => g.Active);
  const priceBase = activeGoods.length ? activeGoods : goods;
  const avgPrice = priceBase.length ? (priceBase.reduce((sum, g) => sum + Number(g.Price || 0), 0) / priceBase.length) : 0;
  const categoryMap = new Map();
  goods.forEach(g => {
    const key = g.Category || '未分類';
    const entry = categoryMap.get(key) || { category: key, count: 0, active: 0 };
    entry.count += 1;
    if (g.Active) entry.active += 1;
    categoryMap.set(key, entry);
  });

  return {
    ok: true,
    goods,
    goodsSummary: {
      total: goods.length,
      active: activeGoods.length,
      inactive: goods.length - activeGoods.length,
      averagePrice: avgPrice,
      categories: Array.from(categoryMap.values()).sort((a, b) => b.count - a.count)
    },
    inventory,
    purchases
  };
}

function parseStaffList_(value){
  const text = String(value || '').trim();
  if (!text) return [];
  return text.split(/[\n,、\/\s]+/).map(part => part.trim()).filter(Boolean);
}

function getEventDashboard(options){
  const storeId = resolveStoreId_(options);
  const todayStr = toYMD_(new Date());
  const rows = readTable_(SHEET_NAMES.EVENTS) || [];
  const events = rows.filter(row => {
    const rowStore = String(row.StoreID || '').trim();
    if (!storeId) return true;
    if (!rowStore) return true;
    return matchesStore_(rowStore, storeId);
  }).map(row => ({
    EventID: String(row.EventID || row.Id || '').trim(),
    Title: String(row.Title || '').trim() || '(イベント)',
    StartDate: normalizeYMD_(row.StartDate || row.Date || ''),
    EndDate: normalizeYMD_(row.EndDate || row.StartDate || row.Date || ''),
    StartTime: String(row.StartTime || '').trim(),
    EndTime: String(row.EndTime || '').trim(),
    Location: String(row.Location || '').trim(),
    Capacity: Number(row.Capacity || row.Limit || 0) || 0,
    Staff: parseStaffList_(row.Staff),
    StaffRaw: String(row.Staff || '').trim(),
    StoreID: String(row.StoreID || '').trim(),
    Status: String(row.Status || '').trim() || '予定',
    Description: String(row.Description || '').trim()
  }));

  events.sort((a, b) => `${a.StartDate || ''}${a.StartTime || ''}`.localeCompare(`${b.StartDate || ''}${b.StartTime || ''}`));

  const upcoming = events.filter(ev => {
    const end = ev.EndDate || ev.StartDate || '';
    return end && end >= todayStr;
  });
  const todayEvents = events.filter(ev => {
    const start = ev.StartDate || '';
    const end = ev.EndDate || ev.StartDate || '';
    return start && end && start <= todayStr && end >= todayStr;
  });
  const staffSet = new Set();
  upcoming.forEach(ev => ev.Staff.forEach(name => { if (name) staffSet.add(name); }));

  return {
    ok: true,
    events,
    summary: {
      total: events.length,
      upcoming: upcoming.length,
      today: todayEvents.length,
      staffInvolved: staffSet.size,
      nextEvent: upcoming[0] ? {
        title: upcoming[0].Title,
        date: upcoming[0].StartDate,
        time: upcoming[0].StartTime,
        staff: upcoming[0].Staff
      } : null
    }
  };
}

function inferAccountingItemType_(category){
  const text = String(category || '').toLowerCase();
  if (!text) return 'サービス';
  if (/物販|商品|goods|retail|販売/.test(text)) return '物販';
  if (/チケット|回数券|プリペイド|prepaid/.test(text)) return 'チケット';
  return 'サービス';
}

function getAccountingBreakdown(range){
  const resolved = resolveDailyRange_(range);
  const storeId = resolveStoreId_(range);
  const from = resolved.from;
  const to = resolved.to;

  const visits = (readTable_(SHEET_NAMES.VISITS) || []).filter(v => {
    if (!matchesStore_(v.StoreID, storeId)) return false;
    const date = normalizeYMD_(v.VisitDate || v.Date || '');
    return date && date >= from && date <= to;
  });
  const paymentsMap = new Map((readTable_(SHEET_NAMES.PAYMENTS) || []).map(p => [String(p.PaymentCode || ''), p]));
  const servicesMap = new Map((readTable_(SHEET_NAMES.SERVICES) || []).map(s => [String(s.ServiceID || ''), s]));
  const visitsByOrder = new Map();
  visits.forEach(v => {
    const orderId = String(v.OrderID || v.VisitID || '').trim();
    if (!orderId) return;
    visitsByOrder.set(orderId, {
      VisitDate: normalizeYMD_(v.VisitDate || v.Date || ''),
      PaymentMethod: String(v.PaymentMethod || '').trim(),
      Total: Number(v.Total || 0) || 0,
      ARPortion: Number(v.ARPortion || 0) || 0
    });
  });

  const items = (readTable_(SHEET_NAMES.ORDER_ITEMS) || []).filter(it => {
    const orderId = String(it.OrderID || '').trim();
    return orderId && visitsByOrder.has(orderId);
  });

  const categoryMap = new Map();
  const itemMap = new Map();
  const typeMap = new Map();
  let totalAmount = 0;
  let totalQuantity = 0;

  const addStat = (map, key, label, amount, quantity) => {
    const k = key || '未設定';
    const entry = map.get(k) || { key: k, label: label || k, total: 0, quantity: 0 };
    entry.total += Number(amount || 0);
    entry.quantity += Number(quantity || 0);
    map.set(k, entry);
  };

  items.forEach(it => {
    const orderId = String(it.OrderID || '').trim();
    const visit = visitsByOrder.get(orderId) || {};
    const serviceId = String(it.ServiceID || '').trim();
    const service = servicesMap.get(serviceId) || {};
    const category = String(it.Category || service.Category || '').trim() || '未分類';
    const quantity = Number(it.Quantity || 0) || 0;
    const lineTotalRaw = Number(it.LineTotal || 0);
    const computedTotal = lineTotalRaw || (Number(it.LineSubtotal || it.Subtotal || 0) + Number(it.LineTax || it.Tax || 0));
    const amount = computedTotal || Number(it.UnitPrice || 0) * (quantity || 1);
    const label = service.Name || String(it.ServiceName || serviceId || '(項目)').trim();
    const itemType = inferAccountingItemType_(category);
    totalAmount += amount;
    totalQuantity += quantity || 1;
    addStat(categoryMap, category, category, amount, quantity || 1);
    addStat(itemMap, serviceId || label, label, amount, quantity || 1);
    addStat(typeMap, itemType, itemType, amount, quantity || 1);
  });

  const payments = new Map();
  visits.forEach(v => {
    const method = String(v.PaymentMethod || '').trim() || '未設定';
    const pay = paymentsMap.get(method) || {};
    const entry = payments.get(method) || { key: method, label: pay.Name || method || '未設定', total: 0, count: 0, balance: 0 };
    entry.total += Number(v.Total || 0) || 0;
    entry.count += 1;
    entry.balance += Number(v.ARPortion || 0) || 0;
    payments.set(method, entry);
  });

  const toSortedArray = map => Array.from(map.values()).sort((a, b) => Number(b.total || 0) - Number(a.total || 0));

  return {
    ok: true,
    period: resolved,
    totals: {
      visits: visits.length,
      items: items.length,
      amount: totalAmount,
      quantity: totalQuantity
    },
    byCategory: toSortedArray(categoryMap),
    byItem: toSortedArray(itemMap),
    byType: toSortedArray(typeMap),
    payments: toSortedArray(payments).map(row => ({
      key: row.key,
      label: row.label,
      total: row.total,
      count: row.count,
      balance: row.balance
    }))
  };
}

/* =============================================================================
   ★ 追加：同期（フォームと“すぐに”同期できるように）
   ========================================================================== */

function bumpSyncRev_(payload){
  try{
    const props = PropertiesService.getScriptProperties();
    const cur = Number(props.getProperty(SYNC_CONF.PROP_REV) || '0');
    const next = cur + 1;
    props.setProperty(SYNC_CONF.PROP_REV, String(next));
    if (payload){
      props.setProperty(SYNC_CONF.PROP_LAST, JSON.stringify(Object.assign({ts:new Date().toISOString(), rev:next}, payload)));
    }
  }catch(e){
    // no-op
  }
}

function getSyncState(){
  const props = PropertiesService.getScriptProperties();
  const rev = Number(props.getProperty(SYNC_CONF.PROP_REV) || '0');
  let last = {};
  try{ last = JSON.parse(props.getProperty(SYNC_CONF.PROP_LAST)||'{}'); }catch(e){ last={}; }
  return { ok:true, rev, last };
}

// スプレッドシート手編集/構造変更の検知（インストール型トリガ）
function onSheetChanged(e){
  const sheetName = (e && e.source && e.source.getActiveSheet()) ? e.source.getActiveSheet().getName() : '(unknown)';
  const reason = (e && e.changeType) ? String(e.changeType) : 'edit';
  bumpSyncRev_({sheet:sheetName, reason});
}


// トリガ作成（修正版：ScriptApp.EventTypeで正確に判定）
function ensureRealtimeSyncTriggers(){
  const triggers = ScriptApp.getProjectTriggers();
  const ssId = SpreadsheetApp.getActive().getId();

  const hasEdit = triggers.some(t =>
    t.getHandlerFunction() === 'onSheetChanged' &&
    t.getEventType && t.getEventType() === ScriptApp.EventType.ON_EDIT
  );

  const hasChange = triggers.some(t =>
    t.getHandlerFunction() === 'onSheetChanged' &&
    t.getEventType && t.getEventType() === ScriptApp.EventType.ON_CHANGE
  );

  if (!hasEdit){
    ScriptApp.newTrigger('onSheetChanged').forSpreadsheet(ssId).onEdit().create();
  }

  if (!hasChange){
    ScriptApp.newTrigger('onSheetChanged').forSpreadsheet(ssId).onChange().create();
  }

  return { ok:true };
}
/** 仕訳帳テンプレートを A シートに作成し、補助シートと試算表も用意 */
function createJournalTemplateOnA() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const journal = getOrCreateSheet_(ss, 'A');

  // --- ヘッダー行 ---
  const headers = [
    '日付','仕訳No','摘要',
    '借方勘定科目','借方補助科目','借方金額',
    '貸方勘定科目','貸方補助科目','貸方金額',
    '税区分','税率(%)','部門','取引先','支払方法','備考'
  ];
  journal.getRange(1, 1, 1, headers.length).setValues([headers]);
  journal.setFrozenRows(1);

  // 体裁
  journal.getRange(1,1,1,headers.length).setFontWeight('bold');
  journal.getRange('A2:A').setNumberFormat('yyyy-mm-dd'); // 日付
  journal.getRange('F2:F').setNumberFormat('#,##0');       // 借方金額
  journal.getRange('I2:I').setNumberFormat('#,##0');       // 貸方金額

  // 列幅（見やすさ用）
  const widths = [100, 80, 220, 140, 120, 110, 140, 120, 110, 90, 80, 100, 140, 110, 220];
  widths.forEach((w, i) => journal.setColumnWidth(i + 1, w));

  // --- マスター類 ---
  const master = getOrCreateSheet_(ss, '科目マスター');
  if (master.getLastRow() <= 1) {
    master.clear();
    master.getRange('A1:D1').setValues([['勘定科目','税区分候補','部門候補','支払方法候補']]);
    const accounts = [
      '現金','普通預金','売上高','仕入高','売掛金','買掛金','前払金','未払金','未収入金','立替金',
      '消耗品費','旅費交通費','通信費','水道光熱費','支払手数料','地代家賃','交際費','広告宣伝費',
      '外注費','雑費','受取利息','支払利息','減価償却費'
    ];
    const taxTypes = ['課税','軽減税率','非課税','対象外','免税'];
    const depts    = ['本社','営業','開発','管理'];
    const pays     = ['現金','銀行振込','クレジット','口座振替','その他'];
    master.getRange(2,1,accounts.length,1).setValues(accounts.map(v=>[v]));
    master.getRange(2,2,taxTypes.length,1).setValues(taxTypes.map(v=>[v]));
    master.getRange(2,3,depts.length,1).setValues(depts.map(v=>[v]));
    master.getRange(2,4,pays.length,1).setValues(pays.map(v=>[v]));
    master.getRange('E1').setValue('税率候補(%)');
    const rates = [[0],[8],[10]];
    master.getRange(2,5,rates.length,1).setValues(rates);
    master.setFrozenRows(1);
  }

  // --- データ検証（プルダウン） ---
  const lastRowA = getLastNonEmptyRowInColumn_(master, 1) || 2;
  const lastRowB = getLastNonEmptyRowInColumn_(master, 2) || 2;
  const lastRowC = getLastNonEmptyRowInColumn_(master, 3) || 2;
  const lastRowD = getLastNonEmptyRowInColumn_(master, 4) || 2;
  const lastRowE = getLastNonEmptyRowInColumn_(master, 5) || 2;

  const accRange  = master.getRange(2,1,lastRowA-1,1); // 勘定科目
  const taxRange  = master.getRange(2,2,lastRowB-1,1); // 税区分
  const deptRange = master.getRange(2,3,lastRowC-1,1); // 部門
  const payRange  = master.getRange(2,4,lastRowD-1,1); // 支払方法
  const rateRange = master.getRange(2,5,lastRowE-1,1); // 税率(%)

  const dvAccount = SpreadsheetApp.newDataValidation()
    .requireValueInRange(accRange, true).setAllowInvalid(false).build();
  journal.getRangeList(['D2:D','G2:G']).setDataValidation(dvAccount);

  const dvTax = SpreadsheetApp.newDataValidation()
    .requireValueInRange(taxRange, true).setAllowInvalid(false).build();
  journal.getRange('J2:J').setDataValidation(dvTax);

  const dvDept = SpreadsheetApp.newDataValidation()
    .requireValueInRange(deptRange, true).setAllowInvalid(false).build();
  journal.getRange('L2:L').setDataValidation(dvDept);

  const dvPay = SpreadsheetApp.newDataValidation()
    .requireValueInRange(payRange, true).setAllowInvalid(false).build();
  journal.getRange('N2:N').setDataValidation(dvPay);

  const dvRate = SpreadsheetApp.newDataValidation()
    .requireValueInRange(rateRange, true).setAllowInvalid(false).build();
  journal.getRange('K2:K').setDataValidation(dvRate);

  // A列は日付入力必須に（形式だけチェック）
  const dvDate = SpreadsheetApp.newDataValidation().requireDate().build();
  journal.getRange('A2:A').setDataValidation(dvDate);

  // --- 条件付き書式：借方≠貸方、または片方だけ入力の行を警告 ---
  const dataArea = journal.getRange(2,1, journal.getMaxRows()-1, headers.length);
  const rules = journal.getConditionalFormatRules();
  const ruleMismatch = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([dataArea])
    .whenFormulaSatisfied('=AND($F2<>"",$I2<>"",$F2<>$I2)')
    .setBackground('#FDECEC').build();
  const ruleOneSide = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([dataArea])
    .whenFormulaSatisfied('=OR(AND($F2<>"",$I2=""),AND($F2="",$I2<>""))')
    .setBackground('#FFF2CC').build();
  journal.setConditionalFormatRules(rules.concat([ruleMismatch, ruleOneSide]));

  // --- 簡易試算表 ---
  buildTrialBalance_(ss, master);
}

/** 試算表シートを作成（科目別の借方・貸方・差額） */
function buildTrialBalance_(ss, master) {
  const tb = ss.getSheetByName('試算表') || ss.insertSheet('試算表');
  tb.clear();

  tb.getRange('A1:D1').setValues([['勘定科目','借方合計','貸方合計','差額(借-貸)']]);
  tb.getRange('A1:D1').setFontWeight('bold');
  tb.setFrozenRows(1);

  // 科目一覧を転記（動的フィルタ）
  tb.getRange('A2').setFormula("=FILTER('科目マスター'!A2:A,'科目マスター'!A2:A<>'')");

  // 現時点の科目数ぶんだけ SUMIF を並べる
  const n = Math.max(1, (getLastNonEmptyRowInColumn_(master,1) - 1)); // 科目の行数
  const bForm = [], cForm = [], dForm = [];
  for (let i = 0; i < n; i++) {
    const r = i + 2;
    bForm.push([`=IF(A${r}="","",SUMIF(A!D:D,A${r},A!F:F))`]);
    cForm.push([`=IF(A${r}="","",SUMIF(A!G:G,A${r},A!I:I))`]);
    dForm.push([`=IF(A${r}="","",B${r}-C${r})`]);
  }
  tb.getRange(2,2,n,1).setFormulas(bForm);
  tb.getRange(2,3,n,1).setFormulas(cForm);
  tb.getRange(2,4,n,1).setFormulas(dForm);

  // 合計行
  const totalRow = n + 2;
  tb.getRange(totalRow+1,1).setValue('合計');
  tb.getRange(totalRow+1,2).setFormula(`=SUM(B2:B${totalRow})`);
  tb.getRange(totalRow+1,3).setFormula(`=SUM(C2:C${totalRow})`);
  tb.getRange(totalRow+1,4).setFormula(`=B${totalRow+1}-C${totalRow+1}`);
  tb.getRange(totalRow+1,1,1,4).setFontWeight('bold');

  // 書式
  tb.getRange('B2:D').setNumberFormat('#,##0');

  // 差額がゼロでない行を淡くハイライト（検算の気づき用）
  const rules = tb.getConditionalFormatRules();
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .setRanges([tb.getRange(2,1, tb.getMaxRows()-1, 4)])
    .whenFormulaSatisfied('=$D2<>0')
    .setBackground('#FFF7E6').build();
  tb.setConditionalFormatRules(rules.concat(rule));
}

/** 補助：シートを取得（なければ作成） */
function getOrCreateSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

/** 補助：特定列の最終非空行を取得（ヘッダー含む行番号） */
function getLastNonEmptyRowInColumn_(sheet, col) {
  const last = sheet.getLastRow();
  if (last < 2) return last;
  const vals = sheet.getRange(1, col, last).getValues().flat();
  for (let i = vals.length - 1; i >= 0; i--) {
    if (vals[i] !== '') return i + 1;
  }
  return 1;
}

/** （任意）テスト用：1行だけサンプル仕訳を入れる */
function addSampleEntry_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('A');
  const r = sh.getLastRow() + 1;
  sh.getRange(r,1,1,15).setValues([[
    new Date(), 1, '消耗品を現金で購入',
    '消耗品費','', 1200,
    '現金','', 1200,
    '課税', 10, '本社', '○○文具店', '現金', ''
  ]]);
}
