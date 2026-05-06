import { useState } from 'react'

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function VaultEntry({ entry, onDelete }) {
  const [copied, setCopied] = useState(false)

  const date = entry.created_at ? new Date(entry.created_at) : new Date()


  async function copy() {
    await navigator.clipboard.writeText(entry.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="history-item">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        //Label
        <span className="vault-label">
          {entry.label || <em style={{ color: 'var(--muted)', fontStyle: 'italic' }}>unlabeled</em>}
        </span>

        //Password (truncated)
        <span className="history-password" style={{ flex: 1 }}>
          {entry.password}
        </span>

        // Actions
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button
            className="history-clear"
            onClick={copy}
            title={copied ? 'Copied!' : 'Copy password'}
            style={{ color: copied ? 'var(--accent)' : undefined }}
          >
            <CopyIcon />
          </button>
          <button
            className="history-clear"
            onClick={() => onDelete(entry.id)}
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      //Date
      <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
        {date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
      </span>
    </div>
  )
}

export default function Vault({ entries, deleteEntry, clearAll }) {
  if (!entries.length) return null

  return (
    <div className="history-card">
      <div className="history-header">
        <span className="history-title">Vault</span>
        <button className="history-clear" onClick={clearAll}>Clear all</button>
      </div>
      <div className="history-list">
        {entries.map((entry) => (
          <VaultEntry key={entry.id} entry={entry} onDelete={deleteEntry} />
        ))}
      </div>
    </div>
  )
}
