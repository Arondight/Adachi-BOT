import { html } from "../common/utils.js";

const { defineComponent, unref } = window.Vue;
const constellTemplate = html`
  <div v-if="constellContent !== ''" class="info-title constellation-order">{{constellCounts}}</div>
  <div v-if="constellContent !== ''" class="info-content constellations">{{constellContent}}</div>
`;
const constellBox = defineComponent({
  name: "constellBox",
  props: {
    constellCounts: String,
    constellContent: String,
  },
  template: constellTemplate,
});

const template = html` <div class="container-overview-infos">
  <div class="container-deco-strip">
    <div class="deco-strip">{{ decoStripContent }}</div>
  </div>
  <div class="info-name">{{ charInfo.charFullName }}</div>
  <img class="profile-image" :src="charImageUrl" :alt="charImageFilename" />
  <div class="char-infos">
    <p class="info-title"><span>生</span><span>日</span></p>
    <p class="info-content">{{ charInfo.birthday }}</p>
    <p class="info-title"><span>神</span><span>之</span><span>眼</span></p>
    <p class="info-content">{{ charInfo.vision }}</p>
    <p class="info-title"><span>中</span><span>配</span></p>
    <p class="info-content">{{ charInfo.cvCN }}</p>
    <p class="info-title"><span>日</span><span>配</span></p>
    <p class="info-content">{{ charInfo.cvJP }}</p>
    <p class="info-title"><span>命</span><span>之</span><span>座</span></p>
    <p class="info-content">{{ charInfo.constellation }}</p>
    <p class="info-title"><span>稀</span><span>有</span><span>度</span></p>
    <p class="info-content">{{ charInfo.rarity }}</p>
    <p class="info-title"><span>基</span><span>础</span><span>攻</span><span>击</span></p>
    <p class="info-content baseATK">{{ charInfo.baseATK }}</p>
    <p class="info-title"><span>突</span><span>破</span><span>属</span><span>性</span></p>
    <p class="info-content">{{ charInfo.ascensionProp }}</p>
    <p class="info-title"><span>突</span><span>破</span><span>加</span><span>成</span></p>
    <p class="info-content">{{ charInfo.ascensionValue }}</p>
  </div>
  <div class="container-introduction">
    <div class="container-intro-info">
      <p class="introduction">{{ charInfo.introduction }}</p>
    </div>
    <div
      class="container-passive-talent"
      v-if="showPassive && charInfo.passiveTalent !== '' && charInfo.passiveDesc !== ''"
    >
      <p class="passive-talent title">{{charInfo.passiveTitle}}</p>
      <p class="passive-talent content">{{charInfo.passiveDesc}}</p>
    </div>
  </div>
  <div class="container-vertical">
    <div class="split-title">- 养成材料 -</div>
    <div class="char-progression-table">
      <p class="info-title table-materials material-title">
        <span>升</span><span>级</span><span>材</span><span>料</span>
      </p>
      <div class="table-materials all-day-materials">
        <img class="materials" v-for="item in charInfo.levelUpMaterials" :src="getMaterialUrl(item)" :alt="item" />
      </div>
      <p class="info-title table-materials material-title">
        <span>天</span><span>赋</span><span>材</span><span>料</span>
      </p>
      <div class="table-materials limited-time-materials">
        <img class="materials" v-for="item in charInfo.talentMaterials" :src="getMaterialUrl(item)" :alt="item" />
        <p class="info-weekdays">{{ charInfo.weekdays }}</p>
      </div>
      <p class="info-title table-materials material-title">
        <span>突</span><span>破</span><span>材</span><span>料</span>
      </p>
      <div class="table-materials all-day-materials">
        <img class="materials" v-for="item in charInfo.ascensionMaterials" :src="getMaterialUrl(item)" :alt="item" />
      </div>
    </div>
  </div>
  <div class="container-vertical">
    <div class="split-title">- 命座信息 -</div>
    <div class="constellation-table">
      <constellBox
        v-for="(value, index) in charInfo.constellationEffects"
        :constellCounts="charInfo.constellationCount[index]"
        :constellContent="value"
      />
    </div>
  </div>
</div>`;

export default defineComponent({
  name: "characterInfoBox",
  template: template,
  components: {
    constellBox,
  },
  props: {
    data: Object,
  },
  methods: {
    getMaterialUrl(material) {
      return `http://localhost:9934/resources/Version2/info/image/${material}.png`;
    },
  },
  setup(props) {
    const propsValue = unref(props);
    const params = propsValue.data;

    const charImageFilename = params.id + ".png";
    const charImageUrl = `http://localhost:9934/resources/Version2/character/${charImageFilename}`;
    const charTitle = params.title.trim() === "" ? "" : params.title + "・" || "";
    const decoStripContent = "PERSONAL INFORMATION - ".repeat(4);
    const rarity = parseInt(params.rarity) || 4;
    const showPassive = false;

    const charInfo = {
      ascensionMaterials: params.ascensionMaterials || [],
      ascensionProp: params.mainStat || "暂无信息",
      ascensionValue: params.mainValue || "暂无信息",
      baseATK: params.baseATK || "暂无信息",
      birthday: params.birthday || "",
      charFullName: charTitle + params.name,
      constellation: params.constellationName || "",
      constellationCount: ["一", "二", "三", "四", "五", "六"],
      constellationEffects: params.constellations,
      cvCN: params.cvCN,
      cvJP: params.cvJP,
      introduction: params.introduce || "暂无信息",
      levelUpMaterials: params.levelUpMaterials || [],
      passiveDesc: params.passiveDesc || "",
      passiveTitle: "固有天赋・" + params.passiveTitle || "",
      rarity: "★".repeat(rarity),
      talentMaterials: params.talentMaterials || [],
      vision: params.element || "",
      weekdays: params.time || "【】",
    };

    if (4 === charInfo.constellationEffects.length) {
      [2, 4].forEach((i) => charInfo.constellationEffects.splice(i, 0, ""));
    }

    return {
      decoStripContent,
      charTitle,
      charImageFilename,
      charImageUrl,
      charInfo,
      showPassive,
    };
  },
});
