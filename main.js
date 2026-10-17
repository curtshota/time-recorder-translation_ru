"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TimeRecorderPlugin,
});
module.exports = __toCommonJS(main_exports);
var import_obsidian9 = require("obsidian");

// src/settings.ts
var DEFAULT_CATEGORIES = [
  { id: "sleep", name: "Сон", emoji: "😴", aliases: ["дремота", "поспать"] },
  {
    id: "study",
    name: "Учеба",
    emoji: "📚",
    aliases: ["чтение", "пары", "повторение", "учеба"],
  },
  {
    id: "meal",
    name: "Еда",
    emoji: "🍱",
    aliases: ["завтрак", "обед", "ужин", "покушать", "доставка"],
  },
  {
    id: "hygiene",
    name: "Гигиена",
    emoji: "🚿",
    aliases: ["душ", "мыться", "туалет", "зубы"],
  },
  {
    id: "commute",
    name: "Дорога",
    emoji: "🚗",
    aliases: ["метро", "автобус", "такси", "ехать"],
  },
  {
    id: "social",
    name: "Общение",
    emoji: "💬",
    aliases: ["чат", "звонок", "друзья", "разговор"],
  },
  {
    id: "chores",
    name: "Быт",
    emoji: "🧹",
    aliases: ["уборка", "стирка", "порядок"],
  },
  {
    id: "work",
    name: "Работа",
    emoji: "💼",
    aliases: ["встреча", "сверхурочные", "офис", "работа"],
  },
  {
    id: "sport",
    name: "Спорт",
    emoji: "🏃",
    aliases: ["бег", "зал", "качалка", "тренировка"],
  },
  {
    id: "fun",
    name: "Отдых",
    emoji: "🎮",
    aliases: ["игра", "игры", "видео", "ютуб"],
  },
];
var OTHER_CATEGORY = {
  id: "other",
  name: "\u5176\u4ED6",
  emoji: "\u2753",
  aliases: [],
};
var DEFAULT_SETTINGS = {
  version: 1,
  language: "auto",
  recordsFolder: "Time Records",
  templatePath: "Time Records/timer template.md",
  flashNotePath: "",
  categories: DEFAULT_CATEGORIES,
};
var DEFAULT_CATEGORIES_EN = DEFAULT_CATEGORIES;
var DEFAULT_CATEGORIES_JA = DEFAULT_CATEGORIES;
var DEFAULT_CATEGORIES_KO = DEFAULT_CATEGORIES;
var ALL_LANGS = ["zh", "en", "ja", "ko"];
var ALL_DEFAULT_CATEGORIES = {
  zh: DEFAULT_CATEGORIES,
  en: DEFAULT_CATEGORIES_EN,
  ja: DEFAULT_CATEGORIES_JA,
  ko: DEFAULT_CATEGORIES_KO,
};
function defaultCategoriesFor(lang) {
  return ALL_DEFAULT_CATEGORIES[lang].map((c) => ({
    ...c,
    aliases: [...c.aliases],
  }));
}
function defaultCategoriesForRestore(lang) {
  const base = defaultCategoriesFor(lang);
  for (const other of ALL_LANGS) {
    if (other === lang) continue;
    const twin = ALL_DEFAULT_CATEGORIES[other];
    for (const c of base) {
      const tw = twin.find((o) => o.id === c.id);
      if (!tw) continue;
      for (const cand of [tw.name, ...tw.aliases]) {
        if (
          !c.aliases.some(
            (a) => a.trim().toLowerCase() === cand.trim().toLowerCase(),
          )
        ) {
          c.aliases.push(cand);
        }
      }
    }
  }
  return base;
}
function sameCategory(a, b) {
  if (a.id !== b.id || a.name.trim() !== b.name.trim() || a.emoji !== b.emoji) {
    return false;
  }
  const norm = (xs) => new Set(xs.map((x) => x.trim().toLowerCase()));
  const sa = norm(a.aliases);
  const sb = norm(b.aliases);
  return sa.size === sb.size && [...sa].every((x) => sb.has(x));
}
function sameCategorySet(a, b) {
  return a.length === b.length && a.every((ca, i) => sameCategory(ca, b[i]));
}
function legacyRestoreCategories(lang) {
  const base = defaultCategoriesFor(lang);
  const twin = lang === "zh" ? DEFAULT_CATEGORIES_EN : DEFAULT_CATEGORIES;
  for (const c of base) {
    const tw = twin.find((o) => o.id === c.id);
    if (!tw) continue;
    for (const cand of [tw.name, ...tw.aliases]) {
      if (
        !c.aliases.some(
          (a) => a.trim().toLowerCase() === cand.trim().toLowerCase(),
        )
      ) {
        c.aliases.push(cand);
      }
    }
  }
  return base;
}
function isPristineDefaultCategory(cat) {
  for (const lang of ALL_LANGS) {
    const base = ALL_DEFAULT_CATEGORIES[lang].find((c) => c.id === cat.id);
    if (base && sameCategory(cat, base)) return true;
    const restored = defaultCategoriesForRestore(lang).find(
      (c) => c.id === cat.id,
    );
    if (restored && sameCategory(cat, restored)) return true;
  }
  for (const lang of ["zh", "en"]) {
    const legacy = legacyRestoreCategories(lang).find((c) => c.id === cat.id);
    if (legacy && sameCategory(cat, legacy)) return true;
  }
  return false;
}
function followCategoriesToLang(cats, target) {
  const targetRestore = defaultCategoriesForRestore(target);
  const pristineFlags = cats.map((c) => isPristineDefaultCategory(c));
  const keptNames = new Set(
    cats
      .filter((_, i) => !pristineFlags[i])
      .map((c) => c.name.trim().toLowerCase()),
  );
  let followedCount = 0;
  let keptCount = 0;
  const categories = cats.map((c, i) => {
    if (!pristineFlags[i]) {
      keptCount++;
      return c;
    }
    const twin = targetRestore.find((o) => o.id === c.id);
    if (!twin || keptNames.has(twin.name.trim().toLowerCase())) {
      return c;
    }
    followedCount++;
    return { ...twin, aliases: [...twin.aliases] };
  });
  return {
    categories,
    followedCount,
    keptCount,
    changed: !sameCategorySet(categories, cats),
  };
}
function defaultSettingsFor(lang) {
  if (lang === "zh") {
    return { ...DEFAULT_SETTINGS, categories: defaultCategoriesFor("zh") };
  }
  return {
    version: DEFAULT_SETTINGS.version,
    language: "auto",
    recordsFolder: "Time Records",
    templatePath: "Time Records/timer template.md",
    flashNotePath: "",
    categories: defaultCategoriesFor(lang),
  };
}

// src/settingsMigration.ts
var CURRENT_SETTINGS_VERSION = DEFAULT_SETTINGS.version;
function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function cloneDefaults() {
  return {
    version: CURRENT_SETTINGS_VERSION,
    language: DEFAULT_SETTINGS.language,
    recordsFolder: DEFAULT_SETTINGS.recordsFolder,
    templatePath: DEFAULT_SETTINGS.templatePath,
    flashNotePath: DEFAULT_SETTINGS.flashNotePath,
    categories: DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      aliases: [...c.aliases],
    })),
  };
}
function normalizeLanguage(raw) {
  return raw === "auto" ||
    raw === "zh" ||
    raw === "en" ||
    raw === "ja" ||
    raw === "ko"
    ? raw
    : "auto";
}
function normalizeCategory(raw) {
  if (!isPlainObject(raw)) return null;
  const { id, name, emoji, aliases } = raw;
  if (typeof id !== "string" || id.trim() === "") return null;
  if (typeof name !== "string" || name.trim() === "") return null;
  if (typeof emoji !== "string" || emoji === "") return null;
  const safeAliases = Array.isArray(aliases)
    ? aliases.filter((a) => typeof a === "string")
    : [];
  return { id, name, emoji, aliases: safeAliases };
}
function migrateSettings(loaded) {
  if (loaded === null || loaded === void 0) {
    return { settings: cloneDefaults(), recovered: false };
  }
  if (!isPlainObject(loaded)) {
    return { settings: cloneDefaults(), recovered: true };
  }
  const defaults = cloneDefaults();
  let recovered = false;
  const recordsFolder =
    typeof loaded.recordsFolder === "string" &&
    loaded.recordsFolder.trim() !== ""
      ? loaded.recordsFolder
      : defaults.recordsFolder;
  const templatePath =
    typeof loaded.templatePath === "string" && loaded.templatePath.trim() !== ""
      ? loaded.templatePath
      : defaults.templatePath;
  const flashNotePath =
    typeof loaded.flashNotePath === "string"
      ? loaded.flashNotePath
      : defaults.flashNotePath;
  let categories;
  if (!Array.isArray(loaded.categories)) {
    categories = defaults.categories;
    recovered = true;
  } else {
    const salvaged = loaded.categories
      .map(normalizeCategory)
      .filter((c) => c !== null);
    if (salvaged.length === 0) {
      categories = defaults.categories;
      recovered = true;
    } else {
      categories = salvaged;
    }
  }
  return {
    settings: {
      version: CURRENT_SETTINGS_VERSION,
      language: normalizeLanguage(loaded.language),
      recordsFolder,
      templatePath,
      flashNotePath,
      categories,
    },
    recovered,
  };
}

// src/time.ts
function parseHHMM(s) {
  if (s === "24:00") return 24 * 60;
  const m = s.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return NaN;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return NaN;
  return h * 60 + min;
}
function formatHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function minutesDiff(start, end) {
  const s = parseHHMM(start);
  const e = parseHHMM(end);
  if (isNaN(s) || isNaN(e)) return 0;
  return e - s;
}
function formatDuration(totalMinutes) {
  if (totalMinutes < 60) return `${totalMinutes}min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}min`;
}
function nowHHMM() {
  const d = /* @__PURE__ */ new Date();
  return formatHHMM(d.getHours() * 60 + d.getMinutes());
}
function isOpenEnd(end) {
  return end === "ing" || end === "00:00";
}

// src/categoryInfer.ts
function inferCategoryId(activity, categories) {
  const a = activity.trim().toLowerCase();
  if (a === "") return "other";
  for (const c of categories) {
    if (c.name && a === c.name.toLowerCase()) return c.id;
  }
  for (const c of categories) {
    if (c.name && a.includes(c.name.toLowerCase())) return c.id;
  }
  for (const c of categories) {
    const aliases = c.aliases ?? [];
    for (const alias of aliases) {
      const key = alias.trim().toLowerCase();
      if (key && a.includes(key)) return c.id;
    }
  }
  return "other";
}

// src/parser.ts
var SEGMENT_REGEX =
  /^(\s*)([-*])\s+\[[ xX]\]\s+(\d{1,2}:\d{1,2})\s*-\s*(\d{1,2}:\d{1,2}|ing)(?=\s|$)\s*(.*)$/;
function parseDayContent(content, categories) {
  const lines = content.split("\n");
  const segments = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith(">")) continue;
    const match = line.match(SEGMENT_REGEX);
    if (!match) continue;
    const [, , , start, end, rest] = match;
    const activity = rest.trim();
    if (start === "00:00" && end === "00:00" && activity === "") continue;
    if (isNaN(parseHHMM(start))) continue;
    if (end !== "ing" && isNaN(parseHHMM(end))) continue;
    segments.push({
      start,
      end,
      activity,
      categoryId: inferCategoryId(activity, categories),
      lineNumber: i,
    });
  }
  return segments;
}
function formatSegmentLine(seg) {
  const startMin = parseHHMM(seg.start);
  const start = isNaN(startMin) ? seg.start : formatHHMM(startMin);
  let end;
  if (seg.end === "ing" || seg.end === "24:00") {
    end = seg.end;
  } else {
    const endMin = parseHHMM(seg.end);
    end = isNaN(endMin) ? seg.end : formatHHMM(endMin);
  }
  return `- [ ] ${start} - ${end} ${seg.activity}`.trimEnd();
}
function replaceLine(content, lineNumber, newLine) {
  const lines = content.split("\n");
  if (lineNumber < 0 || lineNumber >= lines.length) return content;
  lines[lineNumber] = newLine;
  return lines.join("\n");
}
function appendLine(content, newLine) {
  if (content === "") return newLine + "\n";
  const trimmed = content.endsWith("\n") ? content : content + "\n";
  return trimmed + newLine + "\n";
}

// src/date.ts
function getTodayDateString() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function getDateFilename(dateString) {
  return `${dateString}.md`;
}
function addDays(dateString, delta) {
  const d = parseDateString(dateString);
  if (!d) return dateString;
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function parseDateString(dateString) {
  const m = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(parseInt(y, 10), parseInt(mo, 10) - 1, parseInt(d, 10));
}
function dayViewEffectiveNow(anchor, today, now) {
  return anchor === today ? now : "24:00";
}
var REL_DAY_LABELS = {
  today: "\u4ECA\u5929",
  yesterday: "\u6628\u5929",
  tomorrow: "\u660E\u5929",
};
function relativeDayLabel(anchor, today, labels = REL_DAY_LABELS) {
  if (anchor === today) return labels.today;
  if (anchor === addDays(today, -1)) return labels.yesterday;
  if (anchor === addDays(today, 1)) return labels.tomorrow;
  return "";
}

// src/recordsFile.ts
var RecordsFileManager = class {
  constructor(vault, settings) {
    this.vault = vault;
    this.settings = settings;
  }
  getDayFilePath(date) {
    return `${this.settings.recordsFolder}/${getDateFilename(date)}`;
  }
  async ensureFileExists(date) {
    const filePath = this.getDayFilePath(date);
    if (await this.vault.exists(filePath)) return;
    try {
      await this.vault.createFolder(this.settings.recordsFolder);
    } catch {}
    let templateContent = "";
    if (await this.vault.exists(this.settings.templatePath)) {
      templateContent = await this.vault.read(this.settings.templatePath);
    }
    await this.vault.write(filePath, templateContent);
  }
  async readDayRecord(date) {
    const filePath = this.getDayFilePath(date);
    const content = (await this.vault.exists(filePath))
      ? await this.vault.read(filePath)
      : "";
    return {
      date,
      filePath,
      segments: parseDayContent(content, this.settings.categories),
    };
  }
  async readDayContent(date) {
    const filePath = this.getDayFilePath(date);
    if (!(await this.vault.exists(filePath))) return "";
    return this.vault.read(filePath);
  }
  async writeDayContent(date, content) {
    await this.ensureFileExists(date);
    await this.vault.write(this.getDayFilePath(date), content);
  }
  async writeRawByPath(filePath, content) {
    await this.vault.write(filePath, content);
  }
};
function createObsidianVaultAdapter(app) {
  return {
    async exists(path) {
      return await app.vault.adapter.exists(path);
    },
    async read(path) {
      return await app.vault.adapter.read(path);
    },
    async write(path, content) {
      await app.vault.adapter.write(path, content);
    },
    async createFolder(path) {
      try {
        await app.vault.createFolder(path);
      } catch {}
    },
  };
}

// src/undoStack.ts
var UndoStack = class {
  constructor() {
    this.entry = null;
  }
  push(e) {
    this.entry = e;
  }
  pop() {
    const e = this.entry;
    this.entry = null;
    return e;
  }
  peek() {
    return this.entry;
  }
  size() {
    return this.entry ? 1 : 0;
  }
};

// src/GridModal.ts
var import_obsidian2 = require("obsidian");

// src/punchIn.ts
async function punchIn(mgr, undo, args, categoriesForInfer) {
  await mgr.ensureFileExists(args.date);
  const filePath = mgr.getDayFilePath(args.date);
  const before = await mgr.readDayContent(args.date);
  undo.push({
    filePath,
    beforeLines: before.split("\n"),
    description: `Punched in ${args.activity} at ${args.now}`,
    timestamp: Date.now(),
  });
  const categories = categoriesForInfer ?? [];
  const segments = parseDayContent(before, categories);
  let after = before;
  const openSeg = segments.find((s) => isOpenEnd(s.end));
  if (openSeg) {
    const closed = formatSegmentLine({
      ...openSeg,
      end: args.now,
    });
    after = replaceLine(after, openSeg.lineNumber, closed);
  }
  const newLine = formatSegmentLine({
    start: args.now,
    end: "ing",
    activity: args.activity,
    categoryId: "",
    lineNumber: -1,
  });
  after = appendLine(after, newLine);
  await mgr.writeDayContent(args.date, after);
}
async function undoLast(mgr, undo) {
  const entry = undo.pop();
  if (!entry) return false;
  const restored = entry.beforeLines.join("\n");
  await mgr.writeRawByPath(entry.filePath, restored);
  return true;
}

// src/openTodayFile.ts
var import_obsidian = require("obsidian");

// src/summarize.ts
var DAY_TOTAL_MINUTES = 24 * 60;
function summarizeDay(day, categories, now) {
  const minutesByCat = /* @__PURE__ */ new Map();
  const actsByCat = /* @__PURE__ */ new Map();
  for (const seg of day.segments) {
    const end = isOpenEnd(seg.end) ? now : seg.end;
    const mins = minutesDiff(seg.start, end);
    if (mins <= 0) continue;
    minutesByCat.set(
      seg.categoryId,
      (minutesByCat.get(seg.categoryId) ?? 0) + mins,
    );
    const list = actsByCat.get(seg.categoryId) ?? [];
    if (!list.includes(seg.activity)) list.push(seg.activity);
    actsByCat.set(seg.categoryId, list);
  }
  const buckets = [];
  for (const [catId, mins] of minutesByCat) {
    const cat = categories.find((c) => c.id === catId);
    buckets.push({
      categoryId: catId,
      emoji: cat?.emoji ?? "\u2753",
      name: cat?.name ?? catId,
      minutes: mins,
      percent: (mins / DAY_TOTAL_MINUTES) * 100,
      activities: actsByCat.get(catId) ?? [],
    });
  }
  buckets.sort((a, b) => b.minutes - a.minutes);
  const totalRecorded = buckets.reduce((s, b) => s + b.minutes, 0);
  const unrecorded = Math.max(0, DAY_TOTAL_MINUTES - totalRecorded);
  return {
    date: day.date,
    totalRecordedMinutes: totalRecorded,
    unrecordedMinutes: unrecorded,
    unrecordedPercent: (unrecorded / DAY_TOTAL_MINUTES) * 100,
    byCategory: buckets,
  };
}
var ZH_MARKDOWN_STRINGS = {};
function formatSummaryAsMarkdown(
  day,
  summary,
  _categories,
  s = ZH_MARKDOWN_STRINGS,
) {
  const lines = [];
  lines.push(s.headingTpl.replace("{title}", day.date));
  lines.push("");
  lines.push(s.tableHeader);
  lines.push("|---|---|---|---|---|");
  summary.byCategory.forEach((b, i) => {
    const acts = b.activities.join(" / ");
    lines.push(
      `| ${i + 1} | ${b.emoji} ${b.name} | **${formatDuration(b.minutes)}** | ${b.percent.toFixed(1)}% | ${acts} |`,
    );
  });
  lines.push(
    `| - | ${s.unrecordedLabel} | ${formatDuration(summary.unrecordedMinutes)} | ${summary.unrecordedPercent.toFixed(1)}% | |`,
  );
  lines.push(`| | **${s.totalLabel}** | **24h** | 100% | |`);
  return lines.join("\n");
}
function summarizePeriod(days, categories, opts) {
  const minutesByCat = /* @__PURE__ */ new Map();
  const actsByCat = /* @__PURE__ */ new Map();
  for (const day of days) {
    for (const seg of day.segments) {
      const end = isOpenEnd(seg.end)
        ? day.date === opts.today
          ? opts.now
          : "24:00"
        : seg.end;
      const mins = minutesDiff(seg.start, end);
      if (mins <= 0) continue;
      minutesByCat.set(
        seg.categoryId,
        (minutesByCat.get(seg.categoryId) ?? 0) + mins,
      );
      const list = actsByCat.get(seg.categoryId) ?? [];
      if (!list.includes(seg.activity)) list.push(seg.activity);
      actsByCat.set(seg.categoryId, list);
    }
  }
  const denom = opts.denominatorMinutes;
  const buckets = [];
  for (const [catId, mins] of minutesByCat) {
    const cat = categories.find((c) => c.id === catId);
    buckets.push({
      categoryId: catId,
      emoji: cat?.emoji ?? "\u2753",
      name: cat?.name ?? catId,
      minutes: mins,
      percent: denom > 0 ? (mins / denom) * 100 : 0,
      activities: actsByCat.get(catId) ?? [],
    });
  }
  buckets.sort((a, b) => b.minutes - a.minutes);
  const totalRecorded = buckets.reduce((s, b) => s + b.minutes, 0);
  const unrecorded = Math.max(0, denom - totalRecorded);
  return {
    totalRecordedMinutes: totalRecorded,
    denominatorMinutes: denom,
    unrecordedMinutes: unrecorded,
    unrecordedPercent: denom > 0 ? (unrecorded / denom) * 100 : 0,
    byCategory: buckets,
  };
}
function formatPeriodSummaryAsMarkdown(
  title,
  summary,
  s = ZH_MARKDOWN_STRINGS,
) {
  const lines = [];
  lines.push(s.headingTpl.replace("{title}", title));
  lines.push("");
  lines.push(s.tableHeader);
  lines.push("|---|---|---|---|---|");
  summary.byCategory.forEach((b, i) => {
    const acts = b.activities.join(" / ");
    lines.push(
      `| ${i + 1} | ${b.emoji} ${b.name} | **${formatDuration(b.minutes)}** | ${b.percent.toFixed(1)}% | ${acts} |`,
    );
  });
  lines.push(
    `| - | ${s.unrecordedLabel} | ${formatDuration(summary.unrecordedMinutes)} | ${summary.unrecordedPercent.toFixed(1)}% | |`,
  );
  lines.push(
    `| | **${s.totalLabel}** | **${formatDuration(summary.denominatorMinutes)}** | 100% | |`,
  );
  return lines.join("\n");
}

// src/segmentEdit.ts
var ZH_SEGMENT_TIME_MESSAGES = {
  startInvalid: "\u5F00\u59CB\u65F6\u95F4\u65E0\u6548",
  endInvalid: "\u7ED3\u675F\u65F6\u95F4\u65E0\u6548",
  endNotAfterStart:
    "\u7ED3\u675F\u65F6\u95F4\u5FC5\u987B\u665A\u4E8E\u5F00\u59CB\u65F6\u95F4",
};
function validateSegmentTimes(start, end, msgs = ZH_SEGMENT_TIME_MESSAGES) {
  const startMin = parseHHMM(start);
  if (isNaN(startMin)) {
    return { ok: false, error: msgs.startInvalid };
  }
  const endRaw = end.trim();
  if (endRaw === "" || isOpenEnd(endRaw)) {
    return { ok: true, normalizedEnd: "ing" };
  }
  const endMin = parseHHMM(endRaw);
  if (isNaN(endMin)) {
    return { ok: false, error: msgs.endInvalid };
  }
  if (endMin <= startMin) {
    return { ok: false, error: msgs.endNotAfterStart };
  }
  return { ok: true, normalizedEnd: endRaw };
}

// src/settingsValidation.ts
function parseAliases(input) {
  const parts = input
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}
var ZH_CATEGORY_NAME_MESSAGES = {
  empty: "\u5206\u7C7B\u540D\u4E0D\u80FD\u4E3A\u7A7A",
  duplicate: "\u5206\u7C7B\u540D\u5DF2\u5B58\u5728",
};
function validateCategoryName(
  name,
  categories,
  selfIndex,
  msgs = ZH_CATEGORY_NAME_MESSAGES,
) {
  const n = name.trim().toLowerCase();
  if (n === "") return msgs.empty;
  for (let i = 0; i < categories.length; i++) {
    if (i === selfIndex) continue;
    if (categories[i].name.trim().toLowerCase() === n) return msgs.duplicate;
  }
  return null;
}

// src/i18n.ts
var LANG_NAMES = {
  zh: "\u7B80\u4F53\u4E2D\u6587",
  en: "English",
  ja: "\u65E5\u672C\u8A9E",
  ko: "\uD55C\uAD6D\uC5B4",
};
function resolveLang(raw) {
  if (!raw) return "en";
  const lower = raw.toLowerCase();
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko")) return "ko";
  return "en";
}
var cachedLang = null;
var langOverride = null;
function setLangOverride(lang) {
  langOverride = lang;
}
function getLang() {
  if (langOverride) return langOverride;
  if (cachedLang === null) {
    let raw = null;
    try {
      raw = window.localStorage.getItem("language");
    } catch {
      raw = null;
    }
    cachedLang = resolveLang(raw);
  }
  return cachedLang;
}
function format(template, vars) {
  return template.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
}
var zh = {};
var en = {
  corruptSettings:
    "⏱️ Time Recorder: в файле настроек произошла ошибка, загружены настройки по умолчанию. Оригинальный файл сохранен в резервной копии.",
  cellCustom: "Ввести вручную…",
  btnUndo: "↶ Отменить",
  btnToday: "📄 Сегодня",
  btnSummary: "📊 Сводка",
  btnTimeline: "📅 Таймлайн",
  btnClose: "✕ Закрыть",
  nowDoing: "Сейчас: {emoji} {activity} (с {start}, {dur})",
  notStarted: "Нет активных действий",
  undone: "Отменено ✅",
  nothingToUndo: "Нечего отменять",
  punchFailed: "Ошибка отметки: ",
  customTitle: "Своя активность",
  customWhat: "Что вы делаете?",
  customPlaceholder: "Например: Пишу отчет",
  cancel: "Отмена",
  confirmPunch: "Отметить",
  emptyActivity: "Название активности не может быть пустым",
  openTodayFailed: "Не удалось открыть запись за сегодня: ",
  punchSuccess: "✅ {activity} с {now} (нажмите, чтобы открыть запись)",
  btnFlash: "⚡ Быстрая заметка",
  flashPickerPlaceholder: "Выберите заметку для быстрых записей (запомнится)",
  flashTargetSaved: "⚡ Цель быстрой заметки: {path}",
  flashTargetMissing: 'Заметка "{path}" не найдена — выберите новую',
  flashOpenFailed: "Не удалось открыть быструю заметку: ",
  segTitleNew: "Новый отрезок",
  segTitleEdit: "Редактировать отрезок",
  segStart: "Начало",
  segEnd: "Конец (пусто = в процессе)",
  segDesc:
    "Описание (пусто = 'Без названия'; категория определится автоматически)",
  segDelete: "Удалить",
  segSave: "Сохранить",
  segInvalidTime: "Неверное время",
  segUnnamed: "Без названия",
  segUpdatedDone: "Обновлено ✅",
  segUpdatedIng: "Обновлено (в процессе) ✅",
  segCreatedDone: "Создано ✅",
  segCreatedIng: "Создано (в процессе) ✅",
  saveFailed: "Ошибка сохранения: ",
  deleted: "Удалено ✅",
  deleteFailed: "Ошибка удаления: ",
  setLangName: "Язык",
  setLangDesc:
    "Язык интерфейса плагина. 'Follow Obsidian' соответствует языку интерфейса Obsidian. При смене языка переведенные стандартные категории обновятся, а измененные вами останутся как есть. Файлы записей и история не затрагиваются.",
  langAuto: "Как в Obsidian (по умолчанию)",
  catsFollowedLang:
    "✅ Стандартные категории переведены на {lang} — ваши записи не затронуты",
  langCatHint:
    "Измененные вами категории остались как есть. Чтобы перевести их, отредактируйте названия ниже.",
  setFolderName: "Папка записей",
  setFolderDesc:
    "Папка для файлов .md с записями времени. Изменение этого параметра не перемещает существующие файлы.",
  setTemplateName: "Путь к шаблону",
  setTemplateDesc: "Шаблон, применяемый при создании файла за день.",
  setFlashName: "Заметка для быстрых записей",
  setFlashDesc:
    "Заметка, в конец которой переходит кнопка ⚡ для быстрых записей. Оставьте пустым, чтобы выбрать из списка при первом нажатии.",
  setFlashPh: "Например: Входящие.md",
  setCatHeading: "Категории",
  setCatHint:
    "Активности распределяются по категориям на основе названия или ключевых слов (через запятую). Переименование или удаление категорий не переписывает прошлые записи.",
  otherName: "Другое",
  otherDesc:
    "Резервная категория для всего, что не совпало с другими. Существует всегда, нельзя удалить или задать ключевые слова.",
  addCat: "+ Добавить категорию",
  resetCats: "Сбросить к стандартным",
  resetConfirm:
    "Заменить все текущие категории стандартными? Это действие нельзя отменить.",
  catNamePh: "Название категории",
  aliasPh: "Ключевые слова через запятую",
  delCatTip: "Удалить эту категорию",
  ok: "ОК",
  statusIdle: "⏱ Ожидание",
  tlPrev: "< Пред. день",
  tlNext: "След. день >",
  tlToday: "Сегодня",
  sumTabToday: "День",
  sumTabWeek: "Неделя",
  sumTabMonth: "Месяц",
  sumPrevDay: "‹ Пред. день",
  sumTodayBtn: "Сегодня",
  sumNextDay: "След. день ›",
  sumRecorded24: "Записано {dur} из 24ч ({pct}%)",
  copySummary: "📋 Скопировать сводку",
  weekLabel: "Эта неделя",
  monthLabel: "Этот месяц",
  prevWeek: "‹ Пред. неделя",
  prevMonth: "‹ Пред. месяц",
  nextWeek: "След. неделя ›",
  nextMonth: "След. месяц ›",
  sumRecordedElapsed: "Записано {dur} из {elapsed} ({pct}%)",
  dailyAvg: "В среднем за день: {dur}",
  thRank: "№",
  thCat: "Категория",
  thDur: "Время",
  thPct: "Доля",
  unrecordedRow: "⚪ Не записано",
  heatTitle: "Карта активности",
  heatWeekdays: "П В С Ч П С В",
  heatDayDetail: "{date}: записано {dur}",
  heatDayEmpty: "{date}: нет записей",
  copied: "Скопировано в буфер ✅",
  copyFailed: "Ошибка копирования: ",
};
var ja = {};
var ko = {};
var STRINGS = { zh: en, en: en, ja: en, ko: en };
function t(key) {
  return STRINGS[getLang()][key];
}
var EN_MARKDOWN_STRINGS = {
  headingTpl: "## Сводка времени ({title})",
  tableHeader: "| № | Категория | Время | Доля | Активности |",
  unrecordedLabel: "⚪ Не записано",
  totalLabel: "Итого",
};
var JA_MARKDOWN_STRINGS = {};
var KO_MARKDOWN_STRINGS = {};
var MARKDOWN_STRINGS = {
  zh: ZH_MARKDOWN_STRINGS,
  en: EN_MARKDOWN_STRINGS,
  ja: JA_MARKDOWN_STRINGS,
  ko: KO_MARKDOWN_STRINGS,
};
function mdStrings() {
  return MARKDOWN_STRINGS[getLang()];
}
var EN_REL_DAY_LABELS = {
  today: "Сегодня",
  yesterday: "Вчера",
  tomorrow: "Завтра",
};
var JA_REL_DAY_LABELS = {};
var KO_REL_DAY_LABELS = {};
var REL_DAY_LABELS_ALL = {
  zh: REL_DAY_LABELS,
  en: EN_REL_DAY_LABELS,
  ja: JA_REL_DAY_LABELS,
  ko: KO_REL_DAY_LABELS,
};
function relDayLabels() {
  return REL_DAY_LABELS_ALL[getLang()];
}
var EN_SEGMENT_TIME_MESSAGES = {
  startInvalid: "Неверное время начала",
  endInvalid: "Неверное время окончания",
  endNotAfterStart: "Время окончания должно быть позже времени начала",
};
var JA_SEGMENT_TIME_MESSAGES = {};
var KO_SEGMENT_TIME_MESSAGES = {};
var SEGMENT_TIME_MESSAGES = {
  zh: ZH_SEGMENT_TIME_MESSAGES,
  en: EN_SEGMENT_TIME_MESSAGES,
  ja: JA_SEGMENT_TIME_MESSAGES,
  ko: KO_SEGMENT_TIME_MESSAGES,
};
function segmentTimeMessages() {
  return SEGMENT_TIME_MESSAGES[getLang()];
}
var EN_CATEGORY_NAME_MESSAGES = {
  empty: "Название категории не может быть пустым",
  duplicate: "Такое название категории уже существует",
};
var JA_CATEGORY_NAME_MESSAGES = {};
var KO_CATEGORY_NAME_MESSAGES = {};
var CATEGORY_NAME_MESSAGES = {
  zh: ZH_CATEGORY_NAME_MESSAGES,
  en: EN_CATEGORY_NAME_MESSAGES,
  ja: JA_CATEGORY_NAME_MESSAGES,
  ko: KO_CATEGORY_NAME_MESSAGES,
};
function categoryNameMessages() {
  return CATEGORY_NAME_MESSAGES[getLang()];
}

// src/openTodayFile.ts
async function openTodayFile(app, recordsFile) {
  try {
    const today = getTodayDateString();
    await recordsFile.ensureFileExists(today);
    const path = recordsFile.getDayFilePath(today);
    const tfile = app.vault.getAbstractFileByPath(path);
    if (tfile instanceof import_obsidian.TFile) {
      await app.workspace.getLeaf(false).openFile(tfile);
    } else {
      await app.workspace.openLinkText(path, "", false);
    }
  } catch (err) {
    new import_obsidian.Notice(t("openTodayFailed") + err.message);
    console.error("Open today file failed", err);
  }
}
var SUCCESS_NOTICE_DURATION_MS = 8e3;
function showPunchSuccessNotice(app, recordsFile, activity, now) {
  const notice = new import_obsidian.Notice(
    format(t("punchSuccess"), { activity, now }),
    SUCCESS_NOTICE_DURATION_MS,
  );
  notice.noticeEl.addClass("tr-clickable-notice");
  notice.noticeEl.addEventListener(
    "click",
    () => void openTodayFile(app, recordsFile),
  );
}

// src/segmentColor.ts
var PALETTE_HUES = [210, 145, 35, 280, 0, 190, 95, 320, 50, 260, 170, 15];
var SAT = 65;
var LIGHT = 55;
function segmentColor(categoryId, categories) {
  if (categoryId === "other") return null;
  const index = categories.findIndex((c) => c.id === categoryId);
  if (index < 0) return null;
  const hue = PALETTE_HUES[index % PALETTE_HUES.length];
  return {
    bg: `hsla(${hue}, ${SAT}%, ${LIGHT}%, 0.15)`,
    border: `hsla(${hue}, ${SAT}%, ${LIGHT}%, 0.55)`,
    accent: `hsl(${hue}, ${SAT}%, ${LIGHT}%)`,
  };
}

// src/GridModal.ts
var GridModal = class extends import_obsidian2.Modal {
  constructor(
    app,
    settings,
    recordsFile,
    undoStack,
    onPunched,
    openCustomActivity,
    openSummary,
    openTimeline,
    openFlash,
  ) {
    super(app);
    this.settings = settings;
    this.recordsFile = recordsFile;
    this.undoStack = undoStack;
    this.onPunched = onPunched;
    this.openCustomActivity = openCustomActivity;
    this.openSummary = openSummary;
    this.openTimeline = openTimeline;
    this.openFlash = openFlash;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("tr-grid-modal");
    await this.renderHeader(contentEl);
    const grid = contentEl.createDiv({ cls: "tr-grid" });
    const cats = this.settings.categories;
    grid.style.setProperty(
      "--tr-grid-rows",
      String(Math.ceil((cats.length + 1) / 3)),
    );
    for (const cat of cats) {
      this.renderCell(
        grid,
        cat,
        cat.emoji,
        cat.name,
        () => void this.handlePunch(cat.name),
      );
    }
    this.renderCell(grid, null, "\u270F\uFE0F", t("cellCustom"), () => {
      this.close();
      this.openCustomActivity?.();
    });
    const footer = contentEl.createDiv({ cls: "tr-grid-footer" });
    const undoBtn = footer.createEl("button", { text: t("btnUndo") });
    undoBtn.addEventListener("click", () => void this.handleUndo());
    if (this.undoStack.size() === 0) undoBtn.setAttribute("disabled", "true");
    const openTodayBtn = footer.createEl("button", { text: t("btnToday") });
    openTodayBtn.addEventListener("click", () => {
      this.close();
      void openTodayFile(this.app, this.recordsFile);
    });
    const openSummaryBtn = footer.createEl("button", { text: t("btnSummary") });
    openSummaryBtn.addEventListener("click", () => {
      this.close();
      this.openSummary?.();
    });
    const openTimelineBtn = footer.createEl("button", {
      text: t("btnTimeline"),
    });
    openTimelineBtn.addEventListener("click", () => {
      this.close();
      this.openTimeline?.();
    });
    const flashBtn = footer.createEl("button", { text: t("btnFlash") });
    flashBtn.addEventListener("click", () => {
      this.close();
      this.openFlash?.();
    });
    const closeBtn = footer.createEl("button", { text: t("btnClose") });
    closeBtn.addEventListener("click", () => this.close());
  }
  async renderHeader(parent) {
    const header = parent.createDiv({ cls: "tr-grid-header" });
    const today = getTodayDateString();
    const day = await this.recordsFile.readDayRecord(today);
    const open = day.segments.find((s) => isOpenEnd(s.end));
    if (open) {
      const cat = this.settings.categories.find(
        (c) => c.id === open.categoryId,
      );
      const emoji = cat ? cat.emoji : "\u2753";
      const duration = minutesDiff(open.start, nowHHMM());
      header.setText(
        format(t("nowDoing"), {
          emoji,
          activity: open.activity,
          start: open.start,
          dur: formatDuration(duration),
        }),
      );
    } else {
      header.setText(t("notStarted"));
    }
  }
  renderCell(parent, cat, emoji, label, onClick) {
    const cell = parent.createDiv({ cls: "tr-cell" });
    if (cat) {
      const color = segmentColor(cat.id, this.settings.categories);
      if (color) {
        cell.style.setProperty("--tr-cat-bg", color.bg);
        cell.style.setProperty("--tr-cat-border", color.border);
      }
    }
    cell.createDiv({ cls: "tr-cell-emoji", text: emoji });
    cell.createDiv({ cls: "tr-cell-label", text: label });
    cell.addEventListener("click", onClick);
  }
  async handleUndo() {
    const ok = await undoLast(this.recordsFile, this.undoStack);
    if (ok) new import_obsidian2.Notice(t("undone"));
    else new import_obsidian2.Notice(t("nothingToUndo"));
    this.close();
    this.onPunched?.();
  }
  async handlePunch(activity) {
    const now = nowHHMM();
    const today = getTodayDateString();
    try {
      await punchIn(
        this.recordsFile,
        this.undoStack,
        {
          date: today,
          activity,
          now,
        },
        this.settings.categories,
      );
      showPunchSuccessNotice(this.app, this.recordsFile, activity, now);
      this.close();
      this.onPunched?.();
    } catch (err) {
      new import_obsidian2.Notice(t("punchFailed") + err.message);
      console.error("Punch-in failed", err);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/CustomActivityModal.ts
var import_obsidian3 = require("obsidian");
var CustomActivityModal = class extends import_obsidian3.Modal {
  constructor(app, settings, recordsFile, undoStack, onPunched) {
    super(app);
    this.settings = settings;
    this.recordsFile = recordsFile;
    this.undoStack = undoStack;
    this.onPunched = onPunched;
    this.activity = "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("tr-custom-modal");
    contentEl.createEl("h2", { text: t("customTitle") });
    const row1 = contentEl.createDiv({ cls: "tr-form-row" });
    row1.createEl("label", { text: t("customWhat") });
    const input = row1.createEl("input", {
      type: "text",
      placeholder: t("customPlaceholder"),
    });
    input.addEventListener("input", () => (this.activity = input.value));
    window.setTimeout(() => input.focus(), 50);
    const buttons = contentEl.createDiv({ cls: "tr-form-buttons" });
    const cancel = buttons.createEl("button", { text: t("cancel") });
    cancel.addEventListener("click", () => this.close());
    const submit = buttons.createEl("button", {
      text: t("confirmPunch"),
      cls: "mod-cta",
    });
    submit.addEventListener("click", () => void this.handleSubmit());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") void this.handleSubmit();
    });
  }
  async handleSubmit() {
    const activity = this.activity.trim();
    if (activity === "") {
      new import_obsidian3.Notice(t("emptyActivity"));
      return;
    }
    const now = nowHHMM();
    const today = getTodayDateString();
    try {
      await punchIn(
        this.recordsFile,
        this.undoStack,
        {
          date: today,
          activity,
          now,
        },
        this.settings.categories,
      );
      showPunchSuccessNotice(this.app, this.recordsFile, activity, now);
      this.close();
      this.onPunched?.();
    } catch (err) {
      new import_obsidian3.Notice(t("punchFailed") + err.message);
      console.error("Punch-in failed", err);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/statusBar.ts
var StatusIndicator = class {
  constructor(plugin, settings, recordsFile) {
    this.plugin = plugin;
    this.settings = settings;
    this.recordsFile = recordsFile;
  }
  attachStatusBar() {
    this.statusEl = this.plugin.addStatusBarItem();
    this.statusEl.addClass("tr-status");
    void this.refresh();
    this.intervalId = window.setInterval(() => void this.refresh(), 3e4);
    this.plugin.registerInterval(this.intervalId);
  }
  attachRibbon(ribbon) {
    this.ribbonEl = ribbon;
    void this.refresh();
  }
  async refresh() {
    const today = getTodayDateString();
    const day = await this.recordsFile.readDayRecord(today).catch(() => null);
    const open = day?.segments.find((s) => isOpenEnd(s.end));
    let text = t("statusIdle");
    if (open) {
      const cat = this.settings.categories.find(
        (c) => c.id === open.categoryId,
      );
      const emoji = cat?.emoji ?? "\u2753";
      const dur = formatDuration(minutesDiff(open.start, nowHHMM()));
      text = `${emoji} ${open.activity} \xB7 ${dur}`;
    }
    if (this.statusEl) this.statusEl.setText(text);
    if (this.ribbonEl) this.ribbonEl.setAttribute("aria-label", text);
  }
};

// src/TodaySummaryView.ts
var import_obsidian4 = require("obsidian");

// src/heatmap.ts
function dayRecordedMinutes(day, today, now) {
  const effNow = day.date === today ? now : "24:00";
  let total = 0;
  for (const seg of day.segments) {
    const end = isOpenEnd(seg.end) ? effNow : seg.end;
    const mins = minutesDiff(seg.start, end);
    if (mins > 0) total += mins;
  }
  return total;
}
function heatLevel(minutes) {
  if (minutes <= 0) return 0;
  if (minutes < 120) return 1;
  if (minutes < 360) return 2;
  if (minutes < 720) return 3;
  return 4;
}
var BLANK = {
  date: null,
  minutes: 0,
  level: 0,
  isToday: false,
  isFuture: false,
};
function buildMonthHeatmap(days, today, now) {
  if (days.length === 0) return [];
  const first = parseDateString(days[0].date);
  const todayD = parseDateString(today);
  if (!first) return [];
  const cells = [];
  const leading = (first.getDay() + 6) % 7;
  for (let i = 0; i < leading; i++) cells.push({ ...BLANK });
  for (const day of days) {
    const minutes = dayRecordedMinutes(day, today, now);
    const d = parseDateString(day.date);
    cells.push({
      date: day.date,
      minutes,
      level: heatLevel(minutes),
      isToday: day.date === today,
      isFuture: !!(d && todayD && d.getTime() > todayD.getTime()),
    });
  }
  while (cells.length % 7 !== 0) cells.push({ ...BLANK });
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// src/periodRange.ts
function weekRange(date) {
  const d = parseDateString(date);
  if (!d) return { start: date, end: date };
  const offset = (d.getDay() + 6) % 7;
  const start = addDays(date, -offset);
  return { start, end: addDays(start, 6) };
}
function monthRange(date) {
  const d = parseDateString(date);
  if (!d) return { start: date, end: date };
  const y = d.getFullYear();
  const mo = d.getMonth();
  const lastDay = new Date(y, mo + 1, 0).getDate();
  return { start: `${y}-${mo + 1}-1`, end: `${y}-${mo + 1}-${lastDay}` };
}
function enumerateDates(start, end) {
  const s = parseDateString(start);
  const e = parseDateString(end);
  if (!s || !e || s.getTime() > e.getTime()) return [];
  const out = [];
  let cur = start;
  let curD = parseDateString(cur);
  while (curD.getTime() <= e.getTime()) {
    out.push(cur);
    cur = addDays(cur, 1);
    curD = parseDateString(cur);
  }
  return out;
}
function elapsedInPeriod(start, end, today, now) {
  const numDays = enumerateDates(start, end).length;
  const s = parseDateString(start);
  const e = parseDateString(end);
  const t2 = parseDateString(today);
  if (!s || !e || !t2) return { elapsedMinutes: 0, elapsedDays: 0 };
  if (t2.getTime() > e.getTime())
    return { elapsedMinutes: numDays * 1440, elapsedDays: numDays };
  if (t2.getTime() < s.getTime()) return { elapsedMinutes: 0, elapsedDays: 0 };
  const daysBeforeToday = Math.round((t2.getTime() - s.getTime()) / 864e5);
  const mins = parseHHMM(now);
  const todayMins = isNaN(mins) ? 0 : mins;
  return {
    elapsedMinutes: daysBeforeToday * 1440 + todayMins,
    elapsedDays: daysBeforeToday + 1,
  };
}

// src/serialize.ts
function serialize(fn) {
  let chain = Promise.resolve();
  return () => {
    const next = chain.then(() => fn());
    chain = next.catch(() => {});
    return next;
  };
}

// src/TodaySummaryView.ts
var VIEW_TYPE_TODAY_SUMMARY = "time-recorder-today-summary";
var TodaySummaryView = class extends import_obsidian4.ItemView {
  constructor(leaf, settings, recordsFile) {
    super(leaf);
    this.settings = settings;
    this.recordsFile = recordsFile;
    this.period = "day";
    this.anchor = getTodayDateString();
    /** 串行化刷新：并发 refresh 交错会导致内容重复渲染（根因见 serialize.ts 注释） */
    this.refresh = serialize(() => this.doRefresh());
  }
  getViewType() {
    return VIEW_TYPE_TODAY_SUMMARY;
  }
  getDisplayText() {
    return "Сводка";
  }
  getIcon() {
    return "pie-chart";
  }
  async onOpen() {
    await this.refresh();
  }
  async onClose() {}
  async doRefresh() {
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass("tr-summary-container");
    this.renderPeriodTabs(container);
    if (this.period === "day") {
      await this.renderDay(container);
    } else {
      await this.renderPeriod(container);
    }
  }
  renderPeriodTabs(container) {
    const tabs = container.createDiv({ cls: "tr-summary-tabs" });
    const mk = (label, p) => {
      const btn = tabs.createEl("button", { text: label });
      if (this.period === p) btn.addClass("mod-cta");
      btn.addEventListener("click", () => {
        if (this.period !== p) {
          this.period = p;
          this.anchor = getTodayDateString();
          void this.refresh();
        }
      });
    };
    mk(t("sumTabToday"), "day");
    mk(t("sumTabWeek"), "week");
    mk(t("sumTabMonth"), "month");
  }
  async renderDay(container) {
    const today = getTodayDateString();
    const anchor = this.anchor;
    const day = await this.readDaySafe(anchor);
    const now = dayViewEffectiveNow(anchor, today, nowHHMM());
    const summary = summarizeDay(day, this.settings.categories, now);
    const nav = container.createDiv({ cls: "tr-summary-nav" });
    const prevBtn = nav.createEl("button", { text: t("sumPrevDay") });
    prevBtn.addEventListener("click", () => {
      this.anchor = addDays(anchor, -1);
      void this.refresh();
    });
    const curBtn = nav.createEl("button", { text: t("sumTodayBtn") });
    curBtn.addEventListener("click", () => {
      this.anchor = getTodayDateString();
      void this.refresh();
    });
    const nextBtn = nav.createEl("button", { text: t("sumNextDay") });
    nextBtn.addEventListener("click", () => {
      this.anchor = addDays(anchor, 1);
      void this.refresh();
    });
    const rel = relativeDayLabel(anchor, today, relDayLabels());
    const header = container.createDiv({ cls: "tr-summary-header" });
    header.createEl("h3", {
      text: `\u{1F4C5} ${rel ? rel + " " : ""}${anchor}`,
    });
    const sub = header.createEl("div", { cls: "tr-summary-sub" });
    sub.setText(
      format(t("sumRecorded24"), {
        dur: formatDuration(summary.totalRecordedMinutes),
        pct: (100 - summary.unrecordedPercent).toFixed(0),
      }),
    );
    this.renderTable(
      container,
      summary.byCategory,
      summary.unrecordedMinutes,
      summary.unrecordedPercent,
    );
    const footer = container.createDiv({ cls: "tr-summary-footer" });
    const copyBtn = footer.createEl("button", { text: t("copySummary") });
    copyBtn.addEventListener("click", () => {
      void this.copyText(
        formatSummaryAsMarkdown(
          day,
          summary,
          this.settings.categories,
          mdStrings(),
        ),
      );
    });
  }
  async renderPeriod(container) {
    const range =
      this.period === "week" ? weekRange(this.anchor) : monthRange(this.anchor);
    const today = getTodayDateString();
    const now = nowHHMM();
    const dates = enumerateDates(range.start, range.end);
    const days = await Promise.all(dates.map((d) => this.readDaySafe(d)));
    const { elapsedMinutes, elapsedDays } = elapsedInPeriod(
      range.start,
      range.end,
      today,
      now,
    );
    const summary = summarizePeriod(days, this.settings.categories, {
      today,
      now,
      denominatorMinutes: elapsedMinutes,
    });
    const label = this.period === "week" ? t("weekLabel") : t("monthLabel");
    const nav = container.createDiv({ cls: "tr-summary-nav" });
    const prevBtn = nav.createEl("button", {
      text: this.period === "week" ? t("prevWeek") : t("prevMonth"),
    });
    prevBtn.addEventListener("click", () => {
      this.anchor = addDays(range.start, -1);
      void this.refresh();
    });
    const curBtn = nav.createEl("button", { text: label });
    curBtn.addEventListener("click", () => {
      this.anchor = getTodayDateString();
      void this.refresh();
    });
    const nextBtn = nav.createEl("button", {
      text: this.period === "week" ? t("nextWeek") : t("nextMonth"),
    });
    nextBtn.addEventListener("click", () => {
      this.anchor = addDays(range.end, 1);
      void this.refresh();
    });
    const header = container.createDiv({ cls: "tr-summary-header" });
    header.createEl("h3", {
      text: `\u{1F4C5} ${label} ${range.start} ~ ${range.end}`,
    });
    const sub = header.createEl("div", { cls: "tr-summary-sub" });
    const recordedPct =
      elapsedMinutes > 0 ? (100 - summary.unrecordedPercent).toFixed(0) : "0";
    sub.setText(
      format(t("sumRecordedElapsed"), {
        dur: formatDuration(summary.totalRecordedMinutes),
        elapsed: formatDuration(elapsedMinutes),
        pct: recordedPct,
      }),
    );
    const avg = header.createEl("div", { cls: "tr-summary-sub" });
    const avgMin =
      elapsedDays > 0
        ? Math.round(summary.totalRecordedMinutes / elapsedDays)
        : 0;
    avg.setText(format(t("dailyAvg"), { dur: formatDuration(avgMin) }));
    this.renderTable(
      container,
      summary.byCategory,
      summary.unrecordedMinutes,
      summary.unrecordedPercent,
    );
    if (this.period === "month") {
      this.renderHeatmap(container, days, today, now);
    }
    const footer = container.createDiv({ cls: "tr-summary-footer" });
    const copyBtn = footer.createEl("button", { text: t("copySummary") });
    copyBtn.addEventListener("click", () => {
      void this.copyText(
        formatPeriodSummaryAsMarkdown(
          `${label} ${range.start} ~ ${range.end}`,
          summary,
          mdStrings(),
        ),
      );
    });
  }
  /** 月历热力图：每天一格，绿色深浅 = 当天记录时长档位；点按弹出当天时长（移动端无 hover）。 */
  renderHeatmap(container, days, today, now) {
    const weeks = buildMonthHeatmap(days, today, now);
    if (weeks.length === 0) return;
    const wrap = container.createDiv({ cls: "tr-heatmap-wrap" });
    wrap.createDiv({ cls: "tr-heatmap-title", text: t("heatTitle") });
    const grid = wrap.createDiv({ cls: "tr-heatmap" });
    for (const ch of [...t("heatWeekdays")]) {
      grid.createDiv({ cls: "tr-heat-weekday", text: ch });
    }
    for (const week of weeks) {
      for (const cell of week) {
        const el = grid.createDiv({ cls: "tr-heat-cell" });
        if (cell.date === null) {
          el.addClass("tr-heat-blank");
          continue;
        }
        el.addClass(`tr-heat-${cell.level}`);
        if (cell.isToday) el.addClass("tr-heat-today");
        if (cell.isFuture) {
          el.addClass("tr-heat-future");
          continue;
        }
        const date = cell.date;
        const minutes = cell.minutes;
        el.addEventListener("click", () => {
          new import_obsidian4.Notice(
            minutes > 0
              ? format(t("heatDayDetail"), {
                  date,
                  dur: formatDuration(minutes),
                })
              : format(t("heatDayEmpty"), { date }),
          );
        });
      }
    }
  }
  renderTable(container, buckets, unrecMin, unrecPct) {
    const table = container.createEl("table", { cls: "tr-summary-table" });
    const thead = table.createEl("thead").createEl("tr");
    [t("thRank"), t("thCat"), t("thDur"), t("thPct")].forEach((th) =>
      thead.createEl("th", { text: th }),
    );
    const tbody = table.createEl("tbody");
    buckets.forEach((b, i) => {
      const row = tbody.createEl("tr");
      row.createEl("td", { text: String(i + 1) });
      const catTd = row.createEl("td");
      const color = segmentColor(b.categoryId, this.settings.categories);
      if (color) {
        const dot = catTd.createSpan({ cls: "tr-cat-dot" });
        dot.style.background = color.accent;
      }
      catTd.createSpan({ text: `${b.emoji} ${b.name}` });
      row.createEl("td", { text: formatDuration(b.minutes) });
      row.createEl("td", { text: `${b.percent.toFixed(1)}%` });
    });
    const unrec = tbody.createEl("tr", { cls: "tr-unrecorded-row" });
    unrec.createEl("td", { text: "" });
    unrec.createEl("td", { text: t("unrecordedRow") });
    unrec.createEl("td", { text: formatDuration(unrecMin) });
    unrec.createEl("td", { text: `${unrecPct.toFixed(1)}%` });
  }
  async readDaySafe(date) {
    try {
      return await this.recordsFile.readDayRecord(date);
    } catch {
      return {
        date,
        filePath: this.recordsFile.getDayFilePath(date),
        segments: [],
      };
    }
  }
  async copyText(md) {
    try {
      await navigator.clipboard.writeText(md);
      new import_obsidian4.Notice(t("copied"));
    } catch (err) {
      new import_obsidian4.Notice(t("copyFailed") + err.message);
    }
  }
};

// src/TimelineView.ts
var import_obsidian6 = require("obsidian");

// src/SegmentEditorModal.ts
var import_obsidian5 = require("obsidian");
var SegmentEditorModal = class extends import_obsidian5.Modal {
  constructor(app, settings, recordsFile, date, mode, onSaved) {
    super(app);
    this.settings = settings;
    this.recordsFile = recordsFile;
    this.date = date;
    this.mode = mode;
    this.onSaved = onSaved;
    if (mode.kind === "new") {
      this.start = mode.start;
      this.end = mode.end;
      this.activity = "";
    } else {
      this.start = mode.segment.start;
      this.end = mode.segment.end;
      this.activity = mode.segment.activity;
    }
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("tr-editor-modal");
    contentEl.createEl("h2", {
      text: this.mode.kind === "new" ? t("segTitleNew") : t("segTitleEdit"),
    });
    const startRow = contentEl.createDiv({ cls: "tr-form-row" });
    startRow.createEl("label", { text: t("segStart") });
    const startInput = startRow.createEl("input", {
      type: "time",
      value: this.start,
    });
    startInput.addEventListener("input", () => (this.start = startInput.value));
    const endRow = contentEl.createDiv({ cls: "tr-form-row" });
    endRow.createEl("label", { text: t("segEnd") });
    const endInput = endRow.createEl("input", {
      type: "time",
      value: this.end,
    });
    endInput.addEventListener("input", () => (this.end = endInput.value));
    const actRow = contentEl.createDiv({ cls: "tr-form-row" });
    actRow.createEl("label", {
      text: t("segDesc"),
    });
    const actInput = actRow.createEl("input", {
      type: "text",
      value: this.activity,
    });
    actInput.addEventListener("input", () => (this.activity = actInput.value));
    const buttons = contentEl.createDiv({ cls: "tr-form-buttons" });
    if (this.mode.kind === "edit") {
      const delBtn = buttons.createEl("button", {
        text: t("segDelete"),
        cls: "mod-warning",
      });
      delBtn.addEventListener("click", () => void this.handleDelete());
    }
    const cancel = buttons.createEl("button", { text: t("cancel") });
    cancel.addEventListener("click", () => this.close());
    const saveBtn = buttons.createEl("button", {
      text: t("segSave"),
      cls: "mod-cta",
    });
    saveBtn.addEventListener("click", () => void this.handleSave());
  }
  async handleSave() {
    const validation = validateSegmentTimes(
      this.start,
      this.end,
      segmentTimeMessages(),
    );
    if (!validation.ok) {
      new import_obsidian5.Notice(validation.error ?? t("segInvalidTime"));
      return;
    }
    const finalEnd = validation.normalizedEnd;
    const inProgress = finalEnd === "ing";
    const activityText = this.activity.trim() || t("segUnnamed");
    const newSegment = {
      start: this.start,
      end: finalEnd,
      activity: activityText,
      categoryId: inferCategoryId(activityText, this.settings.categories),
      lineNumber: this.mode.kind === "edit" ? this.mode.segment.lineNumber : -1,
    };
    try {
      const before = await this.recordsFile.readDayContent(this.date);
      const after =
        this.mode.kind === "edit"
          ? replaceLine(
              before,
              this.mode.segment.lineNumber,
              formatSegmentLine(newSegment),
            )
          : appendLine(before, formatSegmentLine(newSegment));
      await this.recordsFile.writeDayContent(this.date, after);
      new import_obsidian5.Notice(
        this.mode.kind === "edit"
          ? inProgress
            ? t("segUpdatedIng")
            : t("segUpdatedDone")
          : inProgress
            ? t("segCreatedIng")
            : t("segCreatedDone"),
      );
      this.close();
      this.onSaved?.();
    } catch (err) {
      new import_obsidian5.Notice(t("saveFailed") + err.message);
      console.error("Save segment failed", err);
    }
  }
  async handleDelete() {
    if (this.mode.kind !== "edit") return;
    try {
      const before = await this.recordsFile.readDayContent(this.date);
      const after = replaceLine(before, this.mode.segment.lineNumber, "");
      await this.recordsFile.writeDayContent(this.date, after);
      new import_obsidian5.Notice(t("deleted"));
      this.close();
      this.onSaved?.();
    } catch (err) {
      new import_obsidian5.Notice(t("deleteFailed") + err.message);
      console.error("Delete segment failed", err);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/timelineGrid.ts
var HALF = 30;
var DAY_MIN = 24 * 60;
var PX_PER_MIN = 1;
var SHORT_SEGMENT_THRESHOLD_PX = 30;
function isShortSegment(startMin, endMin, thresholdPx) {
  return (endMin - startMin) * PX_PER_MIN < thresholdPx;
}
function halfHourGridTicks() {
  const ticks = [];
  for (let i = 0; i <= 48; i++) {
    const minutes = i * HALF;
    const isHalf = i % 2 === 1;
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = isHalf ? "30" : "00";
    ticks.push({ minutes, isHalf, label: `${hh}:${mm}` });
  }
  return ticks;
}
function emptySlotFill(clickedMin, segments, ctx) {
  const dayEnd = ctx.isToday ? ctx.nowMin : DAY_MIN;
  const effEnd = (s) => (isOpenEnd(s.end) ? dayEnd : parseHHMM(s.end));
  let startMin = 0;
  for (const s of segments) {
    const e = effEnd(s);
    if (!isNaN(e) && e <= clickedMin && e > startMin) startMin = e;
  }
  let endMin = dayEnd;
  let hasBelow = false;
  for (const s of segments) {
    const st = parseHHMM(s.start);
    if (!isNaN(st) && st > clickedMin && (!hasBelow || st < endMin)) {
      endMin = st;
      hasBelow = true;
    }
  }
  if (endMin <= startMin) endMin = Math.min(startMin + 60, DAY_MIN);
  const start = formatHHMM(startMin);
  const end = endMin >= DAY_MIN ? "24:00" : formatHHMM(endMin);
  return { start, end };
}

// src/TimelineView.ts
var VIEW_TYPE_TIMELINE = "time-recorder-timeline";
var PIXELS_PER_HOUR = 60;
var TOTAL_HEIGHT_PX = PIXELS_PER_HOUR * 24;
var TimelineView = class extends import_obsidian6.ItemView {
  constructor(leaf, settings, recordsFile, onDataChanged) {
    super(leaf);
    this.settings = settings;
    this.recordsFile = recordsFile;
    this.onDataChanged = onDataChanged;
    this.currentDate = getTodayDateString();
    /** 串行化渲染：并发 render 交错会导致时间轴重复渲染（根因见 serialize.ts 注释） */
    this.render = serialize(() => this.doRender());
  }
  getViewType() {
    return VIEW_TYPE_TIMELINE;
  }
  getDisplayText() {
    return "Таймлайн";
  }
  getIcon() {
    return "clock-3";
  }
  async onOpen() {
    this.container = this.containerEl.children[1];
    await this.render();
  }
  async onClose() {}
  async doRender() {
    this.container.empty();
    this.container.addClass("tr-timeline-container");
    const header = this.container.createDiv({ cls: "tr-timeline-header" });
    const prevBtn = header.createEl("button", { text: t("tlPrev") });
    prevBtn.addEventListener("click", () => {
      this.currentDate = addDays(this.currentDate, -1);
      void this.render();
    });
    header.createDiv({ cls: "tr-timeline-title", text: this.currentDate });
    const nextBtn = header.createEl("button", { text: t("tlNext") });
    nextBtn.addEventListener("click", () => {
      this.currentDate = addDays(this.currentDate, 1);
      void this.render();
    });
    const todayBtn = header.createEl("button", { text: t("tlToday") });
    todayBtn.addEventListener("click", () => {
      this.currentDate = getTodayDateString();
      void this.render();
    });
    const body = this.container.createDiv({ cls: "tr-timeline-body" });
    body.style.height = `${TOTAL_HEIGHT_PX}px`;
    const pxPerMin = PIXELS_PER_HOUR / 60;
    for (const tick of halfHourGridTicks()) {
      const row = body.createDiv({
        cls: tick.isHalf ? "tr-hour-row tr-half-row" : "tr-hour-row",
      });
      row.style.top = `${tick.minutes * pxPerMin}px`;
      row.createDiv({ cls: "tr-hour-label", text: tick.label });
    }
    let day;
    try {
      day = await this.recordsFile.readDayRecord(this.currentDate);
    } catch {
      day = {
        date: this.currentDate,
        filePath: this.recordsFile.getDayFilePath(this.currentDate),
        segments: [],
      };
    }
    for (const seg of day.segments) {
      this.renderSegmentBlock(body, seg);
    }
    body.addEventListener("click", (e) => {
      if (e.target.closest(".tr-segment-block")) return;
      const rect = body.getBoundingClientRect();
      const yPx = e.clientY - rect.top;
      this.handleEmptySlotClick(yPx, day);
    });
  }
  handleEmptySlotClick(yPx, day) {
    const clickedMin = Math.floor((yPx / PIXELS_PER_HOUR) * 60);
    const isToday = this.currentDate === getTodayDateString();
    const { start, end } = emptySlotFill(clickedMin, day.segments, {
      isToday,
      nowMin: parseHHMM(nowHHMM()),
    });
    const editor = new SegmentEditorModal(
      this.app,
      this.settings,
      this.recordsFile,
      this.currentDate,
      { kind: "new", start, end },
      () => {
        if (this.onDataChanged) this.onDataChanged();
        else void this.render();
      },
    );
    editor.open();
  }
  renderSegmentBlock(parent, seg) {
    const startMin = parseHHMM(seg.start);
    let endMin;
    if (isOpenEnd(seg.end)) {
      endMin =
        this.currentDate === getTodayDateString()
          ? parseHHMM(nowHHMM())
          : parseHHMM("24:00");
    } else {
      endMin = parseHHMM(seg.end);
    }
    if (isNaN(startMin) || isNaN(endMin) || endMin <= startMin) return;
    const top = (startMin / 60) * PIXELS_PER_HOUR;
    const height = ((endMin - startMin) / 60) * PIXELS_PER_HOUR;
    const block = parent.createDiv({ cls: "tr-segment-block" });
    if (isShortSegment(startMin, endMin, SHORT_SEGMENT_THRESHOLD_PX)) {
      block.addClass("tr-segment-short");
    }
    block.style.top = `${top}px`;
    block.style.height = `${height}px`;
    const cat = this.settings.categories.find((c) => c.id === seg.categoryId);
    block.setText(
      `${cat?.emoji ?? "\u2753"} ${seg.activity} (${seg.start}-${seg.end})`,
    );
    block.dataset.lineNumber = String(seg.lineNumber);
    const color = segmentColor(seg.categoryId, this.settings.categories);
    if (color) {
      block.style.setProperty("--tr-cat-bg", color.bg);
      block.style.setProperty("--tr-cat-border", color.border);
      block.style.setProperty("--tr-cat-accent", color.accent);
    }
    block.addEventListener("click", (e) => {
      e.stopPropagation();
      const editor = new SegmentEditorModal(
        this.app,
        this.settings,
        this.recordsFile,
        this.currentDate,
        { kind: "edit", segment: seg },
        () => {
          if (this.onDataChanged) this.onDataChanged();
          else void this.render();
        },
      );
      editor.open();
    });
    if (!import_obsidian6.Platform.isMobile && !isOpenEnd(seg.end)) {
      this.attachDragHandles(block, seg);
    }
  }
  attachDragHandles(block, seg) {
    const topHandle = block.createDiv({ cls: "tr-drag-handle tr-drag-top" });
    const bottomHandle = block.createDiv({
      cls: "tr-drag-handle tr-drag-bottom",
    });
    const cat = this.settings.categories.find((c) => c.id === seg.categoryId);
    const emoji = cat?.emoji ?? "\u2753";
    const origStart = parseHHMM(seg.start);
    const origEnd = parseHHMM(seg.end);
    const onDrag = (which) => (e) => {
      e.stopPropagation();
      e.preventDefault();
      const startY = e.clientY;
      const compute = (clientY) => {
        const deltaPx = clientY - startY;
        const deltaMin = Math.round(((deltaPx / PIXELS_PER_HOUR) * 60) / 5) * 5;
        if (which === "top") {
          const newStart = Math.max(
            0,
            Math.min(origStart + deltaMin, origEnd - 5),
          );
          return { newStart, newEnd: origEnd };
        } else {
          const newEnd = Math.max(
            origStart + 5,
            Math.min(origEnd + deltaMin, 24 * 60),
          );
          return { newStart: origStart, newEnd };
        }
      };
      const paint = (newStart, newEnd) => {
        block.style.top = `${(newStart / 60) * PIXELS_PER_HOUR}px`;
        block.style.height = `${((newEnd - newStart) / 60) * PIXELS_PER_HOUR}px`;
        block.toggleClass(
          "tr-segment-short",
          isShortSegment(newStart, newEnd, SHORT_SEGMENT_THRESHOLD_PX),
        );
        const endLabel = newEnd >= 24 * 60 ? "24:00" : formatHHMM(newEnd);
        block.setText(
          `${emoji} ${seg.activity} (${formatHHMM(newStart)}-${endLabel})`,
        );
      };
      const onMove = (ev) => {
        const { newStart, newEnd } = compute(ev.clientY);
        paint(newStart, newEnd);
      };
      const onUpAsync = async (ev) => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        const { newStart, newEnd } = compute(ev.clientY);
        if (newStart === origStart && newEnd === origEnd) return;
        const updated = {
          ...seg,
          start: formatHHMM(newStart),
          end: newEnd >= 24 * 60 ? "24:00" : formatHHMM(newEnd),
        };
        try {
          const content = await this.recordsFile.readDayContent(
            this.currentDate,
          );
          const after = replaceLine(
            content,
            seg.lineNumber,
            formatSegmentLine(updated),
          );
          await this.recordsFile.writeDayContent(this.currentDate, after);
        } catch (err) {
          console.error("Time Recorder: failed to save dragged segment", err);
          new import_obsidian6.Notice(t("saveFailed") + err.message);
          return;
        }
        if (this.onDataChanged) this.onDataChanged();
        else void this.render();
      };
      const onUp = (ev) => void onUpAsync(ev);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };
    topHandle.addEventListener("mousedown", onDrag("top"));
    bottomHandle.addEventListener("mousedown", onDrag("bottom"));
  }
};

// src/SettingsTab.ts
var import_obsidian7 = require("obsidian");

// src/idgen.ts
function generateCategoryId(name, existingIds) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = slug || "cat";
  const taken = /* @__PURE__ */ new Set([...existingIds, "other"]);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// src/SettingsTab.ts
var TimeRecorderSettingsTab = class extends import_obsidian7.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    // 会话级：切语言后分类被保留（用户自定义过）时，在分类区显示一次引导提示。
    this.showLangCatHint = false;
    // 文本框输入用：停止输入约 0.6s 才落盘+刷新，避免每敲一个字就写 data.json + 全量重渲。
    // resetTimer=true → 每次输入都重置计时（等用户真正停下）。
    this.debouncedPersist = (0, import_obsidian7.debounce)(
      () => {
        void this.persist();
      },
      600,
      true,
    );
  }
  async persist() {
    await this.plugin.saveSettings();
    await this.plugin.refreshAll();
  }
  /**
   * 切换界面语言。绕开 debounce（避免落盘与整页重画竞争）：
   * 1. 写入偏好并让 override 立即生效（此后所有 t() 用新语言）。
   * 2. 分类逐条跟随（followCategoriesToLang）：未修改过的默认分类替换为目标
   *    语言版（含关键词桥接，可逆零损失）；用户新增/修改过的条目原样保留，
   *    语言实际变化且存在保留条目时显示一次说明提示。
   * 3. persist（落盘 + 状态栏/已开视图刷新）后整页重画。
   * recordsFolder / templatePath / flashNotePath / 数据层格式在本路径零写入。
   */
  async applyLanguage(lang) {
    const before = getLang();
    this.plugin.settings.language = lang;
    setLangOverride(lang === "auto" ? null : lang);
    const target = getLang();
    const result = followCategoriesToLang(
      this.plugin.settings.categories,
      target,
    );
    if (result.changed) {
      this.plugin.settings.categories = result.categories;
      new import_obsidian7.Notice(
        format(t("catsFollowedLang"), { lang: LANG_NAMES[target] }),
      );
    }
    this.showLangCatHint = before !== target && result.keptCount > 0;
    await this.persist();
    this.display();
  }
  // 离开设置页时立即把最后一次（可能还在 debounce 窗口内的）改动落盘，防丢。
  // 先取消 pending 的 debounce，避免离开后再多触发一次刷新。
  // 语言提示是会话级的：关掉设置页即失效（SettingsTab 实例是插件级单例，必须在此重置）。
  hide() {
    this.debouncedPersist.cancel();
    void this.persist();
    this.showLangCatHint = false;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const langDefaults = defaultSettingsFor(getLang());
    new import_obsidian7.Setting(containerEl)
      .setName(t("setLangName"))
      .setDesc(t("setLangDesc"))
      .addDropdown((dd) => {
        dd.addOption("auto", t("langAuto"));
        for (const [code, name] of Object.entries(LANG_NAMES)) {
          dd.addOption(code, name);
        }
        dd.setValue(this.plugin.settings.language).onChange(async (value) => {
          await this.applyLanguage(value);
        });
      });
    new import_obsidian7.Setting(containerEl)
      .setName(t("setFolderName"))
      .setDesc(t("setFolderDesc"))
      .addText((text) =>
        text
          .setPlaceholder(langDefaults.recordsFolder)
          .setValue(this.plugin.settings.recordsFolder)
          .onChange((value) => {
            const v = value.trim();
            if (v) this.plugin.settings.recordsFolder = v;
            this.debouncedPersist();
          }),
      );
    new import_obsidian7.Setting(containerEl)
      .setName(t("setTemplateName"))
      .setDesc(t("setTemplateDesc"))
      .addText((text) =>
        text
          .setPlaceholder(langDefaults.templatePath)
          .setValue(this.plugin.settings.templatePath)
          .onChange((value) => {
            const v = value.trim();
            if (v) this.plugin.settings.templatePath = v;
            this.debouncedPersist();
          }),
      );
    new import_obsidian7.Setting(containerEl)
      .setName(t("setFlashName"))
      .setDesc(t("setFlashDesc"))
      .addText((text) =>
        text
          .setPlaceholder(t("setFlashPh"))
          .setValue(this.plugin.settings.flashNotePath)
          .onChange((value) => {
            this.plugin.settings.flashNotePath = value.trim();
            this.debouncedPersist();
          }),
      );
    new import_obsidian7.Setting(containerEl)
      .setName(t("setCatHeading"))
      .setHeading();
    const hint = containerEl.createEl("p", {
      text: t("setCatHint"),
    });
    hint.addClass("tr-settings-hint");
    if (this.showLangCatHint) {
      const langHint = containerEl.createEl("p", { text: t("langCatHint") });
      langHint.addClass("tr-settings-hint");
      langHint.addClass("tr-lang-cat-hint");
    }
    this.plugin.settings.categories.forEach((cat, index) => {
      this.renderCategoryRow(containerEl, cat, index);
    });
    new import_obsidian7.Setting(containerEl)
      .setName(`${OTHER_CATEGORY.emoji} ${t("otherName")}`)
      .setDesc(t("otherDesc"))
      .settingEl.addClass("tr-other-row");
    new import_obsidian7.Setting(containerEl)
      .addButton((btn) =>
        btn
          .setButtonText(t("addCat"))
          .setCta()
          .onClick(async () => {
            const id = generateCategoryId(
              "",
              this.plugin.settings.categories.map((c) => c.id),
            );
            this.plugin.settings.categories.push({
              id,
              name: "",
              emoji: "",
              aliases: [],
            });
            await this.persist();
            this.display();
          }),
      )
      .addButton((btn) =>
        btn
          .setButtonText(t("resetCats"))
          .setWarning()
          .onClick(() => {
            new ConfirmModal(this.app, t("resetConfirm"), async () => {
              this.plugin.settings.categories =
                defaultCategoriesForRestore(getLang());
              this.showLangCatHint = false;
              await this.persist();
              this.display();
            }).open();
          }),
      );
  }
  renderCategoryRow(containerEl, cat, index) {
    const setting = new import_obsidian7.Setting(containerEl);
    setting.settingEl.addClass("tr-category-row");
    setting.addText((text) => {
      text
        .setPlaceholder("\u2753")
        .setValue(cat.emoji)
        .onChange((value) => {
          this.plugin.settings.categories[index].emoji = value.trim();
          this.debouncedPersist();
        });
      text.inputEl.addClass("tr-emoji-input");
    });
    setting.addText((text) =>
      text
        .setPlaceholder(t("catNamePh"))
        .setValue(cat.name)
        .onChange((value) => {
          const err = validateCategoryName(
            value,
            this.plugin.settings.categories,
            index,
            categoryNameMessages(),
          );
          if (err) {
            new import_obsidian7.Notice(err);
            return;
          }
          this.plugin.settings.categories[index].name = value.trim();
          this.debouncedPersist();
        }),
    );
    setting.addText((text) => {
      text
        .setPlaceholder(t("aliasPh"))
        .setValue(cat.aliases.join(", "))
        .onChange((value) => {
          this.plugin.settings.categories[index].aliases = parseAliases(value);
          this.debouncedPersist();
        });
      text.inputEl.addClass("tr-alias-input");
    });
    setting.addExtraButton((btn) =>
      btn
        .setIcon("trash")
        .setTooltip(t("delCatTip"))
        .onClick(async () => {
          this.plugin.settings.categories.splice(index, 1);
          await this.persist();
          this.display();
        }),
    );
  }
};
var ConfirmModal = class extends import_obsidian7.Modal {
  constructor(app, message, onConfirm) {
    super(app);
    this.message = message;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("p", { text: this.message });
    new import_obsidian7.Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText(t("ok"))
          .setWarning()
          .onClick(async () => {
            this.close();
            await this.onConfirm();
          }),
      )
      .addButton((btn) =>
        btn.setButtonText(t("cancel")).onClick(() => this.close()),
      );
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/leafDedup.ts
function splitDuplicateLeaves(leaves) {
  if (leaves.length === 0) return { keep: null, extras: [] };
  return { keep: leaves[0], extras: leaves.slice(1) };
}

// src/flashNote.ts
var import_obsidian8 = require("obsidian");
async function openFlashNote(app, plugin) {
  const path = plugin.settings.flashNotePath.trim();
  if (!path) {
    new FlashTargetSuggestModal(app, plugin).open();
    return;
  }
  const file = app.vault.getAbstractFileByPath(
    (0, import_obsidian8.normalizePath)(path),
  );
  if (!(file instanceof import_obsidian8.TFile)) {
    new import_obsidian8.Notice(format(t("flashTargetMissing"), { path }));
    new FlashTargetSuggestModal(app, plugin).open();
    return;
  }
  await openAtEnd(app, file);
}
async function openAtEnd(app, file) {
  try {
    await app.workspace.getLeaf(false).openFile(file);
    const view = app.workspace.getActiveViewOfType(
      import_obsidian8.MarkdownView,
    );
    if (!view || view.file?.path !== file.path) return;
    if (view.getMode() === "preview") {
      await view.setState(
        { ...view.getState(), mode: "source" },
        { history: false },
      );
    }
    const editor = view.editor;
    const line = editor.lastLine();
    const pos = { line, ch: editor.getLine(line).length };
    editor.setCursor(pos);
    editor.scrollIntoView({ from: pos, to: pos }, true);
    editor.focus();
  } catch (err) {
    new import_obsidian8.Notice(t("flashOpenFailed") + err.message);
    console.error("Open flash note failed", err);
  }
}
var FlashTargetSuggestModal = class extends import_obsidian8.FuzzySuggestModal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.setPlaceholder(t("flashPickerPlaceholder"));
  }
  getItems() {
    return this.app.vault
      .getMarkdownFiles()
      .sort((a, b) => b.stat.mtime - a.stat.mtime);
  }
  getItemText(file) {
    return file.path;
  }
  onChooseItem(file) {
    void this.saveAndJump(file);
  }
  async saveAndJump(file) {
    this.plugin.settings.flashNotePath = file.path;
    await this.plugin.saveSettings();
    new import_obsidian8.Notice(
      format(t("flashTargetSaved"), { path: file.path }),
    );
    await openAtEnd(this.app, file);
  }
};

// main.ts
var TimeRecorderPlugin = class extends import_obsidian9.Plugin {
  async onload() {
    await this.loadSettings();
    this.recordsFile = new RecordsFileManager(
      createObsidianVaultAdapter(this.app),
      this.settings,
    );
    this.undoStack = new UndoStack();
    this.statusIndicator = new StatusIndicator(
      this,
      this.settings,
      this.recordsFile,
    );
    this.app.workspace.onLayoutReady(async () => {
      try {
        await this.recordsFile.ensureFileExists(getTodayDateString());
      } catch (err) {
        console.warn("Time Recorder: could not ensure today's file:", err);
      }
    });
    this.app.workspace.onLayoutReady(() => this.dedupeAllViews());
    const ribbon = this.addRibbonIcon(
      "clock",
      "Time Recorder: Отметить время",
      () => {
        this.openGridModal();
      },
    );
    this.statusIndicator.attachRibbon(ribbon);
    this.addRibbonIcon("pie-chart", "Time Recorder: Сводка", () => {
      void this.activateSummaryView();
    });
    this.addRibbonIcon(
      "gantt-chart",
      "Time Recorder: Заполнить таймлайн",
      () => {
        void this.activateTimelineView();
      },
    );
    this.statusIndicator.attachStatusBar();
    this.addSettingTab(new TimeRecorderSettingsTab(this.app, this));
    this.addCommand({
      id: "punch-in",
      name: "Отметить время (сетка)",
      callback: () => this.openGridModal(),
    });
    this.registerView(
      VIEW_TYPE_TODAY_SUMMARY,
      (leaf) => new TodaySummaryView(leaf, this.settings, this.recordsFile),
    );
    this.registerView(
      VIEW_TYPE_TIMELINE,
      (leaf) =>
        new TimelineView(
          leaf,
          this.settings,
          this.recordsFile,
          () => void this.refreshAll(),
        ),
    );
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (!file.path.startsWith(this.settings.recordsFolder + "/")) return;
        await this.refreshAll();
      }),
    );
    this.addCommand({
      id: "open-today-summary",
      name: "Открыть сводку",
      callback: () => void this.activateSummaryView(),
    });
    this.addCommand({
      id: "open-timeline",
      name: "Открыть таймлайн",
      callback: () => void this.activateTimelineView(),
    });
    this.addCommand({
      id: "flash-note",
      name: "Быстрая заметка",
      callback: () => void openFlashNote(this.app, this),
    });
  }
  onunload() {}
  async refreshAll() {
    await this.statusIndicator.refresh();
    for (const leaf of this.app.workspace.getLeavesOfType(
      VIEW_TYPE_TODAY_SUMMARY,
    )) {
      if (leaf.view instanceof TodaySummaryView) {
        await leaf.view.refresh();
      }
    }
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_TIMELINE)) {
      if (leaf.view instanceof TimelineView) {
        await leaf.view.render();
      }
    }
  }
  /**
   * 某类型自定义视图去重：保留第一个 leaf、detach 其余。返回保留的 leaf（无则 undefined）。
   * 启动去重与用户激活共用同一逻辑，保证“任何时候都只剩一个”。
   */
  dedupeLeaves(viewType) {
    const { keep, extras } = splitDuplicateLeaves(
      this.app.workspace.getLeavesOfType(viewType),
    );
    for (const leaf of extras) leaf.detach();
    return keep ?? void 0;
  }
  /** 启动时收敛所有自定义视图的重复 leaf。 */
  dedupeAllViews() {
    this.dedupeLeaves(VIEW_TYPE_TODAY_SUMMARY);
    this.dedupeLeaves(VIEW_TYPE_TIMELINE);
  }
  async activateSummaryView() {
    const { workspace } = this.app;
    let leaf = this.dedupeLeaves(VIEW_TYPE_TODAY_SUMMARY);
    if (!leaf) {
      leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_TODAY_SUMMARY, active: true });
    }
    await workspace.revealLeaf(leaf);
    if (leaf.view instanceof TodaySummaryView) {
      await leaf.view.refresh();
    }
  }
  async activateTimelineView() {
    const { workspace } = this.app;
    let leaf = this.dedupeLeaves(VIEW_TYPE_TIMELINE);
    if (!leaf) {
      leaf = workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE_TIMELINE, active: true });
    }
    await workspace.revealLeaf(leaf);
  }
  openGridModal() {
    new GridModal(
      this.app,
      this.settings,
      this.recordsFile,
      this.undoStack,
      () => void this.refreshAll(),
      () => this.openCustomActivityModal(),
      () => void this.activateSummaryView(),
      () => void this.activateTimelineView(),
      () => void openFlashNote(this.app, this),
    ).open();
  }
  openCustomActivityModal() {
    new CustomActivityModal(
      this.app,
      this.settings,
      this.recordsFile,
      this.undoStack,
      () => void this.refreshAll(),
    ).open();
  }
  async loadSettings() {
    let loaded = null;
    let loadFailed = false;
    try {
      loaded = await this.loadData();
    } catch {
      loadFailed = true;
    }
    const { settings, recovered } = migrateSettings(loaded);
    this.settings = settings;
    if (loaded === null) {
      this.settings = defaultSettingsFor(getLang());
    }
    setLangOverride(
      this.settings.language === "auto" ? null : this.settings.language,
    );
    if (recovered || loadFailed) {
      await this.backupCorruptSettings();
      new import_obsidian9.Notice(
        t("corruptSettings"),
        0,
        // 0 = 常驻直到点击关闭，确保用户看到
      );
    }
  }
  /** 把损坏的 data.json 复制成 data.json.bak（不删原数据）。尽力而为、永不阻塞加载。 */
  async backupCorruptSettings() {
    try {
      const dir = this.manifest.dir;
      if (!dir) return;
      const dataPath = `${dir}/data.json`;
      const bakPath = `${dir}/data.json.bak`;
      const adapter = this.app.vault.adapter;
      if (await adapter.exists(dataPath)) {
        const raw = await adapter.read(dataPath);
        await adapter.write(bakPath, raw);
      }
    } catch {}
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};

/* nosourcemap */
