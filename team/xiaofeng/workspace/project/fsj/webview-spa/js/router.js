/**
 * 简单路由
 * 处理页面内切换和参数传递
 */
var Router = {
  routes: {},

  /**
   * 注册路由
   * @param {string} path
   * @param {function} handler
   */
  add: function (path, handler) {
    this.routes[path] = handler;
  },

  /**
   * 导航到指定路径
   * @param {string} path
   * @param {object} params
   */
  navigate: function (path, params) {
    var handler = this.routes[path];
    if (handler) {
      handler(params);
    }
  },

  /**
   * 解析 URL 参数
   * @returns {object}
   */
  getParams: function () {
    var params = {};
    var search = window.location.search.slice(1);
    if (!search) return params;

    search.split('&').forEach(function (pair) {
      var parts = pair.split('=');
      params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
    });

    return params;
  }
};

export default Router;
