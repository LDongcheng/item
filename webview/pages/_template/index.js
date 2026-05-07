import '../../app.css';

class 页面名 {
    constructor(container) {
        this.container = container;
        this.timer = null;
        this.version = window.__VERSION__ || Date.now();
    }

    async init() {
        // 1. 加载 HTML 模板（禁用缓存）
        const html = await fetch(`index.html?v=${this.version}`, {
            cache: 'no-store'
        }).then(res => res.text());
        this.container.innerHTML = html;

        // 2. 绑定事件
        this.bindEvents();

        // 3. 加载数据
        await this.loadData();
    }

    bindEvents() {
        // 事件绑定
        // this.container.querySelector('#btn').addEventListener('click', () => {});
    }

    async loadData() {
        // 数据加载逻辑
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
    }
}

export default 页面名;
