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
     * 应用初始化
     */
    init: function () {
      this.bindTabBar();
      this.bindSearch();
      this.initPages();
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
})();
