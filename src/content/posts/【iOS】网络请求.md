---
title: "网络请求"
publishedDate: 2026-07-29
tags: ["iOS", "网络"]
description: "iOS 开发技术笔记 - 网络请求"
category: "iOS 底层"
---

# 网络请求(NSURL、NSURLRequest、NSURLSessionDataTask、协议回调与 JSON 数据的基本流向)

[TOC]

## 一、整体流程

在OC中做一次网络请求，本质是这几个对象配合的过程

```
NSURL（地址）
   ↓
NSURLRequest（把地址包装成一份"请求单"：方法、Header、Body...）
   ↓
NSURLSession（会话管理器，负责发起、调度、管理所有任务）
   ↓
NSURLSessionDataTask（具体的一次网络任务，session 用它来执行 request）
   ↓
数据回来了 —— 通过 completionHandler（Block）或者 Delegate（协议回调）拿到 NSData
   ↓
NSJSONSerialization 把 NSData 解析成 NSDictionary / NSArray（即 JSON 对象）
```

总结：**NSURL 是地址，NSURLRequest 是包装好地址+参数的信封，NSURLSession 是邮局，NSURLSessionDataTask 是这一次寄送的具体包裹，回调（Block 或 Delegate）是收件通知，NSData 是包裹里的东西，JSON 解析是拆包裹**

## 二、NSURL

`NSURL` 只负责**表示**一个地址（可以是网络地址，也可以是本地文件路径）

```objc
// 最简单的创建方式
NSURL *url = [NSURL URLWithString:@"https://api.example.com/users"];

// 如果 URL 中带有中文或特殊字符，需要先做 URL 编码，否则可能创建失败（返回 nil）
NSString *rawString = @"https://api.example.com/search?q=ym";
NSString *encodedString = [rawString stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
NSURL *url2 = [NSURL URLWithString:encodedString];
```

例如一个天气接口的NSURL：

```objc
https://api.weather.com/v1/current?city=Beijing&key=abcdef123456&lang=zh
```

它的组成就是：

1. 协议(`https://`)
2. 服务器地址(`api.weather.com`)
3. 访问接口(/v1/current),这里表示访问实时天气
4. 查询参数(Query)(`?city=Beijing&key=abcdef123456&lang=zh`)

查询参数是按照自己想查的东西对应需要的

**注意点：**

* 一般在`GET`方法中我们在URL中直接写入查询参数，在`POST`方法中我们一般将其写在`HTTPBody`中
* URL 拼接查询参数时，推荐用 `NSURLComponents`，比手动拼字符串更安全：

```objc
NSURLComponents *components = [NSURLComponents componentsWithString:@"https://api.example.com/search"];
components.queryItems = @[
    [NSURLQueryItem queryItemWithName:@"q" value:@"你好世界"],
    [NSURLQueryItem queryItemWithName:@"page" value:@"1"]
];
NSURL *url3 = components.URL; // NSURLComponents 会自动帮你做好编码
```

## 三、NSURLRequest / NSMutableURLRequest 

`NSURL` 只是地址，`NSURLRequest` 才是真正描述"这次请求要怎么发"的对象：请求方法（GET/POST）、超时时间、请求头、请求体等。

- `NSURLRequest`：不可变，创建后不能改。适合简单的 GET。
- `NSMutableURLRequest`：可变，可以设置 Header、Body、HTTPMethod，是最常用的类型。

```objc
NSURL *url = [NSURL URLWithString:@"https://api.example.com/users/1"];

NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
request.HTTPMethod = @"GET";                          // 请求方法，默认就是 GET
request.timeoutInterval = 15.0;                        // 超时时间，单位秒
[request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];//请求头
[request setValue:@"Bearer xxx-token-xxx" forHTTPHeaderField:@"Authorization"];//请求头
```

**属性说明：**

| 属性                                                   | 说明                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `HTTPMethod`                                           | 字符串，`@"GET"` / `@"POST"` / `@"PUT"` / `@"DELETE"` 等     |
| `allHTTPHeaderFields` / `setValue:forHTTPHeaderField:` | 请求头                                                       |
| `HTTPBody`                                             | `NSData` 类型，POST/PUT 时放请求体（比如 JSON 序列化后的数据） |
| `timeoutInterval`                                      | 超时时间                                                     |
| `cachePolicy`                                          | 缓存策略，比如 `NSURLRequestReloadIgnoringLocalCacheData` 表示不用本地缓存 |

## 四、NSURLSession

`NSURLSession` 是真正发起网络请求，NSURLRequest只是配置要求。它自己不直接产生结果，而是通过它来创建 `NSURLSessionTask`（`NSURLSessionDataTask` / `UploadTask` / `DownloadTask`）

常见的获取方式：

```objc
// 1. 单例会话，最常用，配置简单，适合大多数普通请求
NSURLSession *session = [NSURLSession sharedSession];

// 2. 自定义配置的会话（可以设置超时、是否走蜂窝网络、缓存策略等）
NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
config.timeoutIntervalForRequest = 20.0;
config.allowsCellularAccess = YES;
NSURLSession *customSession = [NSURLSession sessionWithConfiguration:config];

// 3. 带 delegate 的会话（想用协议回调方式接收数据时，必须这样创建）
NSURLSession *delegateSession = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:nil]; // nil 表示系统自动创建一个串行队列
```

**注意点: **我们注意到超时时间缓存策略不是在NSURLRequest设置过一次吗，在NSURLSession又设置一遍有什么区别，需要说的是**`NSURLRequest`** **是单次请求级别。**

**`NSURLSessionConfiguration`** **是整个 Session 级别**

Request优先级是高于Session的，也就是说Request会覆盖Session的设置

**三种 SessionConfiguration：**

- `defaultSessionConfiguration`：使用磁盘缓存，行为和普通网络请求一致。
- `ephemeralSessionConfiguration`：不写磁盘，全部数据存内存，App 退出即清空（类似浏览器无痕模式）。
- `backgroundSessionConfiguration:`：支持 App 进入后台后继续传输，常用于大文件上传下载。

## 五、NSURLSessionDataTask

`session` 拿到 `request` 后，通过它创建一个 `NSURLSessionDataTask`，这个 task 就代表"这一次具体的网络请求"。

```objc
NSURLSessionDataTask *task = [session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
    // 请求完成后的回调，会在子线程执行
    if (error) {
        NSLog(@"请求失败: %@", error.localizedDescription);
        return;
    }
    // data 就是服务器返回的原始二进制数据（通常是 JSON 的字节流）
}];

//必须手动 resume 才会真正发出请求
[task resume];
```

**关键点：`dataTaskWithRequest:` 有两种重载：**

1. `dataTaskWithRequest:completionHandler:` —— Block 方式，一次性拿到完整结果，简单直接。
2. `dataTaskWithRequest:`（不传 completionHandler） —— 必须配合 `delegate`，数据是分段、多次回调给你的，适合需要监控下载进度、大文件流式处理的场景。

两者**不能同时用**：用了 completionHandler 的 task，delegate 里的数据回调方法（如 `didReceiveData:`）就不会被触发。

## 六、Block回调和代理回调

|              | Block（completionHandler） | Delegate（协议回调）                                         |
| ------------ | -------------------------- | ------------------------------------------------------------ |
| 使用难度     | 简单，代码集中             | 稍复杂，逻辑分散在多个代理方法里                             |
| 数据接收方式 | 一次性拿到完整 `NSData`    | 分多次通过 `didReceiveData:` 累积拼接                        |
| 适用场景     | 普通的增删改查请求         | 需要进度回调、大文件下载、需要精细控制（比如证书校验、重定向处理） |
| 回调所在线程 | 子线程（非主线程！）       | 由 `delegateQueue` 决定，默认也是子线程                      |

**共同点：无论哪种方式，回调都不在主线程，如果要更新 UI，必须手动切回主线程：**

```objc
dispatch_async(dispatch_get_main_queue(), ^{
    self.label.text = @"更新UI";
});
```

**代理回调：**

```objc
@interface ViewController () <NSURLSessionDataDelegate>
@property (nonatomic, strong) NSMutableData *receivedData; // 用来拼接分段到达的数据
@end

@implementation ViewController

// 1. 收到服务器响应头时调用（此时还没有 body 数据）
- (void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask didReceiveResponse:(NSURLResponse *)response completionHandler:(void (^)(NSURLSessionResponseDisposition disposition))completionHandler {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
    NSLog(@"状态码: %ld", (long)httpResponse.statusCode);

    self.receivedData = [NSMutableData data]; // 容器接收数据
    // completionHandler，告诉系统"继续接收数据"
    completionHandler(NSURLSessionResponseAllow);
}

// 2. 数据分段到达时反复调用（一个大的响应体可能会触发好多次）
- (void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask didReceiveData:(NSData *)data {
    [self.receivedData appendData:data]; // 把这一段拼接起来
}

// 3. 整个 task 结束时调用
- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(nullable NSError *)error {

    if (error) {
        NSLog(@"请求失败: %@", error.localizedDescription);
        return;
    }

    // 数据已经完整拼接好,开始 JSON 解析
    NSError *jsonError;
    id jsonObject = [NSJSONSerialization JSONObjectWithData:self.receivedData options:0 error:&jsonError];
    if (jsonError) {
        NSLog(@"JSON 解析失败: %@", jsonError);
        return;
    }
    NSLog(@"解析结果: %@", jsonObject);
}

@end
```

## 七、JSON数据解析(NSJSONSerialization)

服务器返回的 `NSData` 本质是一串 JSON 格式的字节流，需要用 `NSJSONSerialization` 把它转换成 OC 对象（`NSDictionary` / `NSArray`）才能使用

```objc
NSError *error;
id jsonObject = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers
error:&error];
if (error) {
    NSLog(@"JSON 解析失败: %@", error.localizedDescription);
    return;
}
// JSON 顶层可能是字典，也可能是数组，务必先判断类型再使用，避免 crash
if ([jsonObject isKindOfClass:[NSDictionary class]]) {
    NSDictionary *dict = (NSDictionary *)jsonObject;
    NSString *name = dict[@"name"];
    NSLog(@"name = %@", name);
} else if ([jsonObject isKindOfClass:[NSArray class]]) {
    NSArray *array = (NSArray *)jsonObject;
    NSLog(@"数组长度: %lu", (unsigned long)array.count);
}
```

**反过来：把 OC 对象序列化成 JSON Data（用于 POST 请求体）：**

```objc
NSDictionary *params = @{@"username": @"darian", @"password": @"123456"};

if ([NSJSONSerialization isValidJSONObject:params]) { // 先校验是否可序列化
    NSError *error;
    NSData *bodyData = [NSJSONSerialization dataWithJSONObject:params options:0 error:&error];
    if (!error) {
        request.HTTPBody = bodyData;
    }
}
```

**常用 options：**

| 值                                       | 作用                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| `NSJSONReadingMutableContainers`         | 解析出的字典/数组是可变的（`NSMutableDictionary`/`NSMutableArray`） |
| `NSJSONReadingMutableLeaves`             | 解析出的字符串等叶子节点也是可变的                           |
| `NSJSONReadingFragmentsAllowed`          | 允许顶层不是字典/数组（比如单独一个数字或字符串）            |
| `NSJSONWritingPrettyPrinted`（写入时用） | 生成带缩进换行的、易读的 JSON                                |