const template = `<div class="exploration" :class="Object.keys(data.prop).length === 2 ? 'two' : 'three'">
  <img
    class="exp-bg"
    src="https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/module/user-nase-exp-bg.png"
    alt="ERROR"
  />
  <div class="exp-area">
    <img class="logo" :src="areaLogo" alt="ERROR" />
    <div class="prop">
      <div class="prop-name">
        <p v-for="(_, item) in data.prop" class="item">
          <span>{{ item }}</span>
        </p>
      </div>
      <div class="prop-value">
        <p v-for="v in data.prop" class="item">
          <span>{{ v }}</span>
        </p>
      </div>
    </div>
  </div>
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;

export default defineComponent({
  name: "ExplorationBox",
  template,
  props: {
    data: Object,
  },
  setup(props) {
    const areaLogo = computed(() => `http://localhost:9934/resources/Version2/area/${props.data.name}.png`);

    return { areaLogo };
  },
});
