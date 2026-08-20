/**
 * 活跃度指数 — 业务模块
 * Namespace: active-index__
 *
 * 公共 API:
 *   initActiveIndex(container, data)
 *   updateActiveIndex(data)
 *   resizeActiveIndex()
 *   destroyActiveIndex()
 */
(function () {
  'use strict';

  // ── 常量 ──────────────────────────────────────────────────
  var PLAY_INTERVAL  = 280;   // 每月播放间隔 ms
  var PAUSE_AFTER    = 700;   // 单类别播放结束后停顿 ms
  var FADE_DURATION  = 200;   // Tab 切换过渡 ms

  // ── 类目定义 (固定顺序) ───────────────────────────────────
  var CAT_KEYS   = ['total', 'resource', 'talent', 'school', 'industry', 'governance'];
  var CAT_LABELS = ['总体', '资源共享', '人才培养', '办学合作', '产教科教融合', '治理机制'];
  var CAT_COLORS = ['#e03030', '#1368e8', '#16b8e8', '#68a84f', '#ed8615', '#7468df'];

  // ── 模块状态 ──────────────────────────────────────────────
  var _container     = null;
  var _data          = null;
  var _chart         = null;
  var _resizeObs     = null;
  var _rootEl        = null;

  var _catIndex      = 0;
  var _monthIndex    = 0;
  var _isPlaying     = false;
  var _playTimer     = null;
  var _pauseTimer    = null;
  var _userPaused    = false;

  // DOM 缓存
  var _els = {};

  // ── 工具函数 ──────────────────────────────────────────────
  function fmtMonth(m) {
    return m.slice(0, 4) + '年' + m.slice(5) + '月';
  }

  function catColor(key) {
    var idx = CAT_KEYS.indexOf(key);
    return idx >= 0 ? CAT_COLORS[idx] : '#095fd6';
  }

  // ── 初始化 ────────────────────────────────────────────────
  function initActiveIndex(container, data) {
    if (!container || !data || !data.months || !data.categories) {
      console.error('[active-index] initActiveIndex: 无效参数', container, data);
      return;
    }
    _container = container;
    _data = data;
    _catIndex = 0;
    _monthIndex = 0;
    _userPaused = false;

    _validateData();
    _buildDOM();
    _initChart();
    _bindEvents();
    _applyCatIndex(0);
    _startPlayback();
  }

  // ── 数据校验 ──────────────────────────────────────────────
  function _validateData() {
    var len = _data.months.length;
    for (var i = 0; i < CAT_KEYS.length; i++) {
      var key = CAT_KEYS[i];
      var cat = _data.categories[key];
      if (!cat) {
        console.error('[active-index] 缺失类别:', key);
        continue;
      }
      if (cat.values.length !== len) {
        console.error('[active-index] 数据长度不匹配:', key, cat.values.length, '!= months', len);
      }
    }
  }

  // ── 构建 DOM ──────────────────────────────────────────────
  function _buildDOM() {
    _rootEl = document.createElement('section');
    _rootEl.className = 'active-index';
    _rootEl.setAttribute('role', 'region');
    _rootEl.setAttribute('aria-label', '活跃度指数');

    _rootEl.innerHTML =
      '<header class="active-index__header">' +
        '<h2 class="active-index__title">活跃度指数</h2>' +
        '<div class="active-index__actions">' +
          '<button class="active-index__play-btn" data-act="prev" aria-label="上一个月" title="上一个月">&lsaquo;</button>' +
          '<button class="active-index__play-btn" data-act="toggle" aria-label="暂停/播放" title="暂停/播放">&#9654;</button>' +
          '<button class="active-index__play-btn" data-act="next" aria-label="下一个月" title="下一个月">&rsaquo;</button>' +
          '<span class="active-index__current-month-label"></span>' +
        '</div>' +
      '</header>' +
      '<div class="active-index__body">' +
        '<nav class="active-index__tabs" role="tablist" aria-label="活跃度类别"></nav>' +
        '<div class="active-index__chart-wrap">' +
          '<div class="active-index__chart"></div>' +
          '<div class="active-index__metric">' +
            '<span class="active-index__metric-month"></span>' +
            '<span class="active-index__metric-value"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="active-index__footer">' +
        '<div class="active-index__status">' +
          '<span class="active-index__status-category"></span>' +
        '</div>' +
      '</div>' +
      '<div class="active-index__progress"><div class="active-index__progress-bar"></div></div>';

    _container.innerHTML = '';
    _container.appendChild(_rootEl);

    // 缓存 DOM 引用
    _els.tabs         = _rootEl.querySelector('.active-index__tabs');
    _els.chart        = _rootEl.querySelector('.active-index__chart');
    _els.metricMonth  = _rootEl.querySelector('.active-index__metric-month');
    _els.metricValue  = _rootEl.querySelector('.active-index__metric-value');
    _els.monthLabel   = _rootEl.querySelector('.active-index__current-month-label');
    _els.statusCat    = _rootEl.querySelector('.active-index__status-category');
    _els.progressBar  = _rootEl.querySelector('.active-index__progress-bar');
    _els.toggleBtn    = _rootEl.querySelector('[data-act="toggle"]');

    // 构建 Tab
    var tabsHtml = '';
    for (var i = 0; i < CAT_KEYS.length; i++) {
      tabsHtml += '<button class="active-index__tab" role="tab" data-idx="' + i +
        '" aria-selected="false">' + CAT_LABELS[i] + '</button>';
    }
    _els.tabs.innerHTML = tabsHtml;
  }

  // ── 初始化 ECharts ────────────────────────────────────────
  function _initChart() {
    if (typeof echarts === 'undefined') {
      console.error('[active-index] ECharts 未加载');
      return;
    }
    _chart = echarts.init(_els.chart);
    _resizeObs = new ResizeObserver(function () {
      if (_chart) _chart.resize();
    });
    _resizeObs.observe(_els.chart);
  }

  // ── 事件绑定 ──────────────────────────────────────────────
  function _bindEvents() {
    // Tab 点击
    _els.tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.active-index__tab');
      if (!btn) return;
      var idx = parseInt(btn.dataset.idx, 10);
      if (isNaN(idx)) return;
      _clearTimers();
      _userPaused = false;
      _applyCatIndex(idx);
      _monthIndex = 0;
      _renderMonth();
      _startPlayback();
    });

    // 播放控制
    _rootEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.active-index__play-btn');
      if (!btn) return;
      var act = btn.dataset.act;
      if (act === 'prev') {
        _clearTimers();
        _userPaused = true;
        _updateToggleBtn(false);
        _prevMonth();
      } else if (act === 'next') {
        _clearTimers();
        _userPaused = true;
        _updateToggleBtn(false);
        if (_monthIndex >= _data.months.length - 1) {
          _switchToNextCat();
          _userPaused = true;
          _pausePlayback();
        } else {
          _nextMonth();
        }
      } else if (act === 'toggle') {
        if (_isPlaying) {
          _userPaused = true;
          _pausePlayback();
        } else {
          _userPaused = false;
          _startPlayback();
        }
      }
    });

    // 图表 hover
    if (_chart) {
      _chart.on('mouseover', function (params) {
        if (_isPlaying) _pausePlayback();
      });
      _chart.on('mouseout', function (params) {
        if (!_userPaused) _startPlayback();
      });
    }
  }

  // ── 应用类别索引 ──────────────────────────────────────────
  function _applyCatIndex(idx) {
    _catIndex = idx;
    // 更新 Tab UI
    var tabs = _els.tabs.querySelectorAll('.active-index__tab');
    for (var i = 0; i < tabs.length; i++) {
      var isActive = i === idx;
      tabs[i].classList.toggle('active-index__tab--active', isActive);
      tabs[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    // 更新状态文字
    _els.statusCat.textContent = CAT_LABELS[idx] + '活跃度';
  }

  // ── 渲染当前月份 ──────────────────────────────────────────
  function _renderMonth() {
    var months = _data.months;
    var catKey = CAT_KEYS[_catIndex];
    var cat    = _data.categories[catKey];
    var m      = months[_monthIndex];
    var val    = cat.values[_monthIndex];

    // 更新指标卡片
    _els.metricMonth.textContent = m;
    _els.metricValue.textContent = val;
    _els.metricValue.style.color = cat.color;
    _els.monthLabel.textContent  = m;

    // 进度条
    var pct = months.length > 1 ? (_monthIndex / (months.length - 1)) * 100 : 0;
    _els.progressBar.style.width = pct + '%';

    // 渲染图表
    _renderChart();
  }

  // ── 渲染 ECharts 折线 ────────────────────────────────────
  function _renderChart() {
    if (!_chart || !_data) return;

    var months   = _data.months;
    var catKey   = CAT_KEYS[_catIndex];
    var cat      = _data.categories[catKey];
    var color    = cat.color;
    var curMonth = months[_monthIndex];

    // 数据：只显示到当前月份，后续设为 null
    var seriesData = [];
    for (var i = 0; i < months.length; i++) {
      seriesData.push(i <= _monthIndex ? cat.values[i] : null);
    }

    // Y 轴范围
    var allVals = cat.values;
    var minV = Infinity, maxV = -Infinity;
    for (var i = 0; i < allVals.length; i++) {
      if (allVals[i] < minV) minV = allVals[i];
      if (allVals[i] > maxV) maxV = allVals[i];
    }
    var range = maxV - minV || 10;
    var yMin = Math.max(0, Math.floor(minV - range * 0.12));
    var yMax = Math.ceil(maxV + range * 0.12);

    var option = {
      animation: true,
      animationDuration: 200,
      animationEasing: 'cubicOut',
      grid: {
        left: '8%',
        right: '5%',
        top: '8%',
        bottom: '14%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(3, 18, 36, 0.96)',
        borderColor: 'rgba(0, 145, 255, 0.7)',
        borderWidth: 1,
        textStyle: { color: '#f2f7ff', fontSize: 13 },
        formatter: function (params) {
          if (!params || !params.length) return '';
          var p = params[0];
          if (p.value == null) return '';
          return '<b>' + p.axisValue + '</b><br/>' +
            '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' +
            color + ';margin-right:6px"></span>' +
            cat.label + '：<b style="color:' + color + '">' + p.value + '</b>';
        }
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: 'rgba(160, 190, 220, 0.28)' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#b8c7d9',
          fontSize: 11,
          interval: function (idx) {
            return idx % 3 === 0;
          },
          formatter: function (v) {
            return v.slice(2, 4) + '-' + v.slice(5);
          }
        },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#b8c7d9', fontSize: 12 },
        splitLine: { lineStyle: { color: 'rgba(80, 130, 170, 0.18)' } }
      },
      series: [{
        name: cat.label,
        type: 'line',
        data: seriesData,
        smooth: 0.25,
        symbol: 'circle',
        symbolSize: function (value, params) {
          return params.dataIndex === _monthIndex ? 10 : 4;
        },
        lineStyle: {
          width: 2.5,
          color: color,
          shadowBlur: 6,
          shadowColor: color
        },
        itemStyle: {
          color: function (params) {
            return params.dataIndex === _monthIndex ? '#ffffff' : color;
          },
          borderColor: color,
          borderWidth: function (params) {
            return params.dataIndex === _monthIndex ? 3 : 0;
          },
          shadowBlur: function (params) {
            return params.dataIndex === _monthIndex ? 14 : 0;
          },
          shadowColor: color
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: _hexToRgba(color, 0.22) },
            { offset: 1, color: 'rgba(0, 0, 0, 0)' }
          ])
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: 'rgba(0, 168, 255, 0.4)',
            width: 1.5,
            type: 'dashed'
          },
          label: { show: false },
          data: _monthIndex < months.length ? [{ xAxis: curMonth }] : []
        }
      }]
    };

    _chart.setOption(option, true);
  }

  // ── 颜色工具 ──────────────────────────────────────────────
  function _hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // ── 播放控制 ──────────────────────────────────────────────
  function _startPlayback() {
    _clearTimers();
    _isPlaying = true;
    _updateToggleBtn(true);
    _playTimer = setInterval(function () {
      _nextMonth();
    }, PLAY_INTERVAL);
  }

  function _pausePlayback() {
    _clearTimers();
    _isPlaying = false;
    _updateToggleBtn(false);
  }

  function _clearTimers() {
    if (_playTimer) { clearInterval(_playTimer); _playTimer = null; }
    if (_pauseTimer) { clearTimeout(_pauseTimer); _pauseTimer = null; }
  }

  function _updateToggleBtn(playing) {
    if (_els.toggleBtn) {
      _els.toggleBtn.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
      _els.toggleBtn.setAttribute('aria-label', playing ? '暂停' : '播放');
      _els.toggleBtn.setAttribute('title', playing ? '暂停' : '播放');
    }
  }

  // ── 前进/后退一个月 ──────────────────────────────────────
  function _nextMonth() {
    var maxIdx = _data.months.length - 1;
    if (_monthIndex >= maxIdx) {
      // 当前类别播放完毕
      _clearTimers();
      _isPlaying = false;
      _pauseTimer = setTimeout(function () {
        _switchToNextCat();
      }, PAUSE_AFTER);
      return;
    }
    _monthIndex++;
    _renderMonth();
  }

  function _prevMonth() {
    if (_monthIndex > 0) {
      _monthIndex--;
      _renderMonth();
    }
  }

  // ── 自动切换到下一个类别 ──────────────────────────────────
  function _switchToNextCat() {
    var nextIdx = (_catIndex + 1) % CAT_KEYS.length;
    _applyCatIndex(nextIdx);
    _monthIndex = 0;
    _renderMonth();
    if (!_userPaused) {
      _startPlayback();
    }
  }

  // ── 公共 API: update ──────────────────────────────────────
  function updateActiveIndex(data) {
    if (!data || !data.months || !data.categories) {
      console.error('[active-index] updateActiveIndex: 无效数据');
      return;
    }
    _data = data;
    _validateData();
    // 保持当前 Tab 和月份（clamp 月份索引）
    if (_monthIndex >= _data.months.length) {
      _monthIndex = _data.months.length - 1;
    }
    _renderMonth();
  }

  // ── 公共 API: resize ──────────────────────────────────────
  function resizeActiveIndex() {
    if (_chart) _chart.resize();
  }

  // ── 公共 API: destroy ─────────────────────────────────────
  function destroyActiveIndex() {
    _clearTimers();
    if (_resizeObs) {
      _resizeObs.disconnect();
      _resizeObs = null;
    }
    if (_chart) {
      _chart.dispose();
      _chart = null;
    }
    if (_container) {
      _container.innerHTML = '';
    }
    _rootEl = null;
    _els = {};
    _container = null;
    _data = null;
    _isPlaying = false;
    _userPaused = false;
  }

  // ── 暴露到 window (供独立测试 / 非 ES Module 环境) ───────
  window.initActiveIndex    = initActiveIndex;
  window.updateActiveIndex  = updateActiveIndex;
  window.resizeActiveIndex  = resizeActiveIndex;
  window.destroyActiveIndex = destroyActiveIndex;

})();
