import { describe, it, expect } from 'vitest'
import esJson from '../../../i18n/locales/es.json' with { type: 'json' }
import enJson from '../../../i18n/locales/en.json' with { type: 'json' }

type Tree = { [k: string]: string | string[] | Tree }

/**
 * Parity check entre locales: es vs en deben tener MISMA estructura de keys.
 * Una key en es pero no en en (o viceversa) rompe la UI de inmediato cuando
 * el usuario cambia de idioma.
 */

function collectKeys(obj: Tree, prefix = ''): string[] {
  const keys: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string' || Array.isArray(v)) {
      keys.push(path)
    } else if (v && typeof v === 'object') {
      keys.push(...collectKeys(v as Tree, path))
    }
  }
  return keys
}

function collectStringValues(obj: Tree, prefix = ''): Array<{ path: string; value: string }> {
  const results: Array<{ path: string; value: string }> = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      results.push({ path, value: v })
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === 'string') results.push({ path: `${path}[${i}]`, value: item })
      })
    } else if (v && typeof v === 'object') {
      results.push(...collectStringValues(v as Tree, path))
    }
  }
  return results
}

describe('i18n parity: es.json vs en.json', () => {
  const esKeys = new Set(collectKeys(esJson as Tree))
  const enKeys = new Set(collectKeys(enJson as Tree))

  it('total de keys coincide entre es y en', () => {
    expect(esKeys.size).toBe(enKeys.size)
  })

  it('keys presentes en es también están en en', () => {
    const missingInEn = [...esKeys].filter(k => !enKeys.has(k))
    if (missingInEn.length > 0) {
      console.error('Keys missing in en.json:', missingInEn)
    }
    expect(missingInEn).toEqual([])
  })

  it('keys presentes en en también están en es', () => {
    const missingInEs = [...enKeys].filter(k => !esKeys.has(k))
    if (missingInEs.length > 0) {
      console.error('Keys missing in es.json:', missingInEs)
    }
    expect(missingInEs).toEqual([])
  })
})

describe('i18n syntax: vue-i18n v11 conventions', () => {
  const allValues = [
    ...collectStringValues(esJson as Tree),
    ...collectStringValues(enJson as Tree),
  ]

  it('no hay sintaxis `{{var}}` (react-i18next inválida en vue-i18n)', () => {
    const bad = allValues.filter(({ value }) => /\{\{[^}]+\}\}/.test(value))
    if (bad.length > 0) {
      console.error('Invalid {{var}} syntax found:', bad)
    }
    expect(bad).toEqual([])
  })

  it('no hay `@` suelto en valores (reservado por linked-messages, debe ser `{\'@\'}` si es literal)', () => {
    // Allow `@:` (linked-message prefix legítimo) — lo filtramos del check.
    // Allow `@.` modifier y `@key` patterns. Fallamos si `@` aparece fuera de esos patrones.
    const bad = allValues.filter(({ value }) => {
      // Quita secuencias válidas de linked-message para validar el resto
      const cleaned = value
        .replace(/@:[\w.]+/g, '')     // @:linked.key
        .replace(/@\.\w+/g, '')       // @.modifier
        .replace(/\{'@'\}/g, '')      // escape literal {'@'}
      return cleaned.includes('@')
    })
    if (bad.length > 0) {
      console.warn('Possible unescaped @ in values (verify each):', bad.map(b => b.path))
    }
    // Si algún valor usa email literal "admin@hotel.com" romperá vue-i18n al parsearse como linked.
    // El proyecto documenta esto en CLAUDE.md y HACE hardcode de emails en templates.
    // El `@` en locales es bug real.
    expect(bad.length).toBe(0)
  })

  it('pluralización usa pipe `singular | plural` (no `_one`/`_other` de i18next)', () => {
    // Keys terminadas en _one, _two, _other (i18next conventions) no deben existir
    const allKeys = [...collectKeys(esJson as Tree), ...collectKeys(enJson as Tree)]
    const bad = allKeys.filter(k => /_(?:one|two|few|many|other|zero)$/.test(k))
    expect(bad).toEqual([])
  })

  it('interpolación usa `{var}` (vue-i18n), no `%{var}` (ruby/rails) ni `$t{var}`', () => {
    const bad = allValues.filter(({ value }) =>
      /%\{[^}]+\}/.test(value) || /\$t\{[^}]+\}/.test(value),
    )
    expect(bad).toEqual([])
  })
})

describe('i18n coverage: keys usadas en código existen en locales', () => {
  // Este test es una primera línea de defensa — NO garantiza que todas las
  // `t('foo.bar')` del código tengan la key. Una herramienta dedicada como
  // vue-i18n-extract es mejor para coverage exhaustivo. Aquí solo validamos
  // un subset crítico de keys conocidas.
  const criticalKeys = [
    'common.save', 'common.cancel', 'common.close', 'common.change',
    'nav.dashboard', 'nav.transactions', 'nav.links', 'nav.logout',
    'auth.welcomeBack', 'auth.continueWithEmail', 'auth.email', 'auth.password',
    'errors.somethingWrong', 'errors.retry', 'errors.noResults', 'errors.sessionExpired',
    'filters.all', 'filters.anyDate', 'filters.today', 'filters.last7days', 'filters.thisMonth',
    'settings.personalInfo', 'settings.notificationPrefs', 'settings.activeSessions',
    'pagination.showingPage',
    'calendar.monthsShort', // array — R3 #9 fix
  ]

  it.each(criticalKeys)('key crítica "%s" existe en es.json', (key) => {
    const esKeys = new Set(collectKeys(esJson as Tree))
    expect(esKeys.has(key)).toBe(true)
  })

  it.each(criticalKeys)('key crítica "%s" existe en en.json', (key) => {
    const enKeys = new Set(collectKeys(enJson as Tree))
    expect(enKeys.has(key)).toBe(true)
  })
})
