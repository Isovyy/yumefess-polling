// @ts-check
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function normalizeFandom(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ')
}

function normalizeCharacter(s) {
  return s.toLowerCase().trim().split(/\s+/).sort().join(' ')
}

const DATA = [
  {
    name: "A3!",
    characters: [
      // Spring Troupe
      { canonicalName: "Sakuya Sakuma", aliases: ["Sakuya Sakuma","Sakuma Sakuya","Sakuma"] },
      { canonicalName: "Masumi Usui", aliases: ["Masumi Usui","Usui Masumi","Usui"] },
      { canonicalName: "Itaru Chigasaki", aliases: ["Itaru Chigasaki","Chigasaki Itaru","Chigasaki"] },
      { canonicalName: "Yuki Rurikawa", aliases: ["Yuki Rurikawa","Rurikawa Yuki","Rurikawa"] },
      // Summer Troupe
      { canonicalName: "Tenma Sumeragi", aliases: ["Tenma Sumeragi","Sumeragi Tenma","Sumeragi"] },
      { canonicalName: "Muku Sakisaka", aliases: ["Muku Sakisaka","Sakisaka Muku","Sakisaka"] },
      { canonicalName: "Taichi Nanao", aliases: ["Taichi Nanao","Nanao Taichi","Nanao"] },
      // Autumn Troupe
      { canonicalName: "Banri Settsu", aliases: ["Banri Settsu","Settsu Banri","Settsu"] },
      { canonicalName: "Omi Fushimi", aliases: ["Omi Fushimi","Fushimi Omi","Fushimi"] },
      // Winter Troupe
      { canonicalName: "Tsumugi Tsukioka", aliases: ["Tsumugi Tsukioka","Tsukioka Tsumugi","Tsukioka"] },
      { canonicalName: "Azuma Yukishiro", aliases: ["Azuma Yukishiro","Yukishiro Azuma","Yukishiro"] },
    ],
  },
  {
    name: "Aoppella!?",
    characters: [
      { canonicalName: "Asaharu Soenji", aliases: ["Asaharu Soenji"] },
    ],
  },
  {
    name: "Arknights",
    characters: [
      { canonicalName: "Elysium", aliases: ["Elysium"] },
      { canonicalName: "Logos", aliases: ["Logos"] },
      { canonicalName: "Skadi", aliases: ["Skadi"] },
      { canonicalName: "Thorns", aliases: ["Thorns"] },
    ],
  },
  {
    name: "Arknights: Endfield",
    characters: [
    ],
  },
  {
    name: "Blue Lock",
    characters: [
      { canonicalName: "Bachira Meguru", aliases: ["Bachira Meguru", "Meguru Bachira"] },
      { canonicalName: "Barou Shoei", aliases: ["Barou Shoei", "Shoei Barou"] },
      { canonicalName: "Chigiri Hyoma", aliases: ["Chigiri Hyoma", "Hyoma Chigiri"] },
      { canonicalName: "Isagi Yoichi", aliases: ["Isagi Yoichi", "Yoichi Isagi"] },
      { canonicalName: "Itoshi Rin", aliases: ["Itoshi Rin", "Rin Itoshi"] },
      { canonicalName: "Itoshi Sae", aliases: ["Itoshi Sae", "Sae Itoshi"] },
      { canonicalName: "Michael Kaiser", aliases: ["Michael Kaiser"] },
      { canonicalName: "Nagi Seishiro", aliases: ["Nagi Seishiro", "Seishiro Nagi"] },
      { canonicalName: "Mikage Reo", aliases: ["Mikage Reo", "Reo Mikage"] },
    ],
  },
  {
    name: "Break My Case",
    characters: [
      { canonicalName: "Akehoshi Hinomiya", aliases: ["Akehoshi Hinomiya"] },
    ],
  },
  {
    name: "Bungou Stray Dogs",
    fandomAliases: ["Bungo Stray Dogs", "BSD"],
    characters: [
      { canonicalName: "Akutagawa Ryunosuke", aliases: ["Akutagawa Ryunosuke","Akutagawa"] },
      { canonicalName: "Atsushi Nakajima", aliases: ["Atsushi Nakajima","Atsushi"] },
      { canonicalName: "Chuuya Nakahara", aliases: ["Chuuya Nakahara","Chuuya"] },
      { canonicalName: "Fyodor Dostoevsky", aliases: ["Fyodor Dostoevsky","Fyodor","Dostoyevsky"] },
      { canonicalName: "Nikolai Gogol", aliases: ["Nikolai Gogol","Gogol"] },
      { canonicalName: "Osamu Dazai", aliases: ["Osamu Dazai","Dazai"] },
      { canonicalName: "Ranpo Edogawa", aliases: ["Ranpo Edogawa","Ranpo"] },
    ],
  },
  {
    name: "Demon Slayer",
    fandomAliases: ["kny", "kimetsu no yaiba"],
    characters: [
      { canonicalName: "Akaza", aliases: ["Akaza"] },
      { canonicalName: "Douma", aliases: ["Douma","Doma"] },
      { canonicalName: "Iguro Obanai", aliases: ["Iguro Obanai","Obanai"] },
      { canonicalName: "Kibutsuji Muzan", aliases: ["Kibutsuji Muzan","Muzan"] },
      { canonicalName: "Rengoku Kyojuro", aliases: ["Rengoku Kyojuro","Rengoku"] },
      { canonicalName: "Sanemi Shinazugawa", aliases: ["Sanemi Shinazugawa","Sanemi"] },
      { canonicalName: "Tomioka Giyuu", aliases: ["Tomioka Giyuu","Giyuu"] },
      { canonicalName: "Uzui Tengen", aliases: ["Uzui Tengen","Uzui"] },
      { canonicalName: "Muzan Kibutsuji", aliases: ["Muzan Kibutsuji","Kibutsuji Muzan","Muzan"] },
    ],
  },
  {
    name: "Detective Conan",
    characters: [
      { canonicalName: "Morofushi Hiromitsu", aliases: ["Morofushi Hiromitsu"] },
    ],
  },
  {
    name: "Ensemble Stars",
    fandomAliases: ["enstars"],
    characters: [
      { canonicalName: "Akehoshi Subaru", aliases: ["Akehoshi Subaru","Subaru"] },
      { canonicalName: "Amagi Hiiro", aliases: ["Amagi Hiiro","Hiiro"] },
      { canonicalName: "Amagi Rinne", aliases: ["Amagi Rinne","Rinne"] },
      { canonicalName: "Aoba Tsumugi", aliases: ["Aoba Tsumugi","Tsumugi"] },
      { canonicalName: "Aoi Hinata", aliases: ["Aoi Hinata","Hinata"] },
      { canonicalName: "Aoi Yuta", aliases: ["Aoi Yuta","Yuta"] },
      { canonicalName: "Ayase Mayoi", aliases: ["Ayase Mayoi","Mayoi"] },
      { canonicalName: "Fushimi Yuzuru", aliases: ["Fushimi Yuzuru","Yuzuru"] },
      { canonicalName: "Hakaze Kaoru", aliases: ["Hakaze Kaoru","Kaoru"] },
      { canonicalName: "Harukawa Sora", aliases: ["Harukawa Sora","Sora"] },
      { canonicalName: "Hasumi Keito", aliases: ["Hasumi Keito","Keito"] },
      { canonicalName: "HiMERU", aliases: ["HiMERU"] },
      { canonicalName: "Hibiki Wataru", aliases: ["Hibiki Wataru","Wataru"] },
      { canonicalName: "Hidaka Hokuto", aliases: ["Hidaka Hokuto","Hokuto"] },
      { canonicalName: "Himemiya Tori", aliases: ["Himemiya Tori","Tori"] },
      { canonicalName: "Isara Mao", aliases: ["Isara Mao","Mao"] },
      { canonicalName: "Itsuki Shu", aliases: ["Itsuki Shu","Shu"] },
      { canonicalName: "Kagehira Mika", aliases: ["Kagehira Mika","Mika"] },
      { canonicalName: "Kanzaki Souma", aliases: ["Kanzaki Souma","Souma"] },
      { canonicalName: "Kazehaya Tatsumi", aliases: ["Kazehaya Tatsumi","Tatsumi"] },
      { canonicalName: "Kiryu Kuro", aliases: ["Kiryu Kuro","Kuro"] },
      { canonicalName: "Mashiro Tomoya", aliases: ["Mashiro Tomoya","Tomoya"] },
      { canonicalName: "Mikejima Madara", aliases: ["Mikejima Madara","Madara"] },
      { canonicalName: "Morisawa Chiaki", aliases: ["Morisawa Chiaki","Chiaki"] },
      { canonicalName: "Nagumo Tetora", aliases: ["Nagumo Tetora","Tetora"] },
      { canonicalName: "Narukami Arashi", aliases: ["Narukami Arashi","Arashi"] },
      { canonicalName: "Nito Nazuna", aliases: ["Nito Nazuna","Nazuna"] },
      { canonicalName: "Oogami Koga", aliases: ["Oogami Koga","Koga"] },
      { canonicalName: "Otogari Adonis", aliases: ["Otogari Adonis","Adonis"] },
      { canonicalName: "Oukawa Kohaku", aliases: ["Oukawa Kohaku","Kohaku"] },
      { canonicalName: "Ran Nagisa", aliases: ["Ran Nagisa","Nagisa"] },
      { canonicalName: "Saegusa Ibara", aliases: ["Saegusa Ibara","Ibara"] },
      { canonicalName: "Sakasaki Natsume", aliases: ["Sakasaki Natsume","Natsume"] },
      { canonicalName: "Sakuma Rei", aliases: ["Sakuma Rei","Rei"] },
      { canonicalName: "Sakuma Ritsu", aliases: ["Sakuma Ritsu","Ritsu"] },
      { canonicalName: "Sazanami Jun", aliases: ["Sazanami Jun","Jun"] },
      { canonicalName: "Sena Izumi", aliases: ["Sena Izumi","Izumi"] },
      { canonicalName: "Sengoku Shinobu", aliases: ["Sengoku Shinobu","Shinobu"] },
      { canonicalName: "Shiina Niki", aliases: ["Shiina Niki","Niki"] },
      { canonicalName: "Shinkai Kanata", aliases: ["Shinkai Kanata","Kanata"] },
      { canonicalName: "Shino Hajime", aliases: ["Shino Hajime","Hajime"] },
      { canonicalName: "Shiratori Aira", aliases: ["Shiratori Aira","Aira"] },
      { canonicalName: "Suou Tsukasa", aliases: ["Suou Tsukasa","Tsukasa"] },
      { canonicalName: "Takamine Midori", aliases: ["Takamine Midori","Midori"] },
      { canonicalName: "Tenma Mitsuru", aliases: ["Tenma Mitsuru","Mitsuru"] },
      { canonicalName: "Tenshouin Eichi", aliases: ["Tenshouin Eichi","Eichi"] },
      { canonicalName: "Tomoe Hiyori", aliases: ["Tomoe Hiyori","Hiyori"] },
      { canonicalName: "Tsukinaga Leo", aliases: ["Tsukinaga Leo","Leo"] },
      { canonicalName: "Yuuki Makoto", aliases: ["Yuuki Makoto","Makoto"] },
    ],
  },
  {
    name: "Fate Grand Order",
    characters: [
      { canonicalName: "Arjuna", aliases: ["Arjuna"] },
      { canonicalName: "Gilgamesh", aliases: ["Gilgamesh","Gil","King of Heroes"] },
      { canonicalName: "Holmes", aliases: ["Holmes","Sherlock Holmes"] },
      { canonicalName: "Merlin", aliases: ["Merlin"] },
      { canonicalName: "Napoleon", aliases: ["Napoleon","Napoleon Bonaparte"] },
      { canonicalName: "Oberon", aliases: ["Oberon","Oberon Vortigern"] },
    ],
  },
  {
    name: "Genshin Impact",
    characters: [
      { canonicalName: "Aether", aliases: ["Aether","Male Traveler"] },
      { canonicalName: "Albedo", aliases: ["Albedo","Kreideprinz"] },
      { canonicalName: "Alhaitham", aliases: ["Alhaitham","Al-Haitham"] },
      { canonicalName: "Capitano", aliases: ["Capitano","The Captain","Il Capitano"] },
      { canonicalName: "Cyno", aliases: ["Cyno"] },
      { canonicalName: "Diluc", aliases: ["Diluc","Diluc Ragnvindr"] },
      { canonicalName: "Flins", aliases: ["Flins","Kyryll Chudomirovich Flins"] },
      { canonicalName: "Freminet", aliases: ["Freminet"] },
      { canonicalName: "Kaeya", aliases: ["Kaeya","Kaeya Alberich"] },
      { canonicalName: "Kazuha", aliases: ["Kazuha","Kaedehara Kazuha"] },
      { canonicalName: "Lumine", aliases: ["Lumine","Female Traveler"] },
      { canonicalName: "Lyney", aliases: ["Lyney"] },
      { canonicalName: "Mavuika", aliases: ["Mavuika"] },
      { canonicalName: "Navia", aliases: ["Navia"] },
      { canonicalName: "Neuvillette", aliases: ["Neuvillette"] },
      { canonicalName: "Tartaglia", aliases: ["Tartaglia","Childe","Ajax"] },
      { canonicalName: "Varka", aliases: ["Varka"] },
      { canonicalName: "Venti", aliases: ["Venti","Barbatos"] },
      { canonicalName: "Wanderer", aliases: ["Wanderer","Balladeer","Kunikuzushi","Scaramouche"] },
      { canonicalName: "Wriothesley", aliases: ["Wriothesley"] },
      { canonicalName: "Xiao", aliases: ["Xiao","Alatus"] },
      { canonicalName: "Zhongli", aliases: ["Zhongli","Rex Lapis","Morax"] },
    ],
  },
  {
    name: "Granblue Fantasy",
    characters: [
      { canonicalName: "Galleon", aliases: ["Galleon"] },
    ],
  },
  {
    name: "Haikyuu!!",
    characters: [
      { canonicalName: "Akaashi Keiji", aliases: ["Akaashi Keiji","Akaashi"] },
      { canonicalName: "Bokuto Koutarou", aliases: ["Bokuto Koutarou","Bokuto"] },
      { canonicalName: "Daichi Sawamura", aliases: ["Daichi Sawamura","Daichi"] },
      { canonicalName: "Hinata Shouyou", aliases: ["Hinata Shouyou","Hinata"] },
      { canonicalName: "Iwaizumi Hajime", aliases: ["Iwaizumi Hajime","Iwa-chan"] },
      { canonicalName: "Kageyama Tobio", aliases: ["Kageyama Tobio","Kageyama"] },
      { canonicalName: "Kuroo Tetsurou", aliases: ["Kuroo Tetsurou","Kuroo"] },
      { canonicalName: "Oikawa Tooru", aliases: ["Oikawa Tooru","Oikawa"] },
      { canonicalName: "Sugawara Koushi", aliases: ["Sugawara Koushi","Suga"] },
      { canonicalName: "Tsukishima Kei", aliases: ["Tsukishima Kei","Tsukki"] },
    ],
  },
  {
    name: "Honkai Star Rail",
    characters: [
      { canonicalName: "Anaxa", aliases: ["Anaxa","Anaxagoras"] },
      { canonicalName: "Argenti", aliases: ["Argenti"] },
      { canonicalName: "Aventurine", aliases: ["Aventurine","Kakavasha"] },
      { canonicalName: "Blade", aliases: ["Blade","Yingxing"] },
      { canonicalName: "Boothill", aliases: ["Boothill","Boot Hill"] },
      { canonicalName: "Dan Heng", aliases: ["Dan Heng","Dan Heng Imbibitor Lunae","IL"] },
      { canonicalName: "Dr. Ratio", aliases: ["Dr. Ratio","Ratio"] },
      { canonicalName: "Feixiao", aliases: ["Feixiao"] },
      { canonicalName: "Gepard", aliases: ["Gepard","Gepard Landau"] },
      { canonicalName: "Jing Yuan", aliases: ["Jing Yuan"] },
      { canonicalName: "Luocha", aliases: ["Luocha"] },
      { canonicalName: "Mydei", aliases: ["Mydei","Mydeimos"] },
      { canonicalName: "Phainon", aliases: ["Phainon","Khaslana","Flame Reaver","Khaos","Deliverer","Khaoslana"] },
      { canonicalName: "Robin", aliases: ["Robin"] },
      { canonicalName: "Ruan Mei", aliases: ["Ruan Mei"] },
      { canonicalName: "Sampo", aliases: ["Sampo","Sampo Koski"] },
      { canonicalName: "Sunday", aliases: ["Sunday"] },
      { canonicalName: "Welt", aliases: ["Welt","Welt Yang"] },
    ],
  },
  {
    name: "Hunter x Hunter",
    characters: [
      { canonicalName: "Chrollo Lucilfer", aliases: ["Chrollo Lucilfer","Chrollo","Kuroro"] },
      { canonicalName: "Hisoka", aliases: ["Hisoka"] },
      { canonicalName: "Illumi Zoldyck", aliases: ["Illumi Zoldyck","Illumi"] },
      { canonicalName: "Killua Zoldyck", aliases: ["Killua Zoldyck","Killua"] },
      { canonicalName: "Kurapika", aliases: ["Kurapika"] },
    ],
  },
  {
    name: "IDOLiSH7",
    fandomAliases: ["i7"],
    characters: [
      // IDOLiSH7
      { canonicalName: "Iori Izumi", aliases: ["Iori Izumi","Izumi Iori"] },
      { canonicalName: "Yamato Nikaido", aliases: ["Yamato Nikaido","Nikaido Yamato"] },
      { canonicalName: "Mitsuki Izumi", aliases: ["Mitsuki Izumi","Izumi Mitsuki"] },
      { canonicalName: "Tamaki Yotsuba", aliases: ["Tamaki Yotsuba","Yotsuba Tamaki"] },
      { canonicalName: "Sogo Osaka", aliases: ["Sogo Osaka","Osaka Sogo"] },
      { canonicalName: "Nagi Rokuya", aliases: ["Nagi Rokuya","Rokuya Nagi"] },
      { canonicalName: "Riku Nanase", aliases: ["Riku Nanase","Nanase Riku"] },
      // TRIGGER
      { canonicalName: "Gaku Yaotome", aliases: ["Gaku Yaotome","Yaotome Gaku"] },
      { canonicalName: "Tenn Kujo", aliases: ["Tenn Kujo","Kujo Tenn"] },
      { canonicalName: "Ryunosuke Tsunashi", aliases: ["Ryunosuke Tsunashi","Tsunashi Ryunosuke"] },
      // Revale
      { canonicalName: "Momose Sunohara", aliases: ["Momose Sunohara","Sunohara Momose","Momo"] },
      { canonicalName: "Yukito Orikasa", aliases: ["Yukito Orikasa","Orikasa Yukito","Yuki"] },
      // ZOOL
      { canonicalName: "Haruka Isumi", aliases: ["Haruka Isumi","Isumi Haruka"] },
      { canonicalName: "Toma Inumaru", aliases: ["Toma Inumaru","Inumaru Toma"] },
      { canonicalName: "Minami Natsume", aliases: ["Minami Natsume","Natsume Minami"] },
      { canonicalName: "Torao Mido", aliases: ["Torao Mido","Mido Torao"] },
      // Other
      { canonicalName: "Ogami Banri", aliases: ["Ogami Banri","Banri Ogami"] },
    ],
  },
  {
    name: "Jujutsu Kaisen",
    fandomAliases: ["jjk"],
    characters: [
      { canonicalName: "Choso", aliases: ["Choso"] },
      { canonicalName: "Fushiguro Megumi", aliases: ["Fushiguro Megumi"] },
      { canonicalName: "Geto Suguru", aliases: ["Geto Suguru"] },
      { canonicalName: "Gojo Satoru", aliases: ["Gojo Satoru"] },
      { canonicalName: "Itadori Yuji", aliases: ["Itadori Yuji"] },
      { canonicalName: "Nanami Kento", aliases: ["Nanami Kento"] },
      { canonicalName: "Ryomen Sukuna", aliases: ["Ryomen Sukuna","Sukuna"] },
      { canonicalName: "Toji Fushiguro", aliases: ["Toji Fushiguro","Toji"] },
      { canonicalName: "Yuta Okkotsu", aliases: ["Yuta Okkotsu"] },
    ],
  },
  {
    name: "Love and Deepspace",
    fandomAliases: ["lads"],
    characters: [
      { canonicalName: "Caleb", aliases: ["Caleb","Xia Yizhou"] },
      { canonicalName: "Rafayel", aliases: ["Rafayel","Qi Yu"] },
      { canonicalName: "Sylus", aliases: ["Sylus","Qin Che"] },
      { canonicalName: "Xavier", aliases: ["Xavier","Shen Xinghui"] },
      { canonicalName: "Zayne", aliases: ["Zayne","Dr. Zayne","Li Shen"] },
    ],
  },
  {
    name: "Mr. Love: Queen's Choice",
    fandomAliases: ["mlcq", "Love and Producer"],
    characters: [
      { canonicalName: "Gavin", aliases: ["Gavin","Bai Qi"] },
    ],
  },
  {
    name: "My Hero Academia",
    fandomAliases: ["bnha", "boku no hero academia"],
    characters: [
      { canonicalName: "Aizawa Shouta", aliases: ["Aizawa Shouta","Eraserhead"] },
      { canonicalName: "Bakugou Katsuki", aliases: ["Bakugou Katsuki","Bakugo"] },
      { canonicalName: "Hawks", aliases: ["Hawks","Keigo Takami"] },
      { canonicalName: "Midoriya Izuku", aliases: ["Midoriya Izuku","Deku"] },
      { canonicalName: "Todoroki Shouto", aliases: ["Todoroki Shouto","Shoto Todoroki"] },
    ],
  },
  {
    name: "Obey Me",
    characters: [
      { canonicalName: "Asmodeus", aliases: ["Asmodeus","Asmo"] },
      { canonicalName: "Barbatos", aliases: ["Barbatos"] },
      { canonicalName: "Beelzebub", aliases: ["Beelzebub","Beel"] },
      { canonicalName: "Belphegor", aliases: ["Belphegor","Belphie"] },
      { canonicalName: "Diavolo", aliases: ["Diavolo"] },
      { canonicalName: "Leviathan", aliases: ["Leviathan","Levi"] },
      { canonicalName: "Lucifer", aliases: ["Lucifer"] },
      { canonicalName: "Mammon", aliases: ["Mammon"] },
      { canonicalName: "Satan", aliases: ["Satan"] },
      { canonicalName: "Simeon", aliases: ["Simeon"] },
      { canonicalName: "Solomon", aliases: ["Solomon"] },
    ],
  },
  {
    name: "One Piece",
    characters: [
      { canonicalName: "Dracule Mihawk", aliases: ["Dracule Mihawk","Mihawk"] },
      { canonicalName: "Portgas D. Ace", aliases: ["Portgas D. Ace","Ace","Portgas Ace"] },
      { canonicalName: "Roronoa Zoro", aliases: ["Roronoa Zoro","Zoro","Zolo"] },
      { canonicalName: "Shanks", aliases: ["Shanks","Red-Haired Shanks"] },
      { canonicalName: "Trafalgar Law", aliases: ["Trafalgar Law","Law","Trafalgar D. Water Law"] },
    ],
  },
  {
    name: "Persona 3",
    characters: [
      { canonicalName: "Makoto Yuki", aliases: ["Makoto Yuki","Yuki Makoto","Protagonist"] },
      { canonicalName: "Akihiko Sanada", aliases: ["Akihiko Sanada","Sanada Akihiko"] },
      { canonicalName: "Shinjiro Aragaki", aliases: ["Shinjiro Aragaki","Aragaki Shinjiro"] },
    ],
  },
  {
    name: "Persona 4",
    characters: [
      { canonicalName: "Yu Narukami", aliases: ["Yu Narukami","Narukami Yu","Protagonist"] },
      { canonicalName: "Yosuke Hanamura", aliases: ["Yosuke Hanamura","Hanamura Yosuke"] },
    ],
  },
  {
    name: "Persona 5",
    characters: [
      { canonicalName: "Akechi Goro", aliases: ["Akechi Goro","Goro Akechi"] },
      { canonicalName: "Ren Amamiya", aliases: ["Ren Amamiya","Amamiya Ren","Akira Kurusu","Kurusu Akira","Joker","Protagonist"] },
      { canonicalName: "Yusuke Kitagawa", aliases: ["Yusuke Kitagawa","Kitagawa Yusuke"] },
    ],
  },
  {
    name: "Piofiore",
    characters: [
      { canonicalName: "Dante Falzone", aliases: ["Dante Falzone"] },
      { canonicalName: "Nicola Francesca", aliases: ["Nicola Francesca"] },
    ],
  },
  {
    name: "Sakamoto Days",
    characters: [
      { canonicalName: "Yoichi Nagumo", aliases: ["Yoichi Nagumo", "Nagumo Yoichi"] },
    ],
  },
  {
    name: "Tears of Themis",
    characters: [
      { canonicalName: "Artem Wing", aliases: ["Artem Wing","Zuo Ran","Artem"] },
      { canonicalName: "Luke Pearce", aliases: ["Luke Pearce","Xia Yan","Luke"] },
      { canonicalName: "Marius von Hagen", aliases: ["Marius von Hagen","Lu Jinghe","Marius"] },
      { canonicalName: "Vyn Richter", aliases: ["Vyn Richter","Mo Yi","Vyn"] },
    ],
  },
  {
    name: "The Legend of Heroes: Trails/Kiseki Series",
    characters: [
      { canonicalName: "Lloyd Bannings", aliases: ["Lloyd Bannings"] },
    ],
  },
  {
    name: "Tokyo Debunker",
    fandomAliases: ["tkbd"],
    characters: [
      // Frostheim
      { canonicalName: "Jin Kamurai", aliases: ["Jin Kamurai","Kamurai Jin"] },
      { canonicalName: "Tohma Ishibashi", aliases: ["Tohma Ishibashi","Ishibashi Toma"] },
      { canonicalName: "Lucas Errant", aliases: ["Lucas Errant"] },
      { canonicalName: "Kaito Fuji", aliases: ["Kaito Fuji","Fuji"] },
      // Vagastrom
      { canonicalName: "Alan Mido", aliases: ["Alan Mido"] },
      { canonicalName: "Leo Kurosagi", aliases: ["Leo Kurosagi","Kurosagi Leo"] },
      { canonicalName: "Shohei Haizono", aliases: ["Shohei Haizono","Haizono Shohei"] },
      // Jabberwock
      { canonicalName: "Haru Sagara", aliases: ["Haru Sagara","Sagara Haru"] },
      { canonicalName: "Towa Otonashi", aliases: ["Towa Otonashi","Otonashi Towa"] },
      { canonicalName: "Ren Shiranami", aliases: ["Ren Shiranami","Shiranami Ren"] },
      // Sinostra
      { canonicalName: "Taiga Hoshibami", aliases: ["Taiga Hoshibami","Hoshibami Taiga"] },
      { canonicalName: "Romeo Lucci", aliases: ["Romeo Lucci"] },
      { canonicalName: "Ritsu Shinjo", aliases: ["Ritsu Shinjo","Shinjo Ritsu"] },
      // Hotarubi
      { canonicalName: "Subaru Kagami", aliases: ["Subaru Kagami","Kagami Subaru"] },
      { canonicalName: "Haku Kusanagi", aliases: ["Haku Kusanagi","Kusanagi Haku"] },
      { canonicalName: "Zenji Kotodama", aliases: ["Zenji Kotodama","Kotodama Zenji"] },
      // Obscuary
      { canonicalName: "Edward Hart", aliases: ["Edward Hart"] },
      { canonicalName: "Rui Mizuki", aliases: ["Rui Mizuki","Mizuki"] },
      { canonicalName: "Lyca Colt", aliases: ["Lyca Colt"] },
      // Mortkranken
      { canonicalName: "Yuri Isami", aliases: ["Yuri Isami","Isami"] },
      { canonicalName: "Jiro Kirisaki", aliases: ["Jiro Kirisaki","Kirisaki"] },
      // Dionysia
      { canonicalName: "Jo Kongoza", aliases: ["Jo Kongoza","Kongoza Jo"] },
      { canonicalName: "Mio Susuhara", aliases: ["Mio Susuhara","Susuhara Mio"] },
      { canonicalName: "Elias Pratt", aliases: ["Elias Pratt"] },
      { canonicalName: "Shion Genkai", aliases: ["Shion Genkai","Genkai Shion"] },
      // Other
      { canonicalName: "Cornelius", aliases: ["Cornelius"] },
      { canonicalName: "Dante", aliases: ["Dante"] },
      { canonicalName: "Hyde", aliases: ["Hyde"] },
      { canonicalName: "Nicolas", aliases: ["Nicolas"] },
      { canonicalName: "Benkei", aliases: ["Benkei"] },
    ],
  },
  {
    name: "Touken Ranbu",
    characters: [
      { canonicalName: "Ichigo Hitofuri", aliases: ["Ichigo Hitofuri","Ichigo"] },
      { canonicalName: "Mikazuki Munechika", aliases: ["Mikazuki Munechika","Mikazuki"] },
      { canonicalName: "Yamanbagiri Kunihiro", aliases: ["Yamanbagiri Kunihiro","Yamanbagiri"] },
      { canonicalName: "Tsurumaru Kuninaga", aliases: ["Tsurumaru Kuninaga","Tsurumaru"] },
      { canonicalName: "Shokudaikiri Mitsutada", aliases: ["Shokudaikiri Mitsutada","Shokudaikiri","Mitsutada"] },
      { canonicalName: "Heshikiri Hasebe", aliases: ["Heshikiri Hasebe","Heshikiri","Hasebe"] },
      { canonicalName: "Kashuu Kiyomitsu", aliases: ["Kashuu Kiyomitsu","Kashuu","Kiyomitsu"] },
      { canonicalName: "Yamatonokami Yasuda", aliases: ["Yamatonokami Yasuda","Yamatonokami","Yasuda"] },
    ],
  },
  {
    name: "Twisted Wonderland",
    characters: [
      { canonicalName: "Ace Trappola", aliases: ["Ace Trappola","Ace"] },
      { canonicalName: "Azul Ashengrotto", aliases: ["Azul Ashengrotto","Azul"] },
      { canonicalName: "Cater Diamond", aliases: ["Cater Diamond","Cater"] },
      { canonicalName: "Deuce Spade", aliases: ["Deuce Spade","Deuce"] },
      { canonicalName: "Epel Felmier", aliases: ["Epel Felmier","Epel"] },
      { canonicalName: "Floyd Leech", aliases: ["Floyd Leech","Floyd"] },
      { canonicalName: "Idia Shroud", aliases: ["Idia Shroud","Idia"] },
      { canonicalName: "Jack Howl", aliases: ["Jack Howl","Jack"] },
      { canonicalName: "Jade Leech", aliases: ["Jade Leech","Jade"] },
      { canonicalName: "Jamil Viper", aliases: ["Jamil Viper","Jamil"] },
      { canonicalName: "Kalim Al-Asim", aliases: ["Kalim Al-Asim","Kalim"] },
      { canonicalName: "Leona Kingscholar", aliases: ["Leona Kingscholar","Leona"] },
      { canonicalName: "Lilia Vanrouge", aliases: ["Lilia Vanrouge","Lilia"] },
      { canonicalName: "Malleus Draconia", aliases: ["Malleus Draconia","Malleus","Tsunotaro"] },
      { canonicalName: "Ortho Shroud", aliases: ["Ortho Shroud","Ortho"] },
      { canonicalName: "Riddle Rosehearts", aliases: ["Riddle Rosehearts","Riddle"] },
      { canonicalName: "Rook Hunt", aliases: ["Rook Hunt","Rook"] },
      { canonicalName: "Ruggie Bucchi", aliases: ["Ruggie Bucchi","Ruggie"] },
      { canonicalName: "Sebek Zigvolt", aliases: ["Sebek Zigvolt","Sebek"] },
      { canonicalName: "Silver", aliases: ["Silver"] },
      { canonicalName: "Trey Clover", aliases: ["Trey Clover","Trey"] },
      { canonicalName: "Vil Schoenheit", aliases: ["Vil Schoenheit","Vil"] },
    ],
  },
  {
    name: "Wuthering Waves",
    characters: [
      { canonicalName: "Calcharo", aliases: ["Calcharo"] },
      { canonicalName: "Changli", aliases: ["Changli"] },
      { canonicalName: "Luuk Herssen", aliases: ["Luuk Herssen","Luuk"] },
      { canonicalName: "Qiuyuan", aliases: ["Qiuyuan"] },
      { canonicalName: "Male Rover", aliases: ["Male Rover","Rover (Male)"] },
      { canonicalName: "Female Rover", aliases: ["Female Rover","Rover (Female)"] },
    ],
  },
]

async function main() {
  console.log('Seeding database...')
  for (const fandomData of DATA) {
    const nameNorm = normalizeFandom(fandomData.name)
    const fandom = await prisma.fandom.upsert({
      where: { nameNorm },
      update: {},
      create: { name: fandomData.name, nameNorm },
    })
    for (const fAlias of (fandomData.fandomAliases || [])) {
      const fAliasNorm = normalizeFandom(fAlias)
      await prisma.fandomAlias.upsert({
        where: { fandomId_aliasNorm: { fandomId: fandom.id, aliasNorm: fAliasNorm } },
        update: {},
        create: { fandomId: fandom.id, alias: fAlias, aliasNorm: fAliasNorm },
      })
    }
    for (const charData of fandomData.characters) {
      const character = await prisma.character.upsert({
        where: { fandomId_canonicalName: { fandomId: fandom.id, canonicalName: charData.canonicalName } },
        update: {},
        create: { fandomId: fandom.id, canonicalName: charData.canonicalName },
      })
      for (const alias of charData.aliases) {
        const aliasNorm = normalizeCharacter(alias)
        await prisma.characterAlias.upsert({
          where: { characterId_aliasNorm: { characterId: character.id, aliasNorm } },
          update: {},
          create: { characterId: character.id, alias, aliasNorm },
        })
      }
    }
    console.log(`  ✓ ${fandomData.name} (${fandomData.characters.length} characters)`)
  }
  console.log('Done!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())