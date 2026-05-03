// wxApp - webview 壳小程序
App({
  globalData: {
    openid: '',
    userId: '',
    userInfo: null,
    webviewUrl: ''
  },

  onLaunch() {
    this.checkLogin();
    this.globalData.webviewUrl = this.buildWebviewUrl();
  },

  // 检查登录状态
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.openid) {
      this.globalData.openid = userInfo.openid;
      this.globalData.userId = userInfo.userId || '';
      this.globalData.userInfo = userInfo;
      this.globalData.webviewUrl = this.buildWebviewUrl();
    }
  },

  // 构建 webview URL（带身份信息和缓存破坏）
  buildWebviewUrl() {
    // TODO: 替换为实际部署地址
    const baseUrl = 'https://100000whys.cn/fsj_webview/';
    const v = Date.now();
    const r = Math.random().toString(36).substr(2, 8);
    let url = `${baseUrl}?v=${v}&_r=${r}`;

    // 通过 hash 传递身份信息
    if (this.globalData.openid) {
      url += `#openid=${this.globalData.openid}&userId=${this.globalData.userId}`;
    }
    return url;
  },

  // 登录
  async login() {
    try {
      const loginRes = await wx.login();
      if (!loginRes.code) {
        return { success: false, error: '获取登录码失败' };
      }

      const authRes = await this.code2session(loginRes.code);
      if (!authRes.success) {
        return authRes;
      }

      const userRes = await this.getOrCreateUser(authRes.openid);
      if (userRes.success) {
        this.globalData.openid = authRes.openid;
        this.globalData.userId = userRes.userId || '';
        this.globalData.userInfo = userRes.data;
        wx.setStorageSync('userInfo', {
          openid: authRes.openid,
          userId: this.globalData.userId,
          ...userRes.data
        });
        this.globalData.webviewUrl = this.buildWebviewUrl();
      }
      return userRes;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // 调用后端 code2session 获取 openid
  code2session(code) {
    return new Promise((resolve) => {
      // TODO: 替换为实际后端地址
      wx.request({
        url: 'https://100000whys.cn/fsj/api/user/code2session',
        method: 'POST',
        data: { code },
        success: (res) => {
          if (res.data?.code === 200) {
            resolve({ success: true, openid: res.data.data.openid });
          } else {
            resolve({ success: false, error: res.data?.message || '登录失败' });
          }
        },
        fail: (err) => {
          resolve({ success: false, error: '网络请求失败' });
        }
      });
    });
  },

  // 获取或创建用户（明道云）
  getOrCreateUser(openid) {
    return new Promise((resolve) => {
      // 明道云 HAP API
      wx.request({
        url: 'https://api.mingdao.com/mcp/v3/open/worksheet/rows?appkey=YOUR_APPKEY&sign=YOUR_SIGN',
        method: 'POST',
        data: {
          worksheetId: 'YOUR_USER_WORKSHEET_ID',
          pageSize: 1,
          filters: [{
            field: 'openid',
            operator: 'eq',
            value: openid
          }]
        },
        success: (res) => {
          if (res.data?.success && res.data.rows?.length > 0) {
            // 用户已存在
            const user = res.data.rows[0];
            resolve({
              success: true,
              userId: user.rowid,
              data: user
            });
          } else {
            // 创建新用户
            this.createUser(openid).then(createRes => {
              resolve(createRes);
            });
          }
        },
        fail: () => {
          resolve({ success: false, error: '查询用户失败' });
        }
      });
    });
  },

  // 创建用户记录
  createUser(openid) {
    return new Promise((resolve) => {
      wx.request({
        url: 'https://api.mingdao.com/mcp/v3/open/worksheet/row?appkey=YOUR_APPKEY&sign=YOUR_SIGN',
        method: 'POST',
        data: {
          worksheetId: 'YOUR_USER_WORKSHEET_ID',
          fields: [
            { id: 'openid', value: openid }
          ]
        },
        success: (res) => {
          if (res.data?.success) {
            resolve({
              success: true,
              userId: res.data.rowid,
              data: res.data
            });
          } else {
            resolve({ success: false, error: '创建用户失败' });
          }
        },
        fail: () => {
          resolve({ success: false, error: '网络请求失败' });
        }
      });
    });
  },

  // 退出登录
  logout() {
    this.globalData.openid = '';
    this.globalData.userId = '';
    this.globalData.userInfo = null;
    this.globalData.webviewUrl = '';
    wx.removeStorageSync('userInfo');
  }
});
