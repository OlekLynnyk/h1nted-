export function detectUserLanguage(userPrompt: string | null, fallback: string = 'en'): string {
  if (!userPrompt) return fallback;

  const text = userPrompt.trim();
  if (!text) return fallback;

  if (/^[\p{P}\p{S}\s]+$/u.test(text)) return fallback;

  if (/^(https?:\/\/|www\.)/i.test(text)) return fallback;

  if (/\p{Script=Hiragana}|\p{Script=Katakana}/u.test(text)) return 'ja';
  if (/\p{Script=Hangul}/u.test(text)) return 'ko';
  if (/\p{Script=Han}/u.test(text)) return 'zh';
  if (/\p{Script=Arabic}/u.test(text)) return 'ar';
  if (/\p{Script=Hebrew}/u.test(text)) return 'he';
  if (/\p{Script=Greek}/u.test(text)) return 'el';
  if (/\p{Script=Devanagari}/u.test(text)) return 'hi';
  if (/\p{Script=Thai}/u.test(text)) return 'th';
  if (/\p{Script=Georgian}/u.test(text)) return 'ka';
  if (/\p{Script=Armenian}/u.test(text)) return 'hy';

  if (/[а-яёіїєґ]/i.test(text)) {
    return /[іїєґ]/i.test(text) ? 'uk' : 'ru';
  }

  if (/[őű]/i.test(text)) return 'hu';
  if (/[çğıİöşü]/i.test(text)) return 'tr';
  if (
    /[ăâêôơưđ]/i.test(text) ||
    /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựíìỉĩịýỳỷỹỵđ]/i.test(text)
  ) {
    return 'vi';
  }
  if (/[ñáéíóúü]/i.test(text)) return 'es';
  if (/[ãõáâàéêíóôúç]/i.test(text)) return 'pt';
  if (/[éèêëàâîïôöùûüç]/i.test(text)) return 'fr';
  if (/[äöüß]/i.test(text)) return 'de';
  if (/[àèéìòù]/i.test(text)) return 'it';
  if (/[ąćęńóśźżł]/i.test(text)) return 'pl';
  if (/[ěščřžýáíéůú]/i.test(text)) return 'cs';
  if (/[ľščťžýáíéôŕ]/i.test(text)) return 'sk';
  if (/[șţțşâîă]/i.test(text)) return 'ro';
  if (/[åäö]/i.test(text)) return 'sv';
  if (/[åøæ]/i.test(text)) return 'no';
  if (/[äöå]/i.test(text)) return 'fi';
  if (/[æøå]/i.test(text)) return 'da';
  if (/[éëïöü]/i.test(text)) return 'nl';

  if (/[a-z]/i.test(text)) return 'en';

  return fallback;
}
