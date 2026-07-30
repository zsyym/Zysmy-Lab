---
title: "谓词与正则表达式"
publishedDate: 2026-07-29
tags: ["iOS", "网络"]
description: "iOS 开发技术笔记 - 谓词与正则表达式"
category: "iOS 底层"
---

﻿# 【iOS】谓词与正则表达式

@[toc]
## 前言

在做3G-share的注册和登录页面时我发现其实账号密码和邮箱都需要有所限制，不然就无法判断其的合理性. 那么如何去限制这些东西呢，这就用到了我今日讲的谓词与正则表达式



## 谓词(NSPredicate)

NSPredicate 是 Foundation 框架的类，用来定义一个**逻辑条件**，判断对象是否满足该条件，或对集合进行过滤



### 谓词的三种创建方式

#### 1.字符串

```objc
NSPredicate* p = [NSPredicate predicateWithFormat:@"name == %@", @"ym"];
```

在其中最重要的就是它的判断条件，在这里是==，在下面我会介绍更多的逻辑条件

#### 2.Block

```objc
NSPredicate *p = [NSPredicate predicateWithBlock:^BOOL(id obj, NSDictionary *bindings) {
    return [obj[@"age"] intValue] > 18;
}];
```

#### 3.值谓词

```objc
NSPredicate *yes = [NSPredicate predicateWithValue:YES];
```

在这里它始终返回的是YES/NO



### 谓词的逻辑条件

较为常见的比较运算符例如> = <我就不介绍了,在此介绍较为重要的运算符

1. `BETWEEN {a, b}`

**表示从a到b这个闭区间范围的集合**

2. `IN`

**表示包含于这个集合内的**

```objc
city IN {'Beijing','Shanghai'}
```

匹配包含beijing，shanghai的city

3. `BEGINSWITH`

**表示前缀匹配**

```objc
name BEGINSWITH[cd] 'tom'
```

忽略大小写和变音符，匹配以 tom 开头的 name

在这里需要补充的是**`[c]`是忽略大小写，`[d]`是忽略变音符,`[cd]`是二者都忽略**

4. `ENDSWITH`

**表示后缀匹配,也可以用[cd]修饰**

5. `CONTAINS`

**表示包含子串**

```objc
name CONTAINS[cd] 'ym'
```

忽略大小写和变音符，匹配包含ym这个子串的 name

6. `LIKE`

**表示通配符(* ?),用于模糊匹配字符串,**这个其实功能最为强大，它可以包含上面三个的功能

`*`匹配任意多个字符，`?`匹配单个字符

利用这两个通配符我们可以实现：

前缀匹配

```objc
name LIKE 'app*'
```

后缀匹配

```objc
name LIKE '*app'
```

包含子串

```objc
name LIKE '*app*'
```

当然也可以利用`?`只匹配单个字符的特性实现更精确的匹配

7. `MATCHES`

**用于正则表达式**，对于正则表达式在下面我会具体讲解

```objc
email MATCHES '.+@.+\\..+'
```

8. `AND`  `OR` `NOT`

**分别表示与，或，非**

```objc
age > 18 AND city == 'Beijing'
role == 'admin' OR role == 'mod'
NOT (status == 'banned')
```

9. `NSCompoundPredicate`

**用于多种谓词一起过滤，也就是组合谓词**

```objc
NSPredicate *p1 = [NSPredicate predicateWithFormat:@"age >= 18"];
NSPredicate *p2 = [NSPredicate predicateWithFormat:@"name BEGINSWITH[c] 'a'"];
NSPredicate *combined = [NSCompoundPredicate andPredicateWithSubpredicates:@[p1, p2]];
```

匹配 age >= 18 且名字以 a 开头（不区分大小写）

### 谓词使用场景

过滤数组

```objc
NSArray *people = @[@{@"name": @"Tom", @"age": @25},@{@"name": @"Jerry", @"age": @15}, @{@"name": @"Anna", @"age": @30},];
NSPredicate *p = [NSPredicate predicateWithFormat:@"age >= %d", 18];
NSArray *adults = [people filteredArrayUsingPredicate:p];
// 结果：Tom, Anna
```



## 正则表达式

正则表达式本质是一种**模式描述语言**,它利用简单的语法能表示出复杂的含义

### 字符类语法

1. `.`

**任意单字符（除换行）**

```objc
a.c
```

**表示a任意字符c**

2. `\d / \D`

**表示数字/非数字**

3. `\w / \W`

**表示单词字符[A-Za-z0-9_] / 非**

4. `\s / \S`

**表示空白符(空格或Tab)/非空白**

5. `[]`

**字符集合，匹配其中一个**

```objc
[aeiou]-> a/e/i/o/u
```

6. `[^]`

**排除集合**

```objc
[^0-9] -> 非数字
```

7. `[a-z]`

**范围**

```objc
[a-zA-Z]-> 任意字母
```

8. `\u4e00-\u9fa5`

**汉字范围**

### 量词类语法

`*`  `+`  `?`

`*`表示0次或多次, `+`表示1次或多次, `?`表示0次或1次

`{}`

`{n}`恰好n次,`{n, }`至少n次, `{n,m}` n到m次

在这里还有一个**贪婪和懒惰**的语法，在OC中贪婪是默认的,用懒惰模式需要在后面加`?`

**贪婪**：先吃掉整个字符串，再从右往左吐出字符，直到匹配成功（尽可能多）

**懒惰**：从当前位置开始，每次只多吃一个字符，够了就停（尽可能少)

```objc
// 正则：<.+>
NSString *str = @"<b>bold</b> and <i>italic</i>";
// 贪婪：匹配从第一个 < 到最后一个 >，整段都是"一个结果"
// 结果：@["<b>bold</b> and <i>italic</i>"]

// 懒惰：每个标签单独匹配
// 结果：@["<b>", "</b>", "<i>", "</i>"]
```

这个实例可以发现其实在大多数情况我们应用懒惰模式，不然会将所有内容都混在一起



### 双反斜杠规则

在不知道这个知识前我其实是有一些疑惑的，因为`.`在正则中表示任意单字符,那么我就想要这个`.`应该怎么做呢,我想到了用OC前面学过的`\`来转义，但在实际我用`\.`还是不行，这是为什么呢

其实是因为在字符串中`\`也不是真正的`\`，它也是一个转义符,我们需要让它的前面再套一个`\`让它成为真正的`\`,也就是`\\.`

这就是OC的双反斜杠规则



### 常用的正则

```objc
// 手机号
@"1[3-9]\\d{9}"
// 邮箱
@"[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
// 身份证
@"\\d{6}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]"
```



## 利用正则和谓词完成邮箱判断

```objc
    NSString *email = self.emailView.textField.text;
    NSString *pattern = @"[A-Z0-9a-z]+@[A-Za-z0-9]+\\.[A-Za-z]{2,}";
    NSPredicate *predicate = [NSPredicate predicateWithFormat: @"SELF MATCHES %@", pattern];
    if (![predicate evaluateWithObject:email]) {
        UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"注册失败" message:@"邮箱格式不正确" preferredStyle:UIAlertControllerStyleAlert];
        UIAlertAction *action = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:nil];
        [alert addAction:action];
        [self presentViewController:alert animated:YES completion:nil];
        return;
    }
```