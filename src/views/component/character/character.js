// eslint-disable-next-line no-unused-vars
const background = {
  template: "#background",
  props: {
    uid: {
      type: Number,
    },
    character: {
      type: Number,
    },
    path: String,
  },
};

// eslint-disable-next-line no-unused-vars
const baseInfo = {
  template: "#base-info",
  data() {
    return {
      numberCN: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
    };
  },
  props: {
    name: {
      type: String,
    },
    element: {
      type: String,
    },
    level: {
      type: Number,
    },
    fetter: {
      type: Number,
    },
    constellation: {
      type: Number,
    },
  },
  computed: {
    fetterCN() {
      return this.numberCN[this.fetter];
    },
    constellationCN() {
      return this.numberCN[this.constellation];
    },
  },
};

const artifact = {
  template: "#artifact",
  props: {
    detail: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    rarity() {
      const star = "★";
      return star.repeat(this.detail.rarity);
    },
  },
};

const emptyBox = {
  template: "#empty-box",
  props: ["pos"],
  computed: {
    image() {
      return "http://localhost:9934/resources/Version2/artifact/other/" + this.pos + ".png";
    },
  },
};

// eslint-disable-next-line no-unused-vars
const reliquaries = {
  template: "#reliquaries",
  props: {
    artifacts: {
      type: Array,
    },
  },
  components: {
    artifact,
    emptyBox,
  },
};

// eslint-disable-next-line no-unused-vars
const weaponBox = {
  template: "#weapon-box",
  props: {
    weapon: {
      type: Object,
      default() {
        return {
          level: 1,
          affix_level: 1,
          desc: "",
          name: "",
        };
      },
    },
  },
  computed: {
    rarity() {
      const star = "★";
      return star.repeat(this.weapon.rarity);
    },
  },
};
