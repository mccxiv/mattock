import { isJustCheckingVersion, renderCli } from './lib/cli'
import { firstTimeConfigSetup, needsSetup } from './lib/setup'
import { managerTick } from './lib/manager'
import { VERSION } from './constants'

init()

async function init () {
  if (needsSetup()) firstTimeConfigSetup()
  if (isJustCheckingVersion()) return console.log(VERSION)

  managerTick()
  renderCli()

  setInterval(() => {
    managerTick()
    setTimeout(renderCli, 4000)
  }, 15000)
}
