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
    pit: '4',
    // 音量 (0-9, 默认5)
    vol: '5',
    // 音频格式 3=mp3
    aue: '3'
  },

  // 缓存 token
  _token: null,
  _tokenExpire: 0,

  // 共享音频元素（移动端 autoplay policy 关键）
  _audioElement: null,

  /**
   * 初始化共享 Audio 元素（必须在用户手势后立即调用）
   */
  initAudio: function () {
    if (!this._audioElement) {
      this._audioElement = new Audio();
      this._audioElement.preload = 'auto';
    }
    // 尝试播放静音音频来解锁
    var silent = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    this._audioElement.src = silent;
    this._audioElement.volume = 0;
    this._audioElement.play().catch(function () {});
    // AudioContext 也解锁
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      try {
        var ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume().catch(function () {});
      } catch (e) {}
    }
    console.log('[TtsService] audio unlocked');
  },

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

      // 使用共享音频元素
      var audio = self._audioElement;
      if (!audio) {
        console.warn('[TtsService] 音频未解锁，尝试初始化');
        self.initAudio();
        audio = self._audioElement;
      }

      return new Promise(function (resolve, reject) {
        var settled = false;
        var timer = null;

        function safeSettle(isResolve, err) {
          if (settled) return;
          settled = true;
          if (timer) clearTimeout(timer);
          if (isResolve) {
            resolve();
          } else {
            reject(err);
          }
        }

        // 音频元数据加载完成后，根据 duration 设置定时器
        audio.onloadedmetadata = function () {
          var duration = audio.duration;
          if (duration && isFinite(duration)) {
            var ms = duration * 1000 + 500; // 加 500ms 余量
            console.log('[TtsService] 音频时长:', duration.toFixed(1) + 's，设置定时器:', ms + 'ms');
            timer = setTimeout(function () {
              if (!settled) {
                console.log('[TtsService] 音频播放完成 (duration timer)');
                safeSettle(true);
              }
            }, ms);
          }
        };

        // onended 作为辅助触发
        audio.onended = function () {
          console.log('[TtsService] 音频播放完成 (onended)');
          safeSettle(true);
        };

        audio.onerror = function (e) {
          console.error('[TtsService] 音频错误');
          safeSettle(false, new Error('音频加载失败'));
        };

        // 超时兜底（每字 300ms，最少 5 秒）
        var maxTimeout = Math.max(text.length * 300, 5000) + 5000;
        timer = setTimeout(function () {
          if (!settled) {
            console.warn('[TtsService] 音频超时');
            safeSettle(false, new Error('播放超时'));
          }
        }, maxTimeout);

        audio.src = audioUrl;
        audio.volume = 1;

        audio.play().catch(function (e) {
          if (e.name === 'NotAllowedError' || e.name === 'AbortError') {
            console.warn('[TtsService] 播放被阻止:', e.name);
            // 尝试重新解锁
            self.initAudio();
            // 重新播放
            audio.play().catch(function (e2) {
              console.error('[TtsService] play() 再次失败:', e2.name);
              safeSettle(false, e2);
            });
          } else {
            console.error('[TtsService] play() 失败:', e.name);
            safeSettle(false, e);
          }
        });
      });
    });
  },

  /**
   * 停止当前播放
   */
  stop: function () {
    if (this._audioElement) {
      this._audioElement.pause();
      this._audioElement.src = '';
    }
  }
};

export default TtsService;
