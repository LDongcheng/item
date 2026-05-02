/**
 * 智能体聊天页面
 * 参考 embecta chat 页面实现
 */
import AIService from '../services/ai.js';

var AgentPage = {
  messages: [],
  inputText: '',
  isAITyping: false,
  hasStreamingMsg: false,
  scrollToView: '',

  /**
   * 初始化
   */
  init: function () {
    this.renderAgentTopBar();
    this.renderWelcome();
    this.renderQuickActions();
    this.renderInputArea();
    this.bindInputEvents();
    this.bindQuickActionEvents();
    this.bindTopBtnEvents();
  },

  /**
   * 渲染顶部 Agent 信息
   */
  renderAgentTopBar: function () {
    // 默认 Agent 信息
    this.currentAgent = {
      name: '小风',
      avatar: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%232563EB" width="100" height="100"/><text x="50" y="65" font-size="50" fill="white" text-anchor="middle" dominant-baseline="middle">风</text></svg>',
      title: '技术总监'
    };

    var avatarEl = document.getElementById('agent-avatar-top');
    var nameEl = document.getElementById('agent-name-top');
    if (avatarEl) {
      avatarEl.src = this.currentAgent.avatar;
    }
    if (nameEl) {
      nameEl.textContent = this.currentAgent.name;
    }
  },

  /**
   * 绑定顶部按钮
   */
  bindTopBtnEvents: function () {
    var self = this;
    document.querySelectorAll('.agent-top-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.getAttribute('data-panel');
        self.handleTopPanel(panel);
      });
    });
  },

  /**
   * 处理顶部面板
   */
  handleTopPanel: function (panel) {
    switch (panel) {
      case 'tasks':
        // TODO: 打开任务列表面板
        alert('任务队列：查看和管理智能体任务');
        break;
    }
  },

  /**
   * 渲染欢迎页
   */
  renderWelcome: function () {
    var container = document.getElementById('chat-messages');
    if (!container) return;

    container.innerHTML =
      '<div class="welcome-area" id="chat-welcome">' +
        '<div class="welcome-logo"></div>' +
        '<div class="welcome-text">您工作上的得力助手</div>' +
      '</div>' +
      '<div id="chat-message-list"></div>' +
      '<div id="anchor-bottom"></div>';
  },

  /**
   * 渲染快捷操作
   */
  renderQuickActions: function () {
    var container = document.getElementById('quick-actions');
    if (!container) return;

    var actions = [
      { icon: '📊', text: '聊天记录分析', action: 'analysis', highlight: true },
      { icon: '💬', text: '智能问答', action: 'qa' },
      { icon: '', text: '复盘分析', action: 'review' },
      { icon: '📋', text: '创建任务', action: 'task' },
      { icon: '', text: '目标拆解', action: 'goal' },
      { icon: '📈', text: '数据分析', action: 'data' },
    ];

    container.innerHTML = actions.map(function (a) {
      return '<div class="quick-item' + (a.highlight ? ' highlight' : '') + '" data-action="' + a.action + '">' +
        '<span class="quick-icon-text">' + a.icon + '</span>' +
        '<span class="quick-text">' + a.text + '</span>' +
        '</div>';
    }).join('');
  },

  /**
   * 渲染输入区域
   */
  renderInputArea: function () {
    var container = document.getElementById('chat-input-area');
    if (!container) return;

    container.innerHTML =
      '<div class="input-wrapper">' +
        '<textarea class="input-field" id="chat-input" placeholder="输入消息..." rows="1"></textarea>' +
        '<div class="input-actions">' +
          '<div class="attach-btn" id="chat-attach-btn">' +
            '<span class="attach-icon">📎</span>' +
          '</div>' +
          '<div class="right-actions">' +
            '<div class="voice-btn" id="chat-voice-btn">' +
              '<span class="voice-icon">🎤</span>' +
            '</div>' +
            '<div class="send-btn" id="chat-send-btn">发送</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  /**
   * 绑定输入事件
   */
  bindInputEvents: function () {
    var self = this;
    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send-btn');

    if (input) {
      input.addEventListener('input', function () {
        self.inputText = input.value.trim();
        sendBtn.classList.toggle('active', self.inputText.length > 0);
      });

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          self.sendText();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        self.sendText();
      });
    }
  },

  /**
   * 绑定快捷操作事件
   */
  bindQuickActionEvents: function () {
    var self = this;
    var container = document.getElementById('quick-actions');
    if (!container) return;

    container.addEventListener('click', function (e) {
      var item = e.target.closest('.quick-item');
      if (!item) return;

      var action = item.getAttribute('data-action');
      self.handleQuickAction(action);
    });
  },

  /**
   * 处理快捷操作
   */
  handleQuickAction: function (action) {
    var actionTexts = {
      analysis: '📊 聊天记录分析',
      qa: '💬 智能问答',
      review: '复盘分析',
      task: '📋 创建任务',
      goal: '目标拆解',
      data: '📈 数据分析'
    };

    var text = actionTexts[action] || action;
    this.addMessage('user', text);

    var self = this;
    self.createStreamingBubble();
    self.updateStreamingBubble('正在处理...');

    // 调用 Coze 工作流（流式）
    AIService.execute(
      { content: text },
      function (event) {
        if (event.type === 'progress') {
          // 执行进度：显示内容
          self.updateStreamingBubble(event.content || (event.nodeTitle + '...'));
        } else if (event.type === 'result') {
          self.updateStreamingBubble(event.content);
          self.finalizeStreamingBubble();
        } else if (event.type === 'done') {
          self.finalizeStreamingBubble();
        }
      }
    );
  },

  /**
   * 添加消息
   */
  addMessage: function (type, content) {
    var self = this;
    var list = document.getElementById('chat-message-list');
    var welcome = document.getElementById('chat-welcome');
    if (!list) return;

    // 隐藏欢迎页
    if (welcome) {
      welcome.style.display = 'none';
    }

    var msg = {
      id: Date.now(),
      type: type,
      content: content,
      time: this.getCurrentTime(),
      formattedContent: type === 'ai' ? this.parseMarkdown(content) : ''
    };

    this.messages.push(msg);

    // 切换背景
    var container = document.getElementById('chat-container');
    if (container) {
      container.classList.add('has-messages');
    }

    var msgEl = document.createElement('div');
    msgEl.className = 'message-item ' + type;
    msgEl.id = 'msg-' + msg.id;
    msgEl.innerHTML = this.renderMessageBubble(msg);

    list.appendChild(msgEl);
    this.scrollToBottom();
  },

  /**
   * 渲染消息气泡
   */
  renderMessageBubble: function (msg) {
    var avatar = msg.type === 'ai' ? '🤖' : '👤';
    var bubbleContent = '';

    if (msg.type === 'ai') {
      bubbleContent =
        '<div class="message-bubble ' + (msg.isStreaming ? 'streaming' : '') + '">' +
          '<div class="rich-text">' + msg.formattedContent + '</div>' +
          (msg.isStreaming ? '<span class="streaming-cursor">▌</span>' : '') +
        '</div>';
    } else {
      bubbleContent =
        '<div class="message-bubble">' +
          '<text>' + msg.content + '</text>' +
        '</div>';
    }

    return '<div class="message-avatar">' + avatar + '</div>' +
      '<div class="message-content">' +
        bubbleContent +
        '<div class="message-time">' + msg.time + '</div>' +
      '</div>';
  },

  /**
   * Markdown 渲染（使用 marked 库）
   */
  parseMarkdown: function (text) {
    if (!text) return '';
    if (typeof marked !== 'undefined') {
      return marked.parse(text);
    }
    // 降级方案：简易解析
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  },

  /**
   * 发送文字消息
   * 调用 Coze 工作流，流式返回执行进度
   */
  sendText: function () {
    var input = document.getElementById('chat-input');
    if (!input) return;

    var text = input.value.trim();
    if (!text) return;

    this.addMessage('user', text);
    input.value = '';
    this.inputText = '';
    document.getElementById('chat-send-btn').classList.remove('active');

    var self = this;

    // 立即创建气泡，显示"正在处理..."
    self.createStreamingBubble();
    self.updateStreamingBubble('正在处理...');

    // 调用 Coze 工作流（流式）
    AIService.execute(
      { content: text },
      function (event) {
        if (event.type === 'progress') {
          // 执行进度：显示内容
          self.updateStreamingBubble(event.content || (event.nodeTitle + '...'));
        } else if (event.type === 'result') {
          // 最终结果
          self.updateStreamingBubble(event.content);
          self.finalizeStreamingBubble();
        } else if (event.type === 'done') {
          self.finalizeStreamingBubble();
        }
      }
    );
  },

  /**
   * 创建流式气泡（首字到达前）
   */
  createStreamingBubble: function () {
    this.isAITyping = true;
    this.hasStreamingMsg = true;

    var aiMsgId = Date.now();
    this._currentMsgId = aiMsgId;
    var list = document.getElementById('chat-message-list');

    var msgEl = document.createElement('div');
    msgEl.className = 'message-item ai';
    msgEl.id = 'msg-' + aiMsgId;
    msgEl.innerHTML =
      '<div class="message-avatar">🤖</div>' +
      '<div class="message-content">' +
        '<div class="message-bubble streaming">' +
          '<div class="rich-text"></div>' +
          '<span class="streaming-cursor">▌</span>' +
        '</div>' +
        '<div class="message-time">' + this.getCurrentTime() + '</div>' +
      '</div>';

    list.appendChild(msgEl);
    this.scrollToBottom();
  },

  /**
   * 更新流式气泡内容
   */
  updateStreamingBubble: function (text) {
    var list = document.getElementById('chat-message-list');
    var msgEl = document.getElementById('msg-' + this._currentMsgId);
    if (!msgEl) return;

    var bubble = msgEl.querySelector('.rich-text');
    if (bubble) {
      bubble.innerHTML = this.parseMarkdown(text);
    }
    this.scrollToBottom();
  },

  /**
   * 完成流式气泡
   */
  finalizeStreamingBubble: function () {
    this.isAITyping = false;
    this.hasStreamingMsg = false;

    var msgEl = document.getElementById('msg-' + this._currentMsgId);
    if (!msgEl) return;

    var bubble = msgEl.querySelector('.message-bubble');
    var cursor = msgEl.querySelector('.streaming-cursor');
    if (bubble) bubble.classList.remove('streaming');
    if (cursor) cursor.style.display = 'none';
  },

  /**
   * 滚动到底部
   */
  scrollToBottom: function () {
    var anchor = document.getElementById('anchor-bottom');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   * 获取当前时间
   */
  getCurrentTime: function () {
    var now = new Date();
    var h = now.getHours().toString().padStart(2, '0');
    var m = now.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }
};

export default AgentPage;
