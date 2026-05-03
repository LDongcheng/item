// pages/webview/index.js
const app = getApp();

Page({
  data: {
    webviewUrl: ''
  },

  onLoad() {
    // 首次加载直接设置 URL
    app.globalData.webviewUrl = app.buildWebviewUrl();
    this.setData({ webviewUrl: app.globalData.webviewUrl });
  },

  onShow() {
    // 每次显示都重新设置 URL，强制 webview 重新加载
    this.syncLoginState();
  },

  // 同步登录状态到 webview（用于 onShow 刷新）
  syncLoginState() {
    app.globalData.webviewUrl = app.buildWebviewUrl();
    // 先清空，再设置新 URL，强制 webview 完全重新加载
    var self = this;
    this.setData({ webviewUrl: '' }, function() {
      setTimeout(function() {
        self.setData({ webviewUrl: app.globalData.webviewUrl });
      }, 100);
    });
  },

  // 接收 webview 发来的消息
  onWebviewMessage(e) {
    const msg = e.detail.data;
    if (!msg || msg.length === 0) return;

    const last = msg[msg.length - 1];
    console.log('[WebView] message:', last);

    switch (last.type) {
      case 'login':
        // H5 需要登录，跳转登录页
        wx.navigateTo({ url: '/pages/login/index' });
        break;
      case 'navigate':
        // H5 要求跳转到小程序页面
        if (last.url) {
          wx.navigateTo({ url: last.url });
        }
        break;
      case 'back':
        // H5 要求返回
        wx.navigateBack({ delta: 1 });
        break;
      case 'switchWebview':
        // H5 要求切换 webview 加载的 URL
        if (last.url) {
          // 加上身份信息和缓存破坏参数
          const v = Date.now();
          const r = Math.random().toString(36).substr(2, 8);
          let targetUrl = last.url + '?v=' + v + '&_r=' + r;
          if (app.globalData.openid) {
            targetUrl += `#openid=${app.globalData.openid}&userId=${app.globalData.userId}`;
          }
          this.setData({ webviewUrl: targetUrl });
        }
        break;
    }
  },

  // webview 加载完成
  onWebviewLoad() {
    console.log('[WebView] loaded');
  }
});
