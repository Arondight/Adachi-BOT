const template = `
<div class="background" :class="backgroundStyle">
  <div class="svg" :class="backgroundStyle" v-if="itemType === 'character'" :style="{maskImage: 'url(' + elementSvgSrc + ')'}"></div>
  <characterInfoBox v-if="itemType === 'character'" :data="params" />
  <weaponInfoBox v-if="itemType === 'weapon'" :data="params" />
  <div class="credit">Created by Adachi-BOT</div>
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

import { getParams } from "../common/param.js";
import characterInfoBox from "./characterInfoBox.js";
import weaponInfoBox from "./weaponInfoBox.js";

export default defineComponent({
  name: "GenshinOverviewVue3",
  template: template,
  components: {
    characterInfoBox,
    weaponInfoBox,
  },
  setup: function () {
    const params = getParams(window.location.href);

    // noinspection NonAsciiCharacters
    const typeMap = {
      角色: "character",
      武器: "weapon",
    };
    const rarityMap = {
      5: "five",
      4: "four",
      3: "three",
      2: "two",
      1: "one",
    };
    // noinspection NonAsciiCharacters
    const elementMap = {
      风元素: "anemo",
      冰元素: "cryo",
      草元素: "dendro",
      雷元素: "electro",
      岩元素: "geo",
      水元素: "hydro",
      火元素: "pyro",
    };
    const itemType = typeMap[params.type] || "weapon";

    const backgroundStyle =
      itemType === "character"
        ? "character-" + elementMap[params.element]
        : "weapon-" + rarityMap[params.rarity] + "-stars";

    const elementSvgSrc =
      itemType === "character"
        ? `http://localhost:9934/resources/Version2/elements/${elementMap[params.element]}.svg`
        : "";

    return {
      params,
      itemType,
      backgroundStyle,
      elementSvgSrc,
    };
  },
});
