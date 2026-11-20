// Точка входа рамки демки. Подключается только в демки, на этапе сборки.
// document.currentScript доступен лишь при синхронном выполнении, поэтому
// тег берём сразу, до любых обработчиков.
import { init } from './modules/demo-frame'

init(document.currentScript)
