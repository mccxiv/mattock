import { getState } from './state'

export async function renderCli() {
  const state = await getState()
  const o = console.log

  console.clear()
  o('___ Plotters: ___________________________________________________________')
  o('\tpid\tphase\tpct\ttime\tjob')
  state.plotters.filter(p => p.active).forEach(plotter => {
    if (plotter.jobId) {
      o(`-\t${plotter.pid}\t${plotter.phase}\t${plotter.progress}%\t${plotter.elapsed}\t${plotter.jobName}`)
    } else {
      o(`-\t${plotter.pid}\tNo info because it was started externally`)
    }
  })
}
