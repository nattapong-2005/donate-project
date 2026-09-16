import crypto from 'crypto';
import { supabaseAdmin } from '../supabaseAdmin';
import { User, UserSession } from '../types/database';

const SESSION_SECRET = process.env.ADMIN_SECRET;
export const SESSION_MAX_AGE_SECONDS = 60*60; // 1 hour (3600 seconds)

/**
 * Hash password using PBKDF2 with a random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
}

/**
 * Generate a cryptographically signed session token
 */
export function generateSessionToken(user: { id: string; username: string; displayName?: string; role?: string }): string {
  if (!SESSION_SECRET) throw new Error('ADMIN_SECRET is required');
  const payload: UserSession = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    role: user.role || 'admin',
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and parse a signed session token
 */
export function verifySessionToken(token: string): UserSession | null {
  if (!SESSION_SECRET) return null;
  if (!token || !token.includes('.')) return null;

  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload: UserSession = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= now) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Find user in Supabase public.users table with bootstrap fallback
 */
export async function findUserByUsername(username: string): Promise<User | null> {
  const cleanUsername = (username || '').trim().toLowerCase();
  if (!cleanUsername) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        username: data.username,
        password_hash: data.password_hash,
        display_name: data.display_name,
        role: data.role,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    }
  } catch (err) {
    console.warn('[UserService] Query to users table failed or table does not exist yet:', err);
  }

  // Bootstrap Fallback: If username is 'admin', allow fallback authentication using ADMIN_SECRET
  if (cleanUsername === 'admin' && SESSION_SECRET) {
    return {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      display_name: 'Super Admin (Default)',
      role: 'admin',
      // In fallback mode, password_hash is null and compared against ADMIN_SECRET
      password_hash: undefined
    };
  }

  return null;
}

/**
 * Create a new user in Supabase public.users table
 */
export async function createUser(params: {
  username: string;
  password: string;
  displayName?: string;
  role?: string;
}): Promise<User> {
  const cleanUsername = params.username.trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
  }
  if (!params.password || params.password.length < 4) {
    throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
  }

  const hashedPassword = hashPassword(params.password);

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([
      {
        username: cleanUsername,
        password_hash: hashedPassword,
        display_name: params.displayName || cleanUsername,
        role: params.role || 'admin'
      }
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505' || error.message.includes('unique')) {
      throw new Error('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
    }
    throw new Error(`ไม่สามารถสร้างผู้ใช้ได้: ${error.message}`);
  }

  return {
    id: data.id,
    username: data.username,
    display_name: data.display_name,
    role: data.role,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

/**
 * Authenticate credentials and return user + signed token
 */
export async function authenticateUser(
  username: string,
  password: string
): Promise<{ user: User; token: string }> {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  let isValid = false;
  if (user.password_hash) {
    isValid = verifyPassword(password, user.password_hash);
  } else if (user.username === 'admin' && SESSION_SECRET) {
    // Fallback comparison with ADMIN_SECRET
    isValid = password === SESSION_SECRET;
  }

  if (!isValid) {
    throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
  }

  // Auto-seed into public.users if logged in via fallback and table is ready
  if (!user.password_hash && user.username === 'admin') {
    try {
      const hashedPassword = hashPassword(password);
      await supabaseAdmin.from('users').upsert({
        username: 'admin',
        password_hash: hashedPassword,
        display_name: 'Super Admin',
        role: 'admin'
      }, { onConflict: 'username' });
    } catch (e) {
      // Ignore if table not created yet
    }
  }

  const token = generateSessionToken({
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role
  });

  return { user, token };
}

/**
 * Get user by UUID
 */
export async function getUserById(id: string): Promise<User | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        username: data.username,
        password_hash: data.password_hash,
        display_name: data.display_name,
        role: data.role,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    }
  } catch (err) {
    console.warn('[UserService] Query user by id failed:', err);
  }

  // Fallback check
  if (id === '00000000-0000-0000-0000-000000000001' && SESSION_SECRET) {
    return {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'admin',
      display_name: 'Super Admin (Default)',
      role: 'admin',
      password_hash: undefined
    };
  }

  return null;
}

export interface UpdateProfileParams {
  userId: string;
  displayName?: string;
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}

/**
 * Update user profile details and password
 */
export async function updateUserProfile(
  params: UpdateProfileParams
): Promise<{ user: User; token: string }> {
  const { userId, displayName, username, currentPassword, newPassword } = params;

  if (!userId) {
    throw new Error('ไม่พบข้อมูลผู้ใช้');
  }

  // Find user by id or fallback
  let user = await getUserById(userId);
  if (!user && userId === '00000000-0000-0000-0000-000000000001') {
    user = await findUserByUsername('admin');
  }

  if (!user) {
    throw new Error('ไม่พบผู้ใช้งานนี้ในระบบ');
  }

  const updateData: Record<string, any> = {};

  // 1. Validate & change password if requested
  if (newPassword || currentPassword) {
    if (!currentPassword) {
      throw new Error('กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนรหัสผ่าน');
    }
    if (!newPassword || newPassword.length < 4) {
      throw new Error('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
    }

    let isValid = false;
    if (user.password_hash) {
      isValid = verifyPassword(currentPassword, user.password_hash);
    } else if (user.username === 'admin' && SESSION_SECRET) {
      isValid = currentPassword === SESSION_SECRET;
    }

    if (!isValid) {
      throw new Error('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    updateData.password_hash = hashPassword(newPassword);
  }

  // 2. Validate username if changed
  if (username !== undefined) {
    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      throw new Error('ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
    }

    if (cleanUsername !== user.username.toLowerCase()) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (existingUser && existingUser.id !== user.id) {
        throw new Error('ชื่อผู้ใช้นี้มีผู้อื่นใช้งานแล้ว');
      }

      updateData.username = cleanUsername;
    }
  }

  // 3. Validate displayName if changed
  if (displayName !== undefined) {
    const cleanDisplayName = displayName.trim();
    if (!cleanDisplayName) {
      throw new Error('ชื่อที่แสดงต้องไม่เว้นว่าง');
    }
    updateData.display_name = cleanDisplayName;
  }

  // If fallback admin was in memory (not in DB yet), upsert into table
  if (user.id === '00000000-0000-0000-0000-000000000001' && !user.password_hash) {
    const passwordToSave = updateData.password_hash || (SESSION_SECRET ? hashPassword(SESSION_SECRET) : '');
    const userToUpsert = {
      username: updateData.username || user.username,
      password_hash: passwordToSave,
      display_name: updateData.display_name || user.display_name || 'Admin',
      role: 'admin'
    };

    const { data: upsertedData, error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert(userToUpsert, { onConflict: 'username' })
      .select()
      .single();

    if (upsertError) {
      throw new Error(`บันทึกข้อมูลไม่สำเร็จ: ${upsertError.message}`);
    }

    const updatedUser: User = {
      id: upsertedData.id,
      username: upsertedData.username,
      display_name: upsertedData.display_name,
      role: upsertedData.role,
      created_at: upsertedData.created_at,
      updated_at: upsertedData.updated_at
    };

    const token = generateSessionToken({
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.display_name,
      role: updatedUser.role
    });

    return { user: updatedUser, token };
  }

  // Regular user update
  if (Object.keys(updateData).length > 0) {
    updateData.updated_at = new Date().toISOString();

    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`บันทึกข้อมูลไม่สำเร็จ: ${updateError.message}`);
    }

    const updatedUser: User = {
      id: updatedData.id,
      username: updatedData.username,
      display_name: updatedData.display_name,
      role: updatedData.role,
      created_at: updatedData.created_at,
      updated_at: updatedData.updated_at
    };

    const token = generateSessionToken({
      id: updatedUser.id,
      username: updatedUser.username,
      displayName: updatedUser.display_name,
      role: updatedUser.role
    });

    return { user: updatedUser, token };
  }

  // If no fields changed, return existing user + new token
  const token = generateSessionToken({
    id: user.id,
    username: user.username,
    displayName: user.display_name,
    role: user.role
  });

  return { user, token };
}

