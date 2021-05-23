import { isJustCheckingVersion, renderCli } from './lib/cli'
import { managerTick } from './lib/manager'
import { firstTimeConfigSetup, needsSetup } from './lib/setup'
import { printVersion } from './lib/util'

init()

async function init () {
  if (needsSetup()) firstTimeConfigSetup()
  if (isJustCheckingVersion()) return printVersion()

  managerTick()
  renderCli()

  setInterval(managerTick, 30000)
  setInterval(renderCli, 10000)
}
