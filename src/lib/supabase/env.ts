const cleanEnvValue = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export function getSupabaseEnv() {
  const isServer = typeof window === "undefined";
  const url =
    (isServer ? cleanEnvValue(process.env.SUPABASE_URL) : undefined) ??
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey =
    (isServer ? cleanEnvValue(process.env.SUPABASE_ANON_KEY) : undefined) ??
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    (isServer ? cleanEnvValue(process.env.SUPABASE_PUBLISHABLE_KEY) : undefined);

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, anonKey };
}

export function getServiceRoleKey() {
  const serviceKey =
    cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ??
    cleanEnvValue(process.env.SUPABASE_SERVICE_KEY) ??
    cleanEnvValue(process.env.SUPABASE_SECRET_KEY);

  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return serviceKey;
}
