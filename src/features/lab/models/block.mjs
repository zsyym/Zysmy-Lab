import { action } from "../engine.mjs";
export const initial = () => ({
  kind: "值",
  made: false,
  copied: false,
  value: 1,
  captured: 0,
  owner: true,
  stored: false,
  result: "尚未调用",
});
function kind(name) {
  return action(
    "捕获" + name,
    "创建前选择捕获声明。",
    {
      值: "int n = 1;",
      共享变量: "__block int n = 1;",
      强对象: "NSObject *target = owner;",
      弱对象: "__weak NSObject *target = owner;",
    }[name],
    (s) => !s.made,
    (s) => ({ ...s, kind: name }),
  );
}
const alive = (s) => s.owner || (s.made && s.kind === "强对象");
export const actions = {
  value: kind("值"),
  byref: kind("共享变量"),
  strong: kind("强对象"),
  weak: kind("弱对象"),
  create: action(
    "创建 Block",
    "捕获在表达式求值时发生；普通标量取快照，__block 共享存储。",
    "// Evaluate the block literal shown below.",
    (s) => !s.made,
    (s) => ({ ...s, made: true, captured: s.value }),
  ),
  copy: action(
    "Copy 到堆",
    "复制捕获环境以便逃逸，__block 存储仍然共享。",
    "void (^saved)(void) = [block copy];",
    (s) => s.made && !s.copied,
    (s) => ({ ...s, copied: true }),
  ),
  mutate: action(
    "修改外部变量",
    "递增外部 n；只有共享捕获能看到新值。",
    "n += 1;",
    (s) => s.made && ["值", "共享变量"].includes(s.kind),
    (s) => ({ ...s, value: s.value + 1 }),
  ),
  store: action(
    "对象保存 Block",
    "对象以 copy 属性持有 Block。强捕获该对象时两者互持。",
    "owner.handler = saved;",
    (s) => s.copied && s.owner && !s.stored && s.kind.includes("对象"),
    (s) => ({ ...s, stored: true }),
  ),
  drop: action(
    "释放外部对象引用",
    "观察 Block 对对象的持有是否足以保持其存活。",
    "owner = nil;",
    (s) => s.owner && s.made && s.kind.includes("对象"),
    (s) => ({ ...s, owner: false, stored: s.stored && s.kind === "强对象" }),
  ),
  call: action(
    "调用 Block",
    "读取当前捕获环境；弱对象已销毁时读取 nil。",
    "block();",
    (s) => s.made,
    (s) => ({
      ...s,
      result:
        s.kind === "值"
          ? String(s.captured)
          : s.kind === "共享变量"
            ? String(s.value)
            : alive(s)
              ? "对象存活"
              : "nil",
    }),
  ),
};
export function literal(s) {
  return s.kind.includes("对象")
    ? '^{ NSLog(@"%@", target); }'
    : '^{ NSLog(@"%d", n); }';
}
export const view = (s) => [
  ["Stack · 局部变量", "n = " + s.value],
  [
    "Block",
    !s.made ? "尚未创建" : s.copied ? "Heap · 已复制" : "局部非逃逸示意",
  ],
  [
    "捕获关系",
    !s.made
      ? "无"
      : s.kind === "值"
        ? "快照 " + s.captured
        : s.kind === "共享变量"
          ? "Block → byref → " + s.value
          : "Block " +
            (s.kind === "强对象" ? "→" : "⇢") +
            " " +
            (alive(s) ? "对象" : "nil"),
  ],
  [
    "对象关系",
    s.stored
      ? "owner → Block" + (s.kind === "强对象" ? " → owner（循环）" : "")
      : alive(s)
        ? "对象存活"
        : "对象销毁",
  ],
  ["上次调用", s.result],
];

export const samples = Object.fromEntries(
  ["值", "共享变量", "强对象", "弱对象"].map((kind) => [
    "create-" + kind,
    {
      label: "创建 Block",
      reason:
        "观察声明、字面量和捕获变量的对应关系。ARC 下局部强变量本身就可能触发隐式复制。",
      code:
        {
          值: "int n = 1;",
          共享变量: "__block int n = 1;",
          强对象: "NSObject *target = owner;",
          弱对象: "__weak NSObject *target = owner;",
        }[kind] +
        "\nvoid (^block)(void) = " +
        literal({ kind }) +
        ";",
    },
  ]),
);
export function snippet(type, state) {
  return type === "create" ? "create-" + state.kind : type;
}
