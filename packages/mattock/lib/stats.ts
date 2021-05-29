import * as fs from 'fs'
import * as path from 'path'
import { readFileSync, writeFileSync } from 'jsonfile'
import * as psList from 'ps-list'
import { getPlotterProcesses } from './processes'
import { LOGS_DIR, STATS_FILE } from '../constants'
import { LogInfo } from '../types/types'
import { getLogInfo } from './state'

export async function recordProcessMetadataToFile(parentPid: number, jobId: string) {
  const plotters = await getPlotterProcesses()
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

export function getStats() {
  return readFileSync(STATS_FILE)
}

function saveStats(stats: object) {
  writeFileSync(STATS_FILE, stats, { spaces: 2 })
}

export function getCompletedJobs (): LogInfo[] {
  return fs.readdirSync(LOGS_DIR)
    .filter(fileName => fileName.endsWith('.log'))
    .map(fileName => path.basename(fileName, path.extname(fileName)))
    .map(getLogInfo)
    .filter(logInfo => logInfo.endTime)
}
