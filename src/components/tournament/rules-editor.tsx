'use client';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DEFAULT_RULES } from '@/lib/constants';
import { getGroupedRules, getRuleMeta } from '@/lib/rules-metadata';
import { RotateCcw } from 'lucide-react';

interface RulesEditorProps {
  sportType: string;
  rules: Record<string, unknown>;
  onRulesChange: (rules: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function RulesEditor({ sportType, rules, onRulesChange, readOnly = false }: RulesEditorProps) {
  const grouped = getGroupedRules(sportType);

  const updateRule = (key: string, value: unknown) => {
    onRulesChange({ ...rules, [key]: value });
  };

  const resetGroup = (keys: string[]) => {
    const defaults = DEFAULT_RULES[sportType] || {};
    const updated = { ...rules };
    for (const key of keys) {
      if (defaults[key] !== undefined) {
        updated[key] = defaults[key];
      }
    }
    onRulesChange(updated);
  };

  // If no metadata for this sport, fall back to generic rendering
  if (grouped.length === 0) {
    return (
      <div className="space-y-3">
        {Object.entries(rules).map(([key, value]) => (
          <GenericRuleField
            key={key}
            ruleKey={key}
            value={value}
            sportType={sportType}
            readOnly={readOnly}
            onChange={(v) => updateRule(key, v)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ group, keys }) => (
        <div key={group}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{group}</h4>
            {!readOnly && (
              <button
                type="button"
                onClick={() => resetGroup(keys)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RotateCcw size={10} />
                Reset
              </button>
            )}
          </div>
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            {keys.map((key) => {
              const value = rules[key];
              if (value === undefined) return null;
              return (
                <GenericRuleField
                  key={key}
                  ruleKey={key}
                  value={value}
                  sportType={sportType}
                  readOnly={readOnly}
                  onChange={(v) => updateRule(key, v)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function GenericRuleField({
  ruleKey,
  value,
  sportType,
  readOnly,
  onChange,
}: {
  ruleKey: string;
  value: unknown;
  sportType: string;
  readOnly: boolean;
  onChange: (value: unknown) => void;
}) {
  const meta = getRuleMeta(sportType, ruleKey);
  const isBool = typeof value === 'boolean';
  const isString = typeof value === 'string';

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <label className="text-sm font-medium text-gray-700">{meta.label}</label>
        {meta.description && (
          <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
        )}
      </div>

      {isBool ? (
        <button
          type="button"
          role="switch"
          aria-checked={value as boolean}
          disabled={readOnly}
          onClick={() => onChange(!value)}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
            readOnly ? 'cursor-default opacity-60' : 'cursor-pointer',
            value ? 'bg-emerald-500' : 'bg-gray-200'
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
              value ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      ) : isString ? (
        <div className="flex items-center gap-2">
          {readOnly ? (
            <span className="text-sm font-mono text-gray-700">{String(value)}</span>
          ) : (
            <select
              value={String(value)}
              onChange={(e) => onChange(e.target.value)}
              className="w-24 h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            >
              {ruleKey === 'clockDirection' && (
                <>
                  <option value="up">Up</option>
                  <option value="down">Down</option>
                </>
              )}
              {ruleKey !== 'clockDirection' && (
                <option value={String(value)}>{String(value)}</option>
              )}
            </select>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {readOnly ? (
            <span className="text-sm font-mono text-gray-700">
              {String(value)}{meta.unit ? ` ${meta.unit}` : ''}
            </span>
          ) : (
            <>
              <Input
                type="number"
                value={String(value ?? '')}
                onChange={(e) => onChange(Number(e.target.value))}
                min={meta.min}
                max={meta.max}
                step={meta.step || 1}
                className="w-24 h-9 text-right"
              />
              {meta.unit && (
                <span className="text-xs text-gray-400 w-8">{meta.unit}</span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
