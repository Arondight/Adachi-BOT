import { html } from "../common/html.js";
import { getParams } from "../common/param.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

const showboxTemplate = html`
  <div class="container-character">
    <img class="avatar-face" :class="rarity" :src="avatarIcon" alt="加载图片失败" />
    <p class="showbox-label">{{label}}</p>
  </div>
`;

const characterShowbox = defineComponent({
  name: "characterShowbox",
  template: showboxTemplate,
  props: {
    data: Object,
    suffix: String,
  },
  setup(props) {
    const rarityClassMap = {
      5: "star-five",
      4: "star-four",
    };
    const avatarIcon = props.data.avatar_icon;
    const rarity = rarityClassMap[props.data.rarity] || "star-four";
    const suffix = props.suffix || "";
    const label = Object.prototype.hasOwnProperty.call(props.data, "value") ? props.data.value.toString() + suffix : "";

    return {
      avatarIcon,
      rarity,
      label,
    };
  },
});

const avatarTemplate = html`
  <div v-if="isValidData" class="container-character-rounded" :class="className">
    <p class="sub-title">{{title}}</p>
    <img
      :src="sideImageToFront(value[0]['avatar_icon'])"
      class="avatar-rounded"
      :class="getRarityClass(value[0]['rarity'])"
      alt="加载图片失败"
    />
    <p class="avatar-value">{{value[0]['value']}}</p>
  </div>
`;

// noinspection JSUnusedGlobalSymbols
const avatarBox = defineComponent({
  name: "avatarBox",
  template: avatarTemplate,
  props: {
    data: Object,
  },
  methods: {
    sideImageToFront(imageURL) {
      return imageURL.replace(/_side/gi, "");
    },
    getRarityClass(rarity) {
      const rarityClassMap = {
        5: "star-five",
        4: "star-four",
      };
      return rarityClassMap[rarity] || "star-four";
    },
  },
  setup(props) {
    const title = props.data.title;
    const className = props.data.className;
    let isValidData = false;
    if (props.data["value"].length > 0) {
      if (
        Object.prototype.hasOwnProperty.call(props.data.value[0], "avatar_icon") &&
        Object.prototype.hasOwnProperty.call(props.data.value[0], "value") &&
        Object.prototype.hasOwnProperty.call(props.data.value[0], "rarity")
      ) {
        isValidData = true;
      }
    }

    const value = isValidData ? props.data.value : [];

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
    <img v-cloak class="user-avatar" :src="userAvatar" alt="Error" />
    <p class="uid-title"><span class="uid">{{playerUid}}</span>的深渊战绩</p>
    <p class="time">{{abyssBriefings.startTime}} - {{abyssBriefings.endTime}}</p>
  </div>
  <div class="card container-briefing">
    <div class="briefing">
      <p class="briefing-title battle-times">战斗次数</p>
      <p class="briefing-data battle-times">{{abyssBriefings.totalBattleTimes}}</p>
      <p class="briefing-title max-floor">最深抵达</p>
      <p class="briefing-data max-floor">{{abyssBriefings.maxFloor}}</p>
      <p class="briefing-title total-star">获得渊星</p>
      <p class="briefing-data total-star"><span class="abyss-star">*</span>{{abyssBriefings.totalStar}}</p>
    </div>
    <div class="container-vertical">
      <div class="banner-title">出战次数</div>
      <div class="container-reveal-rank">
        <characterShowbox v-for="character in abyssBriefings.revealRank" :data="character" :suffix="'次'" />
      </div>
    </div>
    <div class="container-vertical">
      <div class="banner-title">战斗数据榜</div>
      <div class="container-overview">
        <avatarBox v-for="data in characterRankings" :data="data" />
      </div>
    </div>
  </div>
</div>`;

export default defineComponent({
  name: "genshinAbyss",
  template: template,
  components: {
    characterShowbox,
    avatarBox,
  },
  setup() {
    function padLeftZero(str) {
      return ("00" + str).substr(str.length);
    }

    function formatDate(date, fmt) {
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      const o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
      };
      for (const k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
          const str = o[k] + "";
          fmt = fmt.replace(RegExp.$1, 1 === RegExp.$1.length ? str : padLeftZero(str));
        }
      }
      return fmt;
    }

    const params = getParams(window.location.href);
    const playerUid = params.uid;

    let abyssBriefings = {};

    abyssBriefings.startTime = formatDate(new Date(params.data.start_time * 1000), "yyyy/MM/dd");
    abyssBriefings.endTime = formatDate(new Date(params.data.end_time * 1000), "yyyy/MM/dd");
    abyssBriefings.totalBattleTimes = params.data.total_battle_times || 0;
    abyssBriefings.maxFloor = params.data.max_floor || "8-3";
    abyssBriefings.totalStar = params.data.total_star || 0;
    abyssBriefings.revealRank = params.data.reveal_rank || [];

    const defeat_rank = params.data.defeat_rank || [];
    const damage_rank = params.data.damage_rank || [];
    const take_damage_rank = params.data.take_damage_rank || [];
    const energy_skill_rank = params.data.energy_skill_rank || [];
    const normal_skill_rank = params.data.normal_skill_rank || [];

    const characterRankings = [
      { title: "最多击破", className: "defeat-rank", value: defeat_rank },
      { title: "最强一击", className: "damage-rank", value: damage_rank },
      { title: "承受伤害", className: "take-damage-rank", value: take_damage_rank },
      { title: "元素爆发次数", className: "burst-rank", value: energy_skill_rank },
      { title: "元素战技释放数", className: "skill-rank", value: normal_skill_rank },
    ];

    let shown_avatars = [];

    function sideImageToFront(imageURL) {
      // 出于某些奇怪的原因有时候传进来的值是 undefined
      // In JavaScript you can have variable type of string or type of object which is class of String
      // (same thing - both are strings - but defined differently) that's why is double checked.
      // https://stackoverflow.com/a/9436948
      if (typeof imageURL === "string" || imageURL instanceof String) {
        return imageURL.replace(/_side/gi, "");
      } else {
        return "http://localhost:9934/resources/paimon/paimon_logo.jpg";
      }
    }

    for (const [key, value] of Object.entries(params.data)) {
      if (key.endsWith("_rank")) {
        value.forEach((v) =>
          Object.prototype.hasOwnProperty.call(v, "avatar_icon") &&
          !shown_avatars.includes(sideImageToFront(v.avatar_icon))
            ? shown_avatars.push(sideImageToFront(v.avatar_icon))
            : 0
        );
      }
    }
    const randomAvatar = Math.floor(Math.random() * shown_avatars.length);
    const userAvatar = shown_avatars[randomAvatar];

    return {
      params,
      playerUid,
      userAvatar,
      abyssBriefings,
      characterRankings,
    };
  },
});
