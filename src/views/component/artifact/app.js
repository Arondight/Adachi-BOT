import { getParams, html } from "../common/utils.js";

const { defineComponent } = window.Vue;
const template = html`
  <p class="title absolute-position">{{artifactData.name}}</p>
  <p class="position absolute-position">{{artifactData.position}}</p>
  <img class="artifact-image absolute-position" :src="artifactData.imageLink" />
  <div class="container-main-stats absolute-position">
    <p class="main-stat">{{artifactData.mainStatText}}</p>
    <p class="main-value">{{artifactData.mainValue}}</p>
  </div>
  <img class="rarity absolute-position" src="http://localhost:9934/resources/item/rarity.png" />
  <p class="level absolute-position">+{{artifactData.level}}</p>
  <ul class="container-sub-properties absolute-position">
    <li class="sub-property" v-for="property in artifactData.subProps">{{property.name}}+{{property.data}}</li>
  </ul>
`;

export default defineComponent({
  name: "genshinArtifact",
  template: template,
  setup() {
    function getLink(id, slotPosition) {
      return "http://localhost:9934/resources/Version2/artifact/" + id + "/" + slotPosition + ".png";
    }

    const params = getParams(window.location.href);
    const artifactID = params.base.artifactID || 0;
    const artifactSlot = params.base.slot || 0;
    const artifactData = {
      name: params.base.name || "",
      position: params.base.slotName || "",
      imageLink: getLink(artifactID, artifactSlot),
      mainStatText: params.mainStatText || "",
      mainValue: params.mainValue || "",
      level: params.base.level || 0,
      subProps: params.data || [],
    };

    return {
      artifactData,
    };
  },
});
