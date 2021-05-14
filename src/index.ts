import * as execa from 'execa'
import { readFileSync } from 'jsonfile'
import * as psList from 'ps-list'
import * as path from 'path'

init()

async function init () {
  await tick()
  // setInterval(tick, 30000)
}

async function tick () {
  const config = readFileSync(path.join(__dirname, '../config.json'))
  const processes = await psList()
  const plotters = processes.filter(process => process.name === 'chia.exe')
  console.log(plotters)
}
