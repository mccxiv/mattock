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

  setInterval(async () => {
    try {await managerTick()} catch (e) {console.log(e)}
    setTimeout(async () => {
      try {await renderCli()} catch (e) {console.log(e)}
    }, 4000)
  }, 15000)
}
