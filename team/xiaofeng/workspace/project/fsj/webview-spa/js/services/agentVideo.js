/**
 * Agent 视频资源服务
 * 从明道云获取 Agent 说话/不说话视频和背景图的 URL
 */
var AgentVideoService = {
  config: {
    appKey: '5cf5c6ba1ecbae8a',
    sign: 'NDQyM2EzZWM0YzE1ZjE1M2M3YzAxNjZhNjg0YTQ5ZGZhNjJjNzZkN2M0OTViOWNmNjdjZmE0YjQ2ZmU4OTJhOA==',
    worksheetId: 'ziyuan',
    baseUrl: 'https://api.mingdao.com/v2/open/worksheet/getRowByIdPost'
  },

  /**
   * 获取视频下载 URL
   * @param {string} rowId - 视频资源 rowid
   * @returns {Promise<string|null>} 视频 URL
   */
  getVideoUrl: function (rowId) {
    var self = this;
    return this._fetchRow(rowId).then(function (data) {
      if (!data) return null;
      // 字段 69f5b6930d1a8f4a06d48f69 是视频文件数组（JSON 字符串）
      var filesStr = data['69f5b6930d1a8f4a06d48f69'];
      if (!filesStr) return null;
      try {
        var files = JSON.parse(filesStr);
        if (Array.isArray(files) && files.length > 0) {
          return files[0].DownloadUrl || null;
        }
      } catch (e) {}
      return null;
    });
  },

  /**
   * 获取背景图 URL（从资源记录的 Agent 关联字段中）
   * @param {string} rowId - 视频资源 rowid
   * @returns {Promise<string|null>} 背景图 URL
   */
  getBgImageUrl: function (rowId) {
    var self = this;
    return this._fetchRow(rowId).then(function (data) {
      if (!data) return null;
      // 字段 69f5b878765e479ba3d512a4 是关联的 Agent，包含背景图
      var agentsStr = data['69f5b878765e479ba3d512a4'];
      if (!agentsStr) return null;
      try {
        var agents = JSON.parse(agentsStr);
        if (Array.isArray(agents) && agents.length > 0) {
          var sourceValue = JSON.parse(agents[0].sourcevalue);
          var attachments = JSON.parse(sourceValue['69ad979f6a3532cabd764603'] || '[]');
          if (Array.isArray(attachments) && attachments.length > 0) {
            return attachments[0].DownloadUrl || attachments[0].preview_url || null;
          }
        }
      } catch (e) {}
      return null;
    });
  },

  /**
   * 获取 Agent 全部资源（说话视频、不说话视频、背景图）
   * @param {string} shuohuaId - 说话视频 rowid
   * @param {string} bushuohuaId - 不说话视频 rowid
   * @returns {Promise<{shuohua: string, bushuohua: string, bgImage: string}>}
   */
  getAllResources: function (shuohuaId, bushuohuaId) {
    var self = this;
    return Promise.all([
      self.getVideoUrl(shuohuaId),
      self.getVideoUrl(bushuohuaId),
      self.getBgImageUrl(shuohuaId) // 背景图从说话视频记录获取
    ]).then(function (results) {
      return {
        shuohua: results[0],
        bushuohua: results[1],
        bgImage: results[2]
      };
    });
  },

  /**
   * 底层：获取明道云行记录
   */
  _fetchRow: function (rowId) {
    var cfg = this.config;
    return fetch(cfg.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appKey: cfg.appKey,
        sign: cfg.sign,
        worksheetId: cfg.worksheetId,
        rowId: rowId
      })
    })
    .then(function (res) {
      if (!res.ok) return null;
      return res.json();
    })
    .then(function (result) {
      if (result && result.success && result.data) {
        return result.data;
      }
      return null;
    })
    .catch(function () {
      return null;
    });
  }
};

export default AgentVideoService;
