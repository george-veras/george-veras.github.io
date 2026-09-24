// WCAG 2.2 AA checks for george-veras.github.io, run by .github/workflows/a11y.yml on every push
// and pull request. By hand: cd .github/a11y && npm ci && npx playwright install chromium && node check.mjs
//
// Automation covers roughly a third of what WCAG asks for, so this is a floor and not a pass mark.
// The rest is the evaluation by hand in .github/ACCESSIBILITY.md. What this adds is that nothing
// already checked there can quietly break: each block below guards a result that evaluation
// relies on, and fails the build if it stops being true.
import { chromium } from 'playwright'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const axePath = require.resolve('axe-core')
const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const STATES = [['index.html', 'en'], ['index.html', 'fr'], ['index.html', 'pt'], ['resume.html', null], ['accessibility.html', null]]

let failures = 0
const fail = (where, what) => { console.log(`  FAIL  ${where}: ${what}`); failures++ }
const ok = (what) => console.log(`  ok    ${what}`)
const at = (file, lang) => file + (lang ? ` [${lang}]` : '')

const browser = await chromium.launch()
async function open(file, { lang = null, viewport = { width: 1280, height: 900 }, reducedMotion = 'no-preference' } = {}) {
  const page = await (await browser.newContext({ viewport, reducedMotion })).newPage()
  await page.goto('file://' + join(SITE, file), { waitUntil: 'load' })
  if (lang) { await page.click(`#btn-${lang}`); await page.waitForTimeout(300) }
  await page.waitForTimeout(500)
  return page
}
const done = (page) => page.context().close()

// ------------------------------------------------------------------ 1. axe, the standard's own tags
console.log('rule engine')
for (const [file, lang] of STATES) {
  const page = await open(file, { lang })
  await page.addScriptTag({ path: axePath })
  const { violations } = await page.evaluate((t) => window.axe.run(document, { runOnly: { type: 'tag', values: t }, resultTypes: ['violations'] }), WCAG)
  for (const v of violations) fail(at(file, lang), `${v.id}: ${v.help} (${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')})`)
  if (!violations.length) ok(`${at(file, lang)}: no WCAG 2.2 A or AA violation`)
  await done(page)
}

// ---------------------------------------- 2. layout: 1.4.10 reflow, 1.4.4, 1.4.12, 2.5.8 target size
console.log('layout')
for (const [file, lang] of STATES) {
  const where = at(file, lang)
  const page = await open(file, { lang, viewport: { width: 320, height: 640 } })
  const before = failures
  const spill = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  if (spill > 2) fail(where, `1.4.10 reflow: the page scrolls ${spill}px sideways at 320px`)
  await page.setViewportSize({ width: 1280, height: 900 })
  for (const [name, css] of [
    ['1.4.4 text at 200%', 'html{font-size:200%!important}'],
    ['1.4.12 text spacing', '*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'],
  ]) {
    const tag = await page.addStyleTag({ content: css })
    await page.waitForTimeout(300)
    const clipped = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,p,li,td,th,dt,dd,button,a,span')]
      .filter((e) => {
        const s = getComputedStyle(e)
        if (s.display === 'none' || s.visibility === 'hidden' || !e.textContent.trim() || /sr-only|skip-link/.test(e.className)) return false
        return (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) && s.overflow === 'hidden'
      })
      .slice(0, 3).map((e) => e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '')))
    if (clipped.length) fail(where, `${name}: text cut off in ${clipped.join(', ')}`)
    await tag.evaluate((t) => t.remove())
  }
  // Inline links in a sentence or a line of text are excepted by 2.5.8 itself
  const small = await page.evaluate(() => {
    const inline = (e) => e.tagName === 'A' && getComputedStyle(e).display === 'inline' && e.closest('p, li, td, dd, blockquote, .contact-line')
    return [...document.querySelectorAll('a[href],button,[role="button"]')]
      .filter((e) => e.offsetParent !== null && !inline(e) && !e.classList.contains('skip-link'))
      .map((e) => ({ n: e.tagName.toLowerCase() + (e.id ? '#' + e.id : ''), r: e.getBoundingClientRect() }))
      .filter((x) => x.r.width && (x.r.width < 24 || x.r.height < 24))
      .map((x) => `${x.n} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`)
  })
  if (small.length) fail(where, `2.5.8 target size: ${small.slice(0, 4).join(', ')}`)
  if (failures === before) ok(`${where}: reflows at 320px, no clipping at 200% or with spacing, targets 24px`)
  await done(page)
}

// ---------------------- 3. keyboard: 2.4.7 focus visible, 2.4.1 skip link, 2.1.2 no keyboard trap
console.log('keyboard')
for (const [file, main] of [['index.html', 'main-content'], ['resume.html', null], ['accessibility.html', 'content']]) {
  const page = await open(file)
  const before = failures
  const seen = [], noRing = []
  let cycled = false
  for (let i = 0; i < 150; i++) {
    await page.keyboard.press('Tab')
    const r = await page.evaluate(() => {
      const e = document.activeElement
      if (!e || e === document.body) return null
      const style = () => { const c = getComputedStyle(e); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.boxShadow, c.backgroundColor, c.color, c.textDecorationLine, c.top].join('|') }
      const focused = style()
      e.blur(); const rest = style(); e.focus()
      return { key: e.tagName + (e.id || '') + (e.getAttribute('href') || '') + (e.textContent || '').trim().slice(0, 30), name: e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' "' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 25) + '"', same: focused === rest }
    })
    if (!r) continue
    // Back at the first stop means a full lap. Two identical links elsewhere must not end it early.
    if (seen.length && r.key === seen[0]) { cycled = true; break }
    seen.push(r.key)
    if (r.same) noRing.push(r.name)
  }
  if (!cycled) fail(file, `2.1.2 tabbing did not come back round within 150 stops`)
  if (noRing.length) fail(file, `2.4.7 no visible focus change on ${noRing.slice(0, 4).join(', ')}`)
  if (main) {
    await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(400)
    await page.keyboard.press('Tab')
    const first = await page.evaluate(() => document.activeElement.className)
    if (!String(first).includes('skip-link')) fail(file, '2.4.1 the skip link is not the first thing Tab reaches')
    else {
      await page.keyboard.press('Enter'); await page.waitForTimeout(300)
      const landed = await page.evaluate(() => document.activeElement.id)
      if (landed !== main) fail(file, `2.4.1 the skip link moved focus to "${landed || 'nothing'}", not #${main}`)
    }
  }
  if (failures === before) ok(`${file}: ${seen.length} tab stops, all with visible focus, no trap${main ? ', skip link moves focus' : ''}`)
  await done(page)
}

// --------------------------------------------------------------- 4. 2.2.2 pause, and reduced motion
console.log('motion')
{
  const running = (p) => p.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity).length)
  const typing = async (p) => { const a = await p.textContent('#typewriter'); await p.waitForTimeout(1500); return a !== (await p.textContent('#typewriter')) }
  const before = failures
  let page = await open('index.html')
  await page.click('#motion-toggle'); await page.waitForTimeout(300)
  if (await typing(page)) fail('index.html', '2.2.2 the typewriter keeps typing after the pause button')
  if (await running(page)) fail('index.html', '2.2.2 an infinite animation keeps running after the pause button')
  await page.click('#ecnh-pause'); await page.click('.carousel-btn.next'); await page.mouse.move(0, 0)
  const cap = await page.textContent('#ecnh-caption'); await page.waitForTimeout(4200)
  if (cap !== (await page.textContent('#ecnh-caption'))) fail('index.html', '2.2.2 the paused carousel started rotating again after a manual move')
  await done(page)
  page = await open('index.html', { reducedMotion: 'reduce' })
  if (await typing(page)) fail('index.html', 'with reduced motion the typewriter should start paused')
  await done(page)
  if (failures === before) ok('index.html: pause stops the typewriter, cursor, arrow and carousel; reduced motion starts paused')
}

// ------------------------------------ 5. 3.1.2 language of parts, and translated accessible names
console.log('language')
for (const lang of ['pt', 'fr']) {
  const page = await open('index.html')
  const collect = () => page.evaluate(() => {
    const out = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const n = walker.currentNode, p = n.parentElement
      const t = n.textContent.replace(/\s+/g, ' ').trim()
      // A translated string that happens to match the English ("Contact" in French) is not English
      if (!/[A-Za-z]{3}/.test(t) || !p || p.closest('script,style,[aria-hidden="true"],[role="img"],[data-i18n]')) continue
      out.push({ t, marked: !!p.closest('[lang]:not(html)') })
    }
    return out
  })
  const labels = () => page.evaluate(() => [...document.querySelectorAll('[data-i18n-aria]')].map((e) => e.getAttribute('aria-label')))
  const english = new Set((await collect()).map((x) => x.t))
  const englishNames = await labels()
  await page.click(`#btn-${lang}`); await page.waitForTimeout(400)
  const unmarked = (await collect()).filter((x) => english.has(x.t) && !x.marked)
  if (unmarked.length) fail(`index.html [${lang}]`, `3.1.2 ${unmarked.length} English passages not marked lang="en": ${unmarked.slice(0, 3).map((x) => JSON.stringify(x.t.slice(0, 40))).join(', ')}`)
  const names = await labels()
  const untranslated = names.filter((n, i) => n === englishNames[i])
  if (!names.length || untranslated.length) fail(`index.html [${lang}]`, `accessible names still in English: ${untranslated.slice(0, 3).join(', ')}`)
  if (!unmarked.length && names.length && !untranslated.length) ok(`index.html [${lang}]: English-only text is marked, ${names.length} accessible names translated`)
  await done(page)
}

// ---------------------------------------- 6. 1.4.3 contrast where axe cannot: text on gradients
console.log('contrast on gradients')
{
  const lum = ([r, g, b]) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] }
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
  const stops = (s) => (s.match(/rgba?\([^)]+\)/g) || []).map((m) => m.replace(/rgba?\(|\)/g, '').split(',').slice(0, 3).map(Number))
  const page = await open('index.html')
  await page.evaluate(() => { document.querySelector('.skip-link').focus() })
  const els = await page.evaluate(() => ['.btn-primary', '.nav-cta', '.lang-btn.active', '.skip-link', '#back-top', '.nav-logo'].map((s) => {
    const e = document.querySelector(s), c = getComputedStyle(e)
    return { s, size: parseFloat(c.fontSize), weight: Number(c.fontWeight), color: c.color, image: c.backgroundImage, bg: c.backgroundColor, clip: (c.webkitBackgroundClip || c.backgroundClip) === 'text' }
  }))
  const PAGE = [11, 17, 32]
  const before = failures
  for (const e of els) {
    const large = e.size >= 24 || (e.size >= 18.66 && e.weight >= 700)
    const need = e.s === '#back-top' ? 3 : large ? 3 : 4.5 // back-to-top is an icon: non-text contrast
    const pairs = e.clip ? stops(e.image).map((s) => [s, PAGE]) : (e.image !== 'none' ? stops(e.image) : [stops(e.bg)[0]]).map((b) => [stops(e.color)[0], b])
    const worst = Math.min(...pairs.map(([f, b]) => ratio(f, b)))
    if (worst < need) fail('index.html', `1.4.3 ${e.s} is ${worst.toFixed(2)}:1, needs ${need}:1`)
  }
  if (failures === before) ok('index.html: text on the gradients is at least 4.5:1, the large logo at least 3:1')
  await done(page)
}

await browser.close()
console.log(failures ? `\n${failures} failure${failures === 1 ? '' : 's'}` : '\nno WCAG 2.2 AA failure that these checks can see')
process.exitCode = failures ? 1 : 0
