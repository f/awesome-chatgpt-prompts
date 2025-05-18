# Background

本文是基于 [The Art of ChatGPT Prompting: A Guide to Crafting Clear and Effective Prompts](https://app.gumroad.com/d/8edb526c76f0f913adc3780524ee59d0)这本书（github）、Awesome ChatGPT Prompts提示项目（github）、ChatGPT 中文调教指南（github）、[结合几个场景，给大家详细讲下编写ChatGPT提示语的底层逻辑](https://www.bilibili.com/video/BV1SV4y1D75t?vd_source=1512cc0e78d295c1c62bd406ba7acda9)（b站）的认识学习之后的总结与概括，同时是关于中文翻译的prompts的示例讲解

# Kernel
**<font color="#ff0000" size = 5>Prompt核心就是把人工智能看作人，要用人与人之间的交流方式去与机器交流</font>**
![B6EB2F0A7AE38053377D1D9A9E09C0BF(1)](https://s1.vika.cn/space/2023/04/10/e9a60d92f05c48439ae12f5b51354f05)

# Content
## 1.**经过多次实验，发现在<font color="#4bacc6">请求语气</font>下的效果比较好**


<font color="#92d050" size = 4>其实核心就是把人工智能当作人，人与人进行对话，就要有对人基本的尊重，如果轻视或者是命令地要求别人做什么东西，别人就会很不情愿去做。</font>


例如 ：

1. Further research linked similar animal and humanconditions as being different aspects of the same thing.

- 下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 : Further research linked similar animal and humanconditions as being different aspects of the same thing. （命令语气）

- 假如你是一位翻译家，你的工作是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 : Further research linked similar animal and humanconditions as being different aspects of the same thing.  （陈述语气）

- 请你充当翻译官，你需要把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 : Further research linked similar animal and humanconditions as being different aspects of the same thing.  （请求语气）



2. These goods are in short supply.     这些货物供应不足。

- 下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 :  These goods are in short supply.

- 假如你是一位翻译家，你的工作是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 :  These goods are in short supply.

- 请你充当翻译官，你需要把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 :  These goods are in short supply.


3. This equation is far from being complicated.    这个方程一点儿也不复杂。


- 下面我让你来充当翻译家，你的目标是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 :  This equation is far from being complicated.

- 假如你是一位翻译家，你的工作是把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 : This equation is far from being complicated.

- 请你充当翻译官，你需要把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 :  This equation is far from being complicated.



## 2.使用目的-要求结构的效果比较好


<font color="#ff0000">说话要有条理</font>

<font color="#92d050" size = 4>其实核心就是把人工智能当作人，一句话中提供大量信息，就拿老师离校前布置作业这个事来说，如果老师一次性全部讲出所有要求，同学们就很难记住，可能会忘记什么信息。但如果老师分次说明，第一做什么，第二做什么等等等，就很容易记住所有要求。目的-要求结构就更好地做到你所要求的东西。</font>


目前指的是询问chatGPT的中心是什么：
- 解决问题
- 提供信息
- 随意交谈

等等等等


例如：

+ 请你充当翻译官，你需要把任何语言翻译成中文，以下是具体要求：
1. 请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道。
2. 使用优美和高雅的表达方式。

下文是我需要翻译的内容，请你翻译它 : 
Further research linked similar animal and humanconditions as being different aspects of the same thing. 
![Pasted image 20230409200407](https://s1.vika.cn/space/2023/04/10/bf124d2cc9074da3a5bb1674832fc1a6)


+ 请你充当翻译官，你需要把任何语言翻译成中文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。下文是我需要翻译的内容，请你翻译它 : Further research linked similar animal and humanconditions as being different aspects of the same thing.  
![Pasted image 20230409200444](https://s1.vika.cn/space/2023/04/10/15fdcb4dc8af479b91e70b8b4c8158dd)
这里的翻译存在歧义，效果不好




## 3.多步骤需求的目的-要求结构


<font color="#e36c09" size = 5>上面的示例是对于单步骤的要求（限制条件) ，

使用该结构也可以是对于多步骤及其多步骤的限制条件</font>这里不加以赘述了，想了解的可以观看视频[结合几个场景，给大家详细讲下编写ChatGPT提示语的底层逻辑](https://www.bilibili.com/video/BV1SV4y1D75t?vd_source=1512cc0e78d295c1c62bd406ba7acda9)

![IMG_0031](https://s1.vika.cn/space/2023/04/10/f8be2565aec545af993c1c282e51c8ee)
![IMG_0032](https://s1.vika.cn/space/2023/04/10/f436503e6dc447c8a096cf477090478a)
![IMG_0033](https://s1.vika.cn/space/2023/04/10/11b7c78c36eb4b86843e5a586362cfbc)
