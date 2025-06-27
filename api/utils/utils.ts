import fs from 'fs'
import Jimp from 'jimp'
import path from 'path'
import { isProduction } from './constants'

export const Utils = {
    attachPayloadWordToKeysForObject(obj: any) {
        const result: any = {}
        Object.keys(obj).forEach((key) => {
            result[`payload.${key}`] = obj[key]
        })

        return result
    },
    getDirectorySizeSync(directoryPath: string) {
        try {
            let totalSize = 0

            const files = fs.readdirSync(directoryPath)

            for (const file of files) {
                const filePath = path.join(directoryPath, file)
                const stats = fs.statSync(filePath)

                if (stats.isFile()) {
                    totalSize += stats.size
                } else if (stats.isDirectory()) {
                    const subdirectorySize = Utils.getDirectorySizeSync(filePath)
                    totalSize += subdirectorySize
                }
            }

            // Convert bytes to megabytes
            const sizeInMB = Math.round(totalSize) / 1000

            return parseFloat(sizeInMB.toFixed(2))
        } catch (error) {
            throw error
        }
    },
    // Recursive function to get files
    getFileNames(dir: string, files: string[] = [], extensions: string[] = []) {
        // Get an array of all files and directories in the passed directory using fs.readdirSync
        const fileList = fs.readdirSync(dir)
        // Create the full path of the file/directory by concatenating the passed directory and file/directory name
        for (const file of fileList) {
            if (extensions.length > 0) {
                const splittedName = file.split('.')
                const ext = splittedName[splittedName.length - 1]

                if (ext && !extensions.includes(ext.toLowerCase())) {
                    continue
                }
            }

            const name = file

            files.push(name)
        }

        return files
    },
    ensureDirExists(dirPath: string) {
        try {
            // Check if the directory exists
            fs.statSync(dirPath)
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                // Directory does not exist, create it
                fs.mkdirSync(dirPath)
                console.log(`Directory '${dirPath}' created.`)
            } else {
                throw err // Something else went wrong
            }
        }
    },
    async compressAllImages() {
        Utils.ensureDirExists('public/compressed-images')

        const imageFileNames = Utils.getFileNames('public/images', undefined, ['jpg', 'jpeg', 'png'])

        let promises: Promise<any>[] = []

        imageFileNames.forEach((fileName) => {
            promises.push(Jimp.read(`public/images/${fileName}`))
        })

        const results = await Promise.allSettled(promises)

        promises = []

        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                promises.push(
                    result.value
                        .quality(30)
                        .writeAsync(`public/compressed-images/${imageFileNames[i]}`)
                        .catch(() => {})
                )
            }
        })

        await Promise.all(promises)
    },
    async compressImage(fileName: string) {
        if (!fs.existsSync(path.join(__dirname, '..', 'public', 'images', fileName))) {
            return
        }

        const image = await Jimp.read(`public/images/${fileName}`)

        await image
            .quality(30)
            .writeAsync(`public/images/${fileName}`)
            .catch(() => {})
    },
    deleteImages(fileNames: string[]) {
        const dir = path.join(__dirname, isProduction ? '../../public/images' : '../public/images')

        fileNames.forEach((fileName) => {
            const filePath = path.join(dir, fileName)
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filePath}: ${err}`)
                }
            })
        })
    },
    convertTimeStringToMilliseconds(timeString: string) {
        // Extract the number and the unit from the input string
        const match = timeString.match(/(\d+)([smhd])/)

        if (!match) {
            return 0
        }

        const timeMultipliers = {
            s: 1000, // seconds to milliseconds
            m: 60 * 1000, // minutes to milliseconds
            h: 60 * 60 * 1000, // hours to milliseconds
            d: 24 * 60 * 60 * 1000 // days to milliseconds
        }

        const value = parseInt(match[1]) // the numeric part
        const unit = match[2] as 's' | 'm' | 'h' | 'd'

        return value * timeMultipliers[unit]
    },
    sortDocsByOrder<T extends { _id: string }, D = T>(idsOrder: string[], docs: T[], mapDocsCallback?: (doc: T) => D) {
        if (idsOrder && docs.length !== idsOrder.length) {
            throw Error('Failed to sort data array: data array length does not corresponds prepared IDs array length')
        }

        const docsByIdsObj: { [id: string]: T } = {}
        docs.forEach((doc) => (docsByIdsObj[doc._id] = doc))

        const result: (T | D)[] = []
        idsOrder.forEach((id) => result.push(mapDocsCallback ? mapDocsCallback(docsByIdsObj[id]) : docsByIdsObj[id]))

        return result
    }
}
