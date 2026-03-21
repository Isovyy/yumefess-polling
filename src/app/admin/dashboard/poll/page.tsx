'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
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
  entryIds: number[]
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
  aliases: { id: number; alias: string; aliasNorm: string }[]
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
type ChartType = 'pie' | 'bar'

function FandomChart({ data, chartType }: { data: { name: string; value: number }[]; chartType: ChartType }) {
  const [showAll, setShowAll] = useState(false)
  if (data.length === 0) return null
  const sorted = [...data].sort((a, b) => b.value - a.value)

  if (chartType === 'bar') {
    const displayData = showAll ? sorted : sorted.slice(0, FANDOM_BAR_LIMIT)
    const barHeight = Math.max(displayData.length * 36, 80)
    const labelWidth = Math.min(Math.max(...displayData.map((d) => d.name.length)) * 6.5, 160)
    return (
      <div>
        <ResponsiveContainer width="100%" height={barHeight}>
          <BarChart layout="vertical" data={displayData} margin={{ left: 4, right: 24, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={labelWidth}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => [`${v} votes`]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {displayData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {sorted.length > FANDOM_BAR_LIMIT && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-2 text-xs text-teal-400 hover:text-teal-600 transition"
          >
            {showAll ? `Show top ${FANDOM_BAR_LIMIT}` : `Show all ${sorted.length}`}
          </button>
        )}
      </div>
    )
  }

  // No legend inside — the sorted list below the chart already shows all names + votes
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={sorted}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ percent }) => `${Math.round(percent * 100)}%`}
          labelLine={false}
        >
          {sorted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number, _n, props) => [`${v} votes`, props.payload?.name ?? '']} />
      </PieChart>
    </ResponsiveContainer>
  )
}

const PIE_LIMIT = 10
const BAR_LIMIT = 20
const FANDOM_BAR_LIMIT = 20

function capData(sorted: OverallEntry[], limit: number) {
  if (sorted.length <= limit) return { capped: sorted, othersCount: 0, othersVotes: 0 }
  const top = sorted.slice(0, limit)
  const rest = sorted.slice(limit)
  const othersVotes = rest.reduce((s, d) => s + d.value, 0)
  return { capped: top, othersCount: rest.length, othersVotes }
}

function OverallChart({ title, data, chartType }: { title: string; data: OverallEntry[]; chartType: ChartType }) {
  const [showAll, setShowAll] = useState(false)
  if (data.length === 0) return null
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const limit = chartType === 'pie' ? PIE_LIMIT : BAR_LIMIT
  const { capped, othersCount, othersVotes } = capData(sorted, showAll ? sorted.length : limit)

  const displayData = !showAll && othersCount > 0
    ? [...capped, { name: `Others (${othersCount} more)`, value: othersVotes }]
    : capped

  if (chartType === 'bar') {
    const barHeight = Math.max(displayData.length * 36, 80)
    const barData = displayData.map((d) => ({
      ...d,
      label: d.fandom ? `${d.name} (${d.fandom})` : d.name,
    }))
    const labelWidth = Math.min(
      Math.max(...barData.map((d) => d.label.length)) * 6.5,
      200
    )
    return (
      <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
        <div className="flex justify-between items-baseline mb-3">
          <h3 className="font-bold text-gray-700">{title}</h3>
          <div className="flex items-center gap-3">
            {sorted.length > BAR_LIMIT && (
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-xs text-teal-400 hover:text-teal-600 transition"
              >
                {showAll ? `Show top ${BAR_LIMIT}` : `Show all ${sorted.length}`}
              </button>
            )}
            {!showAll && othersCount > 0 && (
              <span className="text-xs text-gray-400">Top {BAR_LIMIT} of {sorted.length}</span>
            )}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={barHeight}>
          <BarChart layout="vertical" data={barData} margin={{ left: 4, right: 24, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={labelWidth}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip formatter={(v: number) => [`${v} votes`]} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {barData.map((_, i) => (
                <Cell key={i} fill={i < COLORS.length ? COLORS[i] : '#d1d5db'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
      <div className="flex justify-between items-baseline mb-1">
        <h3 className="font-bold text-gray-700">{title}</h3>
        {othersCount > 0 && (
          <span className="text-xs text-gray-400">Top {PIE_LIMIT} of {sorted.length}</span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
            label={({ percent }) => percent > 0.03 ? `${Math.round(percent * 100)}%` : ''}
            labelLine={false}
          >
            {displayData.map((_, i) => (
              <Cell key={i} fill={i < COLORS.length ? COLORS[i] : '#d1d5db'} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, _n, props) => {
              const entry = props.payload as OverallEntry
              return [`${v} votes`, entry.fandom ? `${entry.name} (${entry.fandom})` : entry.name]
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom legend outside the chart — always bounded */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {displayData.map((d, i) => {
          const label = d.fandom ? `${d.name} (${d.fandom})` : d.name
          return (
            <span key={i} className="flex items-center gap-1 text-xs text-gray-600">
              <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: i < COLORS.length ? COLORS[i] : '#d1d5db' }} />
              {label} <span className="text-gray-400">{d.value}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

function StatsTab({ stats, onStatsChange }: { stats: StatsData; onStatsChange: () => void }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<RawBreakdown[]>([])
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)
  const [unresolving, setUnresolving] = useState<string | null>(null)
  const [chartType, setChartType] = useState<ChartType>('bar')

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

  const unresolveGroup = async (b: RawBreakdown) => {
    if (!confirm(`Move ${b.count} vote${b.count > 1 ? 's' : ''} for "${b.input}" back to Unresolved?`)) return
    setUnresolving(b.input)
    await fetch('/api/admin/entries/unresolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryIds: b.entryIds }),
    })
    setUnresolving(null)
    if (expanded !== null) {
      const res = await fetch(`/api/admin/stats/${expanded}`)
      setBreakdown(await res.json())
    }
    onStatsChange()
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

      {/* Chart type toggle */}
      <div className="flex gap-1 bg-teal-100 rounded-xl p-1 w-fit">
        {(['bar', 'pie'] as ChartType[]).map((t) => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              chartType === t ? 'bg-white text-teal-500 shadow-sm' : 'text-teal-300 hover:text-teal-400'
            }`}
          >
            {t === 'bar' ? 'Bar' : 'Pie'}
          </button>
        ))}
      </div>

      <OverallChart title="Overall Characters" data={stats.topCharacters} chartType={chartType} />
      <OverallChart title="Overall Fandoms" data={stats.topFandoms} chartType={chartType} />

      {stats.fandoms.map((fandom) => {
        const sorted = [...fandom.characters].sort((a, b) => b.votes - a.votes)
        const total = sorted.reduce((s, c) => s + c.votes, 0)
        if (sorted.length === 0) return null

        const chartData = sorted.map((c) => ({ name: c.name, value: c.votes }))

        return (
          <div key={fandom.id} className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
            <div className="flex justify-between items-baseline mb-4">
              <h3 className="font-bold text-gray-700">{fandom.name}</h3>
              <span className="text-xs text-gray-400">{total} votes</span>
            </div>

            <FandomChart data={chartData} chartType={chartType} />

            {/* Character list with raw breakdown drill-down — only shown in pie mode */}
            {chartType === 'pie' && (
              <div className="mt-4 space-y-1">
                {sorted.map((c) => (
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
                              <div key={b.input} className="flex justify-between items-center text-xs text-gray-600 gap-2">
                                <span className="font-mono truncate">{b.input}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-teal-400">{b.count}</span>
                                  <button
                                    onClick={() => unresolveGroup(b)}
                                    disabled={unresolving === b.input}
                                    className="px-1.5 py-0.5 text-red-300 hover:text-red-500 border border-red-200 rounded text-xs transition disabled:opacity-40"
                                    title="Move back to Unresolved"
                                  >
                                    {unresolving === b.input ? '...' : '↩'}
                                  </button>
                                </div>
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

  const [renamingCharId, setRenamingCharId] = useState<number | null>(null)
  const [renameCharVal, setRenameCharVal] = useState('')
  const [renamingFandomId, setRenamingFandomId] = useState<number | null>(null)
  const [renameFandomVal, setRenameFandomVal] = useState('')

  const [newFandomAlias, setNewFandomAlias] = useState('')
  const [fandomAliasMsg, setFandomAliasMsg] = useState('')

  const [showMerge, setShowMerge] = useState(false)
  const [mergeTargetId, setMergeTargetId] = useState<number | null>(null)
  const [mergeSourceIds, setMergeSourceIds] = useState<number[]>([])
  const [merging, setMerging] = useState(false)
  const [mergeMsg, setMergeMsg] = useState('')

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

  const addFandomAlias = async (fandomId: number) => {
    setFandomAliasMsg('')
    if (!newFandomAlias.trim()) return
    const res = await fetch(`/api/admin/fandoms/${fandomId}/aliases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: newFandomAlias.trim() }),
    })
    const d = await res.json()
    if (res.ok) {
      setNewFandomAlias('')
      setFandomAliasMsg(
        d.resolved > 0
          ? `Alias added! Also resolved ${d.resolved} existing entry/entries.`
          : 'Alias added. Future entries with this fandom name will resolve automatically.'
      )
      loadFandoms()
    } else {
      setFandomAliasMsg(d.error)
    }
  }

  const deleteFandomAlias = async (fandomId: number, aliasId: number) => {
    await fetch(`/api/admin/fandoms/${fandomId}/aliases`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aliasId }),
    })
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

  const renameCharacter = async (id: number) => {
    if (!renameCharVal.trim()) return
    await fetch(`/api/admin/characters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canonicalName: renameCharVal.trim() }),
    })
    setRenamingCharId(null)
    setRenameCharVal('')
    if (selectedFandomId) loadCharacters(selectedFandomId)
  }

  const renameFandom = async (id: number) => {
    if (!renameFandomVal.trim()) return
    await fetch(`/api/admin/fandoms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameFandomVal.trim() }),
    })
    setRenamingFandomId(null)
    setRenameFandomVal('')
    loadFandoms()
  }

  const toggleMergeSource = (id: number) => {
    setMergeSourceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const mergeFandoms = async () => {
    if (!mergeTargetId || mergeSourceIds.length === 0) return
    const targetName = fandoms.find((f) => f.id === mergeTargetId)?.name ?? ''
    const sourceNames = mergeSourceIds.map((id) => fandoms.find((f) => f.id === id)?.name ?? id).join(', ')
    if (
      !confirm(
        `Merge "${sourceNames}" INTO "${targetName}"?\n\n` +
        `• Characters with matching names/aliases will be combined and their votes added together\n` +
        `• Unique characters will be moved to "${targetName}"\n` +
        `• All aliases from both fandoms are kept\n` +
        `• Source fandoms will be deleted and their names added as aliases on "${targetName}"\n\n` +
        `This cannot be undone.`
      )
    ) return
    setMerging(true)
    setMergeMsg('')
    const res = await fetch('/api/admin/fandoms/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetFandomId: mergeTargetId, sourceFandomIds: mergeSourceIds }),
    })
    const d = await res.json()
    if (res.ok) {
      setMergeMsg(
        `Merge complete! Combined ${d.charactersMerged} duplicate character(s), moved ${d.charactersMoved} unique character(s), added ${d.aliasesMerged} new alias(es).`
      )
      setMergeSourceIds([])
      setMergeTargetId(null)
      setShowMerge(false)
      loadFandoms()
      if (selectedFandomId) loadCharacters(selectedFandomId)
    } else {
      setMergeMsg(d.error ?? 'Merge failed.')
    }
    setMerging(false)
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

  const selectedFandom = fandoms.find((f) => f.id === selectedFandomId)

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

      {/* Merge fandoms */}
      <div className="bg-white rounded-2xl border border-teal-100 p-5 shadow-sm">
        <button
          onClick={() => { setShowMerge((v) => !v); setMergeMsg('') }}
          className="flex items-center gap-2 w-full text-left"
        >
          <span className={`text-xs transition-transform duration-150 ${showMerge ? 'rotate-90' : ''} text-teal-300`}>›</span>
          <h3 className="font-semibold text-gray-700">Merge Fandoms</h3>
          <span className="text-xs text-gray-400">combine two fandoms, votes added for shared characters</span>
        </button>

        {showMerge && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Merge INTO (target — kept after merge):</p>
              <select
                value={mergeTargetId ?? ''}
                onChange={(e) => {
                  setMergeTargetId(Number(e.target.value) || null)
                  setMergeSourceIds([])
                }}
                className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              >
                <option value="">Select target fandom…</option>
                {fandoms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {mergeTargetId && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Merge FROM (sources — will be deleted):</p>
                <div className="space-y-1 max-h-48 overflow-y-auto border border-teal-100 rounded-lg p-2">
                  {fandoms.filter((f) => f.id !== mergeTargetId).map((f) => (
                    <label key={f.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-teal-50 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={mergeSourceIds.includes(f.id)}
                        onChange={() => toggleMergeSource(f.id)}
                        className="accent-teal-400"
                      />
                      <span className="text-gray-700">{f.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {mergeSourceIds.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 space-y-0.5">
                <p className="font-semibold">Preview:</p>
                <p>Merge <span className="font-medium">{mergeSourceIds.map((id) => fandoms.find((f) => f.id === id)?.name).join(', ')}</span> into <span className="font-medium">{fandoms.find((f) => f.id === mergeTargetId)?.name}</span></p>
                <p>Characters with matching names/aliases will have their votes combined. Unique characters will be moved. Source fandoms will be deleted.</p>
              </div>
            )}

            <button
              onClick={mergeFandoms}
              disabled={!mergeTargetId || mergeSourceIds.length === 0 || merging}
              className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold transition disabled:opacity-40"
            >
              {merging ? 'Merging…' : `Merge ${mergeSourceIds.length > 0 ? mergeSourceIds.length : ''} fandom${mergeSourceIds.length !== 1 ? 's' : ''} into target`}
            </button>

            {mergeMsg && (
              <p className={`text-xs px-3 py-2 rounded-lg ${mergeMsg.startsWith('Merge complete') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {mergeMsg}
              </p>
            )}
          </div>
        )}
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
                    {f.aliases.length > 0 && (
                      <span className="text-xs text-teal-300 shrink-0">({f.aliases.length} alt name{f.aliases.length > 1 ? 's' : ''})</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFandom(f.id) }}
                    className="text-gray-300 hover:text-red-400 transition text-lg leading-none shrink-0"
                  >
                    ×
                  </button>
                </div>

                {/* Inline fandom+character panel */}
                {selectedFandomId === f.id && (
                  <div className="border-t border-teal-100 bg-teal-50 px-4 py-4 space-y-4">
                    {/* Fandom aliases (alternate names like MLQC / Love and Producer) */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Alternate Fandom Names</p>
                      <p className="text-xs text-gray-400">
                        Add alternate names for this fandom (e.g. &ldquo;Love and Producer&rdquo; for MLQC). Entries typed with these names will resolve to this fandom&apos;s characters.
                      </p>
                      {f.aliases.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {f.aliases.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-teal-200 rounded-full text-xs text-gray-600"
                            >
                              {a.alias}
                              <button
                                onClick={() => deleteFandomAlias(f.id, a.id)}
                                className="text-gray-300 hover:text-red-400 leading-none"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          value={newFandomAlias}
                          onChange={(e) => setNewFandomAlias(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addFandomAlias(f.id)}
                          placeholder={`Alternate name for "${f.name}"`}
                          className="flex-1 px-2 py-1.5 border border-teal-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                        />
                        <button
                          onClick={() => addFandomAlias(f.id)}
                          className="px-3 py-1.5 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Add
                        </button>
                      </div>
                      {fandomAliasMsg && selectedFandom?.id === f.id && (
                        <p className="text-xs text-green-600">{fandomAliasMsg}</p>
                      )}
                      <div className="flex gap-2 pt-1 border-t border-teal-100">
                        <input
                          value={renamingFandomId === f.id ? renameFandomVal : ''}
                          onFocus={() => { setRenamingFandomId(f.id); setRenameFandomVal(f.name) }}
                          onChange={(e) => setRenameFandomVal(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && renameFandom(f.id)}
                          placeholder="Rename fandom"
                          className="flex-1 px-2 py-1.5 border border-teal-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                        />
                        <button
                          onClick={() => renameFandom(f.id)}
                          className="px-3 py-1.5 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Rename
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-teal-200" />

                    {/* Add character */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Characters</p>
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
                                <div className="flex gap-2 pt-1 border-t border-teal-100">
                                  <input
                                    value={renamingCharId === c.id ? renameCharVal : ''}
                                    onFocus={() => { setRenamingCharId(c.id); setRenameCharVal(c.canonicalName) }}
                                    onChange={(e) => setRenameCharVal(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && renameCharacter(c.id)}
                                    placeholder="Rename character"
                                    className="flex-1 px-2 py-1.5 border border-teal-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                                  />
                                  <button
                                    onClick={() => renameCharacter(c.id)}
                                    className="px-3 py-1.5 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition"
                                  >
                                    Rename
                                  </button>
                                </div>
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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')
  const [addFandom, setAddFandom] = useState('')
  const [addChar, setAddChar] = useState('')
  const [adding, setAdding] = useState(false)

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

  const addManualEntry = async () => {
    if (!addFandom.trim() || !addChar.trim()) return
    setAdding(true)
    setMsg('')
    await fetch('/api/admin/unresolved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawFandomInput: addFandom.trim(), rawCharacterInput: addChar.trim() }),
    })
    setAddFandom('')
    setAddChar('')
    setAdding(false)
    load()
  }

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

  const assignToExisting = async (u: Unresolved) => {
    if (!assignCharId) return
    setResolving(assignKey)
    setMsg('')
    const res = await fetch('/api/admin/unresolved/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawFandomInput: u.rawFandomInput,
        rawCharacterInput: u.rawCharacterInput,
        characterId: assignCharId,
      }),
    })
    const d = await res.json()
    if (res.ok) {
      const charName = assignChars.find((c) => c.id === assignCharId)?.canonicalName ?? ''
      const fandomName = assignFandoms.find((f) => f.id === assignFandomId)?.name ?? ''
      setMsg(`Assigned ${d.resolved} entry/entries to "${charName}" (${fandomName}).`)
      setAssignKey(null)
      load()
    } else {
      setMsg(d.error ?? 'Error assigning.')
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
      let msg = ''
      if (d.newFandom) {
        msg = `Created new fandom "${d.fandom}" and added "${d.character}" to it.`
      } else if (d.newCharacter) {
        msg = `Added "${d.character}" to existing fandom "${d.fandom}".`
      } else {
        msg = `Assigned to existing character "${d.character}" in "${d.fandom}".`
      }
      setMsg(`${msg} Resolved ${d.resolved} entry/entries.`)
      load()
    }
    setResolving(null)
  }

  const deleteEntry = async (u: Unresolved) => {
    const key = `${u.rawFandomInput}::${u.rawCharacterInput}`
    const warning =
      `Delete ${u.count} vote${u.count > 1 ? 's' : ''} for "${u.rawCharacterInput}" (${u.rawFandomInput})?\n\n` +
      `These entries are NOT in the database as a resolved character — they will be permanently removed and won't count in results.`
    if (!confirm(warning)) return
    setDeleting(key)
    setMsg('')
    const res = await fetch('/api/admin/unresolved', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawFandomInput: u.rawFandomInput, rawCharacterInput: u.rawCharacterInput }),
    })
    const d = await res.json()
    if (res.ok) {
      setMsg(`Deleted ${d.deleted} unresolved entry/entries.`)
      load()
    }
    setDeleting(null)
  }

  if (loading) return <p className="text-gray-400 text-sm text-center py-10">Loading...</p>

  if (unresolved.length === 0) {
    return (
      <p className="text-green-500 text-sm text-center py-10">
        All entries are resolved.
      </p>
    )
  }

  const filteredUnresolved = search.trim()
    ? unresolved.filter((u) =>
        u.rawFandomInput.toLowerCase().includes(search.toLowerCase()) ||
        u.rawCharacterInput.toLowerCase().includes(search.toLowerCase())
      )
    : unresolved

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        These entries could not be matched to a known character. Add as new, assign to an existing character, or delete.
      </p>
      {/* Manual entry form */}
      <div className="bg-white rounded-xl border border-teal-100 p-3 space-y-2">
        <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Add Manual Entry</p>
        <div className="flex gap-2">
          <input
            value={addFandom}
            onChange={(e) => setAddFandom(e.target.value)}
            placeholder="Fandom"
            className="flex-1 px-2 py-1.5 border border-teal-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
          <input
            value={addChar}
            onChange={(e) => setAddChar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addManualEntry()}
            placeholder="Character"
            className="flex-1 px-2 py-1.5 border border-teal-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-300"
          />
          <button
            onClick={addManualEntry}
            disabled={adding || !addFandom.trim() || !addChar.trim()}
            className="px-3 py-1.5 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
      </div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter by fandom or character..."
        className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
      />
      {search && <p className="text-xs text-gray-400">{filteredUnresolved.length} of {unresolved.length} shown</p>}
      {msg && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{msg}</p>}
      {filteredUnresolved.map((u, i) => {
        const key = `${u.rawFandomInput}::${u.rawCharacterInput}`
        const isAssigning = assignKey === key
        const isDeleting = deleting === key
        return (
          <div key={i} className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 flex justify-between items-center gap-3">
              <div className="min-w-0">
                {/* FANDOM first, in caps */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide truncate">{u.rawFandomInput}</p>
                <p className="text-sm font-medium text-gray-700 truncate">{u.rawCharacterInput}</p>
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
                <button
                  onClick={() => deleteEntry(u)}
                  disabled={isDeleting}
                  className="px-3 py-1 bg-white border border-red-200 text-red-400 hover:bg-red-50 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {isDeleting ? '...' : 'Delete'}
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
                  onClick={() => assignToExisting(u)}
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
  const [unresolving, setUnresolving] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const pageSize = 50

  const loadPage = (p: number, q = search) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (q.trim()) params.set('search', q.trim())
    fetch(`/api/admin/submissions?${params}`)
      .then((r) => r.json())
      .then((d) => { setSubmissions(d.submissions); setTotal(d.total); setLoading(false) })
  }

  useEffect(() => { loadPage(page) }, [page])

  const applySearch = () => {
    setSearch(searchInput)
    setPage(1)
    loadPage(1, searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
    loadPage(1, '')
  }

  const unresolveEntry = async (entryId: number, charName: string) => {
    if (!confirm(`Move "${charName}" back to Unresolved? The vote will not be counted until it's reassigned.`)) return
    setUnresolving(entryId)
    await fetch('/api/admin/entries/unresolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryIds: [entryId] }),
    })
    setUnresolving(null)
    loadPage(page)
  }

  if (loading) return <p className="text-gray-400 text-sm text-center py-10">Loading...</p>

  if (submissions.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-10">No submissions yet.</p>
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">{total} {search ? 'matching' : 'total'} responses</p>
      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          placeholder="Search across all responses..."
          className="flex-1 px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
        />
        <button
          onClick={applySearch}
          className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition"
        >
          Filter
        </button>
        {search && (
          <button
            onClick={clearSearch}
            className="px-3 py-2 border border-teal-200 text-gray-400 hover:text-gray-600 rounded-lg text-sm transition"
          >
            Clear
          </button>
        )}
      </div>
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
              <div key={e.id} className="flex gap-2 items-center text-sm">
                <span className="text-teal-300 font-semibold shrink-0">#{e.rank}</span>
                <div className="min-w-0 flex-1">
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
                {e.character && (
                  <button
                    onClick={() => unresolveEntry(e.id, e.character!.canonicalName)}
                    disabled={unresolving === e.id}
                    className="shrink-0 px-1.5 py-0.5 text-red-300 hover:text-red-500 border border-red-200 rounded text-xs transition disabled:opacity-40"
                    title="Move back to Unresolved"
                  >
                    {unresolving === e.id ? '...' : '↩'}
                  </button>
                )}
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
  const [pollClosed, setPollClosed] = useState<boolean | null>(null)

  const fetchStats = useCallback(() => {
    setLoadingStats(true)
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoadingStats(false) })
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    fetch('/api/admin/poll-status')
      .then((r) => r.json())
      .then((d) => setPollClosed(d.closed))
  }, [])

  const handleTogglePoll = async () => {
    const action = pollClosed ? 'open' : 'close'
    if (!confirm(`${action === 'close' ? 'Close' : 'Open'} the poll?`)) return
    const res = await fetch('/api/admin/poll-status', { method: 'POST' })
    const d = await res.json()
    setPollClosed(d.closed)
  }

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
          <Link
            href="/admin/dashboard"
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            ← Hub
          </Link>
          <a
            href="/api/admin/export"
            download
            className="text-xs text-teal-400 hover:text-teal-600 transition"
          >
            Export backup
          </a>
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
            onClick={handleTogglePoll}
            className={`text-xs transition ${pollClosed ? 'text-green-400 hover:text-green-600' : 'text-orange-400 hover:text-orange-600'}`}
          >
            {pollClosed === null ? '...' : pollClosed ? 'Open poll' : 'Close poll'}
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
          <StatsTab stats={stats} onStatsChange={fetchStats} />
        ) : null
      )}
      {tab === 'manage' && <ManageTab />}
      {tab === 'unresolved' && <UnresolvedTab />}
      {tab === 'responses' && <ResponsesTab />}
    </main>
  )
}
