/**
 * 更换手机号组件
 * 已登录用户更换绑定手机号
 */
var ChangePhone = {
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
   * 渲染表单
   */
  render: function () {
    if (!this.container) return;

    this.container.innerHTML =
      '<div class="change-phone">' +
        '<div class="change-phone-header">' +
          '<h3>更换手机号</h3>' +
        '</div>' +
        '<div class="change-phone-form">' +
          '<div class="form-group">' +
            '<label class="form-label">原手机号</label>' +
            '<input type="tel" class="form-input" id="old-phone" placeholder="请输入原手机号" maxlength="11" />' +
          '</div>' +
          '<div class="form-group form-row">' +
            '<input type="text" class="form-input" id="old-code" placeholder="原手机验证码" maxlength="6" />' +
            '<button class="btn-code" id="btn-send-old-code">获取验证码</button>' +
          '</div>' +
          '<div class="form-group">' +
            '<label class="form-label">新手机号</label>' +
            '<input type="tel" class="form-input" id="new-phone" placeholder="请输入新手机号" maxlength="11" />' +
          '</div>' +
          '<div class="form-group form-row">' +
            '<input type="text" class="form-input" id="new-code" placeholder="新手机验证码" maxlength="6" />' +
            '<button class="btn-code" id="btn-send-new-code">获取验证码</button>' +
          '</div>' +
          '<button class="btn-confirm" id="btn-confirm-change">确认更换</button>' +
        '</div>' +
      '</div>';
  },

  /**
   * 绑定事件
   */
  bindEvents: function () {
    var self = this;

    // 原手机验证码
    var oldCodeBtn = document.getElementById('btn-send-old-code');
    if (oldCodeBtn) {
      oldCodeBtn.addEventListener('click', function () {
        self.sendCode('old');
      });
    }

    // 新手机验证码
    var newCodeBtn = document.getElementById('btn-send-new-code');
    if (newCodeBtn) {
      newCodeBtn.addEventListener('click', function () {
        self.sendCode('new');
      });
    }

    // 确认更换
    var confirmBtn = document.getElementById('btn-confirm-change');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        self.doChange();
      });
    }
  },

  /**
   * 发送验证码
   */
  sendCode: function (type) {
    var phoneId = type === 'old' ? 'old-phone' : 'new-phone';
    var phone = document.getElementById(phoneId).value.trim();

    if (!this.validatePhone(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    Bridge.postMessage('sendVerifyCode', { phone: phone, type: type });
    this.startCountdown(type);
  },

  /**
   * 确认更换
   */
  doChange: function () {
    var oldPhone = document.getElementById('old-phone').value.trim();
    var oldCode = document.getElementById('old-code').value.trim();
    var newPhone = document.getElementById('new-phone').value.trim();
    var newCode = document.getElementById('new-code').value.trim();

    if (!this.validatePhone(oldPhone)) {
      alert('请输入正确的原手机号');
      return;
    }
    if (!oldCode) {
      alert('请输入原手机验证码');
      return;
    }
    if (!this.validatePhone(newPhone)) {
      alert('请输入正确的新手机号');
      return;
    }
    if (!newCode) {
      alert('请输入新手机验证码');
      return;
    }

    Bridge.postMessage('changePhone', {
      oldPhone: oldPhone,
      oldCode: oldCode,
      newPhone: newPhone,
      newCode: newCode
    });
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
  startCountdown: function (type) {
    var self = this;
    var btnId = type === 'old' ? 'btn-send-old-code' : 'btn-send-new-code';
    var btn = document.getElementById(btnId);
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

export default ChangePhone;
