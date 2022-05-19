import { getParams, html, toReadableDate } from "../common/utils.js";
import { challengeTitle, characterShowbox } from "./abyssComponents.js";

const { defineComponent, defineAsyncComponent, unref } = window.Vue;
const avatarTemplate = html`
  <div v-if="isValidData" class="container-character-rounded" :class="className">
    <p class="sub-title">{{title}}</p>
    <img
      :src="sideImageToFront(value[0]['avatar_icon'])"
      class="avatar-rounded"
      :class="getRarityClass(value[0]['rarity'])"
      alt="图片加载失败"
    />
    <p class="avatar-value">{{value[0]['value']}}</p>
  </div>
`;
const avatarBox = defineComponent({
  name: "avatarBox",
  template: avatarTemplate,
  props: {
    data: Object,
  },
  methods: {
    sideImageToFront: (imageURL) => encodeURI(imageURL.replace(/_side/gi, "")),
    getRarityClass(rarity) {
      const rarityClassMap = {
        5: "star-five",
        4: "star-four",
      };
      return rarityClassMap[rarity] || "star-four";
    },
  },
  setup(props) {
    const propsValue = unref(props);
    const title = propsValue.data.title;
    const className = propsValue.data.className;
    const isValidData =
      propsValue.data["value"].length > 0 &&
      "avatar_icon" in propsValue.data.value[0] &&
      "value" in propsValue.data.value[0] &&
      "rarity" in propsValue.data.value[0];
    const value = isValidData ? propsValue.data.value : [];

    return {
      title,
      className,
      isValidData,
      value,
    };
  },
});
const template = html` <div class="container-abyss">
  <div class="card container-namecard">
    <img v-cloak class="user-avatar" :src="sideImageToFront(userAvatar)" alt="Error" />
    <p class="uid-title"><span class="uid">{{playerUid}}</span>的深渊战绩</p>
    <p class="time">{{abyssBriefings.startTime}} - {{abyssBriefings.endTime}}</p>
  </div>
  <div class="card container-briefing">
    <div class="container-vertical briefings">
      <div class="banner-title"><p>挑战回顾</p></div>
      <div class="briefing">
        <p class="briefing-title battle-times">战斗次数</p>
        <p class="briefing-data battle-times">{{abyssBriefings.totalBattleTimes}}</p>
        <p class="briefing-title max-floor">最深抵达</p>
        <p class="briefing-data max-floor">{{abyssBriefings.maxFloor}}</p>
        <p class="briefing-title total-star">获得渊星</p>
        <p class="briefing-data total-star"><span class="abyss-star">*</span>{{abyssBriefings.totalStar}}</p>
      </div>
    </div>
    <div class="container-vertical reveal-rank">
      <div class="banner-title"><p>出战次数</p></div>
      <div v-if="abyssBriefings.revealRank.length !== 0" class="container-reveal-rank">
        <characterShowbox
          v-for="character in abyssBriefings.revealRank"
          :htmlClass="'reveal-rank'"
          :data="character"
          :prefix="''"
          :suffix="'次'"
          :showType="'revealRank'"
        />
      </div>
      <div v-else class="container-vertical">
        <div class="missing-data-placeholder">暂无数据</div>
      </div>
    </div>
    <div class="container-vertical battle-rank">
      <div class="banner-title"><p>战斗数据榜</p></div>
      <div v-if="hasRankingData" class="container-overview">
        <avatarBox v-for="data in characterRankings" :data="data" />
      </div>
      <div v-else class="container-vertical">
        <div class="missing-data-placeholder">暂无数据</div>
      </div>
    </div>
    <p v-if="!isFullDataset" class="credit partial">Created by Adachi-BOT</p>
  </div>

  <div v-if="isFullDataset" class="container-vertical container-abyss-floors">
    <!-- 最后一层的完整数据 -->
    <challengeTitle :title="'最近战斗'" />
    <abyssFloor :data="abyssLastFloor" />
    <!-- 其他层的 briefing -->
    <challengeTitle :title="'其他战斗'" />
    <abyssBriefFloor v-for="floor in abyssFloors" :data="floor" />
  </div>

  <p v-if="isFullDataset" class="credit full-dataset">Created by Adachi-BOT</p>
</div>`;

const abyssFloor = defineAsyncComponent(() => import("./abyssFloor.js"));
const abyssBriefFloor = defineAsyncComponent(() => import("./abyssBriefFloor.js"));

export default defineComponent({
  name: "genshinAbyss",
  template: template,
  components: {
    characterShowbox,
    challengeTitle,
    avatarBox,
    abyssFloor,
    abyssBriefFloor,
  },
  methods: {
    sideImageToFront: (imageURL) => encodeURI(imageURL.replace(/_side/gi, "")),
  },
  setup() {
    function formatDate(date, format) {
      return toReadableDate(date, format);
    }

    const params = getParams(window.location.href);
    const playerUid = params.uid;

    let abyssBriefings = {};

    abyssBriefings.startTime = formatDate(new Date(params.data.start_time * 1000), "YYYY/mm/dd");
    abyssBriefings.endTime = formatDate(new Date(params.data.end_time * 1000), "YYYY/mm/dd");
    abyssBriefings.totalBattleTimes = params.data.total_battle_times || 0;
    abyssBriefings.maxFloor = params.data.max_floor || "8-3";
    abyssBriefings.totalStar = params.data.total_star || 0;
    abyssBriefings.revealRank = params.data.reveal_rank || [];

    const defeat_rank = params.data.defeat_rank || [];
    const damage_rank = params.data.damage_rank || [];
    const take_damage_rank = params.data.take_damage_rank || [];
    const energy_skill_rank = params.data.energy_skill_rank || [];
    const normal_skill_rank = params.data.normal_skill_rank || [];

    const hasRankingData =
      defeat_rank.length !== 0 ||
      damage_rank.length !== 0 ||
      take_damage_rank.length !== 0 ||
      energy_skill_rank.length !== 0 ||
      normal_skill_rank.length !== 0;

    const characterRankings = [
      { title: "最多击破", className: "defeat-rank", value: defeat_rank },
      { title: "最强一击", className: "damage-rank", value: damage_rank },
      { title: "承受伤害", className: "take-damage-rank", value: take_damage_rank },
      { title: "元素爆发次数", className: "burst-rank", value: energy_skill_rank },
      { title: "元素战技释放数", className: "skill-rank", value: normal_skill_rank },
    ];

    let shown_avatars = [];

    for (const [key, value] of Object.entries(params.data)) {
      if (key.endsWith("_rank")) {
        value.forEach((v) => {
          if ("string" === typeof v.avatar_icon && !shown_avatars.includes(v.avatar_icon)) {
            shown_avatars.push(v.avatar_icon);
          }
        });
      }
    }
    const randomAvatar = Math.floor(Math.random() * shown_avatars.length);
    const userAvatar =
      shown_avatars.length !== 0
        ? encodeURI(shown_avatars[randomAvatar])
        : encodeURI("http://localhost:9934/resources/paimon/paimon_logo.jpg");

    const abyssFloors = params.data.floors.sort((a, b) => b.index - a.index).slice(0, 4);
    const abyssLastFloor = abyssFloors.shift();
    const isFullDataset =
      abyssFloors.length > 0 && Array.isArray(abyssFloors[0].levels) && abyssFloors[0].levels.length > 0;

    return {
      playerUid,
      userAvatar,
      abyssBriefings,
      characterRankings,
      hasRankingData,
      isFullDataset,
      abyssFloors,
      abyssLastFloor,
    };
  },
});
