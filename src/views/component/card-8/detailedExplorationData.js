const template = `<p>{{ index }}</p>
<p>{{ data }}</p>`;

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

export default defineComponent({
  name: "detailedExplorationData",
  template,
  props: {
    data: String,
    index: String,
  },
});
