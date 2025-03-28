import { hydrateRoot } from 'react-dom/client'
import { Router } from 'zro/react'
import { createHead } from 'zro/unhead'
import { router } from './.zro/router.server'

const head = createHead()
hydrateRoot(document, <Router router={router} initialUrl={new URL(window.location.pathname, window.location.origin)} head={head} />)
