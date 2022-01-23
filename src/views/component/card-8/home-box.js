import { html } from "../common/html.js";

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;
const template = html`<div class="home-box">
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

export default defineComponent({
  name: "HomeBox",
  template,
  props: {
    data: Object,
  },
  setup(props) {
    const backgroundImage = computed(() => `http://localhost:9934/resources/item/${props.data.name}.png`);
    const lockIcon = computed(() => "http://localhost:9934/resources/item/lock.png");

    return { backgroundImage, lockIcon };
  },
});
