import { action } from "../engine.mjs";
export const initial = () => ({
  scenario: "本类实现",
  cache: false,
  phase: "就绪",
});
const idle = (s) => ["就绪", "调用 IMP", "未识别 selector"].includes(s.phase);
function choose(scenario) {
  return action(
    scenario,
    "切换到独立的 Person 类配置，清空教学缓存。",
    "SEL selector = @selector(sayHello);",
    idle,
    () => ({ ...initial(), scenario }),
  );
}
function step(label, from, reason, code, update) {
  return action(label, reason, code, (s) => s.phase === from, update);
}
const phase = (next) => (s) => ({ ...s, phase: next });
export const actions = {
  local: choose("本类实现"),
  inherited: choose("继承实现"),
  missing: choose("没有实现"),
  clear: action(
    "清空缓存",
    "重新观察一次冷查找，仅清空模拟器缓存。",
    "// Reset the simulator cache.",
    (s) => idle(s) && s.cache,
    (s) => ({ ...s, cache: false, phase: "就绪" }),
  ),
  send: action(
    "发送 sayHello",
    "向接收者发送消息。",
    "[person sayHello];",
    idle,
    phase("接收消息"),
  ),
  isa: step(
    "查找接收类",
    "接收消息",
    "由 isa 定位接收类。",
    "Class cls = object_getClass(person);",
    phase("检查缓存"),
  ),
  cache: step(
    "检查方法缓存",
    "检查缓存",
    "已填充时进入 IMP，否则进入方法列表。",
    "SEL sel = @selector(sayHello);",
    (s) => ({ ...s, phase: s.cache ? "调用 IMP" : "检查本类" }),
  ),
  methods: step(
    "查本类方法",
    "检查本类",
    "找到实现后缓存 IMP；本类缺失则沿继承链继续。",
    "// Inspect Person's method list.",
    (s) => ({
      ...s,
      cache: s.scenario === "本类实现",
      phase: s.scenario === "本类实现" ? "调用 IMP" : "检查父类",
    }),
  ),
  parent: step(
    "查父类",
    "检查父类",
    "继承实现也能填入接收类缓存。整条链缺失才尝试动态解析。",
    "Class parent = class_getSuperclass(object_getClass(person));",
    (s) => ({
      ...s,
      cache: s.scenario === "继承实现",
      phase: s.scenario === "继承实现" ? "调用 IMP" : "动态解析",
    }),
  ),
  resolve: step(
    "尝试动态解析",
    "动态解析",
    "此场景的类没有动态添加实现。",
    "+ (BOOL)resolveInstanceMethod:(SEL)sel { return [super resolveInstanceMethod:sel]; }",
    phase("快速转发"),
  ),
  fast: step(
    "查替代接收者",
    "快速转发",
    "此例没有替代接收者，继续查询方法签名。",
    "- (id)forwardingTargetForSelector:(SEL)sel { return nil; }",
    phase("查询方法签名"),
  ),
  signature: step(
    "提供方法签名",
    "查询方法签名",
    "本例为无参数 void 方法提供签名，以便构造 invocation。",
    '- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel {\n  if (sel == @selector(sayHello)) return [NSMethodSignature signatureWithObjCTypes:"v@:"];\n  return [super methodSignatureForSelector:sel];\n}',
    phase("完整转发"),
  ),
  invocation: step(
    "处理 invocation",
    "完整转发",
    "此例没有处理 invocation，交回 NSObject 并触发未识别选择子。",
    "- (void)forwardInvocation:(NSInvocation *)inv { [super forwardInvocation:inv]; }",
    phase("未识别 selector"),
  ),
};
export const view = (s) => [
  ["接收者", "person → Person"],
  ["方法位置", s.scenario],
  ["sayHello 缓存", s.cache ? "selector → IMP" : "空"],
  ["查找位置", s.phase],
];
