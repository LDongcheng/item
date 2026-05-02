/**
 * 百度语音合成服务 (TTS)
 * 通过代理获取 Token，然后调用百度 API 生成语音
 */
var TtsService = {
  // 语音参数
  config: {
    tokenUrl: 'https://v4pre.h5sys.cn/api/12024287/d1tt8aha3j50000e10yg',
    ttsUrl: 'https://tsn.baidu.com/text2audio',
    // 发音人：4147=星宝，per 参数可选 0-11,4003+
    per: '4147',
    // 语速 (0-15, 默认5)
    spd: '5',
    // 语调 (0-15, 默认5)
    pit: '8',
    // 音量 (0-9, 默认5)
    vol: '5',
    // 音频格式 3=mp3
    aue: '3'
  },

  // 缓存 token
  _token: null,
  _tokenExpire: 0,

  /**
   * 获取 Token
   */
  _getToken: function () {
    var self = this;
    // 如果有未过期 token，直接返回
    if (self._token && Date.now() < self._tokenExpire) {
      return Promise.resolve(self._token);
    }

    return fetch(self.config.tokenUrl)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        self._token = data.output;
        // token 有效期 30 天，提前 1 天刷新
        self._tokenExpire = Date.now() + 29 * 24 * 60 * 60 * 1000;
        return self._token;
      });
  },

  /**
   * 文字转语音
   * @param {string} text - 要合成的文字
   * @returns {Promise<string>} 音频 Blob URL
   */
  textToSpeech: function (text) {
    var self = this;

    // 文字太长截取前 200 字（百度 TTS 限制）
    if (text.length > 200) {
      text = text.substring(0, 200);
    }

    return self._getToken().then(function (token) {
      var params = [
        'tex=' + encodeURIComponent(text),
        'lan=zh',
        'cuid=baidu_workshop',
        'ctp=1',
        'tok=' + token,
        'aue=' + self.config.aue,
        'per=' + self.config.per,
        'spd=' + self.config.spd,
        'pit=' + self.config.pit,
        'vol=' + self.config.vol
      ];

      return self.config.ttsUrl + '?' + params.join('&');
    });
  },

  /**
   * 播放语音（自动获取并播放）
   * @param {string} text - 要播放的文字
   * @returns {Promise<HTMLAudioElement>}
   */
  play: function (text) {
    var self = this;
    console.log('[TtsService] 准备播放语音:', text.substring(0, 20) + '...');
    return self.textToSpeech(text).then(function (audioUrl) {
      console.log('[TtsService] 音频URL生成:', audioUrl.substring(0, 60) + '...');
      // 停止之前正在播放的语音
      if (self._currentAudio) {
        self._currentAudio.pause();
        self._currentAudio.src = '';
      }

      var audio = new Audio(audioUrl);
      self._currentAudio = audio;
      audio.onerror = function () {
        console.error('[TtsService] 音频加载失败');
      };
      audio.onplay = function () {
        console.log('[TtsService] 音频开始播放');
      };
      audio.onended = function () {
        console.log('[TtsService] 音频播放结束');
      };
      audio.play().catch(function (e) {
        console.error('[TtsService] 语音播放失败:', e);
      });
      return audio;
    });
  },

  /**
   * 停止当前播放
   */
  stop: function () {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio.src = '';
      this._currentAudio = null;
    }
  }
};

export default TtsService;
