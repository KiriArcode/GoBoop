import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // For now, default to Russian. In the future, this will be determined by:
  // 1. Telegram initData.user.language_code
  // 2. navigator.language
  // 3. Fallback to "ru"
  const locale = "ru";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
