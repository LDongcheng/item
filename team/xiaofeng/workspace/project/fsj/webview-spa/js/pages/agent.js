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
    this.renderWelcome();
    this.renderQuickActions();
    this.renderInputArea();
    this.bindInputEvents();
    this.bindQuickActionEvents();
    this.bindTopBtnEvents();
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
      case 'skills':
        // TODO: 打开技能列表面板
        alert('技能列表：智能体具备的 16 个 HAP 技能');
        break;
      case 'settings':
        // TODO: 打开 SOUL.md 设置面板
        alert('设定：编辑 SOUL.md 个性设置');
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
      qa: '请帮我解答一个问题',
      review: '帮我复盘分析',
      task: '创建任务',
      goal: '目标拆解',
      data: '数据分析'
    };

    var text = actionTexts[action] || action;
    this.addMessage('user', text);

    var self = this;
    self.createStreamingBubble();

    AIService.quickReply(text, function (fullText) {
      self.updateStreamingBubble(fullText);
    }).then(function (fullText) {
      self.finalizeStreamingBubble();
    });
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
   * Markdown 简易解析
   */
  parseMarkdown: function (text) {
    if (!text) return '';

    var html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 标题
    html = html.replace(/^### (.*)$/gm, '<div class="md-h3">$1</div>');
    html = html.replace(/^## (.*)$/gm, '<div class="md-h2">$1</div>');
    html = html.replace(/^# (.*)$/gm, '<div class="md-h1">$1</div>');

    // 分隔线
    html = html.replace(/^---$/gm, '<div class="md-divider"></div>');

    // 无序列表
    html = html.replace(/^- (.*)$/gm, '<div class="md-item">• $1</div>');

    // 有序列表
    html = html.replace(/^(\d+)\. (.*)$/gm, '<div class="md-number-item">$1. $2</div>');

    // 粗体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 高亮
    html = html.replace(/【(.*?)】/g, '<span class="md-highlight">【$1】</span>');

    // 代码
    html = html.replace(/`(.*?)`/g, '<span class="md-code">$1</span>');

    // 换行
    html = html.replace(/\n/g, '<br/>');

    return html;
  },

  /**
   * 发送文字消息
   * 双层响应：快速回复（非流式） + 深度执行
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

    // 先创建气泡，显示"正在处理中..."
    self.createStreamingBubble();

    // 快速回复（非流式，~800ms）
    AIService.quickReply(text, function (fullText) {
      self.updateStreamingBubble(fullText);
    }).then(function (fullText) {
      self.finalizeStreamingBubble();
    });
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
   * 模拟 AI 回复（流式输出）
   */
  simulateAIReply: function (userText) {
    var self = this;

    var reply = this.getAIReply(userText);

    this.isAITyping = true;
    this.hasStreamingMsg = true;

    var aiMsgId = Date.now();
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

    // 模拟流式输出
    var currentIndex = 0;
    var chunkSize = 2;
    var interval = 40;

    var timer = setInterval(function () {
      if (currentIndex < reply.length) {
        var endIndex = Math.min(currentIndex + chunkSize, reply.length);
        var displayed = reply.slice(0, endIndex);
        currentIndex = endIndex;

        var bubble = msgEl.querySelector('.rich-text');
        if (bubble) {
          bubble.innerHTML = self.parseMarkdown(displayed);
        }
        self.scrollToBottom();
      } else {
        clearInterval(timer);
        self.isAITyping = false;
        self.hasStreamingMsg = false;

        var bubble = msgEl.querySelector('.message-bubble');
        var cursor = msgEl.querySelector('.streaming-cursor');
        if (bubble) bubble.classList.remove('streaming');
        if (cursor) cursor.style.display = 'none';
      }
    }, interval);
  },

  /**
   * 获取 AI 回复（简单模拟）
   */
  getAIReply: function (userText) {
    if (userText.includes('你好') || userText.includes('嗨')) {
      return '你好！我是你的AI助理，很高兴为你服务。请问有什么我可以帮你的吗？\n\n我可以帮你：\n- 智能问答\n- 数据分析\n- 复盘总结\n- 任务管理';
    }
    if (userText.includes('数据') || userText.includes('分析')) {
      return '📊 数据分析报告\n\n根据你提供的数据，我分析出以下要点：\n\n【销售趋势】\n本月销售额较上月增长 15%，主要增长来自新客户贡献。\n\n【客户分布】\n- A类客户：30%\n- B类客户：45%\n- C类客户：25%\n\n【建议】\n1. 加大A类客户维护力度\n2. 制定B类客户升级方案\n3. 优化C类客户服务流程';
    }
    return '收到你的消息了！我正在分析中...\n\n基于你的需求，我建议：\n1. 先明确目标\n2. 制定执行计划\n3. 设置关键里程碑\n4. 定期复盘优化\n\n需要我进一步详细说明哪个方面？';
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
