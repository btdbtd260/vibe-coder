import { useRef } from 'react';
import { formatNum } from '../utils/math';
import type { BigNum } from '../utils/BigNum';

export default function ResourceHero({ lines, scientific }: { lines: BigNum; scientific: boolean }) {
  const prevStr = useRef(formatNum(lines, scientific));
  const curStr = formatNum(lines, scientific);
  const pulsing = curStr !== prevStr.current;
  if (pulsing) prevStr.current = curStr;

  return (
    <div className="text-center mb-3">
      <span className="text-[0.65rem] text-dark-300 uppercase tracking-[2px]">Lines of Code</span>
      <div className={`text-4xl lg:text-5xl font-bold text-neon-300 tracking-tighter leading-tight ${pulsing ? 'value-pulse' : ''}`}>
        {curStr}
      </div>
    </div>
  );
}
