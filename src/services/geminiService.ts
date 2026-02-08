// Gemini AI Service for chat functionality

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

class GeminiService {
  private conversationHistory: { role: string; content: string }[] = [];

  async *sendMessageStream(message: string): AsyncGenerator<string> {
    this.conversationHistory.push({ role: 'user', content: message });
    
    // If no API key, return a mock response
    if (!API_KEY || API_KEY === 'PLACEHOLDER_API_KEY') {
      const mockResponse = this.getMockResponse(message);
      for (const char of mockResponse) {
        yield char;
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      this.conversationHistory.push({ role: 'assistant', content: mockResponse });
      return;
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents: message,
      });

      let fullResponse = '';
      for await (const chunk of response) {
        const text = chunk.text || '';
        fullResponse += text;
        yield text;
      }
      
      this.conversationHistory.push({ role: 'assistant', content: fullResponse });
    } catch (error) {
      console.error('Gemini API error:', error);
      const errorMessage = 'Извините, произошла ошибка при обработке запроса.';
      yield errorMessage;
    }
  }

  private getMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('домик') || lowerMessage.includes('дом')) {
      return '🏡 У нас есть два уютных домика:\n\n• Домик №1 — до 6 человек, есть кухня и терраса\n• Домик №2 — до 9 человек, просторный зал\n\nХотите узнать цены или забронировать?';
    }
    
    if (lowerMessage.includes('беседк')) {
      return '🌿 Беседки на 10-25 человек с мангалом и зоной отдыха. Отличный выбор для пикника! Цена от 50 BYN/час.';
    }
    
    if (lowerMessage.includes('бан')) {
      return '🧖 Русская баня с парной, комнатой отдыха и бассейном. Вместимость до 8 человек. Цена: 80 BYN/час.';
    }
    
    if (lowerMessage.includes('зал') || lowerMessage.includes('банкет')) {
      return '🎉 Банкетные залы на 35-100 человек для свадеб, юбилеев и корпоративов. Полное оформление включено!';
    }
    
    if (lowerMessage.includes('цен') || lowerMessage.includes('стоим') || lowerMessage.includes('рассчит')) {
      return '💰 Примерные цены:\n• Беседки: от 50 BYN/час\n• Домики: от 150 BYN/сутки\n• Баня: 80 BYN/час\n• Залы: от 200 BYN\n\nДля точного расчёта укажите дату и количество гостей!';
    }
    
    if (lowerMessage.includes('где') || lowerMessage.includes('адрес') || lowerMessage.includes('находи') || lowerMessage.includes('добрать')) {
      return '📍 Мы находимся в 7 км от Бобруйска, в живописном сосновом бору. Удобный подъезд, есть парковка!';
    }
    
    if (lowerMessage.includes('администратор') || lowerMessage.includes('связ')) {
      return '📞 Для связи с администратором:\n• Телефон: +375 (29) 123-45-67\n• Время работы: 9:00 — 21:00\n\nПерезвоним в течение 10 минут!';
    }
    
    if (lowerMessage.includes('напомн')) {
      return '🔔 Хорошо! Напомню вам о бронировании. Оставьте свой номер телефона, и мы свяжемся с вами в удобное время.';
    }
    
    if (lowerMessage.includes('фото')) {
      return '📸 С радостью покажу вам нашу красоту!\n• Территории и соснового леса 🌲\n• Уютных домиков 🏠\n• Банкетных залов 🎉\n• Баня и беседок ♨️';
    }
    
    if (lowerMessage.includes('свободн') || lowerMessage.includes('выходн')) {
      return '🔥 Свободные объекты на ближайшие выходные:\n\n🏡 Домик №1 — свободен в субботу\n♨️ Баня — воскресенье\n🍖 Беседка на 20 чел — вся суббота\n\n❗Хотите забронировать?';
    }
    
    return '🌲 Спасибо за интерес к базе отдыха «Берёзка»! Чем могу помочь? Выберите интересующую тему или задайте вопрос.';
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}

export const geminiService = new GeminiService();
