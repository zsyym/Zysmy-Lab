---
title: "【iOS】RunLoop 底层原理与实战"
publishedDate: 2026-05-01
description: "深入剖析 RunLoop 的底层数据结构、事件循环机制、Mode 切换原理，以及在实际开发中的常见应用场景。"
category: "iOS 底层"
tags: ["iOS", "RunLoop", "多线程", "性能优化"]
---

## RunLoop 是什么

RunLoop 是一个**事件处理循环**，它让线程在有事件时工作，无事件时休眠，避免资源浪费。

## 底层数据结构

CoreFoundation 中 RunLoop 的核心结构：

```c
struct __CFRunLoop {
    CFRuntimeBase _base;
    pthread_mutex_t _lock;          // 操作锁
    __CFPort _wakeUpPort;           // 唤醒端口
    Boolean _unused;
    volatile _per_run_data *_perRunData; // 每次运行的数据
    pthread_t _pthread;             // 绑定的线程
    uint32_t _winthread;
    CFMutableSetRef _commonModes;   // Common Mode 集合
    CFMutableSetRef _commonModeItems; // Common Mode 的 items
    CFRunLoopModeRef _currentMode;  // 当前运行的 Mode
    CFMutableSetRef _modes;         // 所有 Mode 的集合
    struct _block_item *_blocks_head; // 待执行的 block
    struct _block_item *_blocks_tail;
    CFOptionFlags _runLoopFlags;
};
```

## Mode 与 Source/Timer/Observer

RunLoop 的 Mode 包含三类输入源：

```
RunLoop
 ├── Mode1 (Default)
 │    ├── Source0 (非 mach port 事件，需手动唤醒)
 │    ├── Source1 (mach port 事件，内核自动唤醒)
 │    ├── Timer (定时器)
 │    └── Observer (观察者)
 ├── Mode2 (Tracking)
 │    └── ...
 └── Mode3 (Common)
      └── ...
```

**RunLoop Observer 的状态回调：**

```objc
typedef CF_OPTIONS(CFOptionFlags, CFRunLoopActivity) {
    kCFRunLoopEntry         = (1UL << 0), // 即将进入 Loop
    kCFRunLoopBeforeTimers  = (1UL << 1), // 即将处理 Timer
    kCFRunLoopBeforeSources = (1UL << 2), // 即将处理 Source
    kCFRunLoopBeforeWaiting = (1UL << 5), // 即将休眠
    kCFRunLoopAfterWaiting  = (1UL << 6), // 刚从休眠唤醒
    kCFRunLoopExit          = (1UL << 7), // 即将退出 Loop
};
```

## 事件循环流程

```
1. 通知 Observer: kCFRunLoopEntry
2. 通知 Observer: kCFRunLoopBeforeTimers
3. 通知 Observer: kCFRunLoopBeforeSources
4. 执行 Blocks
5. 处理 Source0
6. 如果有 Source1，跳转到第 9 步
7. 通知 Observer: kCFRunLoopBeforeWaiting
8. 休眠，等待唤醒
   └─ 被 Source1 / Timer / 外部唤醒
9. 通知 Observer: kCFRunLoopAfterWaiting
10. 处理 Timer / Source1 / 唤醒的 Block
11. 回到第 2 步
```

## 实战应用

### 1. 滑动优化（图片懒加载）

```objc
// 在滑动时不执行图片加载，滑动结束后执行
CFRunLoopAddCommonMode(CFRunLoopGetCurrent(), (__bridge CFStringRef)UITrackingRunLoopMode);

[self.imageView performSelector:@selector(setImage:)
                    withObject:image
                    afterDelay:0
                       inModes:@[NSDefaultRunLoopMode]];
```

### 2. 线程保活

```objc
- (void)keepAlive {
    @autoreleasepool {
        CFRunLoopRef runLoop = CFRunLoopGetCurrent();
        CFRunLoopAddPort(runLoop, self.port, kCFRunLoopDefaultMode);
        CFRunLoopRun();
    }
}
```

### 3. 卡顿监控

通过监听 `kCFRunLoopBeforeSources` 和 `kCFRunLoopAfterWaiting` 之间的间隔，判断是否卡顿。

## 总结

- RunLoop 是线程级的事件处理循环
- 主线程 RunLoop 默认开启，子线程需手动启动
- Mode 切换是 RunLoop 的核心设计
- 理解 RunLoop 对优化滑动性能和线程管理至关重要