'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface TiebreakerCharacter {
  id: number
  name: string
  fandom: string | null
  originalVotes: number
  bracket: 1 | 2
}

function CharacterList({
  bracketNum,
  characters,
  selected,
  onSelect,
}: {
  bracketNum: number
  characters: TiebreakerCharacter[]
  selected: number | null
  onSelect: (id: number | null) => void
}) {
  return (
    <div className="space-y-2">
      {characters.map((char) => (
        <label
          key={char.id}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
            selected === char.id ? 'border-teal-400 bg-teal-50' : 'border-gray-100 hover:border-teal-200'
          }`}
        >
          <input
            type="radio"
            name={`bracket-${bracketNum}`}
            value={char.id}
            checked={selected === char.id}
            onChange={() => onSelect(selected === char.id ? null : char.id)}
            className="accent-teal-500"
          />
          <span className="flex-1 text-sm text-gray-700 font-medium">{char.name}</span>
          {char.fandom && <span className="text-xs text-gray-400">{char.fandom}</span>}
        </label>
      ))}
    </div>
  )
}

export default function TiebreakerPage() {
  const [characters, setCharacters] = useState<TiebreakerCharacter[]>([])
  const [selected1, setSelected1] = useState<number | null>(null)
  const [selected2, setSelected2] = useState<number | null>(null)
  const [voted1, setVoted1] = useState<string | null>(null)
  const [voted2, setVoted2] = useState<string | null>(null)
  const [closed, setClosed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/tiebreaker/characters').then((r) => r.json()),
      fetch('/api/tiebreaker/my-vote').then((r) => r.json()),
    ]).then(([data, myVote]) => {
      setClosed(data.closed)
      setCharacters(data.characters ?? [])
      if (myVote.bracket1) { setVoted1(myVote.bracket1.skipped ? 'none' : myVote.bracket1.characterName); if (!myVote.bracket1.skipped) setSelected1(myVote.bracket1.characterId) }
      if (myVote.bracket2) { setVoted2(myVote.bracket2.skipped ? 'none' : myVote.bracket2.characterName); if (!myVote.bracket2.skipped) setSelected2(myVote.bracket2.characterId) }
      setLoading(false)
    })
  }, [])

  const alreadyVoted = voted1 !== null || voted2 !== null

  const handleSubmit = async () => {
    if (!selected1 && !selected2) return
    // Don't re-submit brackets already voted
    const bracket1CharacterId = voted1 ? undefined : selected1 ?? undefined
    const bracket2CharacterId = voted2 ? undefined : selected2 ?? undefined
    if (!bracket1CharacterId && !bracket2CharacterId) {
      setError('Kamu sudah vote di semua bracket yang dipilih.')
      return
    }
    setSubmitting(true)
    setError(null)
    const res = await fetch('/api/tiebreaker/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bracket1CharacterId, bracket2CharacterId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.')
      setSubmitting(false)
      return
    }
    setVoted1(bracket1CharacterId ? (characters.find((c) => c.id === bracket1CharacterId)?.name ?? null) : 'none')
    setVoted2(bracket2CharacterId ? (characters.find((c) => c.id === bracket2CharacterId)?.name ?? null) : 'none')
    setSuccess(true)
    setSubmitting(false)
  }

  // Brackets are assigned server-side per IP — just split by the bracket field
  const q = search.toLowerCase()
  const match = (c: TiebreakerCharacter) => !q || c.name.toLowerCase().includes(q) || (c.fandom ?? '').toLowerCase().includes(q)
  const bracket1 = characters.filter((c) => c.bracket === 1 && match(c))
  const bracket2 = characters.filter((c) => c.bracket === 2 && match(c))

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </main>
    )
  }

  if (closed || characters.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-gray-400 text-sm">Tiebreaker belum dibuka. Cek lagi nanti!</p>
      </main>
    )
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <Image src="/yumefess-icon.png" alt="Yumefess" width={80} height={80} />
        </div>
        <h1 className="text-3xl font-bold text-teal-500 mb-1">Tiebreaker Round</h1>
        <p className="text-gray-400 text-sm">Yumefess Character Polling 2026</p>
      </div>

      {/* Rules */}
      <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm mb-6 text-sm text-gray-600 leading-relaxed space-y-3">
        <p className="font-bold text-gray-800 text-base">PERATURAN</p>
        <p className="font-semibold text-gray-700">Syarat dan ketentuan:</p>
        <ol className="list-decimal list-outside pl-5 space-y-3">
          <li>
            Merupakan yumejin dan karakter yang diisi dalam survei merupakan karakter yang merupakan
            atau pernah menjadi comfort character yume kalian.
          </li>
          <li>
            BISA BERBAHASA INDONESIA{' '}
            <span className="font-medium">(CAN SPEAK INDONESIAN!! This survey is meant for Indonesians)</span>
          </li>
          <li>Setiap orang hanya diperkenankan mengisi satu kali per bracket.</li>
          <li>
            Tie breaker round dimaksudkan untuk menentukan ranking karakter yang sebelumnya
            memperoleh votes seri di form sebelumnya. Tidak semua karakter di bawah memiliki votes
            yang sama dan karakter yang sebelumnya memperoleh votes lebih sedikit tidak bisa mendapat
            ranking lebih tinggi.
            <div className="mt-2 bg-teal-50 rounded-xl p-3 text-gray-500 text-xs space-y-1">
              <p>
                <span className="font-medium">Contoh:</span> Jika sebelumnya A mendapat 9 votes dan
                B 12 votes lalu B mendapat 10 votes dan A mendapat 15 votes di tie breaker round, B
                akan tetap memperoleh ranking diatas A.
              </p>
              <p>
                <span className="font-medium">Contoh:</span> bila C dan D sebelumnya sama-sama memiliki 9 votes lalu C
                memperoleh 10 votes dan D mendapat 15 votes di tie breaker round maka D akan
                memperoleh ranking diatas C.
              </p>
            </div>
          </li>
          <li>
            Peserta dipersilakan untuk memilih satu karakter dari Bracket 1, satu karakter dari
            Bracket 2, atau keduanya sekaligus. Pengisian salah satu bracket sudah cukup dan tidak
            diwajibkan untuk mengisi bracket lainnya. Tolong pastikan anda telah mengisi semua bracket 
            yang anda ingin (baik salah satu atau keduanya) sebelum klik 'submit'.
          
          </li>
          <li>
            Posisi dan populasi karakter di tiap bracket bersifat acak bagi tiap orang dan tidak mencerminkan ranking karakter tersebut. 
          
          </li>
          <li>
            Karakter yang namanya tidak ada di form ini bukan berarti tidak masuk list. List ini hanya termasuk 
            karakter yang memiliki kesamaan vote dengan satu atau lebih karakter lain.
          </li>
        </ol>
        <p className="border-t border-teal-50 pt-3 text-gray-500">
          Mohon untuk membaca dengan cermat instruksi yang sudah diberikan agar mempermudah kerja
          admin. Silahkan bertanya jika merasa tidak mengerti. Terima kasih.
        </p>
      </div>

      {/* Success banner */}
      {success && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-4 text-center text-sm text-teal-700 font-medium">
          Vote terkirim! Terima kasih sudah berpartisipasi.
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari karakter atau fandom…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-teal-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {/* Bracket 1 */}
        {bracket1.length > 0 && (
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-teal-600">Bracket 1</h2>
              <div className="flex items-center gap-2">
              {selected1 && !voted1 && (
                <button onClick={() => setSelected1(null)} className="text-xs text-gray-400 hover:text-gray-600 transition">Clear</button>
              )}
              {voted1 && (
                <span className="text-xs text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">
                  {voted1 === 'none' ? 'Voted: none' : `Voted: ${voted1}`}
                </span>
              )}
              </div>
            </div>
            {voted1 ? (
              voted1 === 'none'
                ? <p className="text-xs text-gray-400 italic">—</p>
                : <p className="text-xs text-gray-400">Kamu sudah memilih di bracket ini.</p>
            ) : alreadyVoted ? (
              <p className="text-xs text-gray-400 italic">—</p>
            ) : (
              <CharacterList bracketNum={1} characters={bracket1} selected={selected1} onSelect={setSelected1} />
            )}
          </div>
        )}

        {/* Bracket 2 */}
        {bracket2.length > 0 && (
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-teal-600">Bracket 2</h2>
              <div className="flex items-center gap-2">
              {selected2 && !voted2 && (
                <button onClick={() => setSelected2(null)} className="text-xs text-gray-400 hover:text-gray-600 transition">Clear</button>
              )}
              {voted2 && (
                <span className="text-xs text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">
                  {voted2 === 'none' ? 'Voted: none' : `Voted: ${voted2}`}
                </span>
              )}
              </div>
            </div>
            {voted2 ? (
              voted2 === 'none'
                ? <p className="text-xs text-gray-400 italic">—</p>
                : <p className="text-xs text-gray-400">Kamu sudah memilih di bracket ini.</p>
            ) : alreadyVoted ? (
              <p className="text-xs text-gray-400 italic">—</p>
            ) : (
              <CharacterList bracketNum={2} characters={bracket2} selected={selected2} onSelect={setSelected2} />
            )}
          </div>
        )}

        {!alreadyVoted && (
          <>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={(!selected1 && !selected2) || submitting}
              className="w-full py-3 bg-teal-400 hover:bg-teal-500 active:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-2xl transition shadow-sm"
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}
