import { getParams, html } from "../common/utils.js";
import { CharacterBox, ExplorationBox, HomeBox, SectionTitle } from "./cardComponents.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

// noinspection HtmlRequiredAltAttribute
const template = html` <div class="user-base-page">
  <div class="left">
    <div class="page-frame">
      <img class="user-namecard-top" src="http://localhost:9934/resources/Version2/frames/namecard-top.svg" />
      <div class="left-page-middle-frame" />
      <img class="user-namecard-bottom" src="http://localhost:9934/resources/Version2/frames/namecard-top.svg" />
    </div>
    <div class="top" :style="{ 'background-image': 'url(' + nameCard + ')'}">
      <div class="profile">
        <img class="character" :src="character" alt="ERROR" />
      </div>
      <div class="container-player-info">
        <div class="player-info">
          <p class="uid">UID {{ data.uid }}</p>
          <p v-if="hasLevelInfo" class="adventure-rank">冒险等阶</p>
          <p v-if="hasLevelInfo" class="adventure-rank">{{ data.level }}</p>
        </div>
      </div>
    </div>
    <div class="container-stats">
      <div class="stats">
        <p>活跃天数</p>
        <p>{{ stats.active_day_number }}</p>
        <p>获得角色</p>
        <p>{{ stats.avatar_number }}</p>
        <p>成就达成</p>
        <p>{{ stats.achievement_number }}</p>
        <p>深境螺旋</p>
        <p>{{ stats.spiral_abyss }}</p>
        <p>普通宝箱</p>
        <p>{{ stats.common_chest_number }}</p>
        <p>风神瞳数</p>
        <p>{{ stats.anemoculus_number }}</p>
        <p>精致宝箱</p>
        <p>{{ stats.exquisite_chest_number }}</p>
        <p>岩神瞳数</p>
        <p>{{ stats.geoculus_number }}</p>
        <p>珍贵宝箱</p>
        <p>{{ stats.precious_chest_number }}</p>
        <p>雷神瞳数</p>
        <p>{{ stats.electroculus_number }}</p>
        <p>华丽宝箱</p>
        <p>{{ stats.luxurious_chest_number }}</p>
        <p>奇馈宝箱</p>
        <p>{{ stats.magic_chest_number }}</p>
      </div>
    </div>
    <div class="container-home-box">
      <SectionTitle :title="homeboxTitle" :subtitle="homeboxSubtitle" />
      <div class="container-homes">
        <HomeBox v-for="home in homes" :data="home" />
      </div>
    </div>
    <div class="quoteBox">
      <img class="quoteImage" :src="emoticon.link" :alt="emoticon.filename" />
      <p class="quoteText" :style="{'fontSize': emoticon.quoteFontSize}">{{ emoticon.quote }}</p>
    </div>
  </div>

  <div class="right">
    <div class="world">
      <SectionTitle title="世界探索" :subtitle="!1" />
      <div class="container-exploration">
        <ExplorationBox v-for="exploration in explorations" :data="exploration" />
      </div>
    </div>
    <div class="container-character">
      <SectionTitle
        title="角色展柜"
        :subtitle="data.avatars.length < stats.avatar_number ? '仅展示米游社人物展柜中的至多8个人物' : !1"
      />
      <div class="container-character-box">
        <CharacterBox v-for="a in data.avatars" :data="a" />
      </div>
    </div>
    <div v-if="hasPlayerNameInfo" class="container-traveler-signature">
      <p class="signature-header">签名</p>
      <div class="signature-underline">
        <p class="signature-body">{{ data.nickname }}</p>
      </div>
    </div>
    <p class="credit">Created by Adachi-BOT</p>
  </div>
</div>`;

export default defineComponent({
  name: "Card8Box",
  template,
  components: {
    SectionTitle,
    HomeBox,
    ExplorationBox,
    CharacterBox,
  },
  setup() {
    const params = getParams(window.location.href);
    // 下面这行是方便前端调试时在「仅展示 8 个角色」和「展示所有角色」之间切换的
    // params.avatars = params.avatars.slice(0, 8);

    const hasLevelInfo = params.level !== -1;
    const hasPlayerNameInfo = params.nickname !== "";
    const randomAvatarOrder = Math.floor(Math.random() * params.avatars.length);
    const target = params.avatars[randomAvatarOrder];
    const targetHasCostume = params.avatars[randomAvatarOrder]["costumes"].length !== 0;
    const costumeName = targetHasCostume ? params.avatars[randomAvatarOrder]["costumes"][0]["name"] : "";

    const ye = { 10000005: "空", 10000007: "荧" };
    const name = ye[target.id] || target.name;
    const id = 10000007 === target.id ? 10000005 : target.id; // 妹妹名片重定向至哥哥名片
    const nameCard = encodeURI(`http://localhost:9934/resources/Version2/namecard/${id}.png`);
    const character = targetHasCostume
      ? encodeURI(`http://localhost:9934/resources/Version2/costumes/avatars/${costumeName}.png`)
      : encodeURI(`http://localhost:9934/resources/Version2/thumb/character/${name}.png`);

    const explorations = params.explorations.reverse();
    const emoticons = params.emoticons || [];

    function homeData(name) {
      const d = params.homes.find((el) => el.name === name);
      return d || { name, level: -1 };
    }

    const homeList = ["罗浮洞", "翠黛峰", "清琼岛", "绘绮庭"];
    const homes = homeList.map((home) => homeData(home));

    const comfort = Math.max(...Object.keys(homes).map((k) => homes[k].comfort_num || -Infinity));
    const homeboxTitle = `尘歌壶`;
    const homeboxSubtitle = `洞天仙力：${comfort > 0 ? comfort : "暂无信息"}`;

    const defaultQuotes = ["旅行者今天去了哪里冒险呢？", "旅行者今天经历了哪些有趣的事情呢？"];
    const defaultQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    let emoticon = {};
    if (Array.isArray(emoticons) && emoticons.length > 0) {
      // filename: 当显示图片错误时，展示发生错误的图片名称，方便定位缺失资源
      // link: 指向图像的链接
      // quote: 图像引言
      const item = emoticons[Math.floor(Math.random() * emoticons.length)];
      const image = item.filename;
      const quote = item.quote || defaultQuote;
      emoticon = { filename: image, link: image, quote: quote };
    } else {
      emoticon = { filename: "派蒙-吃惊.png", link: "派蒙-吃惊.png", quote: defaultQuote };
    }
    emoticon.link = encodeURI(`http://localhost:9934/resources/Version2/emoticons/${emoticon.link}`);

    // 返回引言的字号大小, 范围是 [10, 14]
    function getFontSize(contextLen) {
      const step = 20;
      // level 向下取整，例如正好 contextLen === 20, level = 0
      const level =
        Math.round(contextLen % step) === 0
          ? Math.max(0, Math.floor(contextLen / step) - 1)
          : Math.min(Math.floor(contextLen / step), 4) || 0;

      return 14 - level;
    }

    emoticon.quoteFontSize = parseInt(getFontSize(emoticon.quote.length)).toString() + "px";

    return {
      data: params,
      nameCard,
      character,
      explorations,
      stats: params.stats,
      homes,
      homeboxTitle,
      homeboxSubtitle,
      hasLevelInfo,
      hasPlayerNameInfo,
      emoticon,
    };
  },
});
