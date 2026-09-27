import React from 'react';

export function ExpeditorView({
  warehouseCargo,
  warehouseMax,
  activeContract,
  handleDispatchTransport,
  kpiExp,
  transportCosts,
}) {
  const fillPercentage = Math.min(100, Math.round((warehouseCargo / warehouseMax) * 100));

  return (
    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 8, height: '100%' }}>
      <h2 style={{ color: '#b45309', marginBottom: 5 }}>📦 Монитор Экспедитора</h2>
      <p style={{ marginBottom: 15 }}>
        Ваш текущий KPI (Логистика): <b style={{ color: '#d97706' }}>{kpiExp} pts</b>
      </p>

      {/* Состояние Склада */}
      <div style={{ padding: 15, background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1', marginBottom: 20 }}>
        <h3>Заполненность Контейнерного Терминала (CY)</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '5px 0', color: fillPercentage >= 80 ? '#ef4444' : '#1e293b' }}>
          {warehouseCargo.toLocaleString()} / {warehouseMax.toLocaleString()} ед. ({fillPercentage}%)
        </p>
        <div style={{ width: '100%', height: 12, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
          <div
            style={{
              width: `${fillPercentage}%`,
              height: '100%',
              background: fillPercentage >= 80 ? '#ef4444' : '#f59e0b',
            }}
          />
        </div>
        {fillPercentage >= 90 && (
          <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 5, fontWeight: 'bold' }}>
            ⚠️ КРИТИЧЕСКИЙ УРОВЕНЬ! Разгрузка судов под угрозой блокировки!
          </p>
        )}
      </div>

      {/* Управление вывозом */}
      <h3 style={{ marginBottom: 10 }}>⚡ Диспетчеризация сухопутного транспорта:</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 10 }}>
        Отправляйте транспорт, чтобы разгрузить терминал. Каждая отправка стоит денег холдинга.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Железная дорога */}
        <div
          style={{
            border: '1px solid #cbd5e1',
            padding: 12,
            borderRadius: 6,
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h4 style={{ margin: 0 }}>🚄 Блок-поезд (РЖД)</h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Вывозит: <b>2 000 ед.</b> | Стоимость: <b style={{ color: '#ef4444' }}>-\${transportCosts.train.toLocaleString()}</b>
            </span>
          </div>
          <button
            disabled={warehouseCargo < 2000}
            onClick={() => handleDispatchTransport('train')}
            style={{
              padding: '6px 12px',
              background: '#d97706',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: warehouseCargo < 2000 ? 'not-allowed' : 'pointer',
              opacity: warehouseCargo < 2000 ? 0.5 : 1,
            }}
          >
            Отправить поезд
          </button>
        </div>

        {/* Автоколонна */}
        <div
          style={{
            border: '1px solid #cbd5e1',
            padding: 12,
            borderRadius: 6,
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h4 style={{ margin: 0 }}>🚛 Автоколонна (Фуры)</h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Вывозит: <b>500 ед.</b> | Стоимость: <b style={{ color: '#ef4444' }}>-\${transportCosts.truck.toLocaleString()}</b>
            </span>
          </div>
          <button
            disabled={warehouseCargo < 500}
            onClick={() => handleDispatchTransport('truck')}
            style={{
              padding: '6px 12px',
              background: '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: warehouseCargo < 500 ? 'not-allowed' : 'pointer',
              opacity: warehouseCargo < 500 ? 0.5 : 1,
            }}
          >
            Вызвать фуры
          </button>
        </div>
      </div>
    </div>
  );
}

