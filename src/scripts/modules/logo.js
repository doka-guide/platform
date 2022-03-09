class Logo {
  static get constants() {
    return {
      animationStateClass: 'logo__image--animation',
      animationName: 'logoAnimation',
    }
  }

  constructor() {
    // в шапке может быть два логотипа, поэтому берём последний
    const rootElement = Array.from(document.querySelectorAll('.logo')).pop()

    this.refs = {
      rootElement,
      image: rootElement.querySelector('.logo__image'),
    }

    this._isAnimation = false
  }

  startAnimation() {
    if (this._isAnimation) {
      return
    }
    this._isAnimation = true
    this.refs.image.classList.add(Logo.constants.animationStateClass)
  }

  endAnimation() {
    this.refs.image.addEventListener(
      'animationiteration',
      (event) => {
        if (event.animationName !== Logo.constants.animationName) {
          return
        }
        this._isAnimation = false
        this.refs.image.classList.remove(Logo.constants.animationStateClass)
      },
      { once: true }
    )
  }
}

export default new Logo()
