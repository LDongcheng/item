/**
 * 像素画编辑器 - 主逻辑
 * 用于生成虚拟世界的角色、建筑等像素数据
 */
export default class PixelEditorPage {
    constructor(container) {
        this.container = container;
        this.colorPalette = null;       // 调色板数据（color.json）
        this.colorSet = new Set();      // 有效颜色集合（用于验证）
        this.colorIndexMap = new Map(); // 颜色->索引映射
        this.canvasWidth = 41;          // 画布宽度
        this.canvasHeight = 41;         // 画布高度
        this.pixelData = [];            // 像素数据二维数组
        this.currentColor = null;       // 当前选中颜色（null=透明）
        this.currentTool = 'brush';     // 当前工具
        this.isDrawing = false;         // 是否正在绘制
        this.lastDrawPos = null;        // 上次绘制位置
        this.exportFormat = 'hex';      // 导出格式：'hex' 或 'index'

        // 选框工具状态已移除

        // 参考图层状态
        this.referenceImage = null;     // 参考图片元素
        this.referenceData = null;      // 参考图片数据URL
        this.refOffsetX = 0;            // 参考图X偏移
        this.refOffsetY = 0;            // 参考图Y偏移
        this.refScale = 100;            // 参考图缩放百分比
        this.refOpacity = 50;           // 参考图透明度

        this.init();
    }

    async init() {
        // 加载HTML
        await this.loadHTML();
        // 加载CSS
        this.loadCSS();
        // 加载调色板
        await this.loadColorPalette();
        // 初始化画布
        this.initPixelData();
        this.renderPixelGrid();
        // 绑定事件
        this.bindEvents();
        // 绑定快捷键
        this.bindShortcuts();
        // 更新状态
        this.updateStats();
    }

    async loadHTML() {
        // 直接使用内联HTML，避免fetch路径问题
        this.container.innerHTML = this.getInlineHTML();
    }

    getInlineHTML() {
        // 返回index.html的内容（CSS已内联）
        return `
<section class="pixel-editor-page">
    <style>
:root {
    --pixel-bg: #fbebd3;
    --pixel-border: #181818;
    --pixel-text: #181818;
    --pixel-accent: #4CAF50;
    --pixel-accent-dark: #388E3C;
    --pixel-panel-bg: #d4c4a8;
    --pixel-btn-bg: #e8d8bc;
    --pixel-btn-active: #c8b898;
    --pixel-grid-line: #c0b090;
}
.pixel-editor-page {
    width: 100%;
    height: 100vh;
    background-color: var(--pixel-bg);
    font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
    display: flex;
    flex-direction: column;
    color: var(--pixel-text);
}
.editor-toolbar {
    height: 40px;
    background-color: var(--pixel-panel-bg);
    border-bottom: 2px solid var(--pixel-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
}
.toolbar-title { font-size: 16px; font-weight: bold; margin: 0; }
.toolbar-right { display: flex; gap: 8px; }
.toolbar-btn {
    padding: 6px 12px;
    background-color: var(--pixel-btn-bg);
    border: 2px solid var(--pixel-border);
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
}
.toolbar-btn:hover { background-color: var(--pixel-btn-active); }
.toolbar-btn.primary { background-color: var(--pixel-accent); color: white; border-color: var(--pixel-accent-dark); }
.editor-main { flex: 1; display: flex; overflow: hidden; }
.tool-panel {
    width: 200px;
    background-color: var(--pixel-panel-bg);
    border-right: 2px solid var(--pixel-border);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
}
.panel-section {
    background-color: var(--pixel-btn-bg);
    border: 2px solid var(--pixel-border);
    border-radius: 4px;
    padding: 8px;
}
.section-title { font-size: 12px; font-weight: bold; margin-bottom: 8px; color: var(--pixel-border); }
.tool-buttons { display: flex; gap: 4px; flex-wrap: wrap; }
.tool-btn {
    width: 40px;
    height: 40px;
    background-color: var(--pixel-bg);
    border: 2px solid var(--pixel-border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
}
.tool-btn:hover { background-color: var(--pixel-btn-active); }
.tool-btn.active { background-color: var(--pixel-accent); border-color: var(--pixel-accent-dark); color: white; }
.size-inputs { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.size-input {
    width: 50px;
    padding: 4px;
    border: 2px solid var(--pixel-border);
    border-radius: 2px;
    background-color: var(--pixel-bg);
    font-size: 12px;
    text-align: center;
}
.size-separator { font-weight: bold; }
.size-btn { padding: 4px 8px; background-color: var(--pixel-accent); color: white; border: 2px solid var(--pixel-accent-dark); border-radius: 4px; font-size: 12px; cursor: pointer; }
.current-color { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.color-preview {
    width: 32px;
    height: 32px;
    border: 2px solid var(--pixel-border);
    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}
.color-preview.has-color { background-image: none; }
.color-value { font-size: 12px; font-family: monospace; }
.transparent-btn { width: 100%; padding: 6px; background-color: var(--pixel-bg); border: 2px solid var(--pixel-border); border-radius: 4px; font-size: 12px; cursor: pointer; }
.transparent-btn.active { background-color: #ff6b6b; border-color: #cc5555; }
.palette-section { flex: 1; min-height: 150px; overflow-y: auto; }
.palette-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px; }
.palette-color { width: 16px; height: 16px; border: 1px solid var(--pixel-border); cursor: pointer; }
.palette-color:hover { transform: scale(1.2); }
.palette-color.selected { border: 2px solid var(--pixel-accent); }
.canvas-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: var(--pixel-bg); overflow: auto; position: relative; }
.reference-layer { position: absolute; top: 10px; left: 10px; z-index: 1; }
.reference-image { max-width: 300px; max-height: 300px; opacity: 0.5; border: 1px dashed #888; display: block; margin-bottom: 8px; }
.reference-controls { background-color: var(--pixel-panel-bg); border: 2px solid var(--pixel-border); padding: 8px; margin-top: 4px; display: flex; flex-direction: column; gap: 8px; }
.ref-control-row { display: flex; align-items: center; gap: 4px; }
.ref-label { font-size: 12px; min-width: 40px; }
.ref-value { font-size: 12px; min-width: 40px; text-align: center; font-family: monospace; }
.ref-adjust-btn { width: 24px; height: 24px; background-color: var(--pixel-btn-bg); border: 2px solid var(--pixel-border); border-radius: 4px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.ref-adjust-btn:hover { background-color: var(--pixel-btn-active); }
.ref-adjust-btn:active { background-color: var(--pixel-accent); color: white; }
.ref-btn { padding: 6px 12px; background-color: #ff6b6b; color: white; border: 2px solid #cc5555; border-radius: 4px; font-size: 12px; cursor: pointer; }
.upload-ref-btn { padding: 10px 16px; background-color: var(--pixel-accent); color: white; border: 2px solid var(--pixel-accent-dark); border-radius: 4px; font-size: 14px; cursor: pointer; font-weight: bold; }
.canvas-container { position: relative; display: inline-block; z-index: 10; }
.pixel-grid {
    display: grid;
    border: 2px solid var(--pixel-border);
    background-color: transparent;
}
.pixel-cell { width: 12px; height: 12px; border: 1px solid rgba(0,0,0,0.1); cursor: crosshair; background-color: transparent; }
.pixel-cell:hover { border-color: var(--pixel-border); }
.pixel-cell.has-color { background-image: none; }
.info-panel { width: 150px; background-color: var(--pixel-panel-bg); border-left: 2px solid var(--pixel-border); padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.pixel-stats { display: flex; flex-direction: column; gap: 4px; }
.stat-item { display: flex; justify-content: space-between; font-size: 12px; }
.stat-label { color: #888; }
.stat-value { font-weight: bold; }
.shortcut-list { display: flex; flex-direction: column; gap: 4px; }
.shortcut-item { font-size: 11px; }
.shortcut-item kbd { background-color: var(--pixel-bg); border: 1px solid var(--pixel-border); border-radius: 2px; padding: 1px 4px; font-family: monospace; margin-right: 4px; }
.editor-statusbar { height: 24px; background-color: var(--pixel-panel-bg); border-top: 2px solid var(--pixel-border); padding: 4px 16px; font-size: 12px; }
.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal-content { background-color: var(--pixel-panel-bg); border: 4px solid var(--pixel-border); border-radius: 8px; max-width: 500px; width: 90%; max-height: 80vh; overflow: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 2px solid var(--pixel-border); }
.modal-header h2 { font-size: 16px; margin: 0; }
.modal-close { background: none; border: none; font-size: 20px; cursor: pointer; }
.modal-body { padding: 16px; }
.export-textarea, .import-textarea { width: 100%; height: 200px; background-color: var(--pixel-bg); border: 2px solid var(--pixel-border); padding: 8px; font-family: monospace; font-size: 10px; resize: vertical; }
.export-error, .import-error { color: #ff6b6b; font-size: 12px; margin-top: 8px; padding: 8px; background-color: rgba(255, 107, 107, 0.1); border: 1px solid #ff6b6b; border-radius: 4px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 2px solid var(--pixel-border); }
.modal-btn { padding: 8px 16px; background-color: var(--pixel-btn-bg); border: 2px solid var(--pixel-border); border-radius: 4px; font-size: 12px; cursor: pointer; }
.modal-btn.primary { background-color: var(--pixel-accent); color: white; border-color: var(--pixel-accent-dark); }
@media (max-width: 900px) { .tool-panel { width: 160px; } .info-panel { width: 120px; } .pixel-cell { width: 10px; height: 10px; } .palette-color { width: 12px; height: 12px; } }
@media (max-width: 600px) { .tool-panel, .info-panel { width: 100px; font-size: 10px; } .pixel-cell { width: 8px; height: 8px; } }
    </style>
    <header class="editor-toolbar">
        <div class="toolbar-left"><h1 class="toolbar-title">像素画编辑器</h1></div>
        <div class="toolbar-right">
            <button class="toolbar-btn" id="btnNew">新建</button>
            <button class="toolbar-btn" id="btnClear">清空</button>
            <button class="toolbar-btn primary" id="btnExport">导出</button>
            <button class="toolbar-btn" id="btnImport">导入</button>
        </div>
    </header>
    <main class="editor-main">
        <aside class="tool-panel">
            <div class="panel-section">
                <div class="section-title">工具</div>
                <div class="tool-buttons">
                    <button class="tool-btn active" data-tool="brush" title="画笔(B)">✏️</button>
                    <button class="tool-btn" data-tool="eraser" title="橡皮擦(E)">🧹</button>
                    <button class="tool-btn" data-tool="fill" title="填充(F)">🪣</button>
                </div>
            </div>
            <div class="panel-section">
                <div class="section-title">画布尺寸</div>
                <div class="size-inputs">
                    <input type="number" id="canvasWidth" value="41" min="4" max="128" class="size-input">
                    <span class="size-separator">×</span>
                    <input type="number" id="canvasHeight" value="41" min="4" max="128" class="size-input">
                    <button class="size-btn" id="btnResize">应用</button>
                </div>
            </div>
            <div class="panel-section">
                <div class="section-title">当前颜色</div>
                <div class="current-color">
                    <div class="color-preview" id="colorPreview"></div>
                    <span class="color-value" id="colorValue">透明</span>
                </div>
                <div style="display:flex;gap:4px;">
                    <button class="transparent-btn" id="btnTransparent" style="flex:1">透明色</button>
                    <button class="transparent-btn" id="btnWhite" style="flex:1;background:#FFFFFF;border-color:#181818;">白色</button>
                </div>
            </div>
            <div class="panel-section palette-section">
                <div class="section-title">调色板</div>
                <div class="palette-grid" id="paletteGrid"></div>
            </div>
        </aside>
        <div class="canvas-area">
            <div class="canvas-container" id="canvasContainer">
                <div class="pixel-grid" id="pixelGrid"></div>
            </div>
            <!-- 参考图层放在画布右上角 -->
            <div class="reference-layer" id="referenceLayer">
                <input type="file" id="referenceInput" accept="image/*" style="display:none">
                <img id="referenceImage" class="reference-image" style="display:none">
                <div class="reference-controls" id="referenceControls" style="display:none">
                    <div class="ref-control-row">
                        <span class="ref-label">透明度</span>
                        <button class="ref-adjust-btn" id="btnOpacityDown">-</button>
                        <span class="ref-value" id="opacityValue">50%</span>
                        <button class="ref-adjust-btn" id="btnOpacityUp">+</button>
                    </div>
                    <div class="ref-control-row">
                        <span class="ref-label">大小</span>
                        <button class="ref-adjust-btn" id="btnScaleDown">-</button>
                        <span class="ref-value" id="scaleValue">100%</span>
                        <button class="ref-adjust-btn" id="btnScaleUp">+</button>
                    </div>
                    <button class="ref-btn" id="btnRemoveReference">移除</button>
                </div>
                <button class="upload-ref-btn" id="btnUploadReference">+参考图</button>
            </div>
        </div>
        <aside class="info-panel">
            <div class="panel-section">
                <div class="section-title">像素统计</div>
                <div class="pixel-stats">
                    <div class="stat-item"><span class="stat-label">总像素:</span><span class="stat-value" id="totalPixels">1681</span></div>
                    <div class="stat-item"><span class="stat-label">已绘制:</span><span class="stat-value" id="drawnPixels">0</span></div>
                    <div class="stat-item"><span class="stat-label">透明:</span><span class="stat-value" id="transparentPixels">1681</span></div>
                </div>
            </div>
            <div class="panel-section">
                <div class="section-title">快捷键</div>
                <div class="shortcut-list">
                    <div class="shortcut-item"><kbd>B</kbd> 画笔</div>
                    <div class="shortcut-item"><kbd>E</kbd> 橿皮擦</div>
                    <div class="shortcut-item"><kbd>F</kbd> 填充</div>
                    <div class="shortcut-item"><kbd>T</kbd> 透明色</div>
                    <div class="shortcut-item"><kbd>↑↓←→</kbd> 移动参考图</div>
                    <div class="shortcut-item"><kbd>Ctrl+S</kbd> 导出</div>
                </div>
            </div>
        </aside>
    </main>
    <footer class="editor-statusbar">
        <span class="status-text" id="statusText">就绪 - 选择工具开始绘制</span>
    </footer>
    <div class="modal" id="exportModal" style="display:none">
        <div class="modal-content" style="max-width:550px;">
            <div class="modal-header"><h2>导出像素画</h2><button class="modal-close" id="closeExportModal">×</button></div>
            <div class="modal-body">
                <div class="export-tabs" style="display:flex;gap:8px;margin-bottom:12px;">
                    <button class="export-tab active" id="tabHex" style="padding:6px 12px;background:#e8d8bc;border:2px solid #181818;border-radius:4px;cursor:pointer;">颜色格式</button>
                    <button class="export-tab" id="tabIndex" style="padding:6px 12px;background:#e8d8bc;border:2px solid #181818;border-radius:4px;cursor:pointer;">数字格式</button>
                </div>
                <textarea id="exportTextarea" class="export-textarea" readonly></textarea>
                <div class="export-error" id="exportError" style="display:none"></div>
                <div class="export-info" style="font-size:11px;color:#888;margin-top:8px;">
                    <span id="exportInfoText">颜色格式：HEX字符串如"181818"，null为透明</span>
                </div>
            </div>
            <div class="modal-footer" style="display:flex;justify-content:space-between;">
                <div style="display:flex;gap:8px;">
                    <button class="modal-btn" id="btnCopyExport">复制JSON</button>
                    <button class="modal-btn" id="btnDownloadExport">下载JSON</button>
                </div>
                <button class="modal-btn primary" id="btnExportPng" style="background:#2196F3;border-color:#1976D2;">导出PNG图片</button>
            </div>
        </div>
    </div>
    <div class="modal" id="importModal" style="display:none">
        <div class="modal-content">
            <div class="modal-header"><h2>导入JSON数据</h2><button class="modal-close" id="closeImportModal">×</button></div>
            <div class="modal-body"><textarea id="importTextarea" class="import-textarea" placeholder="粘贴JSON数据..."></textarea><div class="import-error" id="importError" style="display:none"></div></div>
            <div class="modal-footer"><button class="modal-btn primary" id="btnConfirmImport">导入</button></div>
        </div>
    </div>
</section>`;
    }

    loadCSS() {
        // CSS已内联到HTML中，无需动态加载
    }

    async loadColorPalette() {
        // 先设置默认调色板作为fallback
        this.setDefaultPalette();

        try {
            // 尝试加载color.json
            const response = await fetch('./color.json');
            if (response.ok) {
                this.colorPalette = await response.json();
                this.buildColorSet();
                console.log('调色板加载成功，共', this.colorSet.size, '种颜色');
            } else {
                console.warn('color.json加载失败，使用默认调色板');
            }
        } catch (error) {
            console.warn('加载color.json失败:', error, '使用默认调色板');
        }

        // 渲染调色板
        this.renderPalette();
        this.updateStatus('调色板已加载');
    }

    setDefaultPalette() {
        // color.json的默认数据（110种颜色）
        this.colorPalette = [
            ["E2E2E2","CBCBCB","B5B5B5","9E9E9E","888888","717171","5B5B5B","444444","2E2E2E","181818"],
            ["FED7DC","FFC2C2","FF9999","FE7171","FD4949","E83B3B","CE2525","BF1717","AD0E0E","930303"],
            ["FFD0B0","FFBC8F","FFAE71","FF9F50","FF8F29","EF7C1D","D86916","C1560E","A3490C","753205"],
            ["FFE6BB","FED081","FFD066","FFC229","EDA900","D38200","BF7100","A05B00","8C4C00","753D00"],
            ["FFFAC2","FFFB76","FFFF39","F4F400","E2DC00","CEC300","B2A100","998600","7F6D00","605000"],
            ["D2FF80","BEFB4B","ABF226","9CE515","8DD507","83BC08","7DAA00","6F8E00","647C00","526000"],
            ["97FFA1","78F988","60EF70","46E860","2ADD58","24C646","14B22E","0D9E1E","078E11","007205"],
            ["ADF8FF","86F5FD","53F2FD","47E5F0","2CD2DB","44AAAD","379999","238481","16706B","0D605A"],
            ["B3E4FF","94D4FF","7BC3FF","66B3FF","4D9EFF","3B95ED","2A87D3","1C79B7","1371A5","096993"],
            ["E1E3FE","D1D4FF","BDC1FF","A9AFFE","8591E8","6A7BD3","5569BF","425AA5","324F96","214182"],
            ["F4D1FF","EEC1FB","E9A7FB","E493FB","DF79FB","BF5AE0","AB4DCE","923CBA","7D2CA8","64238E"]
        ];
        this.buildColorSet();
    }

    buildColorSet() {
        this.colorSet.clear();
        this.colorIndexMap.clear();
        if (this.colorPalette) {
            for (let rowIdx = 0; rowIdx < this.colorPalette.length; rowIdx++) {
                for (let colIdx = 0; colIdx < this.colorPalette[rowIdx].length; colIdx++) {
                    const color = this.colorPalette[rowIdx][colIdx];
                    this.colorSet.add(color);
                    // 索引 = 行号 * 10 + 列号 (0-109)
                    const index = rowIdx * 10 + colIdx;
                    this.colorIndexMap.set(color, index);
                }
            }
        }
        // 添加白色作为特殊颜色（索引 -1）
        this.colorSet.add('FFFFFF');
    }

    // 颜色转数字索引
    // -2 = 透明, -1 = 白色(#FFFFFF), 0-109 = 调色板颜色
    colorToIndex(color) {
        if (color === null) return -2;
        if (color === 'FFFFFF') return -1;
        const index = this.colorIndexMap.get(color);
        return index !== undefined ? index : -2;
    }

    // 数字索引转颜色
    indexToColor(index) {
        if (index === -2) return null;
        if (index === -1) return 'FFFFFF';
        if (index >= 0 && index < 110) {
            const row = Math.floor(index / 10);
            const col = index % 10;
            return this.colorPalette[row][col];
        }
        return null;
    }

    renderPalette() {
        const paletteGrid = document.getElementById('paletteGrid');
        if (!paletteGrid) {
            console.error('找不到 paletteGrid 元素');
            return;
        }
        if (!this.colorPalette) {
            console.error('调色板数据为空');
            return;
        }

        paletteGrid.innerHTML = '';

        for (let rowIdx = 0; rowIdx < this.colorPalette.length; rowIdx++) {
            for (let colIdx = 0; colIdx < this.colorPalette[rowIdx].length; colIdx++) {
                const colorHex = this.colorPalette[rowIdx][colIdx];
                const colorDiv = document.createElement('div');
                colorDiv.className = 'palette-color';
                colorDiv.style.backgroundColor = '#' + colorHex;
                colorDiv.style.width = '14px';
                colorDiv.style.height = '14px';
                colorDiv.style.border = '1px solid #181818';
                colorDiv.style.cursor = 'pointer';
                colorDiv.style.display = 'inline-block';
                colorDiv.dataset.color = colorHex;
                colorDiv.title = '#' + colorHex;

                colorDiv.addEventListener('click', () => this.selectColor(colorHex));
                paletteGrid.appendChild(colorDiv);
            }
        }
        console.log('调色板渲染完成，颜色数量:', paletteGrid.children.length);
    }

    selectColor(colorHex) {
        // 验证颜色是否在调色板范围内
        if (!this.colorSet.has(colorHex)) {
            this.updateStatus('错误: 颜色不在调色板范围内');
            return;
        }

        this.currentColor = colorHex;
        this.currentTool = 'brush';
        this.updateToolButtons();
        this.updateColorDisplay();

        // 更新调色板选中状态
        document.querySelectorAll('.palette-color').forEach(el => {
            el.classList.toggle('selected', el.dataset.color === colorHex);
        });

        this.updateStatus('已选择颜色: #' + colorHex);
    }

    selectTransparent() {
        this.currentColor = null;
        this.currentTool = 'eraser';
        this.updateToolButtons();
        this.updateColorDisplay();

        // 清除调色板选中状态
        document.querySelectorAll('.palette-color').forEach(el => {
            el.classList.remove('selected');
        });

        // 更新透明按钮状态
        const transparentBtn = document.getElementById('btnTransparent');
        if (transparentBtn) {
            transparentBtn.classList.add('active');
        }

        this.updateStatus('已选择透明色（橡皮擦模式）');
    }

    selectWhite() {
        this.currentColor = 'FFFFFF';
        this.currentTool = 'brush';
        this.updateToolButtons();
        this.updateColorDisplay();

        // 清除调色板选中状态
        document.querySelectorAll('.palette-color').forEach(el => {
            el.classList.remove('selected');
        });

        // 更新按钮状态
        const transparentBtn = document.getElementById('btnTransparent');
        if (transparentBtn) {
            transparentBtn.classList.remove('active');
        }
        const whiteBtn = document.getElementById('btnWhite');
        if (whiteBtn) {
            whiteBtn.classList.add('active');
            whiteBtn.style.background = '#4CAF50';
            whiteBtn.style.color = 'white';
        }

        this.updateStatus('已选择白色: #FFFFFF');
    }

    updateColorDisplay() {
        const colorPreview = document.getElementById('colorPreview');
        const colorValue = document.getElementById('colorValue');
        const transparentBtn = document.getElementById('btnTransparent');
        const whiteBtn = document.getElementById('btnWhite');

        if (colorPreview) {
            if (this.currentColor) {
                colorPreview.style.backgroundColor = '#' + this.currentColor;
                colorPreview.classList.add('has-color');
            } else {
                colorPreview.style.backgroundColor = '';
                colorPreview.classList.remove('has-color');
            }
        }

        if (colorValue) {
            colorValue.textContent = this.currentColor ? '#' + this.currentColor : '透明';
        }

        if (transparentBtn) {
            transparentBtn.classList.toggle('active', this.currentColor === null);
        }

        if (whiteBtn) {
            const isWhite = this.currentColor === 'FFFFFF';
            whiteBtn.classList.toggle('active', isWhite);
            if (isWhite) {
                whiteBtn.style.background = '#4CAF50';
                whiteBtn.style.color = 'white';
            } else {
                whiteBtn.style.background = '#FFFFFF';
                whiteBtn.style.color = '#181818';
            }
        }
    }

    setTool(tool) {
        this.currentTool = tool;
        this.updateToolButtons();

        // 如果切换到橡皮擦，自动选择透明色
        if (tool === 'eraser' && this.currentColor !== null) {
            this.selectTransparent();
        }

        this.updateStatus('工具: ' + this.getToolName(tool));
    }

    getToolName(tool) {
        const names = { brush: '画笔', eraser: '橡皮擦', fill: '填充' };
        return names[tool] || tool;
    }

    updateToolButtons() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === this.currentTool);
        });
    }

    initPixelData() {
        this.pixelData = [];
        for (let y = 0; y < this.canvasHeight; y++) {
            this.pixelData[y] = [];
            for (let x = 0; x < this.canvasWidth; x++) {
                this.pixelData[y][x] = null;
            }
        }
    }

    renderPixelGrid() {
        const pixelGrid = document.getElementById('pixelGrid');
        if (!pixelGrid) return;

        pixelGrid.innerHTML = '';
        pixelGrid.style.gridTemplateColumns = `repeat(${this.canvasWidth}, 12px)`;
        pixelGrid.style.gridTemplateRows = `repeat(${this.canvasHeight}, 12px)`;

        for (let y = 0; y < this.canvasHeight; y++) {
            for (let x = 0; x < this.canvasWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'pixel-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                const color = this.pixelData[y][x];
                if (color) {
                    cell.style.backgroundColor = '#' + color;
                    cell.classList.add('has-color');
                }

                pixelGrid.appendChild(cell);
            }
        }

        this.updateStats();
    }

    bindEvents() {
        // 工具按钮
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setTool(btn.dataset.tool));
        });

        // 透明色按钮
        const transparentBtn = document.getElementById('btnTransparent');
        if (transparentBtn) {
            transparentBtn.addEventListener('click', () => this.selectTransparent());
        }

        // 白色按钮
        const whiteBtn = document.getElementById('btnWhite');
        if (whiteBtn) {
            whiteBtn.addEventListener('click', () => this.selectWhite());
        }

        // 画布尺寸
        const btnResize = document.getElementById('btnResize');
        if (btnResize) {
            btnResize.addEventListener('click', () => this.resizeCanvas());
        }

        // 清空
        const btnClear = document.getElementById('btnClear');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                if (confirm('确定清空画布？')) this.clearCanvas();
            });
        }

        // 新建
        const btnNew = document.getElementById('btnNew');
        if (btnNew) {
            btnNew.addEventListener('click', () => {
                if (confirm('确定新建画布？当前内容将丢失')) {
                    this.initPixelData();
                    this.renderPixelGrid();
                    this.updateStatus('画布已新建');
                }
            });
        }

        // 导出
        const btnExport = document.getElementById('btnExport');
        if (btnExport) {
            btnExport.addEventListener('click', () => this.showExportModal());
        }

        // 导入
        const btnImport = document.getElementById('btnImport');
        if (btnImport) {
            btnImport.addEventListener('click', () => this.showImportModal());
        }

        // 画布鼠标事件
        const pixelGrid = document.getElementById('pixelGrid');
        if (pixelGrid) {
            pixelGrid.addEventListener('mousedown', (e) => this.handleMouseDown(e));
            pixelGrid.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            pixelGrid.addEventListener('mouseup', () => this.handleMouseUp());
            pixelGrid.addEventListener('mouseleave', () => this.handleMouseUp());

            // 触摸支持
            pixelGrid.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            pixelGrid.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            pixelGrid.addEventListener('touchend', () => this.handleMouseUp());
        }

        // 参考图上传
        const btnUploadReference = document.getElementById('btnUploadReference');
        const referenceInput = document.getElementById('referenceInput');
        if (btnUploadReference && referenceInput) {
            btnUploadReference.addEventListener('click', () => referenceInput.click());
            referenceInput.addEventListener('change', (e) => this.loadReferenceImage(e));
        }

        // 参考图控制（加减按钮）
        const btnOpacityDown = document.getElementById('btnOpacityDown');
        const btnOpacityUp = document.getElementById('btnOpacityUp');
        const btnScaleDown = document.getElementById('btnScaleDown');
        const btnScaleUp = document.getElementById('btnScaleUp');
        const btnRemoveReference = document.getElementById('btnRemoveReference');

        if (btnOpacityDown) {
            btnOpacityDown.addEventListener('click', () => {
                this.refOpacity = Math.max(0, this.refOpacity - 10);
                this.updateReferenceDisplay();
            });
        }

        if (btnOpacityUp) {
            btnOpacityUp.addEventListener('click', () => {
                this.refOpacity = Math.min(100, this.refOpacity + 10);
                this.updateReferenceDisplay();
            });
        }

        if (btnScaleDown) {
            btnScaleDown.addEventListener('click', () => {
                this.refScale = Math.max(10, this.refScale - 10);
                this.updateReferenceDisplay();
            });
        }

        if (btnScaleUp) {
            btnScaleUp.addEventListener('click', () => {
                this.refScale = this.refScale + 10; // 无上限
                this.updateReferenceDisplay();
            });
        }

        if (btnRemoveReference) {
            btnRemoveReference.addEventListener('click', () => this.removeReferenceImage());
        }

        // 弹窗事件
        this.bindModalEvents();
    }

    bindModalEvents() {
        // 导出弹窗
        const closeExportModal = document.getElementById('closeExportModal');
        const btnCopyExport = document.getElementById('btnCopyExport');
        const btnDownloadExport = document.getElementById('btnDownloadExport');
        const btnExportPng = document.getElementById('btnExportPng');

        if (closeExportModal) {
            closeExportModal.addEventListener('click', () => this.hideExportModal());
        }

        if (btnCopyExport) {
            btnCopyExport.addEventListener('click', () => this.copyExportToClipboard());
        }

        if (btnDownloadExport) {
            btnDownloadExport.addEventListener('click', () => this.downloadExport());
        }

        if (btnExportPng) {
            btnExportPng.addEventListener('click', () => this.exportPng());
        }

        // 导出格式tab切换
        const tabHex = document.getElementById('tabHex');
        const tabIndex = document.getElementById('tabIndex');
        if (tabHex) {
            tabHex.addEventListener('click', () => {
                this.exportFormat = 'hex';
                tabHex.classList.add('active');
                tabHex.style.background = '#4CAF50';
                tabHex.style.color = 'white';
                if (tabIndex) {
                    tabIndex.classList.remove('active');
                    tabIndex.style.background = '#e8d8bc';
                    tabIndex.style.color = '#181818';
                }
                this.updateExportContent();
            });
        }
        if (tabIndex) {
            tabIndex.addEventListener('click', () => {
                this.exportFormat = 'index';
                tabIndex.classList.add('active');
                tabIndex.style.background = '#4CAF50';
                tabIndex.style.color = 'white';
                if (tabHex) {
                    tabHex.classList.remove('active');
                    tabHex.style.background = '#e8d8bc';
                    tabHex.style.color = '#181818';
                }
                this.updateExportContent();
            });
        }

        // 导入弹窗
        const closeImportModal = document.getElementById('closeImportModal');
        const btnConfirmImport = document.getElementById('btnConfirmImport');

        if (closeImportModal) {
            closeImportModal.addEventListener('click', () => this.hideImportModal());
        }

        if (btnConfirmImport) {
            btnConfirmImport.addEventListener('click', () => this.confirmImport());
        }
    }

    bindShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S 导出
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.showExportModal();
                return;
            }

            // 方向键移动参考图（每次移动5像素）
            if (this.referenceData) {
                const moveStep = 5;
                switch (e.key) {
                    case 'ArrowUp':
                        this.refOffsetY -= moveStep;
                        this.updateReferenceStyle();
                        this.updateStatus('参考图向上移动');
                        return;
                    case 'ArrowDown':
                        this.refOffsetY += moveStep;
                        this.updateReferenceStyle();
                        this.updateStatus('参考图向下移动');
                        return;
                    case 'ArrowLeft':
                        this.refOffsetX -= moveStep;
                        this.updateReferenceStyle();
                        this.updateStatus('参考图向左移动');
                        return;
                    case 'ArrowRight':
                        this.refOffsetX += moveStep;
                        this.updateReferenceStyle();
                        this.updateStatus('参考图向右移动');
                        return;
                }
            }

            // 单键快捷键
            const shortcuts = {
                'b': 'brush',
                'e': 'eraser',
                'f': 'fill',
                't': 'transparent'
            };

            const key = e.key.toLowerCase();
            if (shortcuts[key]) {
                if (key === 't') {
                    this.selectTransparent();
                } else {
                    this.setTool(shortcuts[key]);
                }
            }
        });
    }

    handleMouseDown(e) {
        if (e.button !== 0) return; // 只响应左键

        const cell = e.target.closest('.pixel-cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        this.isDrawing = true;
        this.lastDrawPos = { x, y };
        this.applyTool(x, y);
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;

        const cell = e.target.closest('.pixel-cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        // 防止重复绘制同一位置
        if (this.lastDrawPos && this.lastDrawPos.x === x && this.lastDrawPos.y === y) return;

        this.lastDrawPos = { x, y };
        this.applyTool(x, y);
    }

    handleMouseUp() {
        this.isDrawing = false;
        this.lastDrawPos = null;
    }

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (cell && cell.classList.contains('pixel-cell')) {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            this.isDrawing = true;
            this.lastDrawPos = { x, y };
            this.applyTool(x, y);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY);
        if (cell && cell.classList.contains('pixel-cell')) {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            if (this.lastDrawPos && this.lastDrawPos.x === x && this.lastDrawPos.y === y) return;
            this.lastDrawPos = { x, y };
            this.applyTool(x, y);
        }
    }

    applyTool(x, y) {
        if (x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) return;

        switch (this.currentTool) {
            case 'brush':
                this.setPixel(x, y, this.currentColor);
                break;
            case 'eraser':
                this.setPixel(x, y, null);
                break;
            case 'fill':
                this.fillArea(x, y);
                break;
        }
    }

    setPixel(x, y, color) {
        if (x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) return;

        // 验证颜色
        if (color && !this.colorSet.has(color)) {
            this.updateStatus('错误: 颜色不在调色板范围内');
            return;
        }

        this.pixelData[y][x] = color;

        // 更新DOM
        const cell = document.querySelector(`.pixel-cell[data-x="${x}"][data-y="${y}"]`);
        if (cell) {
            if (color) {
                cell.style.backgroundColor = '#' + color;
                cell.classList.add('has-color');
            } else {
                cell.style.backgroundColor = '';
                cell.classList.remove('has-color');
            }
        }

        this.updateStats();
    }

    fillArea(startX, startY) {
        const targetColor = this.pixelData[startY][startX];
        const fillColor = this.currentColor;

        if (targetColor === fillColor) return;

        const stack = [[startX, startY]];
        const visited = new Set();

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) continue;
            if (this.pixelData[y][x] !== targetColor) continue;

            visited.add(key);
            this.setPixel(x, y, fillColor);

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        this.updateStatus('填充完成');
    }

    // ========== 参考图层 ==========

    loadReferenceImage(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.referenceData = event.target.result;

            const referenceImage = document.getElementById('referenceImage');
            const referenceControls = document.getElementById('referenceControls');
            const btnUploadReference = document.getElementById('btnUploadReference');

            if (referenceImage) {
                referenceImage.src = this.referenceData;
                referenceImage.style.display = 'block';
            }

            if (referenceControls) {
                referenceControls.style.display = 'flex';
            }

            if (btnUploadReference) {
                btnUploadReference.style.display = 'none';
            }

            this.updateReferenceDisplay();
            this.updateStatus('参考图已加载');

            // 绑定拖拽
            this.bindReferenceDrag();
        };
        reader.readAsDataURL(file);
    }

    bindReferenceDrag() {
        const referenceImage = document.getElementById('referenceImage');
        if (!referenceImage) return;

        let isDragging = false;
        let startX, startY;

        referenceImage.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - this.refOffsetX;
            startY = e.clientY - this.refOffsetY;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            this.refOffsetX = e.clientX - startX;
            this.refOffsetY = e.clientY - startY;
            this.updateReferenceStyle();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    updateReferenceStyle() {
        const referenceImage = document.getElementById('referenceImage');
        if (!referenceImage) return;

        referenceImage.style.opacity = this.refOpacity / 100;
        referenceImage.style.transform = `translate(${this.refOffsetX}px, ${this.refOffsetY}px) scale(${this.refScale / 100})`;
    }

    updateReferenceDisplay() {
        this.updateReferenceStyle();

        // 更新显示值
        const opacityValue = document.getElementById('opacityValue');
        const scaleValue = document.getElementById('scaleValue');

        if (opacityValue) {
            opacityValue.textContent = this.refOpacity + '%';
        }

        if (scaleValue) {
            scaleValue.textContent = this.refScale + '%';
        }
    }

    removeReferenceImage() {
        this.referenceData = null;

        const referenceImage = document.getElementById('referenceImage');
        const referenceControls = document.getElementById('referenceControls');
        const btnUploadReference = document.getElementById('btnUploadReference');

        if (referenceImage) {
            referenceImage.src = '';
            referenceImage.style.display = 'none';
        }

        if (referenceControls) {
            referenceControls.style.display = 'none';
        }

        if (btnUploadReference) {
            btnUploadReference.style.display = 'block';
        }

        this.updateStatus('参考图已移除');
    }

    // ========== 尺寸调整 ==========

    resizeCanvas() {
        const widthInput = document.getElementById('canvasWidth');
        const heightInput = document.getElementById('canvasHeight');

        if (!widthInput || !heightInput) return;

        const newWidth = Math.min(128, Math.max(4, parseInt(widthInput.value) || 41));
        const newHeight = Math.min(128, Math.max(4, parseInt(heightInput.value) || 41));

        widthInput.value = newWidth;
        heightInput.value = newHeight;

        // 保留现有数据
        const oldData = this.pixelData;
        const oldWidth = this.canvasWidth;
        const oldHeight = this.canvasHeight;

        this.canvasWidth = newWidth;
        this.canvasHeight = newHeight;
        this.initPixelData();

        // 复制旧数据
        for (let y = 0; y < Math.min(oldHeight, newHeight); y++) {
            for (let x = 0; x < Math.min(oldWidth, newWidth); x++) {
                if (oldData[y] && oldData[y][x]) {
                    this.pixelData[y][x] = oldData[y][x];
                }
            }
        }

        this.renderPixelGrid();
        this.updateStatus(`画布尺寸: ${newWidth}×${newHeight}`);
    }

    clearCanvas() {
        this.initPixelData();
        this.renderPixelGrid();
        this.updateStatus('画布已清空');
    }

    // ========== 导出导入 ==========

    showExportModal() {
        const modal = document.getElementById('exportModal');
        const textarea = document.getElementById('exportTextarea');
        const errorDiv = document.getElementById('exportError');
        const tabHex = document.getElementById('tabHex');
        const tabIndex = document.getElementById('tabIndex');

        if (!modal || !textarea) return;

        // 重置为颜色格式
        this.exportFormat = 'hex';
        if (tabHex) {
            tabHex.classList.add('active');
            tabHex.style.background = '#4CAF50';
            tabHex.style.color = 'white';
        }
        if (tabIndex) {
            tabIndex.classList.remove('active');
            tabIndex.style.background = '#e8d8bc';
            tabIndex.style.color = '#181818';
        }

        // 验证所有颜色
        const invalidColors = [];
        for (const row of this.pixelData) {
            for (const color of row) {
                if (color && !this.colorSet.has(color)) {
                    invalidColors.push(color);
                }
            }
        }

        if (errorDiv) {
            if (invalidColors.length > 0) {
                errorDiv.textContent = `警告: 发现${invalidColors.length}个颜色不在调色板范围内: ${invalidColors.join(', ')}`;
                errorDiv.style.display = 'block';
            } else {
                errorDiv.style.display = 'none';
            }
        }

        this.updateExportContent();
        modal.style.display = 'flex';
    }

    updateExportContent() {
        const textarea = document.getElementById('exportTextarea');
        const infoText = document.getElementById('exportInfoText');

        if (!textarea) return;

        let jsonData;
        if (this.exportFormat === 'index') {
            // 数字格式：-2=透明, -1=白色, 0-109=调色板颜色
            jsonData = this.pixelData.map(row =>
                row.map(color => this.colorToIndex(color))
            );
            if (infoText) {
                infoText.textContent = '数字格式：-2=透明, -1=白色(#FFFFFF), 0-109=调色板索引';
            }
        } else {
            // 颜色格式：HEX字符串或null
            jsonData = this.pixelData.map(row =>
                row.map(color => color === null ? null : color)
            );
            if (infoText) {
                infoText.textContent = '颜色格式：HEX字符串如"181818"，null为透明';
            }
        }

        textarea.value = JSON.stringify(jsonData, null, 2);
    }

    hideExportModal() {
        const modal = document.getElementById('exportModal');
        if (modal) modal.style.display = 'none';
    }

    copyExportToClipboard() {
        const textarea = document.getElementById('exportTextarea');
        if (!textarea) return;

        textarea.select();
        document.execCommand('copy');
        this.updateStatus('已复制到剪贴板');
    }

    downloadExport() {
        const textarea = document.getElementById('exportTextarea');
        if (!textarea) return;

        const blob = new Blob([textarea.value], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const suffix = this.exportFormat === 'index' ? '-index' : '';
        a.download = `pixel-${this.canvasWidth}x${this.canvasHeight}${suffix}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.updateStatus('JSON文件已下载');
    }

    exportPng() {
        // 创建Canvas绘制像素画
        const canvas = document.createElement('canvas');
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        const ctx = canvas.getContext('2d');

        // 禁用抗锯齿，保持像素化效果
        ctx.imageSmoothingEnabled = false;

        // 绘制每个像素
        for (let y = 0; y < this.canvasHeight; y++) {
            for (let x = 0; x < this.canvasWidth; x++) {
                const color = this.pixelData[y][x];
                if (color) {
                    ctx.fillStyle = '#' + color;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // 导出PNG
        canvas.toBlob((blob) => {
            if (!blob) {
                this.updateStatus('PNG导出失败');
                return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pixel-${this.canvasWidth}x${this.canvasHeight}.png`;
            a.click();
            URL.revokeObjectURL(url);
            this.updateStatus('PNG图片已下载');
        }, 'image/png');
    }

    showImportModal() {
        const modal = document.getElementById('importModal');
        const textarea = document.getElementById('importTextarea');
        const errorDiv = document.getElementById('importError');

        if (modal) modal.style.display = 'flex';
        if (textarea) textarea.value = '';
        if (errorDiv) errorDiv.style.display = 'none';
    }

    hideImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) modal.style.display = 'none';
    }

    confirmImport() {
        const textarea = document.getElementById('importTextarea');
        const errorDiv = document.getElementById('importError');

        if (!textarea) return;

        try {
            const data = JSON.parse(textarea.value);

            // 验证数据格式
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('数据格式错误: 必须是二维数组');
            }

            // 验证颜色
            const invalidColors = [];
            for (const row of data) {
                if (!Array.isArray(row)) {
                    throw new Error('数据格式错误: 每行必须是数组');
                }
                for (const color of row) {
                    if (color !== null && typeof color !== 'string') {
                        throw new Error('数据格式错误: 颜色必须是字符串或null');
                    }
                    if (color && !this.colorSet.has(color)) {
                        invalidColors.push(color);
                    }
                }
            }

            if (invalidColors.length > 0) {
                if (errorDiv) {
                    errorDiv.textContent = `警告: 发现${invalidColors.length}个颜色不在调色板范围内，这些像素将被设为透明`;
                    errorDiv.style.display = 'block';
                }
            }

            // 调整画布尺寸
            this.canvasHeight = data.length;
            this.canvasWidth = data[0].length;

            const widthInput = document.getElementById('canvasWidth');
            const heightInput = document.getElementById('canvasHeight');
            if (widthInput) widthInput.value = this.canvasWidth;
            if (heightInput) heightInput.value = this.canvasHeight;

            // 导入数据
            this.pixelData = data.map(row =>
                row.map(color => {
                    if (color === null) return null;
                    if (this.colorSet.has(color)) return color;
                    return null; // 无效颜色设为透明
                })
            );

            this.renderPixelGrid();
            this.hideImportModal();
            this.updateStatus(`导入成功: ${this.canvasWidth}×${this.canvasHeight}`);

        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = '导入失败: ' + error.message;
                errorDiv.style.display = 'block';
            }
        }
    }

    // ========== 统计更新 ==========

    updateStats() {
        const totalPixels = document.getElementById('totalPixels');
        const drawnPixels = document.getElementById('drawnPixels');
        const transparentPixels = document.getElementById('transparentPixels');

        const total = this.canvasWidth * this.canvasHeight;
        let drawn = 0;
        let transparent = 0;

        for (const row of this.pixelData) {
            for (const color of row) {
                if (color) drawn++;
                else transparent++;
            }
        }

        if (totalPixels) totalPixels.textContent = total;
        if (drawnPixels) drawnPixels.textContent = drawn;
        if (transparentPixels) transparentPixels.textContent = transparent;
    }

    updateStatus(text) {
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = text;
    }

    destroy() {
        this.colorPalette = null;
        this.pixelData = null;
        this.colorSet.clear();
    }
}