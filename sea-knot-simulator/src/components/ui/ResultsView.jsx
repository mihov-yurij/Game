import React from 'react';
import { MODULE_TITLE } from '../../curriculum/incoterms';

const ROLE_LABEL = {
  marketer: 'Маркетолог',
  mechanic: 'Механик',
  expeditor: 'Экспедитор',
};

export function ResultsView({ people, statuses, onRename, onReset }) {
  const roles = ['marketer', 'mechanic', 'expeditor'];

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 6 }}>Досье смены</h2>
      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: 14 }}>
        {MODULE_TITLE}. Ступень у каждого своя. Вклад в порт на этом экране не смешивается со знаниями.
      </p>
      {roles.map((role) => {
        const person = people[role];
        const status = statuses[role];
        return (
          <div key={role} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ROLE_LABEL[role]}</div>
            <input
              value={person.name}
              onChange={(event) => onRename(role, event.target.value)}
              style={{ width: '100%', margin: '4px 0 8px', padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }}
            />
            <p style={{ margin: 0 }}>
              Ступень: <b>{status.levelLabel}</b>
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#334155' }}>
              В зачёт {status.correct} из {status.graded}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#475569' }}>{status.hint}</p>
            {status.lastMistake && (
              <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#9f1239' }}>{status.lastMistake}</p>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={onReset}
        style={{ marginTop: 8, width: '100%', padding: '10px', background: '#fff', color: '#9f1239', border: '1px solid #fecdd3', borderRadius: 6, cursor: 'pointer' }}
      >
        Сбросить только досье
      </button>
    </div>
  );
}
