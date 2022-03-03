import { html } from "../common/utils.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;
const template = html` <div class="gacha-box">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100.38 423.17">
    <defs>
      <linearGradient id="Five" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#F29E64;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#FBF9D1;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#F29E64;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="Four" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#866EAB;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#E1C3DC;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#866EAB;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="Three" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#413E59;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#535F8E;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#413E59;stop-opacity:1" />
      </linearGradient>
    </defs>
    <g data-name="Layer 2">
      <path
        class="flame"
        :class="item_props.item_rarity"
        d="M547.64,91.5a61.11,61.11,0,0,0,12.7-8c1.54-1.31,2.79-1.41,4.28-.06,3.81,3.49,8.31,5.85,12.88,8.13l.46.23C569,74.09,562.23,55.31,562.23,36c0,19.48-6.84,38.42-16,56.28A15.05,15.05,0,0,1,547.64,91.5Z"
        style="transform: translate(-512px, -46px);"
      />
      <path
        class="flame"
        :class="item_props.item_rarity"
        d="M547.64,91.5a61.11,61.11,0,0,0,12.7-8c1.54-1.31,2.79-1.41,4.28-.06,3.81,3.49,8.31,5.85,12.88,8.13l.46.23C569,74.09,562.23,55.31,562.23,36c0,19.48-6.84,38.42-16,56.28A15.05,15.05,0,0,1,547.64,91.5Z"
        style="transform: translate(-512px, 468px) scaleY(-1);"
      />
      <path
        class="frame"
        :class="item_props.item_rarity"
        d="M10.54 333.58q.62 38.87 1.18 77.74c.08 5.06 1.72 9.39 6.5 11.92a2.66 2.66 0 0 1 1.32 2.49c.32 3.9 1 4.72 4.83 5.52a18.24 18.24 0 0 1 5.68 2c2.55 1.52 4.19 3.28 4.44 6.66.51 6.86 4 12 10.21 15.35A79.57 79.57 0 0 1 58.36 464a2.93 2.93 0 0 0 4.15.18l.24-.24a58.8 58.8 0 0 1 13.37-8.66c6.3-3 10.09-8.16 10.51-15.07.28-4.6 3.07-6.34 6.45-7.93a10.82 10.82 0 0 1 3.71-1c3.21-.23 4.5-2.24 4.85-5a4.67 4.67 0 0 1 2.35-3.7c4-2.7 5.27-6.87 5.32-11.5.15-13.42.37-26.83.43-40.25.31-71.61.15-143.21 0-214.81 0-19.67-.33-39.33-.38-59 0-5.43-1.4-10-6.36-12.85-1.15-.66-1.13-1.78-1.27-2.87-.34-2.83-1.54-4.77-4.72-5.12a14 14 0 0 1-6-2c-2.47-1.53-4.19-3.22-4.47-6.64a17.46 17.46 0 0 0-10.07-15.05c-4.86-2.42-9.65-4.93-13.7-8.64-1.58-1.44-2.91-1.33-4.55.06a64.81 64.81 0 0 1-13.5 8.48c-5.86 2.9-9 7.89-10.09 14.28-1 5.73-4 8.63-9.82 9.54-3.9.64-4.86 1.64-5.18 5.64a2.76 2.76 0 0 1-1.35 2.51c-4.81 2.66-6.43 7-6.48 12.22q-.37 38.36-.77 76.67c-.11 9.6-.32 150.75-.49 160.33Z"
      />
      <path
        class="halo"
        :class="item_props.item_rarity"
        d="M10.54 333.58q.62 38.87 1.18 77.74c.08 5.06 1.72 9.39 6.5 11.92a2.66 2.66 0 0 1 1.32 2.49c.32 3.9 1 4.72 4.83 5.52a18.24 18.24 0 0 1 5.68 2c2.55 1.52 4.19 3.28 4.44 6.66.51 6.86 4 12 10.21 15.35A79.57 79.57 0 0 1 58.36 464a2.93 2.93 0 0 0 4.15.18l.24-.24a58.8 58.8 0 0 1 13.37-8.66c6.3-3 10.09-8.16 10.51-15.07.28-4.6 3.07-6.34 6.45-7.93a10.82 10.82 0 0 1 3.71-1c3.21-.23 4.5-2.24 4.85-5a4.67 4.67 0 0 1 2.35-3.7c4-2.7 5.27-6.87 5.32-11.5.15-13.42.37-26.83.43-40.25.31-71.61.15-143.21 0-214.81 0-19.67-.33-39.33-.38-59 0-5.43-1.4-10-6.36-12.85-1.15-.66-1.13-1.78-1.27-2.87-.34-2.83-1.54-4.77-4.72-5.12a14 14 0 0 1-6-2c-2.47-1.53-4.19-3.22-4.47-6.64a17.46 17.46 0 0 0-10.07-15.05c-4.86-2.42-9.65-4.93-13.7-8.64-1.58-1.44-2.91-1.33-4.55.06a64.81 64.81 0 0 1-13.5 8.48c-5.86 2.9-9 7.89-10.09 14.28-1 5.73-4 8.63-9.82 9.54-3.9.64-4.86 1.64-5.18 5.64a2.76 2.76 0 0 1-1.35 2.51c-4.81 2.66-6.43 7-6.48 12.22q-.37 38.36-.77 76.67c-.11 9.6-.32 150.75-.49 160.33Z"
      />
    </g>
  </svg>
  <div class="container-item-image" :class="item_props.item_type">
    <img class="item-image" :class="item_props.item_type + ' ' + item_props.item_rarity" :src="item_props.image_url" />
  </div>
  <div class="container-item-props">
    <div v-if="item_props.item_label !== ''" class="item-label">{{ item_props.item_label }}</div>
    <img class="item-type-image" :src="item_props.item_type_image" />
    <img class="item-rarity-image" :src="item_props.item_rarity_image" />
  </div>
</div>`;

export default defineComponent({
  name: "gacha-box",
  template: template,
  props: {
    data: Object,
    fives: Object,
    isStat: Boolean,
  },
  setup(props) {
    // noinspection NonAsciiCharacters
    const typeMapping = {
      角色: "character",
      武器: "weapon",
    };
    const rarityMapping = {
      5: "Five",
      4: "Four",
      3: "Three",
    };

    let item_props = {};
    const imageType = typeMapping[props.data.item_type] || "character";
    const imageName = props.data.item_name;
    const itemTypeImage = props.data.type;
    const itemRarity = rarityMapping[props.data.star] || "Four";
    const itemLabel =
      props.data.star === 5 ? "「" + props.data.times + "抽」" : props.isStat ? "「" + props.data.count + "次」" : "";
    const iconType = props.data.item_type === "角色" ? "element" : "type";
    // 临时用来处理图像格式不同的问题
    const extName = imageType === "character" ? "webp" : "png";
    item_props.item_type = imageType;
    item_props.image_url = encodeURI(
      `http://localhost:9934/resources/Version2/wish/${imageType}/${imageName}.${extName}`
    );
    item_props.item_rarity = itemRarity;
    item_props.item_type_image = encodeURI(`http://localhost:9934/resources/gacha/${iconType}/${itemTypeImage}.png`);
    item_props.item_rarity_image = encodeURI(`http://localhost:9934/resources/gacha/items/${itemRarity}Star.png`);
    item_props.item_label = itemLabel;

    return {
      item_props,
    };
  },
});
