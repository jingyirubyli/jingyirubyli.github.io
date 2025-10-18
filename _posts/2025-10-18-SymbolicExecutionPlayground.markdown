---
layout: post
title:  HSS SymbolicExecutionPlayground 笔记
date:   2025-10-18
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: hss1.png # Add image post (optional)
tags: [Blog, C/C++, Holistic Software Security]
author: # Add name author (optional)
---
# HSS Playground

注意事项：
- LLVM入门：阅读LLVM PRIMER; 阅读LLVM doc: <https://mapping-high-level-constructs-to-llvm-ir.readthedocs.io/en/latest/index.html>，了解C语言到LLVM IR的映射关系。
- 项目环境搭建：课程提供资源库，其中包含安装LLVM、Z3以及编写LLVM插件所需的所有脚本和示例代码。资源库地址：<https://github.com/HolisticSoftwareSecurity/hssllvmsetup>。该资源库包含分析（即不修改IR的插件）和插桩（即修改IR的插件）的示例。
- 项目代码包: <https://github.com/HolisticSoftwareSecurity/LLVMPlayground>
- 开发环境：CLion（<https://www.jetbrains.com/clion/>）。

目录:



---



# 学习目标



# 实践

## Part 1: LLVM Instrumentation

此动态符号执行实现的第一个组件是对输入程序进行插桩，该操作在 src/Instrument.cpp 中完成。这遵循了之前实验中常见的格式和模式，只是这次 LLVM 传递将注入 src/Runtime.cpp 中定义的各种函数，并附带来自每个有效 LLVM 指令的相应元数据。这将使 DSE 能够在运行时与 Z3 交互。具体来说，以下是需要插桩的函数（来自 include/Instrument.h）：

**符号输入。**框架代码提供了一个名为 DSE_Input 的辅助函数，供用户指定符号输入。在目标程序中，您应该首先包含头文件 include/Runtime.h 才能使用该函数。在下面的示例代码中，动态符号执行引擎将变量 x 和 y 视为符号输入，并将 z 视为具体值 0：

请注意，DSE_Input 是一个宏，将使用唯一 ID 进行扩展。详情请参阅 include/Runtime.h 和 src/SymbolicInterpreter.cpp。最初，DSE 引擎会为输入变量分配随机数。每次 DSE 迭代后，都会生成新的输入，并以逗号分隔值 (CSV) 的形式存储在 input.txt 文件中。该文件包含从 ID 到其整数值的映射。
以下是符号映射 X0:1，X1:10 的示例：

如果存在 input.txt 文件，则使用以下方法检测的目标程序将使用整数值而不是随机数作为输入。


**DSE 初始化的插桩。**首先，您需要插桩输入程序，使其在 main 函数的开头调用函数 __DSE__Init__。框架代码在 src/SymbolicInterpreter.cpp 中提供了 __DSE__Init__ 的定义。如果 input.txt 文件存在，该函数会初始化输入，并注册一个回调函数 __DSE_Exit__，该函数将在目标程序正常终止时调用。框架代码还提供了 __DSE_Exit__ 的定义，它存储了已覆盖分支的列表（在 branch.txt 中）、路径公式（在 formula.smt2 中）和日志（在 log.txt 中）。简而言之，您的插桩模块应该将左侧的代码转换为右侧的代码：




**IR 指令的插桩。**接下来，您将对其余的 IR 指令进行插桩。通常，如果指令中的每个操作数改变了符号内存状态，则应对其进行插桩。常量使用 __DSE_Const__ 函数进行插桩，寄存器使用 __DSE_Register__ 函数进行插桩（详见下一节）。此外，Alloca 指令的插桩函数调用必须出现在指令之后，而所有其他指令的插桩函数调用必须出现在指令之前。__DSE_ICmp__ 和 __DSE_BinOp__ 将左侧寄存器的 ID 作为其第一个参数，并将其 LLVM 操作码（分别为 llvm::CmpInst::Predicate 和 llvm::Instruction:: BinaryOps）作为第二个参数。我们提供了一些插桩示例（为了便于阅读，函数调用已简化）：



## Part 2: Runtime Symbolic Interpretation


本实验的第二部分涉及在 src/Runtime.cpp 中编写运行时符号解释函数。
之前的实验中，已经提供了检测函数，但这次您将自己动手。当每个函数在运行时被调用时，它将改变符号内存状态和路径条件。在这里，您将使用
Z3 API 为符号解释器类添加约束。
LLVM 指令的符号解释。您将为每个 LLVM 指令定义符号操作函数，并检测输入程序以在运行时调用这些函数。在程序实际执行之后，DSE 引擎会操作符号内存状态。include/SymbolicInterpreter.h 中的 SymbolicInterpreter 类维护符号内存，该内存被定义为从符号地址到符号表达式的映射。它还维护一个符号表达式堆栈。
Address 类的一个实例表示一个符号内存地址。符号地址根据 LLVM IR 的定义，可以是内存地址或寄存器。Type 字段表示地址的类型。对于内存地址（通过 LLVM 的 AllocaInstruction 分配），我们将使用其物理地址作为符号地址。对于寄存器，我们将通过 Instrument.h 中的getRegisterID() 分配唯一的寄存器 ID。对于符号表达式，您将重用 Z3 的表达式，它们是 z3::expr 类的实例。
具体执行的符号操作由两个辅助函数 \__DSE_Const__ 和 \__DSE_Register__ 执行，每个函数都将具体常量和寄存器编码为其对应的符号。
这些函数定义在 src/SymbolicInterpreter.cpp 中。函数 \__DSE_Const__ 接受一个 LLVM IR 的常量整数，为其构建一个符号表达式，并将该符号表达式压入堆栈（SymbolicInterpreter 类中的 Stack 字段）。函数 \__DSE_Register__ 获取 LLVM 寄存器的 ID，并将其对应的符号压入堆栈。堆栈中的每个元素要么是常量，要么是寄存器。堆栈中的符号表达式将用于后续的检测函数。
您将使用辅助函数定义 LLVM 指令的符号操作函数。考虑以下等同于简单 C 程序 int x = 1; int y = x; 的 LLVM 代码（为简单起见，省略了类型）：


- __DSE_Alloca__ 函数左侧的寄存器 ID 和新分配的物理内存块的地址为参数。在上面的例子中，\%x 的 ID 为 0，物理内存地址为 0x1000。第 2 行之后的符号内存将包含 Reg(0) : 0x1000 条目。
- __DSE_Store__ 函数假定栈顶存在其值操作数（常量或寄存器）的符号表达式。它以物理内存地址作为参数，并将该符号表达式存储在该地址。
- __DSE_Load__ 函数左侧的寄存器 ID 和将要加载到寄存器的物理内存块的地址为参数。



其他符号操作函数的行为定义方式类似。__DSE_ICmp__ 和 __DSE_BinOp__ 分别接收左侧寄存器的 ID 及其 LLVM 操作码（分别为 llvm::CmpInst::Predicate 和 llvm::Instruction::BinaryOps）。框架代码提供了 SymbolicInterpreter.cpp 中 __DSE_Branch__ 的实现，以供参考。

**使用 Z3 表达式。**llvm::Inst::CmpInst 和 llvm::BinaryOperator 等指令操作符号，需要在约束中等效表示。您将使用 Z3 表达式来表示这些操作。Z3 API 使用 C++ 的运算符重载功能允许您将 C++ 算术和比较运算符与 z3::expr 类型的对象一起使用。下面我们将展示一些示例，用于表示 z3::expr 对象上的算术和比较表达式。这些示例假设 E1 和 E2 是两个 z3::expr 类型的对象，它们的结果存储在另一个 z3::expr 类型的对象 E 中。



## Part 3: Backtracking Strategy

回顾一下课堂上是如何处理条件的，以便 DSE 分析能够探索更多输入测试程序的路径。修改 src/Strategy.cpp 中的 searchStrategy() 函数，以执行此回溯行为。它应该改变当前传递给 Z3 的路径公式，以便它能够得出新的输入。

**路径公式和搜索策略。**
每次执行已检测的程序后，路径公式将被编码并存储在 formula.smt2 中。所有已执行分支指令的 ID 将按执行顺序存储在 branch.txt 中，这可能有助于生成下一个输入。给定当前可满足的路径公式，searchStrategy 函数将提出一个公式来推导新的输入，从而探索更多路径。DSE.cpp 中的主函数将迭代生成新的输入，直到找到崩溃的输入或发生超时。