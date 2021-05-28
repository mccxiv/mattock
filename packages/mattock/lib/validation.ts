import { MattockConfig } from '../types/types'
import * as fs from 'fs'
import * as path from 'path'
import * as execa from 'execa'
import * as semver from 'semver'
import { problems } from './state'

export async function isConfigValid(config: MattockConfig): Promise<boolean> {
  const results: boolean[] = [
    await validateExecutable(config.chiaExecutable),
    ...(config.jobs.map(job => validateJob(job)))
  ]

  return results.every(res => res)
}

export function validateExecutable (executable: string): boolean {
  try {
    const version = execa.sync(executable, ['version']).stdout
    if (!semver.valid(version)) {
      problems.push('The chia executable is not valid. Check your config')
      return false
    }
    return true
  } catch (e) {
    console.log('Unknown error trying to get chia version')
    return false
  }
}

export function validateJob(job: MattockConfig['jobs'][number]): boolean {
  const nameRegex = /^[-_a-z0-9]{1,10}$/i
  if (!nameRegex.test(job.name)) {
    problems.push('Invalid job name. Rules: 1 to 10 characters, no symbols')
    return false
  }

  const temp = path.resolve(job.temporaryDirectory)
  const dest = path.resolve(job.destinationDirectory)
  const tempValid = createDir(temp)
  const destValid = createDir(dest)

  if (!tempValid || !destValid) {
    if (!tempValid) problems.push(`Unable to access temporary dir for job: ${job.name}.`)
    if (!destValid) problems.push(`Unable to access destination dir for job: ${job.name}.`)
    return false
  }

  if (Number(job.concurrent) < 1) {
    problems.push(`Job ${job.name} has no concurrency set, it will not start any plotters`)
  }

  return true
}

function createDir (dirPath: string): boolean {
  try {fs.mkdirSync(dirPath, {recursive: true})} catch (e) {}
  try {fs.statSync(dirPath)} catch (e) {return false}
  return true
}

