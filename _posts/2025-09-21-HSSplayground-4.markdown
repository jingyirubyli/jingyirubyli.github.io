---
layout: post
title:  HSS Playground/Assignment 4 笔记
date:   2025-09-21
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: hss4.png # Add image post (optional)
tags: [Blog, C/C++, Holistic Software Security]
author: # Add name author (optional)
---
# 本讲内容


- [本讲内容](#本讲内容)
- [学习目标](#学习目标)
- [概念理解](#概念理解)
  - [Part 1: 关键技术](#part-1-关键技术)
    - [Step1: 插桩（Instrumentation）](#step1-插桩instrumentation)
    - [Step 2: 代码覆盖率(Code Coverage)机制](#step-2-代码覆盖率code-coverage机制)
    - [Step 3: 调试位置(Debug Location)](#step-3-调试位置debug-location)
    - [Step 4: 代码分析插件(Instrumentation Pass)](#step-4-代码分析插件instrumentation-pass)
  - [Part 2: 代码实现](#part-2-代码实现)
    - [Step 1: 在LLVM代码中插入指令](#step-1-在llvm代码中插入指令)
    - [Step 3: 将C函数加载到LLVM代码中](#step-3-将c函数加载到llvm代码中)
    - [Step 3: 调试信息](#step-3-调试信息)
- [编译实践](#编译实践)
  - [Step 1: 生成 .so](#step-1-生成-so)
  - [Step 2: 生成 .ll](#step-2-生成-ll)
  - [Step 3: 应用优化器](#step-3-应用优化器)
  - [Step 4: 生成独立可执行文件](#step-4-生成独立可执行文件)


---

# 学习目标

构建一个动态分析器来检测C程序运行时的除零错误. 动态分析的关键在于分析运行中的程序，获取其状态和行为信息。我们将开发一个LLVM插件，用于将运行时检查和监控代码插入到目标程序中。该插件将检测程序中的除零错误，并记录程序的执行路径覆盖率。在后续的模糊测试实验中，我们将基于此实验开发一个自动化测试框架。

四个主要任务

1. 实现 instrumentSanitize: 为除法指令插入除零检查
2. 修改 runOnFunction: 遍历所有除法指令进行插桩
3. 实现 instrumentCoverage: 插入代码覆盖率记录
4. 扩展 runOnFunction: 为所有指令添加覆盖率跟踪

---

# 概念理解

## Part 1: 关键技术

理解本实验涉及的技术, 完成下面的任务:

1. 实现 instrumentSanitize 函数，为给定的指令插入 \_sanitize__ 检测代码。
2. 修改 runOnFunction 函数，为给定代码块中的所有除法指令添加除零检测功能。
3. 实现 instrumentCoverage 函数，为所有调试位置插入 \__coverage__ 代码覆盖率统计代码。
4. 修改 runOnFunction 函数，为所有指令添加代码覆盖率统计功能。


### Step1: 插桩（Instrumentation）

考虑以下代码片段，其中有两个潜在的除零错误，分别出现在第A行和第B行。

```c
int main() {
    int x1 = input();
    int y = 13 / x1;   // Line A
    int x2 = input();
    int z = 21 / x2;   // Line B
    return 0;
}
```

如果我们想编写更稳健的代码，可以在每次除法运算之前手动添加检查，并在除数是0时打印错误信息：

```c
int main() {
    int x1 = input();
    if (x1 == 0) { printf("检测到除数为零的错误！"); exit(1); }
    int y = 13 / x1;
    int x2 = input();
    if (x2 == 0) { printf("检测到除数为零的错误！"); exit(1); }
    int z = 21 / x2;
    return 0;
}
```


当然，我们完全可以把这个重复的检查逻辑封装到一个名为“\__sanitize__”的函数中，以便重复使用。 

```c
void __sanitize__(int divisor) {
    if (divisor == 0) {
    printf("检测到除零错误！");
    exit(1);
}
}
int main() {
    int x1 = input();
    __sanitize__(x1);
    int y = 13 / x1;
    int x2 = input();
    __sanitize__(x2);
    int z = 21 / x2;
    return 0;
}
```

在第一个示例中，我们通过在所有除法指令中插入一段用于检查除数是否为零的代码，将不安全的程序版本转换成了安全版本。在本实验中，您将使用LLVM Pass在LLVM IR级别上自动化这个过程。

### Step 2: 代码覆盖率(Code Coverage)机制

代码覆盖率是指程序在特定运行过程中执行的代码行比例。在本实验中，您将实现现代代码覆盖率工具（例如LLVM源代码级代码覆盖率工具和gcov）背后的机制。它在编译时对程序的LLVM中间表示（IR）指令进行插桩，以记录程序运行时执行的源代码行号和列号。这种看似简单的信息可以用于强大的软件分析。我们将探讨两个这样的应用场景。在本部分，您将使用这些信息来改进测试套件，添加更多覆盖代码的测试用例，从而发现导致程序崩溃的错误。在模糊测试实验中，您将使用相同的信息来指导自动测试输入生成器，从而实现现代工业级模糊测试工具的架构。



### Step 3: 调试位置(Debug Location)

当使用 -g 选项编译 C 程序时，LLVM 会在生成的 LLVM IR 指令中包含调试信息。利用上述代码插桩技术， LLVM Pass 可以获取指令的调试信息，并将其传递给 \__sanitize__ 函数，以报告发生除零错误的位置。我们将在后续章节详细介绍该接口的使用方法。


### Step 4: 代码分析插件(Instrumentation Pass)

基于提供的框架构建自己的 LLVM 代码分析插件: 编辑 *DivZeroInstrument/src/Instrument.cpp* 文件，实现除零检测功能以及代码覆盖率统计功能。*DivZeroInstrument/lib/runtime.c* 文件包含您在实验中会用到的函数：

```cpp
void __sanitize__(int divisor, int line, int col)
// 如果除数（divisor）为0，则输出行号和列号（line, col）对应的错误信息。
```


```cpp
void __coverage__(int line, int col)
// 将当前执行进程中行号和列号（line, col）对应的代码覆盖率信息追加到文件中。
```

由于您将创建一个运行时代码分析器，因此您的插件需要通过调用这些函数来对代码进行分析。具体来说，您需要修改 Instrument.cpp 中的 runOnFunction 方法，以便对函数内部的所有 LLVM 指令进行分析。

注意，我们的 runOnFunction 方法返回 true。因为我们为输入代码添加了额外的功能，所以返回 true 表示该插件修改或转换了其遍历的源代码。


---

## Part 2: 代码实现

### Step 1: 在LLVM代码中插入指令

熟悉BasicBlock和Instruction类，以及如何处理LLVM指令。在本实验中，使用LLVM API在遍历BasicBlock时向代码中插入额外的指令。在LLVM中实现这一功能有多种方法。一种常见的做法是创建一个新指令，并将其插入到某个现有指令之后。例如，在以下代码片段中：

```cpp
Instruction* Pi = ...;
auto *NewInst = new Instruction(..., Pi);
```

系统会创建一个新指令（NewInst），并将其自动插入到Pi之后；无需对NewInst进行任何其他操作。Instruction的子类也提供了类似的实现方法。特别是，只需要创建并插入新的函数调用指令（CallInst），如下文所述。

### Step 3: 将C函数加载到LLVM代码中

已经提供了辅助函数__sanitize__和__coverage__的定义，但需要在LLVM指令中调用它们。请注意，这两个函数仅用于日志记录。__sanitize__会记录所有除数为零的情况，而__coverage__会记录代码中执行的每一行。在模块中调用函数之前，必须使用适当的API（Module::getOrInsertFunction）将其加载到模块中。以下示例演示了如何操作：

```cpp
Value* NewValue = M->getOrInsertFunction("function_name", return_type, arg1_type, arg2_type, ..., argN_type); Function* NewFunction = cast<Function>(NewValue);
```

接下来，需要调用创建的函数: 在指令I处使用CallInst::Create创建调用指令，如下所示：

```cpp
CallInst *Call = CallInst::Create(NewFunction, Args, "", &I); 
 Call->setCallingConv(CallingConv::C); 
 Call->setTailCall(true);
```

将适当的参数值填充到std::vector<Value *> Args中。



### Step 3: 调试信息

LLVM会在使用-g选项编译时，为LLVM指令存储原始C程序代码位置信息。这通过DebugLoc类实现:

```cpp
Instruction* I1 =...;
DebugLoc &Debug = I1->getDebugLoc();
printf(\Line No: %d\n", Debug.getLine());
```

您需要收集这些信息并将其传递给sanitizer函数。最后提醒: LLVM指令与对应的C语言源代码行并不一一对应。您需要检查哪些指令包含调试信息。利用这些信息，您可以构建代码覆盖率统计工具。

---

# 编译实践

一切就绪后, 需要依次运行的命令速查:

```bash
# root@809bedcd4077:~/Downloads/LLVMPlayground-main/part4_instrumentation/DivZeroInstrument/test #
clang -emit-llvm -S -fno-discard-value-names -c -o simple0.ll simple0.c -g
opt -load ../../build/DivZeroInstrument/libInstrumentPass.so -Instrument -S simple0.ll -o simple0.instrumented.ll
clang -o simple0 -L../../build/DivZeroInstrument -lruntime simple0.instrumented.ll
LD_LIBRARY_PATH=../../build/DivZeroInstrument ./simple0
cat simple0.cov
```


## Step 1: 生成 .so

使用以下所示的CMakeLists.txt文件构建pass：在生成的文件夹 build/DivZeroInstrument 目录下找到名为 InstrumentPass.so 的文件，该文件是由 DivZeroInstrument/src/Instrument.cpp 中的代码生成的。此外，还有一个名为 libruntime.so 的辅助运行时库，其中包含一些功能，可帮助您完成实验。在生成的文件夹build/DivZero目录下找到DataflowPass.so文件。

```bash
$ cd ~/LLVMPlayground/part4_instrumentation
$ mkdir build && cd build
$ cmake ..
$ make
```


## Step 2: 生成 .ll

在运行优化器之前，必须先生成LLVM IR代码：

```bash
$ cd ~/LLVMPlayground/part4_instrumentation/DivZeroInstrument/test
$ clang -emit-llvm -S -fno-discard-value-names -c -o simple0.ll simple0.c -g
```

第二行（clang）将输入C程序simple1.c转换成标准的LLVM IR代码。

## Step 3: 应用优化器

把分析器作为LLVM插件（名为InstrumentPass）来实现。使用opt命令在优化后的LLVM IR程序上运行此插件，命令如下：

```bash
DivZeroInstrument/test $ opt -load ../../build/DivZeroInstrument/libInstrumentPass.so -Instrument -S simple0.ll -o simple0.instrumented.ll
```

## Step 4: 生成独立可执行文件

接下来，编译经过代码插桩处理后的程序，并将其与提供的运行时库链接，生成名为 simple0 的独立可执行文件：

```bash
DivZeroInstrument/test $ clang -o simple0 -L../../build/DivZeroInstrument -lruntime simple0.instrumented.ll
```

最后，使用空输入运行可执行文件；请注意，对于需要非空输入的程序，您可能需要手动提供测试输入：

```bash
DivZeroInstrument/test $ LD_LIBRARY_PATH=../../build/DivZeroInstrument ./simple0
Floating point exception
```

确实，我们的示例程序存在除零错误。在本实验中，您需要完成代码插桩（Instrumentation）功能，以便在运行时捕获此错误，并生成测试运行的代码覆盖率报告。具体而言，对于上述测试程序，您的输出应如下所示：

```bash
Divide-by-zero detected at line 4 and col 13
```

代码覆盖率信息将输出到名为EXE.cov的文件中，其中EXE是运行的可执行文件的名称（在本例中，查找simple0.cov）。我们的辅助函数将负责创建该文件；您编写的代码需要将行号和列号信息写入该文件。如果实现正确，您将在simple0.cov中看到以下行，这些行表示程序中已执行的行：

```bash
2,7
2,7
3,7
3,11
3,7
4,7
4,11
4,15
```

您可能会在EXE.cov中看到一些重复行。这是因为C源代码中的一行可能对应LLVM IR中的多行。