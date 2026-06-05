/*
 * AnimatedPrice — animates a price as the plan toggles.
 *
 * variant="odometer" (PRIMARY): each digit rolls independently like a counter,
 *   leading digits grow/shrink in width; the /period slides vertically.
 * variant="slide" (SECONDARY): the whole price scrolls up/down as one block.
 *
 * `pricing` shape: { monthly: { price, period }, yearly: { price, period } }
 */

const fmt2 = (n) => n.toFixed(2);

// One vertical 0–9 strip; translateY shows the target digit.
// digit === null → a "blank" slot that collapses its width (for absent leading digits).
function DigitColumn({ digit }) {
  const blank = digit == null;
  const target = blank ? 0 : digit;
  return (
    <span className="odo-col" style={{ width: blank ? '0ch' : '1ch', opacity: blank ? 0 : 1 }}>
      <span className="odo-strip" style={{ transform: `translateY(-${target * 10}%)` }}>
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="odo-digit" style={{ width: '1ch' }}>{n}</span>
        ))}
      </span>
    </span>
  );
}

function PeriodSwitch({ monthly, yearly, billing }) {
  return (
    <span className="odo-period text-muted text-sm ml-1.5">
      <span className="odo-period-track" data-period={billing === 'yearly' ? 'year' : 'month'}>
        <span className="odo-period-cell">/ {monthly}</span>
        <span className="odo-period-cell">/ {yearly}</span>
      </span>
    </span>
  );
}

export default function AnimatedPrice({ pricing, billing, variant = 'odometer' }) {
  const cur = pricing[billing];

  // SECONDARY: whole-price vertical slide.
  if (variant === 'slide') {
    return (
      <div className="price-window">
        <div className="price-track" data-billing={billing}>
          {['monthly', 'yearly'].map((k) => (
            <div className="price-cell" key={k}>
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-bold tracking-tight">${pricing[k].price}</span>
                <span className="text-muted text-sm">/ {pricing[k].period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PRIMARY: per-digit odometer.
  const maxInt = Math.max(
    String(Math.floor(pricing.monthly.price)).length,
    String(Math.floor(pricing.yearly.price)).length,
  );
  const intStr = String(Math.floor(cur.price));
  const pad = maxInt - intStr.length;
  // Right-aligned: leading positions are blank when the current value is shorter.
  const intDigits = Array.from({ length: maxInt }, (_, i) => (i < pad ? null : Number(intStr[i - pad])));
  const fracDigits = fmt2(cur.price).split('.')[1].split('').map(Number);

  return (
    <span className="aprice text-5xl font-bold">
      <span>$</span>
      <span className="aprice-int">
        {/* key by place value so each slot persists across toggles */}
        {intDigits.map((d, i) => <DigitColumn key={`int-${maxInt - i}`} digit={d} />)}
      </span>
      <span>.</span>
      <span className="aprice-frac">
        {fracDigits.map((d, i) => <DigitColumn key={`frac-${i}`} digit={d} />)}
      </span>
      <PeriodSwitch monthly={pricing.monthly.period} yearly={pricing.yearly.period} billing={billing} />
    </span>
  );
}
