---
layout: post
title:  Sanitizers
date:   2025-09-17
# last_modified_at:  
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: sanitizer.png # Add image post (optional)
tags: [Blog, Holistic Software Security]
author: # Add name author (optional)
---
# 本讲内容

C/C++ 提供了直接操作内存的强大能力，然而使用不当也会招致许多问题，下面是 Google chromium 团队的一组统计数据: "Around 70% of our high severity security bugs are memory unsafety problems (that is, mistakes with C/C++ pointers). Half of those are use-after-free bugs." 与内存相关的问题往往排查难度较大，耗时较多。Sanitizers 是由 Google 研发团队提出的用于检测 C/C++ 程序常见内存错误的工具集，Google 工程师公开了它们的源代码和算法, 并在 LLVM clang 上实现，它们已经被用于多个工程中, 比如 Chromium、Firefox 等知名项目中。Sanitizers 除了能够检测内存错误外，还能够检测一些其它常见的错误。

- [本讲内容](#本讲内容)
  - [Sanitizers 工作原理](#sanitizers-工作原理)
    - [AddressSanitizer (ASan)](#addresssanitizer-asan)
    - [MemorySanitizer (MSan)](#memorysanitizer-msan)
    - [ThreadSanitizer (TSan)](#threadsanitizer-tsan)
    - [UndefinedBehaviorSanitizer (UBSan)](#undefinedbehaviorsanitizer-ubsan)
    - [DataFlowSanitizer / 其它：](#dataflowsanitizer--其它)


---

## Sanitizers 工作原理

缺陷如何影响程序行为？如果我们拥有全面的测试用例：则实际输出与预期输出不符。如果没有测试用例（例如，使用模糊测试）：则报内存错误：程序崩溃（SIGSEGV）=> 访问或执行无效内存; 也可能存在不会导致SIGSEGV的缺陷。很多安全相关的 bug（尤其内存类 bug）在某些输入/执行状态下会导致程序崩溃（SIGSEGV），但有相当一部分 **“silent bugs”** 在多数执行里不会立刻崩溃，因此传统依赖崩溃的模糊测试（fuzzing）会漏掉它们。基本思想：把“静默发生”的错误尽早检测并强制变成可观测的失败（例如崩溃），这样 fuzzing 与测试能发现更多 bug。sanitizers 就是通过在可能出错的指令处插入检查实现这一点（即把检测转为运行时检查）。原理：使所有缺陷都导致程序崩溃. 修改程序，使其在缺陷发生时就能被检测到，而不是等到程序崩溃才发现缺陷。实现方法：在程序中添加额外的检测机制，以实时监控并发现缺陷。

以数组越界举例说明：越界写可能覆盖返回地址, 也可能只是覆盖未用的栈空间，因此表面上无崩溃。

<figure style="text-align: center;">
<img src="/assets/img/sn1.png" alt="" width="500">
<figcaption>Silent bugs</figcaption>
</figure>


- 源码/二进制插桩（instrumentation）：编译器把程序中会产生问题的位置（常见是 load/store、内存分配/释放、未初始化读取等）插入检查代码。
- 运行时元数据（metadata）：多数 sanitizer 维护额外的数据结构（shadow memory、access tables、标记位等）来记录哪些地址/字节是“合法”或“已初始化”的，运行时检查通过查询这些元数据决定是否报错。

Sanitizers通常针对特定类型的错误。例如：
- MemorySanitizer：检测未初始化的内存读取。
- AddressSanitizer：检测非法内存访问。
Instrumentation(插桩)的总体思路：在程序中所有可能出现该错误的位置，添加检测代码。如AddressSanitizer：检测非法内存访问。非法内存访问可能发生在加载和存储指令中。对所有加载和存储指令进行检测，判断使用的地址是否有效（即是否属于程序对象）。

> Instrument every load and store to check if the used address is invalid (i.e., does not belong to a program object).


<figure style="text-align: center;">
<img src="/assets/img/sn2.png" alt="" width="500">
<figcaption>Sanitizers: Overview</figcaption>
</figure>

为什么我们不能始终使用sanitizers？它们可以在运行时检测到程序错误——既然如此，为什么我们不直接使用安全检查工具，这样就不用担心程序错误导致安全漏洞了呢？---需要很多额外成本. 其机制的实现需要维护大量额外状态信息，以便检测潜在的程序错误。如AddressSanitizer：检测非法内存访问就需要维护内存地址的有效性元数据，即哪些内存地址是有效的，哪些是无效的。因此难点在于处理动态内存分配。所以有个热门研究方向就是开发高效且智能的元数据管理方法。

### AddressSanitizer (ASan)

检测无效内存访问（越界读写、堆/栈/全局溢出、use-after-free 等）。

AddressSanitizer主要包括两部分：插桩(Instrumentation)和动态运行库(Run-time library)。插桩主要是针对在llvm编译器级别对访问内存的操作(store，load，alloca等)，将它们进行处理。动态运行库主要提供一些运行时的复杂的功能(比如poison/unpoison shadow memory)以及将malloc,free等系统调用函数hook住。该算法的思路是：如果想防住Buffer Overflow漏洞，只需要在每块内存区域右端（或两端，能防overflow和underflow）加一块区域（RedZone），使RedZone的区域的影子内存（Shadow Memory）设置为不可写即可。

**内存映射**

AddressSanitizer保护的主要原理是对程序中的虚拟内存提供粗粒度的影子内存(每8个字节的内存对应一个字节的影子内存)，为了减少overhead，采用了直接内存映射策略，所采用的具体策略如下：Shadow=(Mem >> 3) + offset。Offset 是运行时或编译器/运行时库预先确定的 shadow 区基址（通常通过 mmap 在进程虚拟地址空间中保留一段连续区域），保证 (Addr >> 3) + Offset 指向的是一个已映射的有效地址（不会再引发 segfault）。每8个字节的内存对应一个字节的影子内存，影子内存中每个字节存取一个数字k,如果k=0，则表示该影子内存对应的8个字节的内存都能访问，如果0<k<7, 表示前k个字节可以访问，如果k为负数，不同的数字表示不同的错误（e.g. Stack buffer overflow, Heap buffer overflow)。

**插桩**

为了防止buffer overflow，需要将原来分配的内存两边分配额外的内存Redzone，并将这两边的内存加锁，设为不能访问状态，这样可以有效的防止buffer overflow(但不能杜绝buffer overflow)。以下是在栈中插桩的一个例子。



<figure style="text-align: center;">
<img src="/assets/img/sn3.png" alt="" width="500">
<figcaption>ASan: Mapping</figcaption>
</figure>


ASan是最常用的安全防护机制之一：广泛用于模糊测试。会增加额外的指令因此有额外的性能开销：内存占用：大约3倍（占用内存是原来的3倍）。速度降低：大约2倍（运行速度只有原来的50%）。

### MemorySanitizer (MSan)

检测未初始化读取（使用未初始化内存）。





### ThreadSanitizer (TSan)

检测并发程序中的 data race（数据争用）。

- 数据竞争可能发生在哪些地方？即，需要跟踪哪些指令？
- 如何检测数据竞争？需要记录哪些元数据？




### UndefinedBehaviorSanitizer (UBSan)

检测未定义行为（例如有符号整型溢出、错误的类型转换等），通常开销较低。


### DataFlowSanitizer / 其它：

用于更通用的数据流检查或特定用途的检测。


**总结:**Sanitizers 的目标：把静默内存错误变为可观测的运行时错误，从而让 fuzzing/测试更有效。ASan 是最常用的内存错误检测器，核心是 shadow memory（1:8 映射）与在每个 load/store 前的检查。代价是空间与时间开销，因此常用于测试环境与 fuzzing 集群，不适合直接在生产中一直开启。不同 sanitizer 针对不同问题（未初始化、数据竞争、UB 等），选择时需权衡兼容性与编译复杂度。