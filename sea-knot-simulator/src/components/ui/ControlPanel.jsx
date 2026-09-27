import React from 'react';

export function ControlPanel({ 
  marketLots, activeContract, shipData, craneWear, isCraneBroken, 
  handleTakeContract, handleArriveToBerth, handleRepairCrane 
}) {
  return (
    <div style={{ position: "absolute", top: 20, left: 20, zIndex: 10, width: "350px", background: "rgba(255,255,255,0.95)", padding: 20, borderRadius: 8, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }}>
      
      {/* Сектор Маркетолога */}
      <h3 style={{ marginBottom: 10, borderBottom: "2px solid #2563eb", paddingBottom: 5 }}>📊 Биржа контрактов</h3>
      {marketLots.map(lot => (
        <div key={lot.id} style={{ border: "1px solid #cbd5e1", padding: 8, borderRadius: 6, marginBottom: 8, background: "#fff", fontSize: "0.9rem" }}>
          <h4>{lot.type} ({lot.volume.toLocaleString()} ед.)</h4>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
            <span style={{ color: "#059669", fontWeight: "bold" }}>+\${lot.reward.toLocaleString()}</span>
            <button onClick={() => handleTakeContract(lot)} style={{ padding: "3px 6px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>Взять тендер</button>
          </div>
        </div>
      ))}

      {/* Сектор Механика */}
      <h3 style={{ marginTop: 20, marginBottom: 10, borderBottom: "2px solid #0ea5e9", paddingBottom: 5 }}>🛠️ Технический сектор</h3>
      <div style={{ padding: 10, background: isCraneBroken ? "#fee2e2" : "#f0fdf4", borderRadius: 6, border: "1px solid #cbd5e1" }}>
        <p>Состояние крана: <b style={{ color: isCraneBroken ? "#ef4444" : "#16a34a" }}>{craneWear}%</b></p>
        <div style={{ width: "100%", height: 8, background: "#e2e8f0", borderRadius: 4, marginTop: 5, overflow: "hidden" }}>
          <div style={{ width: `${craneWear}%`, height: "100%", background: craneWear <= 30 ? "#ef4444" : "#16a34a" }} />
        </div>
        <button onClick={handleRepairCrane} style={{ marginTop: 10, width: "100%", padding: "6px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
          Провести ТО (-\$150,000)
        </button>
      </div>

      {/* Операционный сектор */}
      {activeContract && (
        <div style={{ marginTop: 20, padding: 12, background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe" }}>
          <h4 style={{ color: "#1e40af" }}>⚡ Текущая операция</h4>
          <p style={{ fontSize: "0.9rem" }}>Статус: <b>{shipData.status.toUpperCase()}</b></p>
          {shipData.status === "Waiting" && (
            <button onClick={handleArriveToBerth} style={{ marginTop: 8, width: "100%", padding: "8px", background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
              Начать разгрузку
            </button>
          )}
        </div>
      )}
    </div>
  );
}
