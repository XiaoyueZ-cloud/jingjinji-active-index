/**
 * 活跃度指数 — 数据层
 * 总体指数: 用户提供的 43 个月指数数据
 * 五类分量: 基于原始 V1 Excel 事件评分 (2023-01 ~ 2024-12)
 *           2025-01 ~ 2026-07 按同期模式 + 总量比例推算
 *
 * TODO: 后续替换为真实数据接口 (fetch / API)
 */

// ── 用户提供的总体指数 (43 个月) ─────────────────────────────
var TOTAL_INDEX = [
  28.7, 1.9, 13.4, 44.0, 216.3, 151.2, 76.6, 57.4, 124.4, 164.6, 250.7, 72.7,
  126.3, 38.3, 124.4, 262.2, 187.6, 120.6, 65.1, 135.9, 99.5, 134.0, 141.6, 189.5,
  162.7, 32.5, 179.9, 97.6, 122.5, 220.1, 30.6, 139.7, 162.7, 80.4, 197.1, 254.5,
  61.2, 47.8, 103.3, 210.5, 273.7, 120.6, 70.8
];

// ── 原始 V1 五类分量 (24 个月, 来自 Excel 事件评分) ──────────
var RAW_CATEGORIES = [
  {"month":"2023-01","c":{"资源共享":12,"人才培养":8,"办学合作":15,"产教科教融合":4,"治理机制":6}},
  {"month":"2023-02","c":{"资源共享":5,"人才培养":9,"办学合作":7,"产教科教融合":3,"治理机制":4}},
  {"month":"2023-03","c":{"资源共享":14,"人才培养":12,"办学合作":11,"产教科教融合":7,"治理机制":5}},
  {"month":"2023-04","c":{"资源共享":8,"人才培养":6,"办学合作":17,"产教科教融合":5,"治理机制":9}},
  {"month":"2023-05","c":{"资源共享":18,"人才培养":14,"办学合作":12,"产教科教融合":9,"治理机制":6}},
  {"month":"2023-06","c":{"资源共享":23,"人才培养":17,"办学合作":20,"产教科教融合":11,"治理机制":8}},
  {"month":"2023-07","c":{"资源共享":9,"人才培养":7,"办学合作":8,"产教科教融合":2,"治理机制":4}},
  {"month":"2023-08","c":{"资源共享":12,"人才培养":16,"办学合作":14,"产教科教融合":6,"治理机制":7}},
  {"month":"2023-09","c":{"资源共享":25,"人才培养":19,"办学合作":21,"产教科教融合":13,"治理机制":12}},
  {"month":"2023-10","c":{"资源共享":15,"人才培养":11,"办学合作":19,"产教科教融合":8,"治理机制":6}},
  {"month":"2023-11","c":{"资源共享":10,"人才培养":13,"办学合作":9,"产教科教融合":5,"治理机制":10}},
  {"month":"2023-12","c":{"资源共享":19,"人才培养":18,"办学合作":23,"产教科教融合":15,"治理机制":10}},
  {"month":"2024-01","c":{"资源共享":13,"人才培养":10,"办学合作":12,"产教科教融合":6,"治理机制":7}},
  {"month":"2024-02","c":{"资源共享":12,"人才培养":8,"办学合作":15,"产教科教融合":4,"治理机制":6}},
  {"month":"2024-03","c":{"资源共享":22,"人才培养":20,"办学合作":18,"产教科教融合":14,"治理机制":11}},
  {"month":"2024-04","c":{"资源共享":17,"人才培养":15,"办学合作":27,"产教科教融合":12,"治理机制":13}},
  {"month":"2024-05","c":{"资源共享":30,"人才培养":22,"办学合作":24,"产教科教融合":18,"治理机制":14}},
  {"month":"2024-06","c":{"资源共享":25,"人才培养":28,"办学合作":29,"产教科教融合":21,"治理机制":17}},
  {"month":"2024-07","c":{"资源共享":11,"人才培养":9,"办学合作":13,"产教科教融合":4,"治理机制":5}},
  {"month":"2024-08","c":{"资源共享":20,"人才培养":24,"办学合作":19,"产教科教融合":16,"治理机制":12}},
  {"month":"2024-09","c":{"资源共享":34,"人才培养":30,"办学合作":32,"产教科教融合":26,"治理机制":21}},
  {"month":"2024-10","c":{"资源共享":27,"人才培养":23,"办学合作":35,"产教科教融合":19,"治理机制":16}},
  {"month":"2024-11","c":{"资源共享":18,"人才培养":17,"办学合作":20,"产教科教融合":12,"治理机制":15}},
  {"month":"2024-12","c":{"资源共享":31,"人才培养":29,"办学合作":37,"产教科教融合":24,"治理机制":20}}
];

var CAT_NAMES = ['资源共享','人才培养','办学合作','产教科教融合','治理机制'];
var MONTHS_ALL = [
  "2023-01","2023-02","2023-03","2023-04","2023-05","2023-06",
  "2023-07","2023-08","2023-09","2023-10","2023-11","2023-12",
  "2024-01","2024-02","2024-03","2024-04","2024-05","2024-06",
  "2024-07","2024-08","2024-09","2024-10","2024-11","2024-12",
  "2025-01","2025-02","2025-03","2025-04","2025-05","2025-06",
  "2025-07","2025-08","2025-09","2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06","2026-07"
];

function buildActiveIndexData() {
  // 计算原始 24 个月的五类占比
  var ratioSum = {};
  for (var c = 0; c < CAT_NAMES.length; c++) ratioSum[CAT_NAMES[c]] = 0;
  for (var i = 0; i < 24; i++) {
    var total = 0;
    for (var c = 0; c < CAT_NAMES.length; c++) total += RAW_CATEGORIES[i].c[CAT_NAMES[c]];
    for (var c = 0; c < CAT_NAMES.length; c++) ratioSum[CAT_NAMES[c]] += RAW_CATEGORIES[i].c[CAT_NAMES[c]] / total;
  }
  var avgRatio = {};
  for (var c = 0; c < CAT_NAMES.length; c++) avgRatio[CAT_NAMES[c]] = ratioSum[CAT_NAMES[c]] / 24;

  // 两年同月均值模式 (用于季节波动)
  var monthPattern = {};
  for (var c = 0; c < CAT_NAMES.length; c++) {
    monthPattern[CAT_NAMES[c]] = [];
    for (var m = 0; m < 12; m++) {
      var raw23 = RAW_CATEGORIES[m].c[CAT_NAMES[c]];
      var raw24 = RAW_CATEGORIES[m + 12].c[CAT_NAMES[c]];
      var total23 = 0, total24 = 0;
      for (var k = 0; k < CAT_NAMES.length; k++) {
        total23 += RAW_CATEGORIES[m].c[CAT_NAMES[k]];
        total24 += RAW_CATEGORIES[m + 12].c[CAT_NAMES[k]];
      }
      var ratio23 = total23 > 0 ? raw23 / total23 : avgRatio[CAT_NAMES[c]];
      var ratio24 = total24 > 0 ? raw24 / total24 : avgRatio[CAT_NAMES[c]];
      monthPattern[CAT_NAMES[c]].push((ratio23 + ratio24) / 2);
    }
  }

  // 构建六类数据
  var categories = {
    total:      { label: '总体',         color: '#e03030', values: [] },
    resource:   { label: '资源共享',     color: '#1368e8', values: [] },
    talent:     { label: '人才培养',     color: '#16b8e8', values: [] },
    school:     { label: '办学合作',     color: '#68a84f', values: [] },
    industry:   { label: '产教科教融合', color: '#ed8615', values: [] },
    governance: { label: '治理机制',     color: '#7468df', values: [] }
  };

  for (var i = 0; i < 43; i++) {
    var total = TOTAL_INDEX[i];
    categories.total.values.push(total);

    var monthIdx = i % 12;

    if (i < 24) {
      // 原始 24 个月: 用实际比例 × 指数
      var rawTotal = 0;
      for (var c = 0; c < CAT_NAMES.length; c++) rawTotal += RAW_CATEGORIES[i].c[CAT_NAMES[c]];
      var keys = ['resource','talent','school','industry','governance'];
      for (var c = 0; c < CAT_NAMES.length; c++) {
        var ratio = rawTotal > 0 ? RAW_CATEGORIES[i].c[CAT_NAMES[c]] / rawTotal : avgRatio[CAT_NAMES[c]];
        categories[keys[c]].values.push(Math.round(total * ratio * 10) / 10);
      }
    } else {
      // 2025-01 ~ 2026-07: 用季节比例 × 指数
      var keys = ['resource','talent','school','industry','governance'];
      var ratioTotal = 0;
      for (var c = 0; c < CAT_NAMES.length; c++) ratioTotal += monthPattern[CAT_NAMES[c]][monthIdx];
      for (var c = 0; c < CAT_NAMES.length; c++) {
        var r = monthPattern[CAT_NAMES[c]][monthIdx] / ratioTotal;
        categories[keys[c]].values.push(Math.round(total * r * 10) / 10);
      }
    }
  }

  return {
    months: MONTHS_ALL.slice(),
    categories: categories,
    events: null
  };
}

// ── 事件数据 (原始 V1) ───────────────────────────────────────
var RAW_EVENTS = [
  {"eventId":"E00018","month":"2024-02","eventName":"京津冀高校联合建设综合实验基地","subject":"京津冀三地高校","region":"京津冀","source":"虚拟新闻来源","scores":[{"category":"资源共享","subcategory":"基地设施共享","score":5,"reason":"共建实验平台"},{"category":"人才培养","subcategory":"联合培养","score":5,"reason":"共同制定培养方案"},{"category":"办学合作","subcategory":"校际合作协议","score":3,"reason":"签署合作协议"}]},
  {"eventId":"E00019","month":"2024-02","eventName":"三地教育部门联合发布课程资源共享计划","subject":"三地教育部门","region":"京津冀","source":"虚拟新闻来源","scores":[{"category":"资源共享","subcategory":"课程资源共享","score":7,"reason":"开放优质课程"},{"category":"治理机制","subcategory":"联席协调机制","score":6,"reason":"建立常态化协调机制"}]},
  {"eventId":"E00020","month":"2024-02","eventName":"京津冀职业院校推进产教融合实训项目","subject":"职业院校与企业","region":"京津冀","source":"虚拟新闻来源","scores":[{"category":"办学合作","subcategory":"校企合作","score":12,"reason":"校企联合实施项目"},{"category":"产教科教融合","subcategory":"实训基地共建","score":4,"reason":"建设实训场地"}]},
  {"eventId":"E00021","month":"2024-03","eventName":"京津冀高校协同创新联盟召开年度会议","subject":"协同创新联盟","region":"京津冀","source":"虚拟新闻来源","scores":[{"category":"治理机制","subcategory":"协同治理","score":11,"reason":"完善联盟治理规则"},{"category":"人才培养","subcategory":"师资交流","score":9,"reason":"推进教师互访"}]},
  {"eventId":"E00022","month":"2024-06","eventName":"三地高校发布跨区域联合招生培养项目","subject":"多所高校","region":"京津冀","source":"虚拟新闻来源","scores":[{"category":"人才培养","subcategory":"联合培养","score":18,"reason":"实施跨校培养"},{"category":"办学合作","subcategory":"专业共建","score":15,"reason":"共建特色专业"}]}
];

// ── 初始化 ───────────────────────────────────────────────────
var ACTIVE_INDEX_DATA = buildActiveIndexData();
ACTIVE_INDEX_DATA.events = RAW_EVENTS;
