---
title: "NSString类簇"
publishedDate: 2026-07-29
tags: ["Objective-C"]
description: "iOS 开发技术笔记 - NSString类簇"
category: "iOS 底层"
---

﻿# NSString类簇

类簇是 Objective-C 中一种重要的设计模式，它将一组相关的私有子类隐藏在一个公共的抽象基类后面。`NSString` 就是最典型的类簇例子

```objective-c
		NSString* str1 = @"123";
    NSString* str2 = [NSString stringWithString:@"测试"];
    NSString* str3 = [NSString stringWithFormat:@"hello"];
    NSString* str4 = [NSString stringWithFormat:@"hello world"];
    NSLog(@"%@, %@, %@, %@", str1.class, str2.class, str3.class, str4.class);
```

例如这四个，对外它们都是NSString，对内可能是完全不同的私有类

### 三种主要的 NSString 内部类型

1. #### **__NSCFConstantString** - 常量字符串

   ```objective-c
   NSString* str1 = @"123";
   SString* str2 = [NSString stringWithString:@"测试"];
   ```

   这两个都是常量字符串，私有类为__NSCFConstantString

   - **存储位置**：数据段（data segment）/常量区
   - **生命周期**：整个程序运行期间
   - **内存管理**：不需要 retain/release，永远存在
   - **创建时机**：编译时确定
   - **特点**：
     - 字符串内容直接编译到二进制文件中
     - 多个相同的常量字符串会指向同一块内存（字符串驻留）
     - 即使使用 `copy` 也会返回自身

2. #### **`NSTaggedPointerString`** - 标记指针字符串

```objective-c
NSString* str3 = [NSString stringWithFormat:@"hello"];
```

- 在 64 位架构上，指针本身有 64 位，但实际寻址只需要 40 多位
- 多余的位可以用来存储数据
- 对于短字符串，直接把内容编码在指针中

**Tagged Pointer 的格式（简化版）**：

```text
64位指针：
[ tag bit(1) | 类标识(3) | 数据(60) ]
    ↑           ↑           ↑
  标记位       类型       字符串内容
```

- **不需要内存分配**：完全在栈上
- **极高的访问速度**：没有堆内存访问的开销
- **线程安全**：不可变且无需引用计数
- **限制**：只能存储较短的字符串（通常是 8-10 个字符以下

3. #### __NSCFString 桥接字符串

```objective-c
NSString* str4 = [NSString stringWithFormat:@"hello world"];
```

```
struct __NSCFString {
    Class isa;           // 类指针
    CFIndex length;      // 字符串长度
    CFIndex capacity;    // 容量（如果是可变字符串）
    UniChar *buffer;     // 字符缓冲区（堆上）
    // ... 其他元数据
};
```

- **存储在堆上**：动态内存分配
- **引用计数管理**：需要 retain/release
- **可变性**：可以作为可变字符串的基础

| 创建方式                                 | 可能类型                | 说明                     |
| :--------------------------------------- | :---------------------- | :----------------------- |
| `@"string"`                              | `__NSCFConstantString`  | 编译时常量               |
| `[NSString stringWithString:]`           | 取决于参数类型          | 如果参数是常量，返回常量 |
| `[NSString stringWithFormat:@"short"]`   | `NSTaggedPointerString` | 短字符串优化             |
| `[NSString stringWithFormat:@"long..."]` | `__NSCFString`          | 长字符串堆分配           |
| `[NSString stringWithUTF8String:]`       | `__NSCFString`          | 动态创建                 |
| `[NSString stringWithContentsOfFile:]`   | `__NSCFString`          | 文件读取                 |
| `[NSMutableString string]`               | `__NSCFString`          | 可变字符串               |

![外链图片转存失败,源站可能有防盗链机制,建议将图片保存下来直接上传](https://img-home.csdnimg.cn/images/20230724024159.png?origin_url=%2FUsers%2Fmacbookair%2FDownloads%2Fdeepseek_mermaid_20260308_530b24.png&pos_id=img-ZdhN12a2-1774778861777)

**NSTaggedPointerString, __NSCFString之间的具体界限**

### 1. 决定性因素：长度与内容的“双重门”

为了最大化优化效果，Apple 实际上采用了多种编码策略来尽可能地“压榨”指针的存储空间。根据字符串的长度和字符构成，判断流程大致如下：

#### 第一层：极短字符串（长度 0-7）

- **判断逻辑**：只要字符串长度小于等于7，并且只包含ASCII字符（如英文字母、数字等）。
- **存储方式**：**`NSTaggedPointerString`**。
- **编码方式**：采用**8位编码**，直接将字符的ASCII码值存储到指针中。
- **示例**：`[NSString stringWithFormat:@"a"]`、`[NSString stringWithFormat:@"hello"]`（长度为5）都会是这个类型。

#### 第二层：较短字符串（长度 8-9）

- **判断逻辑**：当字符串长度为8或9时，系统会检查所有字符是否都包含在一个特殊的**6位编码表**中。这个表包含了 `eilotrm.apdnsIcufkMShjTRxgC4013bDNvwyUL2O856P-B79AFKEWV_zGJ/HYX` 等字符。
- **存储方式**：
  - **全部字符在表中**：**`NSTaggedPointerString`**。通过查表，用6位二进制数来表示一个字符，从而在有限空间内存储更多信息。
  - **有任一字符不在表中**：**`__NSCFString`**。因为无法通过查表压缩，只能转为堆内存存储。
- **示例**：`[NSString stringWithFormat:@"abcdefgh"]`（长度8）如果所有字符都在表中，则为`NSTaggedPointerString`；否则为`__NSCFString`。

#### 第三层：中等长度字符串（长度 10-11）

- **判断逻辑**：当字符串长度达到10或11时，系统会检查字符是否能被一个更小的**5位编码表**所覆盖。这个表更短，例如 `eilotrm.apdnsIcufkMShjTRxgC4013` 。
- **存储方式**：
  - **全部字符在表中**：**`NSTaggedPointerString`**。通过极致的压缩，使得更长的字符串也能被指针存储。
  - **有任一字符不在表中**：**`__NSCFString`**。
- **示例**：一个由11个`a`组成的字符串 `[NSString stringWithFormat:@"aaaaaaaaaaa"]`，因为`a`在5位编码表中，所以它也可以是 `NSTaggedPointerString` 类型。

#### 第四层：超出优化极限（长度 > 11 或含特殊字符）

- **判断逻辑**：
  1. 字符串长度**大于11**。
  2. 字符串中包含**非ASCII字符**（如中文、表情符号等），因为复杂字符无法用简单的编码表压缩。
- **存储方式**：**`__NSCFString`**。
- **原因**：指针的64个比特位已无法承载更多信息，系统必须在堆上分配内存来完整存储字符串内容。