import { getState, problems } from './state'
import { VERSION } from '../constants'
import { padWithClosingLine, tabsToSpaces } from './util'

export async function renderCli() {
  const state = await getState()
  const o = str => console.log(padWithClosingLine(tabsToSpaces(str)))
  const l = console.log
  const activePlotters = state.plotters.filter(p => p.active)

  console.clear()
  l(`┎────── Plotters: ────────────────────────────────────────────────── v${VERSION} ───┒`)
  o('┃ pid\tphase\tpct\ttime\tjob\t   id')
  l('┠──────────────────────────────────────────────────────────────────────────────┨')
  activePlotters.forEach((plotter) => {
    if (plotter.jobId) {
      o(`┃ ${plotter.pid}\t  ${plotter.phase}\t${plotter.progress}%\t${plotter.elapsed}\t${plotter.jobName}\t   ${plotter.jobId}`)
    } else {
      o(`┃ ${plotter.pid}\tNo info because it was started by another program`)
    }
  })
  if (activePlotters.length === 0) {
    o('┃')
    o('┃ No plotters are running.')
    o('┃')
  }
  o('┃')
  if (problems.length) {
    l('┠────── Issues: ───────────────────────────────────────────────────────────────┨')
    problems.forEach(problem => {
      o(`┃ - ${problem}`)
    })
  }
  l('┖──────────────────────────────────────────────────────────────────────────────┚')

  console.log(state.completed)
}

export function isJustCheckingVersion (): boolean {
  return process.argv.includes('--version') || process.argv.includes('-v')
}
