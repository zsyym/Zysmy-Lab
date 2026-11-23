// Each lane reads left to right. The middle cell names the relation or operation.
export function lanes(slug, state) {
  switch (slug) {
    case "arc-reference-counting":
      return [
        ["first", "strong →", state.owners ? "实例 A" : "nil"],
        ["second", "strong →", state.owners === 2 ? "实例 A" : "nil"],
        ["observer", "weak ⇢", state.weak && state.owners ? "实例 A" : "nil"],
      ];
    case "runtime-message-send":
      return [
        ["person", "isa →", "Person"],
        ["sayHello", "查找 →", state.phase],
        ["缓存", "映射 →", state.cache ? "sayHello : IMP" : "∅"],
      ];
    case "gcd-queues":
      return [
        [
          "就绪队列",
          "FIFO →",
          state.pending.map((id) => "T" + id).join(" · ") || "∅",
        ],
        ...Array.from({ length: state.parallel ? 2 : 1 }, (_, i) => [
          "执行槽 " + (i + 1),
          "执行 →",
          state.running[i] ? "T" + state.running[i] : "空闲",
        ]),
        [
          "提交者",
          "等待 →",
          state.deadlock ? "主队列自身" : state.wait ? "T" + state.wait : "无",
        ],
      ];
    case "runloop-modes":
      return [
        [
          "Timer",
          "Default →",
          !state.timer ? "未注册" : state.tracking ? "等待切回" : "可交付",
        ],
        ["Source0", "输入 →", String(state.s0)],
        ["Source1", "端口 →", String(state.s1)],
      ];
    case "block-captures": {
      const object = state.owner || (state.made && state.kind === "强对象");
      const target = {
        值: "快照 " + state.captured,
        共享变量: "byref " + state.value,
        强对象: "owner",
        弱对象: object ? "owner" : "nil",
      };
      return [
        ["Stack", "局部 n →", String(state.value)],
        [
          state.copied ? "Heap Block" : "局部 Block",
          state.kind === "弱对象" ? "弱捕获 ⇢" : "捕获 →",
          state.made ? target[state.kind] : "未创建",
        ],
        ["owner", "handler →", state.stored ? "Heap Block" : "nil"],
      ];
    }
  }
}
