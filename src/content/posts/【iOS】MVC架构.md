---
title: "MVC架构"
publishedDate: 2026-06-07
tags: ["架构设计"]
description: "iOS 开发技术笔记 - MVC架构"
category: "iOS 底层"
---

﻿# 【iOS】MVC架构

## 一、前言

在软件开发过程中，除了实现功能之外，代码的组织方式同样重要。

一个优秀的程序员不仅需要写出能够运行的代码，更应该关注代码的可读性、可维护性以及扩展性。随着项目规模不断扩大，如果所有代码都堆积在一个 `ViewController` 中，后期维护和功能扩展都会变得十分困难。

因此，在开发应用时，我们需要合理地设计程序结构，而这正是**架构模式（Architectural Pattern）**存在的意义。

一个好的架构通常具有以下特点：

- 高内聚（High Cohesion）
- 低耦合（Low Coupling）
- 模块职责清晰
- 易于维护
- 易于扩展
- 代码复用率高

MVC（Model-View-Controller）便是最经典、最常见的软件架构模式之一，也是 Apple 官方推荐的 iOS 开发架构。

------

# 二、MVC 简介

MVC 是：

> **Model（模型） + View（视图） + Controller（控制器）**

的缩写。

MVC 的核心思想是：

> 将数据、界面展示以及业务逻辑分离，使不同模块各司其职。

这样能够降低模块之间的耦合度，提高代码的可维护性。

![请添加图片描述](https://i-blog.csdnimg.cn/direct/f8e8cb42e55148c2ad30d00aa4b8fc42.png)


------

## 1. Model（模型）

### 职责

负责：

- 数据存储
- 数据处理
- 部分业务逻辑

简单来说：

Model 就是应用中的数据源。

例如微信聊天列表中的：

- 用户昵称
- 头像
- 最后一条消息
- 是否屏蔽消息

这些都属于 Model 管理的数据。

### 示例

```objc
@interface UserModel : NSObject

@property(nonatomic, copy) NSString *name;
@property(nonatomic, copy) NSString *message;
@property(nonatomic, copy) NSString *avatar;

@end
```

------

## 2. View（视图）

### 职责

负责：

- 界面展示
- 用户交互事件捕获

用户在屏幕上看到的所有内容都属于 View。

例如：

- UIView
- UILabel
- UIButton
- UIImageView
- UITableView
- UICollectionView

都属于 View 层。

### View 的特点

View 不负责处理业务逻辑。

它只负责：

- 显示数据
- 接收用户操作

------

## 3. Controller（控制器）

### 职责

负责协调：

- Model
- View

之间的交互。

Controller 主要完成：

1. 获取 Model 数据
2. 将数据传递给 View 展示
3. 接收 View 的事件
4. 更新 Model
5. 刷新界面

因此可以把 Controller 理解为：

> 连接 Model 与 View 的桥梁。

------

## MVC 工作流程

用户操作界面时的数据流转过程：

```text
用户点击 View
        ↓
View 捕获事件
        ↓
Controller 接收事件
        ↓
网络请求/数据处理
        ↓
更新 Model
        ↓
Controller 获取最新数据
        ↓
刷新 View
        ↓
界面更新完成
```

也可以表示为：

```text
View → Controller → Model
                     ↓
View ← Controller ← Model
```

------

# 三、胖 Model 与 瘦 Model

在实际开发中，经常会遇到这样的问题：

Model 获取到的是原始数据，而 View 希望显示的是经过处理的数据。

例如：

服务器返回：

```text
20221124
```

而界面需要显示：

```text
2022年11月24日
```

那么：

> 数据格式化的逻辑应该放在哪里？

开发过程中逐渐产生了两种思路：

------

## 1. 胖 Model（Fat Model）

![请添加图片描述](https://i-blog.csdnimg.cn/direct/b5c3dcf9715a4b31a34db49b5d48f852.png)


特点：

- 数据处理逻辑放在 Model 中
- Controller 直接使用处理后的数据

例如：

```objc
@interface DateModel : NSObject

@property(nonatomic, copy) NSString *dateString;

- (NSString *)displayDate;

@end
- (NSString *)displayDate {
    return @"2022年11月24日";
}
```

Controller 直接调用：

```objc
self.label.text = [model displayDate];
```

### 优点

- Controller 更简洁
- 逻辑集中
- 可复用性高

### 缺点

- Model 可能过于庞大

------

## 2. 瘦 Model（Thin Model）

特点：

- Model 只存储数据
- 数据处理放在 Controller 中

例如：

```objc
NSString *date = model.dateString;

NSString *showDate =
[NSString stringWithFormat:@"%@年%@月%@日",
 year, month, day];
```

### 优点

- Model 简单

### 缺点

- Controller 容易变得臃肿

------

## 总结

### Fat Model

```text
Model：负责数据 + 数据处理
Controller：尽量轻量
```

### Thin Model

```text
Model：只负责存储数据
Controller：负责大量逻辑
```

实际开发中更推荐：

> 适当向 Model 转移业务逻辑，让 Controller 保持精简。

即：

**Fat Model + Skinny Controller**

------

# 四、MVC 的优点

## 1. 职责分离

不同模块负责不同任务：

```text
Model → 数据
View → 展示
Controller → 协调
```

------

## 2. 提高可维护性

修改界面：

只需要修改 View。

修改数据：

只需要修改 Model。

------

## 3. 提高代码复用率

一个 Model 可以被多个 View 使用。

例如：

```text
UserModel
   ↓
个人主页
好友列表
聊天列表
```

------

## 4. 便于团队协作

前端开发：

负责 View。

业务开发：

负责 Controller。

数据开发：

负责 Model。

------

# 五、MVC 存在的问题

随着项目越来越复杂，MVC 的缺陷也逐渐暴露出来。

------

## 1. Controller 过于臃肿

这是 iOS 开发中最常见的问题。

许多开发者会把：

- 网络请求
- 数据解析
- 业务逻辑
- 页面跳转
- UI 更新

全部写在 ViewController 中。

最终形成：

```text
UIViewController
    3000+
    5000+
    10000+ 行代码
```

因此产生了著名的：

> Massive View Controller（超级臃肿控制器）

问题。

------

## 2. View 与 Controller 边界模糊

在 UIKit 中：

```objc
UIViewController
```

本身既管理 View，又承担 Controller 职责。

因此开发过程中经常会出现：

```text
代码到底该放 View？
还是放 Controller？
```

的问题。

久而久之导致 Controller 代码越来越多。

------

# 六、MVC 的改进方案

为了解决 MVC 的缺点，后来出现了许多新的架构模式。

------

## 1. MVVM

### Model-View-ViewModel

新增：

```text
ViewModel
```

层。

结构：

```text
View
  ↑↓
ViewModel
  ↑↓
Model
```

### 职责

ViewModel：

- 获取 Model 数据
- 数据转换
- 数据绑定

View 直接使用 ViewModel 提供的数据。

### 优点

- Controller 大幅瘦身
- 易于单元测试
- 代码更清晰

------

## 2. MVP

### Model-View-Presenter

结构：

```text
View
 ↑↓
Presenter
 ↑↓
Model
```

Presenter：

负责绝大多数业务逻辑。

View：

只负责展示。

### 优点

- 逻辑与界面彻底分离
- 测试方便

------

## 3. VIPER

全称：

```text
View
Interactor
Presenter
Entity
Router
```

职责划分极其细致。

### 优点

- 解耦程度极高
- 可测试性极强
- 适合大型项目

### 缺点

- 模板代码很多
- 学习成本高
- 开发效率较低

------

# 七、总结

MVC 是 iOS 开发中最经典、最基础的架构模式。

其核心思想是：

```text
Model
负责数据

View
负责展示

Controller
负责协调
```

MVC 的优势在于：

- 简单易学
- 开发效率高
- Apple 官方推荐

但随着项目规模增大，容易出现：

```text
Massive View Controller
```

问题。

因此在实际开发中，我们通常会：

- 保持 Controller 精简
- 将业务逻辑适当下沉到 Model
- 在复杂项目中使用 MVVM、MVP 或 VIPER

对于初学 iOS 的开发者来说：

> MVC 是必须掌握的第一种架构模式，也是理解后续 MVVM、MVP、VIPER 等架构的基础。