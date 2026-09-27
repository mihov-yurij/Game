import React from 'react';

export function MarketingView({ marketLots, activeContract, handleTakeContract, kpiMark }) {
  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, height: '100%' }}>
      <h2 style={{ color: '#1e3a8a', marginBottom: 5 }}>📊 Монитор Маркетолога</h2>
      <p style={{ marginBottom: 15 }}>Ваш текущий KPI: <b style={{ color: '#eab308' }}>{kpiMark} pts</b></p>
      
      <h3 style={{ marginBottom: 10 }}>Доступные тендеры:</h3>
      {marketLots.map(lot => (
        <div key={lot.id} style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 6, marginBottom: 10, background: '#fff' }}>
          <h4>{lot.type} ({lot.volume.toLocaleString()} ед.)</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ color: '#059669', fontWeight: 'bold' }}>+${lot.reward.toLocaleString()}</span>
            <button onClick={() => handleTakeContract(lot)} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Подать заявку</button>
          </div>
        </div>
      ))}
      {activeContract && (
        <div style={{ marginTop: 20, padding: 15, background: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
          <h4 style={{ color: '#1e40af' }}>⚡ Активный контракт в обработке</h4>
          <p>{activeContract.type} — Ожидайте разгрузки Экспедитором</p>
        </div>
      )}
    </div>
  );
}
