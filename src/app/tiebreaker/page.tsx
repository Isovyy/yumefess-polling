'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface TiebreakerCharacter {
  id: number
  name: string
  fandom: string | null
  originalVotes: number
}

function CharacterList({
  characters,
  selected,
  onSelect,
}: {
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
            name={`bracket-${char.originalVotes > 7 ? 1 : 2}`}
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

  useEffect(() => {
    Promise.all([
      fetch('/api/tiebreaker/characters').then((r) => r.json()),
      fetch('/api/tiebreaker/my-vote').then((r) => r.json()),
    ]).then(([data, myVote]) => {
      setClosed(data.closed)
      setCharacters(data.characters ?? [])
      if (myVote.bracket1) { setVoted1(myVote.bracket1.characterName); setSelected1(myVote.bracket1.characterId) }
      if (myVote.bracket2) { setVoted2(myVote.bracket2.characterName); setSelected2(myVote.bracket2.characterId) }
      setLoading(false)
    })
  }, [])

  const alreadyVotedBoth = voted1 !== null && voted2 !== null

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
    if (bracket1CharacterId) setVoted1(characters.find((c) => c.id === bracket1CharacterId)?.name ?? null)
    if (bracket2CharacterId) setVoted2(characters.find((c) => c.id === bracket2CharacterId)?.name ?? null)
    setSuccess(true)
    setSubmitting(false)
  }

  const alpha = (a: TiebreakerCharacter, b: TiebreakerCharacter) => a.name.localeCompare(b.name)
  const bracket1 = characters.filter((c) => c.originalVotes > 7).sort(alpha)
  const bracket2 = characters.filter((c) => c.originalVotes === 6 || c.originalVotes === 7).sort(alpha)

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
                Sebagai contoh lain, bila C dan D sebelumnya sama-sama memiliki 9 votes lalu C
                memperoleh 10 votes dan D mendapat 15 votes di tie breaker round maka D akan
                memperoleh ranking diatas C.
              </p>
            </div>
          </li>
          <li>
            Peserta dipersilakan untuk memilih satu karakter dari Bracket 1, satu karakter dari
            Bracket 2, atau keduanya sekaligus. Pengisian salah satu bracket sudah cukup dan tidak
            diwajibkan untuk mengisi bracket lainnya.
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

      <div className="space-y-4">
        {/* Bracket 1 */}
        {bracket1.length > 0 && (
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-teal-600">Bracket 1</h2>
              {voted1 && (
                <span className="text-xs text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">
                  Voted: {voted1}
                </span>
              )}
            </div>
            {voted1 ? (
              <p className="text-xs text-gray-400">Kamu sudah memilih di bracket ini.</p>
            ) : (
              <CharacterList characters={bracket1} selected={selected1} onSelect={setSelected1} />
            )}
          </div>
        )}

        {/* Bracket 2 */}
        {bracket2.length > 0 && (
          <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-teal-600">Bracket 2</h2>
              {voted2 && (
                <span className="text-xs text-teal-500 bg-teal-50 px-2 py-0.5 rounded-full">
                  Voted: {voted2}
                </span>
              )}
            </div>
            {voted2 ? (
              <p className="text-xs text-gray-400">Kamu sudah memilih di bracket ini.</p>
            ) : (
              <CharacterList characters={bracket2} selected={selected2} onSelect={setSelected2} />
            )}
          </div>
        )}

        {!alreadyVotedBoth && (
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
