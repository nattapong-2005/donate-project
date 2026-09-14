export interface Donation {
  id?: number | string;
  name: string;
  amount: number;
  message?: string;
  transaction_ref?: string;
  trans_ref?: string;
  slip_url?: string;
  sender_name?: string;
  sender_bank?: string;
  receiver_name?: string;
  transaction_date?: string;
  status?: string;
  created_at?: string;
  isTest?: boolean;
  isReplay?: boolean;
}

export interface Setting {
  key: string;
  value: string;
}

export interface BlacklistWord {
  id: number;
  word: string;
}

export interface User {
  id: string;
  username: string;
  password_hash?: string;
  display_name?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSession {
  userId: string;
  username: string;
  displayName: string;
  role: string;
  expiresAt: number;
}

export interface AlertSettings {
  alert_theme?: string;
  alert_font?: string;
  alert_card_bg?: string;
  alert_card_blur?: number | string;
  alert_card_width?: number | string;
  alert_border_color?: string;
  alert_border_width?: number | string;
  alert_border_radius?: number | string;
  alert_shadow_show?: string | boolean;
  alert_glow?: string | boolean;
  alert_shimmer_show?: string | boolean;
  alert_shimmer_color?: string;
  alert_icon?: string;
  alert_icon_bg?: string;
  alert_icon_color?: string;
  alert_icon_border?: string;
  alert_name_color?: string;
  alert_action_color?: string;
  alert_action_text?: string;
  alert_title_size?: number | string;
  alert_amount_bg?: string;
  alert_amount_color?: string;
  alert_amount_border?: string;
  alert_amount_size?: number | string;
  alert_msg_bg?: string;
  alert_msg_color?: string;
  alert_msg_border?: string;
  alert_msg_size?: number | string;
  alert_animation?: string;
  alert_duration?: number | string;
  alert_volume?: number | string;
  tts_enabled?: string | boolean;
  tts_min_amount?: number | string;
  promptpay_id?: string;
  receiver_name?: string;
  receiver_account?: string;
  min_donate?: string;
  slipok_branch_id?: string;
  slipok_api_key?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: number;
}
