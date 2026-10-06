/* 序章劇本：星髓之流
   每一章一個檔案，匯出場景表（id → 場景函式），由 main.js 註冊進核心。 */
import {
  G, $, isEvil, pushLog, pushTitle, setChoices, go, rollCheck, refresh, save, wipeSave,
} from '../js/core.js';
import { startBattle } from '../js/battle.js';
import { learnSkill, learnOriginSkill } from '../js/skills.js';
import { addItem, hasItem, removeItem } from '../js/inventory.js';

const GUARD = { name: '神籠警備兵', hp: 22, maxHp: 22, atk: 4 };
const GOBLIN = { name: '哥布林戰士', hp: 18, maxHp: 18, atk: 3 };

/* 擊敗警備兵後的戰利品 */
function guardLoot() {
  pushLog('警備兵倒下了。你從他身上搜出了一張識別卡和一瓶星髓濃縮液。');
  addItem('shinraCard');
  addItem('starVial');
  go('p3');
}

export const PROLOGUE = {

  /* —— 第一幕：鋼鐵之城 —— */
  p1() {
    pushTitle('序章 · 星髓之流');
    pushLog('雨，落在鋼鐵都市「米德加雅」的天頂之上，再沿著八座巨大的星髓爐往下淌，淌成綠色的、發著微光的細流。');
    pushLog('星髓——這顆星球的血液。巨企「神籠公司」把它從地脈裡抽出來，點亮上城的霓虹，餵飽董事會的笑容。而下城的人們只分到鐵鏽味的雨。');
    if (isEvil()) {
      pushLog('你蜷縮在一個名叫凱爾的青年心底。他是反抗組織「餘燼」的爆破手，而你是他不敢承認的那部分——每次他猶豫，你就替他想著：<i>燒掉它，全部燒掉。</i>', 'evil');
      pushLog('「目標是五號星髓爐。」隊長低沉的嗓音從耳機傳來，「放完炸藥就撤。凱爾，手別抖。」');
      pushLog('你感覺宿主的心跳在加速。真可愛。要不要……幫他一把？', 'evil');
    } else {
      const intro = {
        knight: '你把曾屬於神籠親衛隊的劍背在背上，走在自己曾經守護過的管線之間。今晚，你要炸掉它。',
        mage: '你的指尖貼著管壁，能感覺到星髓在裡面哀鳴。身為研究它半生的學者，你比誰都清楚——星球正在死去。',
        rogue: '下水道的路你閉著眼都會走。只是這次背包裡裝的不是偷來的物資，而是足以掀翻一座星髓爐的炸藥。',
      }[G.origin];
      pushLog('你——' + G.name + '——是反抗組織「餘燼」的一員。' + intro);
      pushLog('「目標是五號星髓爐。」隊長的聲音從耳機傳來，「放完炸藥就撤。星球撐不到我們慢慢來。」');
    }
    setChoices([
      { tag: '前進', text: '沉默地跟上隊伍，直取爐心', fn: () => go('p2') },
      {
        tag: '感知', text: '停下腳步，觀察四周的動靜',
        fn: () => rollCheck('感知', 'int', 10,
          () => { G.flags.scout = true; pushLog('你在蒸汽的縫隙間捕捉到了規律的腳步聲——兩名警備兵，每九十秒一輪巡邏。你記下了空檔。', 'system'); go('p2'); },
          () => { pushLog('蒸汽與雨聲糊成一片，你什麼也沒聽出來，只覺得管線深處有什麼東西在低鳴。'); go('p2'); }),
      },
      ...(isEvil() ? [{
        tag: '邪念', text: '對宿主低語：「別怕。把恐懼交給我。」', evil: true,
        fn: () => { G.flags.fed = true; pushLog('凱爾的呼吸忽然平穩下來。他不知道為什麼自己不抖了——但你知道。你咬下了他的一小口恐懼，又香又涼，像薄荷。你稍微，變大了一點。', 'evil'); G.maxMp += 2; G.mp += 2; refresh(); go('p2'); },
      }] : []),
    ]);
  },

  p2() {
    pushLog('五號星髓爐的爐心室像一座倒置的大教堂。巨大的抽取脈管刺進地底，每抽動一次，整個空間就亮起一陣垂死的綠光。');
    pushLog('炸藥安放完畢。倒數計時器亮起紅色的「10:00」。');
    pushLog('就在這時——警報响了。隔離閘門轟然落下，一名神籠警備兵端著電磁步槍堵在唯一的出口。');
    pushLog('「餘燼的老鼠。」他扣下保險，「董事會懸賞你們的腦袋，很久了。」', 'speech');
    setChoices([
      { tag: '戰鬥', text: '拔出武器——沒時間了，打穿他', fn: () => startBattle(GUARD, guardLoot) },
      {
        tag: '魅力', text: '攤開手：「爐子要炸了，你想領賞金還是想活命？」',
        fn: () => rollCheck('說服', 'cha', G.flags.scout ? 10 : 13,
          () => { pushLog('警備兵的視線飄向倒數計時器。三秒後，他罵了一句髒話，轉身跑了。', 'system'); pushLog('「……薪水沒多到陪你們陪葬。」他的聲音消失在走廊深處。', 'speech'); go('p3'); },
          () => { pushLog('「少廢話！」電磁步槍的槍口亮起藍光——談判破裂。'); startBattle(GUARD, guardLoot); }),
      },
      ...(isEvil() ? [{
        tag: '邪念', text: '透過宿主的眼睛凝視他：「跪下。」', evil: true,
        fn: () => rollCheck('支配', 'cha', 12,
          () => { pushLog('你的低語繞過耳朵，直接滴進他的腦髓。警備兵的膝蓋一軟，跪倒在金屬地板上，瞳孔裡只剩下空洞的綠光。', 'evil'); pushLog('凱爾嚇壞了：「我、我剛剛做了什麼……？」你沒有回答。你在品嚐那份服從的甜味——順手，讓宿主摸走了他的識別卡。', 'evil'); addItem('shinraCard'); go('p3'); },
          () => { pushLog('低語擦過他的意識，只讓他打了個寒顫。「什麼鬼……？」他抬起了槍。', 'evil'); startBattle(GUARD, guardLoot); }),
      }] : []),
    ]);
  },

  p3() {
    pushLog('倒數三十秒。你們狂奔在懸空的維修橋上，腳下是直通地脈的抽取井，深得看不見底。');
    pushLog('然後——爆炸提前了。');
    pushLog('不是你們的炸藥。是星髓爐自己。過度抽取的地脈像一條被踩住尾巴的龍，整座爐心從內側炸開，綠色的光柱衝天而起，撕裂了米德加雅的夜空。');
    pushLog('維修橋斷裂。失重。' + (isEvil() ? '凱爾的身體' : '你的身體') + '墜向抽取井的深淵，墜向星球的血管。');
    if (isEvil()) pushLog('在墜落中，宿主的生命像沙一樣從你指縫流走。凱爾死了。而你——寄生於他心底的邪念——第一次，獨自存在於世界上。', 'evil');
    pushLog('墜入星髓之流的瞬間，你聽見了。不是水聲。是<b>無數的聲音</b>——這顆星球上所有死去的、活著的、尚未出生的意識，在綠色的洪流裡同時低語。');
    pushLog('「<i>又一個回來了。</i>」「<i>好冷。</i>」「<i>別讓神籠找到核心——</i>」「<i>想活下去嗎？</i>」', 'speech');
    setChoices([
      { tag: '意志', text: '「想。我還不能死在這裡。」', fn: () => { G.flags.will = 'live'; go('p4'); } },
      { tag: '執念', text: '「神籠……我要親手終結神籠。」', fn: () => { G.flags.will = 'revenge'; go('p4'); } },
      ...(isEvil() ? [{ tag: '邪念', text: '「我想要的，是吞下這整條星髓之流。」', evil: true, fn: () => { G.flags.will = 'devator'; pushLog('洪流彷彿安靜了一拍。然後，某個古老的聲音輕笑了：「<i>多麼坦率的飢餓。好，就讓你保留這份胃口。</i>」', 'evil'); go('p4'); } }] : []),
    ]);
  },

  /* —— 第二幕：轉生 —— */
  p4() {
    pushTitle('轉生 · 黑暗中的黏體');
    pushLog('……');
    pushLog('…………');
    pushLog('意識回來的時候，世界是全黑的。沒有光。沒有聲音。沒有痛覺——等等，連「身體的形狀」都不對。');
    pushLog('你試著動了動。某種柔軟的、有彈性的東西「啵嘟」一聲晃了一下。');
    pushLog('《通知。確認個體再構成完畢。種族：史萊姆。》', 'system');
    pushLog('一個沒有抑揚頓挫的聲音直接在意識裡響起，像世界本身在唸系統公告。');
    pushLog('《補充說明：本個體由星髓之流回收之意識殘片重構而成。原肉體：損毀。原種族：' + (isEvil() ? '無（精神寄生體）。評價：罕見。' : '人類。') + '》', 'system');
    pushLog('史萊姆。你轉生成了一隻史萊姆。在這個星球的某個黑暗的角落。');
    setChoices([
      { tag: '冷靜', text: '先確認現狀——這裡是哪裡？我能做什麼？', fn: () => go('p5') },
      { tag: '吶喊', text: '（在心裡）等一下！為什麼是史萊姆！？', fn: () => { pushLog('《回答：構成素材不足。墜入流中的意識若無完整肉體記憶，將以最低魔物形態重構。》', 'system'); pushLog('《補充：請放心。本形態成長上限：未測定。》', 'system'); pushLog('……未測定。這句話莫名地讓你安心了一點，又莫名地讓你背脊發涼。'); go('p5'); } },
    ]);
  },

  p5() {
    G.flags.slime = true;
    G.maxHp += 6; G.hp = G.maxHp; G.mp = G.maxMp;
    refresh();
    pushLog('看不見，聽不見。但你發現只要集中精神，周圍的「魔素」就會在意識裡浮現出淡淡的輪廓——');
    const afterSense = (crit) => {
      learnSkill('sense');
      pushLog('「視野」打開的瞬間，你倒抽了一口不存在的氣。');
      pushLog('這是一座巨大的洞窟，岩壁上長滿發著青光的水晶。而洞窟的最深處——隔著一道由無數發光封印文字織成的牢籠——蜷伏著一條<b>龍</b>。');
      if (crit) pushLog('你的感知足夠銳利，甚至「看」見了封印文字的縫隙：那道牢籠，已經有三百年沒有人補修過了。', 'system');
      go('p6');
    };
    setChoices([
      {
        tag: '智力', text: '集中精神，試著掌握這種感知方式',
        fn: () => rollCheck('魔力感知', 'int', 9,
          () => afterSense(true),
          () => { pushLog('精神一散，世界又沉回黑暗。你像果凍一樣原地癱了一會兒，重新再試——這次，抓到了。'); afterSense(false); }),
      },
    ]);
  },

  p6() {
    pushLog('「<b>哦——？</b>」', 'speech');
    pushLog('龍睜開了眼睛。僅僅是視線，就讓整個洞窟的魔素掀起風暴。');
    pushLog('「三百年了。第一個滾進這座牢獄的活物，居然是一隻史萊姆。」龍的聲音像雷在雲層裡滾動，「本座乃蒼雷龍維爾汎——曾以一己之力撕裂神籠艦隊、而後被星球親手封印於此的，暴風之王。」', 'speech');
    pushLog('「如何，小東西。怕了嗎？」', 'speech');
    setChoices([
      {
        tag: '魅力', text: '「不怕。比起怕，我比較好奇你為什麼被關在這。」',
        fn: () => rollCheck('膽量', 'cha', 11,
          () => { pushLog('龍愣了一瞬，隨即放聲大笑，笑得整座洞窟的水晶嗡嗡作響。「有趣！三百年了，終於來了個不發抖的！」', 'speech'); G.flags.dragonFriend = true; go('p7'); },
          () => { pushLog('你想表現得從容，但身體很誠實——整坨黏體抖得像布丁。龍嗤笑一聲：「嘴硬的果凍。不過，本座欣賞嘴硬。」', 'speech'); G.flags.dragonFriend = true; go('p7'); }),
      },
      { tag: '坦率', text: '「怕。但我剛死過一次，怕也沒什麼用了。」', fn: () => { pushLog('「……哈。」龍的金色眼瞳瞇了起來，「死過的傢伙講話就是不一樣。本座喜歡。」', 'speech'); G.flags.dragonFriend = true; go('p7'); } },
      ...(isEvil() ? [{
        tag: '邪念', text: '凝視封印的縫隙：「你想出去嗎？我們可以做個交易。」', evil: true,
        fn: () => { G.flags.dragonDeal = true; pushLog('洞窟安靜了整整十秒。然後龍緩緩壓低了頭顱，金瞳貼近封印，第一次認真地「看」你。', 'evil'); pushLog('「……你這傢伙，不是普通的轉生者。那股味道——是『深淵』那邊的東西吧。」它咧開滿口雷光的長牙，「好啊。本座就聽聽，一坨邪念能開出什麼價碼。」', 'speech'); go('p7'); } },
      ] : []),
    ]);
  },

  p7() {
    pushLog('你和龍聊了很久。久到忘記時間——反正史萊姆不會累。');
    pushLog('維爾汎告訴你：這裡是「封龍峽谷」最深處，米德加雅以北三百里。星球把過剩的力量封印於此，而神籠這幾年一直在峽谷外圍鑽探——他們想把龍當成新的能源。');
    pushLog('「星髓爐炸了一座？」龍哼了一聲，「那只是開始。星球的忍耐是有限度的。小東西，你在流裡聽見的那些聲音，遲早會變成怒吼。」', 'speech');
    if (G.flags.dragonDeal) {
      pushLog('「至於交易——」龍的聲音壓得很低，「替本座撕開這道封印。作為代價，本座的力量、本座的名號，隨你取用。」', 'speech');
      pushLog('你還沒有答應。但你們都知道，這個約定已經在黑暗裡生了根。', 'evil');
    } else if (G.flags.dragonFriend) {
      pushLog('「喂，小東西。」龍忽然說，「陪本座解了三百年來第一次悶。按古龍的規矩，得回個禮——本座將名予你。」', 'speech');
    }
    pushLog('「從今往後，你就叫——<b>' + G.name + '·泰恩</b>。『泰恩』，是風暴眷顧之意。」', 'speech');
    pushLog('《通知。獲得「名字」。魔素容量擴張。》', 'system');
    G.maxMp += 8; G.mp = G.maxMp; G.maxHp += 4; G.hp = G.maxHp;
    refresh();
    pushLog('名字落在身上的瞬間，全身的魔素沸騰了。原來「被命名」是這種感覺——像有人在你的存在上，輕輕蓋了一個「你可以活下去」的印章。');
    pushLog('沸騰的魔素裡，前世記憶中沉睡的力量，也跟著甦醒了一角——');
    learnOriginSkill(1);
    setChoices([
      { tag: '繼續', text: '「維爾汎，我去外面看看。總得先搞清楚這個身體能做什麼。」', fn: () => go('p8') },
    ]);
  },

  p8() {
    pushLog('離開龍之牢籠，你沿著魔素的氣流往洞窟淺層移動。半路上，「視野」裡浮現出一堆白骨——某個冒險者的遺骸，旁邊散落著一個皮袋、一把鏽劍，和幾株在屍骸養分上長出的回復藥草。');
    pushLog('《檢測到可解析物質。提案：使用固有技能【捕食】。》', 'system');
    pushLog('【捕食】。把東西吞進體內，解析、收為己用。這就是史萊姆的生存方式。');
    const doDevour = (mourned) => {
      learnSkill('devour');
      pushLog('身體無聲地張開，把遺物一齊捲入。體內傳來奇妙的酥麻——《解析完了。》', 'system');
      addItem('herb', 2);
      addItem('rustSword');
      addItem('manaCrystal');
      pushLog('《回復藥草：已精製，可隨時取用。鏽劍：已解析，可由黏體具現化——請於側欄裝備。岩壁水晶：取得魔素結晶。》', 'system');
      if (mourned) pushLog('白骨在捕食的微光中安靜地散去，像終於被允許休息。');
      else pushLog(isEvil()
        ? '懷念的感覺。你還是邪念的時候，吞的是恐懼和慾望；現在你有了身體，能吞的東西——可就多了。'
        : '有點不可思議。明明是吞食，卻不覺得殘忍，倒像是這具身體與生俱來的禮儀：萬物入流，皆有去處。', isEvil() ? 'evil' : '');
      go('p9');
    };
    setChoices([
      { tag: '捕食', text: '吞下遺物，試試這個身體的本事', evil: isEvil(), fn: () => doDevour(false) },
      { tag: '默哀', text: '先對著遺骸靜默片刻，再進行捕食', fn: () => { pushLog('你對白骨靜默了一會兒。不知道他是誰、為何死在這裡——但三百年來第一個路過的，至少可以記得他存在過。'); G.flags.mourned = true; doDevour(true); } },
    ]);
  },

  p9() {
    pushLog('洞窟的出口透進第一縷天光時，你也撞見了這具身體的第一批「鄰居」——三隻哥布林，正圍著一隻被陷阱夾住的角兔，吵著怎麼分。');
    pushLog('最壯的那隻先發現了你。「史萊姆？」牠咧嘴露出黃牙，舉起木棒，「運氣好！今天加菜！」', 'speech');
    const goblinWin = () => { pushLog('剩下兩隻哥布林面面相覷，丟下木棒落荒而逃，連角兔都忘了拿。'); go('p10'); };
    setChoices([
      { tag: '戰鬥', text: '加菜的是我。——迎戰！', fn: () => startBattle(GOBLIN, goblinWin) },
      {
        tag: '威嚇', text: '釋放全身魔素：「滾。不然連你們一起吞。」',
        fn: () => rollCheck('威嚇', G.stats.cha >= G.stats.str ? 'cha' : 'str', 12,
          () => { pushLog('被命名強化過的魔素轟然炸開。三隻哥布林的腿同時軟了——牠們大概一輩子沒見過會散發龍之氣息的史萊姆。「魔、魔物大人對不起——！」逃跑的速度快得留下殘影。', 'system'); G.flags.goblinFear = true; go('p10'); },
          () => { pushLog('魔素放是放出來了，但形狀軟趴趴的，像在發光的麻糬。哥布林愣了兩秒，笑出聲來，舉著木棒衝了上來！'); startBattle(GOBLIN, goblinWin); }),
      },
      {
        tag: '魅力', text: '「等等。那隻角兔給你們，我幫你們解陷阱，交個朋友？」',
        fn: () => rollCheck('交涉', 'cha', 11,
          () => { pushLog('哥布林們交頭接耳了半天。最後最壯的那隻收起木棒，警惕地點了點頭。你用體內儲存的鐵成分撬開了陷阱。', 'system'); pushLog('「……奇怪的史萊姆。」牠把角兔扛上肩，丟下一句，「東邊的洞別去，有大蜈蚣。村子在北邊。」——你在這個世界的第一份情報，來自哥布林。', 'speech'); G.flags.goblinAlly = true; go('p10'); },
          () => { pushLog('「史萊姆會講話！」三隻哥布林嚇得炸毛，反而覺得你是什麼不祥的妖物，怪叫著舉棒衝來！'); startBattle(GOBLIN, () => { pushLog('剩下兩隻哥布林哭著跑了。交朋友失敗。'); go('p10'); }); }),
      },
      ...(hasItem('herb') ? [{
        tag: '道具', text: '取出一株回復藥草丟過去：「給。那隻兔子腿斷了，敷這個。」',
        fn: () => {
          removeItem('herb', 1);
          pushLog('《使用道具：回復藥草。》', 'system');
          pushLog('哥布林戰戰兢兢地撿起藥草，嗅了嗅，眼睛亮了。牠們嘰嘰喳喳地替角兔敷上藥，最壯的那隻回頭看你的眼神，已經從「食物」變成了「恩人」。');
          pushLog('「好史萊姆！」牠用力拍胸，「北邊村子，你來，我們罩你！東邊的洞別去，有大蜈蚣！」——你在這個世界的第一批朋友，是三隻哥布林。', 'speech');
          G.flags.goblinAlly = true;
          go('p10');
        },
      }] : []),
    ]);
  },

  /* —— 尾聲 —— */
  p10() {
    pushTitle('尾聲 · 受傷的天空');
    pushLog('你滾出洞窟，第一次用這具身體看見天空。');
    pushLog('封龍峽谷的夜空本該綴滿星星。但南方的地平線上，懸著一片不自然的綠色光暈——三百里外，米德加雅的方向。被炸開的五號星髓爐仍在燃燒，星球的血在夜空裡發著光。');
    pushLog('「看見了吧。」維爾汎的聲音穿過岩層，直接響在你的意識裡——名字的連結，「那就是你死去的地方，也是一切開始的地方。神籠不會停手。星球也不會。」', 'speech');
    if (G.flags.will === 'revenge') pushLog('星髓之流裡你許下的那句話，又浮了上來：<i>我要親手終結神籠。</i>現在的你只是一隻史萊姆。但「現在」，從來不是終點。');
    else if (G.flags.will === 'devator') pushLog('你「望」著那條燃燒的綠光，體內某個深處的飢餓輕輕動了一下。總有一天，連那條洪流，你都要嚐嚐味道。', 'evil');
    else pushLog('你許過的願望很簡單：活下去。但看著那片受傷的天空，你隱約明白——在這個星球上，「活下去」這件事，從來都不簡單。');
    if (G.flags.goblinAlly) pushLog('北邊，哥布林說的村落方向，升起了幾縷炊煙。');
    if (hasItem('shinraCard')) pushLog('體內深處，那張神籠識別卡安靜地躺著。總有一天，它會替你打開某扇不該打開的門。', 'system');
    pushLog('「去吧，' + G.name + '·泰恩。」龍說，「去看看這個爛掉一半的世界。然後回來告訴本座——它還值不值得救。」');
    pushLog('話音落下的同時，一縷細小的雷光穿過封印，落進你的黏體——龍的臨別贈禮，把你體內最深處的力量又敲開了一層。', 'speech');
    learnOriginSkill(2);
    pushLog('黏體在月光下輕輕晃了一下，算是點頭。');
    pushLog('你朝著炊煙與綠光之間的荒野，滾出了第一步。');
    const log = $('log');
    const card = document.createElement('div');
    card.className = 'end-card';
    card.innerHTML = '<div class="zh">序 章 完</div><div class="en">— Prologue End · 第一章「哥布林的村落」製作中 —</div>';
    log.appendChild(card);
    log.scrollTop = log.scrollHeight;
    G.scene = 'end';
    save();
    setChoices([
      { tag: '重來', text: '以另一個起源，重新經歷序章', fn: () => { wipeSave(); location.reload(); } },
      { tag: '離開', text: '回到花園首頁', fn: () => { location.href = '/'; } },
    ]);
  },
};
