/**
 * 像素Canvas渲染引擎
 * 基于41x41格子系统，支持PNG资源和AI控制
 */
export default class PixelCanvasPage {
    constructor(container) {
        this.container = container;

        // === 格子系统配置 ===
        this.gridSize = 41;              // 每个格子大小（像素）
        this.gridCenter = 20;            // 格子中心点索引（第21个像素，从0开始是20）

        // === 地图数据 ===
        this.mapData = null;             // 地图配置
        this.mapSprite = null;           // 地图PNG图片
        this.mapWidth = 0;               // 地图格子宽度
        this.mapHeight = 0;              // 地图格子高度
        this.collision = [];             // 碰撞数据（01数组）

        // === 角色管理 ===
        this.characters = [];            // 所有角色列表
        this.characterSprites = {};      // 角色PNG缓存

        // === 动画配置 ===
        this.frameInterval = 500;        // 动画帧间隔（毫秒）
        this.animationTimer = null;      // 动画定时器

        // === Canvas ===
        this.canvas = null;
        this.ctx = null;

        // === UI元素 ===
        this.chatBox = null;
        this.infoBox = null;

        // === 事件回调 ===
        this.onCharacterClick = null;    // 点击角色回调
        this.onMapClick = null;          // 点击地图回调

        // === API配置 ===
        this.apiBaseUrl = '{API_URL}';   // API基础地址（部署时替换）

        this.init();
    }

    async init() {
        await this.loadHTML();
        this.loadCSS();
        this.initCanvas();
        await this.loadDemoData();       // 加载演示数据
        this.startAnimationLoop();
        this.bindEvents();
    }

    // ========== HTML/CSS加载 ==========

    async loadHTML() {
        this.container.innerHTML = this.getInlineHTML();
        this.canvas = document.getElementById('pixelCanvas');
        this.chatBox = document.getElementById('chatBox');
        this.infoBox = document.getElementById('infoBox');
    }

    getInlineHTML() {
        return `
<section class="pixel-canvas-page">
    <style>
        :root {
            --pixel-bg: #fbebd3;
            --pixel-border: #181818;
            --pixel-panel: #d4c4a8;
        }
        .pixel-canvas-page {
            width: 100%;
            height: 100vh;
            background: var(--pixel-bg);
            position: relative;
            overflow: hidden;
        }
        .canvas-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #pixelCanvas {
            image-rendering: pixelated;
            image-rendering: crisp-edges;
            cursor: pointer;
        }
        .info-box {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 10;
            pointer-events: none;
        }
        .chat-box {
            position: absolute;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: white;
            border: 2px solid var(--pixel-border);
            border-radius: 8px;
            padding: 12px;
            display: none;
            z-index: 20;
        }
        .chat-box.show { display: block; }
        .chat-message {
            font-size: 14px;
            color: var(--pixel-border);
            text-align: center;
        }
        /* 调试信息 */
        .debug-panel {
            position: absolute;
            top: 10px;
            right: 10px;
            background: var(--pixel-panel);
            border: 2px solid var(--pixel-border);
            padding: 8px;
            font-size: 12px;
            z-index: 30;
        }
        .debug-row { margin: 4px 0; }
        .debug-label { color: #888; }
        .debug-value { font-weight: bold; }
    </style>

    <div class="canvas-container">
        <canvas id="pixelCanvas"></canvas>
    </div>

    <div class="info-box" id="infoBox">
        <div style="background:#d4c4a8;border:2px solid #181818;padding:8px;border-radius:4px;">
            <div style="font-size:12px;color:#181818;">LV 01</div>
            <div style="font-size:10px;color:#888;">经验: 0/20</div>
        </div>
    </div>

    <div class="chat-box" id="chatBox">
        <p class="chat-message" id="chatMessage">你好！</p>
    </div>

    <div class="debug-panel" id="debugPanel">
        <div class="debug-row"><span class="debug-label">地图:</span> <span class="debug-value" id="debugMap">加载中</span></div>
        <div class="debug-row"><span class="debug-label">角色:</span> <span class="debug-value" id="debugChars">0</span></div>
        <div class="debug-row"><span class="debug-label">选中:</span> <span class="debug-value" id="debugSelected">无</span></div>
    </div>
</section>`;
    }

    loadCSS() {
        // CSS已内联
    }

    // ========== Canvas初始化 ==========

    initCanvas() {
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.updateCanvasSize();
        window.addEventListener('resize', () => this.updateCanvasSize());
    }

    updateCanvasSize() {
        // 根据地图大小计算Canvas像素尺寸
        const pixelWidth = this.mapWidth > 0 ? this.mapWidth * this.gridSize : 20 * this.gridSize;
        const pixelHeight = this.mapHeight > 0 ? this.mapHeight * this.gridSize : 15 * this.gridSize;

        // 计算缩放以填满屏幕（强制最小缩放为2倍）
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const scaleX = screenWidth / pixelWidth;
        const scaleY = screenHeight / pixelHeight;
        const scale = Math.max(2, Math.min(scaleX, scaleY));  // 最小2倍缩放

        // 设置Canvas像素尺寸
        this.canvas.width = pixelWidth;
        this.canvas.height = pixelHeight;

        // 设置Canvas显示尺寸（填满屏幕）
        this.canvas.style.width = (pixelWidth * scale) + 'px';
        this.canvas.style.height = (pixelHeight * scale) + 'px';

        // 更新调试面板显示缩放信息
        const debugScale = document.getElementById('debugMap');
        if (debugScale) {
            debugScale.textContent = `${this.mapWidth}×${this.mapHeight} (缩放${scale.toFixed(1)}x)`;
        }

        this.render();
    }

    // ========== 演示数据加载 ==========

    async loadDemoData() {
        // 演示地图数据（实际部署时从API获取）
        this.mapWidth = 20;
        this.mapHeight = 15;

        // 演示碰撞数据（0=可通行，1=障碍）
        this.collision = this.generateDemoCollision();

        // 加载角色PNG素材
        try {
            this.demoSprite = await this.loadSprite('./assets/isPixel/character.png');
            console.log('角色素材加载成功, 尺寸:', this.demoSprite.width, 'x', this.demoSprite.height);
        } catch (e) {
            console.warn('角色素材加载失败，使用颜色块演示:', e);
            this.demoSprite = null;
        }

        // 演示角色数据
        this.characters = [
            {
                id: 'npc_001',
                gridX: 5,
                gridY: 5,
                sprite: this.demoSprite,    // PNG素材
                color: '#4CAF50',           // 备用颜色（PNG加载失败时）
                action: 'idle',
                frame: 0,
                totalFrames: 1,             // PNG帧数（暂时设为1）
                moving: false,
                path: [],
                pathIndex: 0
            },
            {
                id: 'npc_002',
                gridX: 10,
                gridY: 8,
                sprite: this.demoSprite,
                color: '#E83B3B',
                action: 'idle',
                frame: 0,
                totalFrames: 1,
                moving: false,
                path: [],
                pathIndex: 0
            }
        ];

        this.updateDebugPanel();
        this.render();
    }

    generateDemoCollision() {
        // 生成演示地图碰撞数据
        const collision = [];
        for (let y = 0; y < this.mapHeight; y++) {
            collision[y] = [];
            for (let x = 0; x < this.mapWidth; x++) {
                // 边界为障碍
                if (x === 0 || x === this.mapWidth - 1 || y === 0 || y === this.mapHeight - 1) {
                    collision[y][x] = 1;
                }
                // 中间一些障碍物
                else if ((x === 7 && y >= 3 && y <= 5) || (x === 12 && y >= 8 && y <= 10)) {
                    collision[y][x] = 1;
                }
                else {
                    collision[y][x] = 0;
                }
            }
        }
        return collision;
    }

    // ========== 渲染 ==========

    render() {
        if (!this.ctx) return;

        // 清空画布
        this.ctx.fillStyle = '#fbebd3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 按Y坐标分层渲染（实现遮挡关系）
        this.renderByLayers();

        // 绘制格子线（调试用）
        this.renderGridLines();
    }

    renderByLayers() {
        // 收集所有渲染元素，按Y坐标排序
        const elements = [];

        // 1. 收集地图格子
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.collision[y][x] === 1) {
                    elements.push({
                        type: 'obstacle',
                        y: y,
                        x: x,
                        render: () => this.renderObstacle(x, y)
                    });
                }
            }
        }

        // 2. 收集角色（脚底Y坐标 = gridY）
        for (let char of this.characters) {
            elements.push({
                type: 'character',
                y: char.gridY,  // 用脚底Y坐标排序
                x: char.gridX,
                char: char,
                render: () => this.renderCharacter(char)
            });
        }

        // 3. 按Y坐标排序（Y小的先渲染，被Y大的遮挡）
        elements.sort((a, b) => a.y - b.y);

        // 4. 先绘制可通行地面
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (this.collision[y][x] === 0) {
                    const screenX = x * this.gridSize;
                    const screenY = y * this.gridSize;
                    this.ctx.fillStyle = '#e8d8bc';
                    this.ctx.fillRect(screenX, screenY, this.gridSize, this.gridSize);
                }
            }
        }

        // 5. 按顺序渲染元素（实现遮挡）
        for (let el of elements) {
            el.render();
        }
    }

    renderObstacle(x, y) {
        const screenX = x * this.gridSize;
        const screenY = y * this.gridSize;
        this.ctx.fillStyle = '#717171';
        this.ctx.fillRect(screenX, screenY, this.gridSize, this.gridSize);

        // 边框
        this.ctx.strokeStyle = '#444444';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, screenY, this.gridSize, this.gridSize);
    }

    renderCharacter(char) {
        // 脚底中心定位：角色脚底站在格子中心
        // 格子中心像素位置 = gridX * 41 + 20, gridY * 41 + 20
        const footX = char.gridX * this.gridSize + this.gridCenter;
        const footY = char.gridY * this.gridSize + this.gridCenter;

        // 绘制角色（PNG素材41x41，脚底对齐中心）
        // 所以绘制起点 = footY - 41（脚底在上，角色向上延伸）
        const drawX = footX - this.gridCenter;  // 水平居中
        const drawY = footY - this.gridSize;    // 垂直：脚底在格子中心，角色向上

        if (char.sprite) {
            // 有PNG素材
            this.ctx.drawImage(
                char.sprite,
                0, 0, char.sprite.width, char.sprite.height,
                drawX, drawY, this.gridSize, this.gridSize
            );
        } else {
            // 无PNG素材，用颜色块演示
            this.ctx.fillStyle = char.color;
            this.ctx.fillRect(drawX, drawY, this.gridSize, this.gridSize);

            // 边框
            this.ctx.strokeStyle = '#181818';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(drawX, drawY, this.gridSize, this.gridSize);
        }

        // 绘制角色ID标签
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(char.id, footX, drawY - 3);

        // 绘制脚底位置标记（调试）
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(footX, footY, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制移动路径
        if (char.moving && char.path.length > 0) {
            this.renderPath(char.path, char.pathIndex);
        }

        // 绘制动画帧指示
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(drawX + this.gridCenter - 5, drawY + this.gridSize - 10, 10, 8);
        this.ctx.fillStyle = '#181818';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(char.frame + 1, drawX + this.gridCenter, drawY + this.gridSize - 4);
    }

    renderPath(path, currentIndex) {
        // 绘制移动路径
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const screenX = point.x * this.gridSize + this.gridCenter;
            const screenY = point.y * this.gridSize + this.gridCenter;

            // 已走过的路径
            if (i < currentIndex) {
                this.ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
            }
            // 当前位置
            else if (i === currentIndex) {
                this.ctx.fillStyle = 'rgba(76, 175, 80, 0.8)';
            }
            // 未走的路径
            else {
                this.ctx.fillStyle = 'rgba(76, 175, 80, 0.5)';
            }

            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 5, 0, Math.PI * 2);
            this.ctx.fill();

            // 连线
            if (i < path.length - 1) {
                const nextPoint = path[i + 1];
                const nextX = nextPoint.x * this.gridSize + this.gridCenter;
                const nextY = nextPoint.y * this.gridSize + this.gridCenter;

                this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, screenY);
                this.ctx.lineTo(nextX, nextY);
                this.ctx.stroke();
            }
        }
    }

    renderGridLines() {
        // 绘制格子线（调试）
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.mapWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.mapHeight * this.gridSize);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.mapHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.mapWidth * this.gridSize, y * this.gridSize);
            this.ctx.stroke();
        }
    }

    // ========== 动画循环 ==========

    startAnimationLoop() {
        this.animationTimer = setInterval(() => {
            this.updateAnimations();
            this.render();
        }, this.frameInterval);
    }

    updateAnimations() {
        // 更新角色动画帧
        for (let char of this.characters) {
            char.frame = (char.frame + 1) % char.totalFrames;

            // 处理移动
            if (char.moving && char.path.length > 0) {
                if (char.pathIndex < char.path.length) {
                    const nextPoint = char.path[char.pathIndex];
                    char.gridX = nextPoint.x;
                    char.gridY = nextPoint.y;
                    char.pathIndex++;

                    // 到达终点
                    if (char.pathIndex >= char.path.length) {
                        char.moving = false;
                        char.action = 'idle';
                        char.path = [];
                        char.pathIndex = 0;
                        this.updateDebugPanel();
                    }
                }
            }
        }
    }

    // ========== 事件绑定 ==========

    bindEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const clickX = Math.floor((e.clientX - rect.left) * scaleX);
        const clickY = Math.floor((e.clientY - rect.top) * scaleY);

        // 转换为格子坐标
        const gridX = Math.floor(clickX / this.gridSize);
        const gridY = Math.floor(clickY / this.gridSize);

        // 检查是否点击角色
        for (let char of this.characters) {
            if (char.gridX === gridX && char.gridY === gridY) {
                this.handleCharacterClick(char);
                return;
            }
        }

        // 点击地图
        this.handleMapClick(gridX, gridY);
    }

    handleCharacterClick(char) {
        console.log('点击角色:', char.id);
        this.showChatBox(`你好，我是 ${char.id}！`);
        this.updateDebugPanel(char.id);

        // 触发回调
        if (this.onCharacterClick) {
            this.onCharacterClick(char);
        }
    }

    handleMapClick(gridX, gridY) {
        console.log('点击地图:', gridX, gridY);

        // 检查是否可通行
        if (this.collision[gridY] && this.collision[gridY][gridX] === 0) {
            // 演示：让第一个角色移动到点击位置
            const char = this.characters[0];
            if (!char.moving) {
                this.moveCharacterTo(char.id, gridX, gridY);
            }
        }

        if (this.onMapClick) {
            this.onMapClick(gridX, gridY);
        }
    }

    // ========== AI控制接口 ==========

    /**
     * 移动角色到目标位置
     * @param {string} characterId - 角色ID
     * @param {number} targetX - 目标格子X
     * @param {number} targetY - 目标格子Y
     * @returns {object} - {success, error}
     */
    moveCharacterTo(characterId, targetX, targetY) {
        const char = this.characters.find(c => c.id === characterId);
        if (!char) {
            return { success: false, error: '角色不存在' };
        }

        // 生成路径
        const path = this.generatePath(
            { x: char.gridX, y: char.gridY },
            { x: targetX, y: targetY },
            this.collision,
            this.characters.filter(c => c.id !== characterId)
        );

        if (!path) {
            return { success: false, error: '无法到达目标' };
        }

        // 执行移动
        char.moving = true;
        char.action = 'walk';
        char.path = path;
        char.pathIndex = 0;

        this.updateDebugPanel();
        return { success: true, path };
    }

    /**
     * A*寻路算法（四方向）
     */
    generatePath(start, end, collision, otherChars) {
        const width = collision[0].length;
        const height = collision.length;

        // 动态障碍（其他角色位置）
        const dynamicBlocks = new Set();
        for (let char of otherChars) {
            dynamicBlocks.add(`${char.gridX},${char.gridY}`);
            if (char.moving && char.targetX !== undefined) {
                dynamicBlocks.add(`${char.targetX},${char.targetY}`);
            }
        }

        // 检查可通行
        const isWalkable = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return false;
            if (collision[y][x] === 1) return false;
            if (dynamicBlocks.has(`${x},${y}`)) return false;
            return true;
        };

        // A*算法
        const openSet = [{ x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null }];
        const closedSet = new Set();

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();

            if (current.x === end.x && current.y === end.y) {
                const path = [];
                let node = current;
                while (node) {
                    path.unshift({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return path;
            }

            closedSet.add(`${current.x},${current.y}`);

            // 四方向邻居
            const neighbors = [
                { x: current.x, y: current.y - 1 },
                { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y }
            ];

            for (let neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;

                if (closedSet.has(key)) continue;
                if (!isWalkable(neighbor.x, neighbor.y)) continue;

                const g = current.g + 1;
                const h = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
                const f = g + h;

                const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (existing) {
                    if (g < existing.g) {
                        existing.g = g;
                        existing.f = f;
                        existing.parent = current;
                    }
                } else {
                    openSet.push({ x: neighbor.x, y: neighbor.y, g, h, f, parent: current });
                }
            }
        }

        return null; // 无法到达
    }

    /**
     * 设置角色动作
     * @param {string} characterId - 角色ID
     * @param {string} action - 动作名
     * @param {boolean} loop - 是否循环
     * @param {number} duration - 持续时间（毫秒）
     */
    setCharacterAction(characterId, action, loop = false, duration = 0) {
        const char = this.characters.find(c => c.id === characterId);
        if (!char) return { success: false, error: '角色不存在' };

        char.action = action;

        // 如果是非循环动作，设置定时器恢复idle
        if (!loop && duration > 0) {
            setTimeout(() => {
                char.action = 'idle';
                this.render();
            }, duration);
        }

        this.render();
        return { success: true };
    }

    /**
     * 获取所有角色位置（供AI使用）
     */
    getCharactersState() {
        return this.characters.map(c => ({
            id: c.id,
            gridX: c.gridX,
            gridY: c.gridY,
            action: c.action,
            moving: c.moving,
            targetX: c.path.length > 0 ? c.path[c.path.length - 1].x : undefined,
            targetY: c.path.length > 0 ? c.path[c.path.length - 1].y : undefined
        }));
    }

    /**
     * 获取地图碰撞数据（供AI使用）
     */
    getMapCollision() {
        return {
            width: this.mapWidth,
            height: this.mapHeight,
            collision: this.collision
        };
    }

    /**
     * 添加新角色
     */
    addCharacter(config) {
        const char = {
            id: config.id,
            gridX: config.gridX || 0,
            gridY: config.gridY || 0,
            sprite: config.sprite || null,
            color: config.color || '#4CAF50',
            action: 'idle',
            frame: 0,
            totalFrames: config.totalFrames || 4,
            moving: false,
            path: [],
            pathIndex: 0
        };

        this.characters.push(char);
        this.updateDebugPanel();
        this.render();

        return { success: true };
    }

    /**
     * 移除角色
     */
    removeCharacter(characterId) {
        const index = this.characters.findIndex(c => c.id === characterId);
        if (index >= 0) {
            this.characters.splice(index, 1);
            this.updateDebugPanel();
            this.render();
            return { success: true };
        }
        return { success: false, error: '角色不存在' };
    }

    // ========== UI辅助 ==========

    showChatBox(message) {
        if (this.chatBox) {
            const msgEl = document.getElementById('chatMessage');
            if (msgEl) msgEl.textContent = message;
            this.chatBox.classList.add('show');

            // 3秒后隐藏
            setTimeout(() => this.hideChatBox(), 3000);
        }
    }

    hideChatBox() {
        if (this.chatBox) {
            this.chatBox.classList.remove('show');
        }
    }

    updateDebugPanel(selectedId = null) {
        const mapEl = document.getElementById('debugMap');
        const charsEl = document.getElementById('debugChars');
        const selectedEl = document.getElementById('debugSelected');

        if (mapEl) mapEl.textContent = `${this.mapWidth}×${this.mapHeight}`;
        if (charsEl) charsEl.textContent = this.characters.length;
        if (selectedEl) selectedEl.textContent = selectedId || '无';
    }

    // ========== 资源加载 ==========

    /**
     * 加载PNG资源
     */
    async loadSprite(url) {
        const img = new Image();
        img.src = url;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
        });
        return img;
    }

    /**
     * 设置地图数据（从API加载）
     */
    async setMapData(mapData) {
        this.mapWidth = mapData.width;
        this.mapHeight = mapData.height;
        this.collision = mapData.collision;

        if (mapData.sprite) {
            this.mapSprite = await this.loadSprite(mapData.sprite);
        }

        this.updateCanvasSize();
        this.updateDebugPanel();
    }

    // ========== 清理 ==========

    destroy() {
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
        }
        window.removeEventListener('resize', this.updateCanvasSize);
        this.characters = [];
        this.collision = [];
    }
}