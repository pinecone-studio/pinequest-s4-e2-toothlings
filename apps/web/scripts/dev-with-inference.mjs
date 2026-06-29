#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const modelDir = path.resolve(webRoot, '../model')
const inferencePort = process.env.INFERENCE_PORT ?? '8765'
const nextBin = path.join(
  webRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.cmd' : 'next',
)
const pythonBin = process.platform === 'win32' ? 'py' : 'python3'
const pythonArgs = process.platform === 'win32' ? ['-3', 'server.py'] : ['server.py']

const children = []

const run = (label, command, args, options) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32', // fix: .cmd files need shell:true on Windows
    ...options,
  })
  child.on('error', (err) => {
    console.error(`[${label}] failed to start:`, err.message)
    if (label !== 'model') {
      shutdown(1)
    } else {
      console.error('[model] continuing without inference server.')
    }
  })
  children.push(child)
  return child
}

const shutdown = (code = 0) => {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  setTimeout(() => process.exit(code), 100)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

const web = run('web', nextBin, ['dev', '-p', '3000'], { cwd: webRoot })

web.on('exit', (code) => shutdown(code ?? 0))
