// Ступень растёт только своими вопросами.
// «Узнал» и «Понял» — один верный первый ответ.
// «Применил» и «Разобрал» — два верных первых ответа подряд, на разных вопросах.
// Ошибка верхнего вопроса не стирает уже взятую ступень.

export const LEVEL_LABEL = {
  none: 'Не приступал',
  remember: 'Узнал',
  understand: 'Понял',
  apply: 'Применил',
  analyze: 'Разобрал',
}

const RANK = { none: 0, remember: 1, understand: 2, apply: 3, analyze: 4 }

export function defaultPeople() {
  return {
    marketer: { role: 'marketer', name: 'Маркетолог', attempts: [] },
    mechanic: { role: 'mechanic', name: 'Механик', attempts: [] },
    expeditor: { role: 'expeditor', name: 'Экспедитор', attempts: [] },
  }
}

export function firstAttempt(participant, itemId) {
  return participant.attempts.find((attempt) => attempt.itemId === itemId) ?? null
}

export function recordAttempt(participant, item, choiceId) {
  const correct = choiceId === item.correct
  if (firstAttempt(participant, item.id)) {
    return { participant, correct, graded: false }
  }
  const attempt = { itemId: item.id, choiceId, correct, at: Date.now() }
  return {
    participant: { ...participant, attempts: [...participant.attempts, attempt] },
    correct,
    graded: true,
  }
}

function streakOf(ordered, questionById, bloom) {
  let current = 0
  let best = 0
  for (const attempt of ordered) {
    if (questionById.get(attempt.itemId)?.bloom !== bloom) continue
    if (attempt.correct) {
      current += 1
      if (current > best) best = current
    } else {
      current = 0
    }
  }
  return { current, best }
}

export function evaluateModule(attempts, questions) {
  const questionById = new Map(questions.map((question) => [question.id, question]))
  const seen = new Set()
  const ordered = []
  for (const attempt of attempts) {
    if (seen.has(attempt.itemId) || !questionById.has(attempt.itemId)) continue
    seen.add(attempt.itemId)
    ordered.push(attempt)
  }

  const passed = (bloom) => ordered.some(
    (attempt) => attempt.correct && questionById.get(attempt.itemId).bloom === bloom,
  )
  const apply = streakOf(ordered, questionById, 'apply')
  const analyze = streakOf(ordered, questionById, 'analyze')

  let level = 'none'
  if (passed('remember')) level = 'remember'
  if (level === 'remember' && passed('understand')) level = 'understand'
  if (level === 'understand' && apply.best >= 2) level = 'apply'
  if (level === 'apply' && analyze.best >= 2) level = 'analyze'

  const lastWrong = [...ordered].reverse().find((attempt) => !attempt.correct)

  let hint = 'Модуль закрыт на ступени «Разобрал».'
  if (level === 'none') hint = 'Ступень «Узнал»: нужен один верный ответ.'
  else if (level === 'remember') hint = 'Ступень «Понял»: нужен один верный ответ.'
  else if (level === 'understand') {
    hint = `Ступень «Применил»: два верных подряд на разных ситуациях. Сейчас серия ${apply.current}.`
  } else if (level === 'apply') {
    hint = `Ступень «Разобрал»: два верных подряд на разных кейсах. Сейчас серия ${analyze.current}.`
  }

  if (RANK[level] < RANK.apply && apply.best >= 2) {
    hint += ' Серия «Применил» уже набрана и откроется после нижних ступеней.'
  }
  if (level !== 'analyze' && analyze.best >= 2) {
    hint += ' Серия «Разобрал» уже набрана и откроется после нижних ступеней.'
  }

  return {
    level,
    levelLabel: LEVEL_LABEL[level],
    lastMistake: lastWrong ? questionById.get(lastWrong.itemId).rule : null,
    correct: ordered.filter((attempt) => attempt.correct).length,
    graded: ordered.length,
    hint,
  }
}

export function moduleStatus(participant, questions, moduleId = 'incoterms-2020') {
  const mine = questions.filter(
    (question) => question.role === participant.role && question.module === moduleId,
  )
  return evaluateModule(participant.attempts, mine)
}

export function nextQuestion(participant, questions, blooms) {
  return questions.find((question) => (
    question.role === participant.role
    && blooms.includes(question.bloom)
    && !firstAttempt(participant, question.id)
  )) ?? null
}

export function nextStudy(participant, questions) {
  return nextQuestion(participant, questions, ['remember'])
    ?? nextQuestion(participant, questions, ['understand'])
}

export function remaining(participant, questions, blooms) {
  return questions.filter((question) => (
    question.role === participant.role
    && blooms.includes(question.bloom)
    && !firstAttempt(participant, question.id)
  )).length
}
