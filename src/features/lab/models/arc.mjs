import { action } from "../engine.mjs";

export const initial = () => ({ owners: 0, weak: false, created: false });
const alive = (s) => s.owners > 0;
export const actions = {
  create: action(
    "创建对象",
    "局部强变量持有新实例。",
    "NSObject *first = [NSObject new];",
    (s) => !alive(s),
    () => ({ ...initial(), owners: 1, created: true }),
  ),
  add: action(
    "增加强引用",
    "第二个变量持有同一个实例。",
    "NSObject *second = first;",
    (s) => s.owners === 1,
    (s) => ({ ...s, owners: 2 }),
  ),
  weak: action(
    "设置弱引用",
    "弱槽位观察实例，不延长其生命周期。",
    "__weak NSObject *observer = first;",
    (s) => alive(s) && !s.weak,
    (s) => ({ ...s, weak: true }),
  ),
  remove: action(
    "移除第二个强引用",
    "first 仍然持有对象。",
    "second = nil;",
    (s) => s.owners === 2,
    (s) => ({ ...s, owners: 1 }),
  ),
  release: action(
    "释放最后一个强引用",
    "模型中的最后一个所有者离开，对象销毁，已注册的弱槽位置空。",
    "first = nil;",
    (s) => s.owners === 1,
    (s) => ({ ...s, owners: 0 }),
  ),
};
export function view(s) {
  return [
    ["强引用", ["无", "first → 对象", "first、second → 对象"][s.owners]],
    ["对象", alive(s) ? "存活" : s.created ? "已销毁" : "尚未创建"],
    [
      "弱引用",
      s.weak ? (alive(s) ? "observer ⇢ 对象" : "observer = nil") : "未设置",
    ],
  ];
}
