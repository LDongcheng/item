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
     * API 页面标识到内部页面 key 的映射
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
     * 应用初始化
     */
    init: function () {
      this.loadTabBarConfig();
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
        // 确保是数组
        if (!Array.isArray(config)) config = null;
      } catch (e) {
        config = null;
      }
      if (!config) {
        config = this.defaultTabBar;
      } else {
        // 映射 API 页面标识到内部 key
        var self = this;
        config = config.map(function (item) {
          return {
            name: item.name,
            sort: item.sort,
            page: self.pageMap[item.page] || item.page,
          };
        });
      }
      this.renderTabBar(config);
    },

    /**
     * 根据商家配置渲染底部导航栏
     * @param {Array} tabBarConfig - 导航栏配置数组
     */
    renderTabBar: function (tabBarConfig) {
      var tabBar = document.getElementById('tab-bar');
      if (!tabBar) return;

      // 按 sort 排序
      var sorted = tabBarConfig.sort(function (a, b) {
        return parseInt(a.sort) - parseInt(b.sort);
      });

      tabBar.innerHTML = sorted.map(function (item, index) {
        return '<div class="tab-item' + (index === 0 ? ' active' : '') + '" data-page="' + item.page + '">' +
          '<div class="tab-icon-img"></div>' +
          '<span class="tab-label">' + item.name + '</span>' +
          '</div>';
      }).join('');

      // 重新绑定事件
      this.bindTabBar();

      // 未登录默认显示"我的"页面，方便用户登录
      var isLogin = !!localStorage.getItem('fsj_token');
      var firstPage = isLogin ? sorted[0].page : 'profile';

      // 确保 sorted 中包含 profile 页面
      var hasProfile = sorted.some(function (item) {
        return item.page === 'profile';
      });
      if (!hasProfile) {
        firstPage = 'profile';
      }

      this.switchPage(firstPage);
    },

    /**
     * 更新 TabBar 配置（登录成功后调用）
     * @param {Array} shangjia - 商家页面配置
     */
    updateTabBar: function (shangjia) {
      if (!shangjia || !shangjia.length) return;

      // 映射 API 页面标识到内部 key
      var self = this;
      var mapped = shangjia.map(function (item) {
        return {
          name: item.name,
          sort: item.sort,
          page: self.pageMap[item.page] || item.page,
        };
      });

      localStorage.setItem('fsj_shangjia_tabs', JSON.stringify(mapped));
      this.renderTabBar(mapped);
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
          self.switchPage(page);
        });
      });
    },

    /**
     * 页面切换
     * @param {string} pageKey - 页面标识
     */
    switchPage: function (pageKey) {
      // 切换页面显示
      var pages = document.querySelectorAll('.page');
      pages.forEach(function (p) {
        p.classList.remove('active');
      });

      var targetPage = document.getElementById('page-' + pageKey);
      if (targetPage) {
        targetPage.classList.add('active');
      }

      // 切换 TabBar 激活态
      var tabs = document.querySelectorAll('.tab-item');
      tabs.forEach(function (tab) {
        var tabPage = tab.getAttribute('data-page');
        if (tabPage === pageKey) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      // 设置导航栏标题
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

  // 启动应用
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      App.init();
    });
  } else {
    App.init();
  }

  // 暴露到全局
  window.App = App;
  window.ProfilePage = ProfilePage;
})();
