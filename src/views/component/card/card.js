// eslint-disable-next-line no-unused-vars
const upper = {
  template: "#upper",
  props: {
    qqid: Number,
    uid: Number,
    nickname: String,
    level: Number,
    homeslevel: Number,
    maxcomfort: Number,
    exploration: Object,
    maps: Object,
    offerings: Object,
    stats: {
      type: Object,
      default() {
        return {
          active_day_number: 0,
          achievement_number: 0,
          anemoculus_number: 0,
          geoculus_number: 0,
          avatar_number: 0,
          common_chest_number: 0,
          exquisite_chest_number: 0,
          precious_chest_number: 0,
          luxurious_chest_number: 0,
          spiral_abyss: "0-0",
          way_point_number: 0,
        };
      },
    },
  },
  methods: {
    findMap(type) {
      const info = this.maps.find((el) => el.name === type);
      return info ? info : { name: type, level: -1 };
    },
  },
  computed: {
    Picture() {
      return undefined === this.qqid
        ? "http://localhost:9934/resources/paimon/paimon_logo.jpg"
        : "https://q1.qlogo.cn/g?b=qq&s=5&nk=" + this.qqid;
    },
    worldLevel() {
      if (this.level >= 55) {
        return 8;
      } else if (this.level >= 50) {
        return 7;
      } else if (this.level >= 45) {
        return 6;
      } else if (this.level >= 40) {
        return 5;
      } else if (this.level >= 35) {
        return 4;
      } else if (this.level >= 30) {
        return 3;
      } else if (this.level >= 25) {
        return 2;
      } else if (this.level >= 20) {
        return 1;
      } else {
        return 0;
      }
    },
    percentage(props) {
      return (id) => {
        const data = props.exploration.find((el) => el.id === id);
        return `${data ? data.exploration_percentage / 10 : 0}%`;
      };
    },
    expLevel(props) {
      return (id) => {
        const data = props.exploration.find((el) => el.id === id);
        return `Lv.${data ? data.level : 0}`;
      };
    },
    sakura(props) {
      return () => {
        const data = props.exploration.find((el) => el.id === 4);
        return `Lv.${data ? data.offerings.find((el) => el.name === "神樱眷顾").level : 0}`;
      };
    },
    homedata() {
      const homedata = [];
      homedata.push(this.findMap("罗浮洞"));
      homedata.push(this.findMap("翠黛峰"));
      homedata.push(this.findMap("清琼岛"));
      homedata.push(this.findMap("绘绮庭"));
      return homedata;
    },
  },
};

const AvatarElement = {
  template: "#avatar-element",
  props: {
    avatar: {
      type: Object,
      default() {
        return {
          fetter: 0,
          level: 0,
          image: "",
          name: "",
        };
      },
    },
  },
};

// eslint-disable-next-line no-unused-vars
const middle = {
  template: "#middle",
  props: {
    avatars: {
      type: Array,
    },
  },
  components: {
    AvatarElement,
  },
};

// eslint-disable-next-line no-unused-vars
const bottom = {
  template: "#bottom",
};
