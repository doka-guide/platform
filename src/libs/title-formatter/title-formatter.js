function titleFormatter(segments) {
  return segments.filter(Boolean).join(' — ')
}

module.exports = {
  titleFormatter,
}
