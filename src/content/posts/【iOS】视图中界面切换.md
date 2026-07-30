---
title: "视图中界面切换"
publishedDate: 2026-04-07
tags: ["iOS", "UI"]
description: "iOS 开发技术笔记 - 视图中界面切换"
category: "iOS 底层"
---

# 视图中界面切换

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

![Simulator Screenshot - iPhone 17 - 2026-04-07 at 14.45.19](/Users/macbookair/Desktop/Simulator Screenshot - iPhone 17 - 2026-04-07 at 14.45.19.png)

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