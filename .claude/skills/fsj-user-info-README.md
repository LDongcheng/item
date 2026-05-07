# FSJ User Info Skill

孚世界用户信息查询技能 - 通过 Coze Workflow API 查询团队成员详细信息。

## 快速使用

### 查询成员信息

```bash
curl -X POST 'https://api.coze.cn/v1/workflow/run' \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "workflow_id": "7628958945055506472",
  "parameters": {
    "rowid": "1024efc4-27fd-4522-bf3c-e4ebc998393c"
  }
}'
```

## 成员列表

| 成员 | rowid |
|-----|-------|
| 祈景宗（小粽） | `1024efc4-27fd-4522-bf3c-e4ebc998393c` |

## 返回字段

| 字段 | 说明 |
|-----|------|
| `description` | 成员详细描述（姓名、职位、性格、兴趣、背景） |
| `gender` | 性别 |
| `mtbi` | MBTI 类型 |
| `occupation` | 职位/职业 |

## 注意事项

⚠️ 返回的 `data` 字段是 **JSON 字符串**，需要 `JSON.parse()` 二次解析！

---

详细信息请参考 [SKILL.md](SKILL.md)