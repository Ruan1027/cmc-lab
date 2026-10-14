/**
 * 唯一 ID 生成
 *
 * 不引入 uuid 依赖：题库规模在千级，时间戳 + 随机后缀足够，
 * 且能少一个依赖对开源项目是加分项。
 */
export function uid(prefix = 'p'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
