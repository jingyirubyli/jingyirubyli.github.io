---
layout: post
title:  HSS Playground/Assignment 4 笔记
date:   2025-09-21
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: instrument.png # Add image post (optional)
tags: [Blog, Holistic Software Security]
author: # Add name author (optional)
---
# 本讲内容


```bash
root@809bedcd4077:~/Downloads/LLVMPlayground-main/part4_instrumentation/DivZeroInstrument/test# clang -emit-llvm -S -fno-discard-value-names -c -o simple0.ll simple0.c -g
root@809bedcd4077:~/Downloads/LLVMPlayground-main/part4_instrumentation/DivZeroInstrument/test# opt -load ../../build/DivZeroInstrument/libInstrumentPass.so -Instrument -S simple0.ll -o simple0.instrumented.ll
root@809bedcd4077:~/Downloads/LLVMPlayground-main/part4_instrumentation/DivZeroInstrument/test# clang -o simple0 -L../../build/DivZeroInstrument -lruntime simple0.instrumented.ll
root@809bedcd4077:~/Downloads/LLVMPlayground-main/part4_instrumentation/DivZeroInstrument/test# LD_LIBRARY_PATH=../../build/DivZeroInstrument ./simple0
Divide-by-zero detected at line 4 and col 13
root@809bedcd4077:~/Downloads/LLVMPlayground-main/part4_instrumentation/DivZeroInstrument/test# cat simple0.cov
2,7
2,7
3,7
3,11
3,7
4,7
4,11
4,15
4,13
```