/**
 * 内置题库加载
 *
 * 题目以 Markdown 存放在 data/bank/，构建时由 Vite 以原始文本打包，运行时解析。
 * 好处：新增试题 = 往目录里丢一个 .md，零构建配置，社区贡献门槛最低。
 */
import type { Problem } from '../types';
import { parseMarkdown } from '../core/parser';

const modules = import.meta.glob('./bank/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/** 内置题库文件名列表（用于「题库」页展示来源） */
export const BANK_FILES: string[] = Object.keys(modules)
  .map((p) => p.replace('./bank/', ''))
  .sort();

let cache: Problem[] | null = null;

/** 加载全部内置题目（已解析，带缓存） */
export function loadBuiltinProblems(): Problem[] {
  if (cache) return cache;
  const all = Object.values(modules).join('\n\n');
  cache = parseMarkdown(all);
  return cache;
}
