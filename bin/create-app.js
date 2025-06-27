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
        const filesToExclude = ['node_modules', 'bin']
        return !filesToExclude.some((file) => src.includes(file))
    }
})
    .then(() => {
        console.log('Project created successfully!')
    })
    .catch((err) => {
        console.error(`Error copying project: ${err}`)
    })
