#!/usr/bin/env bash
# ==============================================================================
# 所有的资源都来自于原作者 https://github.com/SilveryStar 的辛苦创作。
# 此脚本是为了将项目和原作者解绑。
# ==============================================================================

RDIR=$(dirname $(readlink -f "$0"))
API='https://adachi-bot.oss-cn-beijing.aliyuncs.com'
CURL=('curl' '-s' '-C' '-')

# ==============================================================================
# 此处请按照游戏进度实时更新。
# ==============================================================================
# 圣遗物，这里的 ID 查阅 config/artifacts.yml。
# 我不确定原作者是否会依次递增，因此此处写成数组。
ARTIFACT_IDS=(
  '1' '2' '3' '4' '5' '6' '7' '8' '9' '10' '11' '12' '13' '14' '15' '16' '17'
)
# ==============================================================================
# 所有的洞天。
HOMES=(
  '罗浮洞'   '翠黛峰'   '清琼岛'
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
# 所有的游戏角色ID。更新时请访问下面的 URL 查看 id 字段。
# https://adachi-bot.oss-cn-beijing.aliyuncs.com/Version2/info/docs/角色名.json
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
  '未熟之玉'     '魔偶机心'     '恒常机关之心'
  # 周本 BOSS
  '北风的魂匣'   '北风之环'     '北风之尾'
  '东风的吐息'   '东风之翎'     '东风之爪'
  '鎏金之鳞'     '龙王之冕'     '血玉之枝'
  '魔王之刃·残片'  '吞天之鲸·只角'  '武炼之魂·孤影'
  # 天赋本
  '「自由」的教导' '「自由」的指引' '「自由」的哲学'
  '「诗文」的教导' '「诗文」的指引' '「诗文」的哲学'
  '「抗争」的教导' '「抗争」的指引' '「抗争」的哲学'
  '「勤劳」的教导' '「勤劳」的指引' '「勤劳」的哲学'
  '「繁荣」的教导' '「繁荣」的指引' '「繁荣」的哲学'
  '「黄金」的教导' '「黄金」的指引' '「黄金」的哲学'
  '「风雅」的教导' '「风雅」的指引' '「风雅」的哲学'
  # 武器本
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
API_CHARACTER_PROFILE='characters/profile'
API_GACHA_ITEMS='gacha/items'
API_MODULE='module'
API_ITEM='item'
API2_ARTIFACT='Version2/artifact'
API2_ARTIFACT_OTHER='Version2/artifact/other'
API2_CHARACTER='Version2/character'
API2_MODULE='Version2/module'
API2_INFO_DOCS='Version2/info/docs'
API2_INFO_OTHER='Version2/info/other'
API2_INFO_IMAGE='Version2/info/image'
API2_WISH_CONFIG='Version2/wish/config'
API2_WISH_CHARACTER='Version2/wish/character'
API2_WISH_WEAPON='Version2/wish/weapon'

API_GACHA_ITEMS_FILES=(
  'ThreeStar.png'
  'FourStar.png'
  'FiveStar.png'
  'ThreeBackground.png'
  'FourBackground.png'
  'FiveBackground.png'
  'background.png'
)
API_MODULE_FILES=(
  'artifact.png'
  'card-new-bottom.png'
  'card-new-middle.png'
  'card-new-package.png'
  'card-new-upper.png'
  'element.png'
  'info-new-upper.png'
)
API_ITEM_FILES=(
  'lock.png'
  'rarity.png'
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
API2_WISH_CONFIG_FILES=(
  'weapon.json'
  'character.json'
)
OTHER_FILES=(
  'Version2/slip/index.yml'
)

# ==============================================================================
# 资源更新代码，可以不用看
# ==============================================================================
function fetch()
{
  local api="$1" && shift
  local suffix="$1" && shift
  local sources=($@)
  local wdir="${RDIR}/${api}"
  local upstream
  local localpath

  for src in "${sources[@]}"
  do
    upstream="${api}/${src}${suffix}"
    localpath="${wdir}/${src}${suffix}"

    mkdir -p $(dirname "$localpath")

    echo "Fetch: ${upstream} => ${localpath}"
    command "${CURL[@]}" "${API}/${upstream}" -o "$localpath"
  done
}

function dealXML()
{
  local cmd="$1" && shift
  local msg="$1" && shift
  local files=($@)
  local found=0

  for file in "${files[@]}"
  do
    if [[ 'text/xml' == $(file --mime-type "$file" | \
                          cut -d: -f2 | tr -d '[:space:]') ]]
    then
      found=1

      if [[ -n "$msg" ]]
      then
        echo "$msg: ${file}"
      fi

      env -iS "$cmd" "$file"
    fi
  done

  # Here return an error code, 1-255, but it is enough
  return "$found"
}

function getOtherFiles()
{
  fetch '' '' "${OTHER_FILES[@]}"
}

function getGacha()
{
  fetch "$API_GACHA_ITEMS" '' "${API_GACHA_ITEMS_FILES[@]}"
}

function getMoudle()
{
  fetch "$API_MODULE" '' "${API_MODULE_FILES[@]}"
  fetch "$API2_MODULE" '' "${API2_MODULE_FILES[@]}"
}

function getItem()
{
  fetch "$API_ITEM" '' "${API_ITEM_FILES[@]}"
  fetch "$API_ITEM" '.png' "${HOMES[@]}"
}

function getInfo()
{
  local files=()

  for star in $(seq 3 5)
  do
    for type in 'BaseBackground' 'BaseStar'
    do
      files+=("${type}${star}.png")
    done
  done

  fetch "$API2_INFO_DOCS" '.json' "${CHARS[@]}"
  fetch "$API2_INFO_DOCS" '.json' "${WEAPONS[@]}"
  fetch "$API2_INFO_OTHER" '' "${files[@]}"
  fetch "$API2_INFO_IMAGE" '.png' "${MATERIALS[@]}"
}

function getArtifacts()
{
  local files=()

  for id in ${ARTIFACT_IDS[@]}
  do
    for slot in $(seq 0 4)
    do
      files+=("${id}/${slot}.png")
    done
  done

  fetch "$API2_ARTIFACT" '' "${API2_ARTIFACT_FILES[@]}"
  fetch "$API2_ARTIFACT" '' "${files[@]}"
  fetch "$API2_ARTIFACT_OTHER" '.png' $(seq 1 5)
  fetch "$API2_ARTIFACT_OTHER" '' "${API2_ARTIFACT_OTHER_FILES[@]}"
}

function getCharacter()
{
  fetch "$API_CHARACTER_PROFILE" '.png' "${CHARIDS[@]}"
  fetch "$API2_CHARACTER" '.png' "${CHARIDS[@]}"
}

function getWish()
{
  local files=()

  fetch "$API2_WISH_CONFIG" '' "${API2_WISH_CONFIG_FILES[@]}"
  fetch "$API2_WISH_CHARACTER" '.png' "${CHARS[@]}"
  # 这里不从 API2_WISH_CONFIG 中获取配置，服务端假定一切都不可信
  fetch "$API2_WISH_WEAPON" '.png' "${WEAPONS[@]}"

  # 有一些武器无法通过抽卡获得，此 API 不提供这些武器的图片，删除这些垃圾文件
  files=($(find "${RDIR}/${API2_WISH_WEAPON}" -type f))
  dealXML 'rm -f' 'Delete' "${files[@]}"
}

function listXML()
{
  local files=($(find "$RDIR" -type f))
  local hasXML=0

  echo 'Here some XML files below:'

  dealXML 'echo' '' "${files[@]}"
  hasXML="$?"

  if [[ 0 -eq "$hasXML" ]]
  then
    echo "No XML files found, everything is perfect."
  fi
}

# MAIN
{
  getOtherFiles
  getGacha
  getMoudle
  getItem
  getInfo
  getArtifacts
  getCharacter
  getWish

  listXML
}

