import { action } from "../engine.mjs";
export const initial = () => ({
  parallel: false,
  pending: [],
  running: [],
  done: [],
  serial: 0,
  wait: 0,
  paused: false,
  deadlock: false,
  group: false,
});
const available = (s) => !s.deadlock && !s.paused;
const empty = (s) => available(s) && !s.pending.length && !s.running.length;
function submit(sync) {
  return action(
    sync ? "提交 sync" : "提交 async",
    sync ? "提交者等待该任务完成。" : "提交者立即返回，可继续提交。",
    sync
      ? "dispatch_sync(queue, ^{ work(); });"
      : "dispatch_async(queue, ^{ work(); });",
    (s) => available(s) && !s.wait && (!sync || !s.group),
    (s) => {
      const id = s.serial + 1;
      return {
        ...s,
        serial: id,
        pending: [...s.pending, id],
        wait: sync ? id : 0,
      };
    },
  );
}
export const actions = {
  serial: action(
    "串行队列",
    "每次执行一个任务。",
    'dispatch_queue_create("lab", DISPATCH_QUEUE_SERIAL);',
    empty,
    (s) => ({ ...s, parallel: false }),
  ),
  parallel: action(
    "并发队列",
    "本模拟器用两条执行槽演示重叠。",
    'dispatch_queue_create("lab", DISPATCH_QUEUE_CONCURRENT);',
    empty,
    (s) => ({ ...s, parallel: true }),
  ),
  group: action(
    "开启任务组",
    "后续 async 隶属同一组。全部完成时可发送通知。",
    "dispatch_group_t group = dispatch_group_create();",
    (s) => empty(s) && !s.group,
    (s) => ({ ...s, group: true, done: [] }),
  ),
  async: submit(false),
  sync: submit(true),
  start: action(
    "调度下一批",
    "按入队顺序占用可用执行槽。组模式下提交等价于 dispatch_group_async。",
    "// Scheduler starts queued work.",
    (s) =>
      available(s) &&
      s.pending.length > 0 &&
      s.running.length < (s.parallel ? 2 : 1),
    (s) => {
      const slots = (s.parallel ? 2 : 1) - s.running.length;
      return {
        ...s,
        running: [...s.running, ...s.pending.slice(0, slots)],
        pending: s.pending.slice(slots),
      };
    },
  ),
  finish: action(
    "完成一个任务",
    "模拟一个任务结束。如果它属于等待中的 sync，则唤醒提交者。",
    "// The dispatched block returns.",
    (s) => available(s) && s.running.length > 0,
    (s) => {
      const [id, ...running] = s.running;
      return {
        ...s,
        running,
        done: [...s.done, id],
        wait: s.wait === id ? 0 : s.wait,
      };
    },
  ),
  notify: action(
    "接收组完成通知",
    "组内工作已全部完成，通知可以提交到目标队列。",
    "dispatch_group_notify(group, dispatch_get_main_queue(), ^{ updateUI(); });",
    (s) => empty(s) && s.group && s.done.length > 0,
    (s) => ({ ...s, group: false }),
  ),
  pause: action(
    "暂停模拟",
    "冻结教学调度，不挂起系统队列。",
    "// Pause simulation.",
    available,
    (s) => ({ ...s, paused: true }),
  ),
  resume: action(
    "继续模拟",
    "恢复单步调度。",
    "// Resume simulation.",
    (s) => s.paused,
    (s) => ({ ...s, paused: false }),
  ),
  deadlock: action(
    "模拟主队列同步等待",
    "假设当前已在主队列上；提交者和任务互相等待。真实系统也可能直接诊断并终止。",
    "// Already on the main queue:\ndispatch_sync(dispatch_get_main_queue(), ^{ work(); });",
    empty,
    (s) => ({ ...s, deadlock: true }),
  ),
};
const tasks = (list) => list.map((i) => "T" + i).join(" → ") || "空";
export const view = (s) => [
  ["队列", s.parallel ? "并发 · 两个模拟槽" : "串行 · 一个模拟槽"],
  ["等待", tasks(s.pending)],
  ["执行中", tasks(s.running)],
  ["已完成", tasks(s.done)],
  [
    "提交者",
    s.deadlock ? "主队列自等待" : s.wait ? "等待 T" + s.wait : "可继续",
  ],
  ["调度", s.paused ? "已暂停" : "单步推进"],
  [
    "任务组",
    s.group ? "剩余 " + (s.running.length + s.pending.length) : "未启用",
  ],
];

export const samples = {
  grouped: {
    label: "提交 async",
    reason: "在组中登记任务。任务返回时退出该组。",
    code: "dispatch_group_async(group, queue, ^{ work(); });",
  },
};
export function snippet(type, state) {
  return type === "async" && state.group ? "grouped" : type;
}
