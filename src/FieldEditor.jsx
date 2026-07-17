import React from 'react';
import { TYPES } from '@xeplr/schema-handler';

/**
 * Edit a single field definition.
 * Props:
 *   field       — { name, type, required, default, description, order }
 *   onChange(nextField)
 *   onRemove()   — optional
 */
export function FieldEditor({ field = {}, onChange, onRemove }) {
  const set = (k, v) => onChange && onChange({ ...field, [k]: v });
  const defaultInput = (() => {
    const t = field.type || 'string';
    if (t === 'boolean') return (
      <input type="checkbox" checked={!!field.default} onChange={(e) => set('default', e.target.checked)} />
    );
    if (t === 'number') return (
      <input
        type="number"
        className="xeplr-shf-input"
        value={field.default ?? ''}
        onChange={(e) => set('default', e.target.value === '' ? undefined : Number(e.target.value))}
      />
    );
    return (
      <input
        type="text"
        className="xeplr-shf-input"
        value={field.default ?? ''}
        onChange={(e) => set('default', e.target.value || undefined)}
      />
    );
  })();

  return (
    <div className="xeplr-shf-field-editor">
      <div className="xeplr-shf-fe-row">
        <label className="xeplr-shf-fe-cell">
          <span>Name</span>
          <input
            type="text"
            className="xeplr-shf-input"
            value={field.name || ''}
            onChange={(e) => set('name', e.target.value)}
            placeholder="fieldName"
          />
        </label>
        <label className="xeplr-shf-fe-cell">
          <span>Type</span>
          <select
            className="xeplr-shf-input"
            value={field.type || 'string'}
            onChange={(e) => set('type', e.target.value)}
          >
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="xeplr-shf-fe-cell xeplr-shf-fe-cell--check">
          <input
            type="checkbox"
            checked={!!field.required}
            onChange={(e) => set('required', e.target.checked)}
          />
          <span>Required</span>
        </label>
        <label className="xeplr-shf-fe-cell xeplr-shf-fe-cell--order">
          <span>Order</span>
          <input
            type="number"
            className="xeplr-shf-input"
            value={field.order ?? ''}
            onChange={(e) => set('order', e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </label>
        {onRemove && (
          <button type="button" className="xeplr-shf-fe-remove" onClick={onRemove} title="Remove field">
            ×
          </button>
        )}
      </div>
      <div className="xeplr-shf-fe-row">
        <label className="xeplr-shf-fe-cell xeplr-shf-fe-cell--wide">
          <span>Description</span>
          <input
            type="text"
            className="xeplr-shf-input"
            value={field.description || ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </label>
        <label className="xeplr-shf-fe-cell">
          <span>Default</span>
          {defaultInput}
        </label>
      </div>
    </div>
  );
}
