/**
 * 活跃度指数 — 数据层
 * 数据来源: 月度活跃度指数(2023基期=100).xlsx
 * 43 个月 (2023-01 ~ 2026-07), 全部为真实计算数据
 */

var ACTIVE_INDEX_RAW = [
  {"month":"2023-01","total":14.0,"resource":0.0,"talent":25.9,"school":9.4,"industry":18.2,"governance":18.2},
  {"month":"2023-02","total":40.8,"resource":27.1,"talent":95.0,"school":40.6,"industry":25.5,"governance":36.4},
  {"month":"2023-03","total":45.1,"resource":63.2,"talent":8.6,"school":53.1,"industry":43.8,"governance":45.5},
  {"month":"2023-04","total":93.5,"resource":90.2,"talent":8.6,"school":87.5,"industry":116.7,"governance":145.5},
  {"month":"2023-05","total":151.5,"resource":108.3,"talent":207.2,"school":168.8,"industry":102.1,"governance":209.1},
  {"month":"2023-06","total":72.0,"resource":72.2,"talent":103.6,"school":75.0,"industry":69.3,"governance":36.4},
  {"month":"2023-07","total":48.3,"resource":9.0,"talent":86.3,"school":34.4,"industry":76.6,"governance":18.2},
  {"month":"2023-08","total":62.3,"resource":81.2,"talent":60.4,"school":50.0,"industry":47.4,"governance":118.2},
  {"month":"2023-09","total":180.5,"resource":171.4,"talent":181.3,"school":178.1,"industry":197.0,"governance":154.5},
  {"month":"2023-10","total":177.3,"resource":234.6,"talent":189.9,"school":181.2,"industry":131.3,"governance":209.1},
  {"month":"2023-11","total":183.7,"resource":207.5,"talent":155.4,"school":187.5,"industry":207.9,"governance":118.2},
  {"month":"2023-12","total":131.1,"resource":135.3,"talent":77.7,"school":134.4,"industry":164.1,"governance":90.9},
  {"month":"2024-01","total":117.1,"resource":153.4,"talent":120.9,"school":96.9,"industry":142.2,"governance":72.7},
  {"month":"2024-02","total":124.6,"resource":90.2,"talent":241.7,"school":137.5,"industry":102.1,"governance":54.5},
  {"month":"2024-03","total":72.0,"resource":108.3,"talent":103.6,"school":43.8,"industry":69.3,"governance":90.9},
  {"month":"2024-04","total":175.1,"resource":162.4,"talent":259.0,"school":184.4,"industry":182.4,"governance":54.5},
  {"month":"2024-05","total":253.5,"resource":333.8,"talent":267.6,"school":296.9,"industry":186.0,"governance":200.0},
  {"month":"2024-06","total":95.6,"resource":126.3,"talent":25.9,"school":100.0,"industry":80.2,"governance":163.6},
  {"month":"2024-07","total":43.0,"resource":45.1,"talent":69.1,"school":50.0,"industry":32.8,"governance":18.2},
  {"month":"2024-08","total":105.3,"resource":54.1,"talent":198.6,"school":140.6,"industry":69.3,"governance":45.5},
  {"month":"2024-09","total":170.8,"resource":297.7,"talent":129.5,"school":171.9,"industry":167.8,"governance":90.9},
  {"month":"2024-10","total":138.6,"resource":144.4,"talent":155.4,"school":128.1,"industry":131.3,"governance":163.6},
  {"month":"2024-11","total":170.8,"resource":315.8,"talent":69.1,"school":193.8,"industry":124.0,"governance":181.8},
  {"month":"2024-12","total":208.4,"resource":351.9,"talent":198.6,"school":196.9,"industry":200.6,"governance":127.3},
  {"month":"2025-01","total":200.9,"resource":324.8,"talent":103.6,"school":146.9,"industry":248.0,"governance":218.2},
  {"month":"2025-02","total":122.5,"resource":207.5,"talent":34.5,"school":90.6,"industry":138.6,"governance":181.8},
  {"month":"2025-03","total":213.8,"resource":333.8,"talent":129.5,"school":190.6,"industry":233.4,"governance":200.0},
  {"month":"2025-04","total":120.3,"resource":162.4,"talent":146.8,"school":103.1,"industry":116.7,"governance":109.1},
  {"month":"2025-05","total":110.7,"resource":108.3,"talent":69.1,"school":112.5,"industry":127.7,"governance":109.1},
  {"month":"2025-06","total":141.8,"resource":180.5,"talent":120.9,"school":156.2,"industry":120.4,"governance":136.4},
  {"month":"2025-07","total":65.5,"resource":90.2,"talent":17.3,"school":50.0,"industry":80.2,"governance":100.0},
  {"month":"2025-08","total":84.9,"resource":18.0,"talent":155.4,"school":65.6,"industry":120.4,"governance":45.5},
  {"month":"2025-09","total":103.1,"resource":108.3,"talent":146.8,"school":115.6,"industry":87.5,"governance":54.5},
  {"month":"2025-10","total":68.8,"resource":81.2,"talent":0.0,"school":78.1,"industry":94.8,"governance":36.4},
  {"month":"2025-11","total":175.1,"resource":198.5,"talent":120.9,"school":175.0,"industry":222.5,"governance":90.9},
  {"month":"2025-12","total":192.3,"resource":225.6,"talent":172.7,"school":193.8,"industry":200.6,"governance":154.5},
  {"month":"2026-01","total":87.0,"resource":171.4,"talent":60.4,"school":46.9,"industry":120.4,"governance":63.6},
  {"month":"2026-02","total":90.2,"resource":225.6,"talent":51.8,"school":65.6,"industry":58.4,"governance":145.5},
  {"month":"2026-03","total":149.3,"resource":297.7,"talent":60.4,"school":100.0,"industry":200.6,"governance":109.1},
  {"month":"2026-04","total":155.8,"resource":162.4,"talent":172.7,"school":121.9,"industry":164.1,"governance":209.1},
  {"month":"2026-05","total":257.8,"resource":369.9,"talent":310.8,"school":131.2,"industry":353.8,"governance":218.2},
  {"month":"2026-06","total":134.3,"resource":234.6,"talent":129.5,"school":78.1,"industry":167.8,"governance":118.2},
  {"month":"2026-07","total":166.5,"resource":270.7,"talent":146.8,"school":125.0,"industry":167.8,"governance":200.0}
];

function buildActiveIndexData() {
  var KEY_MAP = [
    ['total',      '总体',         '#e03030'],
    ['resource',   '资源共享',     '#1368e8'],
    ['talent',     '人才培养',     '#16b8e8'],
    ['school',     '办学合作',     '#68a84f'],
    ['industry',   '产教科教融合', '#ed8615'],
    ['governance', '治理机制',     '#7468df']
  ];

  var categories = {};
  for (var k = 0; k < KEY_MAP.length; k++) {
    categories[KEY_MAP[k][0]] = { label: KEY_MAP[k][1], color: KEY_MAP[k][2], values: [] };
  }

  var months = [];
  for (var i = 0; i < ACTIVE_INDEX_RAW.length; i++) {
    var row = ACTIVE_INDEX_RAW[i];
    months.push(row.month);
    for (var k = 0; k < KEY_MAP.length; k++) {
      categories[KEY_MAP[k][0]].values.push(row[KEY_MAP[k][0]]);
    }
  }

  return { months: months, categories: categories, events: null };
}

var ACTIVE_INDEX_DATA = buildActiveIndexData();
ACTIVE_INDEX_DATA.events = [];
