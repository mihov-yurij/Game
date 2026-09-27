import React from 'react';
import { MasteryPanel } from './MasteryPanel';

export function MechanicView({
  craneWear,
  isCraneBroken,
  handleRepairCrane,
  kpiMech,
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
}) {
  const repairLocked = craneWear === 100;

  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, height: '100%' }}>
      <h2 style={{ color: '#0f766e', marginBottom: 10 }}>Монитор механика</h2>
      <MasteryPanel
        accent="#0ea5e9"
        name={person.name}
        onRename={onRename}
        kpi={kpiMech}
        status={status}
        onStudy={onStudy}
        onApply={onApply}
        onCase={onCase}
        studyLeft={studyLeft}
        applyLeft={applyLeft}
        caseLeft={caseLeft}
        liveNote={liveNote}
      />

      <div style={{ padding: 20, background: isCraneBroken ? '#fee2e2' : '#f0fdf4', borderRadius: 6, border: '1px solid #cbd5e1' }}>
        <h3 style={{ marginTop: 0 }}>Кран STS</h3>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0', color: isCraneBroken ? '#ef4444' : '#16a34a' }}>
          {craneWear}% {isCraneBroken ? 'авария' : ''}
        </p>
        <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${craneWear}%`, height: '100%', background: craneWear <= 30 ? '#ef4444' : '#16a34a' }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: 8 }}>
          Порог аварии — 30%. ТО стоит $150 000 и возвращает износ к 100%. Вопрос по базису открывается до списания денег.
        </p>
        <button
          type="button"
          onClick={handleRepairCrane}
          disabled={repairLocked}
          style={{ marginTop: 15, width: '100%', padding: '10px', background: repairLocked ? '#94a3b8' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, cursor: repairLocked ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
        >
          {repairLocked ? 'Кран в норме' : 'ТО — вопрос и ремонт'}
        </button>
      </div>
    </div>
  );
}
