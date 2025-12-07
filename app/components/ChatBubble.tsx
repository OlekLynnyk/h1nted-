'use client';

import { motion } from 'framer-motion';
import { Copy, ThumbsUp, ThumbsDown, FileText, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface Attachment {
  name: string;
  base64: string;
}

interface CdrRef {
  id: string;
  profile_name: string;
}

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  index: number;
  messageId: string;
  status?: 'pending' | 'done' | 'error';
  rating?: 'up' | 'down' | null;
  onRate?: (messageId: string, rating: 'up' | 'down' | null) => void;
  isAfterAssistant?: boolean;
  isStreaming?: boolean;
}

export default function ChatBubble({
  role,
  content,
  index,
  messageId,
  status,
  rating,
  onRate,
  isAfterAssistant,
  isStreaming,
}: ChatBubbleProps) {
  const isUser = role === 'user';

  let attachments: Attachment[] | null = null;
  let cdrs: CdrRef[] | null = null;
  let text = '';

  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && 'text' in parsed) {
      text = parsed.text || '';
      if (Array.isArray(parsed.attachments)) {
        attachments = parsed.attachments;
      }
      if (Array.isArray(parsed.cdrs)) {
        cdrs = parsed.cdrs as CdrRef[];
      }
    } else {
      text = content;
    }
  } catch {
    text = content;
  }

  if (!text && isUser) {
    text = '';
  }

  const COLLAPSE_LIMIT = 200;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [displayedText, setDisplayedText] = useState(() => {
    if (!isUser && isStreaming) return '';
    return text;
  });

  useEffect(() => {
    if (isUser || !isStreaming) {
      setDisplayedText(text);
      return;
    }

    setDisplayedText('');
    let i = 0;
    const full = text;
    const step = 2;
    const delay = 15 + Math.random() * 35;

    const timer = setInterval(() => {
      i += step;
      setDisplayedText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [text, isStreaming, isUser]);

  useEffect(() => {
    if (!isUser && isStreaming) {
      setIsCollapsed(false);
      return;
    }

    if (text.length <= COLLAPSE_LIMIT) {
      setIsCollapsed(false);
    } else {
      setIsCollapsed(true);
    }
  }, [text, isUser, isStreaming]);

  const isCollapsible = !isStreaming && text.length > COLLAPSE_LIMIT;

  const currentText = !isUser && isStreaming ? displayedText : text;

  const shownText =
    isCollapsible && isCollapsed
      ? currentText.slice(0, COLLAPSE_LIMIT) + (currentText.length > COLLAPSE_LIMIT ? '…' : '')
      : currentText;

  const [copied, setCopied] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceWrapRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleRate = (type: 'up' | 'down') => {
    const newRating = rating === type ? null : type;
    onRate?.(messageId, newRating);
  };

  useEffect(() => {
    const stopOnBlur = () => speechSynthesis.cancel();
    window.addEventListener('blur', stopOnBlur);
    return () => window.removeEventListener('blur', stopOnBlur);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const id = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!voiceOpen) return;
      if (!voiceWrapRef.current) return;
      if (!voiceWrapRef.current.contains(e.target as Node)) {
        setVoiceOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [voiceOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) {
          setTimeout(loadVoices, 300);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`w-full py-2 flex ${isUser ? 'justify-end' : 'justify-start'} ${
        isUser && isAfterAssistant ? 'mt-6' : 'mt-1'
      }`}
      onDoubleClick={isCollapsible ? () => setIsCollapsed((v) => !v) : undefined}
    >
      <div className="flex flex-col max-w-full sm:max-w-[80%] text-left">
        {isUser && cdrs && cdrs.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {cdrs.map((it) => (
              <span
                key={it.id}
                className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded-full
                           bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--card-border)]"
                title={it.profile_name}
              >
                <span className="max-w-[220px] truncate">{it.profile_name}</span>
              </span>
            ))}
          </div>
        )}

        {attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {attachments.map((file, idx) =>
              file.base64.startsWith('data:image/') ? (
                <img
                  key={`${file.name}-${idx}`}
                  src={file.base64}
                  alt={file.name}
                  loading="lazy"
                  className="
                    w-20 h-20
                    sm:w-24 sm:h-24
                    rounded-lg
                    object-cover
                    border border-gray-300
                    shadow-sm
                  "
                />
              ) : null
            )}
          </div>
        )}

        <div
          className={`whitespace-pre-wrap px-4 py-2 rounded-xl text-[var(--text-primary)] shadow-none
            ${
              isUser
                ? 'bg-[var(--background)] border border-[var(--card-border)] shadow-2xl rounded-3xl'
                : 'bg-transparent border-none'
            }
          `}
          aria-live={isUser ? undefined : 'polite'}
        >
          <p className="text-left font-monoBrand text-[13px] tracking-[0.02em] whitespace-pre-wrap break-words">
            {shownText || '...'}
          </p>

          {isCollapsible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed((v) => !v);
              }}
              className="mt-1 ml-auto flex items-center gap-1 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
          )}

          {attachments && attachments.length > 0 && (
            <ul className="space-y-2 mt-2">
              {attachments.map(
                (file, idx) =>
                  !file.base64.startsWith('data:image/') && (
                    <li
                      key={`${file.name}-link-${idx}`}
                      className="flex items-start gap-2 text-xs text-[var(--text-primary)]"
                    >
                      <FileText size={14} />
                      <a
                        href={file.base64}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline break-all hover:text-[var(--accent)]"
                      >
                        {file.name}
                      </a>
                    </li>
                  )
              )}
            </ul>
          )}
        </div>

        {!isUser && (
          <div
            className="flex items-center justify-start space-x-[10px] mt-2 pl-4 text-[var(--text-secondary)] text-[13px] flex-nowrap"
            style={{ alignSelf: 'flex-start', lineHeight: '1' }}
          >
            {status === 'pending' && <span className="animate-pulse">...</span>}
            {status === 'error' && <span className="text-[var(--danger)]">Error</span>}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Copy to clipboard"
                    className="text-[var(--text-secondary)] transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded"
                    tabIndex={0}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      >
                        <path d="M5 12l4 4 10-10" />
                      </svg>
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    ref={voiceWrapRef}
                    className="relative ml-2 sm:ml-2 mr-2"
                    style={{
                      marginLeft:
                        typeof window !== 'undefined' && window.innerWidth < 768
                          ? 'auto'
                          : undefined,
                    }}
                  >
                    <button
                      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud options'}
                      className="hover:text-blue-500 transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof window === 'undefined' || !window.speechSynthesis) return;

                        if (speechSynthesis.speaking) {
                          speechSynthesis.cancel();
                          setIsSpeaking(false);
                          setVoiceOpen(false);
                          return;
                        }

                        setVoiceOpen((v) => !v);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-volume-2 relative top-[0.5px] opacity-80"
                      >
                        <path d="M11 5l-6 4H2v6h3l6 4V5z" />
                        <path d="M19.07 4.93a10 10 0 010 14.14" />
                        <path d="M15.54 8.46a5 5 0 010 7.07" />
                      </svg>
                    </button>

                    <div
                      className={`absolute ${voiceOpen ? '' : 'hidden'} z-50
                        bg-[var(--surface)] border border-gray-200 rounded-lg shadow-md
                        p-2 text-xs w-44
                        bottom-full mb-2 left-0 translate-x-0`}
                      role="menu"
                      aria-label="Voice options"
                      style={{
                        transform: 'translateZ(0)',
                        WebkitTransform: 'translateZ(0)',
                        WebkitOverflowScrolling: 'touch',
                        pointerEvents: 'auto',
                        zIndex: 9999,
                      }}
                    >
                      {[
                        {
                          id: 'uk-female',
                          label: '🇬🇧 British Female',
                          filter: (v: SpeechSynthesisVoice) =>
                            v.lang === 'en-GB' && /Serena|Female/i.test(v.name),
                        },
                        {
                          id: 'us-male',
                          label: '🇺🇸 American Male',
                          filter: (v: SpeechSynthesisVoice) =>
                            v.lang === 'en-US' && /Alex|Male/i.test(v.name),
                        },
                        {
                          id: 'ru-female',
                          label: '🇷🇺 Russian',
                          filter: (v: SpeechSynthesisVoice) => v.lang === 'ru-RU',
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          className="block w-full text-left px-3 py-[10px] sm:py-1.5 hover:bg-[var(--accent-faint)] rounded transition active:scale-[0.98] touch-manipulation"
                          onClick={() => {
                            try {
                              if (typeof window.speechSynthesis === 'undefined') {
                                alert('Speech synthesis is not supported in this browser.');
                                return;
                              }

                              speechSynthesis.cancel();

                              const utter = new SpeechSynthesisUtterance(text);
                              const voices = speechSynthesis.getVoices();
                              const voice = voices.find(opt.filter);

                              if (voice) {
                                utter.voice = voice;
                                utter.lang = voice.lang;
                              }

                              utter.rate = 1;
                              utter.pitch = 1;
                              speechSynthesis.speak(utter);

                              utter.onstart = () => setIsSpeaking(true);
                              utter.onend = () => setIsSpeaking(false);
                              speechSynthesis.speak(utter);
                              setVoiceOpen(false);
                            } catch (e) {
                              console.warn('Speech synthesis failed:', e);
                            }
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </TooltipTrigger>

                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  Read aloud
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Mark as helpful"
                    className={`hover:text-green-500 transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded ${
                      rating === 'up' ? 'text-green-600' : ''
                    }`}
                    tabIndex={0}
                    onClick={() => handleRate('up')}
                  >
                    <ThumbsUp size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  {rating === 'up' ? 'Change rating' : 'Helpful'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Mark as not helpful"
                    className={`hover:text-red-500 transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded ${
                      rating === 'down' ? 'text-red-600' : ''
                    }`}
                    tabIndex={0}
                    onClick={() => handleRate('down')}
                  >
                    <ThumbsDown size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={6}
                  className="bg-[var(--surface-tooltip)] text-[var(--text-tooltip)] text-xs px-2 py-1 rounded shadow"
                >
                  {rating === 'down' ? 'Change rating' : 'Not helpful'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </motion.div>
  );
}
