const template = `<div class="exploration">
  <div class="exp-area">
    <img class="logo" :src="areaLogo" alt="ERROR" />
    <div class="container-detailedExploration">
      <detailedExplorationData v-for="(key, index) in data.prop" :data="key, index"></detailedExplorationData>
    </div>
   </div>
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;

import detailedExplorationData from "./detailedExplorationData.js";

export default defineComponent({
  name: "ExplorationBox",
  template,
  props: {
    data: Object,
  },
  components: {
    detailedExplorationData,
  },
  setup(props) {
    const areaLogo = computed(() => `http://localhost:9934/resources/Version2/area/${props.data.name}.png`);

    return { areaLogo };
  },
});
