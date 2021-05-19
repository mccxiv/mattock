import * as execa from 'execa'
import { readFileSync } from 'jsonfile'
import * as psList from 'ps-list'
import * as path from 'path'
import { cleanUpStatProcesses, recordProcessMetadataToFile } from './lib/stats'
import { plotterProcesses } from './lib/processes'
import { generateJobIdentifier } from './lib/util'

const CONFIG_FILE = path.join(__dirname, '../../config.json')

init()

async function init () {
  await tick()
  setInterval(tick, 30000)
}

async function tick () {
  console.log('Tick')
  const config = readFileSync(CONFIG_FILE)
  const plotters = await plotterProcesses()
  cleanUpStatProcesses(plotters)
  config.jobs.forEach(job => {
    maybeSpawnPlotter(config, plotters, job)
  })
}

function maybeSpawnPlotter (config: any, plotters: psList.ProcessDescriptor[], job: any) {
  const freeSlots = Math.max(0, job.concurrent - plotters.length)
  if (freeSlots <= 0) return
  const jobId = generateJobIdentifier(job)
  const {pid: parentPid} = execa.command(
    [
      config.chia_executable,
      'plots', 'create',
      '-t', path.resolve(job.temp_dir, `${jobId}`),
      '-d', path.resolve(job.dest_dir),
      '>', path.join(__dirname, '../logs/', `${jobId}.log`)
    ].join(' '),
    {cleanup: false, shell: true, detached: true}
  )
  setTimeout(() => recordProcessMetadataToFile(parentPid, jobId), 5000)
}

