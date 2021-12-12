const template = `<div class="material-column">
  <div class="title">{{ title }}</div>
  <MaterialUnit v-if="data.length !== 0" v-for="d in data" :data="d" :type="type" />
  <div v-else class="empty-box">今日没有可刷取材料的{{ type === "character" ? "角色" : "武器" }}</div>
</div>`;

import MaterialUnit from "./unit.js";

// eslint-disable-next-line no-undef
const { defineComponent, computed } = Vue;

export default defineComponent({
  name: "MaterialColumn",
  template,
  components: {
    MaterialUnit,
  },
  props: {
    data: Array,
    type: String,
    day: String,
  },
  setup(props) {
    const title = computed(() => {
      return `${props.day}${props.type === "weapon" ? "武器" : "角色"}素材`;
    });
    return { title };
  },
});
