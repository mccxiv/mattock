import { getState, problems } from './state'
import { CONFIG_FILE, VERSION } from '../constants'
import { groupRecent, padWithClosingLine, sToTime, tabsToSpaces } from './util'
import { LogInfo } from '../types/types'

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
      o(`┃ ${plotter.pid}\t  ${plotter.phase}\t${plotter.progress}%\t${plotter.elapsed || ''}\t${plotter.jobName}\t   ${plotter.jobId}`)
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
  if (state.completed.length) {
    const grouped = groupRecent(state.completed)
    const haveAnyRecent = grouped.some(group => group.length)
    if (haveAnyRecent) {
      const dayMap = {
        '0': 'Today',
        '1': 'Yesterday',
        '2': 'Two days ago',
        '3': 'Three days ago'
      }
      l('┠────── Completed: ────────────────────────────────────────────────────────────┨')
      grouped.forEach((group, i) => {
        if (group.length) {
          const avg = sToTime(averageTime(group))
          const day = `┃ ${dayMap[i]}: ${group.length}`.padEnd(24, ' ')
          o(`${day}Average time: ${avg}`)
        }
      })

      o('┃')

      function averageTime (logs: LogInfo[]): number {
        const sum = logs.reduce((acc, curr) => {
          if (curr.totalSeconds) acc += curr.totalSeconds
          return acc
        }, 0)
        return Math.round(sum / logs.length)
      }
    }
  }
  if (problems.length) {
    l('┠────── Issues: ───────────────────────────────────────────────────────────────┨')
    problems.forEach(problem => {
      o(`┃ - ${problem}`)
    })
    o('┃')
    o(`┃ Config file: ${CONFIG_FILE}`)
    o(`┃ Changes are reloaded automatically`)
    o('┃')
  }
  l('┖──────────────────────────────────────────────────────────────────────────────┚')
}

export function isJustCheckingVersion (): boolean {
  return process.argv.includes('--version') || process.argv.includes('-v')
}
