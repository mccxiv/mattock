import { getState } from './state'
import { CONFIG_FILE } from '../constants'

export async function renderCli() {
  const state = await getState()
  const o = console.log
  const activePlotters = state.plotters.filter(p => p.active)

  console.clear()
  o('------- Plotters: ------------------------------------------------------------')
  o('   #\tpid\tphase\tpct\ttime\tjob')
  o('------------------------------------------------------------------------------')
  activePlotters.forEach((plotter, i) => {
    if (plotter.jobId) {
      o(`   ${i}\t${plotter.pid}\t${plotter.phase}\t${plotter.progress}%\t${plotter.elapsed}\t${plotter.jobName}`)
    } else {
      o(`   ${i}\t${plotter.pid}\tNo info because it was started externally`)
    }
  })
  if (!activePlotters.length) {
    o('')
    o('\tNo plotters running.')
    o('\tIf this is your first time, you need to configure Mattock.')
    o('')
    o('\tConfig file:')
    o('\t' + CONFIG_FILE)
    o('')
    o('\tBy default, concurrency on the sample job is set to 0.')
    o('\tMake sure the temporary and destination directories are ok and')
    o('\tthen increase the concurrency.')
    o('\t"concurrent": 0, <- Change this.')
    o('')
    o('\tNo need to restart Mattock. It checks the config file every 30 sec.')
    o('')
  }
  o('------------------------------------------------------------------------------')
}
