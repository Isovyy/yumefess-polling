'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface TiebreakerCharacter {
  id: number
  name: string
  fandom: string | null
  originalVotes: number
  _count: { entries: number }
}

interface TiedCharacter {
  id: number
  name: string
  fandom: string
  originalVotes: number
}

type Group = { originalVotes: number; characters: TiebreakerCharacter[] }

function groupByVotes(characters: TiebreakerCharacter[]): Group[] {
  const map = new Map<number, TiebreakerCharacter[]>()
  for (const c of characters) {
    if (!map.has(c.originalVotes)) map.set(c.originalVotes, [])
    map.get(c.originalVotes)!.push(c)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([originalVotes, chars]) => ({
      originalVotes,
      characters: chars.sort((a, b) => b._count.entries - a._count.entries),
    }))
}

export default function TiebreakerAdmin() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [fandom, setFandom] = useState('')
  const [originalVotes, setOriginalVotes] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [tiedChars, setTiedChars] = useState<TiedCharacter[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [tiebreakerOpen, setTiebreakerOpen] = useState<boolean | null>(null)

  const fetchCharacters = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/tiebreaker/characters')
      .then((r) => r.json())
      .then((data) => {
        setGroups(groupByVotes(data))
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchCharacters()
    fetch('/api/admin/tiebreaker/status')
      .then((r) => r.json())
      .then((d) => setTiebreakerOpen(d.open))
  }, [fetchCharacters])

  const handleToggle = async () => {
    const action = tiebreakerOpen ? 'Close' : 'Open'
    if (!confirm(`${action} the tiebreaker?`)) return
    const res = await fetch('/api/admin/tiebreaker/status', { method: 'POST' })
    const d = await res.json()
    setTiebreakerOpen(d.open)
  }

  const handleLoadTied = async () => {
    const res = await fetch('/api/admin/tiebreaker/tied')
    const data: TiedCharacter[] = await res.json()
    setTiedChars(data)
  }

  const importOne = async (c: TiedCharacter) => {
    await fetch('/api/admin/tiebreaker/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: c.name, fandom: c.fandom, originalVotes: c.originalVotes }),
    })
    setTiedChars((prev) => prev?.filter((x) => x.id !== c.id) ?? null)
    fetchCharacters()
  }

  const handleImportAll = async (chars: TiedCharacter[]) => {
    if (!confirm(`Import ${chars.length} tied characters into the tiebreaker?`)) return
    setImporting(true)
    for (const c of chars) {
      await fetch('/api/admin/tiebreaker/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: c.name, fandom: c.fandom, originalVotes: c.originalVotes }),
      })
    }
    setTiedChars(null)
    fetchCharacters()
    setImporting(false)
  }

  const handleAdd = async () => {
    if (!name.trim() || !originalVotes) return
    setAdding(true)
    setAddError(null)
    const res = await fetch('/api/admin/tiebreaker/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), fandom: fandom.trim() || null, originalVotes: Number(originalVotes) }),
    })
    if (!res.ok) {
      const d = await res.json()
      setAddError(d.error ?? 'Failed to add character')
    } else {
      setName('')
      setFandom('')
      setOriginalVotes('')
      fetchCharacters()
    }
    setAdding(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this character from the tiebreaker?')) return
    await fetch(`/api/admin/tiebreaker/characters/${id}`, { method: 'DELETE' })
    fetchCharacters()
  }

  const totalVotes = groups.flatMap((g) => g.characters).reduce((s, c) => s + c._count.entries, 0)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-teal-500">Tiebreaker Management</h1>
        <div className="flex gap-3 items-center">
          <span className="text-xs text-gray-400">{totalVotes} votes total</span>
          <button
            onClick={handleToggle}
            className={`text-xs transition ${tiebreakerOpen ? 'text-orange-400 hover:text-orange-600' : 'text-green-500 hover:text-green-700'}`}
          >
            {tiebreakerOpen === null ? '…' : tiebreakerOpen ? 'Close tiebreaker' : 'Open tiebreaker'}
          </button>
          <Link href="/admin/dashboard" className="text-xs text-gray-400 hover:text-gray-600 transition">
            ← Hub
          </Link>
        </div>
      </div>

      {/* Import from poll results */}
      <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Import from Poll Results</h2>
          <button
            onClick={handleLoadTied}
            className="text-xs text-teal-500 hover:text-teal-700 transition"
          >
            Load tied characters
          </button>
        </div>
        {tiedChars === null ? (
          <p className="text-xs text-gray-400">Click "Load tied characters" to fetch characters with equal votes from the main poll.</p>
        ) : tiedChars.length === 0 ? (
          <p className="text-xs text-gray-400">No tied characters found in poll results.</p>
        ) : (
          <div>
            <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {tiedChars.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50">
                  <span className="flex-1 text-gray-700 font-medium">{c.name} <span className="text-gray-400 font-normal">({c.fandom})</span></span>
                  <span className="text-teal-600 shrink-0">{c.originalVotes} votes</span>
                  <button
                    onClick={() => importOne(c)}
                    className="shrink-0 text-teal-500 hover:text-teal-700 font-medium transition"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleImportAll(tiedChars)}
              disabled={importing}
              className="w-full py-2 bg-teal-400 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {importing ? 'Importing…' : `Import all ${tiedChars.length} characters`}
            </button>
          </div>
        )}
      </div>

      {/* Add character form */}
      <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Character</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Character name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
          <input
            type="text"
            placeholder="Fandom (optional)"
            value={fandom}
            onChange={(e) => setFandom(e.target.value)}
            className="flex-1 min-w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
          <input
            type="number"
            placeholder="Original votes *"
            value={originalVotes}
            onChange={(e) => setOriginalVotes(e.target.value)}
            className="w-36 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !name.trim() || !originalVotes}
            className="px-4 py-2 bg-teal-400 hover:bg-teal-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
        {addError && <p className="text-red-500 text-xs mt-2">{addError}</p>}
      </div>

      {/* Groups */}
      {loading ? (
        <p className="text-gray-400 text-sm text-center py-10">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">No characters added yet.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group, idx) => {
            const label = String.fromCharCode(65 + idx) // A, B, C...
            const maxVotes = Math.max(...group.characters.map((c) => c._count.entries))
            const isTied = group.characters.length > 1
            return (
              <div key={group.originalVotes} className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
                {/* Group header */}
                <div className="bg-teal-50 px-4 py-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-teal-700">
                    Bracket {label}
                    <span className="ml-2 font-normal text-teal-500 text-xs">({group.originalVotes} original votes)</span>
                  </span>
                  {isTied && (
                    <span className="text-xs text-teal-500 bg-teal-100 px-2 py-0.5 rounded-full">
                      {group.characters.length} tied
                    </span>
                  )}
                </div>

                {/* Characters in group */}
                <div className="divide-y divide-gray-50">
                  {group.characters.map((char, i) => {
                    const isLeader = char._count.entries === maxVotes && maxVotes > 0
                    return (
                      <div key={char.id} className={`flex items-center gap-3 px-4 py-3 ${isLeader && isTied ? 'bg-green-50' : ''}`}>
                        <span className="text-xs text-gray-300 w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {char.name}
                            {isLeader && isTied && (
                              <span className="ml-2 text-xs text-green-600 font-normal">leading</span>
                            )}
                          </p>
                          {char.fandom && (
                            <p className="text-xs text-gray-400 truncate">{char.fandom}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-teal-600 w-16 text-right">
                          {char._count.entries} vote{char._count.entries !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => handleDelete(char.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
