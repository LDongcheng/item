/**
 * 首页 - 社区论坛风格
 */
var HomePage = {
  /**
   * 初始化
   */
  init: function () {
    this.renderBanner();
    this.renderFuncGrid();
    this.renderArticleList();
  },

  /**
   * 渲染轮播图
   */
  renderBanner: function () {
    var container = document.getElementById('home-banner');
    if (!container) return;

    var banners = [
      { title: '智能体使用指南', color: '#2563EB' },
      { title: '本月销售排行榜', color: '#60A5FA' },
      { title: '新功能上线通知', color: '#93C5FD' },
    ];

    container.innerHTML =
      '<div class="banner-track">' +
        '<div class="banner-slides" id="banner-slides">' +
          banners.map(function (b) {
            return '<div class="banner-slide" style="background:' + b.color + '">' +
              '<span class="slide-title">' + b.title + '</span>' +
              '</div>';
          }).join('') +
        '</div>' +
        '<div class="banner-dots">' +
          banners.map(function (_, i) {
            return '<span class="dot' + (i === 0 ? ' active' : '') + '"></span>';
          }).join('') +
        '</div>' +
      '</div>';

    this._initBannerSwipe(banners.length);
  },

  _initBannerSwipe: function (count) {
    var slides = document.getElementById('banner-slides');
    var dots = document.querySelectorAll('.banner-dot');
    if (!slides) return;

    var current = 0;
    var startX = 0;
    var translating = false;
    var self = this;

    function goTo(index) {
      current = ((index % count) + count) % count;
      slides.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d) { d.classList.remove('active'); });
      if (dots[current]) dots[current].classList.add('active');
    }

    slides.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      translating = true;
      slides.style.transition = 'none';
    });

    slides.addEventListener('touchend', function (e) {
      if (!translating) return;
      translating = false;
      slides.style.transition = 'transform 0.3s';
      var diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current - 1);
        else goTo(current + 1);
      }
    });

    // 自动轮播
    setInterval(function () {
      slides.style.transition = 'transform 0.3s';
      goTo(current + 1);
    }, 4000);
  },

  /**
   * 渲染功能列表（社区常用功能入口）
   */
  renderFuncGrid: function () {
    var container = document.getElementById('home-func-grid');
    if (!container) return;

    var items = [
      { icon: '📅', name: '拜访计划', action: 'visit' },
      { icon: '📊', name: '项目看板', action: 'project' },
      { icon: '💬', name: '话术库', action: 'scripts' },
      { icon: '📝', name: '复盘', action: 'review' },
      { icon: '🎯', name: '目标追踪', action: 'goals' },
      { icon: '📚', name: '知识库', action: 'knowledge' },
      { icon: '🏆', name: '排行榜', action: 'ranking' },
      { icon: '⚡', name: '快捷任务', action: 'quick' },
    ];

    container.innerHTML = items.map(function (item) {
      return '<div class="func-item" data-action="' + item.action + '">' +
        '<div class="func-icon">' + item.icon + '</div>' +
        '<span class="func-name">' + item.name + '</span>' +
        '</div>';
    }).join('');

    var self = this;
    container.querySelectorAll('.func-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var action = el.getAttribute('data-action');
        self.handleAction(action);
      });
    });
  },

  /**
   * 渲染文章列表
   */
  renderArticleList: function () {
    var container = document.getElementById('home-article-list');
    if (!container) return;

    var articles = [
      { title: '如何高效拜访客户？销售老手分享3个技巧', tag: '拜访技巧', tagColor: '#2563EB', author: '销售培训部', date: '05-01', views: 1280 },
      { title: 'Q2销售目标拆解：从10万到100万的增长路径', tag: '目标管理', tagColor: '#10B981', author: '管理层', date: '04-30', views: 956 },
      { title: '新产品话术上线：医疗器械行业定制版', tag: '话术更新', tagColor: '#F59E0B', author: '产品团队', date: '04-29', views: 723 },
      { title: '客户跟进中的5个常见误区，你中了几个？', tag: '经验分享', tagColor: '#EF4444', author: '张三', date: '04-28', views: 645 },
      { title: 'AI智能体使用入门：让你的销售效率翻倍', tag: '使用指南', tagColor: '#2563EB', author: '技术支持', date: '04-27', views: 2103 },
    ];

    container.innerHTML = articles.map(function (a) {
      return '<div class="article-item">' +
        '<div class="article-header">' +
          '<span class="article-tag" style="background:' + a.tagColor + '">' + a.tag + '</span>' +
          '<span class="article-title-text">' + a.title + '</span>' +
        '</div>' +
        '<div class="article-meta">' +
          '<span class="article-author">' + a.author + '</span>' +
          '<span class="article-date">' + a.date + '</span>' +
          '<span class="article-views">' + a.views + ' 阅读</span>' +
        '</div>' +
        '</div>';
    }).join('');
  },

  /**
   * 处理功能操作
   */
  handleAction: function (action) {
    Bridge.postMessage('navigate', { page: action });
  }
};

export default HomePage;
