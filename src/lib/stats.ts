import { readFileSync, writeFileSync } from 'jsonfile'
import * as psList from 'ps-list'
import * as path from 'path'
import { plotterProcesses } from './processes'

const STATS_FILE = path.join(__dirname, '../../stats.json')

export async function recordProcessMetadataToFile(parentPid: number, jobId: string) {
  const plotters = await plotterProcesses()
  const child = plotters.find(p => p.ppid === parentPid)
  if (!child) return console.error(Error('NoProcessSpawned'))
  const stats = getStats()
  const pid = String(child.pid)
  if (stats.processes[pid]) console.error(Error('ProcessAlreadyExisted'))
  stats.processes[pid] = jobId
  saveStats(stats)
}

export function cleanUpStatProcesses(plotters: psList.ProcessDescriptor[]) {
  const stats = getStats()
  const savedPids = Object.keys(stats.processes)
  savedPids.forEach(savedPid => {
    const correspondingProcess = plotters.find(plotterProcess => {
      return plotterProcess.pid === Number(savedPid)
    })
    if (!correspondingProcess) delete stats.processes[savedPid]
  })
  saveStats(stats)
}

function getStats() {
  return readFileSync(STATS_FILE)
}

function saveStats(stats: object) {
  writeFileSync(STATS_FILE, stats, { spaces: 2 })
}
