---
title: "【iOS】Runtime - Part 1 && 对象与类的本质"
publishedDate: 2026-05-05
description: "深入探究 Objective-C Runtime 中对象与类的底层结构，从 isa 指针到元类链，彻底理解 OC 对象的本质。"
category: "iOS 底层"
tags: ["iOS", "Objective-C", "Runtime"]
---

## 前言

Runtime 是 Objective-C 的基石。理解 Runtime，才算真正理解 OC。

本系列将从底层结构出发，逐步拆解 Runtime 的各个核心机制。

## 对象的本质

在 Objective-C 中，任何对象都可以通过 `NSObject` 的 `isa` 指针找到它的类：

```objc
@interface NSObject <NSObject> {
    Class isa  OBJC_ISA_AVAILABILITY;
}
```

在 ARM64 架构下，`isa` 是一个 **联合体 (union)**，它不再单纯指向类对象，而是通过位域存储了更多信息：

```objc
union isa_t {
    Class cls;
    uintptr_t bits;
    struct {
        uintptr_t nonpointer        : 1;
        uintptr_t has_assoc         : 1;
        uintptr_t has_cxx_dtor      : 1;
        uintptr_t shiftcls          : 33; // MACH_VM_MAX_ADDRESS 0x1000000000
        uintptr_t magic             : 6;
        uintptr_t weakly_referenced : 1;
        uintptr_t deallocating      : 1;
        uintptr_t has_sidetable_rc  : 1;
        uintptr_t extra_rc          : 19;
    };
};
```

## 类的结构

`Class` 在底层本质上是一个指向 `objc_class` 结构体的指针：

```objc
struct objc_class : objc_object {
    Class superclass;          // 父类指针
    cache_t cache;             // 方法缓存
    class_data_bits_t bits;    // 类数据（方法列表、属性、协议等）
};
```

类的数据结构中，`bits` 通过 `data()` 方法返回 `class_rw_t`，这是运行时读写的数据区域：

```
objc_class
 ├── isa (指向元类)
 ├── superclass
 ├── cache (方法缓存散列表)
 └── bits
       └── class_rw_t
             ├── class_ro_t (只读，编译时确定)
             │    ├── ivars (成员变量列表)
             │    ├── baseMethodList (方法列表)
             │    ├── baseProtocols (协议列表)
             │    └── baseProperties (属性列表)
             ├── methods (分类添加的方法)
             ├── protocols (分类添加的协议)
             └── properties (分类添加的属性)
```

## 元类 (MetaClass)

**元类是类对象的类。** 它的核心作用是存储类方法。

- 实例对象的 `isa` 指向类对象
- 类对象的 `isa` 指向元类
- 元类的 `isa` 指向根元类 (Root MetaClass)
- 根元类的 `isa` 指向自身

通过这种设计，Objective-C 实现了**类方法继承**——子类对象可以调用父类的类方法，因为元类也有 `superclass` 链。

## 总结

理解对象与类的底层结构，是掌握 Runtime 的第一步。下一篇我们将分析消息发送机制。

**关键记忆点：**
- 对象 = `isa` + 成员变量
- 类 = `isa` + `superclass` + `cache` + `bits`
- 元类 = 类对象的类，存储类方法
- `isa` 在 ARM64 下是位域联合体，不再单纯指向类