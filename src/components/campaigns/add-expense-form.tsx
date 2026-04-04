"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { addExpense, type ExpenseActionState } from "@/lib/actions/expenses";
import { Plus, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface AddExpenseFormProps {
  campaignId: number;
  startDate: string;
  endDate: string;
}

const initialState: ExpenseActionState = {};

export function AddExpenseForm({
  campaignId,
  startDate,
  endDate,
}: AddExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(
    addExpense,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const today = format(new Date(), "yyyy-MM-dd");
  const defaultDate = today >= startDate && today <= endDate ? today : startDate;

  return (
    <section className="mb-10">
      <div className="bg-surface-container border border-outline-variant/15 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-ds-primary/10 text-ds-primary flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm uppercase tracking-wider font-sora">
              Adicionar Gasto
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-on-surface-variant transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="px-6 pb-6 pt-2">
            <form
              ref={formRef}
              action={formAction}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <input type="hidden" name="campaignId" value={campaignId} />

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                  Descrição
                </label>
                <input
                  name="description"
                  type="text"
                  required
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-ds-primary text-sm placeholder:text-on-surface-variant/50 px-0 py-2 font-sora text-on-surface"
                  placeholder="Ex: Supermercado"
                />
                {state.error?.description && (
                  <p className="text-xs text-error mt-1">
                    {state.error.description[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-2 text-xs font-mono text-on-surface-variant">
                    R$
                  </span>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-ds-primary text-sm font-mono pl-6 py-2 text-on-surface"
                    placeholder="0,00"
                  />
                </div>
                {state.error?.amount && (
                  <p className="text-xs text-error mt-1">
                    {state.error.amount[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-on-surface-variant block mb-1">
                  Data
                </label>
                <input
                  name="date"
                  type="date"
                  defaultValue={defaultDate}
                  min={startDate}
                  max={endDate}
                  required
                  className="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-ds-primary text-sm font-mono px-0 py-2 text-on-surface"
                />
                {state.error?.date && (
                  <p className="text-xs text-error mt-1">
                    {state.error.date[0]}
                  </p>
                )}
              </div>

              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-ds-primary text-on-primary py-2.5 px-6 rounded font-bold text-xs uppercase tracking-widest shadow-lg shadow-ds-primary/10 font-sora disabled:opacity-50"
                >
                  {isPending ? "Registrando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
