// import type { ReactNode } from 'react';

// /**
//  * 텍스트에서 keyword와 일치하는 부분을 <mark>로 감싸 형광펜 효과를 줍니다.
//  * 대소문자 무시. keyword가 비어있으면 원본 그대로 반환.
//  */
// export function highlight(text: string, keyword: string): ReactNode {
//   const kw = keyword.trim();
//   if (!kw) return text;

//   const lower = text.toLowerCase();
//   const lowerKw = kw.toLowerCase();
//   const parts: ReactNode[] = [];
//   let start = 0;
//   let idx = lower.indexOf(lowerKw, start);

//   if (idx === -1) return text;

//   let key = 0;
//   while (idx !== -1) {
//     if (idx > start) parts.push(text.slice(start, idx));
//     parts.push(
//       <mark className="hl" key={key++}>
//         {text.slice(idx, idx + kw.length)}
//       </mark>,
//     );
//     start = idx + kw.length;
//     idx = lower.indexOf(lowerKw, start);
//   }
//   if (start < text.length) parts.push(text.slice(start));

//   return parts;
// }

import type { ReactNode } from 'react';

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 텍스트에서 keyword와 일치하는 부분을 <mark>로 감싸 형광펜 효과를 줍니다.
 * keyword는 공백으로 분리해 단어별로 매칭합니다. 대소문자 무시.
 */
export function highlight(text: string, keyword: string): ReactNode {
  const terms = keyword.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;

  const lowerSet = new Set(terms.map((t) => t.toLowerCase()));
  const re = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');

  return text.split(re).map((part, i) =>
    lowerSet.has(part.toLowerCase())
      ? <mark className="hl" key={i}>{part}</mark>
      : <span key={i}>{part}</span>,
  );
}