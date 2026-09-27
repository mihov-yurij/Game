import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import { PortScene } from './components/3d/PortScene';
import { MarketingView } from './components/ui/MarketingView';
import { MechanicView } from './components/ui/MechanicView';
import { ExpeditorView } from './components/ui/ExpeditorView';
import { QuizDialog } from './components/ui/QuizDialog';
import { ResultsView } from './components/ui/ResultsView';
import { generateWeeklyEvent } from './services/aiService';
import {
  MARKET_LOTS,
  QUESTIONS,
  lotBasisLine,
  questionById,
  repairQuestionId,
} from './curriculum/incoterms';
import {
  defaultPeople,
  firstAttempt,
  moduleStatus,
  nextQuestion,
  nextStudy,
  recordAttempt,
  remaining,
} from './curriculum/mastery';

const STORAGE_KEY = 'sea-knot-dossier-v1';
const WAREHOUSE_MAX = 15000;
const TRANSPORT_COSTS = { train: 150000, truck: 50000 };

function loadPeople() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const people = defaultPeople();
    for (const role of Object.keys(people)) {
      const row = saved?.[role];
      if (!row) continue;
      if (typeof row.name === 'string' && row.name.trim()) {
        people[role].name = row.name.trim().slice(0, 40);
      }
      if (Array.isArray(row.attempts)) {
        people[role].attempts = row.attempts.filter(
          (attempt) => attempt && typeof attempt.itemId === 'string' && typeof attempt.correct === 'boolean',
        );
      }
    }
    return people;
  } catch {
    return defaultPeople();
  }
}

export default function PortSimulator() {
  const [balance, setBalance] = useState(5000000);
  const [marketLots, setMarketLots] = useState(MARKET_LOTS);
  const [activeContract, setActiveContract] = useState(null);
  const [shipData, setShipData] = useState({ status: 'No Cargo', targetX: -15, demurrageReason: null });
  const [craneWear, setCraneWear] = useState(100);
  const [isCraneBroken, setIsCraneBroken] = useState(false);
  const [warehouseCargo, setWarehouseCargo] = useState(2000);
  const [kpiMark, setKpiMark] = useState(100);
  const [kpiMech, setKpiMech] = useState(100);
  const [kpiExp, setKpiExp] = useState(100);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [people, setPeople] = useState(loadPeople);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  }, [people]);

  const statuses = {
    marketer: moduleStatus(people.marketer, QUESTIONS),
    mechanic: moduleStatus(people.mechanic, QUESTIONS),
    expeditor: moduleStatus(people.expeditor, QUESTIONS),
  };

  function rename(role, name) {
    setPeople((prev) => ({ ...prev, [role]: { ...prev[role], name } }));
  }

  function askThen(role, item, commit) {
    if (!item) {
      commit?.();
      return;
    }
    const prior = firstAttempt(people[role], item.id);
    if (prior?.correct) {
      commit?.();
      return;
    }
    setQuiz({ item, credit: !prior, commit: commit ?? null, picked: null, result: null });
  }

  function chooseAnswer(choiceId) {
    if (!quiz || quiz.picked) return;
    const correct = choiceId === quiz.item.correct;
    if (quiz.credit) {
      setPeople((prev) => {
        const { participant } = recordAttempt(prev[quiz.item.role], quiz.item, choiceId);
        return { ...prev, [quiz.item.role]: participant };
      });
    }
    setQuiz((current) => ({ ...current, picked: choiceId, result: correct ? 'ok' : 'bad' }));
  }

  function acknowledgeQuiz() {
    const current = quiz;
    setQuiz(null);
    if (current?.result === 'ok' && current.commit) current.commit();
  }

  function openStudy(role) {
    askThen(role, nextStudy(people[role], QUESTIONS), null);
  }

  function openApply(role) {
    askThen(role, nextQuestion(people[role], QUESTIONS, ['apply']), null);
  }

  function openCase(role) {
    askThen(role, nextQuestion(people[role], QUESTIONS, ['analyze']), null);
  }

  function commitTake(lot) {
    setMarketLots((prev) => prev.filter((item) => item.id !== lot.id));
    setActiveContract(lot);
    setShipData({ status: 'Waiting', targetX: -8, demurrageReason: null });
  }

  function handleTakeContract(lot) {
    if (activeContract || quiz) return;
    askThen('marketer', questionById(`m-app-${lot.incoterm.toLowerCase()}`), () => commitTake(lot));
  }

  function handleArriveToBerth() {
    if (!activeContract || isCraneBroken || quiz) return;

    if (warehouseCargo + activeContract.volume > WAREHOUSE_MAX) {
      if (shipData.demurrageReason !== 'yard') {
        window.alert('На складе нет места для этого судна. Экспедитор должен освободить терминал.');
        setBalance((prev) => prev - 250000);
        setKpiExp((prev) => Math.max(0, prev - 30));
      }
      setShipData({ status: 'Demurrage', targetX: 0, demurrageReason: 'yard' });
      return;
    }

    setShipData({ status: 'Unloading', targetX: 0, demurrageReason: null });
    const currentWear = Math.max(0, craneWear - (Math.floor(Math.random() * 25) + 15));
    const contract = activeContract;

    setTimeout(() => {
      setCraneWear(currentWear);
      if (currentWear <= 30) {
        setIsCraneBroken(true);
        setShipData({ status: 'Demurrage', targetX: 0, demurrageReason: 'crane' });
        setBalance((prev) => prev - 300000);
        setKpiMark((prev) => Math.max(0, prev - 25));
      } else {
        setWarehouseCargo((prev) => prev + contract.volume);
        setBalance((prev) => prev + contract.reward);
        setShipData({ status: 'Departed', targetX: 15, demurrageReason: null });
        setActiveContract(null);
        setKpiMark((prev) => prev + 20);
      }
    }, 3000);
  }

  function commitRepair() {
    setBalance((prev) => prev - 150000);
    setCraneWear(100);
    setIsCraneBroken(false);
    setKpiMech((prev) => prev + 30);

    if (shipData.status === 'Demurrage' && shipData.demurrageReason === 'crane' && activeContract) {
      const contract = activeContract;
      setShipData({ status: 'Unloading', targetX: 0, demurrageReason: null });
      setTimeout(() => {
        setWarehouseCargo((prev) => prev + contract.volume);
        setBalance((prev) => prev + contract.reward);
        setShipData({ status: 'Departed', targetX: 15, demurrageReason: null });
        setActiveContract(null);
      }, 2000);
    }
  }

  function handleRepairCrane() {
    if (craneWear === 100 || quiz) return;
    const itemId = repairQuestionId({
      isCraneBroken,
      shipStatus: shipData.status,
      demurrageReason: shipData.demurrageReason,
      incoterm: activeContract?.incoterm,
    });
    askThen('mechanic', questionById(itemId), commitRepair);
  }

  function commitDispatch(type) {
    if (type === 'train') {
      setWarehouseCargo((prev) => Math.max(0, prev - 2000));
      setBalance((prev) => prev - TRANSPORT_COSTS.train);
    } else {
      setWarehouseCargo((prev) => Math.max(0, prev - 500));
      setBalance((prev) => prev - TRANSPORT_COSTS.truck);
    }
    setKpiExp((prev) => prev + 15);
  }

  function handleDispatchTransport(type) {
    if (quiz) return;
    if (!activeContract) {
      commitDispatch(type);
      return;
    }
    askThen(
      'expeditor',
      questionById(`e-app-${activeContract.incoterm.toLowerCase()}`),
      () => commitDispatch(type),
    );
  }

  async function handleNextWeek() {
    setIsAiLoading(true);
    const newEvent = await generateWeeklyEvent();
    if (!newEvent) {
      setCurrentEvent({
        title: 'Grok не ответил',
        description: 'Проверьте VITE_XAI_API_KEY. На досье знаний это не влияет.',
        type: 'info',
      });
      setIsAiLoading(false);
      return;
    }

    setCurrentEvent(newEvent);
    if (newEvent.type === 'bad') {
      const damage = Number(newEvent.damage) || 0;
      setWarehouseCargo((prev) => Math.min(WAREHOUSE_MAX, prev + damage * 100));
      setKpiExp((prev) => Math.max(0, prev - 15));
    } else if (newEvent.type === 'good') {
      setWarehouseCargo((prev) => Math.max(0, prev - 1500));
      setKpiExp((prev) => prev + 20);
    }
    setIsAiLoading(false);
  }

  function resetDossiers() {
    if (!window.confirm('Сбросить попытки и ступени? Имена останутся, порт не обнулится.')) return;
    setPeople((prev) => {
      const fresh = defaultPeople();
      for (const role of Object.keys(fresh)) fresh[role].name = prev[role].name;
      return fresh;
    });
  }

  function liveNote(role) {
    if (role === 'mechanic' && isCraneBroken) return 'Кран в аварии. Кейс отделяет риск товара от ремонта терминала.';
    if (role === 'mechanic' && craneWear <= 45) return 'Износ близко к порогу 30%. ТО до выгрузки дешевле простоя.';
    if (role === 'expeditor' && shipData.demurrageReason === 'yard') return 'Судно в простое: склад не принял объём.';
    if (role === 'marketer' && shipData.demurrageReason === 'crane') return 'Простой из-за крана. Базис не переносит его на покупателя.';
    if (role === 'marketer' && shipData.demurrageReason === 'yard') return 'Простой из-за склада. Это потеря порта, не риск продавца.';
    return null;
  }

  function roleQuizProps(role) {
    return {
      person: people[role],
      status: statuses[role],
      onRename: (name) => rename(role, name),
      onStudy: () => openStudy(role),
      onApply: () => openApply(role),
      onCase: () => openCase(role),
      studyLeft: remaining(people[role], QUESTIONS, ['remember', 'understand']),
      applyLeft: remaining(people[role], QUESTIONS, ['apply']),
      caseLeft: remaining(people[role], QUESTIONS, ['analyze']),
      liveNote: liveNote(role),
    };
  }

  const linkStyle = (background) => ({
    color: '#fff',
    textDecoration: 'none',
    padding: '6px 12px',
    background,
    borderRadius: 4,
  });

  return (
    <BrowserRouter>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#1e293b', color: '#fff', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Sea Knot</h2>
            <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link to="/" style={linkStyle('#334155')}>Диспетчер</Link>
              <Link to="/marketing" style={linkStyle('#2563eb')}>Маркетолог</Link>
              <Link to="/mechanic" style={linkStyle('#0ea5e9')}>Механик</Link>
              <Link to="/expeditor" style={linkStyle('#d97706')}>Экспедитор</Link>
              <Link to="/results" style={linkStyle('#7c3aed')}>Досье</Link>
            </nav>
          </div>
          <div>Бюджет холдинга: <b style={{ color: '#22c55e', fontSize: '1.2rem' }}>${balance.toLocaleString()}</b></div>
        </div>

        <div style={{ flex: 1, display: 'flex', position: 'relative', minHeight: 0 }}>
          <div style={{ width: '420px', height: '100%', background: '#f1f5f9', boxShadow: '2px 0 5px rgba(0,0,0,0.1)', zIndex: 5, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={
                <Dispatcher
                  activeContract={activeContract}
                  shipData={shipData}
                  onUnload={handleArriveToBerth}
                  isCraneBroken={isCraneBroken}
                  onNextWeek={handleNextWeek}
                  isAiLoading={isAiLoading}
                  currentEvent={currentEvent}
                />
              } />
              <Route path="/marketing" element={
                <MarketingView
                  marketLots={marketLots}
                  activeContract={activeContract}
                  handleTakeContract={handleTakeContract}
                  kpiMark={kpiMark}
                  basisCleared={(lot) => Boolean(firstAttempt(people.marketer, `m-app-${lot.incoterm.toLowerCase()}`)?.correct)}
                  {...roleQuizProps('marketer')}
                />
              } />
              <Route path="/mechanic" element={
                <MechanicView
                  craneWear={craneWear}
                  isCraneBroken={isCraneBroken}
                  handleRepairCrane={handleRepairCrane}
                  kpiMech={kpiMech}
                  {...roleQuizProps('mechanic')}
                />
              } />
              <Route path="/expeditor" element={
                <ExpeditorView
                  warehouseCargo={warehouseCargo}
                  warehouseMax={WAREHOUSE_MAX}
                  activeContract={activeContract}
                  handleDispatchTransport={handleDispatchTransport}
                  kpiExp={kpiExp}
                  transportCosts={TRANSPORT_COSTS}
                  {...roleQuizProps('expeditor')}
                />
              } />
              <Route path="/results" element={
                <ResultsView
                  people={people}
                  statuses={statuses}
                  onRename={rename}
                  onReset={resetDossiers}
                />
              } />
            </Routes>
          </div>

          <div style={{ flex: 1, height: '100%' }}>
            <PortScene shipData={shipData} isCraneBroken={isCraneBroken} />
          </div>
        </div>

        <QuizDialog quiz={quiz} onChoose={chooseAnswer} onClose={acknowledgeQuiz} />
      </div>
    </BrowserRouter>
  );
}

function Dispatcher({ activeContract, shipData, onUnload, isCraneBroken, onNextWeek, isAiLoading, currentEvent }) {
  const eventTone = currentEvent?.type === 'bad' ? '#fee2e2' : currentEvent?.type === 'good' ? '#f0fdf4' : '#f8fafc';
  const eventColor = currentEvent?.type === 'bad' ? '#b91c1c' : currentEvent?.type === 'good' ? '#15803d' : '#334155';

  return (
    <div style={{ padding: 20 }}>
      <h3>Операционный пост</h3>
      {activeContract ? (
        <div style={{ marginTop: 16, padding: 15, background: '#fff', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          <h4 style={{ marginTop: 0 }}>{activeContract.type}</h4>
          <p>{lotBasisLine(activeContract)}</p>
          <p>К разгрузке: <b>{activeContract.volume.toLocaleString()} ед.</b></p>
          <p>Статус: <b>{shipData.status}</b></p>
          {(shipData.status === 'Waiting' || shipData.demurrageReason === 'yard') && (
            <button
              type="button"
              onClick={onUnload}
              disabled={isCraneBroken}
              style={{ marginTop: 8, width: '100%', padding: '10px', background: isCraneBroken ? '#94a3b8' : '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: isCraneBroken ? 'default' : 'pointer', fontWeight: 'bold' }}
            >
              {isCraneBroken ? 'Кран в аварии' : shipData.demurrageReason === 'yard' ? 'Повторить постановку' : 'Разгрузить на терминал'}
            </button>
          )}
          {shipData.demurrageReason === 'yard' && (
            <p style={{ color: '#b91c1c', fontSize: '0.85rem' }}>Простой: склад не принял объём.</p>
          )}
          {shipData.demurrageReason === 'crane' && (
            <p style={{ color: '#b91c1c', fontSize: '0.85rem' }}>Простой: кран не довёл выгрузку.</p>
          )}
        </div>
      ) : (
        <p style={{ marginTop: 16, color: '#64748b' }}>Причал свободен. Контракт берёт маркетолог.</p>
      )}

      <button
        type="button"
        onClick={onNextWeek}
        disabled={isAiLoading}
        style={{ marginTop: 16, width: '100%', padding: '10px', background: '#475569', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
      >
        {isAiLoading ? 'Grok смотрит неделю…' : 'Событие недели'}
      </button>
      <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Событие двигает склад и вклад в порт. Ступень знаний оно не ставит.</p>
      {currentEvent && (
        <div style={{ marginTop: 8, padding: 12, background: eventTone, border: '1px solid #cbd5e1', borderRadius: 6 }}>
          <h4 style={{ color: eventColor, margin: 0 }}>{currentEvent.title}</h4>
          <p style={{ fontSize: '0.85rem', marginTop: 6, marginBottom: 0, color: '#334155' }}>{currentEvent.description}</p>
        </div>
      )}
    </div>
  );
}
