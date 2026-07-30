---
title: "多线程与GCD"
publishedDate: 2026-07-29
tags: ["多线程", "GCD"]
description: "iOS 开发技术笔记 - 多线程与GCD"
category: "iOS 底层"
---

# 【iOS】多线程与GCD

[TOC]

## 线程与进程

### 线程与进程的定义

#### 线程

* 线程是进程的基本执行单元，一个进程的所有任务都在线程中执行
* 进程要想执行任务，必须要有线程，进程至少有一条线程
* 程序启动时会默认开启一条线程，这条线程叫主线程或UI线程

#### 进程

* 进程是指系统中正在运行的一个应用程序
* 每个进程是独立的，每个进程都运行在其专用且受保护的内存空间里
* 通过“活动监视器”可以查看mac系统内开启的进程

所以，可以简单理解为：**进程是线程的容器，而线程用来执行任务**。在iOS中是**单进程开发**，一个进程就是一个app，进程之间是相互独立的，如支付宝、微信、qq等，这些都是属于不同的进程

### 线程与进程的关系

* 地址空间
  1. 同一个进程的线程共享本进程的地址空间
  2. 进程之间时独立的地址空间

* 资源拥有
  1. 同一个进程的线程共享本进程的资源，如内存，I/O，cpu等
  2. 进程之间的资源是独立的

两个之间的关系就相当于工厂与流水线的关系，工厂与工厂之间是相互独立的，而工厂中的流水线是共享工厂的资源的，即 进程相当于一个工厂，线程相当于工厂中的一条流水线

* 多进程要比多线程健壮
  1. 一个进程崩溃，在保护模式下，不会对其他进程影响
  2. 而一个线程崩溃整个进程都死掉

* 使用场景：频繁切换，并发操作
  1. 进程切换时，消耗的资源大，所以涉及到频繁的切换，使用线程好于进程
  2. 如果要求同时进行又要共享某些变量的并发操作，只能用线程，不能用进程

*  执行过程
  1. 每个独立的进程有一个程序运行的入口，顺序执行序列和程序入口
  2. 但是线程不能独立执行，必须依存于应用程序中，由应用程序提供多个线程执行控制

* 线程是处理器调度的基本单位，进程不是
* 线程没有地址空间，线程包含在进程地址空间中

## 多线程

### 多线程原理

- 对于单核CPU， 同一时间，CPU只能处理一条线程，即只有一条线程在工作
- iOS中的多线程同时执行的本质是CPU在多个人物之间直接进行快速的切换 ，由于CPU调度线程的时间足够快，就造成了 多线程同时执行的效果。其中切换到时间间隔就是时间片

### 多线程意义

**优点：**

* 能适当提高程序运行效率
* 能适当提高资源利用率，CPU，内存
* 线程上的任务执行完成后，线程自动销毁

**缺点：**

* 开启线程需要占用一定内存空间，默认情况，每个线程占用512KB
* 如果开启大量线程，会占用大量内存空间，降低程序性能
* 线程越多，CPU在调用线程上的开销就越大
* 程序设计更加复杂，比如线程间的通信，多线程的数据共享

### 多线程生命周期

![CleanShot 2026-07-27 at 10.04.41](/Users/macbookair/Library/Application Support/CleanShot/media/media_YlrlUAt2RL/CleanShot 2026-07-27 at 10.04.41.png)

**新建 - 就绪 - 运行 - 阻塞 - 死亡**

* **新建**：主要是实例化线程对象
* **就绪**：线程对象调用start方法，将线程对象加入可调度线程池，等待CPU调用，即调用start方法后，不会立即执行，而是进入就绪状态，需要等待一段时间，经过CPU调度后才执行
* **运行**：CPU负责调度可调度线程中线程的执行，在线程执行完成前，其状态可能在就绪和运行直接来回切换，这个变化是由CPU负责的，开发人员不能干预
* **阻塞**：当满足某个预定条件时，可以使用休眠，即sleep或者同步锁，阻塞线程执行  当进入sleep后，会将线程重新加入就绪中下面关于休眠的时间设置，都是NSTread的
  * `sleepUntilDate`: 阻塞当前线程，直到指定的时间为止，即休眠到指定时间
  * `sleepForTimeInterval`: 在给定的时间间隔内休眠线程，即指定休眠时长
  * 同步锁：`@synchronized(self)：`

* **死亡**：分为两种情况
  * 正常死亡，即线程执行完毕
  * 非正常死亡，即当满足某个条件后，在线程内部终止执行 (调用exit等方法退出)

简要说明，处于运行中的线程**拥有一段可以执行的时间(时间片)**

* 如果时间片用尽，线程就会进入就绪状态
* 如果时间片没有用尽，且需要开始等待某事件，就会进入阻塞状态队列
* 等待事件发生后，线程又会重新进入就绪状态队列
* 每当一个线程离开运行，会重新从就绪状态队列中选择一个线程继续执行

**线程的exit与cancel**说明：

* exit：一旦强行终止线程，后续代码都不执行
* cancel：取消当前线程，但不能取消正在执行的线程

### 线程优先级

线程执行的快慢，除了要看优先级，还要看资源的大小，CPU的调度情况，在NSThread中，线程优先级threadPriority已经被服务质量qualityOfService所取代

```objc
NSThread *thread = [[NSThread alloc] initWithBlock:^{
    // 执行任务
}];
thread.threadPriority = 0.8; // 设置优先级，取值范围 0.0 ~ 1.0
[thread start];

0.0是优先级最低，1.0优先级最高，默认值大约为0.5
Apple后来引入了 服务质量 概念，用于更智能地管理线程优先级，在NSThread、NSOperation、GCD都支持这种机制，
NSThread *thread = [[NSThread alloc] initWithBlock:^{
    // 执行任务
}];
thread.qualityOfService = NSQualityOfServiceUserInitiated; // 设置服务质量
[thread start];

```

#### QoS的五种等级

| 枚举值               | 含义       | 典型用途                       |
| -------------------- | ---------- | ------------------------------ |
| **User Interactive** | 最高优先级 | UI操作，动画，响应用户点击     |
| **User Initiated**   | 较高优先级 | 用户发起，需要尽快完成的任务   |
| **Utility**          | 中等优先级 | 不太急的后台任务（下载，计算） |
| **Background**       | 低优先级   | 后台维护，同步，清理缓存       |
| **Default**          | 默认       | 没有明确指定时使用             |

![CleanShot 2026-07-27 at 11.11.19](/Users/macbookair/Library/Application Support/CleanShot/media/media_CqxlX2K2l4/CleanShot 2026-07-27 at 11.11.19.png)

## 线程池

![CleanShot 2026-07-27 at 11.13.24](/Users/macbookair/Library/Application Support/CleanShot/media/media_Yj6qGNe6UR/CleanShot 2026-07-27 at 11.13.24.png)

## iOS多线程

iOS中的多线程实现方式，主要有四种：pthread、NSThread、GCD、NSOperation，汇总如图所示

![CleanShot 2026-07-27 at 11.15.44](/Users/macbookair/Library/Application Support/CleanShot/media/media_fFOXT5CxHI/CleanShot 2026-07-27 at 11.15.44.png)

### 线程安全问题

当多个线程同时访问一块资源时，容易引发数据错乱和数据安全问题

先用一个实例来帮助理解：

```
假设：
money = 100；
money -= 100；
线程1:
读取：100
此时切换到线程2:
读取：100
减100
写回：0
切回线程1:
减100
写回：0
```

这时两个线程都取回了100，但实际总共只有100，这就引发了线程安全问题

解决这个问题，有两种解决方案：

* **互斥锁**
* **自旋锁**

### 互斥锁

* 用于保护临界区，确保同一时间，只有一条线程能够执行

* 如果代码中只有一个地方需要加锁，大多都使用 self，这样可以避免单独再创建一个锁对象

* 加了互斥锁的代码，当新线程访问时，如果发现其他线程正在执行锁定的代码，**新线程就会进入休眠(Blocked)**

  

  针对互斥锁，还需要注意以下几点：

* 互斥锁的锁定范围，应该尽量小，锁定范围越大，效率越差

* 能够加锁的任意 NSObject 对象

* 锁对象一定要保证所有的线程都能够访问

```
                money
                  │
             获取互斥锁
                  │
         ┌────────┴────────┐
      线程1              线程2
        │                  │
      获取成功            获取失败
        │                  │
      修改数据            睡眠等待
        │                  │
      解锁                 等待锁释放
                           │
                         获取锁
                           │
                        修改数据
                           │
                         解锁
```

**优点**：安全且不会占用CPU

**缺点：**将线程切换有性能损耗



### 自旋锁

* 自旋锁与互斥锁类似，但它不是通过休眠使线程阻塞，而是在获取锁之前一直处于忙等（即原地打转，称为自旋）阻塞状态
* 使用场景：锁持有的时间短，且线程不希望在重新调度上花太多成本时，就需要使用自旋锁，属性修饰符atomic，本身就有一把自旋锁
* 加入了自旋锁，当新线程访问代码时，如果发现有其他线程正在锁定代码，新线程会用死循环的方法，一直等待锁定的代码执行完成，即不停的尝试执行代码，比较消耗性能
  

### 自旋锁VS互斥锁

* 同：在同一时间，保证了只有一条线程执行任务，即保证了相应同步的功能
* 不同：
  * 互斥锁：发现其他线程正在执行，当前线程休眠，进入等待执行。一直等其他线程执行完，然后唤醒执行
  * 自旋锁：发现其他线程执行，当前线程一直询问，处于忙等状态，耗费的性能比较高
* 场景：根据任务复杂度区分，使用不同的锁，但判断不同时，更多是使用互斥锁去处理
  * 当前的任务状态比较短小精悍时，用自旋锁
  * 反之的，用互斥锁

### atomic 原子锁 & nonatomic 非原子锁

atomic和nonatomic主要用于属性的修饰，以下是相关的说明

atomic是原子属性，是为多线程开发准备的，是默认属性

* 同一时间 单线程写，多线程读的线程处理技术
* Mac开发中常用

nonatomic是非原子属性

* 没有锁，性能高
* 移动端开发常用

atomic的底层在最早是通过轻量级自旋锁 OSSpinLock实现的，后来因为存在优先级反转问题被弃用了，现在内部已经改成使用os_unfair_lock

```objc
static inline void reallySetProperty(id self, SEL _cmd, id newValue, ptrdiff_t offset, bool atomic, bool copy, bool mutableCopy)
{
    if (offset == 0) {
        object_setClass(self, newValue);
        return;
    }

    id oldValue;
    id *slot = (id*) ((char*)self + offset);

    if (copy) {
        newValue = [newValue copyWithZone:nil];
    } else if (mutableCopy) {
        newValue = [newValue mutableCopyWithZone:nil];
    } else {
        if (*slot == newValue) return;
        newValue = objc_retain(newValue);
    }

    if (!atomic) {
        oldValue = *slot;
        *slot = newValue;
    } else { // 加锁修饰不加锁修饰
        spinlock_t& slotlock = PropertyLocks[slot];
        slotlock.lock();
        oldValue = *slot;
        *slot = newValue;        
        slotlock.unlock();
    }
    objc_release(oldValue);
}

```

我们借助这段代码来看atomic到底做了什么：

`spinlock_t& slotlock = PropertyLocks[slot];`首先取出属性对应的锁

`slotlock.lock();`上锁

读取旧值，赋新值

`slotlock.unlock();`解锁

释放旧值

**atomic与nonatomic 的区别**

* nonatomic
  * 非原子属性
  * 非线程安全，适合内存小的移动设备

* atomic
  * 原子属性(线程安全)，针对多线程设计的，默认值
  * 保证同一时间只有一个线程能够写入(但是同一个时间多个线程都可以取值)
  * atomic 本身就有一把锁(自旋锁) 单写多读:单个线程写入，多个线程可以读取
  * 线程安全，需要消耗大量的资源

iOS 开发的建议

* 所有属性都声明为 nonatomic

* 尽量避免多线程抢夺同一块资源 尽量将加锁、资源抢夺的业务逻辑交给服务器端处理，减小移动客户端的压力

  atomic修饰的属性绝对安全吗？
  **atomic只能保证我们的setter和getter方法的线程安全，并不能保证数据安全**

### 优先级反转

在上文中我们提到线程是有优先级的，如果这个时候我们使用自旋锁 OSSpinLock就可能会出现优先级反转问题，这也是为什么苹果后来废弃使用的原因

我们还是通过一个实例来解释：

```
H:高优先级 M：中优先级  L：低优先级
L获取锁 -> H等待锁 -> M抢占CPU -> M执行完 -> L解锁 -> H获取锁
```

![CleanShot 2026-07-27 at 20.41.05](/Users/macbookair/Library/Application Support/CleanShot/media/media_5hxrxkgsjy/CleanShot 2026-07-27 at 20.41.05.png)

总结：优先级反转是指高优先级线程因为等待某个资源（通常是锁），而被低优先级线程间接阻塞的现象。典型场景是低优先级线程持有锁，高优先级线程等待该锁，而中优先级线程不断占用 CPU，导致低优先级线程无法运行并释放锁，最终高优先级线程反而无法执行。由于 `OSSpinLock` 在等待锁时会持续自旋，占用 CPU，因此容易出现优先级反转问题，所以苹果后来使用 `os_unfair_lock` 来替代它。

## GCD

GCD是异步执行任务的技术之一，是Apple开发的一个多核变成的较新的解决方式。它主要用于优化应用程序以支持多核处理器以及其他对称多处理系统。他是在一个线程池的基础上，并行执行任务

### GCD核心

GCD的核心主要由**任务+队列+函数**组成

#### 任务

任务就是执行操作的意思，换言之就是我们在线程中执行的那段代码，在GCD中是放在block里的

* 同步执行(sync)

​	同步添加任务到指定的队列中，在添加的任务执行结束前会一直等待，直到里面的任务完成之后再继续执行

​	只能在当前线程中执行任务，不具备开启新线程的能力

* 异步执行(async)

​	异步添加任务到指定队列中，它不会做任何等待，可以继续执行后面的任务

​	可以在新的线程中执行任务，具备开启新线程的能力

进入`dispatch_sync`函数后，程序不会立刻返回，因此会阻塞线程

进入`dispatch_async`函数后程序会立即返回，不会阻塞线程

#### 队列

**队列（Dispatch Queue)** ： 这里的队列指执行任务的等待队列，即用来存放任务的队列。队列是一种特殊的线性表，采用FIFO（先进线出）的原则，即新任务总是被插入到队列的末尾，而读取任务的时候总是从队列的头部开始读取。每读取一个任务，从队列中释放一个任务

- 串行队列：每次只有一个任务被执行，让一个任务接着一个的去执行
- 并行队列：可以让多个任务并发执行，可以开启多个线程，并且同时执行任务

| 队列类型                   | 创建方式                                                    | 执行特性                       |
| -------------------------- | ----------------------------------------------------------- | ------------------------------ |
| 主队列(Main Queue)         | `dispatch_get_main_queue()`                                 | 串行队列，在主线程执行         |
| 全局并发队列(Global Queue) | `dispatch_get_global_queue()`                               | 并发队列，系统自动调度多个线程 |
| 自定义串行队列             | `dispatch_queue_create("label",DISPATCH_QUEUE_SERIAL)"`     | 串行，系统自动创建新线程       |
| 自定义并发队列             | `dispatch_queue_create("label",DISPATCH_QUEUE_CONCURRENT)"` | 并发，系统自动创建多个线程     |

#### 串行并行与同步异步

同步/异步(sync / async) 决定的是：**提交任务之后，当前线程是否需要等待任务完成**

串行/并行(serial / concurrent)决定的是：**队列中的任务是串行执行还是允许并发执行**

### GCD的基本使用

**sync / async × serial / concurrent** 的四种组合

在接下来的的分析中，我会按下面四个问题来分析

1. 会不会阻塞当前线程？
2. 会不会开启新线程？
3. 任务的执行顺序是什么？
4. 是否可以并发执行？

#### 同步串行

```objc
#import <Foundation/Foundation.h>
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        dispatch_queue_t serialQueue = dispatch_queue_create("serialQueue", DISPATCH_QUEUE_SERIAL);
        dispatch_sync(serialQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"1 %d == %@", i, [NSThread currentThread]);
            }
        });
        dispatch_sync(serialQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"2 %d == %@", i, [NSThread currentThread]);
            }
        });
    }
    return EXIT_SUCCESS;
}
```

![CleanShot 2026-07-27 at 16.47.49@2x](/Users/macbookair/Library/Application Support/CleanShot/media/media_5bkHaieZSc/CleanShot 2026-07-27 at 16.47.49@2x.png)

总结：**会等待，会阻塞当前线程，通常不会开启新线程，串行执行**

#### 异步串行

```objc
#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        dispatch_queue_t serialQueue = dispatch_queue_create("serialQueue", DISPATCH_QUEUE_SERIAL);
        dispatch_async(serialQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"1 %d == %@", i, [NSThread currentThread]);
            }
        });
        dispatch_async(serialQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"2 %d == %@", i, [NSThread currentThread]);
            }
        });
        sleep(2);//这里需要sleep，不然会直接运行到下面的EXIT退出程序
    }
    return EXIT_SUCCESS;
}
```

![CleanShot 2026-07-27 at 17.00.32@2x](/Users/macbookair/Library/Application Support/CleanShot/media/media_sgLg64gtfW/CleanShot 2026-07-27 at 17.00.32@2x.png)

总结：不等待，当前线程不会被阻塞(需要sleep的原因)，通常会开启新线程，串行执行

#### 同步并行

```objc
#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        dispatch_queue_t serialQueue = dispatch_queue_create("serialQueue", DISPATCH_QUEUE_SERIAL);
        dispatch_queue_t concurrentQueue = dispatch_queue_create("concurrentQueue", DISPATCH_QUEUE_CONCURRENT);
        dispatch_sync(concurrentQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"1 %d == %@", i, [NSThread currentThread]);
            }
        });
        dispatch_sync(concurrentQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"2 %d == %@", i, [NSThread currentThread]);
            }
        });
    }
    return EXIT_SUCCESS;
}

```

![CleanShot 2026-07-27 at 17.19.09@2x](/Users/macbookair/Library/Application Support/CleanShot/media/media_PjopPx8r1u/CleanShot 2026-07-27 at 17.19.09@2x.png)

总结：等待，阻塞当前线程，通常不开启新线程，没有体现并发执行

#### 异步并行

```objc
#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        dispatch_queue_t serialQueue = dispatch_queue_create("serialQueue", DISPATCH_QUEUE_SERIAL);
        dispatch_queue_t concurrentQueue = dispatch_queue_create("concurrentQueue", DISPATCH_QUEUE_CONCURRENT);
        dispatch_async(concurrentQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"1 %d == %@", i, [NSThread currentThread]);
            }
        });
        dispatch_async(concurrentQueue, ^{
            for (int i = 0; i < 5; i++) {
                NSLog(@"2 %d == %@", i, [NSThread currentThread]);
            }
        });
        sleep(2);
    }
    return EXIT_SUCCESS;
}
```

![CleanShot 2026-07-27 at 17.30.59@2x](/Users/macbookair/Library/Application Support/CleanShot/media/media_YCR52fz1h1/CleanShot 2026-07-27 at 17.30.59@2x.png)

总结：不会等待，不会阻塞线程，通常开启新线程，体现了并发执行

### 面试问题

#### 异步函数 + 并行队列

```objc
- (void)interview01{//并行队列
    dispatch_queue_t queue = dispatch_queue_create("com.CJL.Queue", DISPATCH_QUEUE_CONCURRENT);
    NSLog(@"1");// 耗时
    dispatch_async(queue, ^{
        NSLog(@"2");
        dispatch_async(queue, ^{
            NSLog(@"3");
        });
        NSLog(@"4");
    });
    NSLog(@"5");
}    
    ----------打印结果-----------
输出顺序为：1 5 2 4 3
```

分析结果：

主线程的任务队列：**任务1，异步block1，任务5**，其中异步block1会比较耗费性能，任务一和任务五的任务复杂度是一样的，所以任务1和任务5优先于异步block1执行

在异步block1中，任务队列为：**任务2，异步block2，任务4**，其中block2相对比较耗费性能，任务2和任务4是复杂度一样，所以任务2和任务4优先于block2执行

最后执行**block2中的任务3**

在极端情况下，可能出现 任务2先于任务1和任务5执行，原因是出现了当前主线程卡顿或者 延迟的情况

**代码修改**

**【修改1】：** 将并行队列 改成 串行队列，对结果没有任何影响，顺序仍然是 1 5 2 4 3
**【修改2】：** 在任务5之前，休眠2s，即sleep(2)，执行的顺序为：1 2 4 3 5,原因是因为I/O的打印，相比于休眠2s，复杂度更简单，所以异步block1 会先于任务5执行。当然如果主队列堵塞，会出现其他的执行顺序

#### 异步函数嵌套同步函数 + 并发队列

```objc
- (void)interview01{//并行队列
    dispatch_queue_t queue = dispatch_queue_create("com.CJL.Queue", DISPATCH_QUEUE_CONCURRENT);
    NSLog(@"1");// 耗时
    dispatch_async(queue, ^{
        NSLog(@"2");
        dispatch_sync(queue, ^{
            NSLog(@"3");
        });
        NSLog(@"4");
    });
    NSLog(@"5");
}    
    ----------打印结果-----------
输出顺序为：1 5 2 3 4
```

任务1 和 任务5的分析同前面一致，执行顺序为 `任务1 任务5 异步block`
在异步block中，首先执行`任务2，然后走到同步block，`由于`同步函数会阻塞主线程，`所以任务4需要等待任务3执行完成后，才能执行，所以异步block中的执行顺序是：`任务2 任务3 任务4`

**关键点：**由于是**并行队列**因此这里**同步block任务和异步block任务能同时进行**

#### 异步函数嵌套同步函数 + 串行队列

```objc
#import <Foundation/Foundation.h>
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        dispatch_queue_t queue = dispatch_queue_create("com.CJL.Queue", DISPATCH_QUEUE_SERIAL);
           NSLog(@"1");// 耗时
           dispatch_async(queue, ^{
               NSLog(@"2");
               dispatch_sync(queue, ^{
                   NSLog(@"3");
               });
               NSLog(@"4");
           });
           NSLog(@"5");
    }
    return EXIT_SUCCESS;
}
 ----------打印结果-----------
输出顺序为：1 5 2 死锁崩溃
```

任务1 和 任务5的分析同前面一致，执行顺序为 `任务1 任务5 异步block`
在异步block中，首先执行`任务2，然后走到同步block，`由于`同步函数会阻塞主线程，`所以**任务4需要等待任务3执行完成后，才能执行**，但这时异步函数已经占用**串行队列的唯一一个位置了**，所以任务3无法执行，任务4也就一直等待，最后造成死锁

**关键点：**由于是**串行队列**，在同一时间只有一个任务能执行，因此这里**同步block任务和异步block任务不能同时进行**，最后造成死锁

### 死锁

死锁是因为资源有限以及线程交错执行导致的

死锁的四个必要条件：

* 互斥访问，在有互斥访问的情况下，线程才会出现等待
* 持有并等待，线程持有一些资源，并等待一些资源
* 资源非抢占，一旦一个资源被持有，除非持有者主动放弃，否则其他竞争者都无法获取这个资源
* 循环等待：循环等待是指存在一系列线程T0,T1,Tn，T0等待T1,T1等待T2,T2等待Tn这样便出现了一个循环等待

#### 同步函数 + 主队列

```objc
dispatch_sync(dispatch_get_main_queue(), ^{
	for (int i = 0; i < 5; i++) {
    NSLog(@"1 %d == %@", i, [NSThread currentThread]);
  }
});
```

分析：主队列首先有viewDidLoad任务，并且主队列是串行在同一时间只有一个任务能执行，而这个时候又给主队列添加了一个任务，还是一个同步函数，不执行它无法往下继续执行，但由于viewDidLoad还没执行完，因此无法执行这个新添加的任务，也就造成ViewDidLoad无法往下继续执行，造成死锁

#### 异步串行队列嵌套同步串行队列

这个在上面已经说明一遍，不再赘述一遍

#### 信号量阻塞主线程

在下文的dispatch_semaphore方法中会提到



### GCD相关方法



其实每一个Queue都有一个Target Queue，系统已经默认帮我们设置好了，但这个方法允许我们修改这个Target

这个方法有两个用途：

1. 修改优先级，`dispatch_queue_create `方法生成的Queue不论是串行还是并行队列，都是和globalQueue的默认优先级相同执行优先级的线程，但我们用了这个方法后，优先级就和它的Target Queue一样

注意点：在前文提到了，现在一般都用QoS也就是服务质量来代替优先级，`dispatch_queue_attr_make_with_qos_class`，在用

`dispatch_queue_create `生成队列时一般都加上这个方法，而不是设置Target Queue来更改优先级，因此第二个用途其实更重要

2. 控制多个队列的执行顺序

当多个队列共享一个 Target Queue，它们的执行顺序主要看Target Queue是并行还是串行，这也就实现了统一串行或统一并发

#### dispatch_semaphore

信号量本质就是一个"资源计数器"，例如：`dispatch_semaphore_t semaphore = dispatch_semaphore_create(3);`表示：当前有三个资源可以利用，`dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);`表示：申请一个资源，如果没有资源可以利用就进入阻塞等待状态，如果有就继续执行 `dispatch_semaphore_signal(semaphore);`表示：归还一个资源，如果当前有线程在等待这个资源，就唤醒等待的线程

```objc
dispatch_semaphore_t currSingal = dispatch_semaphore_create(value);// 创建信号量,如果小于0则会返回NULL
dispatch_semaphore_signal(dispatch_semaphore_t  _Nonnull dsema); // 发送信号量让信号量加1
dispatch_semaphore_wait(dispatch_semaphore_t  _Nonnull dsema, dispatch_time_t timeout); // 可以让总信号量减1,信号量小于0的时候就会一直等待,否则就可以正常执行

```

##### 信号量实现锁

我们发现没有资源利用就进入阻塞等待状态，好像和互斥锁的原理差不多，其实当信号量的值为1，我们就可以将它实现锁

```objc
dispatch_semaphore_t lock = dispatch_semaphore_create(1);
```

初始：资源为1

线程A：wait->资源为0

然后线程A进入临界区

线程B：wait -> 发现资源为0 -> 线程B阻塞

线程A：执行完 -> signal -> 资源为1

线程B：被唤醒 -> wait ->资源为0 ->进入临界区

这样就**实现了锁，同一时间只能有一个线程进入临界区**



##### 信号量实现同步或并行队列的异步任务顺序执行

```objc
dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
```

```objc
dispatch_async(queue, ^{
    // 网络请求
    dispatch_semaphore_signal(semaphore);
});
```

另一边：

```objc
dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
```

这样在网络请求这个异步任务完成前，另一边一直处于阻塞等待状态，这样就利用信号量实现了同步

```objc
dispatch_semaphore_t currentSingal = dispatch_semaphore_create(0);
    dispatch_queue_t que = dispatch_get_global_queue(0, 0);
    dispatch_async(que, ^{
        NSLog(@"执行任务1， %@", [NSThread currentThread]);
        dispatch_semaphore_signal(currentSingal);
    });
    dispatch_semaphore_wait(currentSingal, DISPATCH_TIME_FOREVER);//直到任务1完成才被唤醒
    
    dispatch_async(que, ^{
        NSLog(@"执行任务2， %@", [NSThread currentThread]);
        dispatch_semaphore_signal(currentSingal);
    });
    dispatch_semaphore_wait(currentSingal, DISPATCH_TIME_FOREVER);//直到任务2完成才被唤醒
    dispatch_async(que, ^{
        NSLog(@"执行任务3， %@", [NSThread currentThread]);
        dispatch_semaphore_signal(currentSingal);
    });
```

![CleanShot 2026-07-28 at 10.17.10@2x](/Users/macbookair/Library/Application Support/CleanShot/media/media_3pasZLn1ei/CleanShot 2026-07-28 at 10.17.10@2x.png)

第一个任务执行完->signal，主线程被唤醒，继续执行第二个依次类推，这样就实现了**并行队列的异步任务顺序执行**



##### 信号量实现控制并发数量

我们如果要下载很多图片的话,并发异步进行,每一个下载都会开辟一个新线程,可以我们又担心太多线程会道指内存开销太大,以及线程的上下文切换给我们的cpu带来的开销太大导致的问题所以我们要设置一下对应的一个线程最大数量

假设同时只能下载三张照片

```objc
dispatch_semaphore_create(3);
for (...) {
    dispatch_async(globalQueue,^{
        wait();
        下载图片();
        signal();
    });
}
```

执行效果：

```
允许：
3 个任务同时执行

第四个任务：
等待

有任务结束：
signal

第四个任务：
开始执行。
```



##### 信号量阻塞主线程

例如：

```objc
//主线程
dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
```

并且：

```objc
dispatch_async(dispatch_get_main_queue(), ^{
    dispatch_semaphore_signal(...);
});
```

结果：主线程->wait->等待signal->signal:等待主线程执行

这样就形成了死锁，因此**不要在主线程随便使用 `dispatch_semaphore_wait`。**



#### dispatch_after

```objc
dispatch_after(dispatch_time_t when, dispatch_queue_t queue, dispatch_block_t block);
```

第一个参数：延迟的时间 第二个参数：提交的队列 第三个参数 ：任务blcok

`dispatch_after`作用：**延迟一段时间后，把任务提交到指定队列**

它并不会阻塞队列，而是在这段时间后，再将任务添加到指定队列中，但需要注意的是，并不是延迟这段时间后就执行，而是提交

用一个实例来说明：

```objc
NSLog(@"1");
dispatch_after(
    dispatch_time(DISPATCH_TIME_NOW, 0), dispatch_get_main_queue(),^{
        NSLog(@"2");
    });
NSLog(@"3");
```

我们发现延迟的时间是0，那么是不是就相当于没有延迟，输出结果还是123？

其实并不是，像刚刚说的，它是把这个任务2提交到主队列中，但当前代码还没执行完，因此先执行当前代码，输出结果：132

总结：**它不会阻塞当前线程，而是在指定时间到达后，把任务异步提交到指定队列。**

#### dispatch_apply

```objc
dispatch_apply(size_t iterations, dispatch_queue_t queue, void (^block)(size_t index));
```

参数1:循环次数 参数2:在哪个队列执行 参数3：每次循环执行的任务

它最大的作用就是**将多个任务并发执行**，因此参数2最好是个并行队列

并且它的外层其实是一个同步函数，也就是**它其实会阻塞当前线程**，所以最好不要将它在主线程大量使用

通常应该这么写

```objc
dispatch_async(dispatch_get_global_queue(0, 0), ^{

    dispatch_apply(100000, dispatch_get_global_queue(0, 0), ^(size_t i) {
        // 耗时操作
    });
    dispatch_async(dispatch_get_main_queue(), ^{
        // 更新 UI
    });
});
```



####  dispatch_group

**dispatch_group 用来监听多个异步任务什么时候全部执行完成**

在我前面的天气预报项目中，我希望当我进入页面时，所有信息全部加载好再刷新UI，但这时有多个网络请求，怎么保证它们都完成了呢？

在询问AI后，它给出的方法正是GCD提供的`dispatch_group`来管理多个任务



##### dispatch_group_async + dispatch_group_notify

```objc
- (void)cjl_testGroup1{
    /*
     dispatch_group_t：调度组将任务分组执行，能监听任务组完成，并设置等待时间

     应用场景：多个接口请求之后刷新页面
     */
    
    dispatch_group_t group = dispatch_group_create();
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
    
    dispatch_group_async(group, queue, ^{
        NSLog(@"请求一完成");
    });
    
    dispatch_group_async(group, queue, ^{
        NSLog(@"请求二完成");
    });
    
    // 当group内所有任务完成时，这个block会在主线程执行。很适合UI刷新，不阻塞主线程
    
    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
        NSLog(@"刷新页面");
    });
}

```

#####  dispatch_group_enter + dispatch_group_leave + dispatch_group_notify

```objc
- (void)cjl_testGroup2{
    /*
     dispatch_group_enter和dispatch_group_leave成对出现，使进出组的逻辑更加清晰
     */
    dispatch_group_t group = dispatch_group_create();
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
    
    dispatch_group_enter(group);
    dispatch_async(queue, ^{
        NSLog(@"请求一完成");
        dispatch_group_leave(group);
    });
    dispatch_group_enter(group);
    dispatch_async(queue, ^{
        NSLog(@"请求二完成");
        dispatch_group_leave(group);
    });
    
    dispatch_group_notify(group, dispatch_get_main_queue(), ^{
        NSLog(@"刷新界面");
    });
}

```

- dispatch_group_enter(group)：标记“组里有一个任务开始了”。
- dispatch_group_leave(group)：标记“组里的一个任务完成了”。
- **enter/leave 必须配对出现**,否则组永远不会完成。

##### dispatch_group_wait

**阻塞当前线程，等待任务组执行完成。**

```objc
dispatch_group_wait(group, DISPATCH_TIME_FOREVER);
```

![CleanShot 2026-07-28 at 11.55.14](/Users/macbookair/Library/Application Support/CleanShot/media/media_foa520mQum/CleanShot 2026-07-28 at 11.55.14.png)



**区别：**`dispatch_group_wait` 是同步等待，`dispatch_group_notify`是异步通知



**注意点：**什么时候使用**enter/leave** 什么时候使用`dispatch_group_async`

例如:

```objc
dispatch_group_async(group, queue, ^{
    [self requestData:^(id obj) {
        NSLog(@"请求完成");
    }];
});
```

事实上如果`dispatch_group_async`里面是异步请求，它并不会等到它完成再`notify`,因为它只统计block是否发送了请求，只要block发送了请求，它不管请求是否回来，就已经认为任务结束了直接`notify`

这时应该用**enter / leave**

```objc
dispatch_group_enter(group);

[self requestUserInfo:^(id obj) {

    dispatch_group_leave(group);

}];
```



####  dispatch_barrier_sync & dispatch_barrier_async

在大多数开发场景中，读的任务比较多，写的任务比较少，我们希望读的任务能够并行处理，但我们又需要保证线程安全，如果在所有操作上都加锁，又相当于全部串行了，这个时候我们就可以用到**barrier**，**实现允许多个读任务同时执行，但写任务独占**

```
Concurrent Queue
Task1 -----
            \
Task2 -------\
              ===== Barrier =====
                        |
                     Write
                        |
              ==================
            /
Task3 -----
Task4 -----
```

Barrier 的作用是**保证它前面的任务全部执行完之后，自己独占执行，执行完成后才允许后面的任务开始执行**

```objc
dispatch_barrier_async(queue,^{
			//写任务
});
```

**注意点：**Barrier有一个非常重要的要求：**必须使用自己创建的并发队列**，也就是说不可以`dispatch_barrier_async(dispatch_get_global_queue(0, 0), ^{});`,苹果官方文档明确说明，对全局并发队列使用Barrier，其行为是不确定的

| **API**                | **是否阻塞当前线程** |
| ---------------------- | -------------------- |
| dispatch_barrier_async | 否                   |
| dispatch_barrier_sync  | 是                   |

**两者的Barrier效果完全一样，区别只是提交任务的线程需不需要等待**



####  dispatch_source_t

GCD 中**最底层、最强大的系统事件处理机制之一**，被称为 “**事件源 (Dispatch Source**)”。
它可以用来监听 系统底层事件（如文件变化、计时器、进程、信号、网络、I/O 等）。
主要用于计时操作，其原因是因为他创建的timer不依赖于RunLoop，且即使精准度比NSTimer高

```objc
- (void)cjl_testSource{
    /*
     dispatch_source
     
     应用场景：GCDTimer
     在iOS开发中一般使用NSTimer来处理定时逻辑，但NSTimer是依赖Runloop的，而Runloop可以运行在不同的模式下。如果NSTimer添加在一种模式下，当Runloop运行在其他模式下的时候，定时器就挂机了；又如果Runloop在阻塞状态，NSTimer触发时间就会推迟到下一个Runloop周期。因此NSTimer在计时上会有误差，并不是特别精确，而GCD定时器不依赖Runloop，计时精度要高很多
     
     dispatch_source是一种基本的数据类型，可以用来监听一些底层的系统事件
        - Timer Dispatch Source：定时器事件源，用来生成周期性的通知或回调
        - Signal Dispatch Source：监听信号事件源，当有UNIX信号发生时会通知
        - Descriptor Dispatch Source：监听文件或socket事件源，当文件或socket数据发生变化时会通知
        - Process Dispatch Source：监听进程事件源，与进程相关的事件通知
        - Mach port Dispatch Source：监听Mach端口事件源
        - Custom Dispatch Source：监听自定义事件源

     主要使用的API：
        - dispatch_source_create: 创建事件源
        - dispatch_source_set_event_handler: 设置数据源回调
        - dispatch_source_merge_data: 设置事件源数据
        - dispatch_source_get_data： 获取事件源数据
        - dispatch_resume: 继续
        - dispatch_suspend: 挂起
        - dispatch_cancle: 取消
     */
    
    //1.创建队列
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0);
    //2.创建timer
    dispatch_source_t timer = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, queue);
    //3.设置timer首次执行时间，间隔，精确度
    dispatch_source_set_timer(timer, DISPATCH_TIME_NOW, 2.0*NSEC_PER_SEC, 0.1*NSEC_PER_SEC);
    //4.设置timer事件回调
    dispatch_source_set_event_handler(timer, ^{
        NSLog(@"GCDTimer");
    });
    //5.默认是挂起状态，需要手动激活
    dispatch_resume(timer);
    
}

```



##### source与NSTimer对比

**NSTimer**：精度一般，依赖Runloop，容易被Runloop Mode影响

由于笔者对Runloop还不太了解，后面会详细学习，我只讲我用**NSTimer**遇到过的问题：

当我滑动UITableView时，我启动的无限轮播图的**NSTimer停止工作了**，这正是因为Runloop Mode改变

**GCD Timer**：不依赖RunLoop，线程安全，精度更高，性能更好



#### dispatch_suspend & dispatch_resume

这两个函数可以随时挂起某个队列，等需要执行的时候恢复即可

```objc
 dispatch_queue_t queue = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0);
    dispatch_suspend(queue);
    dispatch_resume(queue);
```



#### dispatch_once

这个API其实在刚学OC时的单例我们就用到了，当时只知道时确保单例只创建一次，但不知道是什么原理，例如这样

```objc
+ (instancetype)sharedManager {

    static dispatch_once_t onceToken;
    static id manager = nil;

    dispatch_once(&onceToken, ^{

        manager = [[self alloc] init];

    });

    return manager;
}
```

`dispatch_once`内部保证：同时只有一个线程可以执行Block

很多人以为`dispatch_once`内部有NSLock，其实并不是，因为每次`sharedManager`都要加锁的话，性能非常差

实际上：第一次执行：做同步操作，执行完后修改`onceToken`状态，随后每次`sharedManager`都只是判断`onceToken`的状态，只要已经执行过，就直接返回,用static的原因也是保证`onceToken`在程序运行过程中拥有只有一个