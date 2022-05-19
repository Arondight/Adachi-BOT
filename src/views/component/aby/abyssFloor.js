import { html, toReadableDate } from "../common/utils.js";
import { characterShowbox } from "./abyssComponents.js";

const { defineComponent, unref } = window.Vue;

const chamberTemplate = html`
  <div class="container-vertical container-chamber-info">
    <div class="banner-title abyss-chamber-title">
      <div class="chamber-indicator">{{floorIndex}}<span>-</span>{{chamberIndex}}</div>
      <div class="chamber-stars">{{chamberStarCount}}</div>
      <div class="chamber-time" v-if="chamberTimestamp != 0">
        <p>{{formatDate(new Date(chamberTimestamp * 1000), "YY/mm/dd")}}</p>
        <p>
          <span>{{formatDate(new Date(chamberTimestamp * 1000), "HH")}}</span>
          <span class="kerning">:</span>
          <span>{{formatDate(new Date(chamberTimestamp * 1000), "MM")}}</span>
          <span class="kerning">:</span>
          <span>{{formatDate(new Date(chamberTimestamp * 1000), "SS")}}</span>
        </p>
      </div>
    </div>
    <div v-if="isValidChamberData" class="chamber-details valid">
      <div class="first-half">
        <characterShowbox
          v-for="character in chamberDetails[0]['avatars']"
          :htmlClass="'chamber-character'"
          :prefix="'Lv.'"
          :suffix="''"
          :data="character"
        />
      </div>
      <div class="second-half">
        <characterShowbox
          v-for="character in chamberDetails[1]['avatars']"
          :htmlClass="'chamber-character'"
          :prefix="'Lv.'"
          :suffix="''"
          :data="character"
        />
      </div>
    </div>
    <div v-else class="chamber-details invalid">
      <div class="missing-data-placeholder">暂无数据</div>
    </div>
  </div>
`;
const chamber = defineComponent({
  name: "abyssChamber",
  template: chamberTemplate,
  props: {
    chamber: Object,
    floorIndex: Number,
    index: Number,
  },
  components: {
    characterShowbox,
  },
  methods: {
    formatDate(date, format) {
      return toReadableDate(date, format);
    },
  },
  setup(props) {
    const propsValue = unref(props);
    const chamber = propsValue.chamber;
    const chamberIndex = propsValue.index;
    const chamberStars = chamber.star || 0;
    const chamberStarCount = "*".repeat(chamberStars);
    const chamberDetails = chamber.battles || [{}, {}];
    let chamberTimestamp = 0;

    if (chamberDetails.length > 0) {
      if ("timestamp" in chamberDetails[0]) {
        chamberTimestamp = chamberDetails[0].timestamp;
      }
    }

    let isValidChamberData = false;
    const chamberProperties = ["avatars", "index", "timestamp"];

    if (chamberDetails.length === 2) {
      let validCount = 0;
      for (const details of chamberDetails) {
        for (const property of chamberProperties) {
          if (property in details) {
            validCount++;
          }
        }
      }
      if (validCount === 6) {
        isValidChamberData = true;
      }
    }

    return {
      chamberIndex,
      chamberStarCount,
      isValidChamberData,
      chamberDetails,
      chamberTimestamp,
    };
  },
});

const template = html`
  <div class="card container-vertical container-floor-info">
    <chamber v-for="i in 3" :chamber="floorInfo.chambers[i-1] || {}" :floorIndex="floorInfo.floorIndex" :index="i" />
  </div>
`;

export default defineComponent({
  name: "abyssFloor",
  template: template,
  methods: {},
  components: {
    chamber,
  },
  props: {
    data: Object,
  },
  setup(props) {
    const propsValue = unref(props);
    const params = propsValue.data;
    const floorInfo = {};
    floorInfo.floorIndex = params.index || "X";
    floorInfo.chambers = params.levels;

    return {
      floorInfo,
    };
  },
});
