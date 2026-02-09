import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Trees,
  MapPin,
  Home,
  Users,
  Coffee,
  Menu,
  X,
  ArrowRight,
  Calculator,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { geminiService } from "./services/geminiService";
import { Message } from "./types";
import { QUICK_ACTIONS } from "./constants";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "✨ Добро пожаловать! 🌲 Я помогу вам выбрать идеальное место для отдыха на природе. Что интересует — баня, домик, беседка или праздник? 🎉",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calculation Form State
  const [showCalcForm, setShowCalcForm] = useState(false);
  const [calcStep, setCalcStep] = useState(1);
  const [calcData, setCalcData] = useState({
    date: "",
    guests: "1",
    object: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (text === "💰 Рассчитать стоимость") {
      setShowCalcForm(true);
      setCalcStep(1);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    let assistantText = "";

    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        text: "",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);

    try {
      const messageToSend =
        text === "🔔 Напомнить позже"
          ? "Напомнить о бронировке позже"
          : text === "📞 Связаться с администратором"
            ? "Я хочу связаться с администратором"
            : text;

      const stream = geminiService.sendMessageStream(messageToSend);
      for await (const chunk of stream) {
        assistantText += chunk;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, text: assistantText } : msg)),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitCalculation = () => {
    const prompt = `Рассчитай стоимость: Объект: ${calcData.object}, Дата: ${calcData.date}, Количество человек: ${calcData.guests}.`;
    setShowCalcForm(false);
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-screen bg-green-50 max-w-4xl mx-auto shadow-2xl rounded-3xl overflow-hidden">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-emerald-600 active:scale-95 rounded-full md:hidden transition-all"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="bg-white p-1.5 rounded-full shadow-inner">
            <Trees className="text-emerald-700" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Берёзка</h1>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <MapPin size={10} /> 7 км от Бобруйска
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <span
            className="flex items-center gap-1 cursor-pointer hover:text-emerald-200 hover:translate-y-[-1px] transition-all active:scale-95"
            onClick={() => handleSendMessage("Расскажи про домики")}
          >
            <Home size={16} /> Домики
          </span>
          <span
            className="flex items-center gap-1 cursor-pointer hover:text-emerald-200 hover:translate-y-[-1px] transition-all active:scale-95"
            onClick={() => handleSendMessage("Про беседки")}
          >
            <Users size={16} /> Беседки
          </span>
          <span
            className="flex items-center gap-1 cursor-pointer hover:text-emerald-200 hover:translate-y-[-1px] transition-all active:scale-95"
            onClick={() => handleSendMessage("Банкетные залы")}
          >
            <Coffee size={16} /> Залы
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-y-auto relative px-6 py-4">
        {/* Sidebar */}
        <aside
          className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          absolute md:static inset-y-0 left-0 w-72 bg-white border-r border-gray-200 p-6 z-10 transition-transform duration-300 ease-in-out
          flex flex-col gap-6
        `}
        >
          <div>
            <h2 className="text-emerald-800 font-bold mb-3 flex items-center gap-2">
              <Trees size={20} /> О базе отдыха
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Уютное место в сосновом бору для вашего отдыха, праздников и мероприятий.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Наши возможности</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {[
                { label: "Беседки", info: "10-25 чел" },
                { label: "Домик №1", info: "6 мест" },
                { label: "Домик №2", info: "9 мест" },
                { label: "Банкетные залы", info: "35-100 чел" },
                { label: "Баня", info: "Парная" },
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-default group"
                >
                  <span className="group-hover:text-emerald-700 transition-colors">{item.label}</span>
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                    {item.info}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Chat Window */}
        <main className="flex-1 min-h-0 flex flex-col bg-gray-50 z-0 relative overflow-hidden ">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 hide-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`
                  max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-sm text-sm transition-all
                  ${
                    msg.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none hover:bg-emerald-700"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-100 hover:border-emerald-100"
                  }
                `}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  <div className={`text-[10px] mt-1 opacity-60 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-1">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Footer (кнопки + ввод) */}
          <div className="shrink-0 border-t border-emerald-100 bg-white/90 backdrop-blur-sm">
            {/* быстрые кнопки */}
            <div className="px-4 py-3 flex flex-wrap gap-2 justify-center">
              {/* сюда перенеси твои кнопки: "Рассчитать стоимость", "Свободно..." и т.д. */}
            </div>

            {/* поле ввода */}
            <div className="px-4 pb-4">{/* сюда перенеси твой input + кнопку отправки */}</div>
          </div>

          {/* Mini-Form Overlay for Calculation */}
          {showCalcForm && (
            <div className="absolute inset-x-0 bottom-0 z-30 p-4 bg-white/95 backdrop-blur-sm border-t border-emerald-100 animate-in slide-in-from-bottom duration-300">
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-emerald-50 overflow-hidden">
                <div className="bg-emerald-600 p-3 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Calculator size={18} /> Рассчитать стоимость
                  </div>
                  <button
                    onClick={() => setShowCalcForm(false)}
                    className="hover:bg-emerald-500 active:scale-90 p-1 rounded-full transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6">
                  {calcStep === 1 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">📆 Шаг 1: Выберите дату</label>
                      <input
                        type="date"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none hover:border-emerald-300 transition-all"
                        value={calcData.date}
                        onChange={(e) => setCalcData({ ...calcData, date: e.target.value })}
                      />
                      <button
                        disabled={!calcData.date}
                        onClick={() => setCalcStep(2)}
                        className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md"
                      >
                        Далее <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  {calcStep === 2 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">👥 Шаг 2: Сколько человек</label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            setCalcData({ ...calcData, guests: Math.max(1, parseInt(calcData.guests) - 1).toString() })
                          }
                          className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 active:scale-90 transition-all shadow-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="flex-1 text-center p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold hover:border-emerald-300 transition-all"
                          value={calcData.guests}
                          onChange={(e) => setCalcData({ ...calcData, guests: e.target.value })}
                        />
                        <button
                          onClick={() =>
                            setCalcData({ ...calcData, guests: (parseInt(calcData.guests) + 1).toString() })
                          }
                          className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 active:scale-90 transition-all shadow-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCalcStep(1)}
                          className="flex-1 bg-gray-100 text-gray-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all"
                        >
                          <ChevronLeft size={18} /> Назад
                        </button>
                        <button
                          onClick={() => setCalcStep(3)}
                          className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md"
                        >
                          Далее <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {calcStep === 3 && (
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">🏡 Шаг 3: Что выберем?</label>
                      <div className="grid grid-cols-1 gap-2">
                        {["Домик до 10 чел", "Домик до 20 чел", "Баня", "Банкетный зал", "Беседка"].map((obj) => (
                          <button
                            key={obj}
                            onClick={() => setCalcData({ ...calcData, object: obj })}
                            className={`p-3 text-left rounded-xl border transition-all active:scale-[0.99] ${calcData.object === obj ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"}`}
                          >
                            {obj}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCalcStep(2)}
                          className="flex-1 bg-gray-100 text-gray-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 active:scale-[0.98] transition-all"
                        >
                          <ChevronLeft size={18} /> Назад
                        </button>
                        <button
                          disabled={!calcData.object}
                          onClick={submitCalculation}
                          className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md"
                        >
                          🎯 Получить расчёт
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="bg-gray-100 h-1.5 w-full flex">
                  <div
                    className={`h-full bg-emerald-500 transition-all duration-300 ${calcStep === 1 ? "w-1/3" : calcStep === 2 ? "w-2/3" : "w-full"}`}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions & Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(action)}
                  className={`
                    whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1 active:scale-95 hover:shadow-md hover:translate-y-[-1px]
                    ${
                      action.includes("💰")
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : action.includes("🔥")
                          ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                          : action.includes("📞")
                            ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                            : action.includes("🔔")
                              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                              : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }
                  `}
                >
                  {action}
                  <ArrowRight size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Спросите о ценах или бронировании..."
                className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none hover:bg-gray-200"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`
                  p-3 rounded-full flex items-center justify-center transition-all shadow-md
                  ${
                    !inputValue.trim() || isLoading
                      ? "bg-gray-200 text-gray-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-90 hover:shadow-lg"
                  }
                `}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* Floating Info (Mobile Only) */}
      <div className="md:hidden fixed bottom-24 right-4 z-20">
        <button
          onClick={() => handleSendMessage("Где вы находитесь?")}
          className="bg-white p-3 rounded-full shadow-lg border border-emerald-100 text-emerald-600 hover:bg-emerald-50 active:scale-90 transition-all"
        >
          <MapPin size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;
