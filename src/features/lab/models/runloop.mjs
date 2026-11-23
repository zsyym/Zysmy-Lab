import { action } from "../engine.mjs";
export const initial = () => ({
  tracking: false,
  running: false,
  timer: false,
  fires: 0,
  s0: 0,
  s1: 0,
  last: "未进入",
});
export const actions = {
  mode: action(
    "切换 Mode",
    "下一轮将按选定 mode 筛选输入。",
    "// UIKit selects UITrackingRunLoopMode during tracking.",
    () => true,
    (s) => ({ ...s, tracking: !s.tracking }),
  ),
  timer: action(
    "添加 Default Timer",
    "模拟一个每轮均到期的重复定时器，仅注册于 Default。",
    "[[NSRunLoop mainRunLoop] addTimer:timer forMode:NSDefaultRunLoopMode];",
    (s) => !s.timer,
    (s) => ({ ...s, timer: true }),
  ),
  source0: action(
    "标记 Source0",
    "手动标记并显式唤醒；示例输入源已加入两种 mode。",
    "CFRunLoopSourceSignal(source);\nCFRunLoopWakeUp(loop);",
    () => true,
    (s) => ({ ...s, s0: s.s0 + 1 }),
  ),
  source1: action(
    "投递 Source1",
    "模拟端口消息，可唤醒休眠的 RunLoop。",
    "// A message arrives on the registered Mach port.",
    () => true,
    (s) => ({ ...s, s1: s.s1 + 1 }),
  ),
  start: action(
    "开始运行",
    "启用单步推进。缺少输入时模型显示等待。",
    "// Enter the selected run loop mode.",
    (s) => !s.running,
    (s) => ({ ...s, running: true, last: "进入" }),
  ),
  stop: action(
    "停止运行",
    "结束当前运行，注册的源和 Timer 保留。",
    "CFRunLoopStop(loop);",
    (s) => s.running,
    (s) => ({ ...s, running: false, last: "退出" }),
  ),
  tick: action(
    "推进一轮",
    "汇总本轮可处理的输入及到期 Timer；Observer 展示阶段边界。",
    "CFRunLoopRunInMode(mode, 0.01, false);",
    (s) => s.running,
    (s) => {
      const fire = s.timer && !s.tracking;
      const events = [
        s.s0 && "Source0",
        s.s1 && "Source1",
        fire && "Timer",
      ].filter(Boolean);
      return {
        ...s,
        fires: s.fires + Number(fire),
        s0: Math.max(0, s.s0 - 1),
        s1: Math.max(0, s.s1 - 1),
        last: events.length
          ? "处理 " + events.join("、") + " → 等待"
          : "等待唤醒",
      };
    },
  ),
};
export const view = (s) => [
  ["Mode", s.tracking ? "Tracking" : "Default"],
  [
    "Timer",
    s.timer
      ? (s.tracking ? "本 mode 不触发" : "已注册") + " · 已触发 " + s.fires
      : "未添加",
  ],
  ["待处理 Source0 / Source1", s.s0 + " / " + s.s1],
  ["Observer · 阶段摘要", s.last],
  ["运行", s.running ? "等待下一步" : "已停止"],
];
