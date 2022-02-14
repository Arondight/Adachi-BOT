import { html } from "../common/html.js";
import { getParams } from "../common/param.js";
import MaterialColumn from "./column.js";

// eslint-disable-next-line no-undef
const { defineComponent } = Vue;
const template = html`<div class="material">
  <div class="outer">
    <img v-for="i in 4" :src="starBASE64" class="corner-star" :class="'star' + i" alt="ERROR" />
    <div v-for="i in 4" class="outer-circle" :class="'outer-circle' + i"></div>
    <div class="inner">
      <div v-for="i in 4" class="inner-circle" :class="'inner-circle' + i"></div>
      <div class="content" :class="{ 'has-empty': weapon.length === 0 || character === 0 }">
        <MaterialColumn :data="character" :day="day" type="character" />
        <MaterialColumn :data="weapon" :day="day" type="weapon" />
      </div>
    </div>
  </div>
  <p class="author">Created by Adachi-BOT</p>
</div>`;

export default defineComponent({
  name: "MaterialApp",
  template,
  components: {
    MaterialColumn,
  },
  setup() {
    const starBASE64 =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMjkiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTI4LjU2OCAxNC42MjNjLTkuNzQxLS41NjQtMTIuNjQ0LTMuODg0LTEzLjczNC0xMy43MzQtLjUxNCA5LjkxNy0zLjQxIDEzLjA5Mi0xMy43MzMgMTMuNzM0IDkuOTYzLjM4MyAxMy4wNzkgMy43ODcgMTMuNzMzIDEzLjczNCAxLjE2My05LjUxMSA0LjEyNi0xMi42NDkgMTMuNzM0LTEzLjczNHoiIGZpbGw9IiMyRTNENTQiIHN0cm9rZT0iIzJFM0Q1NCIvPjwvc3ZnPg==";
    const params = getParams(window.location.href);
    const day = params.day;
    const character = params.character.data;
    const weapon = params.weapon.data;

    return { day, weapon, character, starBASE64 };
  },
});
