import { html } from "../common/utils.js";

const { defineComponent } = window.Vue;

const titleTemplate = html`
  <div class="title-content">
    <img
      class="arrow-left"
      src="http://localhost:9934/resources/Version2/components/title-decoration.svg"
      alt="components/title-decoration.svg"
    />
    <div class="abyss-chamber-type-title">{{ title }}</div>
    <img
      class="arrow-right"
      src="http://localhost:9934/resources/Version2/components/title-decoration.svg"
      alt="components/title-decoration.svg"
    />
  </div>
`;

const challengeTitle = defineComponent({
  name: "challengeTitle",
  template: titleTemplate,
  props: {
    title: String,
  },
});

const showboxTemplate = html`
  <div class="container-character" :class="additionalClass">
    <img class="avatar-face" :class="rarity" :src="avatarIcon" alt="加载图片失败" />
    <p class="showbox-label">{{label}}</p>
  </div>
`;

const characterShowbox = defineComponent({
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

export { challengeTitle, characterShowbox };
