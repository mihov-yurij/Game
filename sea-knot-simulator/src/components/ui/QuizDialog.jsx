import React from 'react';

export function QuizDialog({ quiz, onChoose, onClose }) {
  if (!quiz) return null;
  const { item, credit, picked, result } = quiz;
  const answered = picked !== null;

  let footer = 'Ответ попадёт в личное досье. Ошибка не списывает бюджет холдинга.';
  if (!credit) footer = 'Этот вопрос уже сдан. Повтор в зачёт не идёт. Верный ответ нужен, чтобы выполнить действие порта.';
  if (answered && result === 'ok' && quiz.commit) footer = 'Верно. Действие порта сейчас выполнится.';
  if (answered && result === 'bad') footer = 'В порт это действие не уходит. Правило ниже — в досье.';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 'min(560px, 100%)', background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <p style={{ margin: 0, fontSize: '0.75rem', letterSpacing: '0.04em', color: '#64748b' }}>
          INCOTERMS 2020 · {credit ? 'В ЗАЧЁТ' : 'ПОВТОР'}
        </p>
        <h3 style={{ margin: '8px 0 12px' }}>{item.prompt}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {item.choices.map((choice) => {
            let background = '#f8fafc';
            let border = '1px solid #cbd5e1';
            if (answered && choice.id === item.correct) {
              background = '#dcfce7';
              border = '1px solid #16a34a';
            } else if (answered && choice.id === picked) {
              background = '#fee2e2';
              border = '1px solid #dc2626';
            }
            return (
              <button
                key={choice.id}
                type="button"
                disabled={answered}
                onClick={() => onChoose(choice.id)}
                style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 6, border, background, cursor: answered ? 'default' : 'pointer' }}
              >
                {choice.text}
              </button>
            );
          })}
        </div>
        {answered && (
          <p style={{ marginTop: 12, fontSize: '0.9rem', color: '#1e293b' }}>{item.rule}</p>
        )}
        <p style={{ marginTop: 8, fontSize: '0.8rem', color: '#64748b' }}>{footer}</p>
        {answered && (
          <button
            type="button"
            onClick={onClose}
            style={{ marginTop: 12, width: '100%', padding: '10px', background: result === 'ok' ? '#15803d' : '#334155', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
          >
            {result === 'ok' && quiz.commit ? 'Выполнить действие' : 'Закрыть'}
          </button>
        )}
      </div>
    </div>
  );
}
