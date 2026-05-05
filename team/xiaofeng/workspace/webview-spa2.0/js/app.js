/**
 * Webview SPA 2.0 - 应用入口
 * 逐步验证，先实现基础 tab 切换
 */
(function () {
  'use strict';

  var App = {
    init: function () {
      console.log('[App] 初始化');
      this.bindTabBar();
      this.loadInitialPage();
    },

    /**
     * 初始加载：判断是否登录，决定显示哪个页面
     */
    loadInitialPage: function () {
      var token = localStorage.getItem('fsj_token');
      var page = token ? 'home' : 'profile';
      console.log('[App] 初始页面:', page, '已登录:', !!token);
      this.switchPage(page);
    },

    /**
     * 绑定 tab 点击
     */
    bindTabBar: function () {
      var self = this;
      var tabs = document.querySelectorAll('#tab-bar .tab-item');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var page = tab.getAttribute('data-page');
          console.log('[App] 点击 tab:', page);
          self.switchPage(page);
        });
      });
    },

    /**
     * 切换页面
     */
    switchPage: function (pageKey) {
      // 切换页面 active
      document.querySelectorAll('#app .page').forEach(function (p) {
        p.classList.remove('active');
      });
      var target = document.getElementById('page-' + pageKey);
      if (target) {
        target.classList.add('active');
      }

      // 切换 tab active
      document.querySelectorAll('#tab-bar .tab-item').forEach(function (tab) {
        var tp = tab.getAttribute('data-page');
        tab.classList.toggle('active', tp === pageKey);
      });

      console.log('[App] 页面已切换到:', pageKey);
    }
  };

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      App.init();
    });
  } else {
    App.init();
  }

  window.App = App;
})();
