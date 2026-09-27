// Функция отправляет запрос к API xAI для генерации случайного морского события
export async function generateWeeklyEvent() {
  const apiKey = import.meta.env.VITE_XAI_API_KEY;

  if (!apiKey) {
    console.error("API-ключ xAI не найден в файле .env.local!");
    return null;
  }

  try {
    // Используем актуальный эндпоинт /v1/responses из официальной консоли xAI
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "grok-4.7", // Используем новейшую модель Grok 4.7
        // Передаем структуру в массив "input" вместо устаревшего "messages"
        input: [
          {
            role: "system",
            content: "Ты — игровой движок экономического симулятора морского порта. Придумай ОДНО случайное игровое событие (форс-мажор или удачу). Ответ выдай строго в формате JSON без какого-либо лишнего текста вокруг, Markdown-разметки или кавычек ```json. Формат: { \"title\": \"Название\", \"description\": \"Описание ситуации для студентов\", \"type\": \"bad\" или \"good\", \"damage\": число от 10 до 50 }"
          },
          {
            role: "user",
            content: "Сгенерируй новое еженедельное событие для порта."
          }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    // Согласно новому контракту ответов, данные лежат напрямую в data.message.content
    let rawContent = data.message.content.trim();
    
    // Безопасно вырезаем маркеры разметки, если Grok их всё-таки сгенерировал
    if (rawContent.startsWith("```")) {
      rawContent = rawContent.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }
    
    // Парсим очищенный текст в объект JavaScript
    const eventJson = JSON.parse(rawContent);
    return eventJson;

  } catch (error) {
    console.error("Ошибка при запросе к Grok API через эндпоинт /responses:", error);
    return null;
  }
}

