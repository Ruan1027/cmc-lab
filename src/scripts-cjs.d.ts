/**
 * 零依赖 CJS 脚本（如 scripts/validate-bank.cjs）的类型声明。
 * 这些脚本由 CI 直接 `node` 运行，不进 Vite 构建；此处仅为 TS 类型检查提供契约。
 */
declare module '*.cjs' {
  export interface ValidationIssue {
    file: string;
    line: number;
    msg: string;
  }
  export interface ValidationResult {
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
    counts: { files: number; problems: number };
  }
  export function validateBank(bankDir?: string): ValidationResult;
  export const KNOWN_FIELDS: string[];
  export const VALID_GROUPS: string[];
}
