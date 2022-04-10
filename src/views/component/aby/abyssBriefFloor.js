import { html, toReadableDate } from "../common/utils.js";
import { characterShowbox } from "./abyssComponents.js";

const { defineComponent } = window.Vue;
const lodash = window._;

const unfulfilledTemplate = html`
  <div class="container-vertical container-chamber-info">
    <div class="banner-title abyss-chamber-title">
      <p class="chamber-indicator">第{{data.index}}间</p>
      <div class="chamber-stars">{{starText}}</div>
    </div>

    <div class="chamber-details unfulfilled">
      <characterShowbox
        v-for="avatar in avatars"
        :htmlClass="'chamber-character'"
        :prefix="'Lv.'"
        :suffix="''"
        :data="avatar"
      />
    </div>
  </div>
`;

const unfulfilledChamberShowbox = defineComponent({
  name: "unfulfilledChamberShowbox",
  template: unfulfilledTemplate,
  components: {
    characterShowbox,
  },
  props: {
    data: Object,
  },
  setup(props) {
    const avatars = lodash.compact(lodash.flatten(lodash.map(props.data.battles, "avatars")));
    const stars = props.data.star || 1;
    const starText = "*".repeat(stars);

    return {
      avatars,
      starText,
    };
  },
});

const briefingTemplate = html` <div class="card container-vertical container-floor-info">
  <div class="container-briefing-floor-title">
    <div class="briefing-floor-indicator">第{{floorIndex}}层</div>
    <div class="briefing-floor-stars">
      {{obtainedStars}}
      <div class="chamber-stars inline">*</div>
    </div>
    <div class="briefing-floor-duration">
      <div class="brief-start-time">
        <span class="date">{{formatDate(new Date(startTime * 1000), "YY/mm/dd")}}</span>
        <span>{{formatDate(new Date(startTime * 1000), "HH")}}</span>
        <span class="kerning">:</span>
        <span>{{formatDate(new Date(startTime * 1000), "MM")}}</span>
        <span class="kerning">:</span>
        <span>{{formatDate(new Date(startTime * 1000), "SS")}}</span>
      </div>
      <div class="brief-end-time">
        -
        <span class="date">{{formatDate(new Date(endTime * 1000), "YY/mm/dd")}}</span>
        <span>{{formatDate(new Date(endTime * 1000), "HH")}}</span>
        <span class="kerning">:</span>
        <span>{{formatDate(new Date(endTime * 1000), "MM")}}</span>
        <span class="kerning">:</span>
        <span>{{formatDate(new Date(endTime * 1000), "SS")}}</span>
      </div>
    </div>
  </div>

  <div class="container-revealed-briefing">
    <img
      v-for="avatar in avatars"
      :src="avatar.icon"
      class="avatar-rounded-briefing"
      :class="getRarityClass(avatar.rarity)"
      alt="图片加载失败"
    />
  </div>

  <unfulfilledChamberShowbox v-for="chamber in chambers" :data="chamber" />
</div>`;

export default defineComponent({
  name: "abyssBriefFloor",
  template: briefingTemplate,
  components: {
    unfulfilledChamberShowbox,
  },
  props: {
    data: Object,
  },
  methods: {
    formatDate: (date, format) => toReadableDate(date, format),
    getRarityClass: (rarity) => {
      const rarityClassMap = {
        5: "star-five",
        4: "star-four",
      };
      return rarityClassMap[rarity] || "star-four";
    },
  },
  setup(props) {
    const floor = props.data || [];
    const floorIndex = floor.index || "X";
    const obtainedStars = floor.star || "0";
    const chambers = [];
    const timestamps = [];
    let avatars = [];
    for (const chamber of floor.levels) {
      const { index, star, battles } = chamber;
      for (const battle of battles) {
        const { timestamp, avatars: chamberAvatars } = battle;
        timestamps.push(timestamp);
        avatars = avatars.concat(chamberAvatars);
      }
      if (3 !== star) {
        chambers.push({ index, star, battles });
      }
    }

    return {
      floor,
      floorIndex,
      obtainedStars,
      chambers,
      startTime: timestamps[0],
      endTime: timestamps[timestamps.length - 1],
      avatars: lodash.uniqBy(avatars, "id"),
    };
  },
});
