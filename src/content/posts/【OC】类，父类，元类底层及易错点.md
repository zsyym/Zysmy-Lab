---
title: "类，父类，元类底层及易错点"
publishedDate: 2026-07-29
tags: ["Objective-C", "Runtime"]
description: "iOS 开发技术笔记 - 类，父类，元类底层及易错点"
category: "iOS 底层"
---

﻿# 类，父类，元类底层及易错点

## 一、类、父类、元类关系

在 Objective-C 中，**一切皆对象**，包括：

- 实例对象（Instance）
- 类对象（Class）
- 元类对象（MetaClass）

```objective-c
// 每个对象都有 isa 指针，指向它的类
@interface NSObject {
    Class isa;  // 所有对象的第一个成员变量都是 isa
}
@end
```

isa指针指向关系: 实例对象->类对象->元类对象

```objective-c
// 创建实例对象
Person *person = [[Person alloc] init];

// 实例对象的 isa 指向类对象
Class personClass = [person class];  // 获取类对象
Class personClass2 = object_getClass(person);  // 也是获取类对象

// 实例对象的结构
struct objc_object {
    Class isa;           // 指向类对象
    // 其他实例变量...
};

// 实例对象只存储成员变量的值，不存储方法
```

```objective-c
// 获取类对象的几种方式
Class class1 = [Person class];
Class class2 = person.class;
Class class3 = object_getClass([Person class]);  // 注意：这个得到的是元类！

// 类对象的结构
struct objc_class {
    Class isa;              // 指向元类
    Class super_class;      // 指向父类
    const char *name;       // 类名
    long version;           // 版本
    long info;              // 标志位
    long instance_size;     // 实例大小
    struct objc_ivar_list *ivars;           // 成员变量列表
    struct objc_method_list **methodLists;  // 方法列表
    struct objc_cache *cache;                // 方法缓存
    struct objc_protocol_list *protocols;    // 协议列表
};

// 类对象存储：
// - 实例方法列表
// - 属性列表
// - 协议列表
// - 成员变量信息
```

```objective-c
// 获取元类对象
Class metaClass = object_getClass([Person class]);

// 元类对象的结构和类对象完全相同
// 元类对象存储：
// - 类方法列表
// - 类属性（如果有）

// 验证元类
NSLog(@"Person类对象: %p", [Person class]);
NSLog(@"Person元类对象: %p", object_getClass([Person class]));
NSLog(@"Person元类的元类: %p", object_getClass(object_getClass([Person class])));
// 元类的元类指向根元类（NSObject的元类）
```

   ![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/244cbf8e7b7e4cf999ef3276718dc6ca.png#pic_center)

上图很好显示了子类 父类 根类以及实例对象 类对象 元对象的关系

### class常见操作方法

```objc
        const char* className = class_getName([Person class]);//查找类名
        Class superclass = class_getSuperclass([Person class]);//获得类的父类
        if([Person isMemberOfClass:[NSObject class]]){//判断是否为某个类的实例或是否为某个元类的类
            
        }
        Method method1 = class_getClassMethod([Person class], @selector(allocWithZone:));//获取类方法
        Method method2 = class_getInstanceMethod([Person class], @selector(copyWithZone:));//获取实例方法
        
```

* 首先先讲一下这个`[Person class]`，class是一个实例(对象)方法，而Person是类，类怎么能调用实例方法呢？这也就回到这篇文章的主题，**一切皆对象**，Person虽然是类，但它同时也是类对象，也就是说它是元类的实例，而元类中的class方法对于Person来说也就是实例方法了，那么它最后会返回什么呢，我直接给出结论：

| 调用对象 | 调用            | 返回  |
| -------- | --------------- | ----- |
| 实例对象 | `[obj class]`   | class |
| 类对象   | `[Class class]` | class |
| 元类对象 | `[meta class]`  | meta  |

需要特别注意的是`[Class class]`返回的是class，这是由于Runtime需要保证`[obj class] == [Class class]`,因此在此做了优化

* 其次讲一下`object_getclass`其实很简单，给定任意 Objective-C 对象，返回它的 `isa` 指针指向的类。

**在此讲解一下isKindOfClass和isMemberOfClass**

```objc
// isKindOfClass
Class cls = object_getClass(self);
while (cls) {
    if (cls == targetClass) return YES;
    cls = class_getSuperclass(cls);
}
return NO;

// isMemberOfClass
return object_getClass(self) == targetClass;
```

这是它底层源码的简化版

* isKindOfClass：获取自身对象isa指针指向的类，然后沿着继承链向上查找，只要与目标类相等就返回YES
* isMemberOfClass:获取自身对象isa指针指向的类,只有这个类与目标类相等才返回YES

**class_getClassMethod与class_getInstanceMethod**

为什么一个查找实例方法一个查找类方法而二者传入的都是类对象呢？

这是由于其实class_getClassMethod底层是这样实现的

```objc
Method class_getClassMethod(Class cls, SEL sel) {
    // 1. 获取 cls 的元类
    Class metaCls = cls->isa;  // 或 object_getClass(cls)
    
    // 2. 在元类中查找实例方法（因为类方法在元类中是实例方法）
    return class_getInstanceMethod(metaCls, sel);
}
```

**类方法在元类中是实例方法**这也呼应了上文讲的class方法

学完这部分Runtime 的底层数据结构（`isa` 指针、类、元类）,可以出这么几个问题：

**题目一：**

```objc
GGObject *obj = [[GGObject alloc] init];

NSLog(@"%d", [obj class] == [GGObject class]);
NSLog(@"%d", [obj superclass] == [GGObject superclass]);

```

1. 刚刚讲过Runtime底层保证`[obj class] == [Class class]`因此输出1
2. 其实与class一样Runtime会保证类的父类一定是个类，而不是元类所以在调用

`[GGObject superclass]`时会把NSObject(meta) 处理为NSObject(class)

因此二者都为NSObject(class)，输出为1

在此附上superclass方法逻辑便于读者理解

```objc
class_getSuperclass(object_getClass(obj))
```

**题目二：**

```objc
@interface GGObject : NSObject
@end

NSLog(@"%d", [NSObject isKindOfClass:[NSObject class]]);
NSLog(@"%d", [NSObject isMemberOfClass:[NSObject class]]);
NSLog(@"%d", [GGObject isKindOfClass:[GGObject class]]);
NSLog(@"%d", [GGObject isMemberOfClass:[GGObject class]]);

```

1. 首先获取NSObject的isa指针指向的**NSObject(meta),它的父类为NSObject(class)**，与目标类相等，输出1
2. 首先获取NSObject的isa指针指向的NSObject(meta)，不等于目标类，输出0
3. 首先获取GGObject的isa指针指向的GGObject(meta),父类继承链中没有目标类，输出0
4. 首先获取GGObject的isa指针指向的GGObject(meta),不等于目标类，输出0

这题需要我们注意的就是**NSObject(meta),它的父类为NSObject(class)**

**题目三**：

```objc
Class cls = [GGObject class];

NSLog(@"%p", cls);
NSLog(@"%p", [cls class]);
NSLog(@"%p", object_getClass(cls));
NSLog(@"%p", object_getClass(object_getClass(cls)));

```

1. 首先是[GGObject class] 由于Runtime底层返回的是GGObject(class),因此cls = GGObject(class)
2. 第二步相当于重复第一步还是GGObject(class)
3. GGObject(class)的isa指针指向的GGObject(meta)
4. GGObject(meta)的isa指针指向的NSObject(meta)