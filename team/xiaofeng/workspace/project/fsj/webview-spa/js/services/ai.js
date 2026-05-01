/**
 * AI 服务 - 快速响应 + 深度执行
 * 快速响应：阿里百炼 qwen3-coder-next（非流式，~800ms）
 * 深度执行：Coze Workflow HAP API（异步执行数据操作）
 */
var AIService = {
  config: {
    // 快速响应 - 阿里百炼 OpenAI 兼容接口
    quickApiUrl: 'https://coding.dashscope.aliyuncs.com/v1/chat/completions',
    quickApiKey: 'sk-sp-385035c0f01148548165845d5ca6c400',
    quickModel: 'qwen3-coder-next',

    // 深度执行 - Coze Workflow
    deepApiUrl: 'https://api.coze.cn/v1/workflow/stream_run',
    deepToken: 'sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h',
    hapWorkflowId: '7634531869195796499'
  },

  /**
   * 第一层：快速响应（非流式，~800ms）
   * @param {string} userMessage - 用户输入
   * @param {function} onToken - 收到回复的回调
   * @returns {Promise<string>} 完整回复
   */
  quickReply: async function (userMessage, onToken) {
    try {
      var res = await fetch(this.config.quickApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.quickApiKey
        },
        body: JSON.stringify({
          model: this.config.quickModel,
          stream: false,
          max_tokens: 50,
          messages: [
            {
              role: 'system',
              content: '你是一句话回复助手，用户说什么，你只用一句话告诉他你正在做什么工作，不超过30字。不要展开。'
            },
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      });

      if (!res.ok) {
        console.error('[AIService] API returned error:', res.status, res.statusText);
        var errText = '正在处理中...';
        if (onToken) onToken(errText);
        return errText;
      }

      var data = await res.json();
      var content = '';
      if (data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content || '正在处理中...';
      } else {
        content = '正在处理中...';
        console.error('[AIService] Unexpected response format:', JSON.stringify(data));
      }

      if (onToken) onToken(content);
      return content;
    } catch (e) {
      console.error('[AIService] quickReply error:', e);
      var fallback = '正在处理中...';
      if (onToken) onToken(fallback);
      return fallback;
    }
  },

  /**
   * 第二层：深度执行（Coze HAP API）
   * @param {object} params - 执行参数
   * @param {function} onChunk - 流式数据块回调
   * @returns {Promise} 流式执行结果
   */
  deepExecute: async function (params, onChunk) {
    var self = this;

    try {
      var res = await fetch(this.config.deepApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.deepToken
        },
        body: JSON.stringify({
          workflow_id: this.config.hapWorkflowId,
          parameters: {
            appkey: params.appkey || '',
            content: params.content || '',
            org: params.org || '',
            rowid: params.rowid || '',
            sign: params.sign || ''
          }
        })
      });

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;

        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf('data: ') === 0 && onChunk) {
            onChunk(line.slice(6));
          }
        }
      }
    } catch (e) {
      console.error('[AIService] deepExecute error:', e);
      throw e;
    }
  },

  /**
   * 完整对话流程：快速回复 + 深度执行
   * @param {string} userMessage - 用户输入
   * @param {object} hapParams - HAP 执行参数
   * @param {function} onToken - 快速回复 token 回调
   * @param {function} onDeepResult - 深度执行结果回调
   */
  chat: async function (userMessage, hapParams, onToken, onDeepResult) {
    var self = this;

    // 第一层：快速响应
    this.quickReply(userMessage, onToken).then(function (fullText) {
      if (onDeepResult) {
        onDeepResult({ type: 'quickReply', content: fullText });
      }
    });

    // 第二层：深度执行（同时进行）
    if (hapParams) {
      this.deepExecute(hapParams, function (data) {
        if (onDeepResult) {
          onDeepResult({ type: 'deepExecute', data: data });
        }
      });
    }
  }
};

export default AIService;
