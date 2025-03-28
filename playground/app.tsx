import { hydrateRoot } from 'react-dom/client'
import { Router } from 'zro/react'
import { router } from './.zro/router.server'

hydrateRoot(document, <Router router={router} />)
