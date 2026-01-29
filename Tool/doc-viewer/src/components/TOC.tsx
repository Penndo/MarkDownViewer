'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface TOCProps {
  content: string;
}


interface Heading {
  id: string;
  text: string;
  level: number;
}

export const TOC = ({ content }: TOCProps) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  // 增加手动点击锁，防止点击滚动时 Observer 立即覆盖 ActiveId
  const [isManualScroll, setIsManualScroll] = useState(false);

  useEffect(() => {
    // ... (Regex logic remains the same, but omitted for brevity in search/replace if possible, 
    // but I need to replace the whole file or component to be safe or just use context)
    // Actually, I'll just replace the component body logic.
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    // ... existing parsing logic ...
    const found: Heading[] = [];
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      found.push({ id: '', text: match[2].trim(), level: match[1].length });
    }

    const updateHeadings = () => {
        const elements = Array.from(document.querySelectorAll('h1, h2, h3'))
            .filter(el => el.closest('.prose')); 
        const domHeadings = elements.map(el => ({
            id: el.id,
            text: el.textContent || '',
            level: parseInt(el.tagName.substring(1))
        }));
        if (domHeadings.length > 0) setHeadings(domHeadings);
    };
    const timer = setTimeout(updateHeadings, 100);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    if (isManualScroll) return; // Skip observer if manual scrolling

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { 
        // 调整 rootMargin：从顶部 0px 开始检测，覆盖顶部 20% 的区域
        // 这样即使 scrollIntoView 滚动到最顶部 (0px)，元素也包含在检测区域内
        rootMargin: '0px 0px -80% 0px',
        threshold: 0
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, isManualScroll]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsManualScroll(true);
    setActiveId(id);
    
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    
    // 1秒后解除锁定 (平滑滚动通常在几百毫秒内完成)
    setTimeout(() => {
      setIsManualScroll(false);
    }, 1000);
  };

  if (headings.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0 border-l border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
      <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-gray-100">On this page</h4>
      <ul className="space-y-2.5 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              className={clsx(
                "block transition-colors border-l-2 pl-3 -ml-px",
                activeId === heading.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400 font-medium"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              onClick={(e) => handleClick(e, heading.id)}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
