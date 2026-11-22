---
title: "面向对象(上)"
series: "Objective-C 面向对象"
order: 1
publishedDate: 2026-03-08
tags: ["Objective-C"]
description: "iOS 开发技术笔记 - 面向对象(上)"
category: "iOS 底层"
---

﻿# 面向对象(上)

### 5.1 类与对象

类是一种自定义数据结构，就像c语言的结构体那样，但它的功能比结构体更丰富

类是一种概念，而对象才是具体存在的

***类的声明和使用***

定义类需要两个步骤：

1. 接口部分@interface,定义该类包含的成员变量和方法
2. 实现部分@implementation，为该类的方法提供实现

这是一个类的声明部分

```objective-c

#import <Foundation/Foundation.h>

@interface fkperson : NSObject
{
    NSString* _name;
    int _age;
}
- (void) setName : (NSString*) name andAge : (int) age;
- (void) say : (NSString *) content;
- (NSString*) info;
+ (void) foo;
@end
```

**@interface** 用于声明定义类的接口部分
**@end** 用于表明定义结束
**成员变量** 描述该类的对象的状态数据
**方法** 用于描述该类的行为

```objective-c
#import "fkperson.h"

@implementation fkperson 
{
  ......
}
- (void) setName : (NSString*) name andAge : (int) age{
  ......
}
- (void) say : (NSString *) content{
  ......
}
- (NSString*) info{
  ......
}
+ (void) foo{
  ......
}
@end
```

- 类实现部分的类名必须和类接口部分的类名一致
- 类实现部分也可以声明自己的成员变量，但仅可以在当前类内访问
- 类实现部分必须为类声明部分的每个方法提供方法定义

***对象的产生与使用***

##### 对象的产生

```objective-c
类名 *对象名 = [[类名 alloc] init];
Person *p = [[Person alloc] init];
```

这其实是两步，常被写成一步:

1. 为对象分配内存也就是alloc

2. init初始化这个对象，当然也可以用自己的方法初始化(将init改写)，或者带参数的构造方法

   

```objective-c
Person *p = [[Person alloc] initWithName:@"Alice" age:18];
```

##### 对象的使用

有两种方式访问对象，一种是点语法，另一种是消息发送方式

```objective-c
p.name = @"Tom";      
NSString *n = p.name;

[p setName:@"Tom"];
NSString *n = [p name];

```

### 5.2方法

在上一节类中，我们发现其中就有方法的身影 简单来说方法其实就是类中的一个函数

| 方法类型 | 符号 | 调用者 | 示例           |
| -------- | ---- | ------ | -------------- |
| 实例方法 | `-`  | 对象   | `- (void)run`  |
| 类方法   | `+`  | 类名   | `+ (void)info` |

**实例方法**

实例方法是通过对象调用，用-开头

**类方法**

通过类名调用，用+开头

```objective-c
#import <Foundation/Foundation.h>

@interface fkperson : NSObject
{
    NSString* _name;
    int _age;
}
- (void) setName : (NSString*) name andAge : (int) age;
- (void) say : (NSString *) content;
- (NSString*) info;
+ (void) foo;
@end
```

```objective-c
[fkperson foo];//调用foo类方法
fkperson* person = [[fkperson alloc] init];
[person info];//调用info实例方法
```

并且在实例方法中可以引用类方法，但在类方法中不能引用实例方法

```objective-c
+ (void)foo {
    NSLog(@"调用了 FKPerson 的 foo 类方法");
    // 类方法中不能访问实例变量/实例方法（如 self->_name、[self info] 都会报错）
}

// 实现实例方法 info
- (void)info {
    NSLog(@"调用了 FKPerson 的 info 实例方法");
    // 实例方法中可以访问类方法（如 [FKPerson foo]）
    [FKPerson foo];
}
```

### 5.4封装

在 Objective-C 中，封装的核心落地手段是**属性的 Setter（赋值方法）和 Getter（取值方法）** —— 它们是类对外暴露属性的 “可控接口”，既允许外部合法访问数据，又能隐藏内部的存储细节和校验逻辑，是 “开放封闭原则” 的典型体现

* **Setter**：控制属性的赋值逻辑，实现数据校验、内存管理（如 copy/strong）；

* **Getter**：控制属性的取值逻辑，实现懒加载、数据格式化、只读保护等。

  

**基础用法：自动生成  自定义实现**

1. 自动生成

```objective-c
@interface Person : NSObject
// 声明属性，编译器自动生成 Setter/Getter
@property (nonatomic, copy) NSString *name;   // 字符串用 copy 避免浅拷贝
@property (nonatomic, assign) NSInteger age;  // 基本类型用 assign
@end

@implementation Person
// ARC 下无需手动实现，编译器自动生成以下逻辑：
// - (NSString *)name { return _name; }
// - (void)setName:(NSString *)name { _name = [name copy]; }
// - (NSInteger)age { return _age; }
// - (void)setAge:(NSInteger)age { _age = age; }
@end

// 外部通过 Setter/Getter 访问，无需关心内部存储
Person *p = [[Person alloc] init];
p.name = @"张三"; // 等价于 [p setName:@"张三"]
p.age = 25;      // 等价于 [p setAge:25]
NSLog(@"姓名：%@，年龄：%ld", p.name, p.age); // 等价于 [p name]、[p age]
```

2. 自定义生成

当自动生成的逻辑无法满足需求时（如数据校验），可自定义 Setter 或 Getter：

```objective-c
@implementation Person
// 自定义 age 的 Setter，校验年龄合法性
- (void)setAge:(NSInteger)age {
    // 拦截负数、超过150的非法年龄
    if (age < 0 || age > 150) {
        _age = 0; // 重置为合法默认值
        NSLog(@"年龄不合法，已自动修正为0");
    } else {
        _age = age;
    }
}

// name 的 Getter 沿用自动生成的即可
@end

// 测试：非法赋值被拦截
p.age = 200; // 输出：年龄不合法，已自动修正为0
NSLog(@"年龄：%ld", p.age); // 结果：0
```

##### 区分 “点语法” 和 “实例变量”

- 点语法（`p.age`）：本质是调用 Setter/Getter，会触发校验、懒加载等逻辑；
- 直接访问实例变量（`p->_age`）：跳过 Setter/Getter，直接修改内存，破坏封装（严禁在类外部使用）。

用 `readonly` 修饰属性，编译器仅生成 Getter，不生成 Setter，实现 “只读” 封装：

# 5.6 对象创建与初始化

在 Objective-C 中，对象的创建通常需要 **两个步骤：分配内存和初始化对象**。只有经过初始化的对象才能正常使用。

## 5.6.1 对象的创建过程

创建对象通常写成下面的形式：

```objc
Person *p = [[Person alloc] init];
```

这个语句实际上包含两个步骤：

1. **alloc**

   `alloc` 方法负责为对象在堆内存中分配空间，并返回对象的地址。

2. **init**

   `init` 方法用于对对象进行初始化，例如给成员变量赋初值。

因此对象创建流程可以理解为：

```
alloc  →  分配内存
init   →  初始化对象
```

只有两个步骤都完成后，对象才算真正创建成功。

------

## 5.6.2 自定义初始化方法

在很多情况下，系统默认的 `init` 方法并不能满足需求，我们需要自己编写初始化方法来设置对象的初始状态。

例如：

```objc
@interface User : NSObject
@property NSString *name;
@property int age;
@property NSString *address;
@end
```

实现自定义初始化：

```objc
@implementation User

- (instancetype)init
{
    self = [super init];
    if (self) {
        _name = @"默认名字";
        _age = 18;
        _address = @"北京";
    }
    return self;
}

@end
```

初始化方法通常遵循一个固定模板：

```objc
- (instancetype)init {
    self = [super init];   // 调用父类初始化方法
    if (self) {
        // 初始化成员变量
    }
    return self;
}
```

这样写的好处是：
如果父类初始化失败（返回 `nil`），子类也不会继续执行初始化代码。

------

## 5.6.3 带参数的初始化方法

除了默认的 `init` 方法，还可以定义 **带参数的初始化方法**，这样在创建对象时可以直接设置属性值。

例如：

```objc
@interface Car : NSObject
@property NSString *brand;
@property NSString *model;
@property NSString *color;

- (instancetype)initWithBrand:(NSString *)brand
                        model:(NSString *)model;

- (instancetype)initWithBrand:(NSString *)brand
                        model:(NSString *)model
                        color:(NSString *)color;
@end
```

实现：

```objc
@implementation Car

- (instancetype)initWithBrand:(NSString *)brand model:(NSString *)model
{
    if (self = [super init]) {
        _brand = brand;
        _model = model;
        _color = @"黑色";
    }
    return self;
}

- (instancetype)initWithBrand:(NSString *)brand
                        model:(NSString *)model
                        color:(NSString *)color
{
    if (self = [self initWithBrand:brand model:model]) {
        _color = color;
    }
    return self;
}

@end
```

这种写法的优点是：

- 可以减少重复代码
- 提高代码复用性
- 创建对象时更加灵活

示例：

```objc
Car *car1 = [[Car alloc] init];
Car *car2 = [[Car alloc] initWithBrand:@"奔驰" model:@"ML350"];
Car *car3 = [[Car alloc] initWithBrand:@"宝马" model:@"X5" color:@"黑色"];
```

------

# 5.7 继承

继承是面向对象编程的重要特性之一，它可以让一个类获得另一个类的属性和方法，从而实现代码复用。

在 Objective-C 中，继承通过 `:` 语法实现：

```objc
@interface 子类 : 父类
@end
```

其中：

- 被继承的类称为 **父类（superclass）**
- 继承父类的类称为 **子类（subclass）**

------

## 5.7.1 继承的基本特点

继承的主要作用包括：

1. **代码复用**

子类可以直接使用父类已有的方法和属性。

1. **扩展功能**

子类可以在父类基础上增加新的功能。

1. **层级关系**

继承可以形成类的层次结构。

例如：

```objc
@interface Fruit : NSObject
@property double weight;
- (void)info;
@end
```

实现：

```objc
@implementation Fruit

- (void)info
{
    NSLog(@"这是一个水果，重量为 %g g", self.weight);
}

@end
```

定义一个子类：

```objc
@interface Apple : Fruit
@end

@implementation Apple
@end
```

创建对象并调用方法：

```objc
Apple *a = [[Apple alloc] init];
a.weight = 200;
[a info];
```

由于 `Apple` 继承自 `Fruit`，所以它可以直接使用父类中的 `weight` 属性和 `info` 方法。

------

## 5.7.2 Objective-C 的继承规则

Objective-C 采用 **单继承机制**，即：

- 一个类 **只能有一个父类**
- 但可以形成 **多层继承**

例如：

```
NSObject
   ↓
Vehicle
   ↓
Car
   ↓
SportsCar
```

这种结构称为 **继承链**。

------

## 5.7.3 方法重写（Override）

子类不仅可以继承父类的方法，还可以 **重新实现父类的方法**，这称为 **方法重写**。

例如父类：

```objc
@interface Bird : NSObject
- (void)fly;
@end

@implementation Bird

- (void)fly
{
    NSLog(@"小鸟在天空飞翔");
}

@end
```

子类：

```objc
@interface Ostrich : Bird
- (void)callSuperMethod;
@end
```

实现：

```objc
@implementation Ostrich

- (void)fly
{
    NSLog(@"鸵鸟不会飞，只能奔跑");
}

- (void)callSuperMethod
{
    [super fly];
}

@end
```

说明：

- 子类重写了 `fly` 方法
- 使用 `super` 可以调用父类原来的实现

测试：

```objc
Ostrich *o = [[Ostrich alloc] init];
[o fly];              // 调用子类方法
[o callSuperMethod];  // 调用父类方法
```