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

// Workspace packages (packages/sync, packages/types, packages/core) use
// explicit .js extensions on their relative imports for ESM/tsc compatibility
// ("moduleResolution": "Bundler").  Metro's resolver is not TypeScript-aware
// and looks for the literal file, so it can't find types.js → types.ts.
// Strip the .js extension and fall back to Metro's normal resolution, which
// will discover the .ts source file instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('.js')) {
    try {
      return context.resolveRequest(context, moduleName.slice(0, -3), platform)
    } catch (_) {
      // Extension strip didn't help — fall through to the original name.
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
