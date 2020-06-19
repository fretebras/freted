export interface Dependency {
  isRunning: () => Promise<boolean>
  start: () => Promise<void>
  stop: () => Promise<void>
}
