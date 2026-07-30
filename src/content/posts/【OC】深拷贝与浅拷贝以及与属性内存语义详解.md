---
title: "深拷贝与浅拷贝以及与属性内存语义详解"
publishedDate: 2026-07-29
tags: ["Objective-C"]
description: "iOS 开发技术笔记 - 深拷贝与浅拷贝以及与属性内存语义详解"
category: "iOS 底层"
---

﻿### 深拷贝与浅拷贝以及与属性内存语义详解

**copy与mutableCopy**

* copy用于复制对象的不可变副本
* mutableCopy用于复制对象的可变副本
* 二者返回的都是副本，对原对象都没有影响

**NSCopying与NSMutableCopy协议**

copy与mutableCopy复制对象确实用起来很方便，但它只能用于遵守NSCopying和NSMutableCopy协议的类，那如果是我们自定义的类本身并没有遵循这个协议怎么办呢

这时我们就需要完成两步

* 让该类实现NSCopying(NSMutableCopy)协议
* 让该类实现copyWithZone(mutableCopyWithZone)方法

与alloc相似，其实copy和mutableCopy的底层调用的都是copyWithZone和mutableCopyWithZone

```objective-c
#import <Foundation/Foundation.h>

@interface Person : NSObject <NSCopying, NSMutableCopying>

@property(nonatomic, copy) NSString *name;
@property(nonatomic, assign) int age;

@end
@implementation Person

// copy
- (id)copyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
}

// mutableCopy
- (id)mutableCopyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
}

@end
```

**浅复制与深复制**

* 浅复制就是只复制指针地址，不创建对象(修改副本，本身也会改变)
* 深复制是创建新对象，复制数据(修改副本，本身不改变)

从简单的说起，也就是已经遵守NSCopying协议的类
**是否创建新对象：**

* 不可变对象 copy → 不创建
* 可变对象 copy → 创建
* mutableCopy →创建



**setter方法的复制选项**

```objective-c
#import <Foundation/Foundation.h>

@interface FKItem : NSObject
@property (nonatomic, copy) NSMutableString *name;
@end
int main(int argc, char * argv[]) {
    @autoreleasepool {
        FKItem *item = [FKItem new]; // 创建一个FKItem对象

        item.name = [NSMutableString stringWithString:@"疯狂iOS讲义"];
        
        // 尝试修改：调用appendString方法
        [item.name appendString:@"fkit"];
    }
}
```

这个程序看上去没有问题，name是可变字符串，可以修改，那么是哪里把name变为不可修改呢，深复制可能把name变为了不可变字符串，但我们纵观整个程序并没有出现copy，那么是哪里出了问题,问题出在setter方法上

```objective-c
item.name//当我们调用点语法时，底层其实是setter方法
```

setter方法内部实现

```objective-c
- (void)setName:(NSMutableString *)aname {
    name = [aname copy];
}
```

其实是将namecopy了一份，这时name被深复制也就修改成不可变字符串了，这个知识点与我们下面说的自定义类深拷贝浅拷贝密切相关



那么如果是自定义类呢，那么就要看你自定义的copyWithZone方法了

```objective-c
- (id)copyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
}

// mutableCopy
- (id)mutableCopyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
} 
```



这是我改善后的总结方法

```objective-c
@interface Person : NSObject <NSCopying, NSMutableCopying>

@property (nonatomic, copy) NSString *name;      // 不可变字符串
@property (nonatomic, strong) NSMutableString *mutableName; // 可变字符串
@property (nonatomic, assign) NSInteger age;      // 基本类型

@end

@implementation Person

- (id)copyWithZone:(NSZone *)zone
{
    Person *copy = [[[self class] allocWithZone:zone] init];
    
    if (copy) {
        // 1. 基本类型 - 直接赋值
        copy.age = self.age;
        
        // 2. 不可变对象 - 用 copy（优化性能，返回不可变副本）
        copy.name = [self.name copy];  // 或 copy.name = self.name
        
        // 3. 可变对象 - 在不可变拷贝中，应该变成不可变的
        // 对于 NSMutableString -> NSString
        copy.name = [self.mutableName copy];  // 可变 -> 不可变
    }
    
    return copy;
}


- (id)mutableCopyWithZone:(NSZone *)zone
{
    Person *copy = [[[self class] allocWithZone:zone] init];
    
    if (copy) {
        // 1. 基本类型 - 直接赋值
        copy.age = self.age;
        
        // 2. 不可变对象 -> 在可变拷贝中，应该变成可变的
        copy.mutableName = [self.name mutableCopy];  // NSString -> NSMutableString
        
        // 3. 可变对象 - 在可变拷贝中，创建新的可变对象
        copy.mutableName = [self.mutableName mutableCopy];  // 这里可以copy.mutableName = self.mutableName吗？
    }
    
    return copy;
}

@end
```

**属性关键字对对象复制影响**

```objective-c
// 定义两个属性，分别用strong和copy
@interface TestObj : NSObject
@property (nonatomic, strong) NSMutableString *strongStr;
@property (nonatomic, copy) NSMutableString *copyStr;
@end

@implementation TestObj
@end

// 测试赋值行为
NSMutableString *originalStr = [NSMutableString stringWithString:@"Hello"];
TestObj *obj = [TestObj new];

// 1. strong属性：直接持有原对象
obj.strongStr = originalStr;
NSLog(@"strongStr地址：%p", obj.strongStr);       // 和originalStr地址相同（0x100500100）

// 2. copy属性：自动调用copy，赋值拷贝后的新对象
obj.copyStr = originalStr;
NSLog(@"copyStr地址：%p", obj.copyStr);           // 和originalStr地址不同（0x100500200）
// 且copy后的对象是不可变的NSString（即使原对象是NSMutableString）
NSLog(@"copyStr类型：%@", [obj.copyStr class]);   // __NSCFString（不可变）
```





**属性关键字与字符串，数组等搭配**

用一句话概括：可变的用strong保持可变，不可变的用copy保持不可变



**容器里面内容的深浅拷贝**

**使用copy、mutableCopy对集合对象进行的深浅拷贝是针对集合对象本身的**

而对于容器里面的对象默认都是浅拷贝，也就是说只拷贝集合对象本身，而不复制其中的数据。主要原因是，集合内的对象未必都能拷贝，而且调用者也未必想在拷贝集合时一并拷贝其中的每个对象

如果想要深拷贝集合对象本身的同时，对其元素也进行copy操作

```objective-c
NSArray *array = [[NSArray alloc] initWithArray: anyarray copyItems:YES ];
```

这样集合中的每一个对象都会收到copyWithZone:消息，需要注意的是集合中的对象都必须符合NSCopying 协议，否则会导致程序崩溃或中断

但如果数组嵌套的话并不会深拷贝第二层数组，也就是不会递归拷贝，这也就不算完全拷贝



**那么如何实现真正的深拷贝（完全拷贝）呢？**

**先归档，再解档**

```objective-c
NSData *data = [NSKeyedArchiver archivedDataWithRootObject:someArray];
NSArray *deepCopy = [NSKeyedUnarchiver unarchiveObjectWithData:data];
```

只要集合中的对象都符合 NSCoding 协议。而且，使用这种方式，无论集合中存储的模型对象嵌套多少层，都可以实现深拷贝，但前提是嵌套的子模型也需要符合 `NSCoding 协议`才行，否则也会导致程序崩溃或中断



那么要是自定义类有多层嵌套，想要完全拷贝的话，就要实现NSCoding协议，其中有两个协议方法encodeWithCoder/initWithCode

在此我给出实现两个方法的示例：

假设有两个类，person嵌套一个Dog类

```objective-c
#import <Foundation/Foundation.h>

@interface Dog : NSObject <NSCoding>

@property NSString *dogName;

@end
@implementation Dog

// 归档
- (void)encodeWithCoder:(NSCoder *)coder
{
    [coder encodeObject:self.dogName forKey:@"dogName"];
}

// 解档
- (instancetype)initWithCoder:(NSCoder *)coder
{
    if (self = [super init]) {
        _dogName = [coder decodeObjectForKey:@"dogName"];
    }
    return self;
}

@end
```

```objective-c
#import <Foundation/Foundation.h>
#import "Dog.h"

@interface Person : NSObject <NSCoding>

@property NSString *name;
@property int age;
@property Dog *dog;

@end
@implementation Person

// 归档
- (void)encodeWithCoder:(NSCoder *)coder
{
    [coder encodeObject:self.name forKey:@"name"];
    [coder encodeInt:self.age forKey:@"age"];
    [coder encodeObject:self.dog forKey:@"dog"]; // 嵌套对象
}

// 解档
- (instancetype)initWithCoder:(NSCoder *)coder
{
    if (self = [super init]) {
        _name = [coder decodeObjectForKey:@"name"];
        _age = [coder decodeIntForKey:@"age"];
        _dog = [coder decodeObjectForKey:@"dog"];
    }
    return self;
}

@end
```