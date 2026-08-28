import { useEffect, useRef, useState } from 'react';
import { askAssistant } from '@/api/endpoints/assistant';
import { extractErrorMessage } from '@/api/client';
import type { ChatMessage } from '@/types/domain';
import { ChatIcon, CloseIcon, MicIcon, MicOffIcon, SendIcon, VolumeIcon } from '../icons';
import styles from './AssistantWidget.module.css';

interface DisplayMessage extends ChatMessage {
  isError?: boolean;
}

// Web Speech API не стандартизирован до конца — в TS-либах его нет, а в браузерах он доступен
// только с префиксом webkit (Chrome/Edge) либо не доступен вовсе (Firefox/Safari). Минимальные
// типы объявлены здесь же, фича-детект — при монтировании компонента.
interface SpeechRecognitionResultLike {
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const canListen = useRef(Boolean(getSpeechRecognitionCtor())).current;

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, open]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (canSpeak) window.speechSynthesis.cancel();
    };
  }, []);

  function speak(text: string) {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    window.speechSynthesis.speak(utterance);
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: DisplayMessage = { role: 'user', content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askAssistant({ messages: history.map(({ role, content }) => ({ role, content })) });
      setMessages([...history, { role: 'assistant', content: res.reply }]);
      if (speakReplies) speak(res.reply);
    } catch (error) {
      const message = extractErrorMessage(error);
      setMessages([...history, { role: 'assistant', content: message, isError: true }]);
      if (speakReplies) speak(message);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div>
              <div className={styles.headerTitle}>AI-помощник</div>
              <div className={styles.headerSubtitle}>Вопросы по работе с Rivo</div>
            </div>
            <div className={styles.headerActions}>
              {canSpeak && (
                <button
                  type="button"
                  className={[styles.closeButton, speakReplies ? styles.toggleActive : ''].join(' ')}
                  onClick={() => setSpeakReplies((v) => !v)}
                  aria-pressed={speakReplies}
                  aria-label={speakReplies ? 'Не озвучивать ответы' : 'Озвучивать ответы'}
                  title={speakReplies ? 'Озвучка включена' : 'Озвучка выключена'}
                >
                  <VolumeIcon width={14} height={14} />
                </button>
              )}
              <button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Закрыть">
                <CloseIcon width={14} height={14} />
              </button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <p className={styles.emptyHint}>
                Спросите про кассу, склад, отчёты или любой другой раздел Rivo — отвечу прямо здесь.
                {canListen && ' Можно и голосом — нажмите на микрофон.'}
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={[styles.bubbleRow, message.role === 'user' ? styles.bubbleRowUser : ''].join(' ')}
              >
                <div
                  className={[
                    styles.bubble,
                    message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                    message.isError ? styles.bubbleError : '',
                  ].join(' ')}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={styles.bubbleRow}>
                <div className={[styles.bubble, styles.bubbleAssistant].join(' ')}>
                  <div className={styles.typing}>
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                    <span className={styles.typingDot} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.form}>
            <textarea
              className={styles.textarea}
              placeholder={isListening ? 'Слушаю…' : 'Написать сообщение…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {canListen && (
              <button
                type="button"
                className={[styles.micButton, isListening ? styles.micButtonActive : ''].join(' ')}
                onClick={toggleListening}
                aria-pressed={isListening}
                aria-label={isListening ? 'Остановить запись' : 'Голосовой ввод'}
              >
                {isListening ? <MicOffIcon width={16} height={16} /> : <MicIcon width={16} height={16} />}
              </button>
            )}
            <button
              type="button"
              className={styles.sendButton}
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              aria-label="Отправить"
            >
              <SendIcon width={16} height={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Закрыть помощника' : 'Открыть помощника'}
      >
        {open ? <CloseIcon width={22} height={22} /> : <ChatIcon width={22} height={22} />}
      </button>
    </>
  );
}
