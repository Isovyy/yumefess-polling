import Image from 'next/image'
import type { Metadata } from 'next'
import type { StaticImageData } from 'next/image'

import PhainonImg from './Dirgahayume26/Phainon.png'
import CalebImg from './Dirgahayume26/Caleb.png'
import TartagliaImg from './Dirgahayume26/Tartaglia.png'
import WriothesleyImg from './Dirgahayume26/Wriothesley.png'
import AventurineImg from './Dirgahayume26/Aventurine.png'
import DanHengImg from './Dirgahayume26/Dan heng.png'
import KaoruImg from './Dirgahayume26/Kaoru.png'
import DottoreImg from './Dirgahayume26/Dottore.png'
import VarkaImg from './Dirgahayume26/Varka.png'
import MydeiImg from './Dirgahayume26/Mydei.png'
import ReiImg from './Dirgahayume26/Rei.png'
import ZhongliImg from './Dirgahayume26/Zhongli.png'
import FlinsImg from './Dirgahayume26/Flins.png'
import SylusImg from './Dirgahayume26/Sylus.png'
import ZayneImg from './Dirgahayume26/Zayne.png'
import IzumiImg from './Dirgahayume26/Izumi.png'
import KeitoImg from './Dirgahayume26/Keito.png'
import LeoImg from './Dirgahayume26/Leo.png'
import LuukImg from './Dirgahayume26/Luuk.png'
import AnaxaImg from './Dirgahayume26/Anaxa.png'
import LeonImg from './Dirgahayume26/Leon.png'
import GojoImg from './Dirgahayume26/Gojo.png'
import LuciferImg from './Dirgahayume26/Lucifer.png'
import RitsuImg from './Dirgahayume26/Ritsu.png'
import BrantImg from './Dirgahayume26/Brant.png'
import TsukasaImg from './Dirgahayume26/Tsukasa.png'
import BakugoImg from './Dirgahayume26/Bakugo.png'
import SundayImg from './Dirgahayume26/Sunday.png'
import IdiaImg from './Dirgahayume26/Idia.png'
import AzulImg from './Dirgahayume26/Azul.png'

export const metadata: Metadata = {
  title: 'Yumefess Oshi Polling 2026 — Hasil',
  description: 'Hasil Yumefess Oshi Polling 2026',
}


const characters: { rank: number; name: string; fandom: string; img: StaticImageData }[] = [
  { rank: 1,  name: 'Phainon',            fandom: 'Honkai: Star Rail',   img: PhainonImg },
  { rank: 2,  name: 'Caleb',              fandom: 'Love and Deepspace',  img: CalebImg },
  { rank: 3,  name: 'Childe',             fandom: 'Genshin Impact',      img: TartagliaImg },
  { rank: 4,  name: 'Wriothesley',        fandom: 'Genshin Impact',      img: WriothesleyImg },
  { rank: 5,  name: 'Aventurine',         fandom: 'Honkai: Star Rail',   img: AventurineImg },
  { rank: 6,  name: 'Dan Heng',           fandom: 'Honkai: Star Rail',   img: DanHengImg },
  { rank: 7,  name: 'Hakaze Kaoru',       fandom: 'Ensemble Stars',      img: KaoruImg },
  { rank: 8,  name: 'Dottore',            fandom: 'Genshin Impact',      img: DottoreImg },
  { rank: 9,  name: 'Varka',              fandom: 'Genshin Impact',      img: VarkaImg },
  { rank: 10, name: 'Mydei',              fandom: 'Honkai: Star Rail',   img: MydeiImg },
  { rank: 11, name: 'Sakuma Rei',         fandom: 'Ensemble Stars',      img: ReiImg },
  { rank: 12, name: 'Zhongli',            fandom: 'Genshin Impact',      img: ZhongliImg },
  { rank: 13, name: 'Flins',              fandom: 'Genshin Impact',      img: FlinsImg },
  { rank: 14, name: 'Sylus',              fandom: 'Love and Deepspace',  img: SylusImg },
  { rank: 15, name: 'Zayne',              fandom: 'Love and Deepspace',  img: ZayneImg },
  { rank: 16, name: 'Sena Izumi',         fandom: 'Ensemble Stars',      img: IzumiImg },
  { rank: 17, name: 'Hasumi Keito',       fandom: 'Ensemble Stars',      img: KeitoImg },
  { rank: 18, name: 'Tsukinaga Leo',      fandom: 'Ensemble Stars',      img: LeoImg },
  { rank: 19, name: 'Luuk Herssen',       fandom: 'Wuthering Waves',     img: LuukImg },
  { rank: 20, name: 'Anaxa',              fandom: 'Honkai: Star Rail',   img: AnaxaImg },
  { rank: 21, name: 'Leon Scott Kennedy', fandom: 'Resident Evil',       img: LeonImg },
  { rank: 22, name: 'Gojo Satoru',        fandom: 'Jujutsu Kaisen',      img: GojoImg },
  { rank: 23, name: 'Lucifer',            fandom: 'Obey Me!',            img: LuciferImg },
  { rank: 24, name: 'Sakuma Ritsu',       fandom: 'Ensemble Stars',      img: RitsuImg },
  { rank: 25, name: 'Brant',              fandom: 'Wuthering Waves',     img: BrantImg },
  { rank: 26, name: 'Suou Tsukasa',       fandom: 'Ensemble Stars',      img: TsukasaImg },
  { rank: 27, name: 'Bakugou Katsuki',    fandom: 'My Hero Academia',    img: BakugoImg },
  { rank: 28, name: 'Sunday',             fandom: 'Honkai: Star Rail',   img: SundayImg },
  { rank: 29, name: 'Idia Shroud',        fandom: 'Twisted Wonderland',  img: IdiaImg },
  { rank: 30, name: 'Azul Ashengrotto',   fandom: 'Twisted Wonderland',  img: AzulImg },
]

export default function PollingResultsPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 text-gray-700">
      {/* Header */}
      <div className="flex justify-center mb-6">
        <Image src="/yumefess-icon.png" alt="Yumefess" width={64} height={64} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Yumefess Oshi Polling 2026</h1>
      <p className="text-sm text-gray-400 mb-8">Hasil Polling</p>

      {/* About */}
      <h2 className="font-bold text-gray-900 mb-2">
        Apa itu &ldquo;Yumefess Oshi Polling 2026&rdquo;?
      </h2>
      <p className="text-sm leading-relaxed mb-3">
        Kami mengadakan survei yang ditujukan kepada para yumejin (penggemar yang menikmati konten
        ocxcanon/self-insert/reader-insert) dengan meminta mereka merekomendasikan 1–3 karakter yang
        merupakan atau pernah menjadi comfort character mereka. (Periode survei: 5–25 Maret 2026)
      </p>
      <p className="text-sm leading-relaxed mb-8">
        Berdasarkan hasilnya, kami memperkenalkan <strong>30 karakter</strong> dan{' '}
        <strong>6 fandom</strong> dengan nominasi terbanyak, termasuk{' '}
        <strong>2 fandom yang memiliki votes yang sama di urutan pertama</strong>. Terima kasih
        banyak kepada semua yang telah berpartisipasi!
      </p>

      {/* Disclaimer */}
      <h2 className="font-bold text-gray-900 mb-2">Mohon dibaca sebelum melanjutkan:</h2>
      <ul className="text-sm leading-relaxed space-y-2 list-disc list-outside pl-5 mb-4">
        <li>Ini <strong>bukan peringkat untuk bersaing</strong> dalam hal keunggulan atau posisi.</li>
        <li>
          Karena sulit untuk memasukkan semua hasil, hanya <strong>30 karakter</strong> dan <strong>6 fandom</strong> dengan
          nominasi terbanyak yang ditampilkan. Harap dipahami bahwa urutan kemunculan atau tidaknya
          suatu karakter tidak mencerminkan nilai karakter tersebut maupun besarnya rasa cinta para
          penggemarnya.
        </li>
        <li>
          Proyek ini dilaksanakan dengan menghormati yumejin dan yume. Mohon hindari komentar yang
          mendiskriminasi atau mengejek kelompok, orang atau karakter tertentu, termasuk hasil
          survei maupun perubahan popularitas karakter.
        </li>
        <li>
          Hasil survei secara alami bervariasi tergantung pada responden. Tahun ini jumlah
          responden adalah lebih banyak dari terakhir kali proyek ini diadakan, dimana satu orang dapat memilih 1–3 karakter.
        </li>
        <li>
          <strong>Screenshot atau repost sebagian dari artikel ini dilarang</strong>. Artikel ini disusun
          berdasarkan keseluruhan konteksnya termasuk catatan ini, dan penyebaran sebagian saja
          dapat menyebabkan kesalahpahaman. Mohon jangan gunakan untuk merendahkan atau
          mendiskriminasi yumejin atau yume pada umumnya.
        </li>
        <li>
          Jika kami menemukan komentar atau sikap yang menjelekkan, merendahkan, mendiskriminasi,
          atau menimbulkan keributan, kami selaku admin <strong>@mlytfess</strong> berhak memblokir
          dan blacklist yang bertanggung jawab.
        </li>
      </ul>
      <p className="text-sm leading-relaxed mb-8">
        Terakhir, terkait penyebutan proyek ini di media sosial, selain qrt head tweet pengumuman{' '}
        <strong>@mlytfess</strong> di X yang sudah diberi tagar{' '}
        <strong>#YumefessOshiPolling2026</strong>, harap gunakan tagar berikut sebagai langkah
        pencegahan word-mute: <strong>#YumefessOshiPolling2026</strong>. Ini adalah peraturan untuk
        menjaga kenyamanan bagi mereka yang menikmati proyek ini maupun yang tidak.
      </p>

      {/* Fandom Rankings */}
      <h2 className="font-bold text-gray-900 mb-2">Fandom:</h2>
      <ul className="text-sm leading-relaxed space-y-1 mb-8 list-none pl-0">
        <li>1 Ensemble Stars &amp; Genshin Impact</li>
        <li>2 Honkai: Star Rail</li>
        <li>3 Love and Deepspace</li>
        <li>4 Tokyo Debunker</li>
        <li>5 Twisted Wonderland</li>
      </ul>

      {/* Character Rankings */}
      <h2 className="font-bold text-gray-900 mb-2">Karakter:</h2>
      <ul className="text-sm leading-relaxed space-y-6 list-none pl-0 mb-10">
        {[...characters].reverse().map((c) => (
          <li key={c.rank}>
            <h4 className="font-semibold text-gray-900 mb-2">{c.rank} {c.name} ({c.fandom})</h4>
            <Image
              src={c.img}
              alt={c.name}
              className="w-full h-auto"
            />
          </li>
        ))}
      </ul>

      <p className="text-sm leading-relaxed mb-6">
        Demikian hasil Oshi Polling Yumefess 2026. Dibawah ini kami cantumkan bentuk PDF sekaligus
        hasil polling dari tahun 2023 dan 2022. Akhir kata mohon maaf bila ada kata-kata atau penjelasan
        yang sekiranya kurang tepat. Untuk pertanyaan atau komentar mohon hubungi @FATUIUWU (X). Terima kasih.
      </p>

      {/* PDF Downloads */}
      <div className="flex flex-wrap gap-3 mb-10">
        {['2026', '2022', '2023'].map((year) => (
          <a
            key={year}
            href={`/2026PollingResults/download/${year}`}
            download
            className="text-sm text-teal-600 underline underline-offset-2"
          >
            Unduh Hasil {year} (PDF)
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400">© 2026 Yumefess Oshi Polling · @mlytfess</p>
    </main>
  )
}
