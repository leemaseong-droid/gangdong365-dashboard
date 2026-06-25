const DEFAULT_CONFIG = {
  spreadsheetId: "1n1WiKZYfsyxx_C84NTl-ZkzSq7hoUN-N-eSsyNVRLXo",
  gid: "671250414",
  sheetName: "",
  range: "A:Z",
  apiKey: "",
};

const SAMPLE_ROWS = [
  { 날짜: "2026-01-03", 원장: "이마성", 분류: "추나요법", 패키지명: "통증 집중 10회", 결제금액: "1280000", 환자명: "샘플 A" },
  { 날짜: "2026-01-09", 원장: "김원장", 분류: "한약", 패키지명: "체질 한약 30일", 결제금액: "680000", 환자명: "샘플 B" },
  { 날짜: "2026-02-14", 원장: "박원장", 분류: "약침", 패키지명: "회복 약침 5회", 결제금액: "420000", 환자명: "샘플 C" },
  { 날짜: "2026-02-21", 원장: "이마성", 분류: "교통사고", 패키지명: "자동차보험", 결제금액: "950000", 환자명: "샘플 D" },
  { 날짜: "2026-03-05", 원장: "김원장", 분류: "다이어트", 패키지명: "감량 관리 8주", 결제금액: "1460000", 환자명: "샘플 E" },
  { 날짜: "2026-03-16", 원장: "박원장", 분류: "추나요법", 패키지명: "체형 교정 6회", 결제금액: "760000", 환자명: "샘플 F" },
  { 날짜: "2026-04-02", 원장: "이마성", 분류: "한약", 패키지명: "보약 30일", 결제금액: "880000", 환자명: "샘플 G" },
  { 날짜: "2026-04-17", 원장: "김원장", 분류: "약침", 패키지명: "통증 약침 10회", 결제금액: "810000", 환자명: "샘플 H" },
  { 날짜: "2026-05-08", 원장: "박원장", 분류: "교통사고", 패키지명: "자동차보험", 결제금액: "1020000", 환자명: "샘플 I" },
  { 날짜: "2026-05-23", 원장: "이마성", 분류: "다이어트", 패키지명: "감량 관리 12주", 결제금액: "1980000", 환자명: "샘플 J" },
  { 날짜: "2026-06-04", 원장: "김원장", 분류: "추나요법", 패키지명: "통증 집중 10회", 결제금액: "1240000", 환자명: "샘플 K" },
  { 날짜: "2026-06-19", 원장: "박원장", 분류: "한약", 패키지명: "체질 한약 30일", 결제금액: "720000", 환자명: "샘플 L" },
];

const COLUMN_ALIASES = {
  date: ["날짜", "일자", "내원일", "진료일", "결제일", "등록일", "상담일", "date"],
  doctor: ["원장", "담당원장", "진료원장", "한의사", "담당의", "담당자", "doctor"],
  category: ["분류", "구분", "카테고리", "진료분류", "항목", "종류", "category"],
  packageName: ["패키지명", "패키지", "상품명", "프로그램", "치료명", "시술명", "상품", "package"],
  amount: ["결제금액", "매출", "매출액", "금액", "실적", "수납액", "총액", "amount", "revenue"],
  patient: ["환자명", "고객명", "환자", "고객", "차트번호", "환자번호", "patient"],
};

const state = {
  rawRows: [],
  columns: {},
  filters: {
    startDate: "",
    endDate: "",
    doctor: "__all",
    category: "__all",
    packageName: "__all",
    granularity: "month",
  },
  activeTab: "overview",
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  populateConfigForm();
  loadData();
});

function cacheElements() {
  [
    "syncStatus",
    "refreshButton",
    "startDate",
    "endDate",
    "doctorFilter",
    "categoryFilter",
    "packageFilter",
    "granularityFilter",
    "totalRevenue",
    "totalCount",
    "averageRevenue",
    "doctorCount",
    "trendChart",
    "timelineChart",
    "doctorBars",
    "categoryBars",
    "packageBars",
    "doctorTable",
    "recordHead",
    "recordBody",
    "trendCaption",
    "doctorCaption",
    "doctorTableCaption",
    "timelineCaption",
    "categoryCaption",
    "packageCaption",
    "recordCaption",
    "configCaption",
    "apiKeyInput",
    "spreadsheetIdInput",
    "gidInput",
    "sheetNameInput",
    "rangeInput",
    "saveConfigButton",
    "clearConfigButton",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTab = button.dataset.tab;
      document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("is-active", tab === button));
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.toggle("is-active", panel.id === state.activeTab);
      });
      render();
    });
  });

  [
    ["startDate", "startDate"],
    ["endDate", "endDate"],
    ["doctorFilter", "doctor"],
    ["categoryFilter", "category"],
    ["packageFilter", "packageName"],
    ["granularityFilter", "granularity"],
  ].forEach(([elementId, filterKey]) => {
    els[elementId].addEventListener("change", (event) => {
      state.filters[filterKey] = event.target.value;
      render();
    });
  });

  els.refreshButton.addEventListener("click", loadData);
  els.saveConfigButton.addEventListener("click", saveRuntimeConfig);
  els.clearConfigButton.addEventListener("click", clearRuntimeConfig);
}

function getConfig() {
  const localConfig = JSON.parse(localStorage.getItem("dashboardConfig") || "{}");
  return {
    ...DEFAULT_CONFIG,
    ...(window.DASHBOARD_CONFIG || {}),
    ...localConfig,
  };
}

function populateConfigForm() {
  const config = getConfig();
  els.apiKeyInput.value = config.apiKey || "";
  els.spreadsheetIdInput.value = config.spreadsheetId || "";
  els.gidInput.value = config.gid || "";
  els.sheetNameInput.value = config.sheetName || "";
  els.rangeInput.value = config.range || "A:Z";
  els.configCaption.textContent = config.apiKey ? "API 키 저장됨" : "샘플 모드";
}

function saveRuntimeConfig() {
  localStorage.setItem(
    "dashboardConfig",
    JSON.stringify({
      apiKey: els.apiKeyInput.value.trim(),
      spreadsheetId: els.spreadsheetIdInput.value.trim(),
      gid: els.gidInput.value.trim(),
      sheetName: els.sheetNameInput.value.trim(),
      range: els.rangeInput.value.trim() || "A:Z",
    }),
  );
  populateConfigForm();
  loadData();
}

function clearRuntimeConfig() {
  localStorage.removeItem("dashboardConfig");
  populateConfigForm();
  loadData();
}

async function loadData() {
  const config = getConfig();
  setStatus("불러오는 중", "warn");

  try {
    if (config.apiKey) {
      const values = await fetchSheetValues(config);
      state.rawRows = rowsFromValues(values);
      setStatus(`${state.rawRows.length.toLocaleString("ko-KR")}행 연결됨`, "good");
    } else {
      state.rawRows = SAMPLE_ROWS;
      setStatus("샘플 데이터", "warn");
    }
  } catch (error) {
    console.error(error);
    state.rawRows = SAMPLE_ROWS;
    setStatus("연동 실패: 샘플 표시", "bad");
  }

  state.columns = detectColumns(state.rawRows);
  resetDateFilters();
  populateFilterOptions();
  render();
}

async function fetchSheetValues(config) {
  const spreadsheetId = encodeURIComponent(config.spreadsheetId);
  const key = encodeURIComponent(config.apiKey);
  let sheetName = config.sheetName;

  if (!sheetName && config.gid) {
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?includeGridData=false&key=${key}`;
    const metadata = await fetchJson(metadataUrl);
    const matched = metadata.sheets?.find((sheet) => String(sheet.properties?.sheetId) === String(config.gid));
    sheetName = matched?.properties?.title || "";
  }

  if (!sheetName) {
    throw new Error("시트명을 찾을 수 없습니다.");
  }

  const range = `${quoteSheetName(sheetName)}!${config.range || "A:Z"}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&key=${key}`;
  const payload = await fetchJson(url);
  return payload.values || [];
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
  }
  return response.json();
}

function quoteSheetName(name) {
  return `'${String(name).replaceAll("'", "''")}'`;
}

function rowsFromValues(values) {
  if (!values.length) return [];
  const headers = values[0].map((header, index) => String(header || `열${index + 1}`).trim());
  return values.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function detectColumns(rows) {
  const headers = Object.keys(rows[0] || {});
  const normalized = headers.map((header) => ({
    original: header,
    compact: compact(header),
  }));

  return Object.entries(COLUMN_ALIASES).reduce((found, [key, aliases]) => {
    const aliasSet = aliases.map(compact);
    const exact = normalized.find((header) => aliasSet.includes(header.compact));
    const partial = normalized.find((header) => aliasSet.some((alias) => header.compact.includes(alias)));
    found[key] = (exact || partial)?.original || "";
    return found;
  }, {});
}

function compact(value) {
  return String(value || "").toLowerCase().replace(/[\s_()[\]{}·.,/-]/g, "");
}

function resetDateFilters() {
  const dates = state.rawRows.map((row) => parseDate(row[state.columns.date])).filter(Boolean).sort((a, b) => a - b);
  if (!dates.length) return;
  state.filters.startDate = toDateInput(dates[0]);
  state.filters.endDate = toDateInput(dates[dates.length - 1]);
  els.startDate.value = state.filters.startDate;
  els.endDate.value = state.filters.endDate;
}

function populateFilterOptions() {
  fillSelect(els.doctorFilter, uniqueValues("doctor"), "전체 원장", state.filters.doctor);
  fillSelect(els.categoryFilter, uniqueValues("category"), "전체 분류", state.filters.category);
  fillSelect(els.packageFilter, uniqueValues("packageName"), "전체 패키지", state.filters.packageName);
  els.granularityFilter.value = state.filters.granularity;
}

function fillSelect(select, options, allLabel, currentValue) {
  select.innerHTML = "";
  select.append(new Option(allLabel, "__all"));
  options.forEach((value) => select.append(new Option(value, value)));
  select.value = options.includes(currentValue) ? currentValue : "__all";
}

function uniqueValues(columnKey) {
  const column = state.columns[columnKey];
  if (!column) return [];
  return [...new Set(state.rawRows.map((row) => cleanText(row[column])).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "ko-KR"),
  );
}

function render() {
  const rows = getFilteredRows();
  const revenue = sum(rows, (row) => getAmount(row));
  const totalRows = rows.length;
  const doctors = groupRows(rows, "doctor");
  const categories = groupRows(rows, "category");
  const packages = groupRows(rows, "packageName");
  const series = groupByPeriod(rows, state.filters.granularity);

  els.totalRevenue.textContent = formatWon(revenue);
  els.totalCount.textContent = `${totalRows.toLocaleString("ko-KR")}건`;
  els.averageRevenue.textContent = formatWon(totalRows ? revenue / totalRows : 0);
  els.doctorCount.textContent = `${doctors.length.toLocaleString("ko-KR")}명`;

  renderLineChart(els.trendChart, series);
  renderLineChart(els.timelineChart, series);
  renderBars(els.doctorBars, doctors.slice(0, 12));
  renderBars(els.categoryBars, categories.slice(0, 12));
  renderBars(els.packageBars, packages.slice(0, 12));
  renderDoctorTable(doctors, revenue);
  renderRecordTable(rows);

  els.trendCaption.textContent = `${series.length.toLocaleString("ko-KR")}개 구간`;
  els.timelineCaption.textContent = `${series.length.toLocaleString("ko-KR")}개 구간`;
  els.doctorCaption.textContent = `${doctors.length.toLocaleString("ko-KR")}명`;
  els.doctorTableCaption.textContent = `${doctors.length.toLocaleString("ko-KR")}명`;
  els.categoryCaption.textContent = `${categories.length.toLocaleString("ko-KR")}개`;
  els.packageCaption.textContent = `${packages.length.toLocaleString("ko-KR")}개`;
  els.recordCaption.textContent = `${rows.length.toLocaleString("ko-KR")}행`;
}

function getFilteredRows() {
  const start = state.filters.startDate ? new Date(`${state.filters.startDate}T00:00:00`) : null;
  const end = state.filters.endDate ? new Date(`${state.filters.endDate}T23:59:59`) : null;

  return state.rawRows.filter((row) => {
    const date = parseDate(row[state.columns.date]);
    if (start && date && date < start) return false;
    if (end && date && date > end) return false;
    if (!matchesFilter(row, "doctor", state.filters.doctor)) return false;
    if (!matchesFilter(row, "category", state.filters.category)) return false;
    if (!matchesFilter(row, "packageName", state.filters.packageName)) return false;
    return true;
  });
}

function matchesFilter(row, key, value) {
  if (!value || value === "__all") return true;
  const column = state.columns[key];
  return cleanText(row[column]) === value;
}

function groupRows(rows, key) {
  const column = state.columns[key];
  const bucket = new Map();

  rows.forEach((row) => {
    const name = cleanText(row[column]) || "미분류";
    const current = bucket.get(name) || { name, revenue: 0, count: 0 };
    current.revenue += getAmount(row);
    current.count += 1;
    bucket.set(name, current);
  });

  return [...bucket.values()].sort((a, b) => b.revenue - a.revenue);
}

function groupByPeriod(rows, granularity) {
  const bucket = new Map();

  rows.forEach((row) => {
    const date = parseDate(row[state.columns.date]);
    const key = date ? periodKey(date, granularity) : "날짜 없음";
    const current = bucket.get(key) || { name: key, revenue: 0, count: 0 };
    current.revenue += getAmount(row);
    current.count += 1;
    bucket.set(key, current);
  });

  return [...bucket.values()].sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
}

function periodKey(date, granularity) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (granularity === "day") return `${year}-${month}-${day}`;
  if (granularity === "week") {
    const first = new Date(year, 0, 1);
    const days = Math.floor((date - first) / 86400000);
    const week = String(Math.ceil((days + first.getDay() + 1) / 7)).padStart(2, "0");
    return `${year}-W${week}`;
  }
  return `${year}-${month}`;
}

function renderLineChart(target, series) {
  if (!series.length) {
    target.innerHTML = emptyState();
    return;
  }

  const width = 900;
  const height = target.classList.contains("tall") ? 460 : 300;
  const margin = { top: 24, right: 30, bottom: 44, left: 74 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const max = Math.max(...series.map((item) => item.revenue), 1);
  const points = series.map((item, index) => {
    const x = margin.left + (series.length === 1 ? innerWidth / 2 : (index / (series.length - 1)) * innerWidth);
    const y = margin.top + innerHeight - (item.revenue / max) * innerHeight;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${margin.top + innerHeight} L ${points[0].x} ${
    margin.top + innerHeight
  } Z`;
  const labelEvery = Math.max(1, Math.ceil(points.length / 8));

  target.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="매출 추이">
      <line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${width - margin.right}" y2="${
        margin.top + innerHeight
      }" stroke="#d9d2c6" />
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${
        margin.top + innerHeight
      }" stroke="#d9d2c6" />
      <path d="${area}" fill="rgba(15, 118, 110, 0.12)"></path>
      <path d="${path}" fill="none" stroke="#0f766e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      ${points
        .map(
          (point) => `
            <circle cx="${point.x}" cy="${point.y}" r="5" fill="#fff" stroke="#0f766e" stroke-width="3">
              <title>${point.name}: ${formatWon(point.revenue)}</title>
            </circle>
          `,
        )
        .join("")}
      <text x="${margin.left - 8}" y="${margin.top + 4}" text-anchor="end" class="axis-label">${formatCompactWon(max)}</text>
      <text x="${margin.left - 8}" y="${margin.top + innerHeight}" text-anchor="end" class="axis-label">0</text>
      ${points
        .filter((_, index) => index % labelEvery === 0 || index === points.length - 1)
        .map(
          (point) => `
            <text x="${point.x}" y="${height - 15}" text-anchor="middle" class="axis-label">${escapeHtml(point.name)}</text>
          `,
        )
        .join("")}
    </svg>
  `;
}

function renderBars(target, items) {
  if (!items.length) {
    target.innerHTML = emptyState();
    return;
  }

  const max = Math.max(...items.map((item) => item.revenue), 1);
  target.innerHTML = items
    .map((item) => {
      const percent = Math.max(2, (item.revenue / max) * 100);
      return `
        <div class="bar-row">
          <div class="bar-name">${escapeHtml(item.name)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${percent}%"></div></div>
          <div class="bar-value">${formatWon(item.revenue)}</div>
        </div>
      `;
    })
    .join("");
}

function renderDoctorTable(items, totalRevenue) {
  if (!items.length) {
    els.doctorTable.innerHTML = `<tr><td colspan="5">${emptyState()}</td></tr>`;
    return;
  }

  els.doctorTable.innerHTML = items
    .map((item) => {
      const share = totalRevenue ? (item.revenue / totalRevenue) * 100 : 0;
      const average = item.count ? item.revenue / item.count : 0;
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td class="numeric">${formatWon(item.revenue)}</td>
          <td class="numeric">${item.count.toLocaleString("ko-KR")}건</td>
          <td class="numeric">${formatWon(average)}</td>
          <td class="numeric">${share.toFixed(1)}%</td>
        </tr>
      `;
    })
    .join("");
}

function renderRecordTable(rows) {
  const headers = Object.keys(state.rawRows[0] || {}).slice(0, 12);
  if (!headers.length || !rows.length) {
    els.recordHead.innerHTML = "";
    els.recordBody.innerHTML = `<tr><td>${emptyState()}</td></tr>`;
    return;
  }

  els.recordHead.innerHTML = `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>`;
  els.recordBody.innerHTML = rows
    .slice(0, 300)
    .map(
      (row) => `
        <tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>
      `,
    )
    .join("");
}

function getAmount(row) {
  return parseNumber(row[state.columns.amount]);
}

function parseNumber(value) {
  if (typeof value === "number") return value;
  const normalized = String(value || "")
    .replace(/[₩원,\s]/g, "")
    .replace(/[▲△]/g, "")
    .replace(/[()]/g, "-");
  const number = Number(normalized.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function parseDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number" && value > 20000) {
    return new Date(Math.round((value - 25569) * 86400 * 1000));
  }

  const text = String(value || "").trim();
  if (!text) return null;

  const normalized = text.replace(/[.년월]/g, "-").replace(/일/g, "").replace(/\//g, "-").replace(/\s.+$/, "");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sum(rows, getter) {
  return rows.reduce((total, row) => total + getter(row), 0);
}

function cleanText(value) {
  return String(value || "").trim();
}

function formatWon(value) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatCompactWon(value) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  if (value >= 10000) return `${Math.round(value / 10000).toLocaleString("ko-KR")}만`;
  return formatWon(value);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emptyState() {
  return document.getElementById("emptyStateTemplate").innerHTML;
}

function setStatus(text, type) {
  els.syncStatus.textContent = text;
  els.syncStatus.classList.toggle("is-good", type === "good");
  els.syncStatus.classList.toggle("is-warn", type === "warn");
  els.syncStatus.classList.toggle("is-bad", type === "bad");
}
