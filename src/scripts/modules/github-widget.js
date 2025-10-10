async function init() {
  const stargazers = document.querySelector('.github-widget__stargazers')

  if (!stargazers) return

  try {
    const response = await fetch('https://api.github.com/repos/doka-guide/content')
    const { stargazers_count: stargazersCount } = await response.json()

    stargazers.textContent =
      stargazersCount < 1000 ? stargazersCount : `${(stargazersCount / 1000).toFixed(1).replace(/\.0$/, '')}к`
  } catch (error) {
    console.error('Не получилось сформировать число звёзд репозитория контента.', error)
  }
}

init()
