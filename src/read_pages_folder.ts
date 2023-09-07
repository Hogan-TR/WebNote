import globSync from 'glob'

const pages = await globSync('pages/*.html')

const arrayKeyValuePairs = pages.map((file) => [file.split('\\').slice(-1).toString().split('.html').join(''), file])

// like: {'pages/page': 'pages/page.html'}
export const config = Object.fromEntries(arrayKeyValuePairs)
