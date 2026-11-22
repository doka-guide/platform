// Сочетание с модификатором вместо одиночной «/»: одиночную клавишу легко нажать случайно,
// и она мешала печатать в полях форм (WCAG 2.1.4, #1076). Сочетание не печатает символ,
// поэтому работает и из полей ввода.
// code, а не key: в русской раскладке key для этой клавиши — «л».
export function isSearchHotkey(event) {
  return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.code === 'KeyK'
}

// Подсказка о смене клавиши временная: после этой даты её не видит никто, и код можно удалять
export const HOTKEY_NOTICE_END = new Date('2027-03-01')

// Новичку о замене рассказывать незачем: про «/» он не знал. Новичка выдаёт непринятый баннер о куках —
// кто бывал на Доке раньше, его уже принял
export function shouldShowHotkeyNotice({ storedValue, isCookieAccepted, now }) {
  return isCookieAccepted && storedValue !== 'CLOSED' && now < HOTKEY_NOTICE_END
}
