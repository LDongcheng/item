/**
 * AI 服务 - Coze 工作流统一智能回复
 * 规划 + 意图识别 + 执行全部由 Coze 工作流完成
 * 前端接收流式返回，实时显示执行进度
 */
var AIService = {
  config: {
    deepApiUrl: 'https://api.coze.cn/v1/workflow/stream_run',
    deepToken: 'sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h',
    hapWorkflowId: '7634531869195796499',    // 普通模式
    immersiveWorkflowId: '7635274334010196020'  // 沉浸模式
  },

  /**
   * 生气关键词检测（前端快速拦截，不依赖 AI）
   */
  angerKeywords: ['生气', '愤怒', '气死', '垃圾', '废物', '没用', '傻', '蠢', '太差', '太慢', '不行', '会不会', '到底会不会', '你是不是', '你行不行'],

  isAngry: function (userMessage) {
    var msg = userMessage.toLowerCase();
    for (var i = 0; i < this.angerKeywords.length; i++) {
      if (msg.indexOf(this.angerKeywords[i]) !== -1) {
        return true;
      }
    }
    return false;
  },

  /**
   * 调用 Coze 工作流
   * @param {object} params - {content, appkey, org, rowid, sign, flow, mode}
   * @param {function} onChunk - 流式回调 {type: 'progress'|'result'|'done', data: any}
   */
  execute: async function (params, onChunk) {
    var self = this;
    var isImmersive = params.mode === 'immersive';

    // 生气拦截
    if (this.isAngry(params.content || '')) {
      if (onChunk) onChunk({ type: 'result', content: '对不起，我马上改进' });
      if (onChunk) onChunk({ type: 'done' });
      return;
    }

    var workflowId = isImmersive ? this.config.immersiveWorkflowId : this.config.hapWorkflowId;
    var body = {
      workflow_id: workflowId,
      parameters: {}
    };

    if (isImmersive) {
      // 沉浸模式：带完整参数
      body.parameters = {
        appkey: params.appkey || 'c156d7e78368cbc1',
        content: params.content || '',
        org: params.org || '35bd022d-fa72-4e7b-8c3b-0de99a4000e5',
        rowid: params.rowid || '1024efc4-27fd-4522-bf3c-e4ebc998393c',
        sign: params.sign || 'NmM2NGE0ZTNlN2Y3NjU3ODY5MzMzOTk1NzBjMmMwMzNkNmE5NDU2MWZiYTg4ZWViNDk3MGE3MzU5MjcwNDU2MQ=='
      };
    } else {
      // 普通模式：原有参数
      body.parameters = {
        appkey: params.appkey || '',
        content: params.content || '',
        org: params.org || '',
        rowid: params.rowid || '',
        sign: params.sign || '',
        flow: params.flow || ''
      };
    }

    console.log('[AIService] calling workflow:', workflowId, isImmersive ? '(immersive)' : '(normal)');

    try {
      var res = await fetch(this.config.deepApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.deepToken
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        console.error('[AIService] Coze API error:', res.status, res.statusText);
        if (onChunk) onChunk({ type: 'result', content: '请求失败，请稍后再试' });
        if (onChunk) onChunk({ type: 'done' });
        return;
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var accumulatedContent = '';  // 累积内容

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;

        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.indexOf('data: ') === 0) {
            try {
              var data = JSON.parse(line.slice(6));

              // conversation.message.delta 事件：逐 token 增量
              if (data.event === 'conversation.message.delta') {
                if (data.content) {
                  console.log('[AIService] delta event:', data.content);
                  accumulatedContent += data.content;
                  // delta 类型：携带原始增量片段和累积内容
                  if (onChunk) onChunk({
                    type: 'delta',
                    delta: data.content,
                    content: accumulatedContent
                  });
                }
                continue;
              }

              // Message 事件：节点输出（追加到累积内容）
              if (data.node_type === 'Message' || (data.node_type && data.content)) {
                if (data.content) {
                  console.log('[AIService] progress event:', data.content.substring(0, 50));
                  var parsedContent = data.content;
                  try {
                    var parsed = JSON.parse(data.content);
                    parsedContent = parsed.output || parsed.content || data.content;
                  } catch (e) {}
                  accumulatedContent += parsedContent + '\n';
                  if (onChunk) onChunk({ type: 'progress', nodeTitle: data.node_title || '', content: accumulatedContent });
                }
              }

              // End 事件：最终结果
              if (data.node_type === 'End' && data.content) {
                console.log('[AIService] result event');
                var output = data.content;
                // 尝试解析 content 内的 JSON
                try {
                  var parsed = JSON.parse(data.content);
                  output = parsed.output || parsed.content || data.content;
                } catch (e) {}
                if (onChunk) onChunk({ type: 'result', content: accumulatedContent || output });
              }

              // Done 事件：执行完成
              if (data.debug_url !== undefined) {
                console.log('[AIService] done event');
                if (onChunk) onChunk({ type: 'done' });
              }
            } catch (e) {
              // JSON 解析失败，跳过
              console.warn('[AIService] Parse failed:', line.substring(0, 100));
            }
          }
        }
      }
    } catch (e) {
      console.error('[AIService] execute error:', e);
      if (onChunk) onChunk({ type: 'result', content: '执行出错：' + e.message });
      if (onChunk) onChunk({ type: 'done' });
    }
  }
};

export default AIService;
