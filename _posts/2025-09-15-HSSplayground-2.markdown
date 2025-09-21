---
layout: post
title:  HSS Playground/Assignment 2 笔记
date:   2025-09-15
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: hss2.png # Add image post (optional)
tags: [Blog, Holistic Software Security]
author: # Add name author (optional)
---
# HSS Playground

注意事项：
- LLVM入门：阅读LLVM PRIMER; 阅读LLVM doc: <https://mapping-high-level-constructs-to-llvm-ir.readthedocs.io/en/latest/index.html>，了解C语言到LLVM IR的映射关系。
<!-- - 项目环境搭建：课程提供资源库，其中包含安装LLVM、Z3以及编写LLVM插件所需的所有脚本和示例代码。资源库地址：<https://github.com/HolisticSoftwareSecurity/hssllvmsetup>。该资源库包含分析（即不修改IR的插件）和插桩（即修改IR的插件）的示例。
- 项目代码包: <https://github.com/HolisticSoftwareSecurity/LLVMPlayground> -->
- 开发环境：CLion（<https://www.jetbrains.com/clion/>）。

目录:
- [HSS Playground](#hss-playground)
- [学习目标](#学习目标)
- [概念理解](#概念理解)
  - [Part 1: Transfer Functions](#part-1-transfer-functions)
    - [Step 1: Abstract domain -- 了解抽象域](#step-1-abstract-domain----了解抽象域)
    - [Step 2: DataflowAnalysis::runOnFunction -- 了解编译器优化阶段是如何从高层次上执行数据流分析的。](#step-2-dataflowanalysisrunonfunction----了解编译器优化阶段是如何从高层次上执行数据流分析的)
    - [Step 3: Memory abstraction -- 了解内存抽象](#step-3-memory-abstraction----了解内存抽象)
    - [Step 4: 实现 DivZeroAnalysis::transfer 函数](#step-4-实现-divzeroanalysistransfer-函数)
    - [Step 5: 实现 DivZeroAnalysis::check 函数](#step-5-实现-divzeroanalysischeck-函数)
  - [Part 2:](#part-2)


---

# 学习目标

一个成熟的静态分析器包含三个组件：
1. 抽象域
2. 各条指令的抽象传递函数，以及
3. 合并各条指令的分析结果，以获得整个函数或程序的分析结果。

在本实验中，我们将仅关注 (ii) 的实现，并且仅针对上述有限的指令子集。更具体地说，您的任务是实现分析如何评估来自给定抽象域的不同 LLVM IR 指令的抽象值: 开发一个静态数据流分析器 (data flow analysis pass)，用来在编译时检查 C 程序中可能出现的 除零错误。

提供了一个框架来构建您的除零静态分析器。该框架由 *DivZero/src/Domain.cpp、DataflowAnalysis.cpp、DivZeroAnalysis.cpp* 文件组成，DivZeroAnalysis 是一个扩展 DataflowAnalysis 的类。

目标：
1.	定义并使用 抽象域 (Abstract Domain)，表示变量值的不确定性（Zero、NonZero、MaybeZero 等）。
2.	为不同的 LLVM IR 指令实现传递函数 (transfer functions)，在抽象值上进行计算。
3.	实现数据流分析算法 (chaotic iteration)，迭代传播信息直到收敛。
4.	检查 sdiv 指令的分母是否可能为 0，如果可能 → 报告潜在错误。

---

# 概念理解

## Part 1: Transfer Functions

### Step 1: Abstract domain -- 了解抽象域

阅读《A Menagerie of Program Abstractions》, 了解 Domain class: 文件 *DivZero/include/Domain.h 和 DivZero/src/Domain.cpp* 包含抽象值及其操作。这些操作将在不运行程序的情况下执行抽象求值。我们定义了加法、减法、乘法和除法的抽象运算符。

### Step 2: DataflowAnalysis::runOnFunction -- 了解编译器优化阶段是如何从高层次上执行数据流分析的。

```c
bool DataflowAnalysis::runOnFunction(Function &F) {
    outs() << "Running " << getAnalysisName() << " on " << F.getName() << "\n"
    for (inst_iterator I = inst_begin(F), E = inst_end(F); I != E; ++I) {
        InMap[&(*I)] = new Memory;
        OutMap[&(*I)] = new Memory;
    }
    doAnalysis(F);
    collectErrorInsts(F);
    ...
}
```

runOnFunction 为函数中的每条指令分配输入/输出抽象状态（InMap / OutMap），运行数据流固定点算法（chaotic iteration），最后用得到的 InMap 去检测每个除法指令的潜在“除零”风险。主要步骤分析:

1. 初始化InMap和OutMap, 为每条指令分配空的memory。


2. 使用迭代算法填充这两个哈希表。


3. 通过检查InMap中每个除法指令的键值，判断除数是否可能为零，从而发现潜在的除零错误。

### Step 3: Memory abstraction -- 了解内存抽象


**Memory类型:** using Memory = std::map<std::string, Domain*>;

对于每个指令，DivZeroAnalysis::InMap 和 DivZeroAnalysis::OutMap 分别存储指令执行前后的抽象状态。抽象状态是将 LLVM 变量映射到抽象值的映射；具体来说，我们定义内存为 std::map<std::string, Domain *>。它把“变量名（字符串）”映射到“抽象值（Domain*）”。Domain 的枚举有 Uninit, NonZero, Zero, MaybeZero。

**InMap / OutMap：** 两个 ValueMap<Instruction*, Memory*>。

对每条指令 I：InMap[I] 表示在执行 I 之前程序的抽象状态（某点上所有变量的抽象值），OutMap[I] 表示在执行 I 之后的抽象状态。

**variable(Value*)：** 辅助函数

把 LLVM 的 Value（例如 Instruction*、AllocaInst*、函数参数或全局）编码成内部使用的 std::string 名称（例如 "%x", "@g" 或 "%1"）。用这个字符串作为 Memory 的 key。
由于我们使用 std::string 表示变量，因此我们提供了一个辅助函数 variable，用于将 LLVM Value 转换为我们内部的变量字符串表示。注意，指令也是一种 Value。例如，考虑以下 LLVM 程序。我们展示了每个指令执行前后（用 M 表示）的抽象状态：

<figure style="text-align: center;">
<img src="/assets/img/hss2-1.png" alt="" width="600">
<figcaption></figcaption>
</figure>

在 LLVM IR 中，赋值语句（有返回值的操作）本身就是一个 Instruction，并且它定义了一个 SSA 名称（例如 %y = add i32 %x, 1，左侧 %y 由这个 add 指令代表）。因此：

- 若 I1 是 call i32 @input()，则 variable(I1) 应等于 "%x"（假设 IR 中这个 call 定义了 %x）。
- 若 I2 是 add 指令定义 %y，则 variable(I2) 是 "%y"。

在第一个指令 I1 中，我们将输入整数赋值给变量 %x。在抽象状态中，我们使用抽象值 ⊤（也称为“top”或 MaybeZero），因为该值在编译时是未知的。指令 I2 更新变量 %y 的抽象值，该值是通过对 %x 的抽象值执行抽象加法运算（用 ⊕ 表示）计算得出的。注意，在 LLVM 框架中，赋值指令（例如，调用、二元运算符、icmp 等）的对象也表示其左值（即它所定义的变量）。因此，在您的实现中，您可以使用指令 I1 和 I2 的对象分别表示变量 %x 和 %y。例如，variable(I1) 表示 %x。

因此, 可以直接用 Instruction* 的地址去查 InMap/OutMap，并用 variable(I) 去在 Memory 中读写该指令定义的变量。

### Step 4: 实现 DivZeroAnalysis::transfer 函数


现在我们已经了解了分析过程以及如何存储每个抽象状态，就可以开始实现代码了。首先，需要实现DivZeroAnalysis::transfer函数，用于填充每个指令的outMap。具体来说，给定一条指令及其对应的输入抽象状态（const Memory *In），transfer函数应该计算并填充输出抽象状态（Memory *NOut）。

Instruction类是所有指令类型的基类。Instruction有许多子类。为了正确填充outMap，需要对每种类型的指令进行不同的处理。

本次实验中，您需要处理以下类型的指令：
- BinaryOperators (add, mul, sub, etc.): 二元运算符（加、乘、减等）
- CastInst: 类型转换指令
- CmpInst (icmp eq, ne, slt, sgt, sge, etc.): 比较指令（icmp eq、ne、slt、sgt、sge等）
- BranchInst: 分支指令
- user input via getchar(): 通过getchar()获取的用户输入——如前所述，这在DivZero/include/DataflowAnalysis.h中的isInput()函数中处理。


LLVM提供了多个模板函数来检查指令类型。我们目前主要使用dyn_cast<>。例如，我们可以检查指令I是否为BinaryOperator：

```c
if (BinaryOperator *BO = dyn_cast<BinaryOperator>(I)) {
// I is a BinaryOperator, do something
}
```

运行时，如果可能，dyn_cast会将对象转换为BinaryOperator类型并返回，否则返回null。


**LLVM中的PHI节点详解。**为了优化代码，编译器通常采用静态单赋值（SSA）形式作为中间表示，LLVM IR也不例外。在SSA形式中，每个变量都只在一个代码点处被赋值和更新。如果源代码中的某个变量在多个地方被赋值，那么在LLVM IR中，这些赋值会被拆分成多个不同的变量，然后在某个特定点处再次合并。我们把这个合并点称为PHI节点。为了更好地理解PHI节点，请看下面的代码示例：

```c
int f() {
    int y = input();
    int x = 0;
    if (y < 1) {
        x++ ;
    } else {
        x-- ;
    }
    return x ;
}
```

根据y的值，程序会执行左分支（执行x++）或右分支（执行x--）。在对应的LLVM IR代码中（如下所示）：

```llvm
entry:
    %call = call i32 (...) @input()
    %cmp = icmp slt i32 %call, 1
    br i1 %cmp, label %then, label %else

then:                           ; preds = %entry
    % inc = add nsw i32 0, 1
    br label %if.end

else:                           ; preds = %entry
    % dec = add nsw i32 0, -1
    br label %end

end:                            ; preds = %else, %then
    %x = phi i32 [ %inc, %then ], [ %dec, %else ]
    ret i32 %x
```

变量x的更新被拆分为两个变量%inc和%dec。在分支执行后，使用phi指令将值赋给%x；抽象地说，phi i32 [%inc, %then], [%dec, %else] 表示：如果执行的是then分支，则将%inc的值赋给%x；如果执行的是else分支，则将%dec的值赋给%x。

以下是示例代码，帮助您理解phi节点的使用，因为phi节点的具体细节超出了本课程的范围；不过，如果您对编译器方面的知识感兴趣，可以自行学习更多关于SSA（静态单赋值）的知识。

```c
Domain *evalPhiNode(PHINode *PHI, const Memory *Mem) {
    Value* cv = PHI->hasConstantValue();
    if (cv){
        // eval cv, manipulate Mem, return
    }
    unsigned int n = PHI->getNumIncomingValues();
    Domain* joined = NULL;
    for (unsigned int i = 0; i < n; i++){
        Domain* V = // eval PHI->getIncomingValue(i), manipulate Mem
        if (!joined){
            joined = V;
        }
        joined = Domain::join(joined, V);
    }
    return joined;
}
```

### Step 5: 实现 DivZeroAnalysis::check 函数

DivZeroAnalysis::check 函数用于检查特定指令是否可能导致除零错误。您应该使用 DivZeroAnalysis::InMap 来判断是否存在错误。


---

## Part 2: 
