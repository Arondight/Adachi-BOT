#!/usr/bin/env bash
# ==============================================================================
# 此脚本是为了将项目和原作者解绑，将资源文件本地化。
# ==============================================================================
RDIR=$(dirname $(readlink -f "$0"))
# 此为原作者维护的 OSS，这里作为数据源更新本地数据。
# 所有的资源都来自于原作者 https://github.com/SilveryStar 的辛苦创作。
# 脚本假定数据源不可信，所有的请求都不会依赖于某次请求的结果。
# {
API='https://adachi-bot.oss-cn-beijing.aliyuncs.com'
# }
# 此本项目的资源文件，将会覆盖同名的原作者资源文件
# {
CUSTOM_RES=$(readlink -f "${RDIR}/../resources_custom/")
# }
CURL=('curl' '-s')

# ==============================================================================
# 所有的游戏资源
# ==============================================================================
# 圣遗物，我不确定原作者是否会依次递增，因此此处写成数组。
ARTIFACT_IDS=(
  $(seq 0 17)
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
  '温迪'     '琴'       '魈'       '砂糖'     '枫原万叶' '早柚'
  # 水
  '达达利亚' '莫娜'     '行秋'     '芭芭拉'   '珊瑚宫心海'
  # 火
  '迪卢克'   '可莉'     '胡桃'     '班尼特'   '香菱'     '安柏'     '辛焱'
  '烟绯'     '宵宫'     '托马'
  # 冰
  '七七'     '甘雨'     '优菈'     '重云'     '迪奥娜'   '凯亚'     '罗莎莉亚'
  '神里绫华' '埃洛伊'
  # 雷
  '刻晴'     '菲谢尔'   '北斗'     '雷泽'     '丽莎'     '雷电将军' '九条裟罗'
  # 岩
  '钟离'     '阿贝多'   '凝光'     '诺艾尔'
)
# ==============================================================================
# 所有的游戏角色ID。
# https://github.com/Arondight/Adachi-BOT/issues/20
CHARIDS=(
  # 温迪     琴         魈         砂糖       枫原万叶   早柚
  '10000022' '10000003' '10000026' '10000043' '10000047' '10000053'
  # 达达利亚 莫娜       行秋       芭芭拉     珊瑚宫心海
  '10000033' '10000041' '10000025' '10000014' '10000054'
  # 迪卢克   可莉       胡桃       班尼特     香菱       安柏       辛焱
  '10000016' '10000029' '10000046' '10000032' '10000023' '10000021' '10000044'
  # 烟绯'    宵宫       托马
  '10000048' '10000049' '10000050'
  # 七七     甘雨       优菈       重云       迪奥娜     凯亚       罗莎莉亚
  '10000035' '10000037' '10000051' '10000036' '10000039' '10000015' '10000045'
  # 神里绫华 埃洛伊
  '10000002' '10000062'
  # 刻晴     菲谢尔     北斗       雷泽       丽莎       雷电将军   九条裟罗
  '10000042' '10000031' '10000024' '10000020' '10000006' '10000052' '10000056'
  # 钟离     阿贝多     凝光       诺艾尔
  '10000030' '10000038' '10000027' '10000034'
  # 旅行者
  # 旅行者女 旅行者男
  '10000007' '10000005'
  ## 岩女                岩男                  风女                  风男
  #'10000007_g'          '10000005_g'          '10000007_a'          '10000005_a'
  ##雷女                 雷男
  #'10000007_e'          '10000005_e'
)
# ==============================================================================
# 所有的游戏武器
WEAPONS=(
  # 单手剑
  '飞天御剑'     '吃虎鱼刀'     '黎明神剑'     '旅行剑'       '暗铁剑'
  '冷刃'
  '降临之剑'     '西风剑'       '黑岩长剑'     '试作斩岩'     '腐殖之剑'
  '黑剑'         '暗巷闪光'     '宗室长剑'     '铁蜂刺'       '笛剑'
  '匣里龙吟'     '天目影打刀'   '祭礼剑'
  '苍古自由之誓' '天空之刃'     '磐岩结绿'     '风鹰剑'       '斫峰之刃'
  '雾切之回光'
  # 双手剑
  '沐浴龙血的剑' '白铁大剑'     '铁影阔剑'     '飞天大御剑'   '以理服人'
  '雨裁'         '白影剑'       '黑岩斩刀'     '宗室大剑'     '祭礼大剑'
  '螭骨剑'       '雪葬的星银'   '试作古华'     '西风大剑'     '桂木斩长正'
  '钟剑'         '千岩古剑'     '衔珠海皇'     '恶王丸'
  '无工之剑'     '狼的末路'     '天空之傲'     '松籁响起之时'
  # 弓
  '鸦羽弓'       '信使'         '弹弓'         '反曲弓'       '神射手之誓'
  '绝弦'         '风花之颂'     '幽夜华尔兹'   '钢轮弓'       '西风猎弓'
  '弓藏'         '黑岩战弓'     '试作澹月'     '宗室长弓'     '破魔之弓'
  '暗巷猎手'     '祭礼弓'       '苍翠猎弓'     '曚云之月'
  '天空之翼'     '阿莫斯之弓'   '终末嗟叹之诗' '飞雷之弦振'   '冬极白星'
  # 法器
  '讨龙英杰谭'   '异世界行记'   '翡玉法球'     '甲级宝珏'     '魔导绪论'
  '试作金珀'     '祭礼残章'     '黑岩绯玉'     '昭心'         '万国诸海图谱'
  '白辰之环'     '嘟嘟可故事集' '暗巷的酒与诗' '宗室秘法录'   '流浪乐章'
  '匣里日月'     '西风秘典'     '忍冬之果'
  '四风原典'     '天空之卷'     '尘世之锁'     '不灭月华'
  # 长柄武器
  '黑缨枪'       '钺矛'         '白缨枪'
  '决斗之枪'     '龙脊长枪'     '喜多院十文字' '宗室猎枪'     '流月针'
  '匣里灭辰'     '千岩长枪'     '试作星镰'     '西风长枪'     '黑岩刺枪'
  '「渔获」'     '断浪长鳍'
  '护摩之杖'     '天空之脊'     '和璞鸢'       '贯虹之槊'     '薙草之稻光'
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
  # 天赋、武器突破素材
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
  '浮游干核'     '浮游幽核'     '浮游晶化核'
  '隐兽指爪'     '隐兽利爪'     '隐兽鬼爪'
  # 世界 BOSS
  '雷光棱镜'     '玄岩之塔'     '飓风之种'     '晶凝之华'     '阴燃之珠'
  '常燃火种'     '极寒之核'
  '净水之心'     '雷霆数珠'
  '未熟之玉'     '魔偶机心'     '恒常机关之心'
  # 周本 BOSS
  '北风的魂匣'   '北风之环'     '北风之尾'
  '东风的吐息'   '东风之翎'     '东风之爪'
  '鎏金之鳞'     '龙王之冕'     '血玉之枝'
  '狱火之蝶'     '灰烬之心'     '熔毁之刻'
  '魔王之刃·残片'  '吞天之鲸·只角'  '武炼之魂·孤影'
  # 天赋本
  '「自由」的教导' '「自由」的指引' '「自由」的哲学'
  '「诗文」的教导' '「诗文」的指引' '「诗文」的哲学'
  '「抗争」的教导' '「抗争」的指引' '「抗争」的哲学'
  '「勤劳」的教导' '「勤劳」的指引' '「勤劳」的哲学'
  '「繁荣」的教导' '「繁荣」的指引' '「繁荣」的哲学'
  '「黄金」的教导' '「黄金」的指引' '「黄金」的哲学'
  '「风雅」的教导' '「风雅」的指引' '「风雅」的哲学'
  '「浮世」的教导' '「浮世」的指引' '「浮世」的哲学'
  '「天光」的教导' '「天光」的指引' '「天光」的哲学'
  # 武器本
  '高塔孤王的残垣' '高塔孤王的断片' '高塔孤王的破瓦' '高塔孤王的碎梦'
  '狮牙斗士的枷锁' '狮牙斗士的理想' '狮牙斗士的镣铐' '狮牙斗士的铁链'
  '凛风奔狼的断牙' '凛风奔狼的怀乡' '凛风奔狼的裂齿' '凛风奔狼的始龀'
  '孤云寒林的光砂' '孤云寒林的辉岩' '孤云寒林的神体' '孤云寒林的圣骸'
  '漆黑陨铁的一角' '漆黑陨铁的一块' '漆黑陨铁的一粒' '漆黑陨铁的一片'
  '雾海云间的汞丹' '雾海云间的金丹' '雾海云间的铅丹' '雾海云间的转还'
  '远海夷地的瑚枝' '远海夷地的金枝' '远海夷地的琼枝' '远海夷地的玉枝'
  '今昔剧画之鬼人' '今昔剧画之虎啮' '今昔剧画之恶尉' '今昔剧画之一角'
  '鸣神御灵的欢喜' '鸣神御灵的明慧' '鸣神御灵的亲爱' '鸣神御灵的勇武'
  # 角色升级材料
  '嘟嘟莲'       '绯樱绣球'     '风车菊'       '钩钩果'       '海灵芝'
  '绝云椒椒'     '琉璃百合'     '琉璃袋'       '落落莓'       '慕风蘑菇'
  '霓裳花'       '蒲公英籽'     '清心'         '塞西莉亚花'   '石珀'
  '小灯草'       '星螺'         '夜泊石'       '鸣草'         '晶化骨髓'
  '珊瑚真珠'     '天云草实'     '血斛'         '幽灯蕈'
)

# ==============================================================================
# 所有的 API 列表和部分文件。
# ==============================================================================
API_CHARACTER_PROFILE='characters/profile'
API_GACHA_ITEMS='gacha/items'
API_MODULE='module'
API_ITEM='item'
API2_ARTIFACT='Version2/artifact'
API2_ARTIFACT_OTHER='Version2/artifact/other'
API2_CHARACTER='Version2/character'
API2_MODULE='Version2/module'
API2_WEAPON='Version2/weapon'
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
# 资源更新代码
# ==============================================================================
function check()
{
  if ! (type 'curl' >/dev/null 2>&1)
  then
    echo 'No curl command found.' >&2
    return 1
  fi

  return 0
}

function fetch()
{
  local api="$1" && shift
  local skipFile="$1" && shift
  local suffix="$1" && shift
  local sources=($@)
  local wdir="${RDIR}/${api}"
  local upstream
  local localpath
  local skipExist
  local fileSuffix

  if [[ -z "$skipFile" ]]
  then
    skipFile=1
  fi

  for src in "${sources[@]}"
  do
    upstream="${api}/${src}${suffix}"
    localpath="${wdir}/${src}${suffix}"
    skipExist=0
    fileSuffix=${upstream##*.}

    mkdir -p $(dirname "$localpath")

    if [[ 1 -eq "$skipFile" ]]
    then
      skipExist=1
    fi

    if [[ 1 -eq "$skipExist" ]]
    then
      if [[ -e "$localpath" ]]
      then
        # Override any XML files
        dealXML '' '' "$localpath"

        if [[ 0 -eq "$?" ]]
        then
          echo -e "Exist\t${upstream}"
          continue
        fi
      fi
    fi

    echo -e "Fetch\t${upstream}"
    command "${CURL[@]}" "${API}/${upstream}" -o "$localpath"

    # If get XML file, try to checkout it
    dealXML \
      'git ls-files --error-unmatch {} >/dev/null 2>&1 && git checkout -q {}' \
      'Revert' \
      "$localpath"
  done
}

# About the second parameter cmd ...
#   1. If it contains the string "{}", then "{}" will be replaced with the file path
#   2. If not, then the file path will be automatically added to the end
function dealFIle()
{
  local type="$1" && shift
  local cmd="$1" && shift
  local msg="$1" && shift
  local files=($@)
  local found=0

  for file in "${files[@]}"
  do
    if [[ -n "$type" ]]
    then
      if [[ "$type" != $(file --mime-type "$file" | \
                            cut -d: -f2 | tr -d '[:space:]') ]]
      then
        continue
      fi
    fi

    found=1

    if [[ -n "$msg" ]]
    then
      echo -e "${msg}\t${file}"
    fi

    if [[ -n "$cmd" ]]
    then
      if ( echo "$cmd" | grep '{}' >/dev/null 2>&1 )
      then
        cmd=$(echo "$cmd" | sed "s|{}|${file}|g")
        env -iS "bash -c '$cmd'"
      else
        env -iS "$cmd" "$file"
      fi
    fi
  done

  # Bash returns an errcode here range 0 to 255,
  # but we treat it as a boolean so it’s enough to use.
  # XXX It is strange to use errcode as a boolean
  return "$found"
}

function dealXML()
{
  local cmd="$1" && shift
  local msg="$1" && shift
  local files=($@)

  dealFIle 'text/xml' "$cmd" "$msg" "${files[@]}"

  return "$?"
}

function getOtherFiles()
{
  fetch '' 0 '' "${OTHER_FILES[@]}"
}

function getGacha()
{
  fetch "$API_GACHA_ITEMS" 0 '' "${API_GACHA_ITEMS_FILES[@]}"
}

function getMoudle()
{
  fetch "$API_MODULE" 0 '' "${API_MODULE_FILES[@]}"
  fetch "$API2_MODULE" 0 '' "${API2_MODULE_FILES[@]}"
}

function getWeapon()
{
  fetch "$API2_WEAPON" 1 '.png' "${WEAPONS[@]}"
}

function getItem()
{
  fetch "$API_ITEM" 0 '' "${API_ITEM_FILES[@]}"
  fetch "$API_ITEM" 1 '.png' "${HOMES[@]}"
  fetch "$API_ITEM" 1 '.png' $(seq 1 5)
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

  fetch "$API2_INFO_DOCS" 0 '.json' "${CHARS[@]}"
  fetch "$API2_INFO_DOCS" 0 '.json' "${WEAPONS[@]}"
  fetch "$API2_INFO_OTHER" 0 '' "${files[@]}"
  fetch "$API2_INFO_IMAGE" 1 '.png' "${MATERIALS[@]}"
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

  fetch "$API2_ARTIFACT" 0 '' "${API2_ARTIFACT_FILES[@]}"
  fetch "$API2_ARTIFACT" 1 '' "${files[@]}"
  fetch "$API2_ARTIFACT_OTHER" 1 '.png' $(seq 1 5)
  fetch "$API2_ARTIFACT_OTHER" 0 '' "${API2_ARTIFACT_OTHER_FILES[@]}"
}

function getCharacter()
{
  fetch "$API_CHARACTER_PROFILE" 1 '.png' "${CHARIDS[@]}"
  fetch "$API2_CHARACTER" 1 '.png' "${CHARIDS[@]}"
}

function getWish()
{
  local files=()

  fetch "$API2_WISH_CONFIG" 0 '' "${API2_WISH_CONFIG_FILES[@]}"
  fetch "$API2_WISH_CHARACTER" 1 '.png' "${CHARS[@]}"
  fetch "$API2_WISH_WEAPON" 1 '.png' "${WEAPONS[@]}"
}

# ==============================================================================
# 后期处理
# ==============================================================================
function syncCustom()
{
  local files=($(find "$CUSTOM_RES" -type f))
  local rpath
  local thisdir

  for file in "${files[@]}"
  do
    rpath="${file##${CUSTOM_RES}}"
    thisdir="${RDIR}/$(dirname ${rpath})"

    echo -e "Custom\t${rpath}"
    mkdir -p "$thisdir"
    cp -f "$file" "$thisdir"
  done
}

function listXML()
{
  local files=($(find "$RDIR" -type f))
  local hasXML=0

  echo 'Search and delete XML files ...'

  # 阿里云 OSS 请求不到的资源会返回一个 XML 文件，删除这些垃圾文件
  dealXML 'rm -f {}' 'Delete' "${files[@]}"
  hasXML="$?"

  if [[ 0 -eq "$hasXML" ]]
  then
    echo "No XML files found, everything is perfect."
  fi
}

# MAIN
{
  check || exit 1

  getOtherFiles
  getGacha
  getMoudle
  getWeapon
  getItem
  getInfo
  getArtifacts
  getCharacter
  getWish

  syncCustom
  listXML
}

