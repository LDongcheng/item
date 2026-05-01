/**
 * 我的页面
 */
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

    var user = { name: '未登录', role: '请先登录' };
    var token = localStorage.getItem('fsj_token');
    if (token) {
      user.name = '商家用户';
      user.role = '销售代表';
    }

    container.innerHTML =
      '<div class="avatar"><img src="assets/logo.png" alt="avatar" /></div>' +
      '<div class="nickname">' + user.name + '</div>' +
      '<div class="role">' + user.role + '</div>';
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

    var menu = [
      { icon: '', label: '使用指引', action: 'guide' },
      { icon: '', label: '退出登录', action: 'logout', logout: true }
    ];

    container.innerHTML = menu.map(function (item) {
      return '<div class="settings-list-item" data-action="' + item.action + '">' +
        '<span class="name' + (item.logout ? ' logout' : '') + '">' + item.label + '</span>' +
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
   * 处理操作
   */
  handleAction: function (action) {
    switch (action) {
      case 'guide':
        Bridge.postMessage('navigate', { page: 'guide' });
        break;
      case 'logout':
        localStorage.removeItem('fsj_token');
        this.renderUserCard();
        this.renderSettingsList();
        Bridge.postMessage('logout', {});
        break;
    }
  }
};

export default ProfilePage;
