const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
// pnpm uses symlinks; Metro must follow them to find hoisted packages.
config.resolver.unstable_enableSymlinks = true

// Workspace packages (packages/sync, packages/types, packages/core) use explicit
// .js extensions on their RELATIVE imports for ESM/tsc compatibility
// ("moduleResolution": "Bundler"). Metro is not TypeScript-aware and looks for
// the literal ./types.js, which doesn't exist (the source is ./types.ts).
// Resolve the literal name first (so genuine .js files still work), and only on
// failure retry with .js stripped so Metro finds the .ts source. Scoped to
// relative specifiers so bare node_modules imports are never rewritten.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isRelative = moduleName.startsWith('./') || moduleName.startsWith('../')
  if (isRelative && moduleName.endsWith('.js')) {
    try {
      return context.resolveRequest(context, moduleName, platform)
    } catch (_) {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform)
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
