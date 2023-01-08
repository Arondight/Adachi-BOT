import { getParams, html } from "../common/utils.js";
import { CharacterBox, ExplorationBox, SectionTitle } from "./cardComponents.js";

const lodash = window._;
const { defineComponent } = window.Vue;

const template = html`<div class="card-container">
  <img class="avatar" :src="namecardAvatarBackupImg" v-costume="namecardAvatar" />
  <div class="namecard-container" :style="{'background': nameCard}">
    <div class="player-info-container">
      <p v-if="hasPlayerNameInfo" class="player-name">{{ playerNickname }}</p>
      <p class="uid">UID {{ playerUid }}</p>
      <p v-if="hasLevelInfo" class="adventure-rank">冒险等阶</p>
      <p v-if="hasLevelInfo" class="adventure-rank">{{ playerLevel }}</p>
    </div>
  </div>
  <div class="info-container">
    <div class="stats main-content">
      <p>活跃天数</p>
      <p>{{ stats.active_day_number }}</p>
      <p>获得角色</p>
      <p>{{ stats.avatar_number }}</p>
      <p>成就达成</p>
      <p>{{ stats.achievement_number }}</p>
      <p>深境螺旋</p>
      <p>{{ stats.spiral_abyss }}</p>
      <p>普通宝箱</p>
      <p>{{ stats.common_chest_number }}</p>
      <p>风神瞳数</p>
      <p>{{ stats.anemoculus_number }}</p>
      <p>精致宝箱</p>
      <p>{{ stats.exquisite_chest_number }}</p>
      <p>岩神瞳数</p>
      <p>{{ stats.geoculus_number }}</p>
      <p>珍贵宝箱</p>
      <p>{{ stats.precious_chest_number }}</p>
      <p>雷神瞳数</p>
      <p>{{ stats.electroculus_number }}</p>
      <p>华丽宝箱</p>
      <p>{{ stats.luxurious_chest_number }}</p>
      <p>草神瞳数</p>
      <p>{{ stats.dendroculus_number }}</p>
      <p>奇馈宝箱</p>
      <p>{{ stats.magic_chest_number }}</p>
      <p>洞天仙力</p>
      <p>{{ homeComfort }}</p>
    </div>

    <div class="section-container" id="world-exploration">
      <SectionTitle title="世界探索" :subtitle="!1" />
      <div class="container-explorations main-content">
        <ExplorationBox v-for="exploration in explorations" :data="exploration" />
      </div>
    </div>

    <div class="section-container" id="character-box">
      <SectionTitle
        title="角色展柜"
        :subtitle="characters.length < stats.avatar_number ? '仅展示米游社人物展柜中的至多8个人物' : !1"
      />
      <div class="container-character-box main-content">
        <CharacterBox
          v-for="character in characters"
          :data="character"
          :characterName="getCharacterName(character.id)"
        />
      </div>
    </div>
    <!-- 数据 container 结束 -->
  </div>
  <div id="credit">Created by Adachi-BOT</div>
</div>`;

export default defineComponent({
  name: "genshinCard",
  template: template,
  components: {
    SectionTitle,
    ExplorationBox,
    CharacterBox,
  },
  setup() {
    function getExplorationData(e) {
      const { name, icon: iconUrl, exploration_percentage, level, id, parent_id, type, offerings } = e;
      // noinspection NonAsciiCharacters
      const displayData = {
        探索进度: `${exploration_percentage / 10}%`,
      };

      if ("reputation" === type.toLowerCase() && undefined !== level) {
        displayData["声望等级"] = `Lv. ${level}`;
      }

      for (const offering of offerings) {
        const offeringName = filterOfferingName(offering.name) || "供奉等级";
        displayData[offeringName] = `Lv. ${offering.level}`;
      }

      return {
        name,
        iconUrl,
        id,
        parent_id,
        type,
        displayData,
      };
    }

    function getRegionName(string) {
      return string
        .replace(/(蒙德|璃月|稻妻|须弥|纳塔|枫丹|至冬)(地区|区域)?/g, "")
        .split(/[•・·]/g)
        .pop();
    }

    function explorationReducer(curr, next) {
      // 当 curr 为 object 时无法 spread，需要转换为 array
      const currentArray = [...(Array.isArray(curr) ? curr : [curr])];
      const currentArea = currentArray.pop();
      const {
        name: currentName,
        iconUrl: currentIconUrl,
        id: currentId,
        type: currentType,
        displayData: currentData,
      } = currentArea;
      const { name: nextName, parent_id: nextParent, type: nextType, displayData: nextData } = next;

      if (nextParent === currentId && currentType === nextType) {
        const returnArea = {
          name: currentName,
          iconUrl: currentIconUrl,
          id: currentId,
          parent_id: 0,
          type: currentType,
        };
        const displayData = {};
        const currentAreaName = getRegionName(currentName);
        const nextAreaName = getRegionName(nextName);

        displayData[currentAreaName] = currentData["探索进度"] || "0%";

        for (const [key, value] of Object.entries(nextData)) {
          if ("探索进度" === key) {
            displayData[nextAreaName] = value;
          } else if (!(key in displayData)) {
            displayData[key] = value;
          }
        }

        returnArea.displayData = displayData;
        return [...currentArray, returnArea];
      }

      return [...currentArray, currentArea, next];
    }

    function getCharacterName(characterID) {
      return (charactersMap.filter((character) => character.id === characterID)[0] || {}).name;
    }

    const params = getParams(window.location.href);
    const { uid, nickname, level } = params;
    const hasLevelInfo = params.level !== -1;
    const hasPlayerNameInfo = params.nickname !== "";
    const randomAvatarOrder = Math.floor(Math.random() * params.avatars.length);
    const target = params?.avatars.length > 0 ? params.avatars[randomAvatarOrder] : { costumes: [] };
    const targetHasCostume = target?.costumes.length !== 0;
    const costumeName = targetHasCostume ? params.avatars[randomAvatarOrder]["costumes"][0]["name"] : "";
    const qqid = params.qqid || "";
    const charactersMap = params.character;
    const name = target.name;
    const nameCardUrl = encodeURI(`http://localhost:9934/resources/character/namecard/${name}.webp`);
    const nameCard = `linear-gradient(hsla(0, 0%, 100%, 0) 0%, #fff 100%), url(${nameCardUrl})`;
    const character = targetHasCostume
      ? encodeURI(`http://localhost:9934/resources/costume/icon/${costumeName}.webp`)
      : encodeURI(`http://localhost:9934/resources/character/icon/${name}.webp`);
    const namecardAvatar = "" !== qqid ? `https://q1.qlogo.cn/g?b=qq&s=5&nk=${qqid}` : character;
    const namecardAvatarBackupImg = encodeURI(`http://localhost:9934/resources/character/icon/${name}.webp`);
    const filterOfferingName = (string) => string.replace(/等级$/, "");
    const explorations = [
      ...lodash.orderBy(params.explorations, "id", "asc").map((exploration) => getExplorationData(exploration)),
    ].reduce(explorationReducer);
    const characters = params.avatars || [];
    const homeComfort = Math.max(...params.homes.map((home) => home.comfort_num || 0));

    return {
      playerUid: uid,
      playerNickname: nickname,
      playerLevel: level,
      nameCard,
      namecardAvatar,
      namecardAvatarBackupImg,
      characters,
      explorations,
      stats: params.stats,
      homeComfort: "number" === typeof homeComfort && -Infinity !== homeComfort ? homeComfort : "暂无数据",
      hasLevelInfo,
      hasPlayerNameInfo,
      charactersMap,
      getCharacterName,
    };
  },
});
