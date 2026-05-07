/**
 * 消息页面
 */
var MessagePage = {
  /**
   * 初始化
   */
  init: function () {
    this.renderMessageList();
  },

  /**
   * 渲染消息列表
   */
  renderMessageList: function () {
    var container = document.getElementById('message-list');
    if (!container) return;

    // TODO: 从 API 获取消息列表
    var messages = [
      { name: '系统通知', text: '欢迎使用AI赋能商家平台', time: '刚刚', unread: 0, avatar: '' },
      { name: '小粽', text: '今天的技术方案已经确认了', time: '10:30', unread: 2, avatar: '' },
      { name: 'AI助理', text: '你好，有什么可以帮你的吗？', time: '昨天', unread: 0, avatar: '' },
    ];

    var html = messages.map(function (msg) {
      return '<div class="message-list-item">' +
        '<div class="msg-avatar"><img src="' + (msg.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="%232563EB" width="1" height="1"/></svg>') + '" /></div>' +
        '<div class="msg-content">' +
          '<div class="msg-header">' +
            '<div class="msg-name">' + msg.name + '</div>' +
            '<div class="msg-time">' + msg.time + '</div>' +
          '</div>' +
          '<div class="msg-text">' + msg.text + '</div>' +
          (msg.unread > 0 ? '<div class="msg-meta"><span class="msg-badge">' + msg.unread + '</span></div>' : '') +
        '</div>' +
        '</div>';
    }).join('');

    container.innerHTML = html;

    // 绑定点击事件
    var items = container.querySelectorAll('.message-list-item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        var name = item.querySelector('.msg-name').textContent;
        Bridge.postMessage('openChat', { name: name });
      });
    });
  }
};
