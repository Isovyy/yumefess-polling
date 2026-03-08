import Link from 'next/link'
import Image from 'next/image'

export default function TermsPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <Image src="/yumefess-icon.png" alt="Yumefess" width={80} height={80} />
        </div>
        <h1 className="text-3xl font-bold text-teal-500 mb-1">Yumefess Character Polling 2026</h1>
        <p className="text-gray-400 text-sm">Syarat dan Ketentuan</p>
      </div>

      {/* Terms box */}
      <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm space-y-4 text-sm text-gray-600 leading-relaxed">
        <ol className="list-decimal list-outside space-y-3 pl-5">
          <li>
            Merupakan yumejin dan karakter yang diisi dalam survei merupakan karakter yang merupakan atau pernah menjadi comfort character yume kalian.
          </li>
          <li>
            BISA BERBAHASA INDONESIA <span className="font-medium">(CAN SPEAK INDONESIAN!! This survey is meant for Indonesians)</span>
          </li>
          <li>
            Setiap akun hanya diperbolehkan melakukan <span className="font-medium">satu kali submit</span>.
            Jika terbukti melakukan kecurangan (misalnya menggunakan beberapa akun/IP), suara akan
            didiskualifikasi.
          </li>
          <li>
            Peserta diperbolehkan memilih hingga <span className="font-medium">3 karakter oshi</span> dari
            fandom yang berbeda maupun sama.
          </li>
          <li>
            Pastikan nama karakter dan fandom diisi dengan <span className="font-medium">benar dan lengkap</span>{' '}
            untuk menghindari suara tidak terhitung. Gunakan fitur saran (autocomplete) jika tersedia.
          </li>
          <li>
            3 orang akan mendapatkan saldo e-wallet sebesar 25 ribu rupiah. Cantumkan akun sosial media kamu <span className="font-medium">hanya jika ingin mengikuti
            giveaway</span>. Data sosial media tidak akan dipublikasikan, pemenang akan kami kontak langsung 
            melalui sosial media yang tersedia.
          </li>
          <li>
            Hasil poll bersifat <span className="font-medium">final</span> dan tidak dapat diganggu gugat.
            Panitia berhak mendiskualifikasi suara yang mencurigakan.
          </li>
          <li>
            Dengan mengklik <span className="font-medium">Saya Setuju</span>, kamu menyatakan telah
            membaca, memahami, dan menyetujui seluruh syarat dan ketentuan di atas.
          </li>
        </ol>
      </div>

      {/* Agree button */}
      <Link
        href="/poll"
        className="mt-6 block w-full py-3 bg-teal-400 hover:bg-teal-500 active:bg-teal-600 text-white font-semibold rounded-2xl transition shadow-sm text-center"
      >
        Saya Setuju
      </Link>
    </main>
  )
}
