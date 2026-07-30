---
title: "消息发送机制"
publishedDate: 2026-07-29
tags: ["Objective-C", "Runtime"]
description: "iOS 开发技术笔记 - 消息发送机制"
category: "iOS 底层"
---

# oc的消息发送机制

OC的方法调用 **本质不是函数调用，而是发送消息**。

例如

```objc
[Person sayhello];
```

本质会被编译器转换成

```objc
objc_msgSend(person, @selector(sayHello));
```

这里的objc_msgSend就是oc的消息发送函数

### 一、消息发送的完整流程

当执行

```objc
[Person sayhello];
```

底层会按照以下流程查找方法

objc_msgSend
      │
      ▼
1. 在对象的isa指向的类中查找方法
      │
      ▼
2. 在类的方法缓存 cache 中查找
      │
      ▼
3. 在类的方法列表 method_list 中查找
      │
      ▼
4. 去父类查找（superclass）
      │
      ▼
5. 一直找到根类 NSObject
      │
      ▼
6. 找不到 → 进入消息转发流程

* 第一步我们已经很熟悉了，在此不再赘述

* 第二步需要知道的是，在方法缓存中，都是被调用过的方法，也就是与第三步联系起来，如果在第三步找到的方法，就会自动添加到方法缓存中，

  还需注意到的一点是，即使是在第四部父类找到的方法，也会被添加到子类的方法缓存中

### 二、cache_t 底层结构

`cache_t`的结构大致是

```objc
struct cache_t {
    struct bucket_t *_buckets;
    mask_t _mask;
    mask_t _occupied;
};

```

`bucket_t`：

```objc
struct bucket_t {
    SEL _sel;
    IMP _imp;
};
```

所以缓存本质就是: **方法名SEL  →  方法实现IMP**

类似于一个hash表

至于具体的哈希查找方法笔者还没有具体了解