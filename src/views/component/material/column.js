import { html } from "../common/utils.js";

const { defineComponent, unref, inject } = window.Vue;

const materialTemplate = html`<div class="unit">
  <div class="top-box">
    <div class="ascension-name">{{ ascensionName }}</div>
    <div class="materials-list">
      <img
        v-for="name in data.ascension"
        class="materials"
        :class="getMaterialRarityBackground(name)"
        :src="materialImage(name)"
        alt="ERROR"
      />
    </div>
  </div>
  <div class="item-list">
    <div class="container-item" v-for="item in list">
      <img
        class="item-image"
        :src="itemImage(item.name, itemType)"
        :class="rarityClass(item.rarity)"
        :alt="item.name"
      />
      <div class="item-name-banner">{{item.name}}</div>
    </div>
  </div>
</div>`;

const materialUnit = defineComponent({
  name: "MaterialUnit",
  template: materialTemplate,
  props: {
    data: Object,
    type: String,
  },
  inject: ["materialMap"],
  methods: {
    materialImage: (name) => `http://localhost:9934/resources/material/icon/${name}.webp`,
    itemImage: (name, itemType) => `http://localhost:9934/resources/${itemType}/icon/${name}.webp`,
    rarityClass: (rarity) => {
      const rarities = [undefined, "one-star", "two-star", "three-star", "four-star", "five-star"];

      return rarities[rarity] || "four-star";
    },
  },
  setup(props) {
    const propsValue = unref(props);
    const materialMap = inject("materialMap");

    const params = propsValue.data;
    const de = params.ascension[0].split("的");
    const arr = de.length === 1 ? params.ascension[0].split("之") : de;
    const ascensionName = arr[0] || "";

    const getMaterialRarityBackground = (materialNameString) => {
      const rarity = materialMap[materialNameString] || 4;
      const rarities = [undefined, "one-star", "two-star", "three-star", "four-star", "five-star"];

      return rarities[rarity];
    };

    return {
      list: params.list,
      ascensionName,
      itemType: propsValue.type || "character",
      materialMap,
      getMaterialRarityBackground,
    };
  },
});

const materialColumnTemplate = html`<div class="material-column">
  <div class="title" v-html="title"></div>
  <materialUnit v-for="d in data" :data="d" :type="type" />
</div>`;

export default defineComponent({
  name: "MaterialColumn",
  template: materialColumnTemplate,
  components: {
    materialUnit,
  },
  props: {
    data: Array,
    type: String,
    day: String,
  },
  setup(props) {
    const title = `<div class="title-text">${props.day}${props.type === "weapon" ? "武器" : "角色"}素材${
      "今日" === props.day ? "<p class='tips'>（每天凌晨四点刷新）</p>" : ""
    }</div>`;

    return { title };
  },
});
