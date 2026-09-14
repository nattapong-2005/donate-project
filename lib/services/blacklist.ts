import { supabaseAdmin } from '../supabaseAdmin';

/**
 * Filter vulgar / prohibited words from message
 * @param message
 * @returns filtered message
 */
export async function filterMessage(message: string): Promise<string> {
  if (!message || typeof message !== 'string') return '';

  let filtered = message;
  try {
    const { data: words } = await supabaseAdmin
      .from('blacklist')
      .select('word');

    if (words && words.length > 0) {
      for (const item of words) {
        if (!item.word) continue;
        const regex = new RegExp(item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        filtered = filtered.replace(regex, '***');
      }
    }
  } catch (err: any) {
    console.warn('Error filtering blacklist message:', err.message);
  }

  return filtered;
}
