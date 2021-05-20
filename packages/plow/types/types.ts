export interface PlottingState {
  plotters: PlottingJob[]
}

export interface PlottingJob {
  job?: string
  active: boolean
  pid?: number
  startTime?: string
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
