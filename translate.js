const fs = require("fs");
let c = fs.readFileSync("main.js", "utf8");

// 1. Убираем китайские пути по умолчанию
c = c
  .split(
    'recordsFolder: "\\u53CD\\u7701\\u65E5\\u5FD7/\\u65F6\\u95F4\\u8BB0\\u5F55"',
  )
  .join('recordsFolder: "Time Records"');
c = c
  .split(
    'templatePath: "\\u53CD\\u7701\\u65E5\\u5FD7/\\u65F6\\u95F4\\u8BB0\\u5F55/timer template.md"',
  )
  .join('templatePath: "Time Records/timer template.md"');

function replaceBlock(source, startStr, endStr, replacement) {
  const start = source.indexOf(startStr);
  if (start === -1) {
    console.warn("Не найдено начало:", startStr);
    return source;
  }
  const end = source.indexOf(endStr, start);
  if (end === -1) {
    console.warn("Не найдено конец для:", startStr);
    return source;
  }
  return (
    source.substring(0, start) +
    replacement +
    source.substring(end + endStr.length)
  );
}

// 2. Заменяем ВСЕ массивы категорий на русские
const russianCategories = `var DEFAULT_CATEGORIES = [
  { id: "sleep", name: "Сон", emoji: "😴", aliases: ["дремота", "поспать"] },
  { id: "study", name: "Учеба", emoji: "📚", aliases: ["чтение", "пары", "повторение", "учеба"] },
  { id: "meal", name: "Еда", emoji: "🍱", aliases: ["завтрак", "обед", "ужин", "покушать", "доставка"] },
  { id: "hygiene", name: "Гигиена", emoji: "🚿", aliases: ["душ", "мыться", "туалет", "зубы"] },
  { id: "commute", name: "Дорога", emoji: "🚗", aliases: ["метро", "автобус", "такси", "ехать"] },
  { id: "social", name: "Общение", emoji: "💬", aliases: ["чат", "звонок", "друзья", "разговор"] },
  { id: "chores", name: "Быт", emoji: "🧹", aliases: ["уборка", "стирка", "порядок"] },
  { id: "work", name: "Работа", emoji: "💼", aliases: ["встреча", "сверхурочные", "офис", "работа"] },
  { id: "sport", name: "Спорт", emoji: "🏃", aliases: ["бег", "зал", "качалка", "тренировка"] },
  { id: "fun", name: "Отдых", emoji: "🎮", aliases: ["игра", "игры", "видео", "ютуб"] }
];`;

c = replaceBlock(c, "var DEFAULT_CATEGORIES = [", "];", russianCategories);

// Остальные языковые массивы ссылаем на русский
c = replaceBlock(
  c,
  "var DEFAULT_CATEGORIES_EN = [",
  "];",
  "var DEFAULT_CATEGORIES_EN = DEFAULT_CATEGORIES;",
);
c = replaceBlock(
  c,
  "var DEFAULT_CATEGORIES_JA = [",
  "];",
  "var DEFAULT_CATEGORIES_JA = DEFAULT_CATEGORIES;",
);
c = replaceBlock(
  c,
  "var DEFAULT_CATEGORIES_KO = [",
  "];",
  "var DEFAULT_CATEGORIES_KO = DEFAULT_CATEGORIES;",
);

// 3. Полностью вычищаем китайский, японский и корейский словари
c = replaceBlock(c, "var zh = {", "};", "var zh = {};");
c = replaceBlock(c, "var ja = {", "};", "var ja = {};");
c = replaceBlock(c, "var ko = {", "};", "var ko = {};");
c = c
  .split("var STRINGS = { zh, en, ja, ko };")
  .join("var STRINGS = { zh: en, en: en, ja: en, ko: en };");

c = replaceBlock(
  c,
  "var ZH_MARKDOWN_STRINGS = {",
  "};",
  "var ZH_MARKDOWN_STRINGS = {};",
);
c = replaceBlock(
  c,
  "var JA_MARKDOWN_STRINGS = {",
  "};",
  "var JA_MARKDOWN_STRINGS = {};",
);
c = replaceBlock(
  c,
  "var KO_MARKDOWN_STRINGS = {",
  "};",
  "var KO_MARKDOWN_STRINGS = {};",
);
c = replaceBlock(
  c,
  "var JA_REL_DAY_LABELS = {",
  "};",
  "var JA_REL_DAY_LABELS = {};",
);
c = replaceBlock(
  c,
  "var KO_REL_DAY_LABELS = {",
  "};",
  "var KO_REL_DAY_LABELS = {};",
);
c = replaceBlock(
  c,
  "var JA_SEGMENT_TIME_MESSAGES = {",
  "};",
  "var JA_SEGMENT_TIME_MESSAGES = {};",
);
c = replaceBlock(
  c,
  "var KO_SEGMENT_TIME_MESSAGES = {",
  "};",
  "var KO_SEGMENT_TIME_MESSAGES = {};",
);
c = replaceBlock(
  c,
  "var JA_CATEGORY_NAME_MESSAGES = {",
  "};",
  "var JA_CATEGORY_NAME_MESSAGES = {};",
);
c = replaceBlock(
  c,
  "var KO_CATEGORY_NAME_MESSAGES = {",
  "};",
  "var KO_CATEGORY_NAME_MESSAGES = {};",
);

// 4. Переводим английский словарь на русский
const russianEn = `var en = {
  corruptSettings: "⏱️ Time Recorder: в файле настроек произошла ошибка, загружены настройки по умолчанию. Оригинальный файл сохранен в резервной копии.",
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
  segDesc: "Описание (пусто = 'Без названия'; категория определится автоматически)",
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
  setLangDesc: "Язык интерфейса плагина. 'Follow Obsidian' соответствует языку интерфейса Obsidian. При смене языка переведенные стандартные категории обновятся, а измененные вами останутся как есть. Файлы записей и история не затрагиваются.",
  langAuto: "Как в Obsidian (по умолчанию)",
  catsFollowedLang: "✅ Стандартные категории переведены на {lang} — ваши записи не затронуты",
  langCatHint: "Измененные вами категории остались как есть. Чтобы перевести их, отредактируйте названия ниже.",
  setFolderName: "Папка записей",
  setFolderDesc: "Папка для файлов .md с записями времени. Изменение этого параметра не перемещает существующие файлы.",
  setTemplateName: "Путь к шаблону",
  setTemplateDesc: "Шаблон, применяемый при создании файла за день.",
  setFlashName: "Заметка для быстрых записей",
  setFlashDesc: "Заметка, в конец которой переходит кнопка ⚡ для быстрых записей. Оставьте пустым, чтобы выбрать из списка при первом нажатии.",
  setFlashPh: "Например: Входящие.md",
  setCatHeading: "Категории",
  setCatHint: "Активности распределяются по категориям на основе названия или ключевых слов (через запятую). Переименование или удаление категорий не переписывает прошлые записи.",
  otherName: "Другое",
  otherDesc: "Резервная категория для всего, что не совпало с другими. Существует всегда, нельзя удалить или задать ключевые слова.",
  addCat: "+ Добавить категорию",
  resetCats: "Сбросить к стандартным",
  resetConfirm: "Заменить все текущие категории стандартными? Это действие нельзя отменить.",
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
  copyFailed: "Ошибка копирования: "
};`;

c = replaceBlock(c, "var en = {", "};", russianEn);

// 5. Переводим остальные английские объекты
const russianMdStrings = `var EN_MARKDOWN_STRINGS = {
  headingTpl: "## Сводка времени ({title})",
  tableHeader: "| № | Категория | Время | Доля | Активности |",
  unrecordedLabel: "⚪ Не записано",
  totalLabel: "Итого"
};`;
c = replaceBlock(c, "var EN_MARKDOWN_STRINGS = {", "};", russianMdStrings);

const russianRelDays = `var EN_REL_DAY_LABELS = {
  today: "Сегодня",
  yesterday: "Вчера",
  tomorrow: "Завтра"
};`;
c = replaceBlock(c, "var EN_REL_DAY_LABELS = {", "};", russianRelDays);

const russianSegTime = `var EN_SEGMENT_TIME_MESSAGES = {
  startInvalid: "Неверное время начала",
  endInvalid: "Неверное время окончания",
  endNotAfterStart: "Время окончания должно быть позже времени начала"
};`;
c = replaceBlock(c, "var EN_SEGMENT_TIME_MESSAGES = {", "};", russianSegTime);

const russianCatNames = `var EN_CATEGORY_NAME_MESSAGES = {
  empty: "Название категории не может быть пустым",
  duplicate: "Такое название категории уже существует"
};`;
c = replaceBlock(c, "var EN_CATEGORY_NAME_MESSAGES = {", "};", russianCatNames);

// 6. Переводим кнопки и названия вкладок
c = c
  .split('"Time Recorder: Punch in"')
  .join('"Time Recorder: Отметить время"');
c = c.split('"Time Recorder: Summary"').join('"Time Recorder: Сводка"');
c = c
  .split('"Time Recorder: Open timeline back-fill"')
  .join('"Time Recorder: Заполнить таймлайн"');
c = c.split('"Punch in (open grid)"').join('"Отметить время (сетка)"');
c = c.split('"Open summary"').join('"Открыть сводку"');
c = c.split('"Open timeline back-fill"').join('"Открыть таймлайн"');
c = c.split('"Flash note (jump to note end)"').join('"Быстрая заметка"');
c = c.split('return "Summary";').join('return "Сводка";');
c = c.split('return "Timeline Back-fill";').join('return "Таймлайн";');

fs.writeFileSync("main-ru.js", c);
console.log(
  "Готово! Китайские символы полностью удалены, интерфейс переведен. Файл: main-ru.js",
);
