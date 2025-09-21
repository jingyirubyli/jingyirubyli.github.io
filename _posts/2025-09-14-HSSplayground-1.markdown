---
layout: post
title:  HSS Playground/Assignment 1 笔记
date:   2025-09-14
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: hss1.png # Add image post (optional)
tags: [Blog, Holistic Software Security]
author: # Add name author (optional)
---
# HSS Playground

注意事项：
- LLVM入门：阅读LLVM PRIMER; 阅读LLVM doc: <https://mapping-high-level-constructs-to-llvm-ir.readthedocs.io/en/latest/index.html>，了解C语言到LLVM IR的映射关系。
<!-- - 项目环境搭建：课程提供资源库，其中包含安装LLVM、Z3以及编写LLVM插件所需的所有脚本和示例代码。资源库地址：<https://github.com/HolisticSoftwareSecurity/hssllvmsetup>。该资源库包含分析（即不修改IR的插件）和插桩（即修改IR的插件）的示例。
- 项目代码包: <https://github.com/HolisticSoftwareSecurity/LLVMPlayground> -->
- 开发环境：CLion（<https://www.jetbrains.com/clion/>）。


- [HSS Playground](#hss-playground)
- [学习目标](#学习目标)
- [实践](#实践)
  - [必会命令](#必会命令)
  - [理解 LLVM IR](#理解-llvm-ir)



一个成熟的静态分析器包含三个组件：
1. 抽象域
2. 各条指令的抽象传递函数，以及
3. 合并各条指令的分析结果，以获得整个函数或程序的分析结果。

在本实验中，我们将仅关注 (ii) 的实现，并且仅针对上述有限的指令子集。更具体地说，您的任务是实现分析如何评估来自给定抽象域的不同 LLVM IR 指令的抽象值。

---



# 学习目标

理解不同的LLVM IR指令以及它们是如何从C代码生成的。

# 实践

## 必会命令


**从 .c 生成 .bc**

.bc 是人类不可读的二进制文件.

```bash
clang -c -emit-llvm <your_c_file> -o <path_to_output_bitcode>
```

**从 .bc 生成 .ll**

.ll 是人类可读的二进制文件.

```bash
llvm-dis <path_to_bitcode_file>
```

**从 .c 直接生成 .ll**

```bash
clang -emit-llvm -S -fno-discard-value-names -c <your_c_file> -o <your_ll_file>
```

## 理解 LLVM IR

**Part 1**

请阅读课程网页上的LLVM入门教程，了解LLVM IR的结构。该教程演示了如何使用LLVM编译一个示例C程序，生成相应的LLVM IR代码。您可以使用代码仓库中的*part1/learningir/*目录进行实践练习：

```bash
cd test
clang -emit-llvm -S -fno-discard-value-names -c simple0.c
```

将生成的.ll与对应的.c对照阅读, 理解LLVM IR结构.

**Part 2**

请手动编写与*part1/learningir/ir*目录下的LLVM IR程序对应的C程序，并将这些C程序文件放置到*part1/learningir/c*目录中。确保运行上述命令后，您编写的C程序生成的LLVM IR代码与提供的LLVM IR代码完全一致，因为我们将通过自动评测系统进行评分。您可以使用diff命令行工具来比较两个文件是否相同，具体方法如下所示(您可以忽略clang attributes的一些差异。只需确保代码本身保持一致即可。)：

```bash
cd part1_learningir/c_programs
clang -emit-llvm -S -fno-discard-value-names -c test1.c
diff test1.ll ../ir_programs/test1.ll
```

详细阅读.ll:

```llvm
; ModuleID = 'test1.c'
source_filename = "test1.c"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128"
target triple = "x86_64-unknown-linux-gnu"

; Function Attrs: noinline nounwind optnone uwtable
define dso_local i32 @main() #0 {
entry:
  %retval = alloca i32, align 4 
  %a = alloca i32, align 4
  %b = alloca i32, align 4
  %c = alloca i32, align 4
  %d = alloca i32, align 4
  store i32 0, i32* %retval, align 4
  %call = call i32 @getchar()
  store i32 %call, i32* %a, align 4
  store i32 0, i32* %b, align 4
  %0 = load i32, i32* %a, align 4
  %1 = load i32, i32* %b, align 4
  %cmp = icmp ne i32 %0, %1
  %conv = zext i1 %cmp to i32
  store i32 %conv, i32* %c, align 4
  %2 = load i32, i32* %b, align 4
  %3 = load i32, i32* %c, align 4
  %div = sdiv i32 %2, %3
  store i32 %div, i32* %d, align 4
  ret i32 0
}

declare dso_local i32 @getchar() #1

attributes #0 = { noinline nounwind optnone uwtable "disable-tail-calls"="false" "frame-pointer"="all" "less-precise-fpmad"="false" "min-legal-vector-width"="0" "no-infs-fp-math"="false" "no-jump-tables"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="false" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" "unsafe-fp-math"="false" "use-soft-float"="false" }
attributes #1 = { "disable-tail-calls"="false" "frame-pointer"="all" "less-precise-fpmad"="false" "no-infs-fp-math"="false" "no-nans-fp-math"="false" "no-signed-zeros-fp-math"="false" "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+cx8,+fxsr,+mmx,+sse,+sse2,+x87" "tune-cpu"="generic" "unsafe-fp-math"="false" "use-soft-float"="false" }

!llvm.module.flags = !{!0}
!llvm.ident = !{!1}

!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{!"clang version 12.0.1"}

```

1. define dso_local i32 @main() #0 {}
    define表示这是一个函数定义（有函数体），而不是仅仅声明。dso_local: DSO = Dynamic Shared Object, 表示这个符号在当前模块内（local）可以直接引用，不需要通过动态链接器的全局查找。在现代 clang/LLVM 中，dso_local 是默认的优化标志，用来减少动态链接时的开销。@main 函数名是 main。在 LLVM IR 中，函数名都要以 @ 开头。() 中是函数参数列表，这里是空的（main() 没有参数）。#0 引用了函数属性组 #0。在文件末尾会有 attributes #0 = { ... } 来定义具体属性。在这个例子里，#0 就是 { noinline nounwind optnone uwtable ... }。上一行的注释; Function Attrs: noinline nounwind optnone uwtable表示: 函数 int main()，不能内联(noinline)、不抛异常(nounwind)、不优化(optnone)、会生成 unwind table(uwtable).
2. %retval = alloca i32, align 4
    返回值 %retval 的类型是 i32*（指向这块内存的指针）。
    alloca: 在函数的栈帧上分配一块内存，类型是 i32（32 位整数）, 
    align 4 表示这块内存按 4 字节对齐（即地址是 4 的倍数），这是常见的 int 对齐要求。
> 为什么有 %retval？编译器（Clang/LLVM）常常为“返回值”或为了简化代码生成，在函数入口分配一个专门的返回值槽（stack slot）叫做 retval。它并不是必须的（编译器也可以直接 ret 一个寄存器的值），但这是一个常见的函数栈帧布局习惯：先分配所有局部变量和返回槽。在等价的 C 源里通常你不会写 retval 这个变量；它是编译器生成的实现细节，用来保存最终要返回的值或用于调试/栈布局。
3. %a = alloca i32, align 4 / %b = alloca i32, align 4 / %c = alloca i32, align 4 / %d = alloca i32, align 4
    为局部变量 a, b, c, d 在栈上分配空间，返回的都是 i32* 指针（分别是 %a, %b, %c, %d）。在 C 源中这就对应于在函数开始处声明的 int a, b, c, d;（编译器把这些局部变量实现为栈上的 alloca）。注意：LLVM 要求 alloca 通常出现在函数的入口块（entry），以便后面各处引用该内存。

4. store i32 0, i32* %retval, align 4
    store 是把一个值写入内存：把 i32 0 写到指针 %retval 指向的位置。语义上等同 C 语句：retval = 0;（即把返回值槽初始化为 0）。align 4 表示这次内存写也按 4 字节对齐（告诉后端内存访问对齐信息，可能影响生成的机器指令）。

> 内存与临时值的关系: alloca 分配的是内存（stack slot），你要通过 store 把值放进去，load 才能读出来。与之不同，LLVM 还有 SSA 临时值（像 %0, %1, %cmp），这些是寄存器式的、并非内存。代码里会交替用 load 得到临时值、用 store 更新内存槽。

5. %call = call i32 @getchar()
    call 指令：调用一个函数。@getchar 是一个外部声明的函数（在文件尾部 declare dso_local i32 @getchar()），返回类型是 i32（整型）。执行时，它会调用 C 标准库的 getchar()，从输入里读一个字符，返回一个 int。返回值直接存放在 SSA 临时变量 %call 里，这不是内存槽，而是一次调用的结果。对应 C 代码片段：int tmp = getchar();
6. store i32 %call, i32* %a, align 4
    把刚才 getchar() 返回的值 %call 写进内存槽 %a 对应的位置。%a 是之前 alloca i32 分配的变量槽，存放 int a;。align 4 同样告诉 LLVM 后端，这块内存按 4 字节对齐。对应 C 代码片段：a = tmp;
7. store i32 0, i32* %b, align 4
    把字面量常数 0（类型是 i32）写到内存槽 %b 里面。%b 是前面 alloca i32, align 4 分配的局部变量存储空间，对应 C 语言里的 int b;。这里直接初始化为 0。对应 C 代码片段：b = 0;
8. %0 = load i32, i32* %a, align 4
    把局部变量 a 中的值读出来，存到一个 SSA 临时变量 %0 里: 
    load：从内存里读一个值。
    i32* %a：指向局部变量 %a 的地址。前面 %a = alloca i32 分配了一个整型槽。
	%0：这是一个新的 SSA 临时变量，用来保存读出来的结果。
	align 4：告诉 LLVM，这次读操作的地址对齐是 4 字节（因为是 32 位整数）。
    int tmp0 = a;
9. %1 = load i32, i32* %b, align 4
    读变量 b 的值，并存到 %1 里。
10. %cmp = icmp ne i32 %0, %1
    icmp 是整数比较（integer compare）。ne 意味着 “not equal”（不等于）。比较两个 i32 值 %0 和 %1（它们之前是通过 load 从内存读出的 a 与 b 的当前值）。返回一个 i1（1 位布尔型），%cmp = true 当且仅当 %0 != %1，否则 false。
11.  %conv = zext i1 %cmp to i32
    zext = zero-extend，把较窄的整数扩展成较宽的整数，并在高位填 0。%cmp 是 i1（只有 0 或 1），而后面要把它存到 i32 类型的内存槽（变量 c 是 i32）。必须把 i1 扩成 i32。zext 会把 false → 0，true → 1，这正是 C 语义（布尔值到整型的转换）。结果：%conv 是一个 i32，值为 0 或 1。
12.  store i32 %conv, i32* %c, align 4
    把 i32 值 %conv 写入内存槽 %c（对应 C 里的局部变量 c）。
13.  %2 = load i32, i32* %b, align 4
    %3 = load i32, i32* %c, align 4
    从内存槽 %b 读出 i32，放入 SSA 临时 %2。从内存槽 %c 读出 i32，放入 SSA 临时 %3。
14. %div = sdiv i32 %2, %3
    带符号整数除法（sdiv），对 %2（被除数）除以 %3（除数），结果存到 %div。sdiv 是有符号除法（与 udiv 相对）。当除数为 0 时，这是 未定义行为（undefined behavior）——在实际运行上可能导致硬件异常（如“Floating point exception”/SIGFPE）或其它不可预测后果。LLVM IR 不自动插入除零检查，除非你用 pass 插装。
15. store i32 %div, i32* %d, align 4
    ret i32 0
    把除法结果 %div 存回内存槽 %d（局部变量 d）。函数返回整数 0，结束 main。
16. declare dso_local i32 @getchar() #1
    有一个外部函数 int getchar(void)，它返回一个 i32，没有参数，但函数体不在当前模块中（需要链接 libc）。
