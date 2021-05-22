import { LogInfo, PlottingJob, PlottingState } from '../types/types'
import { getConfig } from './util'
import { getPlotterProcesses } from './processes'
import * as path from 'path'
import * as fs from 'fs'
import { getStats } from './stats'

const LOGS_FOLDER = path.resolve(__dirname, '../../../logs/')

export async function getState(): Promise<PlottingState> {
  const config = getConfig()
  const stats = getStats()
  const knownPids = Object.keys(stats.processes)
  const processes = await getPlotterProcesses()
  const recognized = processes.filter(p => knownPids.includes(String(p.pid)))
  const unrecognized = processes.filter(p => !knownPids.includes(String(p.pid)))

  const plotterPromises: Promise<PlottingJob>[] = recognized.map(async process => {
    const jobId = stats.processes[process.pid]
    const logInfo = await getLogInfo(config, jobId)
    return {
      job: jobId,
      active: true,
      pid: process.pid,
      startTime: logInfo.startTime,
      phase: logInfo.phase,
      progress: Math.round(((logInfo.lines / 2620) * 100) * 100) / 100
    }
  })

  const plotters = await Promise.all(plotterPromises)

  const unknown: PlottingJob[] = unrecognized.map(process => {
    return {
      active: true,
      pid: process.pid
    }
  })

  return { plotters: [...plotters, ...unknown] }
}

export function getLogInfo(config: any, jobId: string): LogInfo {
  const filename = path.resolve(LOGS_FOLDER, `${jobId}.log`)
  const log = fs.readFileSync(filename, { encoding: 'utf-8' })
  const lines = splitLines(log)
  const startTime = findStartTime(lines)
  const tmpDir = findTempDirFromLog(lines)
  const phase = findCurrentPhase(lines)
  const lineCount = lines.length

  return {
    startTime,
    tmp: tmpDir,
    phase,
    lines: lineCount
  }
}

function findStartTime(lines: string[]) {
  const startLine = lines.find(line => line.includes('Starting phase 1')) || ''
  return startLine.split('files... ').pop()
}

function findTempDirFromLog(lines: string[]) {
  const dirLine = lines.find(line => line.startsWith('Starting plotting')) || ''
  return dirLine.split(' ').pop()
}

function findCurrentPhase(lines: string[]) {
  let highestPhase = '1'
  const phaseCompletionString = 'Time for phase '
  lines.forEach(line => {
    if (line.startsWith(phaseCompletionString)) {
      const highest = line.split(phaseCompletionString).pop()?.split(' ').shift()
      if (highest) highestPhase = highest
    }
  })
  const phase = Number(highestPhase)
  switch (phase) {
    case 1:
      return 1
    case 2:
      return 2
    case 3:
      return 3
    case 4:
      return 4
    default:
      return 1
  }
}

function splitLines (str: string): string[] {
  return str.split('\n')
}
