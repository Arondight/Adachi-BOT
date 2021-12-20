const template = `<div class="user-base-page">
  <div class="left">
    <div class="top">
      <p class="uid">UID {{ data.uid }}</p>
      <img class="name-card" :src="nameCard" alt="ERROR" />
      <div class="profile">
        <img class="character" :src="character" alt="ERROR" />
      </div>
    </div>
    <div class="middle">
      <div class="_left">
        <div class="data-name">
          <p>活跃天数</p>
          <p>成就达成</p>
          <p>普通宝箱</p>
          <p>珍贵宝箱</p>
          <p>奇馈宝箱</p>
          <p>岩神瞳数</p>
        </div>
        <div class="data-value">
          <p>{{ stats.active_day_number }}</p>
          <p>{{ stats.achievement_number }}</p>
          <p>{{ stats.common_chest_number }}</p>
          <p>{{ stats.precious_chest_number }}</p>
          <p>{{ stats.magic_chest_number }}</p>
          <p>{{ stats.geoculus_number }}</p>
        </div>
      </div>
      <div class="_right">
        <div class="data-name">
          <p>获得角色</p>
          <p>深境螺旋</p>
          <p>精致宝箱</p>
          <p>华丽宝箱</p>
          <p>风神瞳数</p>
          <p>雷神瞳数</p>
        </div>
        <div class="data-value">
          <p>{{ stats.avatar_number }}</p>
          <p>{{ stats.spiral_abyss }}</p>
          <p>{{ stats.exquisite_chest_number }}</p>
          <p>{{ stats.luxurious_chest_number }}</p>
          <p>{{ stats.anemoculus_number }}</p>
          <p>{{ stats.electroculus_number }}</p>
        </div>
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
      <div class="explorations">
        <ExplorationBox v-for="e in explorations" :data="e" />
      </div>
    </div>
    <div class="character">
      <SectionTitle title="角色展柜" />
      <div class="container-vertical">
      <div class="box">
        <CharacterBox v-for="a in data.avatars" :data="a" />
      </div>
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

    const charsWithoutYe = params.avatars.filter((el) => "旅行者" !== el.name);
    const target = charsWithoutYe[Math.floor(Math.random() * charsWithoutYe.length)];
    const nameCard = computed(() => `http://localhost:9934/resources/Version2/namecard/${target.id}.png`);
    const character = computed(() => `http://localhost:9934/resources/Version2/thumb/character/${target.name}.png`);
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
    };
  },
});
