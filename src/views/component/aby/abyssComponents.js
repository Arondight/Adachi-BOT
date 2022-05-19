import { html } from "../common/utils.js";

const { defineComponent, unref } = window.Vue;

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
    const propsValue = unref(props);
    const rarityClassMap = {
      5: "star-five",
      4: "star-four",
    };
    const showType = propsValue.showType;
    const avatarIcon =
      showType === "revealRank" ? encodeURI(propsValue.data.avatar_icon) : encodeURI(propsValue.data.icon);
    const rarity = rarityClassMap[propsValue.data.rarity] || "star-four";
    const prefix = propsValue.prefix || "";
    const suffix = propsValue.suffix || "";
    const htmlClass = propsValue.htmlClass || "";
    const additionalClass = htmlClass;
    let label = "";

    if ("revealRank" === showType) {
      if ("string" === typeof propsValue.data.value) {
        label = prefix + propsValue.data.value.toString() + suffix;
      }
    } else {
      if ("string" === typeof propsValue.data.level) {
        label = prefix + propsValue.data.level.toString() + suffix;
      }
    }

    return {
      avatarIcon,
      rarity,
      label,
      additionalClass,
    };
  },
});

export { challengeTitle, characterShowbox };
