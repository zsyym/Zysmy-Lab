---
title: "Foundation框架详解"
publishedDate: 2026-03-16
tags: ["Objective-C"]
description: "iOS 开发技术笔记 - Foundation框架详解"
category: "iOS 底层"
---

# Foundation框架详解

### 7.1字符串

NSString为字符序列不可变的字符串

创建字符串：

```objective-c
NSString* str = @"...";
NSString* str = [NSString stringWithXxx:];
NSString* str = [[NSString alloc] initWithXxx:];
```

```objective-c
#import <Foundation/Foundation.h>

int main(int argc, char * argv[]) {
    @autoreleasepool {
        // 使用 Unicode 数值数组初始化字符串
        unichar data[6] = {97, 98, 99, 100, 101, 102};
        NSString* str = [[NSString alloc]
            initWithCharacters: data
            length: 6];
        NSLog(@"%@", str);

        // 将 C 风格的字符串转换为 NSString 对象
        char* cstr = "Hello, iOS!";
        NSString* str2 = [NSString stringWithUTF8String: cstr];
        NSLog(@"%@", str2);

        // 将字符串写入指定文件
        [str2 writeToFile: @"myFile.txt"
               atomically: YES
                 encoding: NSUTF8StringEncoding
                    error: nil];

        // 读取文件内容，用文件内容初始化字符串
        NSString* str3 = [NSString stringWithContentsOfFile: @"NSStringTest.m"
                                                   encoding: NSUTF8StringEncoding
                                                      error: nil];
        NSLog(@"%@", str3);
    }
}
```

```objective-c
[str stringByAppendingString:@""] //在str后追加固定的字符串
[str UTF8String] //获取c风格的字符串
[str stringByAppendingFormat:@"%..."] //在str后面追加带变量的字符串
"%lu" , [str length] //获取字符个数
"%lu" , [str lengthOfBytesUsingEncoding:NSUTF8StringEncoding]//按UTF-8解码后字节个数
[str substringToIndex: 10] //获取前几个字符组成的字符串
[str subStringFromIndex:5] //获取从第几个字符到最后组成的字符串
[str subStringWithRange:NSMakeRange(5,15)]//获取从第几个到第几个的字符串
NSRange pos = [str rangeOfString:@""]//获取字符串在str中的位置
pos.location//开始位置
pos.length//长度
[str uppercaseString]//全部转成大写
```

#### 可变字符串(NSMutableString)

它属于NSString的子类，上述说的NSString的方法都可以使用

```objective-c
[str appendString]//追加固定的
[str appendFormat]//追加带变量的
[str insertString:@""atIndex:]插入指定位置
[str deleteCharactersInRange:NSMakeRange()]//删除从...到...字符串
[str replaceCharactersInRange:NSMakeRange():withString:@""]//将从...到...的字符串更换为@""
```

### 7.2 日期与i时间(NSDate)

```objective-c
#import <Foundation/Foundation.h>

int main(int argc, char * argv[])
{
    @autoreleasepool {
        // 获取代表当前日期、时间的NSDate
        NSDate* date1 = [NSDate date];
        NSLog(@"%@", date1);
        
        // 获取从当前时间开始，一天之后的日期
        NSDate* date2 = [[NSDate alloc] initWithTimeIntervalSinceNow:3600*24];
        NSLog(@"%@", date2);
        
        // 获取从当前时间开始，3天之前的日期
        NSDate* date3 = [[NSDate alloc] initWithTimeIntervalSinceNow:-3*3600*24];
        NSLog(@"%@", date3);
        
        // 获取从1970年1月1日开始，20年之后的日期
        NSDate* date4 = [NSDate dateWithTimeIntervalSince1970:3600 * 24 * 366 * 20];
        NSLog(@"%@", date4);
        
        // 获取系统当前的Locale
        NSLocale* cn = [NSLocale currentLocale];
        // 获取NSDate在当前Locale下对应的字符串
        NSLog(@"%@", [date1 descriptionWithLocale:cn]);
        
        // 获取两个日期之间较早的日期
        NSDate* earlier = [date1 earlierDate:date2];
        // 获取两个日期之间较晚的日期
        NSDate* later = [date1 laterDate:date2];
        
        // 比较两个日期，compare:方法返回NSComparisonResult枚举值，
        // 该枚举类型包含NSOrderedAscending、NSOrderedSame和
        // NSOrderedDescending三个值，
        // 分别代表调用compare:的日期位于被比较日期之前、相同、之后
        switch ([date1 compare:date3]) {
            case NSOrderedAscending:
                NSLog(@"date1位于date3之前");
                break;
            case NSOrderedSame:
                NSLog(@"date1与date3日期相等");
                break;
            case NSOrderedDescending:
                NSLog(@"date1位于date3之后");
                break;
        }
        
        // 获取两个时间之间的时间差
        NSLog(@"date1与date3之间时间差%g秒", [date1 timeIntervalSinceDate:date3]);
        // 获取指定时间与现在的时间差
        NSLog(@"date2与现在时间差%g秒", [date2 timeIntervalSinceNow]);
    }
}
```

**日期格式器**

NSDateFormatter的功能就是完成NSDate与NSString之间的转换

实例

```objective-c
#import <Foundation/Foundation.h>

int main(int argc, char * argv[])
{
    @autoreleasepool {
        // 1. 创建日期格式化器
        NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
        
        // 2. 设置时区（避免时区偏移导致的日期显示错误）
        [dateFormatter setTimeZone:[NSTimeZone systemTimeZone]];
        
        // 3. 设置本地化（可选，适配不同语言/地区的日期格式）
        [dateFormatter setLocale:[[NSLocale alloc] initWithLocaleIdentifier:@"zh_CN"]];
        
        // ===================== 核心：设置日期格式 =====================
        // 常用格式说明：
        // yyyy - 4位年份（如2026），MM - 2位月份（如03），dd - 2位日期（如08）
        // HH - 24小时制小时（如15），hh - 12小时制小时（如03），mm - 分钟，ss - 秒
        // EEEE - 星期全称（如星期日），EEE - 星期简称（如周日）
        [dateFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss EEEE"];
        
        // -------------------- 示例1：NSDate → 字符串（格式化日期） --------------------
        NSDate *currentDate = [NSDate date]; // 获取当前时间
        NSString *dateStr = [dateFormatter stringFromDate:currentDate];
        NSLog(@"当前时间格式化后：%@", dateStr); // 输出示例：2026-03-08 15:30:20 星期日
        
        // -------------------- 示例2：字符串 → NSDate（解析日期） --------------------
        NSString *targetDateStr = @"2026-01-01 10:00:00 星期四";
        NSDate *targetDate = [dateFormatter dateFromString:targetDateStr];
        if (targetDate) { // 解析成功才打印（格式不匹配会返回nil）
            NSLog(@"解析后的日期对象：%@", targetDate);
        } else {
            NSLog(@"日期字符串格式不匹配，解析失败！");
        }
        
        // ===================== 拓展：不同格式示例 =====================
        // 格式1：简洁日期（年-月-日）
        [dateFormatter setDateFormat:@"yyyy-MM-dd"];
        NSLog(@"简洁日期格式：%@", [dateFormatter stringFromDate:currentDate]); // 2026-03-08
        
        // 格式2：带上午/下午的12小时制
        [dateFormatter setDateFormat:@"yyyy年MM月dd日 hh:mm:ss a"];
        NSLog(@"12小时制格式：%@", [dateFormatter stringFromDate:currentDate]); // 2026年03月08日 03:30:20 下午
    }
    return 0;
}
```



#### 2. 关键知识点解释

- **日期格式字符串**：必须严格遵循 `Unicode 日期格式规范`（iOS/macOS 通用），比如 `yyyy` 不能写成 `YYYY`，`MM`（月份）不能写成 `mm`（分钟），否则会解析 / 格式化失败。
- **时区（TimeZone）**：如果不设置时区，`NSDateFormatter` 会默认使用系统时区，但显式设置能避免跨时区场景下的日期偏移问题。
- **解析失败场景**：如果字符串格式和 `setDateFormat` 设置的格式不一致（比如少写秒、月份用中文），`dateFromString:` 会返回 `nil`，所以建议加非空判断

### 7.3对象复制

**copy与mutableCopy**

* copy用于复制对象的不可变副本
* mutableCopy用于复制对象的可变副本
* 二者返回的都是副本，对原对象都没有影响

**NSCopying与NSMutableCopy协议**

copy与mutableCopy复制对象确实用起来很方便，但它只能用于遵守NSCopying和NSMutableCopy协议的类，那如果是我们自定义的类本身并没有遵循这个协议怎么办呢

这时我们就需要完成两步

* 让该类实现NSCopying(NSMutableCopy)协议
* 让该类实现copyWithZone(mutableCopyWithZone)方法

与alloc相似，其实copy和mutableCopy的底层调用的都是copyWithZone和mutableCopyWithZone

```objective-c
#import <Foundation/Foundation.h>

@interface Person : NSObject <NSCopying, NSMutableCopying>

@property(nonatomic, copy) NSString *name;
@property(nonatomic, assign) int age;

@end
@implementation Person

// copy
- (id)copyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
}

// mutableCopy
- (id)mutableCopyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
}

@end
```

**浅复制与深复制**

* 浅复制就是只复制指针地址，不创建对象(修改副本，本身也会改变)
* 深复制是创建新对象，复制数据(修改副本，本身不改变)

从简单的说起，也就是已经遵守NSCopying协议的类(NSString等)

* 不可变对象 copy  → 浅拷贝
* 可变对象 copy    → 深拷贝（返回不可变对象）
* mutableCopy      → 深拷贝（返回可变对象）

1. copy → 返回不可变对象
2. mutableCopy → 返回可变对象
   **是否创建新对象：**

* 不可变对象 copy → 不创建
* 可变对象 copy → 创建

那么如果是自定义类呢，那么就要看你自定义的copyWithZone方法了

```objective-c
- (id)copyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
}

// mutableCopy
- (id)mutableCopyWithZone:(NSZone *)zone
{
    Person *p = [[[self class] allocWithZone:zone] init];
    
    p.name = self.name;
    p.age = self.age;
    
    return p;
} 
```

**setter方法的复制选项**

```objective-c
#import <Foundation/Foundation.h>

@interface FKItem : NSObject
@property (nonatomic, copy) NSMutableString *name;
@end
int main(int argc, char * argv[]) {
    @autoreleasepool {
        FKItem *item = [FKItem new]; // 创建一个FKItem对象

        item.name = [NSMutableString stringWithString:@"疯狂iOS讲义"];
        
        // 尝试修改：调用appendString方法
        [item.name appendString:@"fkit"];
    }
}
```

这个程序看上去没有问题，name是可变字符串，可以修改，那么是哪里把name变为不可修改呢，我们发现name的内存语义是copy这时深复制可能把name变为了不可变字符串，但我们纵观整个程序并没有出现copy，那么是哪里出了问题,问题出在setter方法上

```objective-c
item.name//当我们调用点语法时，底层其实是setter方法
```

setter方法内部实现

```objective-c
- (void)setName:(NSMutableString *)aname {
    name = [aname copy];
}
```

其实是将namecopy了一份，这时name被深复制[也就修改成不可变字符串了

### 7.5 数组(NSArray 与 NAMutableArray)

```objective-c
NSArray* array = [NSArray arrayWithObjects:@"zsy",@"jd",@"ysz",@"yd", nil];
        [array objectAtIndex:0];//数组的第一个元素
        [array objectAtIndex:1];//索引为1的元素
        [array lastObject];//最后一个元素
        NSArray* arr1 = [array objectsAtIndexes:[NSIndexSet indexSetWithIndexesInRange:NSMakeRange(2,5)]];//索引从二到五的元素组成的新集合
        [array indexOfObject:@"zsy"];//获取元素在数组中的位置(如果有多个只返回第一个)
        [array indexOfObject:@"zsy" inRange:NSMakeRange(2,5)];//在指定范围获取元素位置
        array = [array arrayByAddingObject:@"ybb"];//在数组的最后追加元素，数组并没有被改变，只是赋值
        array = [array arrayByAddingObjectsFromArray:[NSArray arrayWithObjects:@"dw", nil]];//向array追加另一个数组的全部元素
        NSArray* arr2 = [array subarrayWithRange:NSMakeRange(5, 8)];//获取array索引5-8的所有元素
        [arr2 writeToFile:@"zsy.txt" atomically:YES];//写入文件，atomically是安全写入的意思
```

上面这段代码指出了数组的一些基本用法

需要指出的是，NSIndexSet集合主要是用来保存索引值，功能和NSSet基本相似

```objective-c
[array objectAtIndex : i];
array[i];
```

这两者是等同的，其实array[i]底层就是调用了这个方法，但显然array[i]这种方法更简单

需要注意的是，在数组后追加和在字符串后追加并不能类比理解，在数组后追加其实就是返回一个新的NSArray是赋值操作，而在字符串后追加是修改操作

NSArray本身是不能修改的



获取元素在数组的位置是如何实现的呢，实际上是调用了isEqual方法，返回Yes，即认为集合包含此元素，并不需要两个元素是同一个元素

假设我创建了一个FKUser的类，里面只包含两个变量，name和pass，许多个FKUser组成的数组获取元素位置，应该如何重写isEqual方法呢

```objective-c
-(BOOL) isEqual : (id)other{
  if(self == other){
	return YES
  }
  if([other isMemberOfClass:[FKUser class]];){
    FKUser* target = (FKUser*) other;
    return [self.name isEqualToString: target.name] &&[self.pass isEqualToString: target.pass];
  }
  return NO;
}
```



**对集合整体调用方法**

**makeObjectsPerformSelector:**

```objective-c
[NSArry makeObjectsPerformSelector:@selector(方法)];//不可传递参数
```

让数组的每个元素都执行该方法

**makeObjectsPerformSelector:withObject:**

```objective-c
[NSArry makeObjectsPerformSelector:@selector(方法) withObject:参数];
```

注意只能传递一个参数

**无中断地遍历所有元素**



**enumerateObjectsUsingBlock**

```objective-c
NSArray *array = @[@"a", @"b", @"c", @"d"];

// 普通遍历
[array enumerateObjectsUsingBlock:
 ^(id obj, NSUInteger idx, BOOL *stop) {
    NSLog(@"索引%lu: %@", (unsigned long)idx, obj);
}];

// 带停止条件的遍历
[array enumerateObjectsUsingBlock:
 ^(NSString *str, NSUInteger idx, BOOL *stop) {
    if ([str isEqualToString:@"c"]) {
        *stop = YES;  // 找到后停止遍历
        return;
    }
    NSLog(@"处理: %@", str);
}];
// 输出：a, b（c不输出，d不处理）
```

**enumerateObjectsWithOptions: usingBlock:**(带选项的遍历如反向遍历)

```objective-c
[array enumerateObjectsWithOptions:NSEnumerationReverse
                        usingBlock:
 ^(NSString *str, NSUInteger idx, BOOL *stop) {
    NSLog(@"反向遍历[%lu]: %@", (unsigned long)idx, str);
}];
// 输出：d, c, b, a
```

**enumerateObjectsAtIndexes:options :usingBlock:**(相较上一个方法多了个可指定范围)

上面三个方法都要传入一个代码块参数，该参数带三个参数，第一个表示正在遍历的集合元素，第二个表示元素索引



### 对NSArray排序

**sortedArrayUsingSelector**

适合 **NSString / NSNumber / 自定义对象已有比较方法**

```objective-c
NSArray *arr = @[@"c", @"a", @"b"];

NSArray *sortedArr = [arr sortedArrayUsingSelector:@selector(compare:)];

NSLog(@"%@", sortedArr);

```

原理：

1. 调用每个元素的compare(如[@"a" compare:@"b"])
2. 返回NSOrderedAscending NSOrderedSame NSOrderedDescending

```objective-c
typedef NS_ENUM(NSInteger, NSComparisonResult) {
    NSOrderedAscending = -1,   // 前面
    NSOrderedSame = 0,         // 相等
    NSOrderedDescending = 1    // 后面
};

```



**sortedArrayUsingComparator **

自定义排序规则

```objective-c
NSArray *arr = @[@3, @1, @2];

NSArray *sortedArr = [arr sortedArrayUsingComparator:^NSComparisonResult(id obj1, id obj2) {
    
    NSNumber *n1 = obj1;
    NSNumber *n2 = obj2;
    
    if (n1.intValue > n2.intValue) {
        return NSOrderedDescending;
    }
    
    if (n1.intValue < n2.intValue) {
        return NSOrderedAscending;
    }
    
    return NSOrderedSame;
}];

NSLog(@"%@", sortedArr);

```



### 通过枚举器遍历集合元素

```objective-c
NSArray *arr = @[@"A", @"B", @"C"];

NSEnumerator *enumerator = [arr objectEnumerator];//顺序

id obj;

while (obj = [enumerator nextObject]) {
    NSLog(@"%@", obj);
}
NSEnumerator *enumerator = [arr reverseObjectEnumerator];//逆序

id obj;

while (obj = [enumerator nextObject]) {
    NSLog(@"%@", obj);
}

```



### 快速枚举

```objective-c
NSArray *arr = @[@"A", @"B", @"C"];

for (NSString *obj in arr) {
    NSLog(@"%@", obj);
}

for (Person *p in persons) {
    NSLog(@"%d", p.age);
}

```

**安全机制**：遍历过程中改变数组会崩溃

**快速枚举底层原理**

快速枚举底层依赖协议：

```objective-c
NSFastEnumeration
```

定义：

```objective-c
@protocol NSFastEnumeration
- (NSUInteger)countByEnumeratingWithState:(NSFastEnumerationState *)state
                                  objects:(id [])buffer
                                    count:(NSUInteger)len;
@end
```

`NSArray` 实现了这个协议。

所以 `for in` 可以遍历。

1. 取一批对象 → 放入 buffer
2. 循环读取 buffer
3. 再取下一批

比普通遍历快很多(如有1000个元素，普通遍历要调用1000次，而快速枚举只需1000/16 = 62)

它 **直接访问数组内部存储指针**。

普通 for：

objc_msgSend → objectAtIndex

快速枚举：

直接访问 objects buffer



### 可变数组NSMutableArray 
 NSArray代表元素不可变的集合，一旦NSArray创建成功，程序中不能向集合中添加新的元素，不能删除已有的元素，也不能替换集合元素。NSArray只是保存对象的指针，因此，NSArray只保证这些指针变量中的地址不能改变，但指针变量所指向的对象是可改变的。

NSMutableArray是NSArray的子类，因此它可以当作NSArray使用。它代表一个元素可变的集合，因此它程序可以向它中增添、删除、替换元素。创建NSMutableArray时可以通过参数指定底层数组的初始容量。

NSMutableArray新增了以下方法：

添加几何元素：                                以为 add 开头

删除集合元素：                                以remove开头

替换几何元素中的方法：                 以replace开头

对集合本身排序的方法：                 以sort开头


```objective-c

NSString* NSCollectionToString(NSArray* array){
    NSMutableString* result = [NSMutableString stringWithString:@"["];
    for(id obj in array){
        [result appendString:[obj description]];
        [result appendString:@","];
    }
    NSUInteger len = [result length];
    [result deleteCharactersInRange:NSMakeRange(len-2, 2)];
    [result appendString:@"]"];
    return result;
}//将字符串数组转换为字符串
int main(int argc, char * argv[]) {
    @autoreleasepool {
        NSMutableArray* array = [NSMutableArray arrayWithObjects:@"zsy",@"yzs",@"yd",@"jd", nil];
        [array addObject:@"ybb"];//向集合最后添加元素
        [array addObjectsFromArray:[NSArray arrayWithObjects:@"youyou", nil]];//在集合最后添加多个元素
        [array insertObject:@"dbb" atIndex:2];
        [array insertObjects:[NSArray arrayWithObjects: @"dw",@"yq",nil] atIndexes:[NSIndexSet indexSetWithIndexesInRange:NSMakeRange(3, 2)]];//向集合指定位置插入多个元素
        [array removeLastObject];//删除最后一个元素
        [array removeObjectAtIndex:3];//删除指定位置元素
        [array removeObjectsInRange:NSMakeRange(2, 3)];//删除2-5元素
        [array replaceObjectAtIndex:2 withObject:@"座寺院"];//把指定位置元素替换为
        
    }
}
```



### NSSet

**NSSet功能与用法**

1. **[set1 count]       //获取集合内元素个数**

2. **set1 setByAddingObject             // 集合加单个元素**

3. **set1 setByAddingObjectsFromSet: set2   //获取两个集合并集**

4.  **BOOL b = [set1 intersectsSet: set2];        // 判断两个元素是否有交集**

5. **BOOL bo = [set2 isSubsetOfSet: set1];       //判断一个集合是不是另外一个集合的子集**

6. **BOOL bb = [set1 containsObject:].            //判断集合是否包含某个元素**

7. ***//随机从集合中取出一个元素，但是同时写两个下面的代码输出的结果是相同的***

   **NSLog(@"set1随机取出一个元素：%@", [set1 anyObject]);**        

   **NSLog(@"set1随机取出一个元素：%@", [set1 anyObject]);**

9. **NSSet *filteredSet =**
   **[set2 objectsPassingTest:^BOOL(id obj, BOOL *stop) {**

   **return [obj length] > 3;**

   **}];**

第九个用法用到了block，结构如下

**^ 返回值类型 (参数)**
**{**
    **代码**
**}**

其实就是用block结构省去了if判断



**NSSet判断集合元素重复的标准**
        当向NSSet集合中存入一个元素时，NSSet会调用该对象的Hash方法来得到对象的hashCode值，然后根据该值决定该对象在底层Hash表中的存储位置，如果根据hashCode计算出该元素在底层Hash表中的存储位置已经不相同，那么系统自然的将它们存在不同的位置。

如果两个元素的hashCode相同，接下来就要通过isEqual：方法判断两个元素是否相等，如果有两个元素通过isEqual：方法比较返回NO，NSSet依然认为它们不相等，NSSet会把它们都存在底层的Hash表的同一个位置，只是将在这个位置形成链，后面的元素添加失败

因此，HashSet集合判断两个元素相等的标准为：

1. 两个对象的hash方法返回值相等

2. 调用isEqual方法返回YES

   

这就会导致一个问题，两个内容相同的元素，可能因为hash值不同导致放在了同一个集合中，解决这个问题的方法就是重写hash方法

```objective-c
-(NSUInteger) hash{
  NSUInteger namehash = self.name == nil ? 0 : [self.name hash];
  NSUInteger passhash = self.pass == nil ? 0 : [self.pass hash];
  return nameHash * 31 + passHash;
}
```

**重写hash方法的基本原则：**

**1，程序运行过程中，同一个对象多次调用hash方法应该返回相同的值**

**2，当两个对象通过isEqual：方法返回YES时，两个对象的hash应该返回相同的值**

**3，对象中作为isEqual：比较表村的实例变量，都应该用来hashcode值**



**NSMutableSet的功能和用法**

* addObject：                                 向集合中添加单个元素
* removeObject：                          从集合中删除单个元素
* removeAllObject：                      删除集合中所有元素
* addObjectsFromArray：            使用NSArray数组作为参数，向NSSet集合中添加参数数组中的所有元素
* unionSet：                                   计算两个NSSet元素的并集
* minusSet：                                  计算两个NSSet集合的差集
* intersectSet：                             计算两个NSSet集合的交集
* setSet：                                       用后一个集合的元素替换已有集合中所有元素
  

```objective-c
#import <Foundation/Foundation.h>
 
//定义一个函数，可以把NSSet集合转化为字符串
//方便我们调试观察结果
NSString *NSCollectionToString(id collection) {
    NSMutableString *result = [NSMutableString stringWithString: @"["];
    for (id obj in collection) {
        [result appendString: [obj description]];
        [result appendString: @","];
    }
    NSUInteger len = [result length];//获取字符串长度
    [result deleteCharactersInRange: NSMakeRange(len - 1, 1)];//去除最后一个字符
    [result appendString: @"]"];
    return result;
}
 
int main(int argc, const char * argv[]) {
    @autoreleasepool {
        //创建一个初始容量为10的set集合
        NSMutableSet *set = [NSMutableSet setWithCapacity: 10];
        
        //向集合中添加一个元素
        [set addObject: @"疯狂iOS讲义"];
        NSLog(@"set添加一个元素后：%@", NSCollectionToString(set));
        
        //利用NSArray向集合中添加多个元素
        [set addObjectsFromArray: [NSArray arrayWithObjects: @"疯狂andro讲义", @"疯狂Ajax讲义", @"疯狂XML讲义", nil]];
        NSLog(@"set使用NSArray添加三个元素后：%@", NSCollectionToString(set));
        
        //删除集合中指定元素
        [set removeObject: @"疯狂XML讲义"];
        NSLog(@"set删除一个元素后：%@", NSCollectionToString(set));
        
        NSSet *set2 = [NSSet setWithObjects: @"埃德加", @"疯狂iOS讲义", nil];
        //计算两个集合的并集
        [set unionSet: set2];
        NSLog(@"set和set2的并集：%@", NSCollectionToString(set));
        //计算两个集合的差集
        [set minusSet: set2];
        NSLog(@"set和set2的差集：%@", NSCollectionToString(set));
        //计算两个集合的交集
        [set intersectSet: set2];
        NSLog(@"set和set2的交集：%@", NSCollectionToString(set));
        //用set2的集合元素替换set集合的所有元素
        [set setSet: set2];
        NSLog(@"用set2的集合元素替换set集合的所有元素：%@", NSCollectionToString(set));
    }
    return 0;
}

```



**NSCountedSet的功能和用法**

NSCountedSet是NSMutableSet的子类，它与NSMutableSet集合不同的是：NSCountedSet为每个元素额外维护一个添加次数的状态。当程序向NSCountedSet中添加一个元素的时候，如果NSCountedSet集合中不包含该元素，NSCountedSet接纳该元素，并将该元素的添加次数标记为1；当程序向NSCountedSet中添加一个元素的时候，如果NSCountSet集合中已经包含该元素，NSCountedSet不会接纳该元素，但会将该元素添加次数加一。

当程序从NSCountedSet中删除元素时，NSCountedSet只是将该元素的添加次数减一，只有当该元素添加次数变为0的时候，该元素才会真正的从NSCountedSet中删除。它提供了countForObject：方法来获取指定元素的添加次数。



### 有序集合(NSOderedSet和NSMutableOrderedSet)

 NSOderedSet和NSMutableOrderedSet既具有NSSet集合的特征，又具有NSArray类似的功能。它有以下两个特点：

1、NSOrderedSet不允许元素重复。

2、NSOrderedSet可以保持元素的添加顺序，而且每个元素都有索引，可以根据索引来操作元素。

NSMutableOrderedSet是NSOrderedSet的子类，代表集合元素可变的有序集合。与前面一样，它可以增添，删除，替换，排序元素

```objective-c
//创建集合时故意用重复的元素，可看到程序只会保留其中一个
        NSOrderedSet *set = [NSOrderedSet orderedSetWithObjects: [NSNumber numberWithInt: 40], [NSNumber numberWithInt: 12], [NSNumber numberWithInt: -9], [NSNumber numberWithInt: 28], [NSNumber numberWithInt: 12], [NSNumber numberWithInt: 17], nil];
        NSLog(@"%@", NSCollectionToString(set));
        
        //根据索引获取元素
        NSLog(@"set集合中的第一个元素：%@", [set firstObject]);
        NSLog(@"set集合中的最后一个元素：%@", [set lastObject]);
        NSLog(@"set集合中索引为2的元素：%@", [set objectAtIndex: 2]);
        NSLog(@"28在set集合中的索引为：%ld", [set indexOfObject: [NSNumber numberWithInt:28]]);
        
        //对集合进行过滤，获取元素值大于20的元素的索引
        NSIndexSet *indexSet = [set indexesOfObjectsPassingTest: ^(id obj, NSUInteger idx, BOOL *stop) {
            return (BOOL)([obj intValue] > 20);
        }];
        NSLog(@"set中元素值大于20的元素的索引为：%@", indexSet);
    }
    return 0;
```



## 字典（NSDictionary和NSMutableDictionary）

NSDictionary用于保存具有映射关系的数据，因此NSDictionary中保存着两组值，一组值用于保存key，另一组用于保存value。key和value都可以是任何引用类型的数据，Map的key不允许重复。

key和value之间存在单向一对一的关系，即通过指定的key，总能找到唯一的、确定的value。

NSDictionary包含了一个allKeys方法，用于返回NSDictionary中所有key组成的NSArray集合。

**NSDictionary的功能和用法**

好，我们把 **`NSDictionary` 常用方法完整整理成表格**（创建 / 访问 / 遍历 / 其他常用操作），这样你复习 OC 集合类会非常清晰。

**一、NSDictionary 创建方法**

| 方法名                           | 说明                      | 示例                                                         |
| -------------------------------- | ------------------------- | ------------------------------------------------------------ |
| `dictionary`                     | 创建空字典                | `NSDictionary *dict = [NSDictionary dictionary];`            |
| `dictionaryWithObject:forKey:`   | 创建一个 key-value        | `NSDictionary *dict = [NSDictionary dictionaryWithObject:@"张三" forKey:@"name"];` |
| `dictionaryWithObjects:forKeys:` | 用两个数组创建字典        | `NSDictionary *dict = [NSDictionary dictionaryWithObjects:@[@"张三",@"25"] forKeys:@[@"name",@"age"]];` |
| `dictionaryWithObjectsAndKeys:`  | 按 value-key 顺序创建字典 | `NSDictionary *dict = [NSDictionary dictionaryWithObjectsAndKeys:@"张三",@"name",@"25",@"age",nil];` |
| `dictionaryWithDictionary:`      | 用另一个字典创建新字典    | `NSDictionary *dict2 = [NSDictionary dictionaryWithDictionary:dict1];` |
| `dictionaryWithContentsOfFile:`  | 从 `.plist` 文件创建字典  | `NSDictionary *dict = [NSDictionary dictionaryWithContentsOfFile:@"file.plist"];` |

**二、NSDictionary 访问方法**

| 方法名          | 说明                | 示例                                            |
| --------------- | ------------------- | ----------------------------------------------- |
| `objectForKey:` | 根据 key 获取 value | `NSString *name = [dict objectForKey:@"name"];` |
| `valueForKey:`  | KVC 方式获取值      | `NSString *name = [dict valueForKey:@"name"];`  |
| `allKeys`       | 获取所有 key        | `NSArray *keys = [dict allKeys];`               |
| `allValues`     | 获取所有 value      | `NSArray *values = [dict allValues];`           |
| `count`         | 返回元素数量        | `NSUInteger n = dict.count;`                    |

示例：

```objc
NSDictionary *dict = @{
    @"name":@"张三",
    @"age":@"25"
};

NSString *name = [dict objectForKey:@"name"];
```

**三、NSDictionary 遍历方法**

**1 普通遍历**

| 方法     | 示例                          |
| -------- | ----------------------------- |
| `for in` | `for (NSString *key in dict)` |

```objc
for (NSString *key in dict) {
    NSLog(@"%@ = %@", key, dict[key]);
}
```

**2 枚举器遍历**

| 方法            | 示例            |
| --------------- | --------------- |
| `keyEnumerator` | 获取 key 枚举器 |

```objc
NSEnumerator *enumerator = [dict keyEnumerator];

NSString *key;

while ((key = [enumerator nextObject])) {
    NSLog(@"%@ = %@", key, dict[key]);
}
```

**3 Block遍历（最常用）**

| 方法                                 | 示例      |
| ------------------------------------ | --------- |
| `enumerateKeysAndObjectsUsingBlock:` | Block遍历 |

```objc
[dict enumerateKeysAndObjectsUsingBlock:
 ^(id key, id obj, BOOL *stop) {

    NSLog(@"%@ = %@", key, obj);

}];
```

 **NSDictionary 排序**

字典本身 **无序**，排序通常对 key 排序。

| 方法                                    | 示例    |
| --------------------------------------- | ------- |
| `allKeys` + `sortedArrayUsingSelector:` | key排序 |

```objc
NSArray *sortedKeys =
[[dict allKeys] sortedArrayUsingSelector:@selector(compare:)];

for (NSString *key in sortedKeys) {
    NSLog(@"%@ = %@", key, dict[key]);
}
```

**NSDictionary 过滤**

| 方法                             | 说明            |
| -------------------------------- | --------------- |
| `keysOfEntriesPassingTest:`      | 过滤 key        |
| `objectsForKeys:notFoundMarker:` | 获取指定key的值 |

示例：

```objc
NSSet *keys =
[dict keysOfEntriesPassingTest:
 ^BOOL(id key, id obj, BOOL *stop) {

    return [obj intValue] > 20;

}];
```

**NSDictionary 文件操作**

常用于 **plist存储**。

| 方法                            | 说明       |
| ------------------------------- | ---------- |
| `writeToFile:atomically:`       | 写入文件   |
| `dictionaryWithContentsOfFile:` | 从文件读取 |

示例：

```objc
[dict writeToFile:@"test.plist" atomically:YES];
```

读取：

```objc
NSDictionary *dict =
[NSDictionary dictionaryWithContentsOfFile:@"test.plist"];
```

**NSMutableDictionary**

| 类                    | 是否可变 |
| --------------------- | -------- |
| `NSDictionary`        | 不可变   |
| `NSMutableDictionary` | 可变     |

------

### NSMutableDictionary新增方法

| 方法                  | 说明      |
| --------------------- | --------- |
| `setObject:forKey:`   | 添加/修改 |
| `removeObjectForKey:` | 删除      |
| `removeAllObjects`    | 清空      |

示例：

```objc
NSMutableDictionary *dict = [NSMutableDictionary dictionary];

[dict setObject:@"张三" forKey:@"name"];

[dict removeObjectForKey:@"name"];
```

------