import * as path from 'path'
import * as execa from 'execa'
import { generateJobIdentifier, getConfig } from './util'
import { getState } from './state'
import { getPlotterProcesses } from './processes'
import { cleanUpStatProcesses, recordProcessMetadataToFile } from './stats'
import { MattockConfig, PlottingState } from '../types/types'
import { LOGS_DIR } from '../constants'

export async function managerTick() {
  const config = getConfig()
  const state = await getState()
  const plotters = await getPlotterProcesses()
  cleanUpStatProcesses(plotters)
  if (plotters.length >= config.maxConcurrentGlobal) return
  const phase1Count = state.plotters.filter(p => p.phase === 1).length
  if (phase1Count >= config.maxConcurrentPhase1) return
  config.jobs.forEach(job => {
    maybeSpawnPlotter(config, state, job)
  })
}

function maybeSpawnPlotter(config: MattockConfig, state: PlottingState, job: MattockConfig['jobs'][number]) {
  const liveJobs = state.plotters.filter(p => p.jobName === job.name)
  const unknownJobs = state.plotters.filter(p => !p.jobId).length

  // Err on the safest side and assume unknown jobs are the same as this job
  // so that we don't overload the temp drive.
  let currentJobsCalculated = liveJobs.length + unknownJobs

  // Phase 5 uses almost no resources so it should be ignored most times
  if (job.doNotWaitForPhase5) {
    const liveJobsInP5 = liveJobs.filter(p => p.phase === 5)
    currentJobsCalculated -= liveJobsInP5.length
  }

  // Clamp to 0 in case math got weird and went negative due to external jobs
  const freeSlots = Math.max(0, job.concurrent - currentJobsCalculated)

  if (freeSlots <= 0) return

  const jobId = generateJobIdentifier(job)
  const command = [
    config.chiaExecutable,
    'plots', 'create',
    '-t', path.resolve(job.temporaryDirectory, `${jobId}`),
    '-d', path.resolve(job.destinationDirectory),
    ...(job.maxThreads ? ['-r', String(job.maxThreads)] : []),
    ...(job.maxMemory ? ['-b', String(job.maxMemory)] : []),
    ...(job.disableBitfield ? ['-e'] : []),
    '>', path.resolve(LOGS_DIR, `${jobId}.log`)
  ].join(' ')

  const { pid: parentPid } = execa.command(
    command,
    { cleanup: true, shell: true, detached: false }
  )
  setTimeout(() => recordProcessMetadataToFile(parentPid, jobId), 2000)
}
