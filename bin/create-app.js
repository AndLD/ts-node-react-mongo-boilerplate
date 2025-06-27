#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')

const source = path.resolve(__dirname, '..')
const destination = process.argv[2]

if (!destination) {
    console.error('Please specify the destination directory.')
    process.exit(1)
}

fs.copy(source, destination, {
    filter: (src) => {
        const filesToExcludeGlobally = ['node_modules', 'bin', '.git', 'ts-node-react-mongo-boilerplate-1.0.4.tgz', 'root.package.json']
        const rootLevelFilesToExclude = ['package.json', 'package-lock.json']

        const relativePath = path.relative(source, src)

        if (relativePath === '') {
            return true
        }

        const pathSegments = relativePath.split(path.sep)

        // Check for global exclusions (like node_modules, .git, etc.)
        const shouldExcludeGlobally = pathSegments.some(segment => filesToExcludeGlobally.includes(segment))
        if (shouldExcludeGlobally) {
            return false
        }

        // Check for root-level exclusions (package.json, package-lock.json)
        if (pathSegments.length === 1 && rootLevelFilesToExclude.includes(pathSegments[0])) {
            return false
        }

        return true
    }
})
    .then(() => {
        const rootPackageJsonSource = path.join(source, 'root.package.json')
        const packageJsonDestination = path.join(destination, 'package.json')
        return fs.copy(rootPackageJsonSource, packageJsonDestination)
    })
    .then(() => {
        console.log('Project created successfully!')
    })
    .catch((err) => {
        console.error(`Error copying project: ${err}`)
    })
