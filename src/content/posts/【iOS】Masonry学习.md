---
title: "Masonry学习"
publishedDate: 2026-07-29
tags: ["iOS", "UI"]
description: "iOS 开发技术笔记 - Masonry学习"
category: "iOS 底层"
---

# Masonry学习

### 前言

> 轻量级布局框架，使用便捷的链式语法封装自动布局，简介明了，并且具有高可读性
> 在iOS开发中，如何布局UI是我们给用户良好体验的前提，在以往我们选择使用设置控件的frame来确定位置，简单的界面还好，但是对于复杂的界面如果再使用frame的话计算起来就很繁琐了，所以引入了自动布局（AutoLayout）来确定控件之间的位置，但是这种方式代码看起来太复杂了，可读性不高，但Masonry解决这两个问题，既简洁又能自动布局

### 基本属性

```objc
@property (nonatomic, strong, readonly) MASConstraint *left;
@property (nonatomic, strong, readonly) MASConstraint *top;
@property (nonatomic, strong, readonly) MASConstraint *right;
@property (nonatomic, strong, readonly) MASConstraint *bottom;
@property (nonatomic, strong, readonly) MASConstraint *leading;
@property (nonatomic, strong, readonly) MASConstraint *trailing;
@property (nonatomic, strong, readonly) MASConstraint *width;
@property (nonatomic, strong, readonly) MASConstraint *height;
@property (nonatomic, strong, readonly) MASConstraint *centerX;
@property (nonatomic, strong, readonly) MASConstraint *centerY;
@property (nonatomic, strong, readonly) MASConstraint *baseline;
```

## 约束的使用

### 基础API调用

使用时经常需要加mas_前缀，如果不想可以在引用masonry文件前加上下面的代码

```objc
//定义这个常量，就可以不用在开发过程中使用mas_前缀
#define MAS_SHORTHAND
//可以让Masonry帮我们自动把基础数据类型的数据，自动装箱为对象类型
#define MAS_SHORTHAND_GLOBALS
```

**添加约束的三种方法**

```objc
//添加新约束
- (NSArray *)mas_makeConstraints:(void(NS_NOESCAPE ^)(MASConstraintMaker *make))block;
 
//更新约束，会覆盖之前的约束
- (NSArray *)mas_updateConstraints:(void(NS_NOESCAPE ^)(MASConstraintMaker *make))block;
 
//完全移除旧约束，添加新约束
- (NSArray *)mas_remakeConstraints:(void(NS_NOESCAPE ^)(MASConstraintMaker *make))block;
```

**make**

```objc
make.基本属性
```

**equalTo**

参照谁

```objc
make.left.equalTo(self.view);
```

意思是 左边 = 父视图左边

**offset**

偏移量

```objc
make.left.equalTo(self.view).offset(20)
```

实际效果：左边 = 父视图左边 + 20

**mas_equalTo**

用于数值

```objc
make.width.mas_equalTo(100);
```

支持类型转换，支持复杂类型，是对equalTo的封装，使用的时候不需要指定约束边，默认取前面需要添加约束的边

### 核心公式

```text
A = B × 倍数 + 偏移
```

对应代码

```objc
make.xxx.equalTo(参照物).multipliedBy(倍数).offset(偏移);
```

#### 倍数

控制 **两个视图之间的比例关系**

```objc
make.width.equalTo(self.view).multipliedBy(0.5);
```

子视图宽度是父视图一半

```objc
make.center.equalTo(self.view);
make.width.equalTo(self.view).multipliedBy(0.5);
make.height.equalTo(self.view).multipliedBy(0.3);

```

居中➕比例

注意点  不能对常量用倍数：因为没有参照物！

#### insets

一次性设置四个方向的偏移

```objc
make.edges.equalTo(self.view).insets(UIEdgeInsetsMake(10, 20, 30, 40));
```

等价于：top = 10 left = 20 bottom = -30 right = -40

**上正 下负 左正 右负**



若**四边一样**

```objc
make.edges.equalTo(self.view).insets(UIEdgeInsetsMake(10, 10, 10, 10));
```

等价于

```objc
make.edges.equalTo(self.view).offset(10);
```



**做卡片布局**

```objc
make.edges.equalTo(self.view).insets(UIEdgeInsetsMake(20, 15, 20, 15));
```



#### priority

- Priority可以指定具体的优先级（0 -- 1000）
- priorityHigh:高优先级，值为750
- priorityMedium：介于高和低之间（250 -- 750之间）
- priorityLow:低优先级（值为250）

优先级写在链的最后

```objc
make.top.equalTo(self.view).with.priority(999);
```



## 十大常见场景

```objc
//
//  ViewController.m
//  ok
//
//  Created by MacBook Air on 2026/4/16.
//
//定义这个常量，就可以不用在开发过程中使用mas_前缀
#define MAS_SHORTHAND
//可以让Masonry帮我们自动把基础数据类型的数据，自动装箱为对象类型
#define MAS_SHORTHAND_GLOBALS
#import "ViewController.h"
#import <Masonry/Masonry.h>
@interface ViewController ()

@end

@implementation ViewController
 
- (void)viewDidLoad {
    [super viewDidLoad];
    //1.填满父视图
//    UIView* contentView = [[UIView alloc] init];
//    contentView.backgroundColor = [UIColor redColor];
//    [self.view addSubview: contentView];
//    [contentView mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.edges.equalTo(self.view).insets(UIEdgeInsetsMake(16, 16, 16, 16));
//    }];
    //2.固定尺寸居中
//    UIView* avaterView = [[UIView alloc] init];
//    avaterView.backgroundColor = [UIColor blueColor];
//    [self.view addSubview:avaterView];
//    [avaterView mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.center.mas_equalTo(self.view);
//        make.width.height.mas_equalTo(80);
//    }];
    //3.垂直排列多个视图
//    UIView* titleLabel = [[UIView alloc] init];
//    titleLabel.backgroundColor = [UIColor blueColor];
//    UIView* subLabel = [[UIView alloc] init];
//    subLabel.backgroundColor = [UIColor redColor];
//    [self.view addSubview:titleLabel];
//    [self.view addSubview:subLabel];
//    [titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.top.equalTo(self.view).offset(20);
//        make.left.right.equalTo(self.view).insets(UIEdgeInsetsMake(0, 16, 0, 16));
//        make.height.mas_equalTo(100);
//    }];
//    [subLabel mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.top.equalTo(titleLabel.mas_bottom).offset(8);//视图边缘的锚点属性，用于跨视图定位
//        make.left.right.height.equalTo(titleLabel);
//    }];
    //4.水平等宽
//    UIButton *btn1 = [UIButton buttonWithType:UIButtonTypeSystem];
//    UIButton *btn2 = [UIButton buttonWithType:UIButtonTypeSystem];
//    UIButton *btn3 = [UIButton buttonWithType:UIButtonTypeSystem];
//    
//    [btn1 setTitle:@"A" forState:UIControlStateNormal];
//    [btn2 setTitle:@"B" forState:UIControlStateNormal];
//    [btn3 setTitle:@"C" forState:UIControlStateNormal];
//
//    btn1.backgroundColor = [UIColor redColor];
//    btn2.backgroundColor = [UIColor greenColor];
//    btn3.backgroundColor = [UIColor blueColor];
//    UIButton *btns[3] = {btn1, btn2, btn3};
//    UIButton* prev = nil;
//    for (int i = 0; i < 3; i++) {
//        UIButton* btn = btns[i];
//        [self.view addSubview:btn];
//        [btn mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.top.equalTo(self.view).offset(100);
//            make.height.mas_equalTo(44);
//            
//            if (prev == nil) {
//                make.left.equalTo(self.view).offset(16);
//            } else {
//                make.left.equalTo(prev.mas_right).offset(12);
//                make.width.equalTo(btn1);//让后续按钮宽度跟随第一个，系统自动均分
//            }
//            if (i == 2) {
//                make.right.equalTo(self.view).offset(-16);
//            }
//        }];
//        prev = btn;
//    }
    //5，6.保存约束引用，动态更新
//    UIView* panel = [[UIView alloc] init];
//    panel.backgroundColor = [UIColor redColor];
//    [self.view addSubview:panel];
//    [panel mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.left.right.bottom.equalTo(self.view);
//        self.heightConstraint = make.height.mas_equalTo(200);
//    }];
//    self.heightConstraint.mas_equalTo(400);
//    [UIView animateWithDuration:3 animations:^{
//        [self.view layoutIfNeeded];
//    }];//动画更新
    //7.动态高度cell
    // Cell 的 initWithStyle 中
//    - (instancetype)initWithStyle:(UITableViewCellStyle)style
//                 reuseIdentifier:(NSString *)reuseIdentifier {
//        self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
//        [self.contentView addSubview:self.titleLabel];
//        [self.contentView addSubview:self.bodyLabel];
//
//        [self.titleLabel mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.top.left.right.equalTo(self.contentView)
//                              .insets(UIEdgeInsetsMake(12,16,0,16));
//        }];
//        [self.bodyLabel mas_makeConstraints:^(MASConstraintMaker *make) {
//            make.top.equalTo(self.titleLabel.mas_bottom).offset(6);
//            make.left.right.equalTo(self.titleLabel);
//            make.bottom.equalTo(self.contentView).offset(-12);
//        }];
//        return self;
//    }
//
//    // tableView delegate 中开启自动高度
//    tableView.estimatedRowHeight = 60;
//    tableView.rowHeight = UITableViewAutomaticDimension;
    //8.宽高比约束
    // 视图宽高比 16:9（常用于视频播放器）
//    [videoView mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.left.right.equalTo(self.view);
//        make.top.equalTo(self.view.mas_safeAreaLayoutGuide).offset(0);
//        make.height.equalTo(videoView.mas_width).multipliedBy(9.0/16.0);
//    }];
//
//    // 正方形（1:1）
//    [avatarView mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.width.mas_equalTo(60);
//        make.height.equalTo(avatarView.mas_width);  // 等于自身宽度
//    }];
    //9.相对安全区
    // iOS 11+ 相对 safeAreaLayoutGuide 布局
//    [toolbar mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.left.right.equalTo(self.view);
//        make.bottom.equalTo(self.view.mas_safeAreaLayoutGuide).offset(0);
//        make.height.mas_equalTo(49);
//    }];
//
//    [content mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.top.equalTo(self.view.mas_safeAreaLayoutGuide);
//        make.left.right.equalTo(self.view);
//        make.bottom.equalTo(toolbar.mas_top);
//    }];
    //10.优先级冲突
    // iOS 11+ 相对 safeAreaLayoutGuide 布局
    // 设置约束优先级（解决约束冲突）
//    [label mas_makeConstraints:^(MASConstraintMaker *make) {
//        // 高优先级：尽量贴左
//        make.left.equalTo(self.view).offset(16).priority(750);
//
//        // 低优先级：最小宽度
//        make.width.greaterThanOrEqualTo(@100).priority(500);
//
//        // 必须满足：不超过父视图右边
//        make.right.lessThanOrEqualTo(self.view).offset(-16);
//        make.top.equalTo(self.view).offset(100);
//    }];

    // 内置优先级常量
    // .priorityLow()      = 250
    // .priorityMedium()   = 500
    // .priorityHigh()     = 750
    // .priorityRequired() = 1000（默认）
}

    


@end

```