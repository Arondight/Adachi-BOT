import { html } from "../common/utils.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

const titleTemplate = html` <div class="container-title">
  <div class="title-content">
    <img class="arrow-left" src="http://localhost:9934/resources/Version2/components/title-arrow.svg" alt="ERROR" />
    <div class="main-title">{{ title }}</div>
    <img class="arrow-right" src="http://localhost:9934/resources/Version2/components/title-arrow.svg" alt="ERROR" />
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
  <div class="char-container" :style="{ 'background': 'no-repeat 100%/100% url(' + starBackground + ')' }">
    <img v-if="data.element !== 'None'" class="element" :src="element" alt="ERROR" />
    <div class="constellation" :class="data.constellationNum === 6 ? 'max-constellation' : ''">
      {{ data.constellationNum }}
    </div>
    <img v-if="hasCostume" class="main" :src="costumePath" alt="ERROR" />
    <img v-else class="main" :src="data.icon" alt="ERROR" />
  </div>
  <div class="char-info">
    <div class="container-char-info character-briefing">
      <span class="char-level">Lv.{{ data.level }}</span>
      <span class="char-fetter">好感{{ data.fetter }}</span>
    </div>
    <div class="container-char-info weapon-briefing">
      <span class="weapon-name">{{ data.weapon.name }}</span>
      <span class="weapon-affix"> 精{{ data.weapon.affix_level }}</span>
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
    const starBackground = encodeURI(
      `http://localhost:9934/resources/Version2/thumb/stars/${props.data.rarity}-Star.png`
    );
    const element = encodeURI(`http://localhost:9934/resources/gacha/element/${props.data.element.toLowerCase()}.png`);
    const getCostume = (costumeName) =>
      encodeURI(`http://localhost:9934/resources/Version2/costumes/avatars/${costumeName}.png`);

    const hasCostume = props.data.costumes.length !== 0;
    const costumePath = hasCostume ? getCostume(props.data.costumes[0]["name"]) : "";

    return { starBackground, element, hasCostume, costumePath };
  },
});

const explorationBoxTemplate = html` <div class="exploration">
  <div class="exp-area">
    <div class="logo" :style="{maskImage : 'url(' + areaLogo + ')'}"></div>
    <div class="container-detailedExploration">
      <p>探索进度</p>
      <p class="align-right">{{ explorationPercentage }}%</p>
      <p v-if="data.type === 'Reputation'">声望等级</p>
      <p class="align-right" v-if="data.type === 'Reputation'">Lv. {{ data.level }}</p>
      <p v-if="data.offerings.length !== 0">{{ data.offerings[0]["name"] }}</p>
      <p class="align-right" v-if="data.offerings.length !== 0">Lv. {{ data.offerings[0]["level"] }}</p>
    </div>
  </div>
</div>`;

const ExplorationBox = defineComponent({
  name: "ExplorationBox",
  template: explorationBoxTemplate,
  props: {
    data: Object,
  },
  setup(props) {
    const logo_mapping = {
      mengde: "mondstadt",
      liyue: "liyue",
      dragonspine: "dragonspine",
      daoqi: "inazuma",
      enkanomiya: "enkanomiya",
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

    const areaLogo = getIconUri(props.data.icon);
    const explorationPercentage = parseInt(props.data.exploration_percentage) / 10;

    return { areaLogo, explorationPercentage };
  },
});

const homeBoxTemplate = html` <div class="home-box">
  <img class="home-background" :src="backgroundImage" alt="ERROR" />
  <div class="unlock" v-if="data.level !== -1">
    <div class="box-block unlock-content-block">
      <p class="box-content comfort-levelname">{{ data.name }}</p>
      <p class="box-content comfort-level">{{ data.comfort_level_name }}</p>
    </div>
  </div>
  <div class="locked" v-else>
    <div class="locked-content-block">
      <img class="lock-icon" :src="lockIcon" alt="ERROR" />
    </div>
  </div>
</div>`;

const HomeBox = defineComponent({
  name: "HomeBox",
  template: homeBoxTemplate,
  props: {
    data: Object,
  },
  setup(props) {
    const backgroundImage = `http://localhost:9934/resources/item/${props.data.name}.png`;
    const lockIcon = "http://localhost:9934/resources/item/lock.png";

    return { backgroundImage, lockIcon };
  },
});

export { CharacterBox, ExplorationBox, HomeBox, SectionTitle };
