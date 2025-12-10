import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, supportedLocales, defaultLocale } from "@/lib/i18n/config";

export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies();
  let locale = cookieStore.get(LOCALE_COOKIE)?.value;
  
  // Validate and fallback
  if (!locale || !supportedLocales.includes(locale)) {
    locale = defaultLocale;
  }
  
  // Load messages for the locale
  let messages;
  try {
    messages = (await import(`@/../messages/${locale}.json`)).default;
  } catch {
    // Fall back to default locale messages
    messages = (await import(`@/../messages/${defaultLocale}.json`)).default;
  }
  
  return {
    locale,
    messages,
  };
});
