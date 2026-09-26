/**
 * Живая проверка альбома: разворот на компьютере, одна страница на телефоне, перелистывание.
 *
 * Проверяем то, ради чего альбом сделан: страницы листаются (кнопкой, клавишами, свайпом),
 * содержимое действительно меняется, номер страницы честный, на телефоне ничего не уезжает
 * за экран. Отдельно следим, чтобы в разметке не оставалось второй копии страницы (дубли id
 * после перелистывания — такую ошибку уже находили).
 *
 * Запуск: node check.cjs   (сервер: python -m http.server 8090 в этой папке)
 */

const { chromium, devices } = require('playwright')

const BASE = process.env.ALBUM_URL || 'http://127.0.0.1:8090'
const SHOTS = require('node:path').join(__dirname, 'shots')

const done = []
const ok = (m) => {
  done.push(`✓ ${m}`)
  console.log(`✓ ${m}`)
}
const fail = (m) => {
  done.push(`✗ ${m}`)
  console.error(`✗ ${m}`)
}

async function main() {
  require('node:fs').mkdirSync(SHOTS, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome' })
  const errors = []

  // ── Компьютер: разворот из двух страниц ────────────────────────────────────
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })
  const page = await desktop.newPage()
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('.cover__title')
  ok(`обложка: «${await page.locator('.cover__title').innerText()}»`)

  const bookBox = await page.locator('.book').boundingBox()
  if (bookBox && bookBox.width > 800) ok(`разворот шириной ${Math.round(bookBox.width)} px — две страницы рядом`)
  else fail(`на широком экране разворот не сложился: ${JSON.stringify(bookBox)}`)

  const coverPages = await page.locator('.book__spread:visible').count()
  if (coverPages === 2) ok('на обложке видны обе половины разворота')
  else fail(`на обложке видно страниц: ${coverPages}`)

  await page.screenshot({ path: `${SHOTS}/01-cover-desktop.png` })

  // Содержание видно сразу справа: переходим к человеку прямо по ссылке.
  await page.locator('a:has-text("Николай Иванович")').first().click()
  await page.waitForTimeout(500)
  const personName = await page.locator('.person__name').first().innerText()
  const chips = await page.locator('.person__head + * , .page--person .chips li').count()
  ok(`страница человека: «${personName}», вкусов на странице: ${chips}`)
  await page.screenshot({ path: `${SHOTS}/02-person-desktop.png` })

  // Листание клавишей: содержимое должно поменяться
  const before = await page.locator('#page-label').innerText()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(950)
  const after = await page.locator('#page-label').innerText()
  if (before !== after) ok(`листание клавишей работает: «${before}» → «${after}»`)
  else fail(`клавиша не перелистнула: осталось «${before}»`)

  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(950)
  const backLabel = await page.locator('#page-label').innerText()
  if (backLabel === before) ok('листание назад возвращает на ту же страницу')
  else fail(`назад вернулось не туда: «${backLabel}» вместо «${before}»`)

  // После перелистывания в разметке не должно оставаться копии страницы (дублей id)
  const duplicateIds = await page.evaluate(() => {
    const counts = {}
    for (const el of document.querySelectorAll('[id]')) counts[el.id] = (counts[el.id] || 0) + 1
    return Object.entries(counts).filter(([, n]) => n > 1).map(([id]) => id)
  })
  if (duplicateIds.length === 0) ok('дублей id в разметке нет')
  else fail(`остались дубли id: ${duplicateIds.join(', ')}`)

  // Страница вкусов
  await page.locator('#to-start').click()
  await page.waitForTimeout(400)
  await page.locator('a:has-text("Что любили")').first().click()
  await page.waitForTimeout(500)
  const tasteCards = await page.locator('.taste-card').count()
  if (tasteCards >= 4) ok(`страница вкусов: карточек ${tasteCards}`)
  else fail(`на странице вкусов мало карточек: ${tasteCards}`)
  await page.screenshot({ path: `${SHOTS}/03-tastes-desktop.png` })

  // ── Телефон: одна страница и свайп ────────────────────────────────────────
  const phone = await browser.newContext({ ...devices['iPhone 13'], locale: 'ru-RU' })
  const mobile = await phone.newPage()
  mobile.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  mobile.on('pageerror', (e) => errors.push(e.message))

  await mobile.goto(BASE, { waitUntil: 'networkidle' })
  await mobile.waitForSelector('.cover__title')
  const visiblePages = await mobile.locator('.book__spread:visible').count()
  if (visiblePages === 1) ok('на телефоне показывается одна страница')
  else fail(`на телефоне видно страниц: ${visiblePages}`)

  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow <= 1) ok('горизонтальной прокрутки нет')
  else fail(`страница шире экрана на ${overflow} px`)

  await mobile.screenshot({ path: `${SHOTS}/04-cover-phone.png` })

  // Свайп влево — вперёд
  const mobileBook = await mobile.locator('.book').boundingBox()
  if (mobileBook) {
    const centerY = mobileBook.y + mobileBook.height / 2
    await mobile.evaluate(
      ([startX, endX, y]) => {
        const target = document.querySelector('.book')
        const touch = (type, x) =>
          target.dispatchEvent(
            new TouchEvent(type, {
              bubbles: true,
              cancelable: true,
              changedTouches: [new Touch({ identifier: 1, target, clientX: x, clientY: y })],
            }),
          )
        touch('touchstart', startX)
        touch('touchend', endX)
      },
      [mobileBook.x + mobileBook.width - 40, mobileBook.x + 40, centerY],
    )
    await mobile.waitForTimeout(950)
    const mobileLabel = await mobile.locator('#page-label').innerText()
    if (!mobileLabel.startsWith('Обложка')) ok(`свайп перелистнул: «${mobileLabel}»`)
    else fail(`свайп не сработал: «${mobileLabel}»`)
  }
  await mobile.screenshot({ path: `${SHOTS}/05-contents-phone.png` })

  // Кнопка «Дальше» с телефона: доходим до страницы человека и проверяем, что она читается
  await mobile.locator('#next-bottom').click()
  await mobile.waitForTimeout(950)
  const personVisible = await mobile.locator('.person__name').first().innerText().catch(() => '')
  if (personVisible) ok(`на телефоне открылась страница человека: «${personVisible}»`)
  else fail('страница человека на телефоне не открылась')

  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (mobileOverflow <= 1) ok('страница человека на телефоне тоже без прокрутки вбок')
  else fail(`на странице человека прокрутка вбок на ${mobileOverflow} px`)

  const mobileChips = await mobile.locator('.page--person .chips li').count()
  if (mobileChips > 0) ok(`вкусы на телефоне видны: ${mobileChips}`)
  else fail('на телефоне не видно вкусов')
  await mobile.screenshot({ path: `${SHOTS}/06-person-phone.png` })

  // ── Компьютер: страница книги должна влезать целиком ──────────────────────
  // Прокрутка внутри страницы альбома — признак того, что вёрстка не рассчитана: часть текста
  // остаётся за краем, а номер страницы налезает на содержимое. Пролистываем альбом до конца.
  await page.locator('#to-start').click()
  await page.waitForTimeout(300)
  const clipped = []
  for (let step = 0; step < 20; step += 1) {
    const over = await page.evaluate(() => {
      const bad = []
      for (const el of document.querySelectorAll('.page')) {
        if (el.offsetParent === null) continue
        const excess = el.scrollHeight - el.clientHeight
        if (excess > 6) bad.push(`${el.id || el.className}: ${excess} px`)
      }
      return bad
    })
    if (over.length) clipped.push(`${await page.locator('#page-label').innerText()} → ${over.join(', ')}`)

    if (await page.locator('#next-bottom').isDisabled()) break
    await page.locator('#next-bottom').click()
    await page.waitForTimeout(850)
  }
  if (clipped.length === 0) ok(`на компьютере все страницы влезают целиком (проверен весь альбом)`)
  else fail(`на компьютере обрезано: ${clipped.join(' | ')}`)

  // ── Телефон: страница прокручивается, но номер не должен лезть на текст ────
  // Идём к странице человека детерминированно (обложка → содержание → человек) и с коротким
  // сроком ожидания: если что-то не так, проверка должна сказать об этом сразу, а не через 30 с.
  await mobile.locator('#to-start').click({ timeout: 8000 })
  await mobile.waitForTimeout(400)
  await mobile.locator('#next-bottom').click({ timeout: 8000 })
  await mobile.waitForTimeout(900)
  await mobile.locator('#next-bottom').click({ timeout: 8000 })
  await mobile.waitForTimeout(900)

  const numberCheck = await mobile.evaluate(() => {
    const pageEl = document.querySelector('.page--person')
    const number = pageEl?.querySelector('.page-number')
    const lastChip = pageEl?.querySelector('.chips li:last-child')
    if (!pageEl || !number || !lastChip) return { ok: false, why: 'не нашёл элементы' }
    pageEl.scrollIntoView()
    const chipRect = lastChip.getBoundingClientRect()
    const numberRect = number.getBoundingClientRect()
    return {
      ok: numberRect.top >= chipRect.bottom - 2,
      why: `низ вкусов ${Math.round(chipRect.bottom)}, верх номера ${Math.round(numberRect.top)}`,
    }
  })
  if (numberCheck.ok) ok('на телефоне номер страницы не наезжает на текст')
  else fail(`номер страницы перекрывает текст: ${numberCheck.why}`)

  // Кнопка «Дальше» должна быть доступна в любой момент — её не перекрывает страница
  const pagerClickable = await mobile.evaluate(() => {
    const button = document.querySelector('#next-bottom')
    const rect = button.getBoundingClientRect()
    button.scrollIntoView({ block: 'center' })
    const after = button.getBoundingClientRect()
    const hit = document.elementFromPoint(after.left + after.width / 2, after.top + after.height / 2)
    return { ok: hit === button || button.contains(hit), hit: hit ? `${hit.tagName}.${hit.className}` : 'ничего' }
  })
  if (pagerClickable.ok) ok('на телефоне кнопку «Дальше» ничто не перекрывает')
  else fail(`кнопку «Дальше» перекрывает: ${pagerClickable.hit}`)

  const mobileNoSideScroll = await mobile.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (mobileNoSideScroll <= 1) ok('на телефоне по-прежнему нет прокрутки вбок')
  else fail(`на телефоне страница шире экрана на ${mobileNoSideScroll} px`)

  if (errors.length === 0) ok('ошибок в консоли нет')
  else fail(`ошибки в консоли: ${errors.slice(0, 3).join(' | ')}`)

  await browser.close()
  console.log(`\nИтог: успешно ${done.filter((s) => s.startsWith('✓')).length}, ошибок ${done.filter((s) => s.startsWith('✗')).length}`)
}

main().catch((error) => {
  fail(`скрипт упал: ${error.message}`)
  console.log(`\nИтог: успешно ${done.filter((s) => s.startsWith('✓')).length}, ошибок ${done.filter((s) => s.startsWith('✗')).length}`)
  process.exit(1)
})
