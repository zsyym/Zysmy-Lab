---
title: "【iOS】Category 的加载与覆盖机制"
publishedDate: 2026-05-03
description: "探究 Category 的编译产物、运行时加载、方法覆盖与关联对象原理，彻底理解 +load 和 +initialize 的执行差异。"
category: "iOS 底层"
tags: ["iOS", "Objective-C", "Runtime", "Category"]
---

## Category 的编译产物

当我们编写一个 Category 时，编译器会将其编译为 `category_t` 结构体：

```objc
struct category_t {
    const char *name;                          // 类名
    classref_t cls;                            // 类对象
    struct method_list_t *instanceMethods;     // 实例方法
    struct method_list_t *classMethods;        // 类方法
    struct protocol_list_t *protocols;         // 协议
    struct property_list_t *instanceProperties; // 属性
};
```

## 运行时加载

Category 的加载发生在 `+load` 方法之前，由 `_objc_init` 触发的 `map_images` 调用链完成：

```
_objc_init
  └─ map_images
       └─ map_images_nolock
            └─ _read_images
                 └─ remethodizeClass
                      └─ attachCategories
```

## 方法覆盖：后加载者胜

`attachCategories` 将 Category 的方法列表**插入**到类的方法列表**前面**：

```
原始类方法列表: [a, b, c]
Category 方法列表: [b_new, d]
最终方法列表: [b_new, d, a, b, c]
```

由于消息发送时从前向后遍历，`b_new` 会优先于 `b` 被找到，造成"覆盖"的假象——**实际上只是插在前面，原始方法依然存在**。

## +load 与 +initialize

| 特性 | +load | +initialize |
|------|-------|-------------|
| 调用时机 | 类加载时 | 类第一次收到消息时 |
| 调用顺序 | 父类→子类→Category | 父类→子类 |
| 线程安全 | 单线程 | 多线程（可能被重入） |
| 继承 | 不遵循 | 遵循 |

**关键点：** `+load` 是直接通过函数指针调用的，不经过消息发送机制，因此 Category 的 `+load` 会和原类的 `+load` 都执行。

## 关联对象

由于 Category 不能添加成员变量，苹果提供了关联对象 API：

```objc
// 添加关联
objc_setAssociatedObject(self, @selector(key), value, OBJC_ASSOCIATION_RETAIN);

// 获取关联
id value = objc_getAssociatedObject(self, @selector(key));

// 移除所有关联
objc_removeAssociatedObjects(self);
```

关联对象存储在 `AssociationsManager` 的全局哈希表中，以 `(object, key)` 为键。

## 总结

- Category 的方法会被插入到原方法列表前面
- 同名方法"覆盖"本质是查找顺序问题
- `+load` 全部执行，`+initialize` 只执行一次
- 关联对象不是对象属性，而是全局表的映射