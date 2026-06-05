import { useRef } from 'react';

// 4-digit device activation code entry. Used by the standalone /link page
// and the "Link Device" tab in Settings.
export default function DeviceCodeInput({ value, onChange, disabled, onSubmit }) {
  const inputs = useRef([]);
  const digits = value.padEnd(4, ' ').slice(0, 4).split('');

  const setDigit = (idx, char) => {
    const arr = digits.map((d) => (d === ' ' ? '' : d));
    arr[idx] = char;
    onChange(arr.join('').slice(0, 4));
  };

  const handleChange = (idx, raw) => {
    const v = raw.replace(/\D/g, '');
    if (!v) return;

    if (v.length === 1) {
      setDigit(idx, v);
      if (idx < 3) inputs.current[idx + 1]?.focus();
    } else {
      // Paste or multi-char input — distribute digits starting at idx
      const incoming = v.slice(0, 4 - idx).split('');
      const arr = digits.map((d) => (d === ' ' ? '' : d));
      incoming.forEach((c, i) => { arr[idx + i] = c; });
      const next = arr.join('').slice(0, 4);
      onChange(next);
      const nextFocus = Math.min(idx + incoming.length, 3);
      inputs.current[nextFocus]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx] && digits[idx] !== ' ') {
        setDigit(idx, '');
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
        setDigit(idx - 1, '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 3) {
      inputs.current[idx + 1]?.focus();
    } else if (e.key === 'Enter' && value.length === 4) {
      onSubmit?.();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 3)]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((i) => {
        const filled = digits[i] && digits[i] !== ' ';
        return (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i] === ' ' ? '' : digits[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            className="w-16 h-20 text-center text-3xl font-semibold rounded-xl focus:outline-none transition-all"
            style={{
              background: 'var(--bg-elev)',
              color: 'var(--fg)',
              boxShadow: filled
                ? 'inset 0 0 0 1px var(--accent)'
                : 'inset 0 0 0 1px var(--hairline-strong)',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
        );
      })}
    </div>
  );
}
