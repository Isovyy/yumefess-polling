import Link from 'next/link'
import Image from 'next/image'

export default function ThankYou() {
  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-4">
        <Image src="/yumefess-icon.png" alt="Yumefess" width={80} height={80} />
      </div>
      <h1 className="text-3xl font-bold text-teal-500 mb-3">Thank you!</h1>
      <p className="text-gray-500 mb-8">Your votes have been recorded. Appreciate your participation!</p>
      <Link
        href="/"
        className="text-teal-400 hover:text-teal-600 underline underline-offset-2 text-sm"
      >
        Back to the poll
      </Link>
    </main>
  )
}
