'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTodos } from '@/hooks/useTodos';
import type { Todo } from '@/hooks/useTodos';

type FilterType = 'all' | 'active' | 'completed';

const TAGS = ['업무', '개발', '건강', '개인', '기타'] as const;

const TAG_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  업무: 'default',
  개발: 'secondary',
  건강: 'outline',
  개인: 'outline',
  기타: 'outline',
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

/* ── TodoItem ── */
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 group">
      <Checkbox
        id={todo.id}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
      />
      <label
        htmlFor={todo.id}
        className={`flex-1 text-sm cursor-pointer leading-none ${
          todo.completed ? 'line-through text-muted-foreground' : ''
        }`}
      >
        {todo.text}
      </label>
      <Badge variant={TAG_VARIANT[todo.tag] ?? 'outline'} className="text-xs shrink-0">
        {todo.tag}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(todo.id)}
        aria-label="삭제"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
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

  const emptyMessages = {
    all: '할일을 추가해보세요!',
    active: '진행 중인 할일이 없어요',
    completed: '완료된 할일이 없어요',
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg space-y-5">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">오늘의 할 일</h1>
          <p className="text-sm text-muted-foreground">{formatKoreanDate()} · {getGreeting()}</p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">진행률</span>
              <span className="font-semibold">
                {isLoaded ? `${completedCount} / ${totalCount} 완료` : '— / — 완료'}
              </span>
            </div>
            <Progress value={isLoaded ? progress : 0} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{isLoaded ? progress : 0}% 달성</p>
          </CardContent>
        </Card>

        {/* Input */}
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="새로운 할 일을 입력하세요..."
                className="flex-1"
              />
              <Button onClick={handleAdd} disabled={!inputText.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </div>

            {/* Tag selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">태그:</span>
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter tabs + List */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-5">
            <div className="flex items-center gap-1">
              {FILTER_TABS.map(tab => (
                <Button
                  key={tab.key}
                  variant={filter === tab.key ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      filter === tab.key
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="px-5 pt-1 pb-4">
            {!isLoaded ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-9 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredTodos.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {emptyMessages[filter]}
              </div>
            ) : (
              <div className="divide-y">
                {filteredTodos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
