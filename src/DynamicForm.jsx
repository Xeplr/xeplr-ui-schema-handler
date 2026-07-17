import React from 'react';

/**
 * Render form inputs from a schema array.
 *
 * Props:
 *   schema  — [{name, type, required, default, description, order}]
 *   value   — { [name]: value }
 *   onChange(nextValue)   — full-form change (called with the new value object)
 *   errors  — optional { [name]: 'error message' } for inline field errors
 *   disabled — optional boolean, disables all inputs
 *   labels  — optional { [name]: 'Custom Label' } to override display labels
 */
export function DynamicForm({ schema = [], value = {}, onChange, errors = {}, disabled = false, labels = {} }) {
  const fields = [...(schema || [])]
    .filter(f => f && f.name)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const setField = (name, next) => {
    onChange && onChange({ ...value, [name]: next });
  };

  return (
    <div className="xeplr-shf-form">
      {fields.map(field => (
        <FieldRow
          key={field.name}
          field={field}
          label={labels[field.name] ?? humanize(field.name)}
          value={value[field.name]}
          onChange={(v) => setField(field.name, v)}
          error={errors[field.name]}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function FieldRow({ field, label, value, onChange, error, disabled }) {
  return (
    <label className={`xeplr-shf-field${error ? ' xeplr-shf-field--error' : ''}`}>
      <span className="xeplr-shf-label">
        {label}
        {field.required && <span className="xeplr-shf-required" title="Required">*</span>}
        <span className="xeplr-shf-type">{field.type || 'string'}</span>
      </span>
      {field.description && <span className="xeplr-shf-desc">{field.description}</span>}
      <Input field={field} value={value} onChange={onChange} disabled={disabled} />
      {error && <span className="xeplr-shf-err">{error}</span>}
    </label>
  );
}

function Input({ field, value, onChange, disabled }) {
  const common = { disabled, className: 'xeplr-shf-input' };
  const t = field.type || 'string';
  const shown = value ?? field.default ?? '';

  if (t === 'boolean') {
    return (
      <input
        type="checkbox"
        className="xeplr-shf-input xeplr-shf-input--check"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
    );
  }
  if (t === 'number') {
    return (
      <input
        type="number"
        {...common}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    );
  }
  if (t === 'date') {
    // input type=date wants yyyy-mm-dd
    const iso = value ? String(value).slice(0, 10) : '';
    return <input type="date" {...common} value={iso} onChange={(e) => onChange(e.target.value)} />;
  }
  if (t === 'object' || t === 'array') {
    // v1: JSON textarea. Nested sub-forms come later.
    return <JsonInput common={common} value={value} onChange={onChange} kind={t} />;
  }
  // string (default)
  return (
    <input
      type="text"
      {...common}
      value={shown ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function JsonInput({ common, value, onChange, kind }) {
  const [draft, setDraft] = React.useState(() => stringify(value));
  const [err, setErr] = React.useState(null);
  React.useEffect(() => { setDraft(stringify(value)); setErr(null); }, [value]);
  const commit = (text) => {
    setDraft(text);
    if (text.trim() === '') { onChange(kind === 'array' ? [] : {}); setErr(null); return; }
    try { onChange(JSON.parse(text)); setErr(null); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="xeplr-shf-json">
      <textarea
        {...common}
        className="xeplr-shf-input xeplr-shf-input--json"
        rows={4}
        value={draft}
        onChange={(e) => commit(e.target.value)}
        placeholder={kind === 'array' ? '[]' : '{}'}
      />
      {err && <span className="xeplr-shf-err">Invalid JSON: {err}</span>}
    </div>
  );
}

function stringify(v) {
  if (v === undefined || v === null) return '';
  try { return JSON.stringify(v, null, 2); } catch { return ''; }
}

function humanize(name) {
  return String(name)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}
