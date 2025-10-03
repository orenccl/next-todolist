import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * 加密密碼
 * @param password 明文密碼
 * @returns 加密後的密碼哈希
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 驗證密碼
 * @param password 明文密碼
 * @param hashedPassword 加密後的密碼哈希
 * @returns 密碼是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
