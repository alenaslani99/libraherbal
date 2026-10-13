import type { H3Event } from 'h3'
import patterns from '#page-routes'

// Same path rules as the router: optional trailing slash, case-insensitive
const PAGE_ROUTE = new RegExp(`^(?:${patterns.join('|')})/?$`, 'i')

export function isPageRoute(path: string) {
  return PAGE_ROUTE.test(path)
}

// Static 404 sent before Nuxt renders anything: no app, no database, next to no CPU.
// Looks like app/error.vue (pale beige, sun circle, 404, back home); system fonts, no JS.
export function sendNotFoundPage(event: H3Event) {
  setResponseStatus(event, 404, 'Not Found')
  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=300')
  return event.method === 'HEAD' ? '' : NOT_FOUND_HTML
}

const NOT_FOUND_HTML = `<!doctype html>
<html lang="sr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#2d3a1f">
<title>Stranica nije pronađena | Libra Herbal</title>
<link rel="icon" href="/favicon.ico" sizes="48x48">
<style>
*{box-sizing:border-box;margin:0}
body{min-height:100vh;display:flex;flex-direction:column;background:#e8e2d0;color:#1b1b1b;font-family:ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
header{background:#2d3a1f;padding:20px 16px;text-align:center}
header a{color:#fff;text-decoration:none;font:600 22px ui-serif,Georgia,serif}
main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:600px;margin:0 auto;padding:64px 16px;text-align:center}
.icon{display:flex;align-items:center;justify-content:center;width:80px;height:80px;border-radius:50%;background:#ffc30b}
h1{margin-top:64px;font:600 80px/1 ui-serif,Georgia,serif;letter-spacing:-.02em}
.title{margin-top:64px;font-size:14px;font-weight:500;line-height:20px}
.text{margin-top:4px;font-size:12px;line-height:16px}
.btn{margin-top:32px;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 20px;border-radius:9999px;background:#ffc30b;color:#1b1b1b;font-weight:500;text-decoration:none;transition:background-color .2s}
.btn:hover{background:#ffd95e}
.btn:focus-visible{outline:2px solid #ffc30b;outline-offset:2px}
</style>
</head>
<body>
<header><a href="/">Libra Herbal</a></header>
<main>
<div class="icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg></div>
<h1>404</h1>
<p class="title">Stranica nije pronađena</p>
<p class="text">Stranica koju tražite ne postoji ili je premeštena.</p>
<a class="btn" href="/"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>Nazad na početnu</a>
</main>
</body>
</html>
`
