import { html } from "../common/html.js";

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;
const template = html`<div class="character-box">
  <div class="char-container" :style="{ 'background': 'no-repeat 100%/100% url(' + starBackground + ')' }">
    <img v-if="data.element !== 'None'" class="element" :src="element" alt="ERROR" />
    <div class="constellation" :class="data.constellationNum === 6 ? 'max-constellation' : ''">
      {{ data.constellationNum }}
    </div>
    <img v-if="hasCostume" class="main" :src="costumePath" alt="ERROR" />
    <img v-else class="main" :src="data.icon" alt="ERROR" />
  </div>
  <div class="char-info">
    <div class="container-char-info">
      <span class="level">Lv.{{ data.level }}</span>
      <span class="fetter">❤{{ data.fetter }}</span>
    </div>
    <div class="container-char-info">
      <span class="weapon-name">{{ data.weapon.name }}</span>
      <span class="weapon-affix">★{{ data.weapon.affix_level }}</span>
    </div>
  </div>
</div>`;

export default defineComponent({
  name: "CharacterBox",
  template,
  props: {
    data: Object,
  },
  setup(props) {
    const starBackground = computed(() =>
      encodeURI(`http://localhost:9934/resources/Version2/thumb/stars/${props.data.rarity}-Star.png`)
    );
    const element = computed(() =>
      encodeURI(`http://localhost:9934/resources/gacha/element/${props.data.element.toLowerCase()}.png`)
    );

    function getCostume(costumeName) {
      return encodeURI(`http://localhost:9934/resources/Version2/costumes/avatars/${costumeName}.png`);
    }

    const hasCostume = props.data.costumes.length !== 0;

    const costumePath = hasCostume ? getCostume(props.data.costumes[0]["name"]) : "";

    return { starBackground, element, hasCostume, costumePath };
  },
});
