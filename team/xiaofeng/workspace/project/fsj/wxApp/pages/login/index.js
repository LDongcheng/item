// pages/login/index.js
const app = getApp();

Page({
  data: {
    loginLoading: false
  },

  async handleLogin() {
    if (this.data.loginLoading) return;

    this.setData({ loginLoading: true });
    wx.showLoading({ title: '登录中...' });

    const res = await app.login();

    wx.hideLoading();
    this.setData({ loginLoading: false });

    if (res.success) {
      wx.showToast({ title: '登录成功', icon: 'success' });
      // 登录成功，返回 webview
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/webview/index' });
      }, 1000);
    } else {
      wx.showToast({ title: res.error || '登录失败', icon: 'none' });
    }
  }
});
