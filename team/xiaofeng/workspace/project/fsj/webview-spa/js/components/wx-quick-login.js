/**
 * 微信一键登录组件
 * 小程序授权一键登录
 */
var WxQuickLogin = {
  container: null,

  /**
   * 初始化
   */
  init: function (container) {
    this.container = container;
    this.render();
    this.bindEvents();
  },

  /**
   * 渲染登录按钮
   */
  render: function () {
    if (!this.container) return;

    this.container.innerHTML =
      '<div class="wx-quick-login">' +
        '<div class="wx-quick-login-header">' +
          '<h3>微信登录</h3>' +
          '<p class="wx-quick-login-desc">授权后即可完成登录</p>' +
        '</div>' +
        '<button class="btn-wx-login" id="btn-wx-login">' +
          '<span class="btn-wx-icon"></span>' +
          '<span>微信一键登录</span>' +
        '</button>' +
      '</div>';
  },

  /**
   * 绑定事件
   */
  bindEvents: function () {
    var self = this;
    var btn = document.getElementById('btn-wx-login');
    if (btn) {
      btn.addEventListener('click', function () {
        self.doLogin();
      });
    }
  },

  /**
   * 执行登录
   */
  doLogin: function () {
    // 通知小程序触发授权登录
    Bridge.requestLogin('wx');
  }
};

export default WxQuickLogin;
