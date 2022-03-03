import { getParams, html } from "../common/utils.js";
import gachaBox from "./gacha-box.js";

// eslint-disable-next-line no-undef
const { defineComponent, defineAsyncComponent } = Vue;
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
    const params = getParams(window.location.href);

    function get_time() {
      const date = new Date();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      let hour = date.getHours();
      let minute = date.getMinutes();
      let second = date.getSeconds();

      if (hour < 10) hour = "0" + hour;
      if (minute < 10) minute = "0" + minute;
      if (second < 10) second = "0" + second;

      return `${month}月${day}日${hour}:${minute}:${second}`;
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

    const userName = params.user;
    const userDrawTime = get_time();
    const [wishType, showEpitomizedPath] = get_wish_type(params.type);
    const drawCount = params.data.length;

    function quickSortByRarity(m, n) {
      const mv = "角色" === m.item_type;
      const nv = "角色" === n.item_type;

      return m.star === n.star ? nv - mv : n.star - m.star;
    }

    const isStatisticalData = params.data.length > 10;

    let gachaDataToShow =
      params.data.length > 10
        ? params.five.concat(params.count.sort((x, y) => quickSortByRarity(x, y)).filter((item) => item.star < 5))
        : params.data.sort((x, y) => quickSortByRarity(x, y));

    const compactGachaData = gachaDataToShow.filter((item) => item.star > 3);
    const reducer = (prev, current) => ({
      count: prev.count + current.count || 0,
      item_name: "已折叠的三星武器",
      item_type: "武器",
      star: 3,
      type: "sword",
    });

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
