const template = `<div class="exploration">
  <div class="exp-area">
    <img v-if="isSilveryIcon" class="logo" :src="areaLogo" alt="Error"/>
    <div v-else class="logo self-managed" :style="{maskImage : 'url(' + areaLogo + ')', maskSize: '64px'}"></div>
    <div class="container-detailedExploration">
      <p>探索进度</p>
      <p class="align-right">{{explorationPercentage}}%</p>
      <p v-if="data.type === 'Reputation'">声望等级</p>
      <p class="align-right" v-if="data.type === 'Reputation'">Lv. {{data.level}}</p>
      <p v-if="data.offerings.length !== 0">{{data.offerings[0]["name"]}}</p>
      <p class="align-right" v-if="data.offerings.length !== 0">Lv. {{data.offerings[0]["level"]}}</p>
    </div>
   </div>
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

export default defineComponent({
  name: "ExplorationBox",
  template,
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

    const silveryLogos = ["mengde", "liyue", "dragonspine", "daoqi"];

    function getIconUri(rawUri) {
      const icon_filename = rawUri.split("_").slice(-1)[0].split(".").slice(0)[0];
      let iconUri, isSilveryLogos;
      if (logo_mapping[icon_filename.toLowerCase()]) {
        iconUri = `http://localhost:9934/resources/Version2/area/${logo_mapping[icon_filename.toLowerCase()]}.png`;
        isSilveryLogos = silveryLogos.includes(icon_filename.toLowerCase());
      } else {
        iconUri = rawUri;
        isSilveryLogos = false;
      }
      return [iconUri, isSilveryLogos];
    }
    const [areaLogo, isSilveryIcon] = getIconUri(props.data.icon);

    const explorationPercentage = parseInt(props.data.exploration_percentage) / 10;

    return { areaLogo, isSilveryIcon, explorationPercentage };
  },
});
