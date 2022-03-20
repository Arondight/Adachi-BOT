import { getParams, html } from "../common/utils.js";
import { CharacterBox, ExplorationBox, HomeBox, SectionTitle } from "./cardComponents.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

const template = html`
  <div class="card-container">
    <img class="avatar" :src="namecardAvatar" />
    <div class="namecard-container" :style="{'background': nameCard}">
      <div class="player-info-container">
        <p v-if="hasPlayerNameInfo" class="player-name">{{ data.nickname }}</p>
        <p class="uid">UID {{ data.uid }}</p>
        <p v-if="hasLevelInfo" class="adventure-rank">冒险等阶</p>
        <p v-if="hasLevelInfo" class="adventure-rank">{{ data.level }}</p>
      </div>
    </div>
    <div class="info-container">
      <div class="stats main-content">
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

      <div class="section-container" id="serenity-pot">
        <SectionTitle title="尘歌壶" :subtitle="homeboxSubtitle" />
        <div class="container-homes">
          <HomeBox v-for="home in homes" :data="home" />
        </div>
      </div>

      <div class="section-container" id="world-exploration">
        <SectionTitle title="世界探索" :subtitle="!1" />
        <div class="container-explorations main-content">
          <ExplorationBox v-for="exploration in explorations" :data="exploration" />
        </div>
      </div>

      <div class="section-container" id="character-box">
        <SectionTitle
          title="角色展柜"
          :subtitle="data.avatars.length < stats.avatar_number ? '仅展示米游社人物展柜中的至多8个人物' : !1"
        />
        <div class="container-character-box main-content">
          <CharacterBox v-for="a in data.avatars" :data="a" />
        </div>
      </div>
      <!-- 数据 container 结束 -->
    </div>
    <div id="credit">Created by Adachi-BOT</div>
  </div>
`;

// noinspection DuplicatedCode
export default defineComponent({
  name: "genshinCard",
  template: template,
  components: {
    SectionTitle,
    HomeBox,
    ExplorationBox,
    CharacterBox,
  },
  setup() {
    const params = getParams(window.location.href);

    const hasLevelInfo = params.level !== -1;
    const hasPlayerNameInfo = params.nickname !== "";
    const randomAvatarOrder = Math.floor(Math.random() * params.avatars.length);
    const target = params.avatars[randomAvatarOrder];
    const targetHasCostume = params.avatars[randomAvatarOrder]["costumes"].length !== 0;
    const costumeName = targetHasCostume ? params.avatars[randomAvatarOrder]["costumes"][0]["name"] : "";
    const qqid = params.qqid || "";

    const ye = { 10000005: "空", 10000007: "荧" };
    const name = ye[target.id] || target.name;
    const id = 10000007 === target.id ? 10000005 : target.id; // 妹妹名片重定向至哥哥名片
    const nameCardUrl = encodeURI(`http://localhost:9934/resources/Version2/namecard/${id}.png`);
    const nameCard = `linear-gradient(hsla(0, 0%, 100%, 0) 0%, #fff 100%), url(${nameCardUrl})`;

    const character = targetHasCostume
      ? encodeURI(`http://localhost:9934/resources/Version2/costumes/avatars/${costumeName}.png`)
      : encodeURI(`http://localhost:9934/resources/Version2/thumb/character/${name}.png`);

    const namecardAvatar = "" !== qqid ? `https://q1.qlogo.cn/g?b=qq&s=5&nk=${qqid}` : character;

    const explorations = params.explorations.reverse();

    function homeData(name) {
      const d = params.homes.find((el) => el.name === name);
      return d || { name, level: -1 };
    }

    const homeList = ["罗浮洞", "翠黛峰", "清琼岛", "绘绮庭"];
    const homes = homeList.map((home) => homeData(home));

    const comfort = Math.max(...Object.keys(homes).map((k) => homes[k].comfort_num || -Infinity));
    const homeboxSubtitle = `洞天仙力：${comfort > 0 ? comfort : "暂无信息"}`;

    return {
      data: params,
      nameCard,
      namecardAvatar,
      explorations,
      stats: params.stats,
      homes,
      homeboxSubtitle,
      hasLevelInfo,
      hasPlayerNameInfo,
    };
  },
});
