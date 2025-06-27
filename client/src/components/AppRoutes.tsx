import { Navigate, RouteObject, useRoutes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import privateRoutes from '../routes/private'
import publicRoutes from '../routes/public'
// import Forbidden from '../pages/Forbidden'
import { parseUser } from '../utils/jwt'
import { useToken } from '../hooks/auth'
import { layoutContext } from '../context'
import useLayoutContext from '../hooks/pages/layout'
import { inactiveRoutes } from '../routes/inactive.tsx'
import { isMobile } from 'react-device-detect'
import { authorizedContext } from '../context'
import useClustersContextValue from '../hooks/pages/authorized.ts'
import { IUserState } from '@lib/utils/interfaces/user.ts'

export default function AppRoutes() {
    const token = useToken()

    const [lastOpenedCluster] = useState<string | null>(localStorage.getItem('lastOpenedCluster'))

    const [routes, setRoutes] = useState<RouteObject[]>([])
    const [redirectRoute, setRedirectRoute] = useState<string | null>(null)

    useEffect(() => {
        const user: IUserState | null = parseUser(token)

        if (user) {
            if (!user.active) {
                setRoutes(inactiveRoutes)
                setRedirectRoute('/forbidden')
            } else if (user.status === 'owner' || user.status === 'admin') {
                setRoutes(privateRoutes)
                setRedirectRoute(isMobile ? '/clusters' : '/admin')
            } else if (user.status === 'user' || user.status === 'unlimited') {
                setRoutes(privateRoutes)

                if (lastOpenedCluster) {
                    setRedirectRoute(`/clusters/${lastOpenedCluster}`)
                } else {
                    setRedirectRoute('/clusters')
                }
            } else {
                // setRoutes([{ path: '/forbidden', element: <Forbidden /> }])
                // setRedirectRoute('/forbidden')
            }
        } else {
            setRoutes(publicRoutes)
            setRedirectRoute('/auth')
        }
    }, [token])

    const routing = useRoutes(
        redirectRoute
            ? [
                  ...routes,
                  {
                      path: '*',
                      element: <Navigate replace to={redirectRoute} />
                  }
              ]
            : routes
    )

    return (
        <authorizedContext.Provider value={useClustersContextValue()}>
            <layoutContext.Provider value={useLayoutContext()}>{routing}</layoutContext.Provider>
        </authorizedContext.Provider>
    )
}
