/**
 * 商家登录组件
 * 商家身份认证入口，支持手机号和小程序一键登录
 */
var MerchantLogin = {
  container: null,
  mode: 'phone', // 'phone' | 'wx'

  /**
   * 初始化
   * @param {HTMLElement} container
   * @param {object} options
   */
  init: function (container, options) {
    this.container = container;
    this.options = options || {};
    this.render();
    this.bindEvents();
  },

  /**
   * 渲染登录界面
   */
  render: function () {
    if (!this.container) return;

    this.container.innerHTML =
      '<div class="merchant-login">' +
        '<div class="merchant-login-logo">' +
          '<div class="logo-icon"></div>' +
          '<h2 class="logo-title">AI赋能商家平台</h2>' +
          '<p class="logo-subtitle">商家登录</p>' +
        '</div>' +
        '<div class="merchant-login-tabs">' +
          '<span class="merchant-login-tab active" data-mode="phone">手机号登录</span>' +
          '<span class="merchant-login-tab" data-mode="wx">微信登录</span>' +
        '</div>' +
        '<div class="merchant-login-body" id="login-body">' +
          '<!-- 登录表单容器 -->' +
        '</div>' +
      '</div>';

    // 默认渲染手机号登录
    this.switchMode('phone');
  },

  /**
   * 切换登录方式
   */
  switchMode: function (mode) {
    this.mode = mode;
    var body = document.getElementById('login-body');
    if (!body) return;

    if (mode === 'phone') {
      this.renderPhoneLogin(body);
    } else {
      this.renderWxLogin(body);
    }

    // 更新Tab激活态
    var tabs = this.container.querySelectorAll('.merchant-login-tab');
    tabs.forEach(function (tab) {
      if (tab.getAttribute('data-mode') === mode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  },

  /**
   * 渲染手机号登录
   */
  renderPhoneLogin: function (container) {
    container.innerHTML =
      '<div class="login-form">' +
        '<div class="form-group">' +
          '<input type="tel" class="form-input" id="ml-phone" placeholder="请输入手机号" maxlength="11" />' +
        '</div>' +
        '<div class="form-group form-row">' +
          '<input type="text" class="form-input" id="ml-code" placeholder="请输入验证码" maxlength="6" />' +
          '<button class="btn-code" id="ml-send-code">获取验证码</button>' +
        '</div>' +
        '<button class="btn-login" id="ml-login-btn">登录</button>' +
        '<div class="login-footer">' +
          '<span class="login-agreement">登录即表示同意 <a class="link-agreement">用户协议</a> 和 <a class="link-privacy">隐私政策</a></span>' +
        '</div>' +
      '</div>';

    this.bindPhoneEvents();
  },

  /**
   * 渲染微信登录
   */
  renderWxLogin: function (container) {
    container.innerHTML =
      '<div class="login-form login-form-wx">' +
        '<div class="wx-login-icon"></div>' +
        '<p class="wx-login-desc">点击按钮授权登录</p>' +
        '<button class="btn-wx-login" id="ml-wx-login-btn">' +
          '<span>微信一键登录</span>' +
        '</button>' +
        '<div class="login-footer">' +
          '<span class="login-agreement">登录即表示同意 <a class="link-agreement">用户协议</a> 和 <a class="link-privacy">隐私政策</a></span>' +
        '</div>' +
      '</div>';

    this.bindWxEvents();
  },

  /**
   * 绑定Tab切换事件
   */
  bindEvents: function () {
    var self = this;
    var tabs = this.container.querySelectorAll('.merchant-login-tab');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var mode = tab.getAttribute('data-mode');
        self.switchMode(mode);
      });
    });
  },

  /**
   * 绑定手机号登录事件
   */
  bindPhoneEvents: function () {
    var self = this;

    var sendBtn = document.getElementById('ml-send-code');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        self.sendCode();
      });
    }

    var loginBtn = document.getElementById('ml-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        self.doPhoneLogin();
      });
    }
  },

  /**
   * 绑定微信登录事件
   */
  bindWxEvents: function () {
    var self = this;
    var btn = document.getElementById('ml-wx-login-btn');
    if (btn) {
      btn.addEventListener('click', function () {
        self.doWxLogin();
      });
    }
  },

  /**
   * 发送验证码
   */
  sendCode: function () {
    var phone = document.getElementById('ml-phone').value.trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    Bridge.postMessage('sendVerifyCode', { phone: phone });

    var btn = document.getElementById('ml-send-code');
    var countdown = 60;
    btn.disabled = true;
    btn.textContent = countdown + 's';

    var timer = setInterval(function () {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = '获取验证码';
      } else {
        btn.textContent = countdown + 's';
      }
    }, 1000);
  },

  /**
   * 手机号登录
   */
  doPhoneLogin: function () {
    var phone = document.getElementById('ml-phone').value.trim();
    var code = document.getElementById('ml-code').value.trim();

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }
    if (!code) {
      alert('请输入验证码');
      return;
    }

    Bridge.postMessage('merchantLogin', {
      type: 'phone',
      phone: phone,
      code: code
    });
  },

  /**
   * 微信登录
   */
  doWxLogin: function () {
    Bridge.requestLogin('wx');
  }
};

export default MerchantLogin;
