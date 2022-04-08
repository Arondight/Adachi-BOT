import { html } from "#views/component/common/utils";

const { defineComponent } = window.Vue;

const briefingTemplate = html` <div class="banner-title abyss-chamber-title"></div> `;

const abyssBriefFloor = defineComponent({
  template: briefingTemplate,
  props: {
    data: Object,
  },
  methods: {
    sideImageToFront(imageURL) {
      return encodeURI(imageURL.replace(/_side/gi, ""));
    },
  },
  // eslint-disable-next-line no-unused-vars
  setup(props) {
    return {};
  },
});

export { abyssBriefFloor };
