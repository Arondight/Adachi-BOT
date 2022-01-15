const template = `<div class="quoteBox">
  <img class="quoteImage" :src="link" :alt="name" />
  <p class="quoteText">{{quote}}</p>
</div>`;

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;

export default defineComponent({
  name: "quoteBox",
  template,
  props: {
    data: Object,
  },
  setup(props) {
    const config = props.data;
    const defaultQuotes = ["旅行者今天去了哪里冒险呢？", "旅行者今天经历了哪些有趣的事情呢？"];
    const defaultQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    let data = {};

    if (Array.isArray(config) && config.length > 0) {
      const item = config[Math.floor(Math.random() * config.length)];
      const name = item.name;
      const image = item.images[Math.floor(Math.random() * item.images.length)];
      const quote = item.quote || defaultQuote;
      data = { name, link: image, quote };
    } else {
      data = { name: "刻晴", link: "刻晴-祝贺.png", quote: defaultQuote };
    }

    if ("string" === typeof data.link) {
      data.link = `http://localhost:9934/resources/Version2/emoticons/${data.link}`;
    }

    return data;
  },
});
