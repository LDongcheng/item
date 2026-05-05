import Router from './router.js';
import HomePage from './pages/home.js';
import AgentPage from './pages/agent.js';
import MessagePage from './pages/message.js';
import ProfilePage from './pages/profile.js';

/**
 * 应用入口
 */
(function () {
  'use strict';

  var App = {
    /**
     * 页面标识映射
     */
    pageMap: {
      'home': 'home',
      'agent': 'agent',
      'message': 'message',
      'mine': 'profile',
      'profile': 'profile',
    },

    /**
     * 默认底部导航栏配置
     */
    defaultTabBar: [
      { name: '首页', sort: 0, page: 'home' },
      { name: '智能体', sort: 1, page: 'agent' },
      { name: '消息', sort: 2, page: 'message' },
      { name: '我的', sort: 3, page: 'profile' },
    ],

    /**
     * 当前 TabBar 配置（保存排序后的）
     */
    tabBarConfig: [],

    /**
     * 应用初始化
     */
    init: function () {
      this.loadTabBarConfig();
      this.loadInitialPage();
      this.loadUserName();
      this.bindSearch();
      this.initPages();
    },

    /**
     * 加载用户名
     */
    loadUserName: function () {
      var userName = localStorage.getItem('fsj_user_name');
      if (userName && window.ProfilePage) {
        window.ProfilePage.renderUserCard();
      }
    },

    /**
     * 加载 TabBar 配置
     */
    loadTabBarConfig: function () {
      var stored = localStorage.getItem('fsj_shangjia_tabs');
      var config;
      try {
        config = stored ? JSON.parse(stored) : null;
        if (!Array.isArray(config)) config = null;
      } catch (e) {
        config = null;
      }
      if (!config) {
        config = this.defaultTabBar;
      } else {
        var self = this;
        config = config.map(function (item) {
          var mapped = {
            name: item.name,
            sort: item.sort,
            page: self.pageMap[item.page] || item.page,
          };
          // mode 0 = 原生页面, mode 1 = 内嵌url
          if (item.mode !== undefined) mapped.mode = item.mode;
          if (item.url) {
            mapped.url = item.url;
            // 统一补全 https 前缀
            if (!mapped.url.match(/^https?:\/\//)) {
              mapped.url = 'https://' + mapped.url;
            }
          }
          // 首页 mode 0 时固定显示原生 home 页面
          if (item.name === '首页' && (item.mode === 0 || item.mode === '0')) {
            mapped.page = 'home';
          }
          return mapped;
        });
      }
      this.renderTabBar(config);
    },

    /**
     * 渲染底部导航栏
     * 注意：此方法只渲染 TabBar，不切换页面
     */
    renderTabBar: function (tabBarConfig) {
      var tabBar = document.getElementById('tab-bar');
      if (!tabBar) return;

      var sorted = tabBarConfig.sort(function (a, b) {
        return parseInt(a.sort) - parseInt(b.sort);
      });

      this.tabBarConfig = sorted;

      tabBar.innerHTML = sorted.map(function (item, index) {
        var modeAttr = (item.mode == 1) ? ' data-mode="1"' : '';
        var urlAttr = item.url ? ' data-url="' + item.url + '"' : '';
        // 保留当前激活的 tab，不强制第一个为 active
        var activeTab = tabBar.querySelector('.tab-item.active');
        var activePage = activeTab ? activeTab.getAttribute('data-page') : '';
        var isFirst = (!activePage && index === 0) || (item.page === activePage);
        return '<div class="tab-item' + (isFirst ? ' active' : '') + '"' +
          ' data-page="' + item.page + '"' + modeAttr + urlAttr + '>' +
          '<div class="tab-icon-img"></div>' +
          '<span class="tab-label">' + item.name + '</span>' +
          '</div>';
      }).join('');

      this.bindTabBar();
    },

    /**
     * 初始页面加载
     * 只在应用启动时调用，决定首次显示哪个页面
     */
    loadInitialPage: function () {
      var isLogin = !!localStorage.getItem('fsj_token');
      var firstItem = this.tabBarConfig[0];
      var firstPage = isLogin ? firstItem.page : 'profile';

      var hasProfile = this.tabBarConfig.some(function (item) {
        return item.page === 'profile';
      });
      if (!hasProfile) {
        firstPage = 'profile';
      }

      // 初始加载时判断 mode
      if (isLogin && firstItem.mode == 1 && firstItem.url) {
        this.switchToWebview(firstItem.url);
      } else {
        this.switchPage(firstPage);
      }
    },

    /**
     * 更新 TabBar 配置
     */
    updateTabBar: function (shangjia) {
      if (!shangjia || !shangjia.length) return;

      var self = this;
      var mapped = shangjia.map(function (item) {
        var m = {
          name: item.name,
          sort: item.sort,
          page: self.pageMap[item.page] || item.page,
        };
        if (item.mode !== undefined) m.mode = item.mode;
        if (item.url) {
          m.url = item.url;
          if (!m.url.match(/^https?:\/\//)) {
            m.url = 'https://' + m.url;
          }
        }
        return m;
      });

      localStorage.setItem('fsj_shangjia_tabs', JSON.stringify(mapped));
      this.renderTabBar(mapped);

      // 登录后自动切换到首页
      var firstItem = mapped[0];
      if (firstItem) {
        if (firstItem.mode == 1 && firstItem.url) {
          this.switchToWebview(firstItem.url);
        } else {
          this.switchPage(firstItem.page);
        }
      }
    },

    /**
     * 绑定 TabBar 切换
     */
    bindTabBar: function () {
      var self = this;
      var tabs = document.querySelectorAll('.tab-item[data-page]');

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var page = tab.getAttribute('data-page');
          var mode = tab.getAttribute('data-mode');
          var url = tab.getAttribute('data-url');

          if (mode === '1' && url) {
            self.switchToWebview(url);
          } else {
            self.switchPage(page);
          }
        });
      });
    },

    /**
     * 切换到内嵌网页模式
     */
    switchToWebview: function (url) {
      // 补协议头
      if (url && !url.match(/^https?:\/\//)) {
        url = 'https://' + url;
      }
      var pages = document.querySelectorAll('.page');
      pages.forEach(function (p) {
        p.classList.remove('active');
      });

      var webviewPage = document.getElementById('page-webview');
      if (webviewPage) {
        webviewPage.classList.add('active');
        var iframe = document.getElementById('webview-iframe');
        if (iframe) {
          iframe.src = url;
        }
      }

      var tabs = document.querySelectorAll('.tab-item');
      tabs.forEach(function (tab) {
        if (tab.getAttribute('data-mode') === '1' && tab.getAttribute('data-url') === url) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      Bridge.setNavigationBarTitle('');
    },

    /**
     * 页面切换
     */
    switchPage: function (pageKey) {
      var pages = document.querySelectorAll('.page');
      pages.forEach(function (p) {
        p.classList.remove('active');
      });

      var targetPage = document.getElementById('page-' + pageKey);
      if (targetPage) {
        targetPage.classList.add('active');
      }

      var tabs = document.querySelectorAll('.tab-item');
      tabs.forEach(function (tab) {
        var tabPage = tab.getAttribute('data-page');
        if (tabPage === pageKey) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      var titles = {
        home: '',
        agent: '智能体',
        message: '消息',
        profile: '我的'
      };

      if (titles[pageKey] !== undefined) {
        Bridge.setNavigationBarTitle(titles[pageKey]);
      }
    },

    /**
     * 绑定搜索
     */
    bindSearch: function () {
      var searchBtn = document.querySelector('.btn-search');
      var searchInput = document.querySelector('.search-box input');

      if (searchBtn) {
        searchBtn.addEventListener('click', function () {
          var keyword = searchInput.value.trim();
          if (keyword) {
            Bridge.postMessage('search', { keyword: keyword });
          }
        });
      }

      if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') {
            var keyword = searchInput.value.trim();
            if (keyword) {
              Bridge.postMessage('search', { keyword: keyword });
            }
          }
        });
      }
    },

    /**
     * 初始化各页面
     */
    initPages: function () {
      HomePage.init();
      AgentPage.init();
      MessagePage.init();
      ProfilePage.init();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      App.init();
    });
  } else {
    App.init();
  }

  window.App = App;
  window.ProfilePage = ProfilePage;
})();
