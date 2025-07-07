import useDebugStore from 'src/stores/debug.store'

export const initDebug = () => {
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  console.log = (...args) => {
    useDebugStore
      .getState()
      .addLog({ type: 'console', message: args.join(' ') })
    originalConsoleLog(...args)
  }
  console.error = (...args) => {
    const message = []
    Object.keys(args).forEach((key) => {
      let text = ''
      if (typeof args[key] === 'object') {
        text = JSON.stringify(args[key])
      } else {
        text = args[key]
      }
      message.push(text)
    })

    useDebugStore
      .getState()
      .addLog({ type: 'console-error', message: message.join(' ') })
    originalConsoleError(...args)
  }
}
