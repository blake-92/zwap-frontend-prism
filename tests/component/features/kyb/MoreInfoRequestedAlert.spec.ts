import { describe, it, expect } from 'vitest'
import MoreInfoRequestedAlert from '~/components/features/kyb/MoreInfoRequestedAlert.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'

describe('MoreInfoRequestedAlert — render JSONB del back-office', () => {
  it('role=alert + aria-live=assertive (anuncio inmediato a SR)', () => {
    const w = mountComponent(MoreInfoRequestedAlert, { props: { data: { fields: [], documents: [] } } })
    const root = w.find('[role="alert"]')
    expect(root.exists()).toBe(true)
    expect(root.attributes('aria-live')).toBe('assertive')
  })

  it('renderea title fijo desde i18n', () => {
    const w = mountComponent(MoreInfoRequestedAlert, { props: { data: { fields: [], documents: [] } } })
    expect(w.html()).toContain('El equipo necesita más información')
  })

  it('fields[] se muestra como <ul><li> con prettify camelCase → "Camel Case"', () => {
    const w = mountComponent(MoreInfoRequestedAlert, {
      props: { data: { fields: ['expectedMonthlyVolumeCents', 'mccCode'], documents: [] } },
    })
    const items = w.findAll('ul li')
    const labels = items.map((i) => i.text())
    expect(labels).toContain('Expected Monthly Volume Cents')
    expect(labels).toContain('Mcc Code')
  })

  it('documents[] usa kyb.documents.X cuando existe (BANK_STATEMENT)', () => {
    const w = mountComponent(MoreInfoRequestedAlert, {
      props: { data: { fields: [], documents: ['BANK_STATEMENT'] } },
    })
    expect(w.html()).toContain('Estado bancario')
  })

  it('documents[] desconocido cae al prettify del key (SCREAMING_SNAKE → Title Case)', () => {
    const w = mountComponent(MoreInfoRequestedAlert, {
      props: { data: { fields: [], documents: ['SOMETHING_RANDOM'] } },
    })
    expect(w.html()).toContain('Something Random')
  })

  it('fields vacío: muestra hint noFieldsHelp', () => {
    const w = mountComponent(MoreInfoRequestedAlert, { props: { data: { fields: [], documents: [] } } })
    expect(w.html()).toContain('Sin campos específicos pedidos')
    expect(w.html()).toContain('Sin documentos específicos pedidos')
  })

  it('note se muestra cuando viene', () => {
    const w = mountComponent(MoreInfoRequestedAlert, {
      props: { data: { fields: [], documents: [], note: 'Por favor adjuntá un extracto reciente.' } },
    })
    expect(w.html()).toContain('Por favor adjuntá un extracto reciente.')
  })

  it('requestedAt ISO se formatea como fecha legible', () => {
    const w = mountComponent(MoreInfoRequestedAlert, {
      props: { data: { fields: [], documents: [], requestedAt: '2026-04-15T10:00:00Z' } },
    })
    // No assertamos formato exacto (depende de locale del runtime), solo que el header lo muestra
    const html = w.html()
    expect(html).toMatch(/Solicitado/)
    // Y no escupe el ISO crudo
    expect(html).not.toContain('2026-04-15T10:00:00Z')
  })

  it('data sin fields/documents (campos undefined): no rompe', () => {
    const w = mountComponent(MoreInfoRequestedAlert, { props: { data: {} } })
    expect(w.find('[role="alert"]').exists()).toBe(true)
  })
})
