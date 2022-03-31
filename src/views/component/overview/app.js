import { getParams, html } from "../common/utils.js";

const { defineComponent, defineAsyncComponent } = window.Vue;
const template = html` <div class="background" :class="backgroundStyle">
  <img class="svg" :src="elementSvgSrc" v-if="itemType === 'character'" />
  <characterInfoBox v-if="itemType === 'character'" :data="params" />
  <weaponInfoBox v-if="itemType === 'weapon'" :data="params" />
  <div class="credit">Created by Adachi-BOT</div>
</div>`;
const characterInfoBox = defineAsyncComponent(() => import("./characterInfoBox.js"));
const weaponInfoBox = defineAsyncComponent(() => import("./weaponInfoBox.js"));

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
      风: "anemo",
      冰: "cryo",
      草: "dendro",
      雷: "electro",
      岩: "geo",
      水: "hydro",
      火: "pyro",
    };
    const itemType = typeMap[params.type] || "weapon";

    const charElementType = itemType === "character" ? elementMap[params.element.slice()[0]] || "anemo" : "";
    const itemRarity = rarityMap[params.rarity] || "4";

    const backgroundStyle =
      itemType === "character" ? "character-" + charElementType : "weapon-" + itemRarity + "-stars";

    const elementSvgSrc =
      itemType === "character" ? `http://localhost:9934/resources/Version2/elements/${charElementType}.svg` : "";

    return {
      params,
      itemType,
      backgroundStyle,
      elementSvgSrc,
    };
  },
});
