// Сочетание с модификатором вместо одиночной «/»: одиночную клавишу легко нажать случайно,
// и она мешала печатать в полях форм (WCAG 2.1.4, #1076). Сочетание не печатает символ,
// поэтому работает и из полей ввода.
// code, а не key: в русской раскладке key для этой клавиши — «л».
export function isSearchHotkey(event) {
  return (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.code === 'KeyK'
}

export function getModifierLabel(platform) {
  return /mac|iphone|ipad/i.test(platform) ? '⌘' : 'Ctrl'
}

// Подсказка о смене клавиши временная: после этой даты её не видит никто, и код можно удалять
export const HOTKEY_NOTICE_END = new Date('2027-03-01')

export function shouldShowHotkeyNotice(storedValue, now) {
  return storedValue !== 'CLOSED' && now < HOTKEY_NOTICE_END
}
