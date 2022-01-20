const template = `
<div class="gacha-box" :style="{ backgroundImage: 'url(' + item_props.item_rarity_background + ')' }" >
  <img class="item-image" :src="item_props.image_url" />
  <div class="container-item-props">
    <div v-if="item_props.item_label !== ''" class="item-label">{{item_props.item_label}}</div>
    <img class="item-type-image" :src="item_props.item_type_image" />
    <img class="item-rarity-image" :src="item_props.item_rarity_image" />
  </div>
</div>
`;

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

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
    const imageType = typeMapping[props.data.item_type] || "角色";
    const imageName = props.data.item_name;
    const itemTypeImage = props.data.type;
    const itemRarity = rarityMapping[props.data.star] || "Four";
    const itemLabel =
      props.data.star === 5
        ? "「" + props.fives.find((el) => el.item_name === imageName)["times"] + "抽」"
        : props.isStat
        ? "「" + props.data.count + "次」"
        : "";
    const iconType = props.data.item_type === "角色" ? "element" : "type";

    item_props.image_url = `http://localhost:9934/resources/Version2/wish/${imageType}/${imageName}.png`;
    item_props.item_rarity = itemRarity;
    item_props.item_type_image = `http://localhost:9934/resources/gacha/${iconType}/${itemTypeImage}.png`;
    item_props.item_rarity_image = `http://localhost:9934/resources/gacha/items/${itemRarity}Star.png`;
    item_props.item_rarity_background = `http://localhost:9934/resources/gacha/items/${itemRarity}Background.png`;
    item_props.item_label = itemLabel;

    return {
      item_props,
    };
  },
});
