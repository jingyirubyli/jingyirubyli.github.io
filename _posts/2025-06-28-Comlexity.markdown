---
layout: post
title:  数据操作与时间复杂度
date:   2025-06-28
description: You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. # Add post description (optional)
img: post-cp.png # Add image post (optional)
tags: [Blog, Data Structure]
author: # Add name author (optional)
---
# 本讲内容


---

## 时间复杂度

常数时间的操作: 一个操作如果和样本的数据量没有关系，每次都是固定时间内完成的操作，叫做常数操作。比如读数组中的数 int a = arr[i]; 但是从链表中取数int b = list.get(i) 就不是常数操作,因为链表逻辑上只能从左往右遍历,但是实际内存情况比较复杂.

时间复杂度为一个算法流程中，常数操作数量的一个指标。常用O（读作big O）来表示。具体来说，先要对一个算法流程非常熟悉，然后去写出这个算法流程中，发生了多少常数操作，进而总结出常数操作数量的表达式。比如选择排序: 遍历找出最小值与0位置交换, 在1~N-1遍历找到最小值替换1位置,以此类推...依次是进行了N次寻址+N(相当于N-1)次比较+1次交换、N-1次寻址+N-1次比较+1次交换、N-2次寻址+N-2次比较+1次交换...一共是寻址:N+N-1+N-2……,比较:N+N-1+N-2……,交换:N, 相加=aN^2+bN+C. 时间复杂度只要去掉系数的最高项O(N^2).
在表达式中，只要高阶项，不要低阶项，也不要高阶项的系数，剩下的部分如果为f（N），那么时间复杂度为O（f（N））。
评价一个算法流程的好坏，先看时间复杂度的指标，如果时间复杂度相同,再分析不同数据样本下的实际运行时间(因为理论常数项不能很容易确定)，也就是“常数项时间”。

## 数据结构

### 数字 number

### 列表 list []

a = [1,2,3,4,5]

- 查找: a[0]
- 增加: a.append(6)
- 更新: a[0]=9
- 删除: a.pop(0), 会返回被删除的值(9)
  - a.pop()默认删除最后一个值(6): [2,3,4,5]

常用函数:

a = [2,3,4,5]
- len(a) = 4
- max(a) = 5
- min(a) = 2
- a.reverse() = [5,4,3,2]
- a.clear() =[]

迭代和遍历:
a = [1,2,3,4]
- 
```
for x in a:
    print(x)
```
- 
```
for i in range(len(a)):
    print(a[i])
```

生成器 list comprehension

a = [1,2,3,4,5]
[expression for element in iteration]
b =[i*i for i in a]
- b=[1,4,9,16,25] 
[expression if condition else station for element in iteration]
b =[i*i for i < 3 else i for i in a]
- b=[1,4,3,4,5]



### 元组 tuple ()

list有增删改查操作, tuple只能查,无法修改

a=("apple","airbnb","amazon")

- len(a) = 3
- max(a)
- min(a)


in 操作
a = [1,2,3,4,5]
b = (1,2,3,4,5)
- 3 in a: true
- 3 in b: true
- 0 in a: false

slice 操作
a = [1,2,3,4,5]
b = (1,2,3,4,5)
- a[0:3]=[1,2,3]
- b[0;3]=(1,2,3)

注意初始化一个单元素元组要加逗号, 否则默认为int
<figure style="text-align: center;">
<img src="/assets/img/628_1.png" alt="tuple" width="200">
<figcaption>tuple</figcaption>
</figure>

list和tuple转换
<figure style="text-align: center;">
<img src="/assets/img/628_2.png" alt="tuple to list" width="200">
<figcaption>tuple to list</figcaption>
</figure>


### set 集合 {}

所有的元素都是唯一的. 因为元素是无序的,所以不容易查找.

a = {1, 1.5, "abc"}

- in 操作 
  - “abc” in a: true
- 增: 
  - a.add(1): {1, 1.5,"abc"}
  - a.add(2): {1, 2, 1.5, "abc"}
- 改 (update只能是iterable元素)
  - a.update(1): {1,1.5,"abc"}
  - a.update(4,5): {1,1.5,"abc",4,5}
- 删
  - a.pop() pop随机元素,不常用
  - a.remove()

常用函数
- len
- max
- min
- a-b: a有b没有
- a|b: a或b有
- a&b: a,b都有
- a^b: a,b中不同时有的元素(a有b没有/a没有b有)


### dictionary 字典 {}

key: value 键值对

dict = {"name": “xxx”, "age": 18}

- 查: 
  - dict[“name”]:“xxx”
  - dict[“age”]:18
- 增:
  - dict[“platform”]=“youtube”: dict = {"name": “xxx”, "age": 18, “platform”:“youtube”}
- 改
  - dict[“platform”]=“bilibili”: dict = {"name": “xxx”, "age": 18, “platform”:“bilibili”}
- 删
  - dict.pop(“platform”): dict = {"name": “xxx”, "age": 18}
- in
  - “name” in dictionary: true

<figure style="text-align: center;">
<img src="/assets/img/628_3.png" alt="dictionary" width="400">
<figcaption>dictionary</figcaption>
</figure>

- 遍历

```
for key in dict:
    print(key)

for value in dict.values():
    print(value)

for k,v in dict.items():
    print(k,v)
```

<figure style="text-align: center;">
<img src="/assets/img/628_4.png" alt="dictionary" width="300">
<figcaption>dictionary</figcaption>
</figure>


### String 字符串

s = "Hello world"

- 查
  - s[0]: 'H'
  - s[-1]: 'd'
  - s[:]:'Hello world'
  - s[0:4]:'Hell'
- len()
  - len(s): 11
- max()
  - max(s): 'w'
- min()
  - min(s): ' '
- count()
  - s.count("H"): 1
  - s.count("l"): 3
- isupper()
  - s.isupper(): False
- islower()
  - s.islower(): False
- isdigit()
  - s.isdigit(): False
- lower()
  - s.lower(): 'hello world'
- upper()
  - s.upper(): 'HELLO WORLD'
- strip() 去掉前后空格
  - s.strip(): 'Hello world'
  - ' abc '.strip(): 'abc'
- lstrip()
  - s.strip(): 'Hello world'
  - ' abc '.lstrip(): 'abc '
- rstrip()
  - s.strip(): 'Hello world'
  - ' abc '.rstrip(): ' abc'
- swapcase()
  - s.swapcase(): 'hELLO WORLD'
- replace(old,new)
  - s.replace('l','E'):'HeEEo worEd'
- split() 返回一个list
  - s.split(' '): ['Hello', 'world']




### array 数组

数组在内存中是连续的. 

使用list表示数组: a = [1,2,3,4,5]

优点是读取(索引:a[0])很快, 缺点是查询,插入,删除很慢.



### linked list 链表

```python
class ListNode
    def __init__(self, x):
        self.val = x
        self.next = None 
```

<figure style="text-align: center;">
<img src="/assets/img/628_5.png" alt="linked list" width="300">
<figcaption>linked list</figcaption>
</figure>

数组和链表的区别: 

数组access快, search,insert,delete慢; 链表insert,delete快, search,access慢.


### hash table 哈希表

使用字典.

dict = {"name": “zhs”, "age": 18}

数组中: 按索引index查询是acccess访问(快), 按元素来查询是search(慢).

key的search,insert,delete很快. 不可以用index访问,因为顺序不固定.

函数同字典.


### queue 队列

FIFO先入先出. 单端和双端.

list表示单端. deque表示双端(from collections import deque)

q = deque([1,2,3])

- append()
- pop()
- appendleft()
- popleft()
- max()
- min()
- len()

搭配先入先出规则: append搭配popleft, appendleft搭配pop.


### stack 栈

FILO先入后出.

deque表示: append搭配pop, appendleft搭配popleft.
list表示: append搭配pop.

- append()
- pop()
- len()
- max()
- min()


### heap 堆

from heapq import heapify, heappush, heappop, nlargest

a = [1,2,3]
heapify(a)

- heapify() 默认小堆 
    - heappush(a,x) 插入值x 
    - heappop(a) 删除最小值
    - nlargest(n,a) 前n个最大值
    - nsmallest(n,a) 前n个最小值

- 大堆: heapify(-a)


### tree 树

高度: 此节点到叶子节点的最长路径. 树的高度是根节点到叶子节点的最长路径.
深度: 根节点到该节点的边数.
层: 根节点为第一层,以此类推.

二叉树:每个节点最多2个叉

- 普通二叉树
- 满二叉树: 除了叶子节点,每个节点都有两个叉. 在一棵二叉树中，如果所有分支结点都存在左子树和右子树，并且所有叶子结点都在同一层上，这样的一棵二叉树称之为满二叉树 例如图二中的第一张图，即为一棵满二叉树。而第二张图的B结点由于没有右子节树，所以不是满二叉树。 满二叉树的特点有： 1.叶子**只能**出现在**最下**一层 2.非叶子结点的度**一定为2** 3.在同样深度的二叉树中，满二叉树的结点个数最多，叶子最多
- 完全二叉树: 对书中的节点从上到下,从左到右编号, 编号的节点与满二叉树节点的位置相同. 一棵深度为k的有n个结点的二叉树，从树中的结点按从上至下、从左至右的顺序进行编号，如果编号为i（1≤i≤n）的节点与满二叉树中编号为i的结点在二叉树中的位置相同，则这棵二叉树称为完全二叉树，如图二的第三张图。 >1.叶子结点**只能**出现在**最下两层** 2.最下层的叶子若有结点，一定集中在**左下**部分 3.倒数第二层若有叶子结点，一定都集中在**右半**部分 4.如果结点度为1，则该结点**只有**左孩子，即不存在只有右孩子之说。 5.同样结点数的二叉树，完全二叉树的深度**最小**

<figure style="text-align: center;">
<img src="/assets/img/628_6.png" alt="tree" width="600">
<figcaption>tree</figcaption>
</figure>

二叉树的遍历

- 前序遍历: 当前节点,左节点,右节点
- 中序遍历: 左节点,当前节点,右节点
- 后序遍历: 左节点,右节点,当前节点

<figure style="text-align: center;">
<img src="/assets/img/628_7.png" alt="tree" width="600">
<figcaption>tree</figcaption>
</figure>