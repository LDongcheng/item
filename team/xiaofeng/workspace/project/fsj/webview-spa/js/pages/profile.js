/**
 * 我的页面
 */
import LoginService from '../services/login.js';

var ProfilePage = {
  /**
   * 初始化
   */
  init: function () {
    this.renderUserCard();
    this.renderStatsCard();
    this.renderSettingsList();
  },

  /**
   * 渲染用户卡片
   */
  renderUserCard: function () {
    var container = document.getElementById('profile-user-card');
    if (!container) return;

    var token = localStorage.getItem('fsj_token');
    var userName = localStorage.getItem('fsj_user_name') || '商家用户';
    var isLogin = !!token;
    var user = isLogin ? { name: userName, role: '销售代表' } : { name: '未登录', role: '请先登录' };

    container.innerHTML =
      '<div class="avatar"><img src="assets/logo.png" alt="avatar" /></div>' +
      '<div class="nickname">' + user.name + '</div>' +
      '<div class="role">' + user.role + '</div>';

    // 未登录时，点击卡片弹出登录弹窗
    if (!isLogin) {
      var self = this;
      container.classList.add('login-prompt');
      container.addEventListener('click', function () {
        self.renderLoginModal();
      });
    } else {
      container.classList.remove('login-prompt');
    }
  },

  /**
   * 渲染数据统计
   */
  renderStatsCard: function () {
    var container = document.getElementById('profile-stats');
    if (!container) return;

    var stats = [
      { num: '128', label: '本月拜访' },
      { num: '23', label: '跟进项目' },
      { num: '86', label: '完成任务' },
    ];

    container.innerHTML = stats.map(function (s) {
      return '<div class="stat-item">' +
        '<div class="stat-num">' + s.num + '</div>' +
        '<div class="stat-label">' + s.label + '</div>' +
        '</div>';
    }).join('');
  },

  /**
   * 渲染设置列表
   */
  renderSettingsList: function () {
    var container = document.getElementById('profile-settings');
    if (!container) return;

    var token = localStorage.getItem('fsj_token');
    var menu = [];

    if (!token) {
      menu.push({ icon: '', label: '登录', action: 'login', primary: true });
    }

    menu.push({ icon: '', label: '使用指引', action: 'guide' });

    if (token) {
      menu.push({ icon: '', label: '退出登录', action: 'logout', logout: true });
    }

    container.innerHTML = menu.map(function (item) {
      return '<div class="settings-list-item" data-action="' + item.action + '">' +
        '<span class="name' + (item.logout ? ' logout' : '') + (item.primary ? ' primary-text' : '') + '">' + item.label + '</span>' +
        '<span class="arrow">›</span>' +
        '</div>';
    }).join('');

    var self = this;
    container.querySelectorAll('.settings-list-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var action = el.getAttribute('data-action');
        self.handleAction(action);
      });
    });
  },

  /**
   * 渲染登录弹窗
   */
  renderLoginModal: function () {
    var existing = document.getElementById('login-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML =
      '<div class="modal-content login-modal">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">登录</h3>' +
          '<span class="modal-close" id="login-modal-close">✕</span>' +
        '</div>' +
        '<div class="modal-tabs" id="login-modal-tabs">' +
          '<div class="modal-tab active" data-mode="wx">微信授权登录</div>' +
          '<div class="modal-tab" data-mode="account">账号密码登录</div>' +
        '</div>' +
        '<div class="modal-body" id="login-modal-body">' +
          '<!-- 登录表单容器 -->' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    this.bindLoginModalEvents();
    this.switchLoginMode('wx');
  },

  /**
   * 切换登录方式（弹窗内）
   */
  switchLoginMode: function (mode) {
    var body = document.getElementById('login-modal-body');
    var tabs = document.querySelectorAll('#login-modal-tabs .modal-tab');
    if (!body) return;

    tabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-mode') === mode);
    });

    if (mode === 'wx') {
      body.innerHTML =
        '<div class="login-wx-modal">' +
          '<div class="wx-icon-box"><img class="wx-login-img" src="assets/weichat.png" alt="微信登录" /></div>' +
          '<p class="wx-login-desc">点击按钮授权登录</p>' +
          '<button class="btn-wx-login" id="modal-wx-login-btn">' +
            '<span>微信授权登录</span>' +
          '</button>' +
          '<p class="login-hint">微信登录后将自动关联您的账号</p>' +
        '</div>';

      var self = this;
      document.getElementById('modal-wx-login-btn').addEventListener('click', function () {
        Bridge.requestLogin('wx');
        self.closeLoginModal();
      });
    } else {
      body.innerHTML =
        '<div class="login-account-modal">' +
          '<div class="form-group">' +
            '<label class="form-label">手机号</label>' +
            '<input type="tel" class="form-input" id="modal-account-input" placeholder="请输入手机号" maxlength="11" />' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">密码</label>' +
            '<input type="password" class="form-input" id="modal-password-input" placeholder="请输入密码" />' +
          '</div>' +
          '<button class="btn-account-login" id="modal-account-login-btn"><span>登 录</span></button>' +
          '<p class="login-hint">请输入注册时的手机号和密码</p>' +
        '</div>';

      var self = this;
      document.getElementById('modal-account-login-btn').addEventListener('click', function () {
        var phone = document.getElementById('modal-account-input').value.trim();
        var pwd = document.getElementById('modal-password-input').value.trim();
        if (!/^1[3-9]\d{9}$/.test(phone)) {
          alert('请输入正确的手机号');
          return;
        }
        if (!pwd) {
          alert('请输入密码');
          return;
        }

        // 显示加载状态
        var loginBtn = document.getElementById('modal-account-login-btn');
        loginBtn.textContent = '登录中...';
        loginBtn.disabled = true;

        LoginService.accountLogin(phone, pwd)
          .then(function (loginData) {
            // 登录成功，处理返回数据
            self.handleLoginResult(loginData);
          })
          .catch(function (err) {
            alert('登录失败: ' + err.message);
          })
          .finally(function () {
            // 恢复按钮状态
            loginBtn.innerHTML = '<span>登 录</span>';
            loginBtn.disabled = false;
          });
      });
    }
  },

  /**
   * 绑定弹窗事件
   */
  bindLoginModalEvents: function () {
    var self = this;
    var modal = document.getElementById('login-modal');
    var closeBtn = document.getElementById('login-modal-close');

    closeBtn.addEventListener('click', function () {
      self.closeLoginModal();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        self.closeLoginModal();
      }
    });

    document.querySelectorAll('#login-modal-tabs .modal-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var mode = tab.getAttribute('data-mode');
        self.switchLoginMode(mode);
      });
    });
  },

  /**
   * 关闭登录弹窗
   */
  closeLoginModal: function () {
    var modal = document.getElementById('login-modal');
    if (modal) modal.remove();
  },

  /**
   * 处理登录结果
   * @param {object} loginData - 登录返回数据 { name, rowid, shangjia }
   */
  handleLoginResult: function (loginData) {
    // 保存登录信息
    if (loginData.rowid) {
      localStorage.setItem('fsj_token', loginData.rowid);
    }
    if (loginData.name) {
      localStorage.setItem('fsj_user_name', loginData.name);
    }
    if (loginData.shangjia) {
      localStorage.setItem('fsj_shangjia_tabs', JSON.stringify(loginData.shangjia));
    }

    // 关闭登录弹窗
    this.closeLoginModal();

    // 更新我的页面
    this.renderUserCard();
    this.renderSettingsList();

    // 更新底部导航栏
    if (window.App && window.App.updateTabBar) {
      window.App.updateTabBar(loginData.shangjia);
    }

    // 提示登录成功
    alert('登录成功，欢迎 ' + (loginData.name || '回来'));
  },

  /**
   * 处理操作
   */
  handleAction: function (action) {
    switch (action) {
      case 'login':
        this.renderLoginModal();
        break;
      case 'guide':
        Bridge.postMessage('navigate', { page: 'guide' });
        break;
      case 'logout':
        localStorage.removeItem('fsj_token');
        localStorage.removeItem('fsj_user_name');
        this.renderUserCard();
        this.renderSettingsList();
        Bridge.postMessage('logout', {});
        break;
    }
  }
};

export default ProfilePage;
