'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Suggestion {
  id: number
  name: string
}

interface OshiEntry {
  fandomInput: string
  fandomId: number | null
  characterInput: string
  characterId: number | null
}

// ---------------------------------------------------------------------------
// Combobox
// ---------------------------------------------------------------------------
function Combobox({
  value,
  onChange,
  onSelect,
  placeholder,
  fetchSuggestions,
  disabled = false,
}: {
  value: string
  onChange: (v: string) => void
  onSelect: (s: Suggestion) => void
  placeholder: string
  fetchSuggestions: (q: string) => Promise<Suggestion[]>
  disabled?: boolean
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSuggestions([])
    setOpen(false)
  }, [fetchSuggestions])

  const loadSuggestions = useCallback(
    async (q: string) => {
      const results = await fetchSuggestions(q)
      setSuggestions(results)
      setOpen(results.length > 0)
      setActiveIndex(-1)
    },
    [fetchSuggestions]
  )

  const handleChange = (v: string) => {
    onChange(v)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => loadSuggestions(v), 200)
  }

  const handleFocus = () => {
    if (suggestions.length === 0) loadSuggestions(value)
    else setOpen(true)
  }

  const handleSelect = (s: Suggestion) => {
    onSelect(s)
    setSuggestions([])
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-teal-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              onMouseDown={() => handleSelect(s)}
              className={`px-3 py-2 cursor-pointer text-sm transition ${
                i === activeIndex ? 'bg-teal-100 text-teal-700' : 'hover:bg-teal-50'
              }`}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single oshi row
// ---------------------------------------------------------------------------
function OshiRow({
  index,
  entry,
  onChange,
  onRemove,
  canRemove,
  isDuplicate,
}: {
  index: number
  entry: OshiEntry
  onChange: (e: OshiEntry) => void
  onRemove: () => void
  canRemove: boolean
  isDuplicate: boolean
}) {
  const fetchFandoms = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/fandoms?q=${encodeURIComponent(q)}`)
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  }, [])

  const fetchCharacters = useCallback(
    async (q: string) => {
      if (!entry.fandomId) return []
      try {
        const res = await fetch(
          `/api/characters?q=${encodeURIComponent(q)}&fandomId=${entry.fandomId}`
        )
        if (!res.ok) return []
        return await res.json()
      } catch {
        return []
      }
    },
    [entry.fandomId]
  )

  return (
    <div className="bg-white rounded-2xl border border-teal-100 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-teal-300">
          Oshi #{index + 1}
        </span>
        {canRemove && (
          <button
            onClick={onRemove}
            aria-label="Remove"
            className="text-gray-300 hover:text-red-400 transition text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>
      <div className="space-y-2">
        <Combobox
          value={entry.fandomInput}
          onChange={(v) =>
            onChange({ ...entry, fandomInput: v, fandomId: null, characterInput: '', characterId: null })
          }
          onSelect={(s) =>
            onChange({ ...entry, fandomInput: s.name, fandomId: s.id, characterInput: '', characterId: null })
          }
          placeholder="Fandom (e.g. Genshin Impact)"
          fetchSuggestions={fetchFandoms}
        />
        <Combobox
          value={entry.characterInput}
          onChange={(v) => onChange({ ...entry, characterInput: v, characterId: null })}
          onSelect={(s) => onChange({ ...entry, characterInput: s.name, characterId: s.id })}
          placeholder={entry.fandomInput.trim() ? 'Character name...' : 'Enter a fandom first'}
          fetchSuggestions={fetchCharacters}
          disabled={!entry.fandomInput.trim()}
        />
        {entry.fandomInput && !entry.fandomId && (
          <p className="text-xs text-amber-500 px-1">
            Fandom not found in database — it will be saved as-is.
          </p>
        )}
        {entry.fandomId && entry.characterInput && !entry.characterId && (
          <p className="text-xs text-amber-500 px-1">
            Character not found — your input will still be recorded.
          </p>
        )}
        {isDuplicate && (
          <p className="text-xs text-red-400 px-1">
            You already added this character above.
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function PollPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<OshiEntry[]>([
    { fandomInput: '', fandomId: null, characterInput: '', characterId: null },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [socialHandle, setSocialHandle] = useState('')

  const addEntry = () => {
    if (entries.length < 3) {
      setEntries((prev) => [
        ...prev,
        { fandomInput: '', fandomId: null, characterInput: '', characterId: null },
      ])
    }
  }

  const removeEntry = (i: number) => setEntries((prev) => prev.filter((_, idx) => idx !== i))

  const updateEntry = (i: number, entry: OshiEntry) =>
    setEntries((prev) => prev.map((e, idx) => (idx === i ? entry : e)))

  const checkDuplicate = (entry: OshiEntry, index: number): boolean => {
    if (!entry.characterInput.trim()) return false
    return entries.some((other, i) => {
      if (i >= index || !other.characterInput.trim()) return false
      if (entry.characterId !== null && other.characterId !== null)
        return entry.characterId === other.characterId
      return entry.characterInput.trim().toLowerCase() === other.characterInput.trim().toLowerCase()
    })
  }

  const handleSubmit = async () => {
    const valid = entries.filter((e) => e.fandomInput.trim() && e.characterInput.trim())
    if (valid.length === 0) {
      setError('Please fill in at least one oshi.')
      return
    }

    const seen = new Set<string>()
    for (const e of valid) {
      const key = e.characterId !== null
        ? `id:${e.characterId}`
        : `raw:${e.characterInput.trim().toLowerCase()}`
      if (seen.has(key)) {
        setError('You have entered the same character more than once.')
        return
      }
      seen.add(key)
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: valid.map((e) => ({
            fandomInput: e.fandomInput,
            characterInput: e.characterInput,
          })),
          socialHandle: socialHandle.trim() || null,
          website: honeypot,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else {
        router.push('/thank-you')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-3">
          <img src="/yumefess-icon.png" alt="Yumefess" className="w-20 h-20 object-contain" />
        </div>
        <h1 className="text-4xl font-bold text-teal-500 mb-2">Yumefess Oshi Polling 2026</h1>
        <p className="text-gray-400 text-sm">Who is your yume oshi? Vote for up to 3 characters.</p>
      </div>

      {/* Social handle */}
      <div className="mb-4 bg-white rounded-2xl border border-teal-100 p-4 shadow-sm">
        <label className="text-xs font-semibold uppercase tracking-widest text-teal-300 block mb-2">
          Sosial Media <span className="normal-case font-normal text-gray-400">(Opsional) Cantumkan sosial media hanya jika ingin ikut giveaway</span>
        </label>
        <input
          type="text"
          value={socialHandle}
          onChange={(e) => setSocialHandle(e.target.value)}
          placeholder="@yourhandle"
          maxLength={100}
          className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
        />
      </div>

      {/* Oshi entries */}
      <div className="space-y-4">
        {entries.map((entry, i) => (
          <OshiRow
            key={i}
            index={i}
            entry={entry}
            onChange={(e) => updateEntry(i, e)}
            onRemove={() => removeEntry(i)}
            canRemove={entries.length > 1}
            isDuplicate={checkDuplicate(entry, i)}
          />
        ))}
      </div>

      {/* Add more button */}
      {entries.length < 3 && (
        <button
          onClick={addEntry}
          className="mt-4 w-full py-2.5 border-2 border-dashed border-teal-200 rounded-2xl text-teal-300 hover:border-teal-400 hover:text-teal-400 transition text-sm"
        >
          + Add another oshi
        </button>
      )}

      {/* Honeypot — visually hidden, screen readers excluded */}
      <div aria-hidden="true" className="hidden">
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 w-full py-3 bg-teal-400 hover:bg-teal-500 active:bg-teal-600 text-white font-semibold rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {submitting ? 'Submitting...' : 'Submit my votes'}
      </button>

    </main>
  )
}
