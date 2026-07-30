---
title: "UI学习"
publishedDate: 2026-04-06
tags: ["iOS", "UI"]
description: "iOS 开发技术笔记 - UI学习"
category: "iOS 底层"
---

# UI学习

## UILable(文本控件)

```objc
UILabel *label = [[UILabel alloc] init]; 
label.frame = CGRectMake(50, 100, 200, 40); 
label.text = @"Hello World"; 
label.textColor = [UIColor blackColor]; 
label.font = [UIFont systemFontOfSize:16]; 
[self.view addSubview:label];
label.shadowColor = [UIColor greenColor];//字体阴影颜色
label.shadowOffset = CGSizeMake(100, 0);//阴影偏离位置  
label.textAlignment = NSTextAlignmentCenter;//设置居中对齐
```

| 属性          | 作用                  |
| ------------- | --------------------- |
| text          | 显示文本              |
| textColor     | 文字颜色              |
| font          | 字体大小              |
| textAlignment | 对齐方式（左/中/右）  |
| numberOfLines | 行数（0表示自动换行） |

## UIButton

```objc
- (void) creatImageButton {
    UIButton* btn = [UIButton buttonWithType:UIButtonTypeCustom];
    btn.frame = CGRectMake(10, 300, 150, 100);
    UIImage* icon1 = [UIImage imageNamed:@"btn02.jpeg"];//设置路径
    UIImage* icon2 = [UIImage imageNamed:@"btn03.jpg"];
    [btn setImage:icon1 forState:UIControlStateNormal];
    [btn setImage:icon2 forState:UIControlStateHighlighted];
    [self.view addSubview:btn];
}//图片按钮
```

```objc
-(void) creatButton{
UIButton* btn = [UIButton buttonWithType:UIButtonTypeRoundedRect];
btn.frame = CGRectMake(100, 100, 80, 40);
[btn setTitle:@"按钮" forState:UIControlStateNormal];
[self.view addSubview:btn];
}//文字按钮
```

## UIButton事件响应

| 事件类型         | 枚举值                          | 触发时机               | 使用场景               |
| ---------------- | ------------------------------- | ---------------------- | ---------------------- |
| 点击抬起         | `UIControlEventTouchUpInside`   | 手指在按钮内按下并抬起 | 按钮点击（登录、提交） |
| 按下             | `UIControlEventTouchDown`       | 手指刚按下按钮         | 按下反馈、开始动画     |
| 按下并拖出       | `UIControlEventTouchDragExit`   | 手指按住并滑出按钮范围 | 取消操作提示           |
| 按下拖入         | `UIControlEventTouchDragEnter`  | 手指滑出后又滑回按钮   | 恢复高亮               |
| 按住拖动         | `UIControlEventTouchDragInside` | 手指在按钮内部移动     | 滑动交互               |
| 拖动结束（外部） | `UIControlEventTouchUpOutside`  | 手指在按钮外抬起       | 取消点击               |
| 值改变           | `UIControlEventValueChanged`    | 控件值发生变化         | UISwitch / Slider      |
| 编辑开始         | `UIControlEventEditingDidBegin` | 开始编辑               | UITextField            |
| 编辑结束         | `UIControlEventEditingDidEnd`   | 结束编辑               | 输入框结束             |
| 编辑内容变化     | `UIControlEventEditingChanged`  | 文本变化               | 实时监听输入           |

| 状态     | 枚举值                      | 说明       | 示例              |
| -------- | --------------------------- | ---------- | ----------------- |
| 普通状态 | `UIControlStateNormal`      | 默认状态   | 按钮正常显示      |
| 高亮状态 | `UIControlStateHighlighted` | 按下时触发 | 手指按住按钮      |
| 禁用状态 | `UIControlStateDisabled`    | 不可点击   | 按钮灰掉          |
| 选中状态 | `UIControlStateSelected`    | 切换状态   | 类似“收藏/已选中” |

| 类型             | 枚举值                         | 特点                             | 使用场景             |
| ---------------- | ------------------------------ | -------------------------------- | -------------------- |
| 系统按钮         | `UIButtonTypeSystem`           | 默认蓝色，有点击动画，会染色图片 | 登录按钮、普通按钮   |
| 自定义按钮       | `UIButtonTypeCustom`           | 无默认样式，不会染色图片         | 自定义UI（图片按钮） |
| 信息按钮         | `UIButtonTypeDetailDisclosure` | ⓘ 样式（系统自带）               | 列表详情按钮         |
| 添加按钮         | `UIButtonTypeContactAdd`       | ➕ 样式（系统自带）               | 添加联系人           |
| 信息按钮（浅色） | `UIButtonTypeInfoLight`        | 白色 info 图标                   | 深色背景             |
| 信息按钮（深色） | `UIButtonTypeInfoDark`         | 深色 info 图标                   | 浅色背景             |

```objc
[btn addTarget:self action:@selector(btnClick) forControlEvents:UIControlEventTouchUpInside];
- (void)btnClick { 
  NSLog(@"按钮被点击了"); 
}
```



## UIView

`UIView` 是 iOS 中所有界面的基础类：

- UILabel、UIButton、UIImageView 都继承自 UIView
- 所有 UI 都是“视图”的组合

```objc
UIView *view = [[UIView alloc] init]; 
view.frame = CGRectMake(50, 100, 200, 100); 
view.backgroundColor = [UIColor redColor]; 
[self.view addSubview:view];
//view.hidden = YES为不显示
//view.alpha = 0,0.5,1. 0为不透明，0.5为半透明,1为透明

```

| 属性            | 作用        |
| --------------- | ----------- |
| frame           | 位置 + 大小 |
| bounds          | 自身坐标系  |
| center          | 中心点      |
| backgroundColor | 背景颜色    |
| alpha           | 透明度      |
| hidden          | 是否隐藏    |

**Tips:**view.opaque向渲染系统提供一个**提示**，表示该视图的内容是否完全不透明

**误区：**认为 `opaque = true` 会让视图不透明
❌ 错，不透明度由 `alpha` 和内容决定，`opaque` 只是告诉系统“我保证不透明”。

### 多个视图关系

#### 坐标系基于父视图

```
childView.frame = CGRectMake(10, 10, 100, 100);
```

 这个 (10,10) 是 **相对于父视图**

#### 后添加的在上面（遮挡关系）

```
[self.view addSubview:view1];
[self.view addSubview:view2];
```

 view2 会盖在 view1 上面

#### 1. 添加子视图

```
[self.view addSubview:view];
```

#### 2. 移除视图

```
[view removeFromSuperview];
```

#### 3. 调整层级顺序

```
[self.view bringSubviewToFront:view]; // 放到最上面
[self.view sendSubviewToBack:view];   // 放到最下面
```

#### 4. 插入视图

```
[self.view insertSubview:view atIndex:0];
[self.view insertSubview:view aboveSubview:otherView];
[self.view insertSubview:view belowSubview:otherView];
```

```objc
- (void)viewDidLoad {
    [super viewDidLoad];

    UIView *redView = [[UIView alloc] initWithFrame:CGRectMake(50, 100, 150, 150)];
    redView.backgroundColor = [UIColor redColor];

    UIView *blueView = [[UIView alloc] initWithFrame:CGRectMake(80, 130, 150, 150)];
    blueView.backgroundColor = [UIColor blueColor];

    UIView *greenView = [[UIView alloc] initWithFrame:CGRectMake(110, 160, 150, 150)];
    greenView.backgroundColor = [UIColor greenColor];

    [self.view addSubview:redView];
    [self.view addSubview:blueView];
    [self.view addSubview:greenView];
}

```

### UIView的bounds和frame

```objc
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    UIView *vi1 = [[UIView alloc] initWithFrame:CGRectMake(100, 100, 150, 100)];
    vi1.bounds = CGRectMake(0, 0, 100, 50);
    vi1.backgroundColor = [UIColor redColor];
    vi1.tag = 101;
    UIView *sub = [[UIView alloc] initWithFrame:CGRectMake(100, 100, 150, 100)];
    sub.backgroundColor = [UIColor yellowColor];
    [self.view addSubview:sub];
    [self.view addSubview:vi1];
```

改变**Bounds**的width和height会改变它的大小，而不会改变它的中心，也就是说vil是基于原来的中心来改变size，因此这段代码里的vil和sub还是在同一中心点，只是size变得不同了，而改变bounds的x，y会发生什么呢，它只会改变自身坐标系，也就是控制子视图的坐标系，若是没有子视图则看起来没有任何变化，

若是有子视图则会根据改变的x，y重新确定子视图位置

## UIWindow

```objc
- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
    //创建UIWindow
    self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene*) scene];
    //创建控制器
    UIViewController* vc = [[UIViewController alloc] init];
    vc.view.backgroundColor = [UIColor whiteColor];
    //创建view
    UIView* view = [[UIView alloc] initWithFrame:CGRectMake(100, 100, 150, 150)];
    view.backgroundColor = [UIColor orangeColor];
    //设置根控制器
    self.window.rootViewController = vc;
    //显示窗口
    [self.window makeKeyAndVisible];
    // Use this method to optionally configure and attach the UIWindow `window` to the provided UIWindowScene `scene`.
    // If using a storyboard, the `window` property will automatically be initialized and attached to the scene.
    // This delegate does not imply the connecting scene or session are new (see `application:configurationForConnectingSceneSession` instead).
}
```

现在的UIWindow一般在sceneDelegate中操作，它继承于UIView，实际上在之前我们就已经用过UIWindow

```objc
[self.view addSubview:redView];
```

实际上这个self就是UIViewController，而UIWindow是UIViewController的上级

我们需要区分的是,在sceneDelegate这个类中

```objc
[self.window addSubview: view];
[self.window.rootViewController.view addSubview: view];
```

第一个相当于添加的是根视图

第二个也就是我们之前的在根视图下添加新的视图

## UIViewControler

UIWindow（窗口）
   └── UIViewController（控制器）
          └── view（页面根视图）
                 └── 各种UI（按钮/标签/子view）

### 功能

1. 管ui
2. 管生命周期
3. 管页面跳转
4. 管数据

### 生命周期

| 阶段         | 方法                | 调用次数 | 触发时机      | 常见用途                |
| ------------ | ------------------- | -------- | ------------- | ----------------------- |
| 初始化       | `init`              | 1次      | 控制器创建时  | 初始化数据（很少写UI）  |
| 加载视图     | `loadView`          | 1次      | 创建 view 时  | 自定义 view（很少用）   |
| 视图加载完成 | `viewDidLoad`       | 1次      | view 加载完成 | ⭐ 初始化 UI、添加子视图 |
| 即将显示     | `viewWillAppear`    | 多次     | 页面将出现    | 刷新数据、更新 UI       |
| 已经显示     | `viewDidAppear`     | 多次     | 页面完全显示  | 动画、请求数据          |
| 即将消失     | `viewWillDisappear` | 多次     | 页面将离开    | 暂停任务                |
| 已经消失     | `viewDidDisappear`  | 多次     | 页面完全消失  | 清理资源                |
| 销毁         | `dealloc`           | 1次      | 控制器释放    | 内存释放、移除通知      |

* 问题1: viewDidLoad 和viewWillAppear区别

  viewDidLoad只会执行一次，而viewWillAppear每次页面都会执行

* 问题2:viewDidLoad为什么要写在UI上

  view已经加载完成，可以安全添加子视图

* 问题3:页面返回会调用哪些

  viewWillAppear viewDidAppear

### 视图中的界面切换

**常见的页面跳转方式有两种**

| 方式    | 关键字   | 特点               |
| ------- | -------- | ------------------ |
| push    | 导航栈   | 有返回按钮（常用） |
| present | 模态弹出 | 覆盖当前页面       |

### push切换页面

使用前提：必须在**UINavigationController**里

```objc
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    UIButton* btn = [UIButton buttonWithType:UIButtonTypeSystem];
    btn.frame = CGRectMake(100, 200, 150, 50);
    [btn setTitle:@"跳转" forState:UIControlStateNormal];
    [btn addTarget:self action:@selector(goNext) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:btn];
}
-(void)goNext{
    UIViewController* vc = [[UIViewController alloc] init];
    vc.view.backgroundColor = [UIColor blueColor];
    [self.navigationController pushViewController:vc animated:YES];
}
```

例如这部分代码，我们设置了一个按钮，点击它就会响应跳转页面这个事件，在goNext方法中，我们新创建了一个vc，也就是另一个视图，然后利用navigationController的pushViewController方法将这个新页面push上去

但在实际使用过程中我们发现其实按了按钮似乎没有任何反应，这是因为系统的vc并不自带navigationController，我们需要在SceneDelegate里自己设置一个

```objc
- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions {
    //创建UIWindow
    self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene*) scene];
    //创建控制器
    ViewController* vc = [[ViewController alloc] init];
    vc.view.backgroundColor = [UIColor whiteColor];
    UINavigationController* nav = [[UINavigationController alloc] initWithRootViewController:vc];
    self.window.rootViewController = nav;
    [self.window makeKeyAndVisible];
}
```

那怎么返回上一个页面呢，在这里navigationController其实是自带一个返回按钮的

```objc
[self.navigationController popViewControllerAnimated:YES];
```

这种方法就像是一个栈，将页面push和pop

并且它还有导航栏可以设置标题

```objc
self.title = @"第几页"
```

### present方法切换页面

```objc
- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    UIButton* btn = [UIButton buttonWithType:UIButtonTypeSystem];
    btn.frame = CGRectMake(100, 200, 150, 50);
    [btn setTitle:@"跳转" forState:UIControlStateNormal];
    [btn addTarget:self action:@selector(goNext) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:btn];
}
```

前面的代码还是一样，但不同的是由于present方法没有自带的返回按钮，所以得我们自己弄一个，也就是对应的dismiss方法，但我们并不能在根视图中dismiss，所以我们得建一个新的视图类view02

```objc
#import "view02.h"

@interface view02 ()

@end

@implementation view02

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor blueColor];

        // 创建返回按钮
        UIButton *btn = [UIButton buttonWithType:UIButtonTypeSystem];
        btn.frame = CGRectMake(100, 300, 150, 50);
        [btn setTitle:@"返回" forState:UIControlStateNormal];

        // 点击触发 dismiss
        [btn addTarget:self action:@selector(back) forControlEvents:UIControlEventTouchUpInside];

        [self.view addSubview:btn];
}
// 返回方法
- (void)back {
    [self dismissViewControllerAnimated:YES completion:nil];
}


@end
```

### 直接更换界面

有时我们不需要返回，例如从登陆界面直接到主界面，后面就不需要回到登陆界面了，这时其实就可以直接将我们界面整个替换

首先在senceDelegate设置初始登录页

```objc
#import "LoginViewController.h"

- (void)scene:(UIScene *)scene 
willConnectToSession:(UISceneSession *)session 
options:(UISceneConnectionOptions *)connectionOptions {

    self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];

    LoginViewController *loginVC = [[LoginViewController alloc] init];

    self.window.rootViewController = loginVC;

    [self.window makeKeyAndVisible];
}

```

在LoginViewController设置具体view

```objc
#import "HomeViewController.h"

@implementation LoginViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.view.backgroundColor = [UIColor whiteColor];

    UIButton *btn = [UIButton buttonWithType:UIButtonTypeSystem];
    btn.frame = CGRectMake(100, 200, 150, 50);
    [btn setTitle:@"登录" forState:UIControlStateNormal];

    [btn addTarget:self action:@selector(login) forControlEvents:UIControlEventTouchUpInside];

    [self.view addSubview:btn];
}

- (void)login {

    // 创建主页面
    HomeViewController *homeVC = [[HomeViewController alloc] init];

    UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:homeVC];

    // ❗获取 window
    UIWindow *window = self.view.window;

    // ❗替换根控制器
    window.rootViewController = nav;
}

@end

```

主页面

```objc
@implementation HomeViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.view.backgroundColor = [UIColor greenColor];
}

@end

```

**视图管理器生命周期**

1. **init / initWithCoder   —— 初始化**
2. **awakeFromNib           —— xib加载完成（可选）**
3. **loadView               —— 创建view** 
4. **viewDidLoad            —— view加载完成（只一次）**
5. **viewWillAppear         —— 即将显示（每次）**
6. **viewWillLayoutSubviews —— 即将布局**
7. **viewDidLayoutSubviews  —— 布局完成**
8. **viewDidAppear          —— 已经显示**
9. **viewWillDisappear      —— 即将消失**
10. **viewDidDisappear      —— 已经消失**
11. **dealloc               —— 销毁**

### 界面传值

#### 属性传值

```objc
// BViewController.h
#import <UIKit/UIKit.h>

@interface BViewController : UIViewController

@property (nonatomic, strong) NSString *text; // 接收数据

@end

```

```objc
// BViewController.m
- (void)viewDidLoad {
    [super viewDidLoad];
    
    self.view.backgroundColor = [UIColor whiteColor];
    
    UILabel *label = [[UILabel alloc] initWithFrame:CGRectMake(100, 200, 200, 50)];
    label.text = self.text;
    [self.view addSubview:label];
}

```

```objc
// AViewController.m
#import "BViewController.h"

- (void)goToB {
    BViewController *bvc = [[BViewController alloc] init];
    
    bvc.text = @"Hello B";  
    
    [self.navigationController pushViewController:bvc animated:YES];
}

```

先在b定义一个属性，然后在a创建b时把值赋给b

#### 代理传值

定义协议

```objc
// BViewController.h

@protocol BViewControllerDelegate <NSObject>

- (void)sendValue:(NSString *)value;

@end

```

声明代理

```objc
@property (nonatomic, weak) id<BViewControllerDelegate> delegate;
```

b页面触发回调

```objc
// BViewController.m

- (void)buttonClick {
    if (self.delegate) {
        [self.delegate sendValue:@"来自B的数据"]; // ⭐ 回调
    }
    
    [self.navigationController popViewControllerAnimated:YES];
}

```

A遵守协议

```objc
@interface AViewController () <BViewControllerDelegate>
@end
- (void)sendValue:(NSString *)value {
    NSLog(@"接收到：%@", value);
}

```

设置代理

```objc
BViewController *bvc = [[BViewController alloc] init];
bvc.delegate = self;  // ⭐ 必须写

[self.navigationController pushViewController:bvc animated:YES];
```

#### block传值

声明block

```objc
// BViewController.h
@property (nonatomic, copy) void (^myBlock)(NSString *value);
```

B调用block

```objc
// BViewController.m

- (void)buttonClick {
    if (self.myBlock) {
        self.myBlock(@"Block传值成功"); // ⭐ 执行
    }
    
    [self.navigationController popViewControllerAnimated:YES];
}
```

A设置block

```objc
BViewController *bvc = [[BViewController alloc] init];
bvc.myBlock = ^(NSString *value) {
    NSLog(@"接收到：%@", value);
};
[self.navigationController pushViewController:bvc animated:YES];
```

## 定时器与视图移动

**NSTimer** 是 iOS 中用来 **按固定时间间隔重复执行某个操作** 的工具。它可以让你设定一个时间间隔，让程序在这个间隔之后执行指定方法，并可选择是否重复执行

```objc
NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:1.0
                                                   target:self
                                                 selector:@selector(myFunction:)
                                                 userInfo:nil
                                                  repeats:YES];

```

好的，已根据您提供的CSDN博客内容，将NSTimer的参数说明和常用功能代码整理为以下两个表格。

### NSTimer 创建参数说明

| 参数       | 说明                                                         |
| :--------- | :----------------------------------------------------------- |
| `1.0`      | 定时器触发的间隔时间，单位是秒。                             |
| `target`   | 指定执行定时器方法的对象，通常写为 `self`。                  |
| `selector` | 指定定时器触发时要执行的方法名，格式为 `@selector(methodName:)`。 |
| `userInfo` | 需要传递给定时器方法的附加信息，没有时可传 `nil`。           |
| `repeats`  | 布尔值，控制定时器是否重复触发：`YES` 表示重复执行，`NO` 表示只触发一次。 |

### NSTimer 常用功能代码

| 功能                 | 代码                                                         |
| :------------------- | :----------------------------------------------------------- |
| **创建并启动定时器** | `[NSTimer scheduledTimerWithTimeInterval:1.0 target:self selector:@selector(myFunction:) userInfo:nil repeats:YES];` |
| **停止定时器**       | `[timer invalidate];` <br> `timer = nil;` (手动重置为 `nil` ) |
| **暂停定时器**       | `[timer setFireDate:[NSDate distantFuture]];`                |
| **恢复定时器**       | `[timer setFireDate:[NSDate date]];`                         |

首先在.h文件属性声明一个定时器

```objc
@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor colorWithRed:0.1 green:0.3 blue:0.5 alpha:0.8];
    UIButton* btn = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    btn.frame = CGRectMake(100, 100, 180, 140);
    btn.backgroundColor = [UIColor colorWithRed:0.2 green:0.7 blue:0.7 alpha:1];
    [btn setTitle: @"启动定时器" forState: UIControlStateNormal];
    btn.titleLabel.font = [UIFont systemFontOfSize: 24];
    btn.tintColor = [UIColor blueColor];
    //绑定点击事件
    [btn addTarget: self action: @selector(pressStart) forControlEvents: UIControlEventTouchUpInside];
    //添加到视图
    [self.view addSubview: btn];
    
    UIButton* stopBtn = [UIButton buttonWithType:UIButtonTypeRoundedRect];
    stopBtn.frame = CGRectMake(100, 300, 180, 140);
    stopBtn.backgroundColor = [UIColor colorWithRed:0.79 green:0.29 blue:0.71 alpha:1];
    
    [stopBtn setTitle:@"停止定时器" forState:UIControlStateNormal];
    stopBtn.titleLabel.font = [UIFont systemFontOfSize:24];
    stopBtn.tintColor = [UIColor orangeColor];
    [stopBtn addTarget:self action:@selector(pressStop) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:stopBtn];
    UIView* view = [[UIView alloc] init];
    view.backgroundColor = [UIColor orangeColor];
    view.tag = 101;
    [self.view addSubview: view];
}
-(void) pressStart{
    if (_timeView != nil) {
        return;
    } else {
        _timeView = [NSTimer scheduledTimerWithTimeInterval:0.01 target:self selector:@selector(updateTimer:) userInfo:@"大武汉" repeats:YES];
    }
}
-(void) pressStop{
    if (_timeView != nil) {
        [_timeView invalidate]; //让定时器失效
        _timeView = nil; //非常重要 不加会导致暂停后不能重新在原来进度处启动
    }
}
-(void) updateTimer: (NSTimer*) timer{
    NSLog(@"九省通衢! %@", timer.userInfo);
    UIView* view = [self.view viewWithTag:101];
    view.frame = CGRectMake(view.frame.origin.x + 0.1, view.frame.origin.y + 0.1, 80, 80); //修改视图位置（每次x，y增加0.1）
}
@end
```

## UITextField和UITextView

- **UITextField**：单行输入，适合填写表单（如用户名、密码、邮箱）
- **UITextView**：多行输入，适合写段落（如评论、文章内容、聊天）

```objc
UITextField *textField = [[UITextField alloc] initWithFrame:CGRectMake(20, 100, 280, 40)];
textField.borderStyle = UITextBorderStyleRoundedRect;
textField.placeholder = @"请输入用户名";
textField.delegate = self;
[self.view addSubview:textField];
```

```objc
UITextView *textView = [[UITextView alloc] initWithFrame:CGRectMake(20, 160, 280, 100)];
textView.font = [UIFont systemFontOfSize:16];
textView.layer.borderColor = [UIColor grayColor].CGColor;
textView.layer.borderWidth = 1.0;
textView.delegate = self;
[self.view addSubview:textView];
```

**UITextField**其中的**placeholder**是占位提示文字

* 在输入框还没输入内容时显示
* 一旦用户开始输入就会自动消失

```objc
textField.delegate = self;
```

这行代码，是**设置UITextField的代理（delegate）**为当前的视图控制器self

> 在iOS中，delegate（代理）是一种设计模式，他允许一个对象将某些任务“委托”给另一个对象处理。
> 对于UITextField来说：
> 它本身不会直接处理所有用户交互（如：输入时、点击 return 键、结束编辑等）。
> 它通过调用它的 delegate 中的特定方法，来询问或通知这些事件的发生。
> 而你设置了 delegate = self，就表示你这个视图控制器（ViewController）将会负责处理这些事件

### UITextFieldDelegate协议与UIText ViewDelegate协议以及其代理

**代理就是控件发生某些事情时，通知你去处理**

#### UITextFieldDelegate

**控制输入行为 + 监听输入事件**

```nginx
shouldBeginEditing
↓
didBeginEditing
↓
shouldChangeCharactersInRange（多次调用）
↓
shouldEndEditing
↓
didEndEditing
```

1. **是否允许开始编辑(shouldBeginEditing)**

```objc
- (BOOL)textFieldShouldBeginEditing:(UITextField *)textField {
    return YES;
}
```

可以控制：

* **禁止输入**
* **做权限判断**

2. **已经开始编辑(didBeginEditing)**

```objc
- (void)textFieldDidBeginEditing:(UITextField *)textField {
    NSLog(@"开始输入");
}
```

3. **是否允许改变文本(shouldChangeCharactersInRange)**

```objc
- (BOOL)textField:(UITextField *)textField
shouldChangeCharactersInRange:(NSRange)range
replacementString:(NSString *)string {
    return YES;
}

```

* **限制长度**
* **禁止特殊字符**
* **实时校验输入**

例如**限制长度10**

```objc
NSString *newText =
[textField.text stringByReplacingCharactersInRange:range withString:string];

return newText.length <= 10;
```

4. **是否允许结束编辑(textFieldShouldEndEditing)**

```objc
- (BOOL)textFieldShouldEndEditing:(UITextField *)textField {
    return YES;
}
```

5. **已经结束编辑(textFieldDidEndEditing)**

```objc
- (void)textFieldDidEndEditing:(UITextField *)textField {
    NSLog(@"输入结束");
}
```

6. **点击return(textFieldShouldReturn)**

```objc
- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    [textField resignFirstResponder];
    return YES;
}
```

* 收起键盘
* 跳转下一个输入框

#### UITextViewDelegate

**作用：更灵活的文本控制 + 富文本支持**

**UITextViewDelegate 调用顺序**

```nginx
shouldBeginEditing
↓
didBeginEditing
↓
shouldChangeTextInRange（多次）
↓
textViewDidChange（多次）
↓
didEndEditing
```

1. **是否允许开始编辑**

```
- (BOOL)textViewShouldBeginEditing:(UITextView *)textView {
    return YES;
}
```

2. **已开始编辑**

```
- (void)textViewDidBeginEditing:(UITextView *)textView {
}
```

3. **文本发生变化**

```
- (void)textViewDidChange:(UITextView *)textView {
    NSLog(@"%@", textView.text);
}
```

用于：

- 字数统计
- placeholder 控制
- 实时监听

4. **是否允许修改文本**

```
- (BOOL)textView:(UITextView *)textView
shouldChangeTextInRange:(NSRange)range
 replacementText:(NSString *)text {

    return YES;
}
```

**限制字数**

```
NSString *newText =
[textView.text stringByReplacingCharactersInRange:range withString:text];

return newText.length <= 100;
```

5. **结束编辑**

```
- (void)textViewDidEndEditing:(UITextView *)textView {
}
```

| 特性        | UITextFieldDelegate    | UITextViewDelegate |
| ----------- | ---------------------- | ------------------ |
| 控件        | 单行                   | 多行               |
| 核心方法    | shouldChangeCharacters | shouldChangeText   |
| 实时监听    | 不直接提供             | textViewDidChange  |
| Return键    | 有专门方法             | 要自己处理换行     |
| placeholder | 自带                   | 自己实现           |

```objc
#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.textField = [[UITextField alloc] init];
    self.textField.frame = CGRectMake(100, 100, 100, 40);
    self.textField.text = @"用户名";
    self.textField.font = [UIFont systemFontOfSize:15];
    self.textField.textColor = [UIColor blackColor];
    self.textField.borderStyle = UITextBorderStyleRoundedRect;//圆角风格
    //self.textField.borderStyle = UITextBorderStyleLine; // 线框风格
    self.textField.keyboardType = UIKeyboardTypeNumberPad;
    //设置虚拟键盘风格
    //UIKeyboardTypeDefault默认风格
    //UIKeyboardTyprNamePhonePad字母和数字的组合风格
    //UIKeyboradTypeNumberPad：纯数字风格
    self.textField.placeholder = @"请输入用户名";
    self.textField.secureTextEntry = NO;
    //是否为密码输入
    //YES:作为密码处理，原点加密
    //NO：正常显示
    [self.view addSubview:self.textField];
    self.textField.delegate = self;//设置代理
}
-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event{
    [self.textField resignFirstResponder];//让虚拟键盘回收，不再作为第一消息响应者
}
-(void)textFieldDidBeginEditing:(UITextField *)textField {
    NSLog(@"开始编辑了");
}
-(void) textFieldDidEndEditing:(UITextField *)textField {
    self.textField.text = @"";
    NSLog(@"开始结束编辑了");
}
//是否可以进行输入
-(BOOL)textFieldShouldBeginEditing:(UITextField *)textField {
    return YES;
}
//是否可以结束输入
- (BOOL)textFieldShouldEndEditing:(UITextField *)textField {
    if (self.textField.text.length < 8) {
        return NO;
    } else {
        return YES;
    }
}
@end
```

## UISwitch

```objc
#import "ViewController.h"
 
@interface ViewController ()
 
@end
 
@implementation ViewController
 
- (void)viewDidLoad {
    [super viewDidLoad];
    //创建一个继承于UIView的开关对象
    _myswitch = [[UISwitch alloc] init];
    //UISwitch控件的位置X，Y可以改变，当大小无法改变，后两个数字没用
    _myswitch.frame = CGRectMake(150, 200, 0, 0);
    
    [_myswitch setOn:YES animated:NO];
    [_myswitch setOnTintColor:[UIColor colorWithRed:0.5 green:0.2 blue:0.4 alpha:0.7]];
    [_myswitch addTarget:self action:@selector(pressA) forControlEvents:UIControlEventValueChanged];
    [self.view addSubview:_myswitch];
}
 
-(void) pressA {
    _myTimer = [NSTimer scheduledTimerWithTimeInterval:0.5 target:self selector:@selector(pressB) userInfo:@"大帅哥" repeats:YES];
}
 
-(void) pressB {
    NSLog(@"左思源%@", _myTimer.userInfo);
}
@end
```

## UISlider和UIProgressView

| 对比       | UISlider | UIProgressView |
| ---------- | -------- | -------------- |
| 是否可拖动 | ✅ 可以   | ❌ 不可以       |
| 用途       | 输入数值 | 显示进度       |
| 数值范围   | 自定义   | 0 ~ 1          |
| 用户交互   | 有       | 无             |

```objc
- (void)viewDidLoad {
    [super viewDidLoad];
    _progressView = [[UIProgressView alloc] init];
    _progressView.frame = CGRectMake(150, 100, 200, 80);
    _progressView.progressTintColor = [UIColor blueColor];
    _progressView.progress = 0.6;//设置进度条的进度，传入的参数是0～1的值
    //设置进度条风格特征
    _progressView.progressViewStyle = UIProgressViewStyleDefault;
    [self.view addSubview:_progressView];
     
    _slider = [[UISlider alloc] init];
    _slider.frame = CGRectMake(150, 200, 200, 80);//滑动条高度不可变
    _slider.tintColor = [UIColor orangeColor];
    //设置滑动条最大值，最小值，最小值可以为负
    _slider.maximumValue = 100;
    _slider.minimumValue = 0;
    //设置滑动条滑块所在位置
    _slider.value = 0;
    //YES代表拖动过程中一直触发事件，NO代表松手才触发
    _slider.continuous = YES;
    //设置左侧滑条颜色
    _slider.minimumTrackTintColor = [UIColor orangeColor];
    //设置右侧滑条颜色
    _slider.maximumTrackTintColor = [UIColor brownColor];
    //设置滑块颜色
    _slider.thumbTintColor = [UIColor purpleColor];
    [_slider addTarget:self action:@selector(pressSlider) forControlEvents:UIControlEventValueChanged];
    [self.view addSubview:_slider];
}
-(void)pressSlider{
    _progressView.progress = (_slider.value-_slider.minimumValue) / (_slider.maximumValue - _slider.minimumValue);
}
```

## UIScrollView

UIScrollView 是 iOS 中非常重要的一个视图组件，用于**滚动显示超出屏幕范围的内容**。当你的页面内容太长（或太宽）放不下时，就可以用 UIScrollView 来滚动查看

| 核心点     | 属性                           | 作用             | 关键理解                    | 示例                         |
| ---------- | ------------------------------ | ---------------- | --------------------------- | ---------------------------- |
| 内容大小   | `contentSize`                  | 决定是否可以滚动 | **必须大于 frame 才能滚动** | `CGSizeMake(300, 1000)`      |
| 可视区域   | `frame`                        | 屏幕能看到的范围 | 就是 ScrollView 本身大小    | `CGRectMake(0,0,300,400)`    |
| 滚动位置   | `contentOffset`                | 当前滚动到哪里   | 改它就等于“滚动”            | `(0, 200)` 表示往下滚        |
| 内边距     | `contentInset`                 | 内容与边界间距   | 常用于顶部/底部留白         | `UIEdgeInsetsMake(10,0,0,0)` |
| 是否滚动   | `scrollEnabled`                | 是否允许滚动     | 可临时禁用滚动              | `YES / NO`                   |
| 分页滚动   | `pagingEnabled`                | 一页一页滑动     | 轮播图核心属性🔥             | `YES`                        |
| 回弹效果   | `bounces`                      | 拉到边界是否弹回 | iOS标志性体验               | `YES`                        |
| 滚动指示器 | `showsVerticalScrollIndicator` | 是否显示滚动条   | 只是视觉辅助                | `YES / NO`                   |

### 垂直滚动

```objc
-(void)viewDidLoad {
    [super viewDidLoad];
    
    UIImage* image = [UIImage imageNamed:@"yuan"];
    UIImageView* imageView = [[UIImageView alloc] initWithImage:image];
    CGSize imageSize = image.size;
    CGFloat screenWidth = self.view.frame.size.width;
    CGFloat scale = screenWidth / imageSize.width;
    CGFloat scaleHeight = imageSize.height * scale;
    
    imageView.frame = CGRectMake(0, 0, screenWidth, scaleHeight);
    imageView.contentMode = UIViewContentModeScaleToFill;
     
    UIScrollView* scrollView = [[UIScrollView alloc] initWithFrame:self.view.bounds];
    scrollView.contentSize = CGSizeMake(screenWidth, scaleHeight+500);
    
    [scrollView addSubview:imageView];
    [self.view addSubview: scrollView];
}
```

要记住：`contentSize.height > scrollView.height → 才能滚动`

### 横向分页滚动

```objc
-(void)viewDidLoad {
    [super viewDidLoad];
    UIScrollView* sv = [[UIScrollView alloc] initWithFrame:CGRectMake(0, 0, 394, 852)];
    sv.pagingEnabled = YES;//是否按照整页滚动视图
    sv.scrollEnabled = YES; //是否开启滚动效果
    //设置画布的大小，画布显示在滚动视图的内部，一般大于frame的大小，第一个参数表示宽，第二个表示高
    sv.contentSize = CGSizeMake(394*5, 852);
    sv.bounces = YES;//是否可以边缘弹动
    sv.alwaysBounceHorizontal = YES;//是否开启横向弹动效果
    sv.alwaysBounceVertical = YES;//是否开启纵向弹动效果
    sv.showsVerticalScrollIndicator = YES;//是否开启纵向滚动条
    sv.showsHorizontalScrollIndicator = YES;//是否开启横向滚动条
    for(int i = 0; i < 5; i++) {
        NSString* imageName = [NSString stringWithFormat:@"zsy%d",i+1];
        UIImage* aImage = [UIImage imageNamed:imageName];
        UIImageView* aView = [[UIImageView alloc] initWithImage:aImage];
        aView.frame = CGRectMake(394*i, 0, 394, 852);
        [sv addSubview:aView];
    }
    sv.backgroundColor = [UIColor whiteColor];
    [self.view addSubview: sv];
    
}
```

### 缩放

```objc
-(void)viewDidLoad {
    [super viewDidLoad];
    UIScrollView* scrollView = [[UIScrollView alloc] initWithFrame:self.view.bounds];
    scrollView.backgroundColor = [UIColor blackColor];
    scrollView.delegate = self;
    //设置缩放比例
    scrollView.minimumZoomScale = 1.0;
    scrollView.maximumZoomScale = 4.0;
    //加载图片
    UIImage* image = [UIImage imageNamed:@"yuan"];
    //创建图片视图
    self.imageView = [[UIImageView alloc] initWithImage:image];
    self.imageView.frame = self.view.bounds;
    self.imageView.contentMode = UIViewContentModeScaleAspectFit;
    //设置内容区域与图片大小一致
    scrollView.contentSize = self.imageView.frame.size;
    [scrollView addSubview:self.imageView];
    [self.view addSubview:scrollView];
}
//返回可缩放的视图
-(UIView *)viewForZoomingInScrollView:(UIScrollView *)scrollView{
    return self.imageView;
}
```

### 滚动事件监听

```objc
_scrollView.delegate = self;
```

这行代码的作用是：

> 告诉 UIScrollView：“有滑动行为时，请通知当前这个控制器（self）。”

`UIScrollViewDelegate` 代理方法表格：

| 方法名                                                       | 触发时机                                                     | 常见用途                                                     |
| :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| `- (void)scrollViewDidScroll:(UIScrollView *)scrollView`     | 滚动过程中持续触发（每滑动一帧都会调用）                     | 实时监听滑动位置，做视差效果、懒加载等                       |
| `- (void)scrollViewWillBeginDragging:(UIScrollView *)scrollView` | 用户开始拖动 scrollView 时触发                               | 可用于暂停动画、记录起始位置等                               |
| `- (void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset` | 手指即将离开屏幕，即将触发减速滑动时调用                     | 可用于自定义目标滚动位置（翻页）等                           |
| `- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView` | 用户松手后，scrollView 开始减速时调用                        | 可用于记录状态、加载新内容提示等                             |
| `- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView` | 减速完成、滚动完全停止时触发                                 | 常用于：滚动结束后更新页码、加载数据                         |
| `- (void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView` | 使用 `setContentOffset:animated:` 或 `scrollRectToVisible:animated:` 触发的滚动动画结束时调用 | 常用于：程序自动滚动后执行逻辑，比如跳转到特定位置后加载内容 |

```objc
@implementation ViewController
-(void)viewDidLoad {
    [super viewDidLoad];
    _scrollView = [[UIScrollView alloc] init];
    CGRect screenBounds = self.view.bounds;
    _scrollView.frame = CGRectMake(0, 0, screenBounds.size.width, screenBounds.size.height*0.75);
    _scrollView.bounces = YES;//回弹效果，滑到底后能不能继续拉动
    //_scrolView.userInteractionEnabled = NO;
    //是否接受触碰事件，yes接受，no不接受
    _scrollView.contentSize = CGSizeMake(screenBounds.size.width, screenBounds.size.height * 5 * 0.75);
    for (int i = 0; i < 5; i++) {
        NSString* str = [NSString stringWithFormat:@"zsy%d",i+1];
        UIImage* image = [UIImage imageNamed:str];
        UIImageView* iView = [[UIImageView alloc] initWithImage:image];
        iView.frame = CGRectMake(0, screenBounds.size.height*i*0.75, screenBounds.size.width, screenBounds.size.height*0.75);
        [_scrollView addSubview:iView];
    }
    [self.view addSubview:_scrollView];
    _scrollView.contentOffset = CGPointMake(0, 0);
    _scrollView.pagingEnabled = NO;//是否开启分页效果。这里禁用了分页滑动（一个屏幕一页）
    _scrollView.delegate = self;//设置 scrollView 的代理对象为当前控制器，用于接收滑动相关事件（实现代理方法）
}
-(void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event {
    CGRect screenBounds = self.view.bounds;
    [_scrollView scrollRectToVisible:CGRectMake(0, 0, screenBounds.size.width, screenBounds.size.height * 0.7) animated:YES];
}
//当视图移动时，都会调用这个函数
//调用这个协议的滚动视图对象
//使用这个函数来监控滚动视图的位置
-(void)scrollViewDidScroll:(UIScrollView *)scrollView{
    CGFloat offsetY = scrollView.contentOffset.y;
    NSLog(@"y = %lf", offsetY);
    CGFloat height = scrollView.frame.size.height;
    NSInteger page = (scrollView.contentOffset.y + height / 2) / height;
    NSLog(@"当前页数: %ld",(long)page);
}
-(void)scrollViewDidEndScrollingAnimation:(UIScrollView *)scrollView{
    NSLog(@"结束拖动的时候调用这个函数");
}
-(void)scrollViewWillBeginDragging:(UIScrollView *)scrollView{
    NSLog(@"滚动视图即将开始被拖动的时候");
}
//即将结束拖动的时候调用
-(void)scrollViewWillEndDragging:(UIScrollView *)scrollView withVelocity:(CGPoint)velocity targetContentOffset:(inout CGPoint *)targetContentOffset {
    NSLog(@"即将结束拖动的时候调用");
}
//视图即将减速的时候
- (void)scrollViewWillBeginDecelerating:(UIScrollView *)scrollView {
    NSLog(@"视图即将减速的时候");
}
//视图即将结束减速的时候调用，视图停止的瞬间调用
- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView {
    NSLog(@"视图即将结束减速的时候调用");
}
```

## 步进器与分栏控件

### 步进器

用于**数值的加减控制**（比如数量、音量、页数）

点击 `+` 或 `-` 来改变值

```objc
-(void)viewDidLoad {
    [super viewDidLoad];
    UIStepper* stepper = [[UIStepper alloc] init];
    stepper.frame = CGRectMake(100, 100, 100, 50);
    stepper.minimumValue = 0;
    stepper.maximumValue = 10;
    stepper.stepValue = 1;//每次变化值
    stepper.value = 0;//当前值
  	stepper.autorepeat = YES; // 是否可以重复响应事件操作
  	stepper.continuous = YES; // 是否将步进结果通过事件函数响应出来
    [stepper addTarget:self action:@selector(stepperChange:) forControlEvents:UIControlEventValueChanged];
    [self.view addSubview:stepper];
}
-(void)stepperChange:(UIStepper*) stepper{
    NSLog(@"当前值：%f",stepper.value);
}
```

在这里需要讲解的是这个`continuous`的作用，它是保证每当步进一次它就会调用这个事件函数，例如你一直按着`+`，如果`continuous`是`YES`它会将每一次的值都打印，相反的，如果`continuous`是`NO`它只会在松开后打印最后的值

### 分栏控件

用于**多个选项之间切换**

```objc
-(void)viewDidLoad {
    [super viewDidLoad];
    UISegmentedControl* segControl = [[UISegmentedControl alloc] init];
    segControl.frame = CGRectMake(10, 200, 300, 40);
    [segControl insertSegmentWithTitle:@"源蛋" atIndex:0 animated:YES];
    [segControl insertSegmentWithTitle:@"源球" atIndex:1 animated:YES];
    [segControl insertSegmentWithTitle:@"源蛋大王" atIndex:2 animated:YES];
    segControl.selectedSegmentIndex = 0;//默认按钮
    [segControl addTarget:self action:@selector(segChange:) forControlEvents:UIControlEventValueChanged];
    [self.view addSubview:segControl];
}
-(void)segChange:(UISegmentedControl*) segControl{
    NSLog(@"%ld",segControl.selectedSegmentIndex);
}
```

## UIAlertController和UIActivityIndicatorView

```objc
-(void)viewDidLoad {
    [super viewDidLoad];
    for(int i = 0; i < 2; i++) {
        UIButton* button = [UIButton buttonWithType:UIButtonTypeRoundedRect];
        button.frame = CGRectMake(100, 100*(i+1), 100, 40);
        if (i == 0) {
            [button setTitle:@"无畏契约警告" forState:UIControlStateNormal];
        } else {
            [button setTitle:@"等待提示器" forState:UIControlStateNormal];
        }
        button.tag = 101 + i;
        [button addTarget:self action:@selector(press:) forControlEvents:UIControlEventTouchUpInside];
        [self.view addSubview:button];
    }
}
-(void) press:(UIButton*) btn {
    if (btn.tag == 101) {
        _alertController = [UIAlertController alertControllerWithTitle:@"警告" message:@"手机没有安装无畏契约" preferredStyle:UIAlertControllerStyleAlert];
        
        UIAlertAction* cancelAction = [UIAlertAction actionWithTitle:@"我的其他设备有无畏契约" style:UIAlertActionStyleCancel handler:nil];
        [_alertController addAction:cancelAction];
        UIAlertAction* newAction = [UIAlertAction actionWithTitle:@"安装无畏契约和瓦罗兰特" style:UIAlertActionStyleDefault handler:nil];
        [_alertController addAction:newAction];
        UIAlertAction* confirmAction = [UIAlertAction actionWithTitle:@"安装无畏契约" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
            NSLog(@"点击了确认按钮");
        }];
        [_alertController addAction:confirmAction];
        [self presentViewController:_alertController animated:YES completion:nil];
        
    } else {
        UIActivityIndicatorView* activi = [[UIActivityIndicatorView alloc] initWithFrame:CGRectMake(100, 300, 80, 80)];
        activi.activityIndicatorViewStyle = UIActivityIndicatorViewStyleMedium;
        [self.view addSubview:activi];
        [activi startAnimating];
    }
}
```

**拓展**：

**preferredStyle**：

* `UIAlertControllerStyleAlert`：弹窗在屏幕中央

* `UIAlertControllerStyleActionSheet`：底部弹出，适合操作选项选择（iPhone）

**style 类型**：

* Default：普通按钮

* Cancel：取消按钮（一个对话框最多只能有一个）

* Destructive：红色字体，表示“危险操作”