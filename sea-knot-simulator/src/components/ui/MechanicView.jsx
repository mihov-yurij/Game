import React from 'react';

export function MechanicView({ craneWear, isCraneBroken, handleRepairCrane, kpiMech }) {
  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, height: '100%' }}>
      <h2 style={{ color: '#0f766e', marginBottom: 5 }}>🛠️ Монитор Инженера-Механика</h2>
      <p style={{ marginBottom: 15 }}>Ваш текущий KPI: <b style={{ color: '#38bdf8' }}>{kpiMech} pts</b></p>

      <div style={{ padding: 20, background: isCraneBroken ? '#fee2e2' : '#f0fdf4', borderRadius: 6, border: '1px solid #cbd5e1' }}>
        <h3>Статус оборудования (Кран STS)</h3>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0', color: isCraneBroken ? '#ef4444' : '#16a34a' }}>
          {craneWear}% {isCraneBroken && '[АВАРИЯ]'}
        </p>
        <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${craneWear}%`, height: '100%', background: craneWear <= 30 ? '#ef4444' : '#16a34a' }} />
        </div>
        <button onClick={handleRepairCrane} style={{ marginTop: 15, width: '100%', padding: '10px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
          Заказать запчасти и провести ТО (-$150,000)
        </button>
      </div>
    </div>
  );
}

