// @ts-check
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Replicate normalize logic from src/lib/normalize.ts
function normalizeFandom(s) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ')
}

function normalizeCharacter(s) {
  return s.toLowerCase().trim().split(/\s+/).sort().join(' ')
}

// Each entry: { name, characters: [{ canonicalName, aliases: [string] }] }
const DATA = [
  {
    name: 'Genshin Impact',
    characters: [
      { canonicalName: 'Childe', aliases: ['Childe', 'Ajax', 'Tartaglia'] },
      { canonicalName: 'Zhongli', aliases: ['Zhongli', 'Rex Lapis', 'Morax'] },
      { canonicalName: 'Xiao', aliases: ['Xiao', 'Alatus'] },
      { canonicalName: 'Diluc', aliases: ['Diluc', 'Diluc Ragnvindr'] },
      { canonicalName: 'Kaeya', aliases: ['Kaeya', 'Kaeya Alberich'] },
      { canonicalName: 'Albedo', aliases: ['Albedo', 'Kreideprinz'] },
      { canonicalName: 'Venti', aliases: ['Venti', 'Barbatos'] },
      { canonicalName: 'Kazuha', aliases: ['Kazuha', 'Kaedehara Kazuha'] },
      { canonicalName: 'Scaramouche', aliases: ['Scaramouche', 'Wanderer', 'Kunikuzushi', 'Balladeer'] },
      { canonicalName: 'Cyno', aliases: ['Cyno'] },
      { canonicalName: 'Alhaitham', aliases: ['Alhaitham', 'Al-Haitham'] },
      { canonicalName: 'Neuvillette', aliases: ['Neuvillette'] },
      { canonicalName: 'Wriothesley', aliases: ['Wriothesley'] },
      { canonicalName: 'Navia', aliases: ['Navia'] },
      { canonicalName: 'Lyney', aliases: ['Lyney'] },
      { canonicalName: 'Freminet', aliases: ['Freminet'] },
      { canonicalName: 'Aether', aliases: ['Aether', 'Male Traveler'] },
      { canonicalName: 'Lumine', aliases: ['Lumine', 'Female Traveler'] },
      { canonicalName: 'Capitano', aliases: ['Capitano', 'The Captain'] },
      { canonicalName: 'Mavuika', aliases: ['Mavuika'] },
      { canonicalName: 'Flins', aliases: ['Flins', 'Kyryll Chudomirovich Flins'] },
      { canonicalName: 'Varka', aliases: ['Varka'] },
    ],
  },
  {
    name: 'Honkai: Star Rail',
    characters: [
      { canonicalName: 'Dan Heng', aliases: ['Dan Heng', 'Dan Heng Imbibitor Lunae', 'IL'] },
      { canonicalName: 'Blade', aliases: ['Blade', 'Yingxing'] },
      { canonicalName: 'Jing Yuan', aliases: ['Jing Yuan'] },
      { canonicalName: 'Welt', aliases: ['Welt', 'Welt Yang'] },
      { canonicalName: 'Gepard', aliases: ['Gepard', 'Gepard Landau'] },
      { canonicalName: 'Sampo', aliases: ['Sampo', 'Sampo Koski'] },
      { canonicalName: 'Luocha', aliases: ['Luocha'] },
      { canonicalName: 'Argenti', aliases: ['Argenti'] },
      { canonicalName: 'Aventurine', aliases: ['Aventurine', 'Kakavasha'] },
      { canonicalName: 'Dr. Ratio', aliases: ['Dr. Ratio', 'Ratio'] },
      { canonicalName: 'Ruan Mei', aliases: ['Ruan Mei'] },
      { canonicalName: 'Robin', aliases: ['Robin'] },
      { canonicalName: 'Boothill', aliases: ['Boothill', 'Boot Hill'] },
      { canonicalName: 'Sunday', aliases: ['Sunday'] },
      { canonicalName: 'Feixiao', aliases: ['Feixiao'] },
      { canonicalName: 'Anaxa', aliases: ['Anaxa'] },
      { canonicalName: 'Mydei', aliases: ['Mydei', 'Mydeimos'] },
      { canonicalName: 'Phainon', aliases: ['Phainon', 'Khaslana', 'Flame Reaver', 'Khaos', 'Deliverer'] },
    ],
  },
  {
    name: 'Ensemble Stars',
    characters: [
      // Trickstar
      { canonicalName: 'Akehoshi Subaru', aliases: ['Akehoshi Subaru', 'Subaru Akehoshi', 'Subaru'] },
      { canonicalName: 'Hidaka Hokuto', aliases: ['Hidaka Hokuto', 'Hokuto Hidaka', 'Hokuto'] },
      { canonicalName: 'Yuuki Makoto', aliases: ['Yuuki Makoto', 'Makoto Yuuki', 'Makoto'] },
      { canonicalName: 'Isara Mao', aliases: ['Isara Mao', 'Mao Isara', 'Mao'] },
      // fine
      { canonicalName: 'Tenshouin Eichi', aliases: ['Tenshouin Eichi', 'Eichi Tenshouin', 'Eichi'] },
      { canonicalName: 'Hibiki Wataru', aliases: ['Hibiki Wataru', 'Wataru Hibiki', 'Wataru'] },
      { canonicalName: 'Fushimi Yuzuru', aliases: ['Fushimi Yuzuru', 'Yuzuru Fushimi', 'Yuzuru'] },
      { canonicalName: 'Himemiya Tori', aliases: ['Himemiya Tori', 'Tori Himemiya', 'Tori'] },
      // UNDEAD
      { canonicalName: 'Sakuma Rei', aliases: ['Sakuma Rei', 'Rei Sakuma', 'Rei'] },
      { canonicalName: 'Hakaze Kaoru', aliases: ['Hakaze Kaoru', 'Kaoru Hakaze', 'Kaoru'] },
      { canonicalName: 'Oogami Koga', aliases: ['Oogami Koga', 'Koga Oogami', 'Koga'] },
      { canonicalName: 'Otogari Adonis', aliases: ['Otogari Adonis', 'Adonis Otogari', 'Adonis'] },
      // Akatsuki
      { canonicalName: 'Hasumi Keito', aliases: ['Hasumi Keito', 'Keito Hasumi', 'Keito'] },
      { canonicalName: 'Kiryu Kuro', aliases: ['Kiryu Kuro', 'Kuro Kiryu', 'Kuro'] },
      { canonicalName: 'Kanzaki Souma', aliases: ['Kanzaki Souma', 'Souma Kanzaki', 'Souma'] },
      // Knights
      { canonicalName: 'Tsukinaga Leo', aliases: ['Tsukinaga Leo', 'Leo Tsukinaga', 'Leo'] },
      { canonicalName: 'Sena Izumi', aliases: ['Sena Izumi', 'Izumi Sena', 'Izumi'] },
      { canonicalName: 'Sakuma Ritsu', aliases: ['Sakuma Ritsu', 'Ritsu Sakuma', 'Ritsu'] },
      { canonicalName: 'Narukami Arashi', aliases: ['Narukami Arashi', 'Arashi Narukami', 'Arashi'] },
      { canonicalName: 'Suou Tsukasa', aliases: ['Suou Tsukasa', 'Tsukasa Suou', 'Tsukasa'] },
      // Ryuseitai
      { canonicalName: 'Morisawa Chiaki', aliases: ['Morisawa Chiaki', 'Chiaki Morisawa', 'Chiaki'] },
      { canonicalName: 'Shinkai Kanata', aliases: ['Shinkai Kanata', 'Kanata Shinkai', 'Kanata'] },
      { canonicalName: 'Takamine Midori', aliases: ['Takamine Midori', 'Midori Takamine', 'Midori'] },
      { canonicalName: 'Nagumo Tetora', aliases: ['Nagumo Tetora', 'Tetora Nagumo', 'Tetora'] },
      { canonicalName: 'Sengoku Shinobu', aliases: ['Sengoku Shinobu', 'Shinobu Sengoku', 'Shinobu'] },
      // 2wink
      { canonicalName: 'Aoi Hinata', aliases: ['Aoi Hinata', 'Hinata Aoi', 'Hinata'] },
      { canonicalName: 'Aoi Yuta', aliases: ['Aoi Yuta', 'Yuta Aoi', 'Yuta'] },
      // Valkyrie
      { canonicalName: 'Itsuki Shu', aliases: ['Itsuki Shu', 'Shu Itsuki', 'Shu'] },
      { canonicalName: 'Kagehira Mika', aliases: ['Kagehira Mika', 'Mika Kagehira', 'Mika'] },
      // Switch
      { canonicalName: 'Aoba Tsumugi', aliases: ['Aoba Tsumugi', 'Tsumugi Aoba', 'Tsumugi'] },
      { canonicalName: 'Sakasaki Natsume', aliases: ['Sakasaki Natsume', 'Natsume Sakasaki', 'Natsume'] },
      { canonicalName: 'Harukawa Sora', aliases: ['Harukawa Sora', 'Sora Harukawa', 'Sora'] },
      // Ra*bits
      { canonicalName: 'Shino Hajime', aliases: ['Shino Hajime', 'Hajime Shino', 'Hajime'] },
      { canonicalName: 'Mashiro Tomoya', aliases: ['Mashiro Tomoya', 'Tomoya Mashiro', 'Tomoya'] },
      { canonicalName: 'Nito Nazuna', aliases: ['Nito Nazuna', 'Nazuna Nito', 'Nazuna'] },
      { canonicalName: 'Tenma Mitsuru', aliases: ['Tenma Mitsuru', 'Mitsuru Tenma', 'Mitsuru'] },
      // MaM
      { canonicalName: 'Mikejima Madara', aliases: ['Mikejima Madara', 'Madara Mikejima', 'Madara'] },
      // Crazy:B
      { canonicalName: 'Amagi Rinne', aliases: ['Amagi Rinne', 'Rinne Amagi', 'Rinne'] },
      { canonicalName: 'HiMERU', aliases: ['HiMERU', 'Himeru'] },
      { canonicalName: 'Oukawa Kohaku', aliases: ['Oukawa Kohaku', 'Kohaku Oukawa', 'Kohaku'] },
      { canonicalName: 'Shiina Niki', aliases: ['Shiina Niki', 'Niki Shiina', 'Niki'] },
      // Alkaloid
      { canonicalName: 'Amagi Hiiro', aliases: ['Amagi Hiiro', 'Hiiro Amagi', 'Hiiro'] },
      { canonicalName: 'Shiratori Aira', aliases: ['Shiratori Aira', 'Aira Shiratori', 'Aira'] },
      { canonicalName: 'Ayase Mayoi', aliases: ['Ayase Mayoi', 'Mayoi Ayase', 'Mayoi'] },
      { canonicalName: 'Kazehaya Tatsumi', aliases: ['Kazehaya Tatsumi', 'Tatsumi Kazehaya', 'Tatsumi'] },
      // Eden
      { canonicalName: 'Ran Nagisa', aliases: ['Ran Nagisa', 'Nagisa Ran', 'Nagisa'] },
      { canonicalName: 'Sazanami Jun', aliases: ['Sazanami Jun', 'Jun Sazanami', 'Jun'] },
      { canonicalName: 'Saegusa Ibara', aliases: ['Saegusa Ibara', 'Ibara Saegusa', 'Ibara'] },
      { canonicalName: 'Tomoe Hiyori', aliases: ['Tomoe Hiyori', 'Hiyori Tomoe', 'Hiyori'] },
    ],
  },
  {
    name: 'Twisted Wonderland',
    characters: [
      { canonicalName: 'Riddle Rosehearts', aliases: ['Riddle Rosehearts', 'Riddle'] },
      { canonicalName: 'Trey Clover', aliases: ['Trey Clover', 'Trey'] },
      { canonicalName: 'Cater Diamond', aliases: ['Cater Diamond', 'Cater'] },
      { canonicalName: 'Deuce Spade', aliases: ['Deuce Spade', 'Deuce'] },
      { canonicalName: 'Ace Trappola', aliases: ['Ace Trappola', 'Ace'] },
      { canonicalName: 'Leona Kingscholar', aliases: ['Leona Kingscholar', 'Leona'] },
      { canonicalName: 'Ruggie Bucchi', aliases: ['Ruggie Bucchi', 'Ruggie'] },
      { canonicalName: 'Jack Howl', aliases: ['Jack Howl', 'Jack'] },
      { canonicalName: 'Azul Ashengrotto', aliases: ['Azul Ashengrotto', 'Azul'] },
      { canonicalName: 'Jade Leech', aliases: ['Jade Leech', 'Jade'] },
      { canonicalName: 'Floyd Leech', aliases: ['Floyd Leech', 'Floyd'] },
      { canonicalName: 'Kalim Al-Asim', aliases: ['Kalim Al-Asim', 'Kalim'] },
      { canonicalName: 'Jamil Viper', aliases: ['Jamil Viper', 'Jamil'] },
      { canonicalName: 'Vil Schoenheit', aliases: ['Vil Schoenheit', 'Vil'] },
      { canonicalName: 'Rook Hunt', aliases: ['Rook Hunt', 'Rook'] },
      { canonicalName: 'Epel Felmier', aliases: ['Epel Felmier', 'Epel'] },
      { canonicalName: 'Idia Shroud', aliases: ['Idia Shroud', 'Idia'] },
      { canonicalName: 'Ortho Shroud', aliases: ['Ortho Shroud', 'Ortho'] },
      { canonicalName: 'Malleus Draconia', aliases: ['Malleus Draconia', 'Malleus', 'Tsunotaro'] },
      { canonicalName: 'Lilia Vanrouge', aliases: ['Lilia Vanrouge', 'Lilia'] },
      { canonicalName: 'Silver', aliases: ['Silver'] },
      { canonicalName: 'Sebek Zigvolt', aliases: ['Sebek Zigvolt', 'Sebek'] },
    ],
  },
  {
    name: 'Obey Me',
    characters: [
      { canonicalName: 'Lucifer', aliases: ['Lucifer'] },
      { canonicalName: 'Mammon', aliases: ['Mammon'] },
      { canonicalName: 'Leviathan', aliases: ['Leviathan', 'Levi'] },
      { canonicalName: 'Satan', aliases: ['Satan'] },
      { canonicalName: 'Asmodeus', aliases: ['Asmodeus', 'Asmo'] },
      { canonicalName: 'Beelzebub', aliases: ['Beelzebub', 'Beel'] },
      { canonicalName: 'Belphegor', aliases: ['Belphegor', 'Belphie'] },
      { canonicalName: 'Diavolo', aliases: ['Diavolo'] },
      { canonicalName: 'Barbatos', aliases: ['Barbatos'] },
      { canonicalName: 'Simeon', aliases: ['Simeon'] },
      { canonicalName: 'Solomon', aliases: ['Solomon'] },
    ],
  },
  {
    name: 'Blue Lock',
    characters: [
      { canonicalName: 'Itoshi Rin', aliases: ['Itoshi Rin', 'Rin Itoshi'] },
      { canonicalName: 'Itoshi Sae', aliases: ['Itoshi Sae', 'Sae Itoshi'] },
      { canonicalName: 'Isagi Yoichi', aliases: ['Isagi Yoichi', 'Yoichi Isagi'] },
      { canonicalName: 'Nagi Seishiro', aliases: ['Nagi Seishiro', 'Seishiro Nagi'] },
      { canonicalName: 'Reo Mikage', aliases: ['Reo Mikage', 'Mikage Reo'] },
      { canonicalName: 'Barou Shoei', aliases: ['Barou Shoei', 'Shoei Barou'] },
      { canonicalName: 'Michael Kaiser', aliases: ['Michael Kaiser','Kaiser Michael'] },
      { canonicalName: 'Bachira Meguru', aliases: ['Bachira Meguru', 'Meguru Bachira'] },
      { canonicalName: 'Chigiri Hyoma', aliases: ['Chigiri Hyoma', 'Hyoma Chigiri'] },
    ],
  },
  {
    name: 'Jujutsu Kaisen',
    characters: [
      { canonicalName: 'Gojo Satoru', aliases: ['Gojo Satoru', 'Satoru Gojo'] },
      { canonicalName: 'Nanami Kento', aliases: ['Nanami Kento', 'Kento Nanami'] },
      { canonicalName: 'Fushiguro Megumi', aliases: ['Fushiguro Megumi', 'Megumi Fushiguro'] },
      { canonicalName: 'Itadori Yuji', aliases: ['Itadori Yuji', 'Yuji Itadori'] },
      { canonicalName: 'Toji Fushiguro', aliases: ['Toji Fushiguro', 'Fushiguro Toji', 'Toji'] },
      { canonicalName: 'Choso', aliases: ['Choso'] },
      { canonicalName: 'Ryomen Sukuna', aliases: ['Ryomen Sukuna', 'Sukuna'] },
      { canonicalName: 'Geto Suguru', aliases: ['Geto Suguru', 'Suguru Geto'] },
      { canonicalName: 'Yuta Okkotsu', aliases: ['Yuta Okkotsu', 'Okkotsu Yuta'] },
    ],
  },
  {
    name: 'Haikyuu!!',
    characters: [
      { canonicalName: 'Oikawa Tooru', aliases: ['Oikawa Tooru', 'Tooru Oikawa', 'Oikawa'] },
      { canonicalName: 'Kuroo Tetsurou', aliases: ['Kuroo Tetsurou', 'Tetsurou Kuroo', 'Kuroo'] },
      { canonicalName: 'Bokuto Koutarou', aliases: ['Bokuto Koutarou', 'Koutarou Bokuto', 'Bokuto'] },
      { canonicalName: 'Akaashi Keiji', aliases: ['Akaashi Keiji', 'Keiji Akaashi', 'Akaashi'] },
      { canonicalName: 'Iwaizumi Hajime', aliases: ['Iwaizumi Hajime', 'Hajime Iwaizumi', 'Iwa-chan'] },
      { canonicalName: 'Hinata Shouyou', aliases: ['Hinata Shouyou', 'Shouyou Hinata', 'Hinata'] },
      { canonicalName: 'Kageyama Tobio', aliases: ['Kageyama Tobio', 'Tobio Kageyama', 'Kageyama'] },
      { canonicalName: 'Tsukishima Kei', aliases: ['Tsukishima Kei', 'Kei Tsukishima', 'Tsukki'] },
      { canonicalName: 'Sugawara Koushi', aliases: ['Sugawara Koushi', 'Koushi Sugawara', 'Suga'] },
      { canonicalName: 'Daichi Sawamura', aliases: ['Daichi Sawamura', 'Sawamura Daichi', 'Daichi'] },
    ],
  },
  {
    name: 'Bungou Stray Dogs',
    characters: [
      { canonicalName: 'Dazai Osamu', aliases: ['Dazai Osamu', 'Osamu Dazai', 'Dazai'] },
      { canonicalName: 'Chuuya Nakahara', aliases: ['Chuuya Nakahara', 'Nakahara Chuuya', 'Chuuya'] },
      { canonicalName: 'Atsushi Nakajima', aliases: ['Atsushi Nakajima', 'Nakajima Atsushi', 'Atsushi'] },
      { canonicalName: 'Ranpo Edogawa', aliases: ['Ranpo Edogawa', 'Edogawa Ranpo', 'Ranpo'] },
      { canonicalName: 'Akutagawa Ryunosuke', aliases: ['Akutagawa Ryunosuke', 'Ryunosuke Akutagawa', 'Akutagawa'] },
      { canonicalName: 'Fyodor Dostoevsky', aliases: ['Fyodor Dostoevsky', 'Fyodor', 'Dostoyevsky'] },
      { canonicalName: 'Nikolai Gogol', aliases: ['Nikolai Gogol', 'Gogol'] },
    ],
  },
  {
    name: 'My Hero Academia',
    characters: [
      { canonicalName: 'Todoroki Shouto', aliases: ['Todoroki Shouto', 'Shouto Todoroki', 'Shoto Todoroki'] },
      { canonicalName: 'Bakugou Katsuki', aliases: ['Bakugou Katsuki', 'Katsuki Bakugou', 'Bakugo'] },
      { canonicalName: 'Midoriya Izuku', aliases: ['Midoriya Izuku', 'Izuku Midoriya', 'Deku'] },
      { canonicalName: 'Aizawa Shouta', aliases: ['Aizawa Shouta', 'Shouta Aizawa', 'Eraserhead'] },
      { canonicalName: 'Hawks', aliases: ['Hawks', 'Keigo Takami', 'Takami Keigo'] },
    ],
  },
  {
    name: 'Demon Slayer',
    characters: [
      { canonicalName: 'Rengoku Kyojuro', aliases: ['Rengoku Kyojuro', 'Kyojuro Rengoku', 'Rengoku'] },
      { canonicalName: 'Tomioka Giyuu', aliases: ['Tomioka Giyuu', 'Giyuu Tomioka', 'Giyuu'] },
      { canonicalName: 'Uzui Tengen', aliases: ['Uzui Tengen', 'Tengen Uzui', 'Uzui'] },
      { canonicalName: 'Douma', aliases: ['Douma', 'Doma'] },
      { canonicalName: 'Akaza', aliases: ['Akaza'] },
      { canonicalName: 'Sanemi Shinazugawa', aliases: ['Sanemi Shinazugawa', 'Shinazugawa Sanemi', 'Sanemi'] },
      { canonicalName: 'Iguro Obanai', aliases: ['Iguro Obanai', 'Obanai Iguro', 'Obanai'] },
      { canonicalName: 'Muzan Kibutsuji', aliases: ['Muzan Kibutsuji', 'Kibutsuji Muzan', 'Muzan'] },
    ],
  },
  {
    name: 'Fate/Grand Order',
    characters: [
      { canonicalName: 'Gilgamesh', aliases: ['Gilgamesh', 'Gil', 'King of Heroes'] },
      { canonicalName: 'Merlin', aliases: ['Merlin'] },
      { canonicalName: 'Arjuna Alter', aliases: ['Arjuna Alter', 'Arjuna'] },
      { canonicalName: 'Oberon', aliases: ['Oberon'] },
      { canonicalName: 'Holmes', aliases: ['Holmes', 'Sherlock Holmes'] },
      { canonicalName: 'Napoleon', aliases: ['Napoleon', 'Napoleon Bonaparte'] },
    ],
  },
  {
    name: 'One Piece',
    characters: [
      { canonicalName: 'Roronoa Zoro', aliases: ['Roronoa Zoro', 'Zoro', 'Zolo'] },
      { canonicalName: 'Trafalgar Law', aliases: ['Trafalgar Law', 'Law', 'Trafalgar D. Water Law'] },
      { canonicalName: 'Dracule Mihawk', aliases: ['Dracule Mihawk', 'Mihawk'] },
      { canonicalName: 'Portgas D. Ace', aliases: ['Portgas D. Ace', 'Ace', 'Portgas Ace'] },
      { canonicalName: 'Shanks', aliases: ['Shanks', 'Red-Haired Shanks'] },
    ],
  },
  {
    name: 'Hunter x Hunter',
    characters: [
      { canonicalName: 'Killua Zoldyck', aliases: ['Killua Zoldyck', 'Killua'] },
      { canonicalName: 'Kurapika', aliases: ['Kurapika'] },
      { canonicalName: 'Illumi Zoldyck', aliases: ['Illumi Zoldyck', 'Illumi'] },
      { canonicalName: 'Chrollo Lucilfer', aliases: ['Chrollo Lucilfer', 'Chrollo', 'Kuroro'] },
      { canonicalName: 'Hisoka', aliases: ['Hisoka', 'Hisoka Morrow'] },
    ],
  },
  {
    name: 'Love and Deepspace',
    characters: [
      { canonicalName: 'Zayne', aliases: ['Zayne', 'Dr. Zayne'] },
      { canonicalName: 'Xavier', aliases: ['Xavier'] },
      { canonicalName: 'Rafayel', aliases: ['Rafayel'] },
      { canonicalName: 'Sylus', aliases: ['Sylus'] },
      { canonicalName: 'Caleb', aliases: ['Caleb'] },
    ],
  },
  {
    name: 'Wuthering Waves',
    characters: [
      { canonicalName: 'Calcharo', aliases: ['Calcharo'] },
      { canonicalName: 'Luuk Herssen', aliases: ['Luuk Herssen', 'Luuk'] },
      { canonicalName: 'Rover', aliases: ['Rover', 'Male Rover', 'Female Rover'] },
      { canonicalName: 'Qiuyuan', aliases: ['Qiuyuan'] },
    ],
  },
  {
    name: 'Tokyo Debunker',
    characters: [
   
    ],
  },
  {
    name: 'IDOLiSH7',
    characters: [

    ],
  },
  {
    name: 'Endsfield',
    characters: [

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
