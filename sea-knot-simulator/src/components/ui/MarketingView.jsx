import React from 'react';
import { lotBasisLine } from '../../curriculum/incoterms';
import { MasteryPanel } from './MasteryPanel';

export function MarketingView({
  marketLots,
  activeContract,
  handleTakeContract,
  kpiMark,
  person,
  status,
  onRename,
  onStudy,
  onApply,
  onCase,
  studyLeft,
  applyLeft,
  caseLeft,
  liveNote,
  basisCleared,
}) {
  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, height: '100%' }}>
      <h2 style={{ color: '#1e3a8a', marginBottom: 10 }}>Монитор маркетолога</h2>
      <MasteryPanel
        accent="#2563eb"
        name={person.name}
        onRename={onRename}
        kpi={kpiMark}
        status={status}
        onStudy={onStudy}
        onApply={onApply}
        onCase={onCase}
        studyLeft={studyLeft}
        applyLeft={applyLeft}
        caseLeft={caseLeft}
        liveNote={liveNote}
      />

      <h3 style={{ marginBottom: 10 }}>Доступные тендеры</h3>
      {marketLots.map((lot) => (
        <div key={lot.id} style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 6, marginBottom: 10, background: '#fff' }}>
          <h4 style={{ margin: 0 }}>{lot.type}</h4>
          <p style={{ margin: '6px 0', fontSize: '0.85rem', color: '#334155' }}>{lotBasisLine(lot)}</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{lot.volume.toLocaleString()} ед.</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 8 }}>
            <span style={{ color: '#059669', fontWeight: 'bold' }}>+${lot.reward.toLocaleString()}</span>
            <button
              type="button"
              onClick={() => handleTakeContract(lot)}
              style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {basisCleared(lot) ? 'Подать заявку' : 'Заявка и вопрос'}
            </button>
          </div>
        </div>
      ))}
      {marketLots.length === 0 && (
        <p style={{ color: '#94a3b8' }}>Свободных тендеров нет.</p>
      )}
      {activeContract && (
        <div style={{ marginTop: 16, padding: 15, background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
          <h4 style={{ color: '#1e40af', marginTop: 0 }}>Контракт на причале</h4>
          <p style={{ marginBottom: 0 }}>{activeContract.type}. {lotBasisLine(activeContract)}</p>
        </div>
      )}
    </div>
  );
}
