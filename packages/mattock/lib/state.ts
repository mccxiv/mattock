import { LogInfo, PlottingJob, PlottingState } from '../types/types'
import { getConfig, msToTime } from './util'
import { getPlotterProcesses } from './processes'
import * as path from 'path'
import * as fs from 'fs'
import { getStats } from './stats'
import { LOGS_DIR } from '../constants'

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
    const elapsedMs = logInfo.startTime ? Date.now() - new Date(logInfo.startTime).getTime() : undefined
    return {
      jobId,
      jobName: jobId.split('-')[2],
      active: true,
      pid: process.pid,
      startTime: logInfo.startTime,
      elapsed: elapsedMs ? msToTime(elapsedMs) : undefined,
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
  const filename = path.resolve(LOGS_DIR, `${jobId}.log`)
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
  let currentPhase = 1
  const phaseCompletionString = 'Time for phase '
  lines.forEach(line => {
    if (line.startsWith(phaseCompletionString)) {
      const highest = line.split(phaseCompletionString).pop()?.split(' ').shift()
      if (highest) currentPhase = Number(highest) + 1
    }
  })
  switch (currentPhase) {
    case 1:
      return 1
    case 2:
      return 2
    case 3:
      return 3
    case 4:
      return 4
    case 5:
      return 5
    default:
      return 1
  }
}

function splitLines (str: string): string[] {
  return str.split('\n')
}
