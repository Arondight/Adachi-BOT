import { html } from "../common/utils.js";

const { defineComponent } = window.Vue;
const titleTemplate = html` <div class="container-title">
  <div class="title-content">
    <img
      class="arrow-left"
      src="http://localhost:9934/resources/Version2/components/title-decoration.svg"
      alt="ERROR"
    />
    <div class="main-title">{{ title }}</div>
    <img
      class="arrow-right"
      src="http://localhost:9934/resources/Version2/components/title-decoration.svg"
      alt="ERROR"
    />
    <div class="subtitle" v-show="subtitle">{{ subtitle }}</div>
  </div>
</div>`;
const SectionTitle = defineComponent({
  name: "SectionTitle",
  template: titleTemplate,
  props: {
    title: String,
    subtitle: [String, Boolean],
  },
});
const charBoxTemplate = html` <div class="character-box">
  <div class="container-char-headups">
    <img v-if="data.element !== 'None'" class="element" :src="element" alt="ERROR" />
    <div class="constellation" :class="data.constellationNum === 6 ? 'max-constellation' : ''">
      {{ data.constellationNum }}
    </div>
  </div>
  <img
    v-if="hasCostume"
    class="main"
    :src="costumePath"
    :style="{ 'background-image': 'url(' + starBackground + ')' }"
    alt="ERROR"
  />
  <img
    v-else
    class="main"
    :src="data.icon"
    :style="{ 'background-image': 'url(' + starBackground + ')' }"
    alt="ERROR"
  />

  <div class="char-info">
    <div class="container-char-info character-briefing">
      <span class="char-level">Lv.{{ data.level }}</span>
      <span v-if="'旅行者' !== data.name" class="char-fetter">好感{{ data.fetter }}</span>
    </div>
    <div class="container-char-info weapon-briefing" :style="additionalStyle">
      <span class="weapon-name">{{ data.weapon.name }}</span>
      <span class="weapon-affix">精{{ data.weapon.affix_level }}</span>
    </div>
  </div>
</div>`;
const CharacterBox = defineComponent({
  name: "CharacterBox",
  template: charBoxTemplate,
  props: {
    data: Object,
  },
  setup(props) {
    function getCostume(costumeName) {
      return encodeURI(`http://localhost:9934/resources/Version2/costumes/avatars/${costumeName}.png`);
    }

    const starBackground = encodeURI(
      `http://localhost:9934/resources/Version2/thumb/stars/${props.data.rarity}-Star.png`
    );
    const element = encodeURI(`http://localhost:9934/resources/gacha/element/${props.data.element.toLowerCase()}.png`);
    const hasCostume = props.data.costumes.length !== 0;
    const costumePath = hasCostume ? getCostume(props.data.costumes[0]["name"]) : "";

    const weaponNameLength = props.data.weapon.name.length || 5;
    const additionalStyle = weaponNameLength > 5 ? "font-size: 9px;" : undefined;

    return { starBackground, element, hasCostume, costumePath, additionalStyle };
  },
});
const explorationBoxTemplate = html` <div class="exploration">
  <div class="exp-area">
    <div class="logo" :style="{maskImage : 'url(' + areaLogo + ')'}"></div>
    <div class="container-detailed-exploration" :style="{'grid-template-rows': getGridRowCount(data.displayData)}">
      <p v-for="key in Object.keys(data.displayData)">{{key}}</p>
      <p v-for="value in Object.values(data.displayData)">{{value}}</p>
    </div>
  </div>
</div>`;
const ExplorationBox = defineComponent({
  name: "ExplorationBox",
  template: explorationBoxTemplate,
  props: {
    data: Object,
  },
  methods: {
    getGridRowCount(object) {
      const count = Object.keys(object).length;
      return `repeat(${count}, 1fr)`;
    },
  },
  setup(props) {
    const logo_mapping = {
      mengde: "mondstadt",
      liyue: "liyue",
      dragonspine: "dragonspine",
      daoqi: "inazuma",
      enkanomiya: "enkanomiya",
      chasmsmaw: "chasm",
    };

    function getIconUri(rawUri) {
      const icon_filename = rawUri.split("_").slice(-1)[0].split(".").slice(0)[0];
      let iconUri;
      if (logo_mapping[icon_filename.toLowerCase()]) {
        iconUri = encodeURI(
          `http://localhost:9934/resources/Version2/area/${logo_mapping[icon_filename.toLowerCase()]}.png`
        );
      } else {
        iconUri = rawUri;
      }
      return iconUri;
    }

    const areaLogo = getIconUri(props.data.iconUrl);

    return { areaLogo };
  },
});

export { CharacterBox, ExplorationBox, SectionTitle };
