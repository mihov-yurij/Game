import React from 'react';
import { lotBasisLine } from '../../curriculum/incoterms';
import { MasteryPanel } from './MasteryPanel';

export function ExpeditorView({
  warehouseCargo,
  warehouseMax,
  activeContract,
  handleDispatchTransport,
  kpiExp,
  transportCosts,
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
  const fillPercentage = Math.min(100, Math.round((warehouseCargo / warehouseMax) * 100));

  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, height: '100%' }}>
      <h2 style={{ color: '#b45309', marginBottom: 10 }}>Монитор экспедитора</h2>
      <MasteryPanel
        accent="#d97706"
        name={person.name}
        onRename={onRename}
        kpi={kpiExp}
        status={status}
        onStudy={onStudy}
        onApply={onApply}
        onCase={onCase}
        studyLeft={studyLeft}
        applyLeft={applyLeft}
        caseLeft={caseLeft}
        liveNote={liveNote}
      />

      <div style={{ padding: 15, background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Контейнерный терминал</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '5px 0', color: fillPercentage >= 80 ? '#ef4444' : '#1e293b' }}>
          {warehouseCargo.toLocaleString()} / {warehouseMax.toLocaleString()} ед. ({fillPercentage}%)
        </p>
        <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${fillPercentage}%`, height: '100%', background: fillPercentage >= 80 ? '#ef4444' : '#f59e0b' }} />
        </div>
        {activeContract ? (
          <p style={{ fontSize: '0.85rem', marginTop: 8, marginBottom: 0 }}>{lotBasisLine(activeContract)}</p>
        ) : (
          <p style={{ fontSize: '0.85rem', marginTop: 8, marginBottom: 0, color: '#64748b' }}>
            Нет контракта на причале. Вывоз со склада идёт без вопроса по базису.
          </p>
        )}
      </div>

      <h3 style={{ marginBottom: 10 }}>Вывоз со склада</h3>
      <DispatchRow
        title="Блок-поезд"
        detail={`2 000 ед. · −$${transportCosts.train.toLocaleString()}`}
        disabled={warehouseCargo < 2000}
        onClick={() => handleDispatchTransport('train')}
        color="#d97706"
      />
      <DispatchRow
        title="Автоколонна"
        detail={`500 ед. · −$${transportCosts.truck.toLocaleString()}`}
        disabled={warehouseCargo < 500}
        onClick={() => handleDispatchTransport('truck')}
        color="#f59e0b"
      />
    </div>
  );
}

function DispatchRow({ title, detail, disabled, onClick, color }) {
  return (
    <div style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 6, background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{detail}</span>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        style={{ padding: '6px 12px', background: color, color: '#fff', border: 'none', borderRadius: 4, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1 }}
      >
        Отправить
      </button>
    </div>
  );
}
