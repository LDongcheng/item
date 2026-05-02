/**
 * 登录服务
 * 调用 Coze 登录 API 获取用户信息和页面配置
 */
var LoginService = {
  /**
   * 登录 API 配置
   */
  config: {
    url: 'https://api.coze.cn/v1/workflow/stream_run',
    token: 'sat_PsqZd6JJl9qOPZoT30rPv2gLKAVIMXGMmIp38VzXXIRU77nzgzk09yvcFwNT8Z4h',
    workflowId: '7635086187392647214',
  },

  /**
   * 账号密码登录
   * @param {string} phone - 手机号
   * @param {string} password - 密码
   * @returns {Promise<object>} 登录结果
   */
  accountLogin: function (phone, password) {
    return this._doLogin({
      mima: password,
      phone: phone,
    });
  },

  /**
   * 微信登录
   * @param {string} openid - 微信 openid
   * @returns {Promise<object>} 登录结果
   */
  wxLogin: function (openid) {
    return this._doLogin({
      openid: openid,
    });
  },

  /**
   * 执行登录请求
   * @param {object} params - 登录参数
   * @returns {Promise<object>} 登录结果
   */
  _doLogin: function (params) {
    var self = this;
    var cfg = this.config;

    var body = {
      workflow_id: cfg.workflowId,
      parameters: params,
    };

    return fetch(cfg.url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + cfg.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('网络请求失败: ' + res.status);
        }
        return res.text();
      })
      .then(function (text) {
        return self._parseSSE(text);
      });
  },

  /**
   * 解析 SSE 流式响应
   * @param {string} text - SSE 响应文本
   * @returns {object} 登录结果 { name, rowid, shangjia }
   */
  _parseSSE: function (text) {
    var lines = text.split('\n');
    var result = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.indexOf('data: ') === 0) {
        var jsonStr = line.substring(6);
        try {
          var data = JSON.parse(jsonStr);
          if (data.content) {
            result = JSON.parse(data.content);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }

    if (!result) {
      throw new Error('登录失败，未获取到用户信息');
    }

    // shangjia 可能是 JSON 字符串，需要额外解析
    if (typeof result.shangjia === 'string') {
      try {
        result.shangjia = JSON.parse(result.shangjia);
      } catch (e) {
        // 解析失败则置空
        result.shangjia = [];
      }
    }

    // agent 字段保存（可能是字符串或对象）
    if (result.agent) {
      result.agent = result.agent.toString();
    }

    return result;
  },
};

export default LoginService;
