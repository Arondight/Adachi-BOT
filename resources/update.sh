#!/usr/bin/env bash
set -x
# ==============================================================================
# 所有的资源都来自于原作者 https://github.com/SilveryStar 的辛苦创作。
# 此脚本是为了将项目和原作者解绑。
# ==============================================================================

RDIR=$(dirname $(readlink -f "$0"))
API='https://adachi-bot.oss-cn-beijing.aliyuncs.com'
CURL=('curl' '-C' '-')

# ==============================================================================
# 此处请按照游戏进度实时更新
# ==============================================================================
# 圣遗物，这里的 ID 查阅 config/artifacts.yml。
# 我不确定原作者是否会依次递增，因此此处写成数组。
ARTIFACT_IDS=(
  '1' '2' '3' '4' '5' '6' '7' '8' '9' '10' '11' '12' '13' '14' '15' '16' '17'
)
# ==============================================================================
# 所有的游戏角色。
CHARS=(
  # 风
  '温迪'     '琴'       '魈'       '砂糖'     '枫原万叶'
  # 水
  '达达利亚' '莫娜'     '行秋'     '芭芭拉'
  # 火
  '迪卢克'   '可莉'     '胡桃'     '班尼特'   '香菱'     '安柏'     '辛焱'
  '烟绯'
  # 冰
  '七七'     '甘雨'     '优菈'     '重云'     '迪奥娜'   '凯亚'     '罗莎莉亚'
  '神里绫华'
  # 雷
  '刻晴'     '菲谢尔'   '北斗'     '雷泽'     '丽莎'
  # 岩
  '钟离'     '阿贝多'   '凝光'     '诺艾尔'
)
# ==============================================================================
# 所有的游戏角色ID。更新时请先运行 update.sh，随后在
# resources/Version2/info/docs/角色.json 中查看 id 字段。
CHARIDS=(
  # 温迪     琴         魈         砂糖       枫原万叶
  '10000022' '10000003' '10000026' '10000043' '10000047'
  # 达达利亚 莫娜       行秋       芭芭拉
  '10000033' '10000041' '10000025' '10000014'
  # 迪卢克   可莉       胡桃       班尼特     香菱       安柏       辛焱
  '10000016' '10000029' '10000046' '10000032' '10000023' '10000021' '10000044'
  # 烟绯'
  '10000048'
  # 七七     甘雨       优菈       重云       迪奥娜     凯亚       罗莎莉亚
  '10000035' '10000037' '10000051' '10000036' '10000039' '10000015' '10000045'
  # 神里绫华
  '10000002'
  # 刻晴     菲谢尔     北斗       雷泽       丽莎
  '10000042' '10000031' '10000024' '10000020' '10000006'
  # 钟离     阿贝多     凝光       诺艾尔
  '10000030' '10000038' '10000027' '10000034'
)
# ==============================================================================
# 所有的游戏武器
WEAPONS=(
  # 单手剑
  '飞天御剑'     '吃虎鱼刀'     '黎明神剑'     '旅行剑'       '暗铁剑'
  '冷刃'         '降临之剑'     '西风剑'       '黑岩长剑'     '试作斩岩'
  '腐殖之剑'     '黑剑'         '暗巷闪光'     '宗室长剑'     '铁蜂刺'
  '笛剑'         '匣里龙吟'     '天目影打刀'   '祭礼剑'       '苍古自由之誓'
  '天空之刃'     '磐岩结绿'     '风鹰剑'       '斫峰之刃'     '雾切之回光'
  # 双手剑
  '沐浴龙血的剑' '白铁大剑'     '铁影阔剑'     '飞天大御剑'   '以理服人'
  '雨裁'         '白影剑'       '黑岩斩刀'     '宗室大剑'     '祭礼大剑'
  '螭骨剑'       '雪葬的星银'   '试作古华'     '西风大剑'     '桂木斩长正'
  '钟剑'         '千岩古剑'     '无工之剑'     '狼的末路'     '天空之傲'
  '松籁响起之时'
  # 弓
  '鸦羽弓'       '信使'         '弹弓'         '反曲弓'       '神射手之誓'
  '绝弦'         '风花之颂'     '幽夜华尔兹'   '钢轮弓'       '西风猎弓'
  '弓藏'         '黑岩战弓'     '试作澹月'     '宗室长弓'     '破魔之弓'
  '暗巷猎手'     '祭礼弓'       '苍翠猎弓'     '天空之翼'     '阿莫斯之弓'
  '终末嗟叹之诗' '飞雷之弦振'
  # 法器
  '讨龙英杰谭'   '异世界行记'   '翡玉法球'     '甲级宝珏'     '魔导绪论'
  '试作金珀'     '祭礼残章'     '黑岩绯玉'     '昭心'         '万国诸海图谱'
  '白辰之环'     '嘟嘟可故事集' '暗巷的酒与诗' '宗室秘法录'   '流浪乐章'
  '匣里日月'     '西风秘典'     '忍冬之果'     '四风原典'     '天空之卷'
  '尘世之锁'
  # 长柄武器
  '黑缨枪'       '钺矛'         '白缨枪'       '决斗之枪'     '龙脊长枪'
  '喜多院十文字' '宗室猎枪'     '流月针'       '匣里灭辰'     '千岩长枪'
  '试作星镰'     '西风长枪'     '黑岩刺枪'     '护摩之杖'     '天空之脊'
  '和璞鸢'       '贯虹之槊'
)
# ==============================================================================
# 所有的升级素材
MATERIALS=(
  # 角色突破素材
  '哀叙冰玉'     '哀叙冰玉断片' '哀叙冰玉块'   '哀叙冰玉碎屑'
  '涤净青金'     '涤净青金断片' '涤净青金块'   '涤净青金碎屑'
  '坚牢黄玉'     '坚牢黄玉断片' '坚牢黄玉块'   '坚牢黄玉碎屑'
  '燃愿玛瑙'     '燃愿玛瑙断片' '燃愿玛瑙块'   '燃愿玛瑙碎屑'
  '自在松石'     '自在松石断片' '自在松石块'   '自在松石碎屑'
  '最胜紫晶'     '最胜紫晶断片' '最胜紫晶块'   '最胜紫晶碎屑'
  # 天赋突破素材
  '寻宝鸦印'     '藏银鸦印'     '攫金鸦印'
  '黯淡棱镜'     '水晶棱镜'     '偏光棱镜'
  '破损的面具'   '污秽的面具'   '不祥的面具'
  '沉重号角'     '黑铜号角'     '黑晶号角'
  '脆弱的骨片'   '结实的骨片'   '石化的骨片'
  '导能绘卷'     '封魔绘卷'     '禁咒绘卷'
  '地脉的枯叶'   '地脉的旧枝'   '地脉的新芽'
  '猎兵祭刀'     '特工祭刀'     '督察长祭刀'
  '混沌装置'     '混沌回路'     '混沌炉心'
  '混沌机关'     '混沌枢纽'     '混沌真眼'
  '牢固的箭簇'   '锐利的箭簇'   '历战的箭簇'
  '破旧的刀镡'   '影打刀镡'     '名刀镡'
  '骗骗花蜜'     '微光花蜜'     '原素花蜜'
  '史莱姆凝液'   '史莱姆清'     '史莱姆原浆'
  '雾虚花粉'     '雾虚草囊'     '雾虚灯芯'
  '新兵的徽记'   '士官的徽记'   '尉官的徽记'
  # 世界 BOSS
  '雷光棱镜'     '玄岩之塔'     '飓风之种'     '晶凝之华'
  '常燃火种'     '极寒之核'
  '净水之心'
  '未熟之玉'
  '魔偶机心'
  '恒常机关之心'
  # 天赋本
  # 素材本
  '高塔孤王的残垣' '高塔孤王的断片' '高塔孤王的破瓦' '高塔孤王的碎梦'
  '孤云寒林的光砂' '孤云寒林的辉岩' '孤云寒林的神体' '孤云寒林的圣骸'
  '今昔剧画之鬼人' '今昔剧画之虎啮' '今昔剧画之恶尉' '今昔剧画之一角'
  '凛风奔狼的断牙' '凛风奔狼的怀乡' '凛风奔狼的裂齿' '凛风奔狼的始龀'
  '鸣神御灵的欢喜' '鸣神御灵的明慧' '鸣神御灵的亲爱' '鸣神御灵的勇武'
  '漆黑陨铁的一角' '漆黑陨铁的一块' '漆黑陨铁的一粒' '漆黑陨铁的一片'
  '狮牙斗士的枷锁' '狮牙斗士的理想' '狮牙斗士的镣铐' '狮牙斗士的铁链'
  '雾海云间的汞丹' '雾海云间的金丹' '雾海云间的铅丹' '雾海云间的转还'
  '远海夷地的瑚枝' '远海夷地的金枝' '远海夷地的琼枝' '远海夷地的玉枝'
)

# ==============================================================================
# 如果你不知道在做什么，请勿改动此处
# ==============================================================================
API_MODULE='module'
API_CHARACTER_PROFILE='characters/profile'
API2_ARTIFACT='Version2/artifact'
API2_ARTIFACT_OTHER='Version2/artifact/other'
API2_CHARACTER='Version2/character'
API2_MODULE='Version2/module'
API2_INFO_DOCS='Version2/info/docs'
API2_INFO_IMAGE='Version2/info/image'

API_MODULE_FILES=(
  'artifact.png'
  'card-new-bottom.png'
  'card-new-middle.png'
  'card-new-package.png'
  'card-new-upper.png'
  'element.png'
  'info-new-upper.png'
)
API2_ARTIFACT_OTHER_FILES=(
  'rarity.png'
)
API2_ARTIFACT_FILES=(
  'artifact.yml'
)
API2_MODULE_FILES=(
  'artifact.png'
  'card-bottom.png'
  'card-middle.png'
  'card-package.png'
  'element.png'
)
OTHER_FILES=(
  # Arondight/Adachi-BOT
  'item/lock.png'
  'item/rarity.png'
  # SilveryStar/Adachi-BOT
  'item/lock.png'
  'Version2/slip/index.yml'
)

# ==============================================================================
# 资源更新代码
# ==============================================================================
function getFiles()
{
  local wdir

  for file in "${OTHER_FILES[@]}"
  do
    wdir="${RDIR}/$(dirname ${file})"
    mkdir -p "$wdir"
    command "${CURL[@]}" "${API}/${file}" \
            -o "${RDIR}/${file}"
  done
}

function getInfo()
{
  local wdir
  local suffix

  wdir="${RDIR}/${API2_INFO_DOCS}"
  mkdir -p "$wdir"

  for info in "${CHARS[@]}" "${WEAPONS[@]}"
  do
    command "${CURL[@]}" "${API}/${API2_INFO_DOCS}/${info}.json" \
            -o "${wdir}/${info}.json"
  done

  wdir="${RDIR}/${API2_INFO_IMAGE}"
  mkdir -p "$wdir"

  for name in "${MATERIALS[@]}"
  do
    command "${CURL[@]}" "${API}/${API2_INFO_IMAGE}/${name}.png" \
            -o "${wdir}/${name}.png"
  done

}

function getMoudle()
{
  local wdir

  wdir="${RDIR}/${API_MODULE}"
  mkdir -p "$wdir"

  for file in "${API_MODULE_FILES[@]}"
  do
    command "${CURL[@]}" "${API}/${API_MODULE}/${file}" \
            -o "${wdir}/${file}"
  done


  wdir="${RDIR}/${API2_MODULE}"
  mkdir -p "$wdir"

  for file in "${API2_MODULE_FILES[@]}"
  do
    command "${CURL[@]}" "${API}/${API2_MODULE}/${file}" \
            -o "${wdir}/${file}"
  done
}

function getArtifacts()
{
  local wdir

  wdir="${RDIR}/${API2_ARTIFACT}"
  mkdir -p "$wdir"

  for file in ${API2_ARTIFACT_FILES}
  do
    command "${CURL[@]}" "${API}/${API2_ARTIFACT_FILES}/${file}" \
            -o "${wdir}/${file}"
  done

  for id in ${ARTIFACT_IDS[@]}
  do
    mkdir -p "${wdir}/${id}"

    for slot in $(seq 0 4)
    do
      command "${CURL[@]}" "${API}/${API2_ARTIFACT}/${id}/${slot}.png" \
              -o "${wdir}/${id}/${slot}.png"
    done
  done

  wdir="${RDIR}/${API2_ARTIFACT_OTHER}"
  mkdir -p "$wdir"

  for slot in $(seq 1 5)
  do
    command "${CURL[@]}" "${API}/${API2_ARTIFACT_OTHER}/${slot}.png" \
            -o "${wdir}/${slot}.png"
  done

  for file in "${API2_ARTIFACT_OTHER_FILES[@]}"
  do
    command "${CURL[@]}" "${API}/${API2_ARTIFACT_OTHER}/${file}" \
            -o "${wdir}/${file}"
  done
}

function getCharacter()
{
  local wdir

  for api in "$API2_CHARACTER" "$API_CHARACTER_PROFILE"
  do
    wdir="${RDIR}/${api}"
    mkdir -p "$wdir"

    for id in ${CHARIDS[@]}
    do
      command "${CURL[@]}" "${API}/${api}/${id}.png" \
              -o "${wdir}/${id}.png"
    done
  done
}

# MAIN
{
  getFiles
  getInfo
  getMoudle
  getArtifacts
  getCharacter
}

