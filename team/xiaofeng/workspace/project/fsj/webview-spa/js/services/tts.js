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
   * 播放语音
   * @param {string} text - 要播放的文字
   * @returns {Promise<void>} 播完才 resolve，失败则 reject
   */
  play: function (text) {
    var self = this;
    console.log('[TtsService] 准备播放语音:', text.substring(0, 20) + '...');
    return self.textToSpeech(text).then(function (audioUrl) {
      console.log('[TtsService] 音频URL生成:', audioUrl.substring(0, 60) + '...');

      // 停止之前正在播放的语音
      if (self._currentAudio) {
        self._currentAudio.onended = null;
        self._currentAudio.onerror = null;
        self._currentAudio.pause();
        self._currentAudio = null;
      }

      var audio = new Audio();

      return new Promise(function (resolve, reject) {
        var settled = false;
        var playTimeout = null;

        function safeSettle(isResolve, err) {
          if (settled) return;
          settled = true;
          if (playTimeout) clearTimeout(playTimeout);
          self._currentAudio = null;
          if (isResolve) {
            resolve();
          } else {
            reject(err);
          }
        }

        audio.onended = function () {
          console.log('[TtsService] 音频播放完成');
          safeSettle(true);
        };

        audio.onerror = function (e) {
          console.error('[TtsService] 音频错误');
          safeSettle(false, new Error('音频加载失败'));
        };

        // 动态超时：根据音频长度估算（每字约 300ms）
        var estimatedDuration = Math.max(text.length * 300, 3000);
        playTimeout = setTimeout(function () {
          if (!settled) {
            console.warn('[TtsService] 音频超时 (' + estimatedDuration + 'ms)');
            safeSettle(false, new Error('播放超时'));
          }
        }, estimatedDuration + 5000);

        self._currentAudio = audio;
        audio.src = audioUrl;
        audio.volume = 1;

        var playPromise = audio.play();
        if (playPromise) {
          playPromise.catch(function (e) {
            if (e.name === 'NotAllowedError') {
              console.warn('[TtsService] 播放被阻止');
              // 等 onended（有些浏览器在允许后会自动触发）
            } else if (e.name === 'AbortError') {
              // 被中断，等待其他事件
            } else if (e.name === 'NotSupportedError') {
              console.error('[TtsService] 不支持的音频格式');
              safeSettle(false, new Error('不支持的音频格式'));
            } else {
              console.error('[TtsService] play() 失败:', e.name);
              safeSettle(false, e);
            }
          });
        }
      });
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
