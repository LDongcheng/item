import '../../app.css';

class ExamplePage {
    constructor(container) {
        this.container = container;
        this.timer = null;
    }

    async init() {
        // 1. 加载 HTML 模板
        const html = await fetch('index.html').then(res => res.text());
        this.container.innerHTML = html;

        // 2. 绑定事件
        this.bindEvents();

        // 3. 加载数据
        await this.loadData();

        // 4. 发送数据给小程序（通知页面加载完成）
        this.notifyMiniProgram();
    }

    bindEvents() {
        // 返回按钮
        this.container.querySelector('#backBtn').addEventListener('click', () => {
            // 方式1：通过 window.history 返回
            window.history.back();
            // 方式2：通知小程序关闭 webview
            // wx.miniProgram.navigateBack();
        });

        // 导航按钮
        this.container.querySelector('#navigateBtn').addEventListener('click', () => {
            // 通过 postMessage 导航到其他页面
            window.postMessage({ type: 'navigate', page: '目标页面名' });
        });

        // 接收来自小程序的数据
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'fromMiniProgram') {
                console.log('收到小程序数据:', event.data.data);
                this.updateUI(event.data.data);
            }
        });
    }

    async loadData() {
        try {
            // 模拟 API 调用
            const data = await this.fetchData();

            // 渲染数据
            const container = this.container.querySelector('#dataContainer');
            container.innerHTML = this.renderCards(data);

            // 切换加载状态
            this.container.querySelector('#loadingText').classList.add('hidden');
            container.classList.remove('hidden');
        } catch (e) {
            this.container.querySelector('#loadingText').textContent = '加载失败';
        }
    }

    fetchData() {
        // 模拟异步数据加载
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { title: '示例卡片 1', desc: '这是第一条示例数据' },
                    { title: '示例卡片 2', desc: '这是第二条示例数据' },
                    { title: '示例卡片 3', desc: '这是第三条示例数据' }
                ]);
            }, 500);
        });
    }

    renderCards(items) {
        return items.map(item => `
            <div class="card">
                <div class="card-title">${item.title}</div>
                <div class="card-desc">${item.desc}</div>
            </div>
        `).join('');
    }

    updateUI(data) {
        // 根据从小程序收到的数据更新界面
        console.log('更新UI:', data);
    }

    notifyMiniProgram() {
        // 通知小程序页面已加载
        if (typeof wx !== 'undefined' && wx.miniProgram) {
            wx.miniProgram.postMessage({
                data: { action: 'pageLoaded', payload: { title: '示例页面' } }
            });
        }
    }

    destroy() {
        if (this.timer) clearInterval(this.timer);
        // 清理事件监听
        this.container.innerHTML = '';
    }
}

export default ExamplePage;
