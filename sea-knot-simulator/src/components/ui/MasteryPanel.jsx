import React from 'react';

const buttonStyle = (enabled, color) => ({
  padding: '8px 10px',
  background: enabled ? color : '#cbd5e1',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: enabled ? 'pointer' : 'default',
  fontWeight: 'bold',
  fontSize: '0.8rem',
});

export function MasteryPanel({
  accent,
  name,
  onRename,
  kpi,
  status,
  onStudy,
  onApply,
  onCase,
  studyLeft,
  applyLeft,
  caseLeft,
  liveNote,
}) {
  return (
    <div style={{ marginBottom: 16, padding: 12, background: '#fff', borderRadius: 8, border: `1px solid ${accent}` }}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>
        Участник
        <input
          value={name}
          onChange={(event) => onRename(event.target.value)}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
        />
      </label>
      <p style={{ margin: '8px 0 2px' }}>
        Incoterms 2020: <b style={{ color: accent }}>{status.levelLabel}</b>
      </p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569' }}>
        Вклад в порт: <b>{kpi}</b>
        {' · '}
        в зачёт {status.correct}/{status.graded}
      </p>
      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#334155' }}>{status.hint}</p>
      {status.lastMistake && (
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#9f1239' }}>
          Последняя ошибка: {status.lastMistake}
        </p>
      )}
      {liveNote && (
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', background: '#fff7ed', padding: 8, borderRadius: 4 }}>
          {liveNote}
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        <button type="button" disabled={!studyLeft} onClick={onStudy} style={buttonStyle(studyLeft > 0, '#334155')}>
          Правило ({studyLeft})
        </button>
        <button type="button" disabled={!applyLeft} onClick={onApply} style={buttonStyle(applyLeft > 0, accent)}>
          Решение ({applyLeft})
        </button>
        <button type="button" disabled={!caseLeft} onClick={onCase} style={buttonStyle(caseLeft > 0, '#7c3aed')}>
          Кейс ({caseLeft})
        </button>
      </div>
    </div>
  );
}
