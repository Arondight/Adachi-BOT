import { getParams, html, toReadableDate } from "../common/utils.js";
import gachaBox from "./gacha-box.js";

const { defineComponent, defineAsyncComponent } = window.Vue;
const containerTemplate = html`<div class="gacha-title">
    <span class="deco-username">@{{ userName }}</span>在<span class="deco-time">{{ userDrawTime }}</span>抽取了<span
      class="deco-type"
      >{{ wishType }}</span
    >卡池<span class="deco-count">{{ drawCount }}</span>次
  </div>
  <div class="container-gacha-box">
    <gachaBox v-for="pull in gachaDataToShow" :data="pull" :fives="fives" :isStat="isStatisticalData" />
  </div>
  <div class="info-footer">
    <epitomeIndicator v-if="showEpitomizedPath" :data="epitomizedPath" />
    <div class="credit">Created by Adachi-BOT</div>
  </div>`;
const epitomeIndicator = defineAsyncComponent(() => import("./epitomeIndicator.js"));

export default defineComponent({
  name: "GenshinGachaInfinity",
  template: containerTemplate,
  components: {
    gachaBox,
    epitomeIndicator,
  },
  setup() {
    function get_time() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
      const date = new Date(utc + 8 * 60 * 60 * 1000);

      return toReadableDate(date, "mm月dd日HH:MM:SS");
    }

    function get_wish_type(type) {
      switch (type) {
        case "indefinite":
          return ["常驻祈愿", false];
        case "character":
          return ["角色祈愿", false];
        case "character2":
          return ["角色祈愿2", false];
        case "weapon":
          return ["武器祈愿", true];
        case "eggs":
          return ["彩蛋", false];
      }
    }

    function quickSortByRarity(m, n) {
      const mv = "角色" === m.item_type;
      const nv = "角色" === n.item_type;

      return m.star === n.star ? nv - mv : n.star - m.star;
    }

    function reducer(prev, current) {
      return {
        count: prev.count + current.count || 0,
        item_name: "已折叠的三星武器",
        item_type: "武器",
        star: 3,
        type: "sword",
      };
    }

    const params = getParams(window.location.href);
    const userName = params.user;
    const userDrawTime = get_time();
    const [wishType, showEpitomizedPath] = get_wish_type(params.type);
    const drawCount = params.data.length;
    const isStatisticalData = params.data.length > 10;

    let gachaDataToShow =
      params.data.length > 10
        ? params.five.concat(params.count.sort((x, y) => quickSortByRarity(x, y)).filter((item) => item.star < 5))
        : params.data.sort((x, y) => quickSortByRarity(x, y));

    const compactGachaData = gachaDataToShow.filter((item) => item.star > 3);

    if (params.type !== "eggs" && gachaDataToShow.length > 10) {
      if (compactGachaData.length >= 9) {
        const threeStarItems = [
          {
            count: params.item_nums.three || 0,
            item_name: "已折叠的三星武器",
            item_type: "武器",
            star: 3,
            type: "sword",
          },
        ];
        gachaDataToShow = compactGachaData.concat(threeStarItems);
      } else {
        const gachaStem = gachaDataToShow.slice(0, 9);
        const gachaResidue = gachaDataToShow.slice(9).reduce(reducer);
        gachaDataToShow = gachaStem.concat(gachaResidue);
      }
    }

    let epitomizedPath = params.path;
    epitomizedPath.hasPath = Object.keys(epitomizedPath.course).length !== 0;

    return {
      userName,
      userDrawTime,
      wishType,
      drawCount,
      fives: params.five,
      gachaDataToShow,
      isStatisticalData,
      showEpitomizedPath,
      epitomizedPath,
    };
  },
});
