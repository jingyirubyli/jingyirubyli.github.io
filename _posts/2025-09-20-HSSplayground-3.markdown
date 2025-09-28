---
layout: post
title:  HSS Playground/Assignment 3 笔记
date:   2025-09-20
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: hss3.png # Add image post (optional)
tags: [Blog, C/C++, Holistic Software Security]
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
- [概念理解](#概念理解)
  - [Part 1: Function Arguments / Call Instructions-处理函数参数和函数调用](#part-1-function-arguments--call-instructions-处理函数参数和函数调用)
    - [Step 1: 处理函数参数-理解函数参数](#step-1-处理函数参数-理解函数参数)
    - [Step 2: 处理函数参数-回顾 doAnalysis()函数](#step-2-处理函数参数-回顾-doanalysis函数)
    - [Step 3: 处理函数参数-](#step-3-处理函数参数-)
    - [Step 4: 处理函数调用](#step-4-处理函数调用)
  - [Part 2: Store / Load Instructions-处理Store/Load指令](#part-2-store--load-instructions-处理storeload指令)
    - [Step 1:](#step-1)
    - [Step 2:](#step-2)
    - [Step 3:](#step-3)
- [编译实践](#编译实践)
  - [Step 1: 生成 .so](#step-1-生成-so)
  - [Step 2: 生成 .ll](#step-2-生成-ll)


---

# 学习目标

在本实验中，将扩展之前实现的除零错误检测机制，使其能够分析和捕获存在内存别名情况下的潜在除零错误。在课程中学习到: 语言中引入内存别名会使分析程序行为变得更加复杂，并需要采用某种指针分析方法。您将执行与控制流无关的指针分析, 即忽略控制流并构建全局指针关系图, 以帮助安全检测工具分析更复杂的程序。

实验的难点在于处理指针别名问题。当多个指针指向同一内存位置时，通过一个指针的修改会影响所有别名指针，这使得静态分析变得复杂。

这是一个关于静态程序分析的实验，主要目标是：

1. 扩展之前实现的"除零检测"静态分析
2. 增加对指针别名和内存分配的处理能力
3. 实现更复杂的数据流分析

---

# 概念理解

## Part 1: Function Arguments / Call Instructions-处理函数参数和函数调用



### Step 1: 处理函数参数-理解函数参数

在之前的实验中，分析器只能处理没有参数的简单基本函数：

```cpp
// 以前的测试程序是：
void f() {  // 没有参数
    int x = 0;
    int y = 2;
    int z = y / x;  // 除零错误
}
// 现在处理类似情况：
int f(int a, int b) {
  return b / a;
}
```

但真实程序中，函数可以接收参数(参数值可能是未知的), 或调用其他函数(函数返回值可能是未知的). 但在本实验中，请假设所有参数均为整数类型。

### Step 2: 处理函数参数-回顾 doAnalysis()函数

熟悉doAnalysis(Function &F)函数，它是您编写的LLVM除零检测插件的入口函数。在之前的章节中，您修改了这个函数来实现了完整的混沌迭代算法：

*void DivZeroAnalysis::doAnalysis(Function &F, PointerAnalysis *PA)*

现在，doAnalysis()函数的参数列表略有变化，新增了一个PointerAnalysis对象。我们将在Part 2详细讲解这部分内容。


### Step 3: 处理函数参数-

LLVM 里，Function 类型提供了 F.args()，可以直接遍历函数的参数。给定一个任意函数F作为doAnalysis()方法的参数，查找该函数调用的所有参数，并为每个参数创建抽象域值。请注意，这里的对象F是Function类型，可以用来获取所有参数信息。此外，在初始化这些参数的初始抽象值后，将这些值传递给现有的除零检测算法，以便在整个可达定义分析过程中跟踪这些变量的状态。


### Step 4: 处理函数调用-CallInst


除了处理被分析函数F的参数外，还需要处理程序中其他函数调用。之前已经遇到过类似的情况，例如下面的函数：

```cpp
void main() {
int x = getchar();
int y = 5 / x;
return 0;
}
```


在上面的例子中，getchar()是一个外部函数调用，它不带参数，返回一个int类型的值。修改你的分析方法，使其能够处理任意的CallInst指令（但仅限于返回类型为int的情况）。




---

## Part 2: Store / Load Instructions-处理Store/Load指令

### Step 1: 新的函数签名 - doAnalysis 初始化

如上所述，我们对之前的doAnalysis()函数进行了修改：

*void DivZeroAnalysis::doAnalysis(Function &F, PointerAnalysis *PA)*

此外，我们也修改了之前实验中使用的传输函数（transfer function）的签名：

*void DivZeroAnalysis::transfer(Instruction *I, const Memory *In, Memory *NOut,
PointerAnalysis *PA, SetVector<Value *> PointerSet)*

如果要复用之前实验的代码，请务必复制之前的实现细节和函数内容，但不要修改这两个函数的签名！这些参数在后续讨论指针别名时至关重要。

为了更好地理解代码的整体结构，请参考*DataFlowAnalysis::runOnFunction()*中的以下代码片段：

```cpp
// ...
    PointerAnalysis *PA = new PointerAnalysis(F);
    doAnalysis(F, PA);
```

以及*DivZeroAnalysis::doAnalysis()*中的以下代码片段：

```cpp
void DivZeroAnalysis::doAnalysis(Function &F, PointerAnalysis *PA) {
// ...
for (inst_iterator I = inst_begin(F), E = inst_end(F); I != E; ++I) {
    WorkSet.insert(&(*I));
    PointerSet.insert(&(*I));
}
// ...
transfer(I, In, NOut, PA, PointerSet);
```


再次强调，传输函数现在需要PointerAnalysis和PointerSet作为输入参数。请记住这一点，尤其是在复用之前实验代码时。


### Step 2: 理解LLVM内存模型 - transfer()

修改*DivZeroAnalysis.cpp*中的transfer()函数，通过跟踪指针来执行更精细的除零分析。

PointerAnalysis类的基本代码位于*DivZero/src/PointerAnalysis.cpp*中，其中包含了实现指针别名分析所需各种方法的代码。在LLVM代码转换过程结束时，PointerAnalysis *PA对象将包含对函数执行指针分析的结果，PointerSet将包含函数中所有指针。后续章节将更详细地介绍PointerAnalysis类的工作原理，但请先阅读代码，理解每个方法的功能。这里我们提供了一个用于处理LLVM中指针的接口。您可以将其作为备选方案，也可以根据需要自行实现LLVM中的引用模型。

本实验禁用了之前实验中使用的mem2reg优化。因此，LLVM将为每个C语言变量创建一个内存单元。这意味着不会看到phi节点，也不需要在代码中实现处理phi节点的相关逻辑。例如：


与之前的实验部分一样，我们仍然使用variable()方法来表示指令中的变量。

**构建指针分析图。** PointerAnalysis类会构建一个指针分析图，您将在传输函数中使用它。PointsToInfo表示从变量到PointsToSet的映射，其中PointsToSet表示一个变量可能指向的所有内存地址集合。

为了便于模拟变量%a（即variable(I1)）对应的内存地址，我们提供了一个address()函数，您可以在构建PointsToSet时使用它来表示变量的内存地址（address(I1)）。指令I2的分析方式与此类似。在指令I5中，I2分配的内存地址（即address(I2)）将存储I1分配的内存地址（即address(I1)）。

此外，PointsTo字段表示您构建的完整指针分析图。

本作业提供的代码框架中，我们已经完成了指针分析构造函数的实现，该函数会遍历给定函数F中的所有指令，并填充PointsTo数据结构。此外，我们还提供了一个alias()方法，用于判断两个指针是否指向同一内存地址（如果指向同一地址，则返回true）。





### Step 3: 实现Store/Load处理 - transfer()

使用 PointerAnalysis 对象，修改 DivZeroAnalysis.cpp 中的 transfer() 函数，使其在分析过程中能够考虑指针别名问题。为此，需要添加对 StoreInst 和 LoadInst 指令的处理。

**LoadInst 指令**：利用内存中已有的变量来确定加载指令引入的新变量的抽象域。例如，对于如下的加载指令：

```
%2 = load i32, i32* %1, align 4
```

该指令将指针 %1 处的值加载到新变量 %2 中，%2 的类型为 i32。引入指针后，我们还可以有如下指令：

```
%1 = load i32*, i32** %d, align 8
```
该指令将指针 %d 处的值（%d 本身也是一个指针）加载到新变量 %1 中，%1 的类型为 i32*。

注意，与之前的例子相比，该加载指令的类型（load i32*）多了一个星号。您可以使用 getType() 方法获取此加载指令的类型，并使用 isIntegerTy() 或 isPointerTy() 等方法进一步检查类型。

**StoreInst 指令**：Store 指令可以将新变量添加到内存映射中，也可以覆盖已有的变量。例如，对于如下的存储指令：

```
store i32 0, i32* %a, align 4
```

该指令将值 0 存储到变量 %a 中。您应该熟悉使用 getOperand() 方法获取这些操作数，但也可以分别使用 getValueOperand() 和 getPointerOperand() 方法。引入指针后，我们还可以有如下指令：

```
store i32* %a, i32** %c, align 4
```

该指令将指针 %a 存储到变量 %c 中，%c 是一个指向指针的指针。我们仍然可以使用 getType() 方法获取每个操作数的类型信息，来确定是否可能存在指针别名问题。这显然加大了抽象域分析的复杂度——如果后续指令修改了变量%a的值，我们不仅需要更新%c的抽象值，还需要考虑更新所有指向%a的指针的抽象值。这同样适用于对%c的修改，例如在pointer0.c示例中就出现了这种情况：

```c
int f() {
    int a = 1;
    int *c = &a;
    int *d = &a;
    *c = 0;
    ...
}
```

为了解决这类问题，我们可以利用指针分析（PointerAnalysis）构建的指针指向图。我们需要遍历提供的指针集合 PointerSet：如果发现某个指针可能与另一个指针存在别名关系（PA->isAlias()返回true），这意味着两个变量的指针值之间存在一条连接边。确定了这些连接关系后，我们需要获取每个指针的抽象值，然后使用Domain::join()方法将它们合并，最后用这个合并后的抽象值更新当前赋值以及所有可能与该指针存在别名关系的赋值。这样可以确保所有指针引用保持一致，并在分析过程中最终收敛到一个精确的抽象值。



---

# 编译实践

一切就绪后, 需要依次运行的命令速查:

```bash
# cd ~/LLVMPlayground/part3_pointer_aware_data_flow_analysis/DivZero/test
clang -emit-llvm -S -fno-discard-value-names -Xclang -disable-O0-optnone -c pointer0.c -o pointer0.opt.ll
opt -load ../../build/DivZero/libDataflowPass.so -DivZero pointer0.opt.ll
```


## Step 1: 生成 .so

使用以下所示的CMakeLists.txt文件构建pass：在生成的文件夹build/DivZero目录下找到DataflowPass.so文件。

```bash
$ cd ~/LLVMPlayground/part3_pointer_aware_data_flow_analysis
$ mkdir build && cd build
$ cmake ..
$ make
```


## Step 2: 生成 .ll

在运行优化器之前，必须先生成LLVM IR代码：

```bash
$ cd ~/LLVMPlayground/part3_pointer_aware_data_flow_analysis/DivZero/test
$ clang -emit-llvm -S -fno-discard-value-names -Xclang -disable-O0-optnone -c pointer0.c -o pointer0.opt.ll
$ opt -load ../../build/DivZero/libDataflowPass.so -DivZero pointer0.opt.ll
```

第二行（clang）将输入C程序simple1.c转换成标准的LLVM IR代码。
最后一行（opt）对生成的LLVM IR代码进行优化，生成一个等价的LLVM IR程序，
这样可以简化您在本实验中将要编写的分析器的工作；特别是，-mem2reg指令会将所有AllocaInst指令转换为寄存器操作，
从而使您的分析器在本次实验中无需处理指针。在后续部分，您将扩展分析器以支持指针处理。