import { NextFunction, Response } from 'express'
import { getLogger } from '../utils/logger'
import jwt from 'jsonwebtoken'
import { accessJwtSecret } from '../utils/jwt'
import { apiUtils } from '../utils/api'
import { errors } from '../utils/constants'
import { db } from '../services/db'
import { ObjectId } from 'mongodb'
import { AuthorizedRequest, Collection } from '../utils/types'

const logger = getLogger('middlewares/auth')

export async function isAuthorized(req: AuthorizedRequest, res: Response, next: NextFunction) {
    if (!req.headers.authorization) {
        return apiUtils.sendError(res, errors.AUTHORIZATION_HEADER_EMPTY)
    }

    const token: string = req.headers.authorization.split(' ')[1] as string

    try {
        const decodeValue: any = jwt.verify(token, accessJwtSecret)

        // TODO: Validate decodeValue ?

        req.user = decodeValue.user
    } catch (e) {
        logger.error(e)
        return apiUtils.sendError(res, errors.JWT_INVALID)
    }

    next()
}

export async function isAuthorizedNotRequired(req: any, _: Response, next: NextFunction) {
    const token: string | undefined = req.headers.authorization?.split(' ')[1]

    if (token) {
        try {
            const decodeValue: any = jwt.verify(token, accessJwtSecret)

            // TODO: Validate decodeValue ?

            req.user = decodeValue.user
        } catch (e) {}
    }

    next()
}

export function isActive(req: any, res: Response, next: NextFunction) {
    const active = req.user?.active

    if (active) {
        return next()
    }

    return res.sendStatus(403)
}

export function hasUserStatus(req: any, res: Response, next: NextFunction) {
    const status = req.user?.status

    if (!status) {
        return res.sendStatus(500)
    }

    if (status === 'user' || status === 'unlimited' || status === 'owner' || status === 'admin') {
        return next()
    }

    return res.sendStatus(403)
}

export function hasOwnerStatus(req: any, res: Response, next: NextFunction) {
    const status = req.user?.status

    if (!status) {
        return res.sendStatus(500)
    }

    if (status === 'owner') {
        return next()
    }

    return res.sendStatus(403)
}

export function hasAdminStatus(req: any, res: Response, next: NextFunction) {
    const status = req.user?.status

    if (!status) {
        return res.sendStatus(500)
    }

    if (status === 'admin' || status === 'owner') {
        return next()
    }

    return res.sendStatus(403)
}

export function userHasAccess(
    collection: Collection,
    idField = 'id',
    skipDeleted = true,
    access = false,
    noAccessHttpCode = 403
) {
    return async (req: any, res: Response, next: NextFunction) => {
        const id = req.params[idField]
        const status = req.user?.status
        const userId = req.user?._id

        if (!id || !collection) {
            return res.sendStatus(500)
        }

        const filter: any = { _id: new ObjectId(id) }

        if (userId) {
            if (status && ['admin', 'owner'].includes(status)) {
                return next()
            }

            filter.$or = [{ userId }]
            if (access) {
                filter.$or.push(
                    {
                        access: 'public',
                        userId: { $ne: userId }
                    },
                    {
                        access: 'unlisted',
                        userId: { $ne: userId }
                    },
                    {
                        access: 'limited',
                        allowedUsers: userId
                    }
                )
            }
        } else {
            filter.$or = [{ access: 'unlisted' }, { access: 'public' }]
        }

        if (skipDeleted) {
            const staticFilter = {
                $or: [{ deleted: { $exists: false } }, { deleted: false }]
            }

            filter.$or = filter.$or.map((item: any) => ({
                ...item,
                ...staticFilter
            }))
        }

        const item = await db.collection(collection).findOne(filter)
        if (item) {
            req.middlewarePayload = { ...(req.middlewarePayload || {}), item }
            return next()
        }

        return res.sendStatus(noAccessHttpCode)
    }
}

export function userHasSubscription(req: any, res: Response, next: NextFunction) {
    const status = req.user.status
    if (!status) {
        return res.sendStatus(500)
    }

    // Check if user has unlimited quota
    if (
        ['owner', 'admin', 'unlimited'].includes(status) ||
        (req.user.subscription && req.user.subscription !== 'free')
    ) {
        return next()
    }

    return res.sendStatus(403)
}
