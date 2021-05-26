import { MattockConfig } from '../types/types'
import * as path from 'path'
import * as execa from 'execa'
import * as semver from 'semver'
import * as drivelist from 'drivelist'
import { problems } from './state'

export async function isConfigValid(config: MattockConfig): Promise<boolean> {
  const drives = await drivelist.list()

  const results: boolean[] = [
    await validateExecutable(config.chiaExecutable),
    ...(config.jobs.map(job => validateJob(drives, job)))
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

export function validateJob(drives: drivelist.Drive[], job: MattockConfig['jobs'][number]): boolean {
  const nameRegex = /^[-_a-z0-9]{1,10}$/i
  if (!nameRegex.test(job.name)) {
    problems.push('Invalid job name. Rules: 1 to 10 characters, no symbols')
    return false
  }

  const mountPaths = drives.reduce(
    (acc, current) => {
      const mountPaths = current.mountpoints.map(mp => path.resolve(mp.path))
      return [...acc, ...mountPaths]
    },
    []
  )

  const tempResolved = path.resolve(job.temporaryDirectory)
  const destResolved = path.resolve(job.destinationDirectory)
  const tempSeemsValid = mountPaths.some(mountPath => tempResolved.startsWith(mountPath))
  const destSeemsValid = mountPaths.some(mountPath => destResolved.startsWith(mountPath))

  if (!tempSeemsValid || !destSeemsValid) {
    if (!tempSeemsValid) problems.push(`Temporary directory for ${job.name} seems invalid`)
    if (!destSeemsValid) problems.push(`Destination directory for ${job.name} seems invalid`)
    return false
  }

  if (Number(job.concurrent) < 1) {
    problems.push(`Job ${job.name} has no concurrency set, it will not start any plotters`)
  }

  return true
}

