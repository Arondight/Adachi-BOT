import { getParams, html } from "../common/utils.js";

const { defineComponent } = window.Vue;
const barTemplate = html`
  <div class="container-bar">
    <p class="bar-title">命之座</p>
    <div class="bar-full constellation">
      <div
        class="bar-dot"
        v-for="i in 7"
        :class="(i > constellationNum + 1 && i != 7 && i != 1) ? 'dot-show' : 'dot-hide'"
      ></div>
      <div
        class="bar-progress"
        :class="constellationNum == 6 ? 'max' : 'normal'"
        :style="{width: getWidth(constellationNum, 6, 300)}"
      ></div>
    </div>
    <p class="bar-details">{{constellationNum}}<span>/</span>6</p>
    <p class="bar-title">好感度</p>
    <div class="bar-full fetter">
      <div
        class="bar-dot"
        v-for="i in 11"
        :class="(i > fetter + 1 && i != 11 && i != 1) ? 'dot-show' : 'dot-hide'"
      ></div>
      <div class="bar-progress normal" :style="{width: getWidth(fetter, 10, 300)}"></div>
    </div>
    <p class="bar-details">{{fetter}}<span>/</span>10</p>
  </div>
`;
const barInfos = defineComponent({
  name: "barInfos",
  template: barTemplate,
  props: {
    fetter: [String, Number],
    constellationNum: [String, Number],
  },
  methods: {
    getWidth(current, max, parentWidth) {
      return (parentWidth * current) / max + "px";
    },
  },
  setup(props) {
    return {
      // eslint-disable-next-line vue/no-dupe-keys
      fetter: props.fetter || 0,
      // eslint-disable-next-line vue/no-dupe-keys
      constellationNum: props.constellationNum || 0,
    };
  },
});

const artifactBoxTemplate = html`
  <div class="box-title artifact-position">{{position}}</div>
  <div v-if="!isEmpty" class="info-content artifact-content">
    <img class="artifact-icon" :class="rarityClass" :src="iconUrl" :alt="name" />
    <div class="artifact-details">
      <div class="artifact-name">{{name}}</div>
      <div class="artifact-level">{{enhancementLevel}}</div>
      <div class="artifact-rarity">{{rarity}}</div>
    </div>
  </div>
  <div v-else class="info-content empty-artifact-content">
    <div class="artifact-empty">暂未装备</div>
  </div>
`;
const artifactBox = defineComponent({
  name: "artifactBox",
  props: {
    data: Object,
  },
  template: artifactBoxTemplate,
  setup(props) {
    const params = props.data;
    const artifactPosition = {
      1: "生之花",
      2: "死之羽",
      3: "时之沙",
      4: "空之杯",
      5: "理之冠",
    };
    const rarityString = {
      5: "rarity-five",
      4: "rarity-four",
      3: "rarity-three",
      2: "rarity-two",
      1: "rarity-one",
    };
    const position = artifactPosition[params.pos];
    const isEmpty = params.name === "empty";
    const iconUrl = params.icon;
    const name = params.name;
    const enhancementLevel = "+" + params.level.toString() || "+0";
    const rarity = "★".repeat(params.rarity) || "★★★★";
    const rarityClass = rarityString[params.rarity] || "rarity-four";

    return {
      position,
      isEmpty,
      iconUrl,
      name,
      enhancementLevel,
      rarity,
      rarityClass,
    };
  },
});
const template = html` <div class="background" :class="charElementType">
  <img class="svg" :src="elementSvgSrc" />
  <div class="container-deco-strip">{{ decoStripContent }}</div>
  <div class="container-character-infos">
    <div class="page-title"><span>{{ uid }}</span>的{{characterInfo.charName}}</div>
    <div class="character-level-ring" :style="{background: getLevelStyle(characterInfo.level)}">
      <img class="profile-image" :src="characterInfo.imagePath" :alt="characterInfo.imageFilename" />
    </div>
    <barInfos :fetter="characterInfo.fetter" :constellationNum="characterInfo.constellationNum" />
    <div class="container-vertical">
      <div class="split-title">- 武器 -</div>
      <div class="weapon-table">
        <div class="box-title" v-html="weaponInfo.type"></div>
        <div class="info-content container-weapon-info">
          <div class="weapon-level-ring" :style="{background: getWeaponLevelStyle(weaponInfo.level)}">
            <img
              class="weapon-icon"
              :class="weaponInfo.rarityClass"
              :src="weaponInfo.imageUrl"
              :alt="weaponInfo.imageName"
            />
          </div>
          <div class="weapon-details">
            <div class="weapon-name">{{weaponInfo.name}}</div>
            <div class="weapon-affix" :class="weaponInfo.affixLevel === 5 ? 'max' : ''">
              精炼<span class="affix-value">{{weaponInfo.affixLevel}}</span>
            </div>
            <div class="weapon-rarity">{{weaponInfo.rarity}}</div>
            <div class="weapon-desc" v-html="getStructuredContent(weaponInfo.desc)"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-vertical">
      <div class="split-title">- 圣遗物 -</div>
      <div class="artifact-table">
        <artifactBox v-for="i in characterInfo.artifacts" :data="i" />
      </div>
    </div>
  </div>
  <div class="credit">Created by Adachi-BOT</div>
</div>`;

export default defineComponent({
  name: "genshinCharacter",
  template: template,
  components: {
    barInfos,
    artifactBox,
  },
  methods: {
    getLevelStyle: (level) => {
      const percentage = (level / 90) * 100;
      return `conic-gradient(#efeae3 0, #efeae3 ${percentage - 0.02}%, rgba(255,255,255,0) ${percentage + 0.02}%)`;
    },
    getWeaponLevelStyle: (level) => {
      const percentage = (level / 90) * 100;
      return `conic-gradient(#efeae3 0, #efeae3 ${percentage - 0.1}%, rgba(255,255,255,0) ${percentage + 0.1}%)`;
    },
    getStructuredContent: (text) => `${text.replace(/\\n/g, "<br>")}`,
  },
  setup() {
    const params = getParams(window.location.href);
    const charElementType = params.data.element.toLowerCase() || "anemo";
    const elementSvgSrc = encodeURI(`http://localhost:9934/resources/Version2/elements/${charElementType}.svg`);
    const uid = params.uid;
    const character = params.data || {};
    let characterInfo = {};

    characterInfo.id = character.id || "";
    characterInfo.level = params.data.level || 1;
    const costumes = character.costumes || [];
    const characterHasCostume = costumes.length !== 0;
    characterInfo.hasCostume = characterHasCostume;
    characterInfo.costumeName = characterHasCostume ? character.costumes[0]["name"] : "";
    characterInfo.imagePath = characterHasCostume
      ? encodeURI(`http://localhost:9934/resources/Version2/costumes/splashes/${character.costumes[0]["name"]}.png`)
      : encodeURI("http://localhost:9934/resources/Version2/character/" + characterInfo.id + ".png");
    characterInfo.imageFilename = characterHasCostume
      ? `${character.costumes[0]["name"]}.png`
      : `${characterInfo.id}.png`;
    const decoStripContent = "CHARACTER INFORMATION - ".repeat(4);
    characterInfo.charName = character.name || "";
    characterInfo.constellationNum = character.constellationNum || 0;
    characterInfo.fetter = character.fetter || 0;

    let artifacts = [];

    for (let i = 0; i < 5; ++i) {
      const info = character.artifact.find((el) => el.pos === i + 1);
      artifacts[i] = info
        ? character.artifact.find((el) => el.pos === i + 1)
        : { name: "empty", icon: "empty", pos: i + 1, rarity: "empty", level: "empty" };
    }

    characterInfo.artifacts = artifacts;

    let weaponInfo = {};
    const weaponTypeToString = {
      sword: "单手剑",
      claymore: "双手剑",
      pole: "长柄<br>武器",
      bow: "弓",
      catalyst: "法器",
    };

    const weaponType = character.weapon.icon || "sword_sword";
    const weaponName = character.weapon.name || "";
    const weaponRarity = character.weapon.rarity || 4;
    const weaponAffixLevel = character.weapon.affix_level || "1";
    const weaponDesc = character.weapon.desc || "暂无描述";
    const weaponLevel = character.weapon.level || 1;

    const rarityString = {
      5: "rarity-five",
      4: "rarity-four",
      3: "rarity-three",
      2: "rarity-two",
      1: "rarity-one",
    };

    weaponInfo.name = weaponName;
    weaponInfo.type = weaponTypeToString[weaponType.split("_").slice(-2)[0].toLowerCase()];
    weaponInfo.imageUrl = encodeURI(`http://localhost:9934/resources/Version2/thumb/weapon/${weaponName}.png`);
    weaponInfo.imageName = `${weaponName}.png`;
    weaponInfo.rarityClass = rarityString[weaponRarity] || "rarity-four";
    weaponInfo.rarity = "★".repeat(weaponRarity) || "★★★★";
    weaponInfo.affixLevel = weaponAffixLevel;
    weaponInfo.desc = weaponDesc;
    weaponInfo.level = weaponLevel;

    return {
      charElementType,
      elementSvgSrc,
      decoStripContent,
      uid,
      characterInfo,
      weaponInfo,
    };
  },
});
