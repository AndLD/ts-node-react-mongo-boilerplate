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
        const filesToExclude = ['node_modules', 'bin', '.git', 'package.json', 'package-lock.json', 'root.package.json']
        const relativePath = path.relative(source, src)
        if (relativePath === '') {
            return true
        }
        const pathSegments = relativePath.split(path.sep)
        const shouldExclude = pathSegments.some((segment) => filesToExclude.includes(segment))
        if (shouldExclude) {
            // console.log(`Excluding ${relativePath}`);
        }
        return !shouldExclude
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
