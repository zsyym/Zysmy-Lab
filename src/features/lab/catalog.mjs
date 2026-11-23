export const catalog = [
  {
    slug: "arc-reference-counting",
    title: "ARC 与对象所有权",
    category: "Memory Management",
    level: "入门",
    minutes: 4,
    intro:
      "在两个强变量之间共享一个实例，亲眼观察最后一个所有者离开时弱引用的变化。",
    goal: "先创建对象并设置弱引用，再增加和依次移除两个强引用。预测 observer 何时变为 nil。",
    prerequisite: "了解对象指针和变量赋值。",
    keywords: ["strong", "weak", "ARC"],
    tags: ["内存管理"],
    scope:
      "只追踪图中两个显式所有者。模拟数量不能用于推断真实运行时 retainCount、临时引用或优化。",
    notes: [
      "编译器为 ARC 管理强所有权操作。MRC 下由开发者平衡 retain 与 release。",
      "弱槽位不会让对象存活，适合生命周期更短的 delegate 回指。",
      "为什么 ARC 仍可能泄漏？若两个存活对象通过 strong 相互持有，移除外部引用仍无法打破这个环。",
    ],
    source: "https://clang.llvm.org/docs/AutomaticReferenceCounting.html",
  },
  {
    slug: "runtime-message-send",
    title: "一次消息如何找到 IMP",
    category: "Objective-C Runtime",
    level: "进阶",
    minutes: 7,
    intro: "从 [person sayHello] 出发，沿着类、缓存和继承链追踪选择子的去向。",
    goal: "先查父类实现并再次发送，比较两次路径。再选择没有实现，走完转发链。",
    prerequisite: "了解实例、类、继承和实例方法。",
    keywords: ["isa", "selector", "IMP", "forwardInvocation"],
    tags: ["Runtime"],
    scope:
      "模型只发送一个实例消息，假设类已初始化。忽略并发、缓存布局和汇编快速路径；快速转发失败后的签名及完整转发按独立步骤呈现。",
    notes: [
      "选择子描述消息名称，IMP 指向方法实现。父类命中也可让接收类的后续查找受益。",
      "动态解析可以添加实现。本例选择不添加，再进入替代接收者与完整转发。",
      "为什么需要签名？构造 NSInvocation 需要参数及返回类型；没有有效签名会直接进入未识别选择子处理。",
    ],
    source:
      "https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtForwarding.html",
  },
  {
    slug: "gcd-queues",
    title: "队列与提交者",
    category: "Concurrency",
    level: "进阶",
    minutes: 6,
    intro:
      "分别观察任务进入队列、占用执行槽和完成，以及提交者在 sync 调用中等待的时刻。",
    goal: "在两种队列各提交两个 async，再提交一个 sync。观察同时执行的任务数和提交者状态。",
    prerequisite: "了解闭包和主队列。",
    keywords: ["GCD", "dispatch_sync", "dispatch_group"],
    tags: ["GCD"],
    scope:
      "这是手动推进的事件模拟器，两个并发槽和完成顺序是示例约束。浏览器没有运行 libdispatch。",
    notes: [
      "串行队列限制同时执行的工作项数量。sync 限制调用者何时返回，两者是不同维度。",
      "任务组可在多个异步工作全部完成后通知 UI；组内任务仍由各自队列调度。",
      "主队列中再同步派发到主队列为何无法前进？新工作需要当前工作释放同一串行执行位置。",
    ],
    source:
      "https://developer.apple.com/library/archive/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html",
  },
  {
    slug: "runloop-modes",
    title: "RunLoop 与滚动中的 Timer",
    category: "RunLoop",
    level: "进阶",
    minutes: 5,
    intro:
      "切换主线程的输入模式，把计时器、手动输入源和端口事件送入同一轮观察。",
    goal: "添加 Timer 并开始运行，分别在 Default 与 Tracking 中推进，再投递两种事件。",
    prerequisite: "了解主线程、Timer 和 UI 滚动。",
    keywords: ["Mode", "Source0", "Source1", "Timer", "Observer"],
    tags: ["多线程", "UI"],
    scope:
      "每次单步模拟一次有机会处理输入的循环，仅汇总阶段。Source0 计数表示应用层待办，同一 source 的 signal 可以合并。Timer 在每个模拟轮次均已到期，现实触发取决于时间及线程可用性。",
    notes: [
      "Mode 决定本轮监视的输入源和定时器。Observer 订阅阶段变化。没有到期工作时线程可以休眠。",
      "滚动跟踪时，单独注册在 Default 的 Timer 暂停回调；注册到适当的 common modes 可以覆盖多个模式。",
      "恢复 Default 会补齐每次错过的回调吗？重复 Timer 通常只触发一次，再按计划继续。",
    ],
    source:
      "https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Multithreading/RunLoopManagement/RunLoopManagement.html",
  },
  {
    slug: "block-captures",
    title: "Block 带走了什么",
    category: "Memory Management",
    level: "进阶",
    minutes: 6,
    intro:
      "选择捕获声明，把 Block 复制到堆，再修改原变量或撤销对象的外部所有权。",
    goal: "比较值与 __block 的读数。再分别以强、弱引用捕获 owner，保存回调并释放外部引用。",
    prerequisite: "了解局部变量、ARC 与 Block 字面量。",
    keywords: ["Block", "__block", "copy", "weak"],
    tags: ["Objective-C", "内存管理"],
    scope:
      "聚焦有捕获 Block 的 ARC 语义。局部与堆的分区是逃逸示意，ARC 可自动复制或优化存储位置。模型保留 Block 调用句柄；捕获声明所在的创建作用域结束后，只追踪 owner 和 Block 的所有权。",
    notes: [
      "普通标量按值捕获，__block 通过共享存储观察修改。__block 对象变量在 ARC 下并不自动变弱。",
      "对象保存回调且回调强持有对象时形成环，可用弱捕获或在适当时机清空回调。",
      "copy 会深拷贝捕获的对象吗？它保留捕获环境所需的所有权，通常仍指向同一实例。",
    ],
    source: "https://clang.llvm.org/docs/BlockLanguageSpec.html",
  },
];
