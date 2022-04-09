import { html, toReadableDate } from "../common/utils.js";

const { defineComponent } = window.Vue;
const lodash = window._;

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
</div>`;

export default defineComponent({
  name: "abyssBriefFloor",
  template: briefingTemplate,
  props: {
    data: Object,
  },
  methods: {
    formatDate: (date, format) => toReadableDate(date, format),
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
      chambers.push({ index, star, battles });
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
