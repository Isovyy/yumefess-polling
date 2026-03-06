'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CharacterStat {
  id: number
  name: string
  votes: number
}

interface FandomStat {
  id: number
  name: string
  characters: CharacterStat[]
}

interface OverallEntry {
  name: string
  fandom?: string
  value: number
}

interface StatsData {
  fandoms: FandomStat[]
  unresolvedCount: number
  totalSubmissions: number
  topCharacters: OverallEntry[]
  topFandoms: OverallEntry[]
}

interface RawBreakdown {
  input: string
  count: number
}

interface Unresolved {
  rawFandomInput: string
  rawCharacterInput: string
  count: number
}

interface AdminCharacter {
  id: number
  canonicalName: string
  aliases: { id: number; alias: string }[]
}

interface AdminFandom {
  id: number
  name: string
  nameNorm: string
}

// ---------------------------------------------------------------------------
// Colours for pie charts
// ---------------------------------------------------------------------------
const COLORS = [
  '#fb7185', '#f472b6', '#c084fc', '#818cf8', '#38bdf8',
  '#34d399', '#fbbf24', '#f97316', '#a78bfa', '#2dd4bf',
]

// ---------------------------------------------------------------------------
// Stats tab
// ---------------------------------------------------------------------------
function OverviewPieChart({ title, data }: { title: string; data: OverallEntry[] }) {
  if (data.length === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
      <h3 className="font-bold text-gray-700 mb-1">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, _name: string, props) => {
              const entry = props.payload as OverallEntry
              return [`${v} votes`, entry.fandom ? `${entry.name} (${entry.fandom})` : entry.name]
            }}
          />
          <Legend formatter={(_value, props) => {
            const entry = props.payload as unknown as OverallEntry
            return entry.fandom ? `${entry.name} (${entry.fandom})` : entry.name
          }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatsTab({ stats }: { stats: StatsData }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<RawBreakdown[]>([])
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)

  const loadBreakdown = async (characterId: number) => {
    if (expanded === characterId) {
      setExpanded(null)
      return
    }
    setLoadingBreakdown(true)
    setExpanded(characterId)
    const res = await fetch(`/api/admin/stats/${characterId}`)
    setBreakdown(await res.json())
    setLoadingBreakdown(false)
  }

  if (stats.totalSubmissions === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-10">
        No data yet. Collect some votes first!
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white rounded-2xl border border-teal-100 p-4">
          <p className="text-3xl font-bold text-teal-400">{stats.totalSubmissions}</p>
          <p className="text-xs text-gray-400 mt-1">Total submissions</p>
        </div>
        <div className="bg-white rounded-2xl border border-teal-100 p-4">
          <p className="text-3xl font-bold text-amber-400">{stats.unresolvedCount}</p>
          <p className="text-xs text-gray-400 mt-1">Unresolved entries</p>
        </div>
      </div>

      <OverviewPieChart title="Overall Characters" data={stats.topCharacters} />
      <OverviewPieChart title="Overall Fandoms" data={stats.topFandoms} />

      {stats.fandoms.map((fandom) => {
        const total = fandom.characters.reduce((s, c) => s + c.votes, 0)
        if (fandom.characters.length === 0) return null

        const pieData = fandom.characters
          .map((c) => ({ name: c.name, value: c.votes }))

        return (
          <div key={fandom.id} className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
            <div className="flex justify-between items-baseline mb-4">
              <h3 className="font-bold text-gray-700">{fandom.name}</h3>
              <span className="text-xs text-gray-400">{total} votes</span>
            </div>

            {pieData.length > 0 && (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} votes`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="mt-4 space-y-1">
              {fandom.characters.map((c) => (
                <div key={c.id}>
                  <button
                    onClick={() => loadBreakdown(c.id)}
                    className="w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-teal-50 transition text-sm text-left"
                  >
                    <span className="text-gray-700">{c.name}</span>
                    <span className="text-teal-400 font-semibold">{c.votes}</span>
                  </button>

                  {expanded === c.id && (
                    <div className="ml-4 mt-1 mb-2 bg-teal-50 rounded-lg p-3">
                      {loadingBreakdown ? (
                        <p className="text-xs text-gray-400">Loading...</p>
                      ) : breakdown.length === 0 ? (
                        <p className="text-xs text-gray-400">No raw data.</p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-500 mb-2">
                            Raw inputs (exactly as typed):
                          </p>
                          {breakdown.map((b) => (
                            <div key={b.input} className="flex justify-between text-xs text-gray-600">
                              <span className="font-mono">{b.input}</span>
                              <span className="text-teal-400">{b.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Manage tab
// ---------------------------------------------------------------------------
function ManageTab() {
  const [fandoms, setFandoms] = useState<AdminFandom[]>([])
  const [newFandomName, setNewFandomName] = useState('')
  const [fandomError, setFandomError] = useState('')

  const [selectedFandomId, setSelectedFandomId] = useState<number | null>(null)
  const [characters, setCharacters] = useState<AdminCharacter[]>([])
  const [newCharName, setNewCharName] = useState('')
  const [newCharAliases, setNewCharAliases] = useState('')
  const [charError, setCharError] = useState('')

  const [expandedChar, setExpandedChar] = useState<number | null>(null)
  const [newAlias, setNewAlias] = useState('')
  const [aliasMsg, setAliasMsg] = useState('')

  const loadFandoms = useCallback(async () => {
    const res = await fetch('/api/admin/fandoms')
    setFandoms(await res.json())
  }, [])

  const loadCharacters = useCallback(async (fandomId: number) => {
    const res = await fetch(`/api/admin/characters?fandomId=${fandomId}`)
    setCharacters(await res.json())
  }, [])

  useEffect(() => { loadFandoms() }, [loadFandoms])

  useEffect(() => {
    if (selectedFandomId) loadCharacters(selectedFandomId)
    else setCharacters([])
  }, [selectedFandomId, loadCharacters])

  const addFandom = async () => {
    setFandomError('')
    if (!newFandomName.trim()) return
    const res = await fetch('/api/admin/fandoms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFandomName.trim() }),
    })
    if (res.ok) {
      setNewFandomName('')
      loadFandoms()
    } else {
      const d = await res.json()
      setFandomError(d.error)
    }
  }

  const deleteFandom = async (id: number) => {
    if (!confirm('Delete this fandom and all its characters?')) return
    await fetch(`/api/admin/fandoms/${id}`, { method: 'DELETE' })
    if (selectedFandomId === id) setSelectedFandomId(null)
    loadFandoms()
  }

  const addCharacter = async () => {
    setCharError('')
    if (!newCharName.trim() || !selectedFandomId) return
    const aliases = newCharAliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
    const res = await fetch('/api/admin/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fandomId: selectedFandomId, canonicalName: newCharName.trim(), aliases }),
    })
    if (res.ok) {
      setNewCharName('')
      setNewCharAliases('')
      loadCharacters(selectedFandomId)
    } else {
      const d = await res.json()
      setCharError(d.error)
    }
  }

  const deleteCharacter = async (id: number) => {
    if (!confirm('Delete this character?')) return
    await fetch(`/api/admin/characters/${id}`, { method: 'DELETE' })
    if (selectedFandomId) loadCharacters(selectedFandomId)
  }

  const addAlias = async (characterId: number) => {
    setAliasMsg('')
    if (!newAlias.trim()) return
    const res = await fetch(`/api/admin/characters/${characterId}/aliases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: newAlias.trim() }),
    })
    const d = await res.json()
    if (res.ok) {
      setNewAlias('')
      setAliasMsg(
        d.resolved > 0 ? `Alias added! Also resolved ${d.resolved} unresolved entry/entries.` : 'Alias added.'
      )
      if (selectedFandomId) loadCharacters(selectedFandomId)
    } else {
      setAliasMsg(d.error)
    }
  }

  const deleteAlias = async (characterId: number, aliasId: number) => {
    await fetch(`/api/admin/characters/${characterId}/aliases`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aliasId }),
    })
    if (selectedFandomId) loadCharacters(selectedFandomId)
  }

  return (
    <div className="space-y-6">
      {/* Add fandom */}
      <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">Add Fandom</h3>
        <div className="flex gap-2">
          <input
            value={newFandomName}
            onChange={(e) => setNewFandomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFandom()}
            placeholder="Fandom name"
            className="flex-1 px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
          <button
            onClick={addFandom}
            className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition"
          >
            Add
          </button>
        </div>
        {fandomError && <p className="text-red-400 text-xs mt-2">{fandomError}</p>}
      </div>

      {/* Fandom list with inline character accordion */}
      <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-3">Fandoms</h3>
        {fandoms.length === 0 ? (
          <p className="text-gray-400 text-sm">No fandoms yet.</p>
        ) : (
          <div className="space-y-1">
            {fandoms.map((f) => (
              <div key={f.id} className="rounded-lg overflow-hidden border border-transparent">
                {/* Fandom row */}
                <div
                  className={`flex justify-between items-center px-3 py-2 cursor-pointer transition ${
                    selectedFandomId === f.id ? 'bg-teal-100 text-teal-600' : 'hover:bg-teal-50'
                  }`}
                  onClick={() => setSelectedFandomId(selectedFandomId === f.id ? null : f.id)}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs transition-transform duration-150 ${selectedFandomId === f.id ? 'rotate-90' : ''} text-teal-300`}>›</span>
                    <span className="text-sm truncate">{f.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFandom(f.id) }}
                    className="text-gray-300 hover:text-red-400 transition text-lg leading-none shrink-0"
                  >
                    ×
                  </button>
                </div>

                {/* Inline character panel */}
                {selectedFandomId === f.id && (
                  <div className="border-t border-teal-100 bg-teal-50 px-4 py-4 space-y-3">
                    {/* Add character */}
                    <div className="space-y-2">
                      <input
                        value={newCharName}
                        onChange={(e) => setNewCharName(e.target.value)}
                        placeholder="Canonical name (e.g. Tartaglia)"
                        className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                      />
                      <input
                        value={newCharAliases}
                        onChange={(e) => setNewCharAliases(e.target.value)}
                        placeholder="Extra aliases, comma-separated (e.g. Childe, Ajax)"
                        className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                      />
                      <button
                        onClick={addCharacter}
                        className="w-full py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition"
                      >
                        Add Character
                      </button>
                      {charError && <p className="text-red-400 text-xs">{charError}</p>}
                    </div>

                    {/* Character list */}
                    {characters.length === 0 ? (
                      <p className="text-gray-400 text-sm">No characters yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {characters.map((c) => (
                          <div key={c.id} className="border border-teal-100 rounded-xl overflow-hidden bg-white">
                            <div
                              className="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-teal-50 transition"
                              onClick={() => setExpandedChar(expandedChar === c.id ? null : c.id)}
                            >
                              <span className="text-sm font-medium text-gray-700">{c.canonicalName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-300">{c.aliases.length} alias(es)</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteCharacter(c.id) }}
                                  className="text-gray-300 hover:text-red-400 transition text-lg leading-none"
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                            {expandedChar === c.id && (
                              <div className="px-4 pb-3 pt-2 bg-teal-50 space-y-2">
                                <div className="flex flex-wrap gap-1">
                                  {c.aliases.map((a) => (
                                    <span
                                      key={a.id}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-teal-200 rounded-full text-xs text-gray-600"
                                    >
                                      {a.alias}
                                      <button
                                        onClick={() => deleteAlias(c.id, a.id)}
                                        className="text-gray-300 hover:text-red-400 leading-none"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    value={newAlias}
                                    onChange={(e) => setNewAlias(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addAlias(c.id)}
                                    placeholder="Add alias (e.g. Childe)"
                                    className="flex-1 px-2 py-1.5 border border-teal-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                                  />
                                  <button
                                    onClick={() => addAlias(c.id)}
                                    className="px-3 py-1.5 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition"
                                  >
                                    Add
                                  </button>
                                </div>
                                {aliasMsg && (
                                  <p className="text-xs text-green-600">{aliasMsg}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Unresolved tab
// ---------------------------------------------------------------------------
interface AssignFandom { id: number; name: string }
interface AssignChar { id: number; canonicalName: string }

function UnresolvedTab() {
  const [unresolved, setUnresolved] = useState<Unresolved[]>([])
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  // "assign to existing" state
  const [assignKey, setAssignKey] = useState<string | null>(null)
  const [assignFandoms, setAssignFandoms] = useState<AssignFandom[]>([])
  const [assignFandomId, setAssignFandomId] = useState<number | null>(null)
  const [assignChars, setAssignChars] = useState<AssignChar[]>([])
  const [assignCharId, setAssignCharId] = useState<number | null>(null)

  const load = () => {
    fetch('/api/admin/unresolved')
      .then((r) => r.json())
      .then((d) => { setUnresolved(d); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openAssign = async (key: string) => {
    if (assignKey === key) { setAssignKey(null); return }
    setAssignKey(key)
    setAssignFandomId(null)
    setAssignCharId(null)
    setAssignChars([])
    const res = await fetch('/api/admin/fandoms')
    setAssignFandoms(await res.json())
  }

  const pickAssignFandom = async (fandomId: number) => {
    setAssignFandomId(fandomId)
    setAssignCharId(null)
    const res = await fetch(`/api/admin/characters?fandomId=${fandomId}`)
    setAssignChars(await res.json())
  }

  const assignToExisting = async (rawCharacterInput: string) => {
    if (!assignCharId) return
    setResolving(assignKey)
    setMsg('')
    const res = await fetch(`/api/admin/characters/${assignCharId}/aliases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: rawCharacterInput }),
    })
    const d = await res.json()
    if (res.ok) {
      const charName = assignChars.find((c) => c.id === assignCharId)?.canonicalName ?? ''
      const fandomName = assignFandoms.find((f) => f.id === assignFandomId)?.name ?? ''
      setMsg(
        d.resolved > 0
          ? `Assigned to "${charName}" (${fandomName}) and resolved ${d.resolved} entry/entries.`
          : `Added alias to "${charName}" (${fandomName}). No entries resolved yet (fandom may not match).`
      )
      setAssignKey(null)
      load()
    } else {
      setMsg(d.error ?? 'Error assigning alias.')
    }
    setResolving(null)
  }

  const addAsNew = async (u: Unresolved) => {
    const key = `${u.rawFandomInput}::${u.rawCharacterInput}`
    setResolving(key)
    setMsg('')
    const res = await fetch('/api/admin/unresolved/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawFandomInput: u.rawFandomInput, rawCharacterInput: u.rawCharacterInput }),
    })
    const d = await res.json()
    if (res.ok) {
      setMsg(`Added "${d.character}" to "${d.fandom}" and resolved ${d.resolved} entry/entries.`)
      load()
    }
    setResolving(null)
  }

  if (loading) return <p className="text-gray-400 text-sm text-center py-10">Loading...</p>

  if (unresolved.length === 0) {
    return (
      <p className="text-green-500 text-sm text-center py-10">
        All entries are resolved.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        These entries could not be matched to a known character. Add as new, or assign to an existing character as an alias.
      </p>
      {msg && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{msg}</p>}
      {unresolved.map((u, i) => {
        const key = `${u.rawFandomInput}::${u.rawCharacterInput}`
        const isAssigning = assignKey === key
        return (
          <div key={i} className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{u.rawCharacterInput}</p>
                <p className="text-xs text-gray-400 truncate">{u.rawFandomInput}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-amber-400 font-semibold text-sm">{u.count}×</span>
                <button
                  onClick={() => openAssign(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                    isAssigning
                      ? 'bg-violet-100 text-violet-600 border-violet-200'
                      : 'bg-white text-violet-500 border-violet-200 hover:bg-violet-50'
                  }`}
                >
                  Assign
                </button>
                <button
                  onClick={() => addAsNew(u)}
                  disabled={resolving === key}
                  className="px-3 py-1 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {resolving === key ? '...' : 'Add as new'}
                </button>
              </div>
            </div>

            {isAssigning && (
              <div className="px-4 pb-4 pt-1 bg-violet-50 border-t border-violet-100 space-y-2">
                <p className="text-xs text-violet-500 font-medium">Assign as alias of existing character:</p>
                <select
                  value={assignFandomId ?? ''}
                  onChange={(e) => pickAssignFandom(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-violet-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="">Select fandom…</option>
                  {assignFandoms.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                {assignChars.length > 0 && (
                  <select
                    value={assignCharId ?? ''}
                    onChange={(e) => setAssignCharId(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-violet-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                  >
                    <option value="">Select character…</option>
                    {assignChars.map((c) => (
                      <option key={c.id} value={c.id}>{c.canonicalName}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => assignToExisting(u.rawCharacterInput)}
                  disabled={!assignCharId || resolving === key}
                  className="w-full py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-xs font-semibold transition disabled:opacity-40"
                >
                  {resolving === key ? '...' : 'Confirm assign'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Responses tab
// ---------------------------------------------------------------------------
interface SubmissionEntry {
  id: number
  rank: number
  rawFandomInput: string
  rawCharacterInput: string
  character: { canonicalName: string; fandom: { name: string } } | null
}

interface SubmissionRecord {
  id: number
  createdAt: string
  socialHandle: string | null
  entries: SubmissionEntry[]
}

function ResponsesTab() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const pageSize = 50

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/submissions?page=${page}`)
      .then((r) => r.json())
      .then((d) => { setSubmissions(d.submissions); setTotal(d.total); setLoading(false) })
  }, [page])

  if (loading) return <p className="text-gray-400 text-sm text-center py-10">Loading...</p>

  if (submissions.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-10">No submissions yet.</p>
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{total} total responses</p>
      {submissions.map((s) => (
        <div key={s.id} className="bg-white rounded-xl border border-teal-100 shadow-sm overflow-hidden">
          <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 flex justify-between items-center">
            <span className="text-xs text-teal-500 font-medium">
              {new Date(s.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            {s.socialHandle && (
              <span className="text-xs text-gray-500 font-mono">{s.socialHandle}</span>
            )}
          </div>
          <div className="px-4 py-3 space-y-1.5">
            {s.entries.map((e) => (
              <div key={e.id} className="flex gap-2 text-sm">
                <span className="text-teal-300 font-semibold shrink-0">#{e.rank}</span>
                <div className="min-w-0">
                  {e.character ? (
                    <span className="text-gray-700">
                      <span className="font-medium">{e.character.canonicalName}</span>
                      <span className="text-gray-400"> — {e.character.fandom.name}</span>
                    </span>
                  ) : (
                    <span className="text-amber-500 italic">
                      {e.rawCharacterInput}
                      <span className="text-gray-400 not-italic"> — {e.rawFandomInput}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-xs bg-teal-100 text-teal-600 rounded-lg disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-400 self-center">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-xs bg-teal-100 text-teal-600 rounded-lg disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
type Tab = 'stats' | 'manage' | 'unresolved' | 'responses'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('stats')
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = useCallback(() => {
    setLoadingStats(true)
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoadingStats(false) })
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    if (tab === 'stats') fetchStats()
  }, [tab, fetchStats])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stats', label: 'Statistics' },
    { key: 'manage', label: 'Manage' },
    { key: 'unresolved', label: `Unresolved${stats ? ` (${stats.unresolvedCount})` : ''}` },
    { key: 'responses', label: 'Responses' },
  ]

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-teal-500">Admin Dashboard</h1>
        <div className="flex items-center gap-3">
          <a
            href="/api/admin/export-seed"
            download="seed.js"
            className="text-xs text-teal-400 hover:text-teal-600 transition"
          >
            Export seed.js
          </a>
          <button
            onClick={async () => {
              if (!confirm('Delete ALL submissions and votes? Fandoms and characters will be kept. This cannot be undone.')) return
              await fetch('/api/admin/clear-submissions', { method: 'POST' })
              fetchStats()
            }}
            className="text-xs text-red-400 hover:text-red-600 transition"
          >
            Clear submissions
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-teal-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? 'bg-white text-teal-500 shadow-sm'
                : 'text-teal-300 hover:text-teal-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'stats' && (
        loadingStats ? (
          <p className="text-gray-400 text-sm text-center py-10">Loading stats...</p>
        ) : stats ? (
          <StatsTab stats={stats} />
        ) : null
      )}
      {tab === 'manage' && <ManageTab />}
      {tab === 'unresolved' && <UnresolvedTab />}
      {tab === 'responses' && <ResponsesTab />}
    </main>
  )
}
