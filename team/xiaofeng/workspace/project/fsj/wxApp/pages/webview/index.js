// pages/webview/index.js
const app = getApp();

Page({
  data: {
    webviewUrl: '',
    showWebView: false
  },

  onShow() {
    const self = this;
    // 隐藏 webview 再重建，强制完全刷新（销毁 DOM 节点）
    this.setData({ showWebView: false }, function() {
      // 确保 setData 完成后再重新设置
      setTimeout(function() {
        self.syncLoginState();
        self.setData({ showWebView: true });
      }, 200);
    });
  },

  onLoad() {
    // 首次加载直接显示
    this.syncLoginState();
    this.setData({ showWebView: true });
  },

  // 同步登录状态到 webview
  syncLoginState() {
    app.globalData.webviewUrl = app.buildWebviewUrl();
    this.setData({
      webviewUrl: app.globalData.webviewUrl
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
