/**
 * 智能体聊天页面
 * 参考 embecta chat 页面实现
 */
import AIService from '../services/ai.js';
import AgentVideoService from '../services/agentVideo.js';
import TtsService from '../services/tts.js';

var AgentPage = {
  messages: [],
  inputText: '',
  isAITyping: false,
  hasStreamingMsg: false,
  scrollToView: '',
  // 沉浸模式视频资源
  videoResources: null,
  // TTS 语音
  ttsEnabled: false,
  ttsCurrentAudio: null,

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
    this.restoreAgentMode();
    this.loadTtsSetting();
  },

  /**
   * 加载 TTS 设置
   */
  loadTtsSetting: function () {
    var stored = localStorage.getItem('fsj_tts_enabled');
    this.ttsEnabled = stored === '1';
    // 更新语音按钮样式
    var voiceBtn = document.getElementById('chat-voice-btn');
    if (voiceBtn) {
      voiceBtn.classList.toggle('tts-on', this.ttsEnabled);
    }
  },

  /**
   * 切换 TTS
   */
  toggleTts: function () {
    this.ttsEnabled = !this.ttsEnabled;
    localStorage.setItem('fsj_tts_enabled', this.ttsEnabled ? '1' : '0');

    var voiceBtn = document.getElementById('chat-voice-btn');
    if (voiceBtn) {
      voiceBtn.classList.toggle('tts-on', this.ttsEnabled);
    }

    if (!this.ttsEnabled) {
      TtsService.stop();
    }
  },

  /**
   * 恢复 Agent 模式
   */
  restoreAgentMode: function () {
    var mode = localStorage.getItem('fsj_agent_mode') || '0';
    if (mode === '1') {
      this.loadVideoResources();
    }
  },

  /**
   * 加载视频资源（登录后的 Agent 有 shuohua/bushuohua ID）
   */
  loadVideoResources: function () {
    var self = this;
    var shuohuaId = localStorage.getItem('fsj_shuohua_id');
    var bushuohuaId = localStorage.getItem('fsj_bushuohua_id');

    console.log('[AgentPage] loadVideoResources, shuohua:', shuohuaId, ', bushuohua:', bushuohuaId);

    if (!shuohuaId || !bushuohuaId) {
      // 没有视频ID，先渲染默认场景
      console.log('[AgentPage] 没有视频ID，渲染默认场景');
      this.renderImmersiveMode();
      return;
    }

    AgentVideoService.getAllResources(shuohuaId, bushuohuaId)
      .then(function (resources) {
        console.log('[AgentPage] 视频资源加载成功:', resources);
        self.videoResources = resources;
        // 渲染沉浸模式（此时已有视频URL）
        self.renderImmersiveMode();
      })
      .catch(function (e) {
        console.warn('[AgentPage] 视频资源加载失败:', e);
        self.renderImmersiveMode();
      });
  },

  /**
   * 切换 Agent 说话/不说话视频
   */
  switchAgentVideo: function (speaking) {
    var videoEl = document.getElementById('immersive-agent-video');
    if (!videoEl || !this.videoResources) return;

    var url = speaking ? this.videoResources.shuohua : this.videoResources.bushuohua;
    if (!url) return;

    // 如果当前已经在播同一个视频，不切换
    if (videoEl.src && videoEl.src.indexOf(url.split('?')[0]) !== -1) return;

    videoEl.src = url;
    videoEl.play().catch(function () {});
  },

  /**
   * 渲染顶部 Agent 信息
   */
  renderAgentTopBar: function () {
    // 优先使用登录后的 Agent ID，否则使用默认值
    var agentId = localStorage.getItem('fsj_agent_id');

    this.currentAgent = {
      id: agentId || '',
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
      case 'settings':
        this.renderSettingsModal();
        break;
    }
  },

  /**
   * 渲染设置弹窗
   */
  renderSettingsModal: function () {
    var existing = document.getElementById('agent-settings-modal');
    if (existing) existing.remove();

    var currentMode = localStorage.getItem('fsj_agent_mode') || '0';
    var ttsOn = this.ttsEnabled;

    var modal = document.createElement('div');
    modal.id = 'agent-settings-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML =
      '<div class="modal-content agent-settings-modal">' +
        '<div class="modal-header">' +
          '<h3 class="modal-title">设置</h3>' +
          '<span class="modal-close" id="agent-settings-close">✕</span>' +
        '</div>' +
        '<div class="agent-settings-body">' +
          '<div class="settings-section">' +
            '<div class="settings-section-title">语音朗读</div>' +
            '<div class="settings-section-desc">AI 回复后用星宝语音朗读</div>' +
            '<div class="toggle-row">' +
              '<span class="toggle-label">语音开关</span>' +
              '<div class="toggle-switch' + (ttsOn ? ' on' : '') + '" id="tts-toggle">' +
                '<div class="toggle-knob"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="settings-divider"></div>' +
          '<div class="settings-section">' +
            '<div class="settings-section-title">灵魂设置</div>' +
            '<div class="settings-section-desc">配置智能体的性格、语气和知识库</div>' +
            '<div class="settings-action-btn" data-action="soul">进入设置 ›</div>' +
          '</div>' +
          '<div class="settings-divider"></div>' +
          '<div class="settings-section">' +
            '<div class="settings-section-title">模式切换</div>' +
            '<div class="mode-switch-row">' +
              '<div class="mode-option' + (currentMode === '0' ? ' active' : '') + '" data-mode="0">' +
                '<span class="mode-icon">💬</span>' +
                '<span class="mode-name">普通模式</span>' +
              '</div>' +
              '<div class="mode-option' + (currentMode === '1' ? ' active' : '') + '" data-mode="1">' +
                '<span class="mode-icon">🏠</span>' +
                '<span class="mode-name">沉浸模式</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    this.bindSettingsModalEvents();
  },

  /**
   * 绑定设置弹窗事件
   */
  bindSettingsModalEvents: function () {
    var self = this;
    var modal = document.getElementById('agent-settings-modal');
    var closeBtn = document.getElementById('agent-settings-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        self.closeSettingsModal();
      });
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          self.closeSettingsModal();
        }
      });
    }

    // 语音开关
    var ttsToggle = document.getElementById('tts-toggle');
    if (ttsToggle) {
      ttsToggle.addEventListener('click', function () {
        self.toggleTts();
        ttsToggle.classList.toggle('on', self.ttsEnabled);
      });
    }

    // 模式切换
    document.querySelectorAll('.mode-option').forEach(function (el) {
      el.addEventListener('click', function () {
        var mode = el.getAttribute('data-mode');
        self.switchAgentMode(mode);
      });
    });

    // 灵魂设置
    var soulBtn = document.querySelector('.settings-action-btn[data-action="soul"]');
    if (soulBtn) {
      soulBtn.addEventListener('click', function () {
        alert('灵魂设置：配置智能体的性格、语气和知识库（开发中）');
      });
    }
  },

  /**
   * 关闭设置弹窗
   */
  closeSettingsModal: function () {
    var modal = document.getElementById('agent-settings-modal');
    if (modal) modal.remove();
  },

  /**
   * 切换 Agent 模式
   */
  switchAgentMode: function (mode) {
    localStorage.setItem('fsj_agent_mode', mode);

    // 更新按钮激活态
    document.querySelectorAll('.mode-option').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-mode') === mode);
    });

    // 切换页面渲染
    if (mode === '1') {
      // 先清理旧场景，再加载新资源
      this.removeImmersiveMode();
      this.loadVideoResources();
    } else {
      this.removeImmersiveMode();
    }
  },

  /**
   * 渲染沉浸模式
   */
  renderImmersiveMode: function () {
    var container = document.getElementById('chat-container');
    if (!container) return;

    // 检查是否已经渲染过
    var existing = document.getElementById('agent-immersive-scene');
    if (existing) return;

    var bgStyle = '';
    var videoSrc = '';
    var showVideo = false;

    if (this.videoResources) {
      if (this.videoResources.bgImage) {
        bgStyle = 'background-image: url(\'' + this.videoResources.bgImage + '\'); background-size: cover; background-position: center;';
      }
      if (this.videoResources.bushuohua) {
        videoSrc = this.videoResources.bushuohua;
        showVideo = true;
      }
    }

    var scene = document.createElement('div');
    scene.id = 'agent-immersive-scene';
    scene.className = 'immersive-scene';
    scene.innerHTML =
      '<div class="immersive-bg" id="immersive-bg" style="' + bgStyle + '"></div>' +
      '<div class="immersive-agent" id="immersive-agent">' +
        (showVideo
          ? '<video id="immersive-agent-video" class="agent-video" src="' + videoSrc + '" autoplay muted loop playsinline></video>'
          : '<div class="agent-character"></div>') +
      '</div>';

    // 插入到聊天容器最前面
    container.insertBefore(scene, container.firstChild);

    // 标记沉浸模式已激活
    container.classList.add('immersive-active');

    // 确保视频自动播放
    var videoEl = document.getElementById('immersive-agent-video');
    if (videoEl) {
      videoEl.play().catch(function (e) {
        console.warn('[AgentPage] 视频自动播放失败:', e);
      });
    }
  },

  /**
   * 移除沉浸模式
   */
  removeImmersiveMode: function () {
    var container = document.getElementById('chat-container');
    if (!container) return;

    // 先暂停视频
    var video = document.getElementById('immersive-agent-video');
    if (video) {
      video.pause();
      video.src = '';
    }

    var scene = document.getElementById('agent-immersive-scene');
    if (scene) scene.remove();

    container.classList.remove('immersive-active');
    this.videoResources = null;
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
      { icon: '📊', text: '错题分析', action: 'analysis', highlight: true },
      { icon: '💬', text: '智能问答', action: 'qa' },
      { icon: '', text: '数学史', action: 'review' },
      { icon: '📋', text: '个性化学习', action: 'task' },
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

    // 语音按钮
    var voiceBtn = document.getElementById('chat-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', function () {
        self.toggleTts();
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
      analysis: '📊 错题分析',
      qa: '💬 智能问答',
      review: '数学史',
      task: '📋 个性化学习',
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
          // 沉浸模式：切换为说话视频
          self.switchAgentVideo(true);
        } else if (event.type === 'result') {
          self.updateStreamingBubble(event.content);
          self.finalizeStreamingBubble();
        } else if (event.type === 'done') {
          self.finalizeStreamingBubble();
          // 沉浸模式：切回不说话视频
          self.switchAgentVideo(false);
          // TTS：播放 AI 回复内容
          self.playAiVoice(event.content || '');
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
          // 沉浸模式：切换为说话视频
          self.switchAgentVideo(true);
        } else if (event.type === 'result') {
          // 最终结果
          self.updateStreamingBubble(event.content);
          self.finalizeStreamingBubble();
        } else if (event.type === 'done') {
          self.finalizeStreamingBubble();
          // 沉浸模式：切回不说话视频
          self.switchAgentVideo(false);
          // TTS：播放 AI 回复内容
          self.playAiVoice(event.content || '');
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
   * 播放 AI 回复语音（TTS）
   * @param {string} text - 要播放的文字
   */
  playAiVoice: function (text) {
    if (!this.ttsEnabled || !text) return;

    // 移除 Markdown 格式，只保留纯文本
    var plainText = text
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s?/g, '')
      .replace(/[-*]\s?/g, '')
      .replace(/\n{2,}/g, '\n')
      .trim();

    if (!plainText) return;

    var self = this;
    TtsService.play(plainText).then(function (audio) {
      self.ttsCurrentAudio = audio;
    });
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
