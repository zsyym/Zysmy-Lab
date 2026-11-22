---
title: "手动内存管理"
experiment: ownership
publishedDate: 2026-03-24
tags: ["Objective-C", "内存管理"]
description: "iOS 开发技术笔记 - 手动内存管理"
category: "iOS 底层"
---

### 手动内存管理

1. retain：将该对象引用计数加1
2. release：将对象引用计数减1
3. retainCount 返回引用计数值
4. dealloc：系统自动调用，当对象引用计数为0时
5. 当方法名以驼峰写法命名才会在用alloc，new创建对象时引用计数加1
6. 谁把对象的引用计数加了1，都要在结束前把引用计数减1
7. 必须遵循 **“先放旧，再持新”**的逻辑(通过setter持有了新值，就要在setter里释放旧值，因为最后释放的时候只会释放新值)