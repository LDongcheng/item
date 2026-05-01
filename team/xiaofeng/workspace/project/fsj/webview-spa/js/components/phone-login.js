/**
 * 手机号登录组件
 * 手机号 + 短信验证码登录
 */
var PhoneLogin = {
  container: null,
  countdown: 0,
  timer: null,

  /**
   * 初始化
   */
  init: function (container) {
    this.container = container;
    this.render();
    this.bindEvents();
  },

  /**
   * 渲染登录表单
   */
  render: function () {
    if (!this.container) return;

    this.container.innerHTML =
      '<div class="phone-login">' +
        '<div class="phone-login-header">' +
          '<h3>手机号登录</h3>' +
        '</div>' +
        '<div class="phone-login-form">' +
          '<div class="form-group">' +
            '<input type="tel" class="form-input" id="phone-input" placeholder="请输入手机号" maxlength="11" />' +
          '</div>' +
          '<div class="form-group form-row">' +
            '<input type="text" class="form-input" id="code-input" placeholder="请输入验证码" maxlength="6" />' +
            '<button class="btn-code" id="btn-send-code">获取验证码</button>' +
          '</div>' +
          '<button class="btn-login" id="btn-login">登录</button>' +
        '</div>' +
        '<div class="phone-login-footer">' +
          '<span class="login-agreement">登录即表示同意 <a class="link-agreement">用户协议</a> 和 <a class="link-privacy">隐私政策</a></span>' +
        '</div>' +
      '</div>';
  },

  /**
   * 绑定事件
   */
  bindEvents: function () {
    var self = this;

    // 发送验证码
    var sendBtn = document.getElementById('btn-send-code');
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        self.sendCode();
      });
    }

    // 登录
    var loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', function () {
        self.doLogin();
      });
    }
  },

  /**
   * 发送验证码
   */
  sendCode: function () {
    var phone = document.getElementById('phone-input').value.trim();
    if (!this.validatePhone(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    // TODO: 调用API发送验证码
    Bridge.postMessage('sendVerifyCode', { phone: phone });

    // 开始倒计时
    this.startCountdown();
  },

  /**
   * 执行登录
   */
  doLogin: function () {
    var phone = document.getElementById('phone-input').value.trim();
    var code = document.getElementById('code-input').value.trim();

    if (!this.validatePhone(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    if (!code) {
      alert('请输入验证码');
      return;
    }

    // TODO: 调用API登录
    Bridge.postMessage('phoneLogin', { phone: phone, code: code });
  },

  /**
   * 手机号校验
   */
  validatePhone: function (phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  /**
   * 开始倒计时
   */
  startCountdown: function () {
    var self = this;
    var btn = document.getElementById('btn-send-code');
    if (!btn) return;

    this.countdown = 60;
    btn.disabled = true;
    btn.textContent = this.countdown + 's';

    this.timer = setInterval(function () {
      self.countdown--;
      if (self.countdown <= 0) {
        clearInterval(self.timer);
        btn.disabled = false;
        btn.textContent = '获取验证码';
      } else {
        btn.textContent = self.countdown + 's';
      }
    }, 1000);
  }
};

export default PhoneLogin;
