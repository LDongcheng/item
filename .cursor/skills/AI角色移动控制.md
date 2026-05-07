# AI角色移动控制

本 skill 提供AI控制像素角色在地图上移动的方法。

## 基础概念

### 格子系统
- 每个格子大小：41×41 像素
- 格子中心点：索引 (20, 20)，即第21个像素
- 坐标系：格子坐标 (gridX, gridY)，左上角为 (0, 0)

### 碰撞数据格式
地图碰撞数据为二维数组，0=可通行，1=障碍：
```json
{
  "collision": [
    [0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,0,0]
  ],
  "width": 10,
  "height": 5
}
```

---

## API接口

### 获取地图数据

**接口地址**：`{API_URL}/map/{mapId}`

**返回格式**：
```json
{
  "mapId": "map_001",
  "sprite": "map_001.png",
  "gridSize": 41,
  "width": 20,
  "height": 15,
  "collision": [...]
}
```

### 获取角色状态

**接口地址**：`{API_URL}/character/{characterId}`

**返回格式**：
```json
{
  "id": "npc_001",
  "gridX": 5,
  "gridY": 3,
  "action": "idle",
  "frame": 0,
  "moving": false
}
```

### 获取所有角色位置

**接口地址**：`{API_URL}/characters`

**返回格式**：
```json
[
  { "id": "npc_001", "gridX": 5, "gridY": 3, "moving": false },
  { "id": "npc_002", "gridX": 7, "gridY": 5, "moving": true, "targetX": 8, "targetY": 5 }
]
```

### 发送移动指令

**接口地址**：`{API_URL}/character/{characterId}/move`

**请求格式**：
```json
{
  "path": [
    { "x": 5, "y": 3 },
    { "x": 6, "y": 3 },
    { "x": 7, "y": 3 },
    { "x": 8, "y": 3 }
  ]
}
```

**返回格式**：
```json
{
  "success": true,
  "message": "移动指令已执行"
}
```

**失败返回**：
```json
{
  "success": false,
  "error": "路径碰撞",
  "blocker": { "x": 7, "y": 3, "type": "character", "id": "npc_002" }
}
```

---

## 路线生成方法

### 方法：generatePath

根据起点、终点和碰撞数据生成可行路线（A*寻路简化版）。

**参数**：
- `start` - 起点 `{x, y}`
- `end` - 终点 `{x, y}`
- `collision` - 地图碰撞数据（二维数组）
- `characters` - 其他角色当前位置数组

**返回**：
- 路线数组 `[{x,y}, {x,y}, ...]` 或 `null`（无法到达）

**示例代码**：

```javascript
/**
 * A*寻路算法简化版（四方向移动）
 */
function generatePath(start, end, collision, characters) {
  const width = collision[0].length;
  const height = collision.length;

  // 构建动态障碍（包含其他角色位置）
  const dynamicBlocks = new Set();
  for (let char of characters) {
    dynamicBlocks.add(`${char.gridX},${char.gridY}`);
    if (char.moving) {
      dynamicBlocks.add(`${char.targetX},${char.targetY}`);
    }
  }

  // 检查格子是否可通行
  function isWalkable(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    if (collision[y][x] === 1) return false;
    if (dynamicBlocks.has(`${x},${y}`)) return false;
    return true;
  }

  // A*算法
  const openSet = [{ x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null }];
  const closedSet = new Set();
  const getKey = (x, y) => `${x},${y}`;

  while (openSet.length > 0) {
    // 找f值最小的节点
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    // 到达终点
    if (current.x === end.x && current.y === end.y) {
      const path = [];
      let node = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    closedSet.add(getKey(current.x, current.y));

    // 四方向邻居：上、下、左、右
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y }
    ];

    for (let neighbor of neighbors) {
      const key = getKey(neighbor.x, neighbor.y);

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

  // 无法到达
  return null;
}
```

---

## 完整使用流程

### AI控制角色移动的步骤

```javascript
async function aiMoveCharacter(characterId, targetX, targetY) {
  // 1. 获取地图碰撞数据
  const mapData = await fetch(`{API_URL}/map/current`).then(r => r.json());

  // 2. 获取所有角色位置（用于动态碰撞检测）
  const characters = await fetch(`{API_URL}/characters`).then(r => r.json());

  // 3. 获取当前角色位置
  const character = characters.find(c => c.id === characterId);

  // 4. 生成路线
  const path = generatePath(
    { x: character.gridX, y: character.gridY },
    { x: targetX, y: targetY },
    mapData.collision,
    characters.filter(c => c.id !== characterId)
  );

  if (!path) {
    console.log('无法到达目标位置');
    return { success: false, error: '无法到达' };
  }

  // 5. 发送移动指令
  const result = await fetch(`{API_URL}/character/${characterId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path })
  }).then(r => r.json());

  return result;
}

// 使用示例
aiMoveCharacter('npc_001', 10, 8)
  .then(result => {
    if (result.success) {
      console.log('角色开始移动');
    } else {
      console.log('移动失败:', result.error);
      // AI重新规划：等待、换路线、换目标
    }
  });
```

---

## 错误处理策略

当移动失败时，AI应采取以下策略：

### 1. 等待策略
```javascript
// 碰撞类型为"角色占用"，等待对方移动完成
if (result.error === '路径碰撞' && result.blocker.type === 'character') {
  // 等待2秒后重试
  setTimeout(() => aiMoveCharacter(characterId, targetX, targetY), 2000);
}
```

### 2. 绕路策略
```javascript
// 尝试绕过障碍物
function findAlternativePath(start, end, collision, characters, blockedPoint) {
  // 临时标记障碍点，重新寻路
  // 或尝试走更远的路线
}
```

### 3. 放弃策略
```javascript
// 目标完全无法到达，更换目标
if (attempts > 3) {
  // 选择一个新的可行目标
  const newTarget = findNearestWalkablePoint(start, collision);
  aiMoveCharacter(characterId, newTarget.x, newTarget.y);
}
```

---

## 动作控制

除了移动，AI还可以控制角色动作：

### 发送动作指令

**接口地址**：`{API_URL}/character/{characterId}/action`

**请求格式**：
```json
{
  "action": "nod",       // 动作名：idle, nod, wave, walk 等
  "loop": false,         // 是否循环
  "duration": 2500       // 持续时间（毫秒）
}
```

### 预设动作列表

| 动作名 | 说明 | 建议时长 |
|-------|------|---------|
| `idle` | 待机状态 | 循环 |
| `walk` | 行走动画 | 循环（移动时自动触发） |
| `nod` | 点头 | 1500ms |
| `wave` | 挥手 | 2000ms |
| `talk` | 说话动画 | 循环（对话时） |

---

## 注意事项

1. **路线必须连续**：每个步骤必须是相邻格子（上下左右）
2. **碰撞检测双向**：地图障碍 + 其他角色位置
3. **移动速度固定**：半秒一格（500ms），AI计算时间要考虑
4. **动作优先级**：移动时自动切换walk动画，结束后回到idle
5. **并发冲突**：多个AI同时控制时，需要协调机制

---

## 待完善项

- [ ] API实际部署地址
- [ ] 角色碰撞后的自动避让逻辑
- [ ] 多角色协调移动机制
- [ ] 移动中断处理（被新指令打断）
- [ ] 地图动态变化时的重新寻路