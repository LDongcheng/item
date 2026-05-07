#!/usr/bin/env bash
# Stop hook: 每次回复后记录时间戳到当前 Agent 的 session-log
AGENT_DIR=$(basename "$PWD")
LOG_DIR="E:/Item/fsj/team/$AGENT_DIR/memory"

# 目录名转中文名
case "$AGENT_DIR" in
    xiaozong)  AGENT="小粽" ;;
    xiaofeng)  AGENT="小风" ;;
    ashuo)     AGENT="阿说" ;;
    mengyao)   AGENT="梦瑶" ;;
    xiaoyun)   AGENT="小云" ;;
    dongcheng) AGENT="东城" ;;
    *)         AGENT="$AGENT_DIR" ;;
esac

if [ -d "$LOG_DIR" ]; then
    echo "[$AGENT] $(date '+%Y-%m-%d %H:%M:%S') - 一次回复完成" >> "$LOG_DIR/session-log.md"
else
    echo "[$AGENT] $(date '+%Y-%m-%d %H:%M:%S') - 一次回复完成" >> E:/Item/fsj/.claude/memory/session-log.md
fi
