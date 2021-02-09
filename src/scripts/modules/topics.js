// Topics

const buttons = document.querySelectorAll('.search__button');

[...buttons].forEach(button => {
  button.addEventListener('click', () => {
    let pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', !pressed);
  });
});
