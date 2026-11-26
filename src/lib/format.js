const formatters = {}

export function formatPrice(value, lang) {
  formatters[lang] ??= new Intl.NumberFormat(lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  })
  return formatters[lang].format(value)
}

export function formatNumber(value, lang) {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar' : lang).format(value)
}
