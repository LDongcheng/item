/**
 * Webview SPA 2.0 - 应用入口
 * 功能：tab 切换 + 登录后动态加载不同底部菜单
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
     * 默认底部导航栏配置（未登录/通用）
     */
    defaultTabBar: [
      { name: '首页', sort: '0', page: 'home', mode: '1', url: 'https://100000whys.cn/fsj_school/' },
      { name: '智能体', sort: '1', page: 'agent', mode: '0' },
      { name: '消息', sort: '2', page: 'message' },
      { name: '我的', sort: '3', page: 'mine' },
    ],

    /**
     * 当前 TabBar 配置
     */
    tabBarConfig: [],

    init: function () {
      console.log('[App] 初始化');
      this.loadTabBarConfig();
      this.loadInitialPage();
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
          return {
            name: item.name,
            sort: item.sort,
            page: self.pageMap[item.page] || item.page,
            mode: item.mode,
            url: item.url ? (item.url.match(/^https?:\/\//) ? item.url : 'https://' + item.url) : null,
          };
        });
      }
      this.renderTabBar(config);
    },

    /**
     * 渲染底部导航栏
     */
    renderTabBar: function (tabBarConfig) {
      var tabBar = document.getElementById('tab-bar');
      if (!tabBar) return;

      var self = this;
      var sorted = tabBarConfig.sort(function (a, b) {
        return parseInt(a.sort) - parseInt(b.sort);
      });

      this.tabBarConfig = sorted;

      tabBar.innerHTML = sorted.map(function (item, index) {
        var modeAttr = (item.mode == 1) ? ' data-mode="1"' : '';
        var urlAttr = item.url ? ' data-url="' + item.url + '"' : '';
        var isFirst = index === 0;
        return '<div class="tab-item' + (isFirst ? ' active' : '') + '"' +
          ' data-page="' + item.page + '"' + modeAttr + urlAttr + '>' +
          '<div class="tab-icon-img"></div>' +
          '<span class="tab-label">' + item.name + '</span>' +
          '</div>';
      }).join('');

      this.bindTabBar();
      console.log('[App] TabBar 已渲染:', sorted.map(function (i) { return i.name; }).join(', '));
    },

    /**
     * 更新 TabBar 配置（登录后调用）
     */
    updateTabBar: function (shangjia) {
      if (!shangjia || !shangjia.length) return;

      var self = this;
      var mapped = shangjia.map(function (item) {
        return {
          name: item.name,
          sort: item.sort,
          page: self.pageMap[item.page] || item.page,
          mode: item.mode,
          url: item.url ? (item.url.match(/^https?:\/\//) ? item.url : 'https://' + item.url) : null,
        };
      });

      localStorage.setItem('fsj_shangjia_tabs', JSON.stringify(mapped));
      this.renderTabBar(mapped);

      // 登录后自动切换到第一个 tab
      var first = mapped[0];
      if (first) {
        if (first.mode == 1 && first.url) {
          this.switchToWebview(first.url);
        } else {
          this.switchPage(first.page);
        }
      }
    },

    /**
     * 初始加载：判断是否登录，决定显示哪个页面
     */
    loadInitialPage: function () {
      var token = localStorage.getItem('fsj_token');
      var firstItem = this.tabBarConfig[0];
      var page = token && firstItem ? firstItem.page : 'profile';
      console.log('[App] 初始页面:', page, '已登录:', !!token);

      if (token && firstItem && firstItem.mode == 1 && firstItem.url) {
        this.switchToWebview(firstItem.url);
      } else {
        this.switchPage(page);
      }
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
     * 切换到内嵌网页
     */
    switchToWebview: function (url) {
      document.querySelectorAll('#app .page').forEach(function (p) {
        p.classList.remove('active');
      });

      var webviewPage = document.getElementById('page-webview');
      if (webviewPage) {
        webviewPage.classList.add('active');
        var iframe = document.getElementById('webview-iframe');
        if (iframe) iframe.src = url;
      }

      document.querySelectorAll('#tab-bar .tab-item').forEach(function (tab) {
        tab.classList.toggle('active',
          tab.getAttribute('data-mode') === '1' && tab.getAttribute('data-url') === url
        );
      });

      console.log('[App] 切换到 webview:', url);
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
    },

    /**
     * 处理登录结果
     */
    handleLoginResult: function (loginData) {
      // 保存登录信息
      if (loginData.rowid) localStorage.setItem('fsj_token', loginData.rowid);
      if (loginData.name) localStorage.setItem('fsj_user_name', loginData.name);
      if (loginData.shangjia) localStorage.setItem('fsj_shangjia_tabs', JSON.stringify(loginData.shangjia));
      if (loginData.agent) localStorage.setItem('fsj_agent_id', loginData.agent);
      if (loginData.shuohua) localStorage.setItem('fsj_shuohua_id', loginData.shuohua);
      if (loginData.bushuohua) localStorage.setItem('fsj_bushuohua_id', loginData.bushuohua);

      // 更新底部导航栏
      this.updateTabBar(loginData.shangjia);

      // 更新"我的"页面用户信息
      var userCard = document.getElementById('profile-user-card');
      if (userCard) {
        userCard.innerHTML =
          '<div class="avatar">👤</div>' +
          '<div class="nickname">' + (loginData.name || '用户') + '</div>' +
          '<div class="role">已登录</div>';
      }

      console.log('[App] 登录成功:', loginData.name);
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
