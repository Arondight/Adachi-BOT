const template = `<div class="user-base-page">
  <div class="left">
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
    <div class="container-middle">
        <div class="middle">
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
    <SectionTitle class="bottom-split" :title="homeboxTitle" />
    <div class="bottom">
      <HomeBox :data="homes.hole" />
      <HomeBox :data="homes.mountain" />
      <HomeBox :data="homes.island" />
      <HomeBox :data="homes.hall" />
    </div>
  </div>
  
  <div class="right">
    <div class="world">
      <SectionTitle title="世界探索" />
      <div class="container-exploration">
        <div class="explorations">
          <ExplorationBox v-for="e in explorations" :data="e" />
        </div>
      </div>
    </div>
    <div class="container-character">
      <SectionTitle title="角色展柜" />
      <div class="container-vertical">
      <div class="box">
        <CharacterBox v-for="a in data.avatars" :data="a" />
      </div>
    </div>
    </div>
    <div v-if="hasPlayerNameInfo" class="container-traveler-signature">
        <p class="signature-header">签名</p>
        <div class="signature-underline">
            <p class="signature-body">{{data.nickname}}</p>
        </div>
    </div>
    <p class="author">Created by Adachi-BOT</p>
  </div>
</div>`;

import SectionTitle from "./section-title.js";
import ExplorationBox from "./exploration.js";
import CharacterBox from "./character-box.js";
import HomeBox from "./home-box.js";

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;

export default defineComponent({
  name: "Card8Box",
  template,
  components: {
    SectionTitle,
    ExplorationBox,
    CharacterBox,
    HomeBox,
  },
  setup() {
    const params = JSON.parse(
      decodeURIComponent(escape(window.atob(new URL(window.location.href).searchParams.get("data")) || "{}"))
    );

    params.avatars = params.avatars.slice(0, 8);

    function findArea(id) {
      return params.explorations.find((el) => el.id === id);
    }

    const hasLevelInfo = params.level !== -1;
    const hasPlayerNameInfo = params.nickname !== "";
    const target = params.avatars[Math.floor(Math.random() * params.avatars.length)];
    const ye = { 10000005: "旅行者男", 10000007: "旅行者女" };
    const name = ye[target.id] || target.name;
    const id = 10000007 === target.id ? 10000005 : target.id; // 妹妹名片重定向至哥哥名片
    const nameCard = computed(() => `http://localhost:9934/resources/Version2/namecard/${id}.png`);
    const character = computed(() => `http://localhost:9934/resources/Version2/thumb/character/${name}.png`);
    const level = (l) => "Lv." + l;
    const percentage = (p) => p / 10 + "%";
    const explorations = [
      {
        name: "mondstadt",
        prop: {
          探索: percentage(findArea(1).exploration_percentage),
          声望: level(findArea(1).level),
        },
      },
      {
        name: "liyue",
        prop: {
          探索: percentage(findArea(2).exploration_percentage),
          声望: level(findArea(2).level),
        },
      },
      {
        name: "inazuma",
        prop: {
          探索: percentage(findArea(4).exploration_percentage),
          声望: level(findArea(4).level),
          神樱: level(findArea(4).offerings.find((el) => el.name === "神樱眷顾").level),
        },
      },
      {
        name: "dragonspine",
        prop: {
          探索: percentage(findArea(3).exploration_percentage),
          供奉: level(findArea(3).offerings.find((el) => el.name === "忍冬之树").level),
        },
      },
    ];

    function homeData(name) {
      const d = params.homes.find((el) => el.name === name);
      return d || { name, level: -1 };
    }

    const homes = {
      hole: homeData("罗浮洞"),
      mountain: homeData("翠黛峰"),
      island: homeData("清琼岛"),
      hall: homeData("绘绮庭"),
    };
    const comfort = Math.max(...Object.keys(homes).map((k) => homes[k].comfort_num || -Infinity));
    const homeboxTitle = `尘歌壶${comfort > 0 ? "（" + comfort + " 仙力）" : ""}`;

    return {
      data: params,
      nameCard,
      character,
      explorations,
      stats: params.stats,
      homes,
      homeboxTitle,
      hasLevelInfo,
      hasPlayerNameInfo,
    };
  },
});
