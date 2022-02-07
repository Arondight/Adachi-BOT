import { html } from "../common/html.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

const template = html`
  <div class="epitome">
    <div class="epitome-status">
      当前<span v-if="!epitomizedPath.hasPath">没有</span>定轨<span v-if="epitomizedPath.hasPath" class="path-name"
        >{{ epitomizedPath.course.name }}</span
      >
    </div>
    <div class="epitome-label">命定值</div>
    <div class="bar-full"></div>
    <div class="bar-progress" :style="{width: getWidth(epitomizedPath.fate, 2, 70)}"></div>
    <div class="container-epitome-data">
      <span v-if="epitomizedPath.hasPath">{{ epitomizedPath.fate }}</span><span v-else>0</span>/2
    </div>
  </div>
`;
export default defineComponent({
  name: "epitomeIndicator",
  props: {
    data: Object,
  },
  template: template,
  methods: {
    getWidth(current, max, parentWidth) {
      return Math.min((parentWidth * current) / max, 66) + "px";
    },
  },
  setup(props) {
    let epitomizedPath = props.data;

    epitomizedPath.fate = epitomizedPath.fate > 2 ? 0 : epitomizedPath.fate;

    return {
      epitomizedPath,
    };
  },
});
