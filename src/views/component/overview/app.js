import { getParams, html } from "../common/utils.js";

const { defineComponent, defineAsyncComponent } = window.Vue;

const template = html`<div class="background" :class="backgroundStyle">
  <img class="svg" :src="elementSvgSrc" v-if="'角色' === itemType" />
  <characterInfoBox v-if="'角色' === itemType" :data="params" />
  <weaponInfoBox v-if="'武器' === itemType" :data="params" />
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
    const rarityMap = {
      5: "five",
      4: "four",
      3: "three",
      2: "two",
      1: "one",
    };
    const itemType = params.type;
    const itemRarity = rarityMap[params.rarity] || "4";
    let backgroundStyle = `weapon-${itemRarity}-stars`;
    let elementSvgSrc = "";

    if ("角色" === itemType) {
      const charElementType = params.element || "风元素";

      backgroundStyle = `character-${charElementType}`;
      elementSvgSrc = `http://localhost:9934/resources/elements/picture/${charElementType}.svg`;
    }

    return {
      params,
      itemType,
      backgroundStyle,
      elementSvgSrc,
    };
  },
});
