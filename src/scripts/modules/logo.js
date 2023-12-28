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
      symbols: rootElement.querySelector('.logo__symbols'),
    }

    this._isAnimation = false
  }

  setFocusOnElement() {
    this.refs.symbols.innerHTML =
      'U<span class="logo__eye">&gt;</span><span class="logo__nose">ᴥ</span><span class="logo__eye">&lt;</span>U'
  }

  unsetFocusOnElement() {
    this.refs.symbols.innerHTML =
      'U<span class="logo__eye">•</span><span class="logo__nose">ᴥ</span><span class="logo__eye">•</span>U'
  }

  startAnimation() {
    if (this._isAnimation) {
      return
    }
    this._isAnimation = true
    this.refs.image.classList.add(Logo.constants.animationStateClass)
  }

  endAnimation() {
    const isSearchPage = window.location.pathname.indexOf('/search/') > -1
    let logoImage
    let firstResultColor

    if (isSearchPage) {
      logoImage = document.querySelector('.logo__image')
      firstResultColor = document?.querySelector('.search-hit')?.getAttribute('style')
    } else {
      logoImage = document.querySelectorAll('.logo__image')[1]
      firstResultColor = document?.querySelector('.suggestion-list__item')?.getAttribute('style')
    }

    if (firstResultColor) {
      logoImage.setAttribute('style', `${firstResultColor}`)
    } else {
      logoImage.removeAttribute('style')
    }

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
