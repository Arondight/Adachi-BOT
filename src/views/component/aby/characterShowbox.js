import { html } from "../common/utils.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

const showboxTemplate = html`
  <div class="container-character" :class="additionalClass">
    <img class="avatar-face" :class="rarity" :src="avatarIcon" alt="加载图片失败" />
    <p class="showbox-label">{{label}}</p>
  </div>
`;

export default defineComponent({
  name: "characterShowbox",
  template: showboxTemplate,
  props: {
    data: Object,
    prefix: String,
    suffix: String,
    showType: String,
    htmlClass: String,
  },
  setup(props) {
    const rarityClassMap = {
      5: "star-five",
      4: "star-four",
    };
    const showType = props.showType;
    const avatarIcon = showType === "revealRank" ? encodeURI(props.data.avatar_icon) : encodeURI(props.data.icon);
    const rarity = rarityClassMap[props.data.rarity] || "star-four";
    const prefix = props.prefix || "";
    const suffix = props.suffix || "";
    const htmlClass = props.htmlClass || "";
    const label =
      showType === "revealRank"
        ? Object.prototype.hasOwnProperty.call(props.data, "value")
          ? prefix + props.data.value.toString() + suffix
          : ""
        : Object.prototype.hasOwnProperty.call(props.data, "level")
        ? prefix + props.data.level.toString() + suffix
        : "";
    const additionalClass = htmlClass;

    return {
      avatarIcon,
      rarity,
      label,
      additionalClass,
    };
  },
});
