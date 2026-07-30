---
title: "多界面传值"
publishedDate: 2026-04-21
tags: ["Objective-C", "iOS", "UI"]
description: "iOS 开发技术笔记 - 多界面传值"
category: "iOS 底层"
---

# 【OC】多界面传值

## 属性传值

属性的传值一般来说是从前往后进行的

这个的实现比较简单，我们可以在视图A之中实现一个 事件 ，然后将信息发送给后一个视图B并且控制视图弹出。以下是我用searchBar完成的一个界面传值功能，当我们在控制器A之中点击搜索时，就会将searchBar之中的文字内容通过控制器B的属性传给控制器B，实现了属性传值
```objc
#import "ViewController.h"
#import "ViewController2.h"
@interface ViewController () <UISearchBarDelegate>
@property (nonatomic, strong)UISearchBar *searchBar;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.searchBar = [[UISearchBar alloc] init];
    self.searchBar.frame = CGRectMake(100, 100, 200, 200);
    self.searchBar.delegate = self;
    [self.view addSubview:self.searchBar];
}
-(void)searchBarSearchButtonClicked:(UISearchBar *)searchBar{
    NSLog(@"1");
    ViewController2* controller2 = [[ViewController2 alloc] init];
    controller2.text = searchBar.text;
    [self presentViewController:controller2 animated:YES completion:nil];
}
-(void) touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event{
    [self.searchBar resignFirstResponder];
}


@end
```

```objc
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface ViewController2 : UIViewController
@property (nonatomic,strong)NSString* text;
@end

NS_ASSUME_NONNULL_END
#import "ViewController2.h"

@interface ViewController2 ()
@end

@implementation ViewController2

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor redColor];
    UILabel* label = [[UILabel alloc] init];
    label.text = self.text;
    label.frame = CGRectMake(100, 100, 200, 200);
    [self.view addSubview:label];
}
```

![CleanShot 2026-04-21 at 18.26.50](/Users/macbookair/Library/Application Support/CleanShot/media/media_woSygpdjSj/CleanShot 2026-04-21 at 18.26.50.gif)

## 协议/代理传值

**原理**：B 持有一个 `delegate` 属性（类型为协议），A 实现该协议并将自己赋值给 B 的 delegate。B 需要传值时调用 delegate 方法，A 就能接收到数据

```objc
// 1. 定义协议（通常写在 B 的头文件）
@protocol BDelegate <NSObject>
- (void)didSelectValue:(NSString *)value;
@end

// 2. B 持有 delegate（必须用 weak）
@property (nonatomic, weak) id<BDelegate> delegate;

// 3. B 中触发
[self.delegate didSelectValue:@"hello"];

// 4. A 实现协议
- (void)didSelectValue:(NSString *)value {
    NSLog(@"收到: %@", value);
}
```

`delegate` 必须声明为 `weak`，否则 A 持有 B、B 又强持有 A，造成循环引用内存泄漏。

Demo:

### CityListViewController.h（B 页面头文件）

```objc
#import <UIKit/UIKit.h>

// 1. 定义协议
@protocol CityListDelegate <NSObject>
- (void)cityListViewController:(UIViewController *)vc didSelectCity:(NSString *)city;
@end

@interface CityListViewController : UIViewController

// 2. 声明 delegate 属性（必须用 weak）
@property (nonatomic, weak) id<CityListDelegate> delegate;

@end
```

### CityListViewController.m（B 页面实现）

```objc
#import "CityListViewController.h"

@interface CityListViewController () <UITableViewDataSource, UITableViewDelegate>
@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong) NSArray<NSString *> *cities;
@end

@implementation CityListViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"选择城市";
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    
    self.cities = @[@"北京", @"上海", @"广州", @"深圳", @"成都"];
    
    self.tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStyleInsetGrouped];
    self.tableView.dataSource = self;
    self.tableView.delegate = self;
    [self.view addSubview:self.tableView];
}

#pragma mark - UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.cities.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"cell"];
    }
    cell.textLabel.text = self.cities[indexPath.row];
    return cell;
}

#pragma mark - UITableViewDelegate

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
    NSString *selectedCity = self.cities[indexPath.row];
    
    // 3. 调用 delegate 方法，将城市名传回去
    if ([self.delegate respondsToSelector:@selector(cityListViewController:didSelectCity:)]) {
        [self.delegate cityListViewController:self didSelectCity:selectedCity];
    }
    
    [self.navigationController popViewControllerAnimated:YES];
}

@end
```

------

### ViewController.m（A 页面实现）

```objc
#import "ViewController.h"
#import "CityListViewController.h"

// 4. A 遵守协议
@interface ViewController () <CityListDelegate>
@property (nonatomic, strong) UILabel *cityLabel;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"代理传值";
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    
    // 城市 Label
    self.cityLabel = [[UILabel alloc] initWithFrame:CGRectMake(40, 200, self.view.bounds.size.width - 80, 50)];
    self.cityLabel.text = @"请选择城市";
    self.cityLabel.textAlignment = NSTextAlignmentCenter;
    self.cityLabel.font = [UIFont systemFontOfSize:20 weight:UIFontWeightMedium];
    [self.view addSubview:self.cityLabel];
    
    // 跳转按钮
    UIButton *button = [UIButton buttonWithType:UIButtonTypeSystem];
    button.frame = CGRectMake(100, 280, self.view.bounds.size.width - 200, 44);
    [button setTitle:@"选择城市" forState:UIControlStateNormal];
    button.titleLabel.font = [UIFont systemFontOfSize:17];
    [button addTarget:self action:@selector(pushToCityList) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button];
}

- (void)pushToCityList {
    CityListViewController *cityVC = [[CityListViewController alloc] init];
    
    // 5. 设置 delegate 为 self（A 自己）
    cityVC.delegate = self;
    
    [self.navigationController pushViewController:cityVC animated:YES];
}

#pragma mark - CityListDelegate

// 6. 实现协议方法，接收传回的城市名
- (void)cityListViewController:(UIViewController *)vc didSelectCity:(NSString *)city {
    self.cityLabel.text = city;
}

@end
```

![CleanShot 2026-04-21 at 19.30.22](/Users/macbookair/Library/Application Support/CleanShot/media/media_6eq8c0Cx7G/CleanShot 2026-04-21 at 19.30.22.gif)

## block传值

**原理**：B 声明一个 block 属性，A 在跳转到 B 之前赋值这个 block。B 需要传值时调用这个 block，回调直接在 A 的闭包里执行。

```objc
// 1. B 声明 block 属性
@property (nonatomic, copy) void(^valueBlock)(NSString *value);

// 2. A 赋值 block
B *bVC = [[B alloc] init];
bVC.valueBlock = ^(NSString *value) {
    NSLog(@"收到: %@", value);
};

// 3. B 中触发
if (self.valueBlock) {
    self.valueBlock(@"hello");
}
```

**关键**：若 block 内部引用了 `self`，需要用 `__weak typeof(self) weakSelf = self;` 避免循环引用。block 属性要用 `copy` 修饰。

```objc
B 页面声明一个 block 属性，A 跳转前赋值 block，B 选择城市后调用 block 回调。

CityListViewController.h（B 页面头文件）
objc#import <UIKit/UIKit.h>

@interface CityListViewController : UIViewController

// 1. 声明 block 属性（用 copy 修饰）
@property (nonatomic, copy) void(^selectCityBlock)(NSString *city);

@end

CityListViewController.m（B 页面实现）
objc#import "CityListViewController.h"

@interface CityListViewController () <UITableViewDataSource, UITableViewDelegate>
@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong) NSArray<NSString *> *cities;
@end

@implementation CityListViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"选择城市";
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    
    self.cities = @[@"北京", @"上海", @"广州", @"深圳", @"成都"];
    
    self.tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStyleInsetGrouped];
    self.tableView.dataSource = self;
    self.tableView.delegate = self;
    [self.view addSubview:self.tableView];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.cities.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"cell"];
    }
    cell.textLabel.text = self.cities[indexPath.row];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
    NSString *selectedCity = self.cities[indexPath.row];
    
    // 2. 调用 block，将城市名回传
    if (self.selectCityBlock) {
        self.selectCityBlock(selectedCity);
    }
    
    [self.navigationController popViewControllerAnimated:YES];
}

@end

ViewController.m（A 页面实现）
objc#import "ViewController.h"
#import "CityListViewController.h"

@interface ViewController ()
@property (nonatomic, strong) UILabel *cityLabel;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"Block 传值";
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    
    self.cityLabel = [[UILabel alloc] initWithFrame:CGRectMake(40, 200, self.view.bounds.size.width - 80, 50)];
    self.cityLabel.text = @"请选择城市";
    self.cityLabel.textAlignment = NSTextAlignmentCenter;
    self.cityLabel.font = [UIFont systemFontOfSize:20 weight:UIFontWeightMedium];
    [self.view addSubview:self.cityLabel];
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeSystem];
    button.frame = CGRectMake(100, 280, self.view.bounds.size.width - 200, 44);
    [button setTitle:@"选择城市" forState:UIControlStateNormal];
    button.titleLabel.font = [UIFont systemFontOfSize:17];
    [button addTarget:self action:@selector(pushToCityList) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button];
}

- (void)pushToCityList {
    CityListViewController *cityVC = [[CityListViewController alloc] init];
    
    // 3. 赋值 block，__weak 避免循环引用
    __weak typeof(self) weakSelf = self;
    cityVC.selectCityBlock = ^(NSString *city) {
        weakSelf.cityLabel.text = city;
    };
    
    [self.navigationController pushViewController:cityVC animated:YES];
}

@end
```

![CleanShot 2026-04-21 at 19.30.22](/Users/macbookair/Library/Application Support/CleanShot/media/media_6eq8c0Cx7G/CleanShot 2026-04-21 at 19.30.22.gif)

### 通知传值（NSNotification）

**原理**：发送者 post 一条通知到通知中心，所有注册了该通知名的观察者都会收到，实现一对多广播。

```objc
// 1. 观察者注册（A 或任意对象）
[[NSNotificationCenter defaultCenter] addObserver:self
    selector:@selector(handleNoti:)
    name:@"MyNotification"
    object:nil];

// 2. 发送通知（B 或任意位置）
[[NSNotificationCenter defaultCenter] postNotificationName:@"MyNotification"
    object:nil
    userInfo:@{@"key": @"hello"}];

// 3. 处理通知
- (void)handleNoti:(NSNotification *)noti {
    NSString *value = noti.userInfo[@"key"];
}

// 4. 移除观察者（dealloc 中！）
- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}
```

**⚠️ 关键**：必须在 `dealloc` 中移除观察者，否则对象销毁后若收到通知会崩溃（野指针）。iOS 9+ 系统会自动移除，但手动移除更安全。

```objc
 页面选择城市后发送通知，A 页面注册监听该通知并接收城市名，实现跨层/跨模块传值。

NotificationNames.h（通知名常量，推荐单独定义）
objc#ifndef NotificationNames_h
#define NotificationNames_h

static NSString * const kSelectCityNotification = @"kSelectCityNotification";
static NSString * const kSelectCityKey = @"city";

#endif

CityListViewController.m（B 页面实现）
objc#import "CityListViewController.h"
#import "NotificationNames.h"

@interface CityListViewController () <UITableViewDataSource, UITableViewDelegate>
@property (nonatomic, strong) UITableView *tableView;
@property (nonatomic, strong) NSArray<NSString *> *cities;
@end

@implementation CityListViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"选择城市";
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    
    self.cities = @[@"北京", @"上海", @"广州", @"深圳", @"成都"];
    
    self.tableView = [[UITableView alloc] initWithFrame:self.view.bounds style:UITableViewStyleInsetGrouped];
    self.tableView.dataSource = self;
    self.tableView.delegate = self;
    [self.view addSubview:self.tableView];
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.cities.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"cell"];
    }
    cell.textLabel.text = self.cities[indexPath.row];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
    
    NSString *selectedCity = self.cities[indexPath.row];
    
    // 发送通知，将城市名放入 userInfo
    [[NSNotificationCenter defaultCenter]
        postNotificationName:kSelectCityNotification
        object:nil
        userInfo:@{kSelectCityKey: selectedCity}];
    
    [self.navigationController popViewControllerAnimated:YES];
}

@end

ViewController.m（A 页面实现）
objc#import "ViewController.h"
#import "NotificationNames.h"

@interface ViewController ()
@property (nonatomic, strong) UILabel *cityLabel;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.title = @"通知传值";
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    
    self.cityLabel = [[UILabel alloc] initWithFrame:CGRectMake(40, 200, self.view.bounds.size.width - 80, 50)];
    self.cityLabel.text = @"请选择城市";
    self.cityLabel.textAlignment = NSTextAlignmentCenter;
    self.cityLabel.font = [UIFont systemFontOfSize:20 weight:UIFontWeightMedium];
    [self.view addSubview:self.cityLabel];
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeSystem];
    button.frame = CGRectMake(100, 280, self.view.bounds.size.width - 200, 44);
    [button setTitle:@"选择城市" forState:UIControlStateNormal];
    button.titleLabel.font = [UIFont systemFontOfSize:17];
    [button addTarget:self action:@selector(pushToCityList) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button];
    
    // 注册通知监听
    [[NSNotificationCenter defaultCenter]
        addObserver:self
        selector:@selector(handleSelectCity:)
        name:kSelectCityNotification
        object:nil];
}

- (void)pushToCityList {
    CityListViewController *cityVC = [[CityListViewController alloc] init];
    [self.navigationController pushViewController:cityVC animated:YES];
}

// 接收通知
- (void)handleSelectCity:(NSNotification *)notification {
    NSString *city = notification.userInfo[kSelectCityKey];
    self.cityLabel.text = city;
}

// 必须移除观察者！
- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
```



------

### KVO（键值观察）

**原理**：观察者注册监听某个对象的某个属性，当该属性值发生变化时，系统会自动调用观察者的回调方法，不需要任何主动通知代码。

```objc
// 1. 观察者注册监听
[model addObserver:self
        forKeyPath:@"name"
           options:NSKeyValueObservingOptionNew | NSKeyValueObservingOptionOld
           context:nil];

// 2. 属性变化时自动回调
- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context {
    if ([keyPath isEqualToString:@"name"]) {
        NSString *newValue = change[NSKeyValueChangeNewKey];
        NSLog(@"name 变成了: %@", newValue);
    }
}

// 3. dealloc 中必须移除！
- (void)dealloc {
    [model removeObserver:self forKeyPath:@"name"];
}
```

**⚠️ 关键**：必须在 `dealloc` 中调用 `removeObserver:forKeyPath:`，否则会崩溃。在 Swift 中推荐使用 Combine 或 `@Published` 代替 KVO。



由于笔者还没有深入学习KVO在此先不给出KVO的具体demo，学完KVO再回来补全