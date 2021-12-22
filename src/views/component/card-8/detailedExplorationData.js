const template = `<p>{{ index }}</p>
<p>{{ data }}</p>
`;

const { defineComponent } = Vue;

export default defineComponent({
  name: "detailedExplorationData",
  template,
  props: {
    data: Object,
    index: Object,
  },
});
