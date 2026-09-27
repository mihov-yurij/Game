import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import { PortScene } from './components/3d/PortScene';
import { MarketingView } from './components/ui/MarketingView';
import { MechanicView } from './components/ui/MechanicView';
import { ExpeditorView } from './components/ui/ExpeditorView';

const INITIAL_MARKET_LOATS = [
  { id: 1, type: "Контейнеры (TEU)", volume: 6000, tariff: 150, draft: 14, reward: 1800000 },
  { id: 2, type: "Нефть (Танкер)", volume: 10000, tariff: 45, draft: 16, reward: 2250000 },
  { id: 3, type: "Зерно (Балкер)", volume: 4000, tariff: 80, draft: 12, reward: 640000 }
];

export default function PortSimulator() {
  // Базовая экономика
  const [balance, setBalance] = useState(5000000);
  const [marketLots, setMarketLots] = useState(INITIAL_MARKET_LOATS);
  const [activeContract, setActiveContract] = useState(null);
  const [shipData, setShipData] = useState({ status: "No Cargo", targetX: -15 });
  
  // Механика
  const [craneWear, setCraneWear] = useState(100);
  const [isCraneBroken, setIsCraneBroken] = useState(false);

  // СКЛАДЫ И ТРАНСПОРТ (Новый блок Экспедитора)
  const [warehouseCargo, setWarehouseCargo] = useState(2000); // Стартовый остаток на складе
  const warehouseMax = 15000; // Лимит емкости склада порта
  const transportCosts = { train: 150000, truck: 50000 };

  // Личные KPI студентов
  const [kpiMark, setKpiMark] = useState(100);
  const [kpiMech, setKpiMech] = useState(100);
  const [kpiExp, setKpiExp] = useState(100); // Рейтинг Экспедитора
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleTakeContract = (lot) => {
    if (activeContract) return;
    setMarketLots(prev => prev.filter(l => l.id !== lot.id));
    setActiveContract(lot);
    setShipData({ status: "Waiting", targetX: -8 });
  };

  const handleArriveToBerth = () => {
    if (!activeContract || isCraneBroken) return;

    // ПРОВЕРКА ЛОГИСТА: Есть ли место на складе под этот объем корабля?
    if (warehouseCargo + activeContract.volume > warehouseMax) {
      alert("⚠️ АВАРИЙНЫЙ ПРОСТОЙ! На складе порта нет места для разгрузки этого судна! Экспедитор должен срочно очистить терминал!");
      setShipData({ status: "Demurrage", targetX: 0 });
      setBalance(prev => prev - 250000); // Штраф холдинга за затор
      setKpiExp(prev => Math.max(0, prev - 30));
      return;
    }

    setShipData({ status: "Unloading", targetX: 0 });
    const currentWear = Math.max(0, craneWear - (Math.floor(Math.random() * 25) + 15));
    
    setTimeout(() => {
      setCraneWear(currentWear);
      
      if (currentWear <= 30) {
        setIsCraneBroken(true);
        setShipData({ status: "Demurrage", targetX: 0 });
        setBalance(prev => prev - 300000);
        setKpiMark(prev => Math.max(0, prev - 25));
      } else {
        // Успешная разгрузка: Груз физически переходит с судна НА СКЛАД ПОРТА
        setWarehouseCargo(prev => prev + activeContract.volume);
        setBalance(prev => prev + activeContract.reward);
        setShipData({ status: "Departed", targetX: 15 });
        setActiveContract(null);
        setKpiMark(prev => prev + 20);
      }
    }, 3000);
  };

  const handleRepairCrane = () => {
    if (craneWear === 100) return;
    setBalance(prev => prev - 150000);
    setCraneWear(100);
    setIsCraneBroken(false);
    setKpiMech(prev => prev + 30);

    if (shipData.status === "Demurrage" && activeContract) {
      setShipData({ status: "Unloading", targetX: 0 });
      setTimeout(() => {
        setWarehouseCargo(prev => prev + activeContract.volume);
        setBalance(prev => prev + activeContract.reward);
        setShipData({ status: "Departed", targetX: 15 });
        setActiveContract(null);
      }, 2000);
    }
  };
  const handleNextWeek = async () => {
  setIsAiLoading(true);
  
  // Вызываем наш ИИ-сервис
  const newEvent = await generateWeeklyEvent();
  
  if (newEvent) {
    setCurrentEvent(newEvent);
    
    // Сценарий 1: ИИ подбросил форс-мажор на склады (Затор/Контрабанда)
    if (newEvent.type === 'bad') {
      // ИИ искусственно забивает склад порта на случайный объем
      setWarehouseCargo(prev => Math.min(warehouseMax, prev + (newEvent.damage * 100)));
      // Снимаем баллы у Экспедитора и Маркетолога за аварийную ситуацию
      setKpiExp(prev => Math.max(0, prev - 15));
    } 
    // Сценарий 2: ИИ сгенерировал логистическую удачу (Зеленый коридор на таможне)
    else if (newEvent.type === 'good') {
      // Склад автоматически разгружается (например, фуры поехали быстрее)
      setWarehouseCargo(prev => Math.max(0, prev - 1500));
      setKpiExp(prev => prev + 20);
    }
  }
  
  setIsAiLoading(false);
};


  // ОТПРАВКА НАЗЕМНОГО ТРАНСПОРТА ЭКСПЕДИТОРОМ
  const handleDispatchTransport = (type) => {
    if (type === 'train') {
      setWarehouseCargo(prev => Math.max(0, prev - 2000));
      setBalance(prev => prev - transportCosts.train);
    } else {
      setWarehouseCargo(prev => Math.max(0, prev - 500));
      setBalance(prev => prev - transportCosts.truck);
    }
    setKpiExp(prev => prev + 15); // Экспедитор получает баллы в рейтинг за успешный вывоз
  };

  return (
    <BrowserRouter>
      <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* НАВИГАЦИОННАЯ ПАНЕЛЬ ИГРЫ */}
        <div style={{ background: "#1e293b", color: "#fff", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <h2 style={{ margin: 0 }}>⚓ Sea Knot Simulator</h2>
            <nav style={{ display: 'flex', gap: 10 }}>
              <Link to="/" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', background: '#334155', borderRadius: 4 }}>🖥️ Диспетчер</Link>
              <Link to="/marketing" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', background: '#2563eb', borderRadius: 4 }}>📊 Маркетолог</Link>
              <Link to="/mechanic" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', background: '#0ea5e9', borderRadius: 4 }}>🛠️ Механик</Link>
              <Link to="/expeditor" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', background: '#d97706', borderRadius: 4 }}>📦 Экспедитор</Link>
            </nav>
          </div>
          <div>Бюджет холдинга: <b style={{ color: "#22c55e", fontSize: "1.2rem" }}>${balance.toLocaleString()}</b></div>
        </div>

        {/* ИГРОВОЕ ПРОСТРАНСТВО */}
        <div style={{ flex: 1, display: "flex", position: "relative" }}>
          
          {/* СЛОЙ РОЛЕЙ */}
          <div style={{ width: "400px", height: "100%", background: "#f1f5f9", boxShadow: "2px 0 5px rgba(0,0,0,0.1)", zIndex: 5, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={
                <div style={{ padding: 20 }}>
                  <h3>🚢 Операционный пост порта</h3>
                  {activeContract ? (
                    <div style={{ marginTop: 20, padding: 15, background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                      <h4>Прибыло судно: {activeContract.type}</h4>
                      <p>Объем к разгрузке: <b>{activeContract.volume.toLocaleString()} ед.</b></p>
                      <p>Текущий статус: <b>{shipData.status.toUpperCase()}</b></p>
                      {shipData.status === "Waiting" && (
                        <button onClick={handleArriveToBerth} style={{ marginTop: 15, width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>
                          Разгрузить на терминал
                        </button>
                      )}
                    </div>
                  ) : (
                    <p style={{ marginTop: 20, fontStyle: 'italic', color: '#94a3b8' }}>Свободный причал. Ожидание контрактов от Маркетолога.</p>
                  )}
                </div>
              } />
              <Route path="/" element={
  <div style={{ padding: 20 }}>
    <h3>🚢 Операционный пост порта</h3>
    
    {/* Кнопка активации Grok */}
    <button 
      onClick={handleNextWeek} 
      disabled={isAiLoading}
      style={{ marginTop: 10, width: '100%', padding: '10px', background: '#475569', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
    >
      {isAiLoading ? '⌛ Grok анализирует порты...' : '🎲 Сгенерировать событие недели (Grok ИИ)'}
    </button>

    {/* Рендеринг ИИ карточки */}
    {currentEvent && (
      <div style={{ marginTop: 15, padding: 12, background: currentEvent.type === 'bad' ? '#fee2e2' : '#f0fdf4', border: '1px solid #cbd5e1', borderRadius: 6 }}>
        <h4 style={{ color: currentEvent.type === 'bad' ? '#b91c1c' : '#15803d', margin: 0 }}>
          {currentEvent.type === 'bad' ? '🚨' : '🌟'} {currentEvent.title}
        </h4>
        <p style={{ fontSize: '0.85rem', marginTop: 5, color: '#334155' }}>{currentEvent.description}</p>
        {currentEvent.type === 'bad' && (
          <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 'bold', display: 'block', marginTop: 5 }}>
            Кризис логистики: груз на терминале увеличился!
          </span>
        )}
      </div>
    )}
  </div>
} />
              <Route path="/marketing" element={
                <MarketingView marketLots={marketLots} activeContract={activeContract} handleTakeContract={handleTakeContract} kpiMark={kpiMark} />
              } />
              <Route path="/mechanic" element={
                <MechanicView craneWear={craneWear} isCraneBroken={isCraneBroken} handleRepairCrane={handleRepairCrane} kpiMech={kpiMech} />
              } />
              <Route path="/expeditor" element={
                <ExpeditorView 
                  warehouseCargo={warehouseCargo} warehouseMax={warehouseMax} activeContract={activeContract} 
                  handleDispatchTransport={handleDispatchTransport} kpiExp={kpiExp} transportCosts={transportCosts}
                />
              } />
            </Routes>
          </div>

          {/* 3D ОКНО (Рендерится всегда справа) */}
          <div style={{ flex: 1, height: "100%" }}>
            <PortScene shipData={shipData} isCraneBroken={isCraneBroken} />
          </div>

        </div>
      </div>
    </BrowserRouter>
  );
}




