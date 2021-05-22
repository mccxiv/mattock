import { renderCli } from './lib/cli'
import { managerTick } from './lib/manager'
import { firstTimeConfigSetup, needsSetup } from './lib/setup'

init()

async function init () {
  if (needsSetup()) firstTimeConfigSetup()

  managerTick()
  renderCli()

  setInterval(managerTick, 30000)
  setInterval(renderCli, 10000)
}
