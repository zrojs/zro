import { createRoot } from 'react-dom/client'
import { Router } from 'zro/react'
import { router } from './.zro/router.server'

const root = createRoot(document.getElementById('app')!)
root.render(<Router router={router} />)
