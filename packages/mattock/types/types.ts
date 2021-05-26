export interface PlottingState {
  plotters: PlottingJob[]
}

export interface PlottingJob {
  jobId?: string
  jobName?: string
  active: boolean
  pid?: number
  startTime?: string
  elapsed?: string
  endTime?: string
  phase?: 1 | 2 | 3 | 4 | 5
  progress?: number
}

export interface LogInfo {
  startTime?: string
  tmp?: string
  maxMemoryMiB?: number
  phase: 1 | 2 | 3 | 4 | 5
  p1Time?: number
  p2Time?: number
  p3Time?: number
  p4Time?: number
  lines: number
}

export interface MattockConfig {
  "chiaExecutable": string
  "maxConcurrentGlobal": number
  "maxConcurrentPhase1": number
  "farmerPublicKey": string | null
  "poolPublicKey": string |null
  "jobs": {
    "name": string
    "concurrent": number
    "temporaryDirectory": string
    "destinationDirectory": string
    "maxThreads": number | null
    "maxMemory": number | null
    "disableBitfield": boolean
    "doNotWaitForPhase5": boolean
  }[]
}
