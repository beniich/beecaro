"use client";

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { moveDeal } from '@/app/actions/crm.actions';
import { GripVertical, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

type Deal = {
  id: string;
  name: string;
  amount: number;
  status: string;
  stage: string;
  probability: number;
  currency: string;
  contact: { firstName: string; lastName: string };
};

const COLUMNS = [
  { id: 'PIPELINE',    label: 'Pipeline',     color: 'border-zinc-700', badge: 'bg-zinc-800 text-zinc-300' },
  { id: 'QUALIFIED',   label: 'Qualifié',     color: 'border-blue-700/50', badge: 'bg-blue-500/10 text-blue-400' },
  { id: 'PROPOSAL',    label: 'Proposition',  color: 'border-violet-700/50', badge: 'bg-violet-500/10 text-violet-400' },
  { id: 'NEGOTIATION', label: 'Négociation',  color: 'border-orange-700/50', badge: 'bg-orange-500/10 text-orange-400' },
  { id: 'WON',         label: 'Gagné ✓',      color: 'border-green-700/50', badge: 'bg-green-500/10 text-green-400' },
];

function DealCard({ deal, isDragging }: { deal: Deal; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-700 transition-colors select-none"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-100 leading-snug">{deal.name}</p>
          <p className="text-xs text-zinc-500 mt-1 font-mono">{deal.contact.firstName} {deal.contact.lastName}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="font-mono text-sm font-bold text-brand-cyan">
              {deal.amount.toLocaleString('fr-FR')} €
            </span>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
              {deal.probability}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealsClient({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeDeal = deals.find(d => d.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // If dropped on a column (not another card), move the deal to that column
    const targetColumn = COLUMNS.find(c => c.id === over.id);
    if (targetColumn) {
      const draggedDeal = deals.find(d => d.id === active.id);
      if (draggedDeal && draggedDeal.status !== targetColumn.id) {
        // Optimistic update
        setDeals(prev => prev.map(d => d.id === active.id ? { ...d, status: targetColumn.id } : d));
        // Persist via Server Action
        await moveDeal(String(active.id), targetColumn.id).catch(console.error);
      }
    }
  }

  const totalPipeline = deals.filter(d => !['WON', 'LOST'].includes(d.status)).reduce((sum, d) => sum + d.amount, 0);
  const totalWon = deals.filter(d => d.status === 'WON').reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="relative min-h-full bg-zinc-950 text-zinc-100 font-sans p-6 lg:p-8 flex flex-col gap-6 max-w-[1800px] mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display uppercase text-zinc-50 flex items-center gap-3">
            Pipeline CRM
            <span className="text-xs font-mono px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded normal-case">
              dnd-kit
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg">
            <div className="text-zinc-500 text-[10px] uppercase mb-1">Pipeline Total</div>
            <div className="font-bold text-white">{totalPipeline.toLocaleString('fr-FR')} €</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg">
            <div className="text-green-500/60 text-[10px] uppercase mb-1">Gagné</div>
            <div className="font-bold text-green-400">{totalWon.toLocaleString('fr-FR')} €</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1" style={{ alignItems: 'flex-start' }}>
          {COLUMNS.map(column => {
            const columnDeals = deals.filter(d => d.status === column.id);
            const columnTotal = columnDeals.reduce((sum, d) => sum + d.amount, 0);
            
            return (
              <div
                key={column.id}
                className={clsx("flex flex-col gap-3 min-w-[280px] w-[280px] shrink-0")}
              >
                {/* Column Header */}
                <div className={clsx(
                  "bg-zinc-900 border-t-2 rounded-xl px-4 py-3",
                  column.color
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs uppercase text-zinc-300">{column.label}</span>
                    <span className={clsx("text-[10px] font-mono px-2 py-0.5 rounded font-bold", column.badge)}>
                      {columnDeals.length}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 font-mono">{columnTotal.toLocaleString('fr-FR')} €</div>
                </div>

                {/* Drop zone for the column */}
                <div
                  id={column.id}
                  className="flex flex-col gap-2 min-h-[200px] rounded-xl p-2 bg-zinc-900/20 border border-dashed border-zinc-800/60"
                >
                  <SortableContext items={columnDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    {columnDeals.map(deal => (
                      <DealCard key={deal.id} deal={deal} isDragging={activeId === deal.id} />
                    ))}
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="bg-zinc-900 border border-brand-cyan rounded-xl p-4 shadow-2xl shadow-brand-cyan/20 rotate-1">
              <p className="text-sm font-semibold text-zinc-100">{activeDeal.name}</p>
              <p className="text-xs text-zinc-500 mt-1">{activeDeal.amount.toLocaleString('fr-FR')} €</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
