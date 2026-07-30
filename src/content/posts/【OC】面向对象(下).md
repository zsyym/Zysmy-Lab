---
title: "面向对象(下)"
publishedDate: 2026-07-29
tags: ["Objective-C"]
description: "iOS 开发技术笔记 - 面向对象(下)"
category: "iOS 底层"
---

# oc面向对象(下)

#### 6.1 oc的包装类

在 Objective-C（OC）中，“包装类”通常是指将基本数据类型封装成对象类型的类。OC 是基于 C 的，所以也支持基本数据类型（如 int, float, char 等），但有些场景下（如在集合中 存储 ）只能使用对象类型，这时就需要用到“包装类”。

两个重要的包装类

NSValue是NSNumber的父类

***NSNumber***
用于包装基本数值类型：int, float, double, bool 等

***NSValue***
用于包装结构体或其他非对象类型（除了基本数据类型）

NSNumber有三类方法

1. +numberWithXxx： 将特定类型值包装为NSNumber
2. -initWithXxx：先创建一个NSNumber对象，再用一个基本类型来初始化NSNumber
3. -xxx Value：返回NSNumber对象包装的基本类型值

对于第一个包装

```objective-c
NSNumber *n1 = [NSNumber numberWithInt:10];
NSNumber *n2 = [NSNumber numberWithFloat:3.14];
NSNumber *n3 = [NSNumber numberWithBool:YES];

```

已经有了现代写法

```objective-c
NSNumber *n1 = @10;
NSNumber *n2 = @3.14;
NSNumber *n3 = @YES;

```



### 6.2 处理对象

### 一、`description` 方法的核心概念

`description` 是 `NSObject` 类中定义的一个实例方法，它的核心作用是：**返回一个字符串，用来描述当前对象的内容和状态**。

#### 1. 基础定义

`NSObject` 中该方法的声明如下：

```
- (NSString *)description;
```

默认实现（不重写时）会返回类似 `<类名: 内存地址>` 的字符串（例如 `<Person: 0x600000c08200>`），这个默认值通常没有实际意义，所以我们几乎都会重写它。

#### 2. 常用场景

- 使用 `NSLog(@"%@", 对象)` 打印对象时，底层会自动调用该对象的 `description` 方法。
- 调试时，Xcode 调试器查看对象内容，也会显示 `description` 返回的字符串。
- 手动调用 `[对象 description]` 获取对象的可读字符串

下面以一个 `Person` 类为例，展示如何重写 `description` 让打印结果更有意义：

#### 1. 定义 Person 类

**Person.h**

```objective-c
#import <Foundation/Foundation.h>

@interface Person : NSObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
// 自定义初始化方法
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;
@end
```

**Person.m**

```objective-c
#import "Person.h"

@implementation Person

- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    if (self = [super init]) {
        _name = [name copy];
        _age = age;
    }
    return self;
}

// 重写 description 方法，自定义对象的字符串描述
- (NSString *)description {
    // 拼接对象的属性，返回可读的字符串
    return [NSString stringWithFormat:@"<Person: name=%@, age=%ld>", self.name, self.age];
}

@end
```

#### 2. 测试代码

```objective-c
#import <Foundation/Foundation.h>
#import "Person.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Person *p = [[Person alloc] initWithName:@"张三" age:25];
        
        // 方式1：NSLog 打印对象（自动调用 description）
        NSLog(@"%@", p); // 输出：<Person: name=张三, age=25>
        
        // 方式2：手动调用 description
        NSString *desc = [p description];
        NSLog(@"手动获取：%@", desc); // 输出：手动获取：<Person: name=张三, age=25>
    }
    return 0;
}
```

### 二、`isEqual:` 方法的核心概念

`isEqual:` 是 `NSObject` 类定义的实例方法，核心作用是：**判断当前对象和传入的对象是否在逻辑上相等（而非仅内存地址相等）**。

#### 1. 基础定义与默认行为

- 方法声明（NSObject 中）：

  ```objective-c
  - (BOOL)isEqual:(id)object;
  ```

  

- 默认实现：直接比较两个对象的**内存地址**（等价于 `==` 运算符）。也就是说，默认情况下，只有两个对象指向同一块内存，`isEqual:` 才会返回 `YES`。

  ```objective-c
  Person *p1 = [[Person alloc] initWithName:@"张三" age:25];
  Person *p2 = p1; // 指向同一块内存
  Person *p3 = [[Person alloc] initWithName:@"张三" age:25]; // 不同内存，相同属性
  
  NSLog(@"%d", p1 == p2);        // 输出 1 (YES)，内存地址相等
  NSLog(@"%d", [p1 isEqual:p2]); // 输出 1 (YES)，默认实现等价于 ==
  NSLog(@"%d", [p1 isEqual:p3]); // 输出 0 (NO)，内存地址不同
  ```

  

#### 2. 为什么需要重写？

默认的 “内存地址比较” 通常不符合业务需求 —— 我们往往希望 “属性相同的对象就算逻辑相等”（比如两个姓名、年龄都一样的 Person 对象，应该判定为相等），这就需要重写 `isEqual:`

#### 1. 完整重写代码（Person.m）

```
#import "Person.h"

@implementation Person

// 初始化方法（复用之前的）
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    if (self = [super init]) {
        _name = [name copy];
        _age = age;
    }
    return self;
}

// 【核心】重写 isEqual: 方法
- (BOOL)isEqual:(id)object {
    // 1. 地址相等：直接返回 YES（最快的判断）
    if (self == object) {
        return YES;
    }
    
    // 2. 对象为 nil 或类型不匹配：返回 NO
    if (!object || ![object isKindOfClass:[Person class]]) {
        return NO;
    }
    
    // 3. 强制类型转换，比较核心属性
    Person *otherPerson = (Person *)object;
    // 字符串用 isEqual: 比较，数值直接 == 比较
    BOOL nameEqual = [self.name isEqualToString:otherPerson.name];
    BOOL ageEqual = (self.age == otherPerson.age);
    
    // 4. 所有核心属性相等，才返回 YES
    return nameEqual && ageEqual;
}

@end
```

#### 2. 测试代码

```objective-c
#import <Foundation/Foundation.h>
#import "Person.h"

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Person *p1 = [[Person alloc] initWithName:@"张三" age:25];
        Person *p2 = [[Person alloc] initWithName:@"张三" age:25];
        Person *p3 = [[Person alloc] initWithName:@"李四" age:26];
        
        NSLog(@"p1 和 p2 是否相等：%d", [p1 isEqual:p2]); // 输出 1 (YES)
        NSLog(@"p1 和 p3 是否相等：%d", [p1 isEqual:p3]); // 输出 0 (NO)
    }
    return 0;
}
```

补充:

1.  isEqualTostring 专门用来比较字符串序列，由于当用stringWithFormat是字符串在堆内存中，两个字符序列相同的字符串会由于地址不同导致用==判断时二者并不相等，但用stringWithFormat就只会比较他们俩的字符序列 与此不同的是直接令字符串=@"..."会直接指向常量值，这时用两个方法都是一样的
2. isKindOfClass比较类型是否相同

### 类别与扩展

## 一、核心认知：先分清 “向外拓展” 与 “向内收敛”

类别和扩展都围绕 “类的功能扩展” 展开，但设计初衷完全不同：

- **类别（Category）**：动态扩展已有类的**公开功能**，对所有实例生效（包括系统类），是 “向外的、开放的拓展”；
- **扩展（Extension）**：静态定义类的**私有成员**，仅作用于类的实现文件，是 “向内的、内敛的约束”。

用一句话总结：**类别给类 “添通用技能”，扩展给类 “藏私有细节”**。

## 二、类别（Category）：无侵入扩展类的通用能力

### 1. 核心场景：给系统类加业务适配方法

系统类（如 NSString、NSArray、UIView）的源码无法修改，但类别能让我们为其添加通用工具方法，这是类别最核心的价值。

#### 示例 1：给 NSString 扩展判空、去空格能力

**第一步：创建类别文件**

新建 Objective-C 文件，类名填 `NSString`，文件类型选择 `Category`，类别名填 `Util`（自定义），生成 `NSString+Util.h/m` 文件。

**NSString+Util.h（头文件：暴露公开方法）**

```objective-c
#import <Foundation/Foundation.h>

@interface NSString (Util)
/// 判空（包括nil、空字符串、全空格）
- (BOOL)isBlank;
/// 去除首尾空格和换行符
- (NSString *)trim;
/// 类方法：生成指定长度的随机字符串
+ (NSString *)randomStringWithLength:(NSInteger)length;
@end
```

**NSString+Util.m（实现文件：实现方法逻辑）**

```objective-c
#import "NSString+Util.h"

@implementation NSString (Util)

- (BOOL)isBlank {
    // 处理nil场景
    if (!self) return YES;
    // 去除首尾空白后判断长度
    NSString *trimmedStr = [self stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
    return trimmedStr.length == 0;
}

- (NSString *)trim {
    return [self stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
}

+ (NSString *)randomStringWithLength:(NSInteger)length {
    if (length <= 0) return @"";
    NSString *chars = @"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    NSMutableString *result = [NSMutableString stringWithCapacity:length];
    for (NSInteger i = 0; i < length; i++) {
        NSInteger index = arc4random_uniform((uint32_t)chars.length);
        [result appendFormat:@"%C", [chars characterAtIndex:index]];
    }
    return result;
}

@end
```

**调用示例**：

```objective-c
#import "NSString+Util.h"

// 1. 判空测试
NSString *emptyStr = @"   ";
NSLog(@"空字符串判空：%d", [emptyStr isBlank]); // 输出 1（YES）

// 2. 去空格测试
NSString *spaceStr = @"  Hello OC  ";
NSLog(@"去空格后：%@", [spaceStr trim]); // 输出 Hello OC

// 3. 生成随机字符串
NSString *randomStr = [NSString randomStringWithLength:8];
NSLog(@"随机字符串：%@", randomStr); // 输出如 8s7k9F2d
```

### 2. 类别进阶：拆分大类代码（解耦）

当自定义类的实现代码超过几百行时，可按功能拆分为多个类别，让代码结构更清晰。

#### 示例 2：拆分 Person 类的功能

```objective-c
// Person+Network.h：处理网络请求相关
@interface Person (Network)
- (void)requestUserInfo;
@end

// Person+UI.h：处理UI展示相关
@interface Person (UI)
- (NSString *)showUserInfo;
@end
```

### 3. 类别使用的 “红线”（避坑）

1.  不要重写原类方法：类别方法会覆盖原类方法，且无法通过 `super` 调用原逻辑，极易引发全局 bug；
2. 不要试图直接添加实例变量：类别无法直接声明 `@property` 生成实例变量，如需添加需用运行时 `objc_setAssociatedObject`（不推荐）；
3.  命名规范：类别方法名建议加业务前缀（如 `biz_isBlank`），避免与系统 / 第三方库方法重名。

## 三、扩展（Extension）：隐藏类的私有实现细节

扩展是 “匿名类别”，无独立文件，通常写在类的 `.m` 文件顶部，核心作用是**声明私有属性、私有方法**，符合 “最小暴露原则”。

### 示例：给 Person 类定义私有成员

**Person.h（公开头文件：仅暴露必要接口）**

```objective-c
#import <Foundation/Foundation.h>

@interface Person : NSObject
/// 公开属性：姓名
@property (nonatomic, copy) NSString *name;
/// 公开方法：打招呼
- (void)sayHello;
@end
```

**Person.m（实现文件：扩展 + 私有逻辑）**

```objective-c
#import "Person.h"

// 扩展：仅在当前.m文件生效，声明私有成员
@interface Person ()
/// 私有属性：年龄（外部无法访问）
@property (nonatomic, assign) NSInteger age;
/// 私有方法：吃饭（外部无法调用）
- (void)eat;
@end

@implementation Person

- (void)sayHello {
    // 内部可访问扩展的私有属性
    NSLog(@"大家好，我是%@，今年%ld岁", self.name, self.age);
    // 内部可调用私有方法
    [self eat];
}

// 实现私有方法
- (void)eat {
    NSLog(@"%@ 正在吃饭", self.name);
}

// 内部方法：给私有属性赋值
- (void)setAge:(NSInteger)age {
    _age = age;
}

@end
```

**调用测试**：

```objective-c
#import "Person.h"

Person *p = [[Person alloc] init];
p.name = @"张三";
[p sayHello]; // 输出：大家好，我是张三，今年0岁；张三 正在吃饭

//  编译报错：外部无法访问扩展的私有成员
// p.age = 25;
// [p eat];
```

### 扩展的核心特点

1.  编译时融入原类：扩展声明的成员属于类的一部分，比类别更 “紧密”；
2.  强制实现：扩展中声明的方法必须在 `.m` 文件中实现，否则编译报错；
3. 无法作用于系统类：系统类无 `.m` 文件，无法添加扩展。

## 四、类别 vs 扩展 核心对比表

|       特性       |         类别 (Category)         |          扩展 (Extension)          |
| :--------------: | :-----------------------------: | :--------------------------------: |
|     核心用途     |    扩展公开方法（通用工具）     |  声明私有属性 / 方法（隐藏细节）   |
| 能否添加实例变量 |  不能（运行时间接实现不推荐）   | 可以（自动生成带下划线的成员变量） |
|      作用域      |    全局（导入头文件即可用）     |     仅当前类的.m 文件（私有）      |
|     适用对象     | 自定义类、系统类（NSString 等） |             仅自定义类             |
|     编译时机     |         运行时动态关联          |         编译时静态融入原类         |
|     独立文件     |   有（如 NSString+Util.h/m）    |       无（写在.m 文件顶部）        |

## 五、实战选择指南（一句话总结）

1. **用类别**：需要给系统类加通用方法、拆分大类代码、添加全局复用的工具方法；
2. **用扩展**：需要隐藏自定义类的内部实现、定义仅内部使用的属性 / 方法