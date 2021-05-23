import { getState } from './state'
import { CONFIG_FILE, VERSION } from '../constants'
import { getConfig } from './util'

export async function renderCli() {
  const state = await getState()
  const config = getConfig()
  const o = console.log
  const activePlotters = state.plotters.filter(p => p.active)
  const totalConcurrency = config.jobs.reduce((acc, job) => acc + job.concurrent, 0)

  console.clear()
  o(`------- Plotters: ------------------------------------------------- v${VERSION} ---`)
  o('   #\tpid\tphase\tpct\ttime\tjob')
  o('------------------------------------------------------------------------------')
  activePlotters.forEach((plotter, i) => {
    if (plotter.jobId) {
      o(`   ${i}\t${plotter.pid}\t${plotter.phase}\t${plotter.progress}%\t${plotter.elapsed}\t${plotter.jobName}`)
    } else {
      o(`   ${i}\t${plotter.pid}\tNo info because it was started by another program`)
    }
  })
  if (activePlotters.length === 0) {
    o('')
    o('\tNo plotters are running.')
    o('')
  }
  o('------------------------------------------------------------------------------')
  if (totalConcurrency === 0 || config.maxConcurrentGlobal === 0) {
    o('')
    o('\tYour config file has no concurrency!')
    o('\tIf this is your first time, you must edit the config file so that')
    o('\tMattock will start spawning plotters.')
    o('')
    o('\tConfig file:')
    o('\t' + CONFIG_FILE)
    o('')
    o('\tBy default, concurrency on the sample job is set to 0.')
    o('\tMake sure the temporary and destination directories are ok and')
    o('\tthen increase the concurrency.')
    o('\t"concurrent": 0, <- Change this.')
    o('')
    o('\tP.S. No need to restart Mattock. It checks the config every 30 sec.')
    o('')
  }
}

export function isJustCheckingVersion (): boolean {
  return process.argv.includes('--version') || process.argv.includes('-v')
}
