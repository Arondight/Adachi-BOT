const template = `<div class="character-box">
  <div class="char-container">
    <img class="background" :src="starBackground" alt="ERROR" />
    <img class="element" :src="element" alt="ERROR" />
    <img class="main" :src="data.icon" alt="ERROR" />
  </div>
  <div class="char-info">
    <div>
      <span class="level">Lv.{{ data.level }}</span>
      <span class="fetter">❤{{ data.fetter }}</span>
    </div>
    <div>
      <span class="weapon-name">{{ data.weapon.name }}</span>
      <span class="weapon-affix">★{{ data.weapon.affix_level }}</span>
    </div>
  </div>
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;

export default defineComponent({
  name: "CharacterBox",
  template,
  props: {
    data: Object,
  },
  setup(props) {
    const starBackground = computed(() => {
      const star = props.data.rarity;
      return `http://localhost:9934/resources/Version2/thumb/stars/${star}-Star.png`;
    });
    const element = computed(() => {
      const el = props.data.element.toLowerCase();
      return `http://localhost:9934/resources/gacha/element/${el}.png`;
    });

    return { starBackground, element };
  },
});
