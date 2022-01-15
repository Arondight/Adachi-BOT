const template = `<div class="quoteBox">
<img class="quoteImage" :src="link" :alt="name" />
<p class="quoteText">{{quote}}</p>
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;

export default defineComponent({
  name: "quoteBox",
  template,
  props: {},
  setup() {
    const quotes = [
      { name: "七七-倒.png", quote: "" },
      {
        name: "七七-品尝.png",
        quote: "",
      },
      { name: "七七-哦.png", quote: "" },
      {
        name: "七七-暗中观察.png",
        quote: "",
      },
      { name: "丽莎-干得漂亮.png", quote: "" },
      {
        name: "九条裟罗-冲锋.png",
        quote: "",
      },
      { name: "九条裟罗-别想逃.png", quote: "" },
      {
        name: "九条裟罗-开心.png",
        quote: "",
      },
      { name: "九条裟罗-拒绝.png", quote: "" },
      {
        name: "五郎-呲牙.png",
        quote: "",
      },
      { name: "五郎-开心.png", quote: "" },
      {
        name: "五郎-星星眼.png",
        quote: "",
      },
      { name: "五郎-痛哭.png", quote: "" },
      {
        name: "优菈-出发.png",
        quote: "",
      },
      { name: "优菈-嫌弃.png", quote: "" },
      {
        name: "优菈-干杯.png",
        quote: "",
      },
      { name: "优菈-开饭了.png", quote: "" },
      {
        name: "优菈-打喷嚏.png",
        quote: "",
      },
      { name: "优菈-落雪.png", quote: "" },
      {
        name: "优菈-让我看看.png",
        quote: "",
      },
      { name: "优菈-赞扬.png", quote: "" },
      {
        name: "优菈-远眺.png",
        quote: "",
      },
      { name: "优菈-邀请.png", quote: "" },
      {
        name: "凯亚-你真幽默.png",
        quote: "",
      },
      { name: "刻晴-夜宵.png", quote: "" },
      {
        name: "刻晴-我拒绝.png",
        quote: "",
      },
      { name: "刻晴-晚安.png", quote: "" },
      {
        name: "刻晴-点赞.png",
        quote: "",
      },
      { name: "刻晴-疑问.png", quote: "" },
      {
        name: "刻晴-祝贺.png",
        quote: "",
      },
      { name: "刻晴-赌气.png", quote: "" },
      {
        name: "北斗-大笑.png",
        quote: "累的时候，来上两杯最是尽兴！干！",
      },
      { name: "北斗-拜拜.png", quote: "" },
      {
        name: "可莉-呜….png",
        quote: "",
      },
      { name: "可莉-好耶.png", quote: "" },
      {
        name: "可莉-委屈.png",
        quote: "",
      },
      { name: "可莉-抓到了！.png", quote: "" },
      {
        name: "可莉-求求你.png",
        quote: "",
      },
      { name: "可莉-生气气！.png", quote: "" },
      {
        name: "可莉-陪我玩.png",
        quote: "",
      },
      { name: "安柏-不要啊.png", quote: "" },
      {
        name: "安柏-救救我.png",
        quote: "",
      },
      { name: "安柏-给我走开.png", quote: "" },
      {
        name: "宵宫-喂.png",
        quote: "",
      },
      { name: "宵宫-得意.png", quote: "" },
      {
        name: "宵宫-抱歉.png",
        quote: "",
      },
      { name: "宵宫-没问题.png", quote: "" },
      {
        name: "式大将-思考.png",
        quote: "",
      },
      { name: "式大将-躺.png", quote: "" },
      {
        name: "影狼丸-威风.png",
        quote: "",
      },
      { name: "影狼丸-注视.png", quote: "" },
      {
        name: "托马-举高高.png",
        quote: "",
      },
      { name: "托马-害怕.png", quote: "" },
      {
        name: "托马-拜托了.png",
        quote: "",
      },
      { name: "托马-瞧好了.png", quote: "" },
      {
        name: "托马-胃痛.png",
        quote: "",
      },
      { name: "托马-超赞.png", quote: "" },
      {
        name: "早柚-困.png",
        quote: "",
      },
      { name: "早柚-生气.png", quote: "" },
      {
        name: "早柚-看我的.png",
        quote: "",
      },
      { name: "早柚-警觉.png", quote: "" },
      {
        name: "枫原万叶-偷笑.png",
        quote: "",
      },
      { name: "枫原万叶-吃惊.png", quote: "" },
      {
        name: "枫原万叶-嗨.png",
        quote: "",
      },
      { name: "枫原万叶-汗.png", quote: "" },
      {
        name: "派蒙-交给我吧.png",
        quote: "",
      },
      { name: "派蒙-出货吧.png", quote: "" },
      {
        name: "派蒙-吃惊.png",
        quote: "",
      },
      { name: "派蒙-咕咕咕.png", quote: "" },
      {
        name: "派蒙-哭.png",
        quote: "",
      },
      { name: "派蒙-哼哼.png", quote: "" },
      {
        name: "派蒙-大哭.png",
        quote: "",
      },
      { name: "派蒙-好耶.png", quote: "" },
      {
        name: "派蒙-安详.png",
        quote: "",
      },
      { name: "派蒙-小事一桩.png", quote: "" },
      {
        name: "派蒙-干杯.png",
        quote: "",
      },
      { name: "派蒙-微笑.png", quote: "" },
      {
        name: "派蒙-怎会如此.png",
        quote: "",
      },
      { name: "派蒙-愤怒.png", quote: "" },
      {
        name: "派蒙-星星眼.png",
        quote: "",
      },
      { name: "派蒙-期待.png", quote: "" },
      {
        name: "派蒙-该吃饭了.png",
        quote: "",
      },
      { name: "派蒙-问号.png", quote: "" },
      {
        name: "派蒙-馋.png",
        quote: "",
      },
      { name: "派蒙-黑线.png", quote: "" },
      {
        name: "温迪-吃惊.png",
        quote: "",
      },
      { name: "温迪-撒花.png", quote: "" },
      {
        name: "温迪-有主意了.png",
        quote: "",
      },
      { name: "温迪-期待.png", quote: "" },
      {
        name: "温迪-鼓掌.png",
        quote: "",
      },
      { name: "烟绯-得意.png", quote: "" },
      {
        name: "烟绯-无奈.png",
        quote: "",
      },
      { name: "烟绯-没问题.png", quote: "" },
      {
        name: "烟绯-睡不着.png",
        quote: "",
      },
      { name: "珊瑚宫心海-好累.png", quote: "" },
      {
        name: "珊瑚宫心海-悠闲.png",
        quote: "",
      },
      { name: "珊瑚宫心海-摸鱼.png", quote: "" },
      {
        name: "珊瑚宫心海-祈祷.png",
        quote: "",
      },
      { name: "琴-唔.png", quote: "" },
      {
        name: "琴-沉思.png",
        quote: "",
      },
      { name: "琴-生气.png", quote: "" },
      {
        name: "琴-苦笑.png",
        quote: "",
      },
      { name: "琴-赞扬.png", quote: "" },
      {
        name: "甘雨-不要摸.png",
        quote: "",
      },
      { name: "甘雨-懊恼.png", quote: "" },
      {
        name: "甘雨-打瞌睡.png",
        quote: "",
      },
      { name: "甘雨-挺好的.png", quote: "" },
      {
        name: "甘雨-早安.png",
        quote: "",
      },
      { name: "甘雨-祈祷.png", quote: "" },
      {
        name: "砂糖-ok.png",
        quote: "",
      },
      { name: "砂糖-乖巧.png", quote: "" },
      {
        name: "砂糖-加油.png",
        quote: "",
      },
      { name: "砂糖-委屈巴巴.png", quote: "" },
      {
        name: "砂糖-疑问.png",
        quote: "",
      },
      { name: "砂糖-纪录.png", quote: "" },
      {
        name: "神里绫华-偷笑.png",
        quote: "",
      },
      { name: "神里绫华-喝茶.png", quote: "" },
      {
        name: "神里绫华-早安.png",
        quote: "",
      },
      { name: "神里绫华-行礼.png", quote: "" },
      {
        name: "空-睡着了.png",
        quote: "",
      },
      { name: "空-警觉.png", quote: "" },
      {
        name: "罗莎莉亚-下班.png",
        quote: "",
      },
      { name: "罗莎莉亚-凝视.png", quote: "" },
      {
        name: "罗莎莉亚-嫌弃.png",
        quote: "",
      },
      { name: "罗莎莉亚-汗.png", quote: "" },
      {
        name: "胡桃-不好意思.png",
        quote: "",
      },
      { name: "胡桃-交给我吧.png", quote: "" },
      {
        name: "胡桃-卖萌.png",
        quote: "",
      },
      { name: "胡桃-变戏法.png", quote: "" },
      {
        name: "胡桃-吃惊.png",
        quote: "",
      },
      { name: "胡桃-吓你一跳.png", quote: "" },
      {
        name: "胡桃-吓唬.png",
        quote: "",
      },
      { name: "胡桃-坏笑.png", quote: "" },
      {
        name: "胡桃-念诗.png",
        quote: "",
      },
      { name: "胡桃-打哈欠.png", quote: "" },
      {
        name: "胡桃-打招呼.png",
        quote: "",
      },
      { name: "胡桃-搞砸了.png", quote: "" },
      {
        name: "胡桃-爱心.png",
        quote: "",
      },
      { name: "胡桃-看招.png", quote: "" },
      {
        name: "芭芭拉-嘘.png",
        quote: "最神奇的魔法，就是切实的努力！",
      },
      { name: "芭芭拉-害羞.png", quote: "" },
      {
        name: "芭芭拉-慌张.png",
        quote: "",
      },
      { name: "芭芭拉-没事吧.png", quote: "" },
      {
        name: "若陀龙王-休息.png",
        quote: "",
      },
      { name: "若陀龙王-咆哮.png", quote: "" },
      {
        name: "若陀龙王-挠头.png",
        quote: "",
      },
      { name: "若陀龙王-迷茫.png", quote: "" },
      {
        name: "荒泷一斗-吃糖.png",
        quote: "",
      },
      { name: "荒泷一斗-大笑.png", quote: "" },
      {
        name: "荒泷一斗-挑衅.png",
        quote: "",
      },
      { name: "荒泷一斗-挠头.png", quote: "" },
      {
        name: "荧-拜托.png",
        quote: "",
      },
      { name: "荧-请投币.png", quote: "" },
      {
        name: "莫娜-吃炸鸡.png",
        quote: "",
      },
      { name: "莫娜-哼哼.png", quote: "" },
      {
        name: "莫娜-好饿.png",
        quote: "",
      },
      { name: "莫娜-是摩拉.png", quote: "" },
      {
        name: "莫娜-比心.png",
        quote: "",
      },
      { name: "菲谢尔-傲娇.png", quote: "" },
      {
        name: "菲谢尔-哈哈哈.png",
        quote: "",
      },
      { name: "诺艾尔-再来一杯.png", quote: "" },
      {
        name: "诺艾尔-叼薯条.png",
        quote: "",
      },
      { name: "诺艾尔-土豆泥.png", quote: "" },
      {
        name: "诺艾尔-擦嘴.png",
        quote: "",
      },
      { name: "诺艾尔-超赞.png", quote: "" },
      {
        name: "诺艾尔-送餐.png",
        quote: "",
      },
      { name: "辛焱-冲呀.png", quote: "" },
      {
        name: "辛焱-击掌.png",
        quote: "",
      },
      { name: "辛焱-勉强.png", quote: "" },
      {
        name: "辛焱-气死了.png",
        quote: "",
      },
      { name: "辛焱-燃起来了.png", quote: "" },
      {
        name: "达达利亚-偷看.png",
        quote: "",
      },
      { name: "达达利亚-冲浪.png", quote: "" },
      {
        name: "达达利亚-可恶.png",
        quote: "",
      },
      { name: "达达利亚-叹气.png", quote: "" },
      {
        name: "达达利亚-吃惊.png",
        quote: "",
      },
      { name: "达达利亚-失去高光.png", quote: "" },
      {
        name: "达达利亚-征服世界.png",
        quote: "",
      },
      { name: "达达利亚-得意.png", quote: "" },
      {
        name: "达达利亚-挠头.png",
        quote: "",
      },
      { name: "达达利亚-瞄准.png", quote: "" },
      {
        name: "达达利亚-美妙.png",
        quote: "",
      },
      { name: "迪卢克-摇可乐.png", quote: "" },
      {
        name: "迪卢克-撒盐.png",
        quote: "",
      },
      { name: "迪卢克-擦汗.png", quote: "" },
      {
        name: "迪卢克-有事吗.png",
        quote: "",
      },
      { name: "迪卢克-特别招待.png", quote: "" },
      {
        name: "迪卢克-谢谢惠顾.png",
        quote: "祝你的旅途一路顺利！",
      },
      { name: "迪奥娜-傲娇.png", quote: "这一杯，一定要让那些醉汉知道厉害。" },
      {
        name: "迪奥娜-无聊.png",
        quote: "",
      },
      { name: "迪奥娜-烦躁.png", quote: "" },
      {
        name: "迪奥娜-超凶.png",
        quote: "赶快出发吧！目标是摧毁蒙德酒业！",
      },
      { name: "钟离-不必匆忙.png", quote: "" },
      {
        name: "钟离-可惜忘了.png",
        quote: "",
      },
      { name: "钟离-喝茶.png", quote: "" },
      {
        name: "钟离-天动万象.png",
        quote: "",
      },
      { name: "钟离-思考.png", quote: "" },
      {
        name: "钟离-我全都要.png",
        quote: "",
      },
      { name: "钟离-摊手.png", quote: "" },
      {
        name: "阿贝多-交给我.png",
        quote: "景致不错，不如画下来吧。",
      },
      { name: "阿贝多-冷.png", quote: "" },
      {
        name: "阿贝多-坏笑.png",
        quote: "",
      },
      { name: "阿贝多-怎么了.png", quote: "" },
      {
        name: "阿贝多-沉思.png",
        quote: "",
      },
      { name: "阿贝多-没什么.png", quote: "能麻烦你当我的研究助手吗？" },
      {
        name: "阿贝多-送花.png",
        quote: "",
      },
      { name: "雷电将军-威胁.png", quote: "" },
      {
        name: "雷电将军-惊讶.png",
        quote: "",
      },
      { name: "雷电将军-美味.png", quote: "" },
      {
        name: "雷电将军-轻笑.png",
        quote: "",
      },
      { name: "香菱-新菜谱.png", quote: "" },
      {
        name: "香菱-星星眼.png",
        quote: "",
      },
      { name: "香菱-诶嘿嘿.png", quote: "" },
      {
        name: "魈-冷漠.png",
        quote: "",
      },
      { name: "魈-发呆.png", quote: "" },
      {
        name: "魈-吃.png",
        quote: "",
      },
      { name: "魈-坐.png", quote: "" },
      {
        name: "魈-揉眼.png",
        quote: "",
      },
      { name: "魈-来吧.png", quote: "" },
      {
        name: "魈-疑问.png",
        quote: "",
      },
      { name: "魈-皱眉.png", quote: "" },
    ];
    const randomList = ["旅行者今天去了哪里冒险呢？", "旅行者今天经历了哪些有趣的事情呢？"];
    const data = quotes[Math.floor(Math.random() * quotes.length)];
    const name = data.name;
    const link = computed(() => `http://localhost:9934/resources/Version2/emoticons/${name}`);
    const quote = data.quote === "" ? randomList[Math.floor(Math.random() * randomList.length)] : data.quote;
    return { name, link, quote };
  },
});
