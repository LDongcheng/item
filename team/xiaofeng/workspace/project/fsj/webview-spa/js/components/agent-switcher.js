/**
 * 智能体切换组件
 * 用于在多个智能体之间切换，加载对应智能体的12维记忆数据
 */
var AgentSwitcher = {
  agents: [],
  currentAgentId: null,

  /**
   * 初始化
   */
  init: function (container, options) {
    this.container = container;
    this.options = options || {};
    this.loadAgents();
  },

  /**
   * 加载智能体列表
   * TODO: 从 12维系统获取该商家的智能体列表
   */
  loadAgents: function () {
    var self = this;

    // 模拟数据
    this.agents = [
      { id: 'agent-1', name: '小粽', title: '总经理', avatar: '', status: 'online' },
      { id: 'agent-2', name: '童小智', title: '技术总监', avatar: '', status: 'online' },
      { id: 'agent-3', name: '阿说', title: '运营总监', avatar: '', status: 'offline' },
    ];

    this.render();
  },

  /**
   * 渲染智能体列表
   */
  render: function () {
    var self = this;
    if (!this.container) return;

    var html = '<div class="agent-switcher">' +
      '<div class="agent-switcher-header">' +
        '<span class="agent-switcher-title">选择智能体</span>' +
      '</div>' +
      '<div class="agent-switcher-list">' +
        this.agents.map(function (agent) {
          return '<div class="agent-switcher-item' + (agent.id === self.currentAgentId ? ' active' : '') + '" data-agent-id="' + agent.id + '">' +
            '<div class="agent-switcher-avatar">' +
              '<img src="' + (agent.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="%2300E5D0" width="1" height="1"/></svg>') + '" />' +
              '<span class="agent-switcher-status ' + agent.status + '"></span>' +
            '</div>' +
            '<div class="agent-switcher-info">' +
              '<div class="agent-switcher-name">' + agent.name + '</div>' +
              '<div class="agent-switcher-role">' + agent.title + '</div>' +
            '</div>' +
            '<span class="agent-switcher-check">' + (agent.id === self.currentAgentId ? '✓' : '') + '</span>' +
            '</div>';
        }).join('') +
      '</div>' +
      '</div>';

    this.container.innerHTML = html;
    this.bindEvents();
  },

  /**
   * 绑定事件
   */
  bindEvents: function () {
    var self = this;
    var items = this.container.querySelectorAll('.agent-switcher-item');

    items.forEach(function (item) {
      item.addEventListener('click', function () {
        var agentId = item.getAttribute('data-agent-id');
        self.switchTo(agentId);
      });
    });
  },

  /**
   * 切换到指定智能体
   */
  switchTo: function (agentId) {
    var self = this;
    var agent = this.agents.find(function (a) { return a.id === agentId; });
    if (!agent) return;

    this.currentAgentId = agentId;

    // 通知小程序切换智能体
    Bridge.switchAgent(agentId);

    // 重新渲染
    this.render();

    // 通知小程序加载对应智能体的12维记忆
    Bridge.postMessage('loadAgentMemory', { agentId: agentId });
  }
};

export default AgentSwitcher;
