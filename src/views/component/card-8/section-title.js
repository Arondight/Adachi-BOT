const template = `<div class="section-title">
  <div class="title">
    <img
      class="icon"
      src="http://localhost:9934/resources/Version2/module/user-base-title-icon.png"
      alt="ERROR"
    />
    <span class="content">{{ title }}</span>
  </div>
  <img
    class="split-line"
    src="http://localhost:9934/resources/Version2/module/user-base-split-line.png"
    alt="ERROR"
  />
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

export default defineComponent({
  name: "SectionTitle",
  template,
  props: {
    title: String,
  },
});
