/**
 * 活跃度指数 — 数据层
 * 原始数据来源: lyfgithub网页文件/活跃度动态变化/data/monthly_summary.json
 * 2023-01 ~ 2024-12 为真实 Excel 数据
 * 2025-01 ~ 2026-07 为基于趋势的模拟延伸
 *
 * TODO: 后续替换为真实数据接口 (fetch / API)
 */

// ── 原始 V1 真实数据 (24 个月) ────────────────────────────────
var RAW_MONTHLY = [
  {"month":"2023-01","categories":{"资源共享":12,"人才培养":8,"办学合作":15,"产教科教融合":4,"治理机制":6},"total":45},
  {"month":"2023-02","categories":{"资源共享":5,"人才培养":9,"办学合作":7,"产教科教融合":3,"治理机制":4},"total":28},
  {"month":"2023-03","categories":{"资源共享":14,"人才培养":12,"办学合作":11,"产教科教融合":7,"治理机制":5},"total":49},
  {"month":"2023-04","categories":{"资源共享":8,"人才培养":6,"办学合作":17,"产教科教融合":5,"治理机制":9},"total":45},
  {"month":"2023-05","categories":{"资源共享":18,"人才培养":14,"办学合作":12,"产教科教融合":9,"治理机制":6},"total":59},
  {"month":"2023-06","categories":{"资源共享":23,"人才培养":17,"办学合作":20,"产教科教融合":11,"治理机制":8},"total":79},
  {"month":"2023-07","categories":{"资源共享":9,"人才培养":7,"办学合作":8,"产教科教融合":2,"治理机制":4},"total":30},
  {"month":"2023-08","categories":{"资源共享":12,"人才培养":16,"办学合作":14,"产教科教融合":6,"治理机制":7},"total":55},
  {"month":"2023-09","categories":{"资源共享":25,"人才培养":19,"办学合作":21,"产教科教融合":13,"治理机制":12},"total":90},
  {"month":"2023-10","categories":{"资源共享":15,"人才培养":11,"办学合作":19,"产教科教融合":8,"治理机制":6},"total":59},
  {"month":"2023-11","categories":{"资源共享":10,"人才培养":13,"办学合作":9,"产教科教融合":5,"治理机制":10},"total":47},
  {"month":"2023-12","categories":{"资源共享":19,"人才培养":18,"办学合作":23,"产教科教融合":15,"治理机制":10},"total":85},
  {"month":"2024-01","categories":{"资源共享":13,"人才培养":10,"办学合作":12,"产教科教融合":6,"治理机制":7},"total":48},
  {"month":"2024-02","categories":{"资源共享":12,"人才培养":8,"办学合作":15,"产教科教融合":4,"治理机制":6},"total":45},
  {"month":"2024-03","categories":{"资源共享":22,"人才培养":20,"办学合作":18,"产教科教融合":14,"治理机制":11},"total":85},
  {"month":"2024-04","categories":{"资源共享":17,"人才培养":15,"办学合作":27,"产教科教融合":12,"治理机制":13},"total":84},
  {"month":"2024-05","categories":{"资源共享":30,"人才培养":22,"办学合作":24,"产教科教融合":18,"治理机制":14},"total":108},
  {"month":"2024-06","categories":{"资源共享":25,"人才培养":28,"办学合作":29,"产教科教融合":21,"治理机制":17},"total":120},
  {"month":"2024-07","categories":{"资源共享":11,"人才培养":9,"办学合作":13,"产教科教融合":4,"治理机制":5},"total":42},
  {"month":"2024-08","categories":{"资源共享":20,"人才培养":24,"办学合作":19,"产教科教融合":16,"治理机制":12},"total":91},
  {"month":"2024-09","categories":{"资源共享":34,"人才培养":30,"办学合作":32,"产教科教融合":26,"治理机制":21},"total":143},
  {"month":"2024-10","categories":{"资源共享":27,"人才培养":23,"办学合作":35,"产教科教融合":19,"治理机制":16},"total":120},
  {"month":"2024-11","categories":{"资源共享":18,"人才培养":17,"办学合作":20,"产教科教融合":12,"治理机制":15},"total":82},
  {"month":"2024-12","categories":{"资源共享":31,"人才培养":29,"办学合作":37,"产教科教融合":24,"治理机制":20},"total":141}
];

// ── 根据 2023/2024 两年同期均值 + 增长趋势生成 2025-01 ~ 2026-07 ──
function _extendMonthlyData(raw) {
  var CATS = ['资源共享','人才培养','办学合作','产教科教融合','治理机制'];
  var out = raw.map(function(r){ return { month:r.month, categories:{}, total:0 }; });
  for (var i = 0; i < out.length; i++) {
    var src = raw[i].categories;
    var t = 0;
    for (var c = 0; c < CATS.length; c++) { out[i].categories[CATS[c]] = src[CATS[c]]; t += src[CATS[c]]; }
    out[i].total = t;
  }

  // 计算 2023→2024 增长率
  var y23 = raw.filter(function(r){ return r.month < '2024'; });
  var y24 = raw.filter(function(r){ return r.month >= '2024'; });
  var avg23 = {}, avg24 = {}, growth = {};
  for (var c = 0; c < CATS.length; c++) {
    var s23 = 0, s24 = 0;
    for (var j = 0; j < y23.length; j++) s23 += y23[j].categories[CATS[c]];
    for (var j = 0; j < y24.length; j++) s24 += y24[j].categories[CATS[c]];
    avg23[CATS[c]] = s23 / y23.length;
    avg24[CATS[c]] = s24 / y24.length;
    // 增长率 (使用 2*atan/PI 抑制, 上限 ~15%/年)
  growth[CATS[c]] = avg23[CATS[c]] > 0 ? (avg24[CATS[c]] - avg23[CATS[c]]) / avg23[CATS[c]] : 0.25;
  growth[CATS[c]] = 2 * Math.atan(growth[CATS[c]] * 0.3) / Math.PI;
  }

  // 两年同期月度模式
  var pattern = {};
  for (var c = 0; c < CATS.length; c++) {
    pattern[CATS[c]] = [];
    for (var m = 0; m < 12; m++) {
      var v = (raw[m].categories[CATS[c]] + raw[m + 12].categories[CATS[c]]) / 2;
      pattern[CATS[c]].push(v);
    }
  }

  var seed = 42;
  function seededRand() { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; }

  // 生成 2025-01 ~ 2026-07
  var years = [2025, 2026];
  for (var yi = 0; yi < years.length; yi++) {
    var year = years[yi];
    var monthCount = year === 2026 ? 7 : 12;
    var yearOffset = year - 2023;
    for (var m = 1; m <= monthCount; m++) {
      var monthStr = year + '-' + (m < 10 ? '0' + m : '' + m);
      var cats = {};
      var total = 0;
      for (var c = 0; c < CATS.length; c++) {
        var base = pattern[CATS[c]][m - 1] * Math.pow(1 + growth[CATS[c]], yearOffset);
        var noise = base * (seededRand() * 0.26 - 0.13);
        var val = Math.max(1, Math.round(base + noise));
        cats[CATS[c]] = val;
        total += val;
      }
      out.push({ month: monthStr, categories: cats, total: total });
    }
  }
  return out;
}

// ── 构建最终六类数据结构 ──────────────────────────────────────
function buildActiveIndexData(raw) {
  var extended = _extendMonthlyData(raw);
  var months = extended.map(function(r){ return r.month; });
  var CATS = ['资源共享','人才培养','办学合作','产教科教融合','治理机制'];
  var categoryKeys = ['total','resource','talent','school','industry','governance'];
  var categoryLabels = ['总体','资源共享','人才培养','办学合作','产教科教融合','治理机制'];
  var categoryColors = ['#e03030','#1368e8','#16b8e8','#68a84f','#ed8615','#7468df'];

  var categories = {};
  for (var i = 0; i < categoryKeys.length; i++) {
    categories[categoryKeys[i]] = {
      label: categoryLabels[i],
      color: categoryColors[i],
      values: []
    };
  }

  for (var j = 0; j < extended.length; j++) {
    var row = extended[j];
    categories.total.values.push(row.total);
    for (var c = 0; c < CATS.length; c++) {
      categories[categoryKeys[c + 1]].values.push(row.categories[CATS[c]]);
    }
  }

  return {
    months: months,
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

// ── 初始化 (在 HTML 中直接调用) ───────────────────────────────
var ACTIVE_INDEX_DATA = buildActiveIndexData(RAW_MONTHLY);
ACTIVE_INDEX_DATA.events = RAW_EVENTS;
