import { html } from "../common/utils.js";

const { defineComponent } = window.Vue;
const template = html`<div class="container-overview-infos">
  <div class="container-deco-strip">
    <div class="deco-strip">{{ decoStripContent }}</div>
  </div>
  <div class="info-name">{{ weaponInfo.weaponFullName }}</div>
  <img class="profile-image" :src="weaponImageUrl" :alt="weaponImageFilename" />
  <div class="weapon-infos">
    <p class="info-title"><span>获</span><span>取</span><span>方</span><span>式</span></p>
    <p class="info-content">{{ weaponInfo.accessMethod }}</p>
    <p class="info-title"><span>稀</span><span>有</span><span>度</span></p>
    <p class="info-content">{{ weaponInfo.rarity }}</p>
    <p class="info-title"><span>基</span><span>础</span><span>攻</span><span>击</span></p>
    <p class="info-content baseATK">{{ weaponInfo.baseATK }}</p>
    <p class="info-title"><span>突</span><span>破</span><span>属</span><span>性</span></p>
    <p class="info-content weapon-ascension-prop">{{ weaponInfo.ascensionProp }}</p>
    <p class="info-title"><span>突</span><span>破</span><span>加</span><span>成</span></p>
    <p class="info-content weapon-ascension-value">{{ weaponInfo.ascensionValue }}</p>
  </div>
  <div class="container-introduction">
    <p class="introduction" v-html="getStructuredContent(weaponInfo.description)"></p>
  </div>
  <div class="container-vertical">
    <div class="split-title">- 养成材料 -</div>
    <div class="char-progression-table">
      <p class="info-title table-materials material-title">
        <span>突</span><span>破</span><span>材</span><span>料</span>
      </p>
      <div class="table-materials limited-time-materials">
        <img
          class="materials"
          v-for="item in weaponInfo.limitedTimeAscensionMaterials"
          :src="getMaterialUrl(item)"
          :alt="item"
        />
        <p class="info-weekdays">{{ weaponInfo.weekdays }}</p>
      </div>
      <p class="info-title table-materials material-title">
        <span>突</span><span>破</span><span>材</span><span>料</span>
      </p>
      <div class="table-materials all-day-materials">
        <img
          class="materials"
          v-for="item in weaponInfo.allDayAscensionMaterials"
          :src="getMaterialUrl(item)"
          :alt="item"
        />
      </div>
    </div>
  </div>
  <div class="container-vertical">
    <div class="split-title">- {{ weaponInfo.skillName }} -</div>
    <div class="weapon-skill-info">
      <div class="info-content">
        <p class="weapon-skill-content" v-html="weaponInfo.skillEffect"></p>
      </div>
    </div>
  </div>
</div>`;

export default defineComponent({
  name: "weaponInfoBox",
  template: template,
  components: {},
  props: {
    data: Object,
  },
  methods: {
    getMaterialUrl(material) {
      return `http://localhost:9934/resources/Version2/info/image/${material}.png`;
    },
    getStructuredContent: (text) => `${text.replace(/\\n/g, "<br>")}`,
  },
  setup(props) {
    const params = props.data;
    const decoStripContent = "WEAPON INFORMATION - ".repeat(4);
    let weaponInfo = {};
    const weaponTitle = params.title + "・" || "";
    weaponInfo.weaponFullName = weaponTitle + params.name;
    const weaponImageFilename = params.name + ".png";
    const weaponImageUrl = `http://localhost:9934/resources/Version2/weapon/${weaponImageFilename}`;
    weaponInfo.accessMethod = params["access"] || "暂无信息";
    const rarity = parseInt(params.rarity) || 4;
    weaponInfo.rarity = "★".repeat(rarity);
    weaponInfo.baseATK = params.baseATK;
    weaponInfo.ascensionProp = params.mainStat || "暂无信息";
    weaponInfo.ascensionValue = params.mainValue || "暂无信息";
    weaponInfo.description = params.introduce || "暂无信息";
    weaponInfo.limitedTimeAscensionMaterials = params.ascensionMaterials[0] || [];
    weaponInfo.allDayAscensionMaterials = params.ascensionMaterials[1] || [];
    weaponInfo.weekdays = params.time || "【】";
    weaponInfo.skillName = params.skillName || "武器特殊效果";
    weaponInfo.skillEffect = params.skillContent || "暂无信息";

    return {
      decoStripContent,
      weaponTitle,
      weaponImageFilename,
      weaponImageUrl,
      weaponInfo,
    };
  },
});
