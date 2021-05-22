import { getState } from './state'

export async function renderCli() {
  const state = await getState()
  const o = console.log

  console.clear()
  o('___ Plotters: ___________________________________________________________')
  state.plotters.filter(p => p.active).forEach(plotter => {
    if (plotter.job) {
      o(`- ${plotter.pid}\t   Phase ${plotter.phase}, ${plotter.progress}%\tJob: ${plotter.job}`)
    } else {
      o(`- ${plotter.pid}\t   No info because it was started externally`)
    }
  })
}
