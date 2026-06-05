'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTodos } from '@/hooks/useTodos';
import type { Todo } from '@/hooks/useTodos';

type FilterType = 'all' | 'active' | 'completed';

const TAGS = ['업무', '개발', '건강', '개인', '기타'] as const;

const TAG_COLORS: Record<string, string> = {
  업무: 'rgba(255, 32, 96, 0.15)',
  개발: 'rgba(0, 212, 255, 0.15)',
  건강: 'rgba(0, 255, 157, 0.15)',
  개인: 'rgba(123, 47, 255, 0.15)',
  기타: 'rgba(255, 255, 255, 0.08)',
};

const TAG_TEXT_COLORS: Record<string, string> = {
  업무: '#FF6B9D',
  개발: '#00D4FF',
  건강: '#00FF9D',
  개인: '#B27AFF',
  기타: '#8890B5',
};

function formatKoreanDate() {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return '늦은 밤에도 화이팅 🌙';
  if (h < 12) return '좋은 아침이에요! 화이팅 🔥';
  if (h < 18) return '오후도 열심히! 화이팅 💪';
  return '오늘 하루 수고했어요 ✨';
}

/* ── Icons ── */
const CheckIcon = () => (
  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
    <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M2 3.5h11M5.5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M6 6.5v4M9 6.5v4M3 3.5l.7 8.5a1 1 0 001 .9h5.6a1 1 0 001-.9l.7-8.5"
      stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ── Seoul Skyline decoration ── */
const SeoulSkyline = () => (
  <svg viewBox="0 0 1200 220" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="w-full" preserveAspectRatio="xMidYMax slice">
    <path
      d="M0,220 L0,160 L30,160 L30,145 L55,145 L55,160 L80,160 L80,140 L100,140 L100,155 L125,155 L125,135 L145,135 L145,150 L170,150 L170,130 L195,130 L195,145 L220,145 L220,155 L250,155 L250,140 L275,140 L275,125 L300,125 L300,140 L330,140 L330,150 L360,150 L360,135 L385,135 L385,145 L415,145 L415,130 L440,130 L440,145 L465,145 L465,155 L495,155 L495,140 L520,140 L520,130 L545,130 L545,145 L570,145 L570,155 L600,155 L600,140 L625,140 L625,130 L650,130 L650,145 L680,145 L680,155 L710,155 L710,140 L735,140 L735,130 L760,130 L760,145 L785,145 L785,155 L810,155 L810,140 L835,140 L835,130 L860,130 L860,145 L885,145 L885,155 L910,155 L910,140 L935,140 L935,150 L960,150 L960,160 L990,160 L990,145 L1015,145 L1015,160 L1045,160 L1045,150 L1070,150 L1070,160 L1100,160 L1100,150 L1130,150 L1130,160 L1160,160 L1160,165 L1200,165 L1200,220 Z"
      fill="rgba(255,32,96,0.04)"
    />
    <path
      d="M0,220 L0,175 L45,175 L45,155 L70,155 L70,145 L85,145 L85,125 L100,125 L100,115 L104,100 L107,80 L109,60 L111,40 L112,25 L113,15 L114,8 L115,4 L116,8 L117,15 L118,25 L120,40 L122,60 L124,80 L127,100 L130,115 L130,125 L150,125 L150,140 L175,140 L175,130 L200,130 L200,120 L225,120 L225,130 L250,130 L250,145 L280,145 L280,130 L305,130 L305,118 L325,118 L325,108 L340,108 L340,100 L355,100 L355,110 L375,110 L375,120 L400,120 L400,135 L430,135 L435,135 L440,120 L445,108 L450,95 L455,88 L460,82 L463,75 L465,65 L467,52 L468,40 L469,28 L470,18 L471,10 L472,5 L473,10 L474,18 L475,28 L476,40 L477,52 L479,65 L481,75 L484,82 L487,88 L492,95 L497,108 L502,120 L507,135 L530,135 L530,120 L555,120 L555,108 L580,108 L580,118 L605,118 L605,130 L630,130 L630,145 L660,145 L660,130 L685,130 L685,118 L705,118 L705,108 L718,108 L718,100 L725,100 L726,90 L728,75 L730,58 L732,42 L733,28 L734,16 L735,8 L736,3 L737,8 L738,16 L739,28 L741,42 L743,58 L745,75 L747,90 L748,100 L755,100 L755,108 L768,108 L768,118 L785,118 L785,130 L810,130 L810,118 L830,118 L830,108 L850,108 L850,100 L865,100 L865,108 L882,108 L882,118 L900,118 L900,130 L920,130 L920,145 L950,145 L950,130 L975,130 L975,120 L995,120 L995,130 L1015,130 L1015,145 L1045,145 L1045,130 L1068,130 L1068,120 L1090,120 L1090,135 L1115,135 L1115,145 L1140,145 L1140,155 L1170,155 L1170,165 L1200,165 L1200,220 Z"
      fill="rgba(255,32,96,0.08)"
    />
    <path
      d="M0,220 L0,190 L50,190 L50,178 L75,178 L75,190 L105,190 L105,180 L130,180 L130,168 L155,168 L155,180 L185,180 L185,168 L210,168 L210,158 L235,158 L235,170 L260,170 L260,182 L290,182 L315,182 L315,168 L340,168 L340,158 L365,158 L365,170 L390,170 L390,182 L415,182 L415,168 L440,168 L440,158 L460,158 L460,165 L480,165 L480,175 L510,175 L535,175 L535,165 L558,165 L558,158 L578,158 L578,165 L600,165 L600,175 L628,175 L628,165 L650,165 L650,155 L668,155 L668,168 L688,168 L688,178 L715,178 L740,178 L740,165 L762,165 L762,155 L782,155 L782,165 L802,165 L802,178 L830,178 L830,165 L852,165 L852,155 L870,155 L870,168 L890,168 L890,180 L920,180 L945,180 L945,168 L965,168 L965,160 L985,160 L985,172 L1010,172 L1010,182 L1035,182 L1035,170 L1055,170 L1055,160 L1078,160 L1078,172 L1100,172 L1100,182 L1125,182 L1125,188 L1155,188 L1155,192 L1200,192 L1200,220 Z"
      fill="rgba(255,32,96,0.05)"
    />
    {([
      [115, 35], [115, 55], [115, 75], [115, 95],
      [471, 25], [471, 45], [471, 65], [471, 85],
      [735, 15], [735, 35], [735, 55], [735, 75],
    ] as [number, number][]).map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="2.5" fill="#FF2060" opacity="0.7"
        style={{ filter: 'blur(1px)' }} />
    ))}
    <line x1="0" y1="210" x2="1200" y2="210" stroke="rgba(0,212,255,0.08)" strokeWidth="1" />
  </svg>
);

/* ── TodoItem ── */
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div
      className="glass-card rounded-xl px-4 py-3.5 flex items-center gap-3.5 group transition-all duration-200"
      style={todo.completed ? { opacity: 0.5 } : {}}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 transition-all"
        style={
          todo.completed
            ? { background: 'linear-gradient(135deg, #FF2060, #FF6B9D)', boxShadow: '0 0 10px rgba(255,32,96,0.5)' }
            : { border: '1.5px solid rgba(255,32,96,0.35)', background: 'rgba(255,32,96,0.05)' }
        }
        aria-label={todo.completed ? '완료 취소' : '완료 체크'}
      >
        {todo.completed && <CheckIcon />}
      </button>

      <span
        className="flex-1 text-sm font-medium"
        style={todo.completed ? { textDecoration: 'line-through', color: '#5E6087' } : { color: '#E2E4FF' }}
      >
        {todo.text}
      </span>

      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
        style={{
          background: TAG_COLORS[todo.tag] ?? 'rgba(255,255,255,0.08)',
          color: TAG_TEXT_COLORS[todo.tag] ?? '#8890B5',
        }}
      >
        {todo.tag}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:text-[#FF6B9D]"
        style={{ color: '#5E6087' }}
        aria-label="삭제"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

/* ── Main Component ── */
export default function TodoApp() {
  const { todos, addTodo, toggleTodo, deleteTodo, isLoaded } = useTodos();
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('업무');
  const [filter, setFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const ok = addTodo(inputText, selectedTag);
    if (ok) setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const filteredTodos = todos.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const FILTER_TABS: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: '전체', count: totalCount },
    { key: 'active', label: '진행 중', count: totalCount - completedCount },
    { key: 'completed', label: '완료', count: completedCount },
  ];

  const emptyMessage = {
    all: { icon: '🌙', text: '할일을 추가해보세요!' },
    active: { icon: '✓', text: '진행 중인 할일이 없어요' },
    completed: { icon: '🎉', text: '완료된 할일이 없어요' },
  }[filter];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#07081A' }}>
      {/* Atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,32,96,0.07) 0%, transparent 65%)' }} />
        <div className="absolute top-1/2 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(123,47,255,0.05) 0%, transparent 65%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pt-12 pb-48">
        <div className="w-full max-w-md space-y-4">

          {/* Header */}
          <div className="text-center space-y-2 pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,32,96,0.4))' }} />
              <span className="text-[10px] tracking-[0.35em] font-semibold uppercase"
                style={{ color: 'rgba(255,32,96,0.6)' }}>
                Seoul · 서울
              </span>
              <div className="h-px w-12 rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(255,32,96,0.4), transparent)' }} />
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-none"
              style={{
                background: 'linear-gradient(135deg, #FF2060 0%, #FF6B9D 40%, #00D4FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 20px rgba(255,32,96,0.3))',
              }}>
              오늘의 할 일
            </h1>
            <p className="text-sm font-medium mt-3" style={{ color: '#8890B5' }}>
              {formatKoreanDate()}
            </p>
            <p className="text-sm" style={{ color: 'rgba(226,228,255,0.45)' }}>
              {getGreeting()}
            </p>
          </div>

          {/* Stats */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black transition-all duration-500" style={{ color: '#E2E4FF' }}>
                  {isLoaded ? completedCount : '—'}
                </span>
                <span className="text-sm font-medium" style={{ color: '#5E6087' }}>
                  / {isLoaded ? totalCount : '—'} 완료
                </span>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(255,32,96,0.12)',
                  color: '#FF6B9D',
                  border: '1px solid rgba(255,32,96,0.2)',
                  boxShadow: '0 0 12px rgba(255,32,96,0.1)',
                }}>
                {isLoaded ? progress : 0}% 달성
              </div>
            </div>

            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${isLoaded ? progress : 0}%`,
                  background: 'linear-gradient(90deg, #FF2060, #FF6B9D 50%, #00D4FF)',
                  boxShadow: progress > 0 ? '0 0 10px rgba(255,32,96,0.7), 0 0 20px rgba(255,32,96,0.3)' : 'none',
                }} />
            </div>

            <div className="flex items-center gap-4 text-xs font-medium" style={{ color: '#5E6087' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full"
                  style={{ background: '#FF2060', boxShadow: '0 0 6px rgba(255,32,96,0.8)' }} />
                완료 {isLoaded ? completedCount : 0}개
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                진행 중 {isLoaded ? totalCount - completedCount : 0}개
              </span>
            </div>
          </div>

          {/* Input */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex gap-2.5">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="새로운 할 일을 입력하세요..."
                className="flex-1 h-11 rounded-xl text-sm"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#E2E4FF',
                }}
              />
              <Button
                onClick={handleAdd}
                disabled={!inputText.trim()}
                className="h-11 px-5 rounded-xl font-bold text-sm text-white shrink-0 flex items-center gap-2 transition-all duration-200"
                style={{
                  background: inputText.trim()
                    ? 'linear-gradient(135deg, #FF2060, #FF6B9D)'
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: inputText.trim()
                    ? '0 0 18px rgba(255,32,96,0.45), 0 4px 12px rgba(255,32,96,0.2)'
                    : 'none',
                  border: 'none',
                }}
              >
                <PlusIcon />
                추가
              </Button>
            </div>

            {/* Tag selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs" style={{ color: '#5E6087' }}>태그:</span>
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-150"
                  style={{
                    background: selectedTag === tag ? TAG_COLORS[tag] : 'rgba(255,255,255,0.05)',
                    color: selectedTag === tag ? TAG_TEXT_COLORS[tag] : '#5E6087',
                    border: selectedTag === tag
                      ? `1px solid ${TAG_TEXT_COLORS[tag]}44`
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
                style={
                  filter === tab.key
                    ? {
                        background: 'rgba(255,32,96,0.15)',
                        color: '#FF6B9D',
                        border: '1px solid rgba(255,32,96,0.2)',
                        boxShadow: '0 0 10px rgba(255,32,96,0.1)',
                      }
                    : { color: '#5E6087', border: '1px solid transparent' }
                }
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                    style={{
                      background: filter === tab.key ? 'rgba(255,32,96,0.2)' : 'rgba(255,255,255,0.08)',
                      color: filter === tab.key ? '#FF6B9D' : '#5E6087',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Todo list */}
          {!isLoaded ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card rounded-xl h-14 animate-pulse" style={{ opacity: 0.4 }} />
              ))}
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="glass-card rounded-xl py-16 flex flex-col items-center gap-3">
              <span className="text-4xl" style={{ opacity: 0.25 }}>{emptyMessage.icon}</span>
              <p className="text-sm" style={{ color: '#5E6087' }}>{emptyMessage.text}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTodos.map(todo => (
                <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 pb-2">
            <p className="text-[10px] tracking-[0.3em] font-medium uppercase"
              style={{ color: 'rgba(94,96,135,0.4)' }}>
              서울특별시 · Seoul, Korea
            </p>
          </div>
        </div>
      </div>

      {/* Skyline */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-0">
        <SeoulSkyline />
      </div>
    </div>
  );
}
