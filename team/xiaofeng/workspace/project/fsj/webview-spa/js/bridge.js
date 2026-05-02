/**
 * 小程序通信桥接层
 * 统一处理小程序与 WebView 之间的通信
 */
(function () {
  'use strict';

  var Bridge = {
    // 是否为小程序环境
    isMiniProgram: false,

    /**
     * 初始化桥接
     */
    init: function () {
      var ua = navigator.userAgent.toLowerCase();
      this.isMiniProgram = ua.indexOf('miniprogram') > -1 || ua.indexOf('micromessenger') > -1;

      if (this.isMiniProgram) {
        this.bindMessage();
      }
    },

    /**
     * 接收小程序消息
     */
    bindMessage: function () {
      var self = this;
      if (typeof wx !== 'undefined' && wx.miniProgram) {
        wx.miniProgram.getEnv(function (res) {
          if (res.miniprogram) {
            self.isMiniProgram = true;
          }
        });
      }

      // 监听小程序发来的消息
      window.addEventListener('message', function (e) {
        if (e.data && e.data.type === 'loginSuccess') {
          self.handleLoginSuccess(e.data.data);
        }
      });
    },

    /**
     * 向小程序发送消息
     * @param {string} type - 消息类型
     * @param {object} data - 消息数据
     */
    postMessage: function (type, data) {
      var payload = {
        type: type,
        data: data || {}
      };

      if (this.isMiniProgram && typeof wx !== 'undefined' && wx.miniProgram) {
        wx.miniProgram.postMessage({ data: payload });
      } else {
        // H5环境：通过自定义事件通知
        window.dispatchEvent(new CustomEvent('bridge-post', { detail: payload }));
        console.log('[Bridge] postMessage:', payload);
      }
    },

    /**
     * 设置导航栏标题
     * @param {string} title
     */
    setNavigationBarTitle: function (title) {
      if (this.isMiniProgram && typeof wx !== 'undefined' && wx.miniProgram) {
        wx.miniProgram.postMessage({
          data: { type: 'setNavigationBarTitle', title: title }
        });
      }
    },

    /**
     * 返回上一页
     */
    navigateBack: function () {
      if (this.isMiniProgram && typeof wx !== 'undefined' && wx.miniProgram) {
        wx.miniProgram.navigateBack();
      } else {
        history.back();
      }
    },

    /**
     * 登录请求
     */
    requestLogin: function (loginType) {
      this.postMessage('requestLogin', { loginType: loginType });
    },

    /**
     * 登录成功回调
     * @param {object} loginData - 登录返回数据 { rowid, name, shangjia }
     */
    handleLoginSuccess: function (loginData) {
      if (loginData.rowid) {
        localStorage.setItem('fsj_token', loginData.rowid);
      }
      if (loginData.name) {
        localStorage.setItem('fsj_user_name', loginData.name);
      }
      if (loginData.shangjia) {
        localStorage.setItem('fsj_shangjia_tabs', JSON.stringify(loginData.shangjia));
      }

      // 通知 App 重新渲染 TabBar
      if (window.App && window.App.updateTabBar) {
        window.App.updateTabBar(loginData.shangjia);
      }

      // 刷新我的页面
      if (window.ProfilePage) {
        window.ProfilePage.renderUserCard();
        window.ProfilePage.renderSettingsList();
      }
    },

    /**
     * 切换智能体
     */
    switchAgent: function (agentId) {
      this.postMessage('switchAgent', { agentId: agentId });
    }
  };

  // 初始化
  Bridge.init();

  // 暴露到全局
  window.Bridge = Bridge;
})();
