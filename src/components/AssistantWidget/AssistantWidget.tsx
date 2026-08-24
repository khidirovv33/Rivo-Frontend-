import { useEffect, useRef, useState } from 'react';
import { askAssistant } from '@/api/endpoints/assistant';
import { extractErrorMessage } from '@/api/client';
import type { ChatMessage } from '@/types/domain';
import { ChatIcon, CloseIcon, SendIcon } from '../icons';
import styles from './AssistantWidget.module.css';

interface DisplayMessage extends ChatMessage {
  isError?: boolean;
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: DisplayMessage = { role: 'user', content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askAssistant({ messages: history.map(({ role, content }) => ({ role, content })) });
      setMessages([...history, { role: 'assistant', content: res.reply }]);
    } catch (error) {
      setMessages([...history, { role: 'assistant', content: extractErrorMessage(error), isError: true }]);
    } finally {
      setIsLoading(false);
    }
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
            <button type="button" className={styles.closeButton} onClick={() => setOpen(false)} aria-label="Закрыть">
              <CloseIcon width={14} height={14} />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <p className={styles.emptyHint}>
                Спросите про кассу, склад, отчёты или любой другой раздел Rivo — отвечу прямо здесь.
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
              placeholder="Написать сообщение…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className={styles.sendButton}
              onClick={handleSend}
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
