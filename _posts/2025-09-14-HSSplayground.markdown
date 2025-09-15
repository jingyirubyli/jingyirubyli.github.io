---
layout: post
title:  HSS Playground/Assignment 笔记
date:   2025-09-14
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: static-analyzer.png # Add image post (optional)
tags: [Blog, Holistic Software Security]
author: # Add name author (optional)
---
# 本讲内容

一个成熟的静态分析器包含三个组件：
1. 抽象域
2. 各条指令的抽象传递函数，以及
3. 合并各条指令的分析结果，以获得整个函数或程序的分析结果。

在本实验中，我们将仅关注 (ii) 的实现，并且仅针对上述有限的指令子集。更具体地说，您的任务是实现分析如何评估来自给定抽象域的不同 LLVM IR 指令的抽象值。

---

## Part 1





---

## Part 2

任务是实现分析如何评估来自给定抽象域的不同 LLVM IR 指令的抽象值。
我们提供了一个框架来构建您的除零静态分析器。该框架由 DivZero/src/ 下的 Domain.cpp、DataflowAnalysis.cpp 和 DivZeroAnalysis.cpp 文件组成，DivZeroAnalysis 是一个扩展 DataflowAnalysis 的类。

文件 DivZero/include/Domain.h 和 DivZero/src/Domain.cpp 包含抽象值及其操作。这些操作将在不运行程序的情况下执行抽象求值。我们定义了加法、减法、乘法和除法的抽象运算符。


<figure style="text-align: center;">
<img src="/assets/img/uz.png" alt="" width="500">
<figcaption>ubuntu配置非常简单</figcaption>
</figure>

```cpp
bool DataflowAnalysis::runOnFunction(Function &F) {
    outs() << "Running " << getAnalysisName() << " on " << F.getName() << "\n";
    for (inst_iterator I = inst_begin(F), E = inst_end(F); I != E; ++I) {
        InMap[&(*I)] = new Memory;
        OutMap[&(*I)] = new Memory;
    }
    doAnalysis(F);
    collectErrorInsts(F);
    ...
}
```

检查 DataflowAnalysis::runOnFunction 以了解编译器阶段如何在高层次上执行分析：

编译器在阶段中遇到的输入 C 程序中的每个函数都会调用 runOnFunction 过程。每条指令 i 都用作键，在全局 InMap 和 OutMap 哈希映射中初始化一个新的 Memory 对象。这些映射将在下一步中更详细地描述，但现在您可以将它们视为在指令执行前后存储每个变量的抽象值。例如，抽象状态可能存储诸如“在指令 i 之前，变量 x 为正”之类的事实。由于 InMap 和 OutMap 是全局的，因此您可以直接在代码中使用它们。
初始化 InMap 和 OutMap 后，runOnFunction 会调用 doAnalysis：您将在第二部分中实现该函数来执行混沌迭代算法。对于第一部分，您可以假设它只是使用相应的 InMap 和 OutMap 映射调用 transfer 函数。
因此，从高层次来看，runOnFunction 将：
1. 初始化输入和输出映射
2. 使用混沌迭代算法填充它们
3. 使用每条除法指令的 InMap 条目查找潜在的除以零错误以检查除数是否可能为零。



---

## Part 3









---

## Part 4