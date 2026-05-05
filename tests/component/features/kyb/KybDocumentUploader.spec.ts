import { describe, it, expect, vi, beforeEach } from 'vitest'
import KybDocumentUploader from '~/components/features/kyb/shared/KybDocumentUploader.vue'
import { mountComponent } from '../../../unit/helpers/mountComponent'
import { ApiError } from '~/utils/api'

const wizardUploadPersonMock = vi.fn()
const wizardUploadEntityMock = vi.fn()
const profileUploadPersonMock = vi.fn()
const profileUploadEntityMock = vi.fn()

vi.mock('~/composables/kyb/useKybApi', () => ({
  useKybApi: () => ({
    uploadPersonDocument: (...args: unknown[]) => wizardUploadPersonMock(...args),
    uploadEntityDocument: (...args: unknown[]) => wizardUploadEntityMock(...args),
  }),
}))
vi.mock('~/composables/kyb/useProfileFullApi', () => ({
  useProfileFullApi: () => ({
    uploadPersonDocument: (...args: unknown[]) => profileUploadPersonMock(...args),
    uploadEntityDocument: (...args: unknown[]) => profileUploadEntityMock(...args),
  }),
}))

beforeEach(() => {
  wizardUploadPersonMock.mockReset()
  wizardUploadEntityMock.mockReset()
  profileUploadPersonMock.mockReset()
  profileUploadEntityMock.mockReset()
})

function makeFile(opts: { name?: string; size?: number; type?: string } = {}) {
  const { name = 'doc.png', size = 1024, type = 'image/png' } = opts
  // Construir Blob real y agregarle propiedades de File-like.
  const blob = new Blob([new Uint8Array(size)], { type })
  return new File([blob], name, { type })
}

describe('KybDocumentUploader — validación client-side', () => {
  function mount(props = {}) {
    return mountComponent(KybDocumentUploader, {
      props: {
        documentType: 'CI_BO',
        scope: 'person',
        endpoint: 'wizard',
        label: 'Cédula de Identidad',
        ...props,
      },
    })
  }

  it('idle inicial: muestra trigger label', () => {
    const w = mount()
    expect(w.html()).toContain('Subir documento')
  })

  it('MIME inválido (zip): NO llama API, muestra error i18n', async () => {
    const w = mount()
    const file = makeFile({ name: 'evil.zip', type: 'application/zip', size: 100 })
    const input = w.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], writable: false })
    await input.trigger('change')

    expect(wizardUploadPersonMock).not.toHaveBeenCalled()
    expect(w.html()).toContain('Tipo de archivo no permitido')
  })

  it('archivo > 10MB: NO llama API, error i18n', async () => {
    const w = mount()
    const file = makeFile({ size: 11 * 1024 * 1024, type: 'image/png' })
    const input = w.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], writable: false })
    await input.trigger('change')

    expect(wizardUploadPersonMock).not.toHaveBeenCalled()
    expect(w.html()).toContain('supera 10 MB')
  })

  it('archivo válido: llama uploadPersonDocument con FormData + emite uploaded', async () => {
    wizardUploadPersonMock.mockResolvedValueOnce({ documentId: 'd-1', documentType: 'CI_BO', uploadedAt: '2026-05-04T00:00:00Z' })
    const w = mount()
    const file = makeFile({ name: 'ci.png', size: 5000, type: 'image/png' })
    const input = w.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], writable: false })
    await input.trigger('change')

    // Esperar a que la promesa del mock resuelva
    await vi.waitFor(() => {
      expect(wizardUploadPersonMock).toHaveBeenCalledTimes(1)
    })
    const fd = wizardUploadPersonMock.mock.calls[0][0] as FormData
    expect(fd.get('file')).toBeInstanceOf(File)
    expect(fd.get('documentType')).toBe('CI_BO')

    const emitted = w.emitted('uploaded')
    expect(emitted).toBeDefined()
    expect(emitted![0][0]).toMatchObject({ documentId: 'd-1' })
  })

  it('scope=entity + endpoint=wizard: usa uploadEntityDocument del wizard', async () => {
    wizardUploadEntityMock.mockResolvedValueOnce({ documentId: 'd-2', documentType: 'TAX_REGISTRATION', uploadedAt: '2026-05-04T00:00:00Z' })
    const w = mount({ scope: 'entity', documentType: 'TAX_REGISTRATION' })
    const file = makeFile({ name: 'tax.pdf', type: 'application/pdf' })
    const input = w.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], writable: false })
    await input.trigger('change')

    await vi.waitFor(() => {
      expect(wizardUploadEntityMock).toHaveBeenCalledTimes(1)
    })
    expect(wizardUploadPersonMock).not.toHaveBeenCalled()
  })

  it('endpoint=profile + scope=entity: usa profileApi.uploadEntityDocument con entityId', async () => {
    profileUploadEntityMock.mockResolvedValueOnce({ documentId: 'd-3', documentType: 'TAX_REGISTRATION', uploadedAt: '2026-05-04T00:00:00Z' })
    const w = mount({ endpoint: 'profile', scope: 'entity', documentType: 'TAX_REGISTRATION', entityId: 'e-99' })
    const file = makeFile({ name: 'tax.pdf', type: 'application/pdf' })
    const input = w.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], writable: false })
    await input.trigger('change')

    await vi.waitFor(() => {
      expect(profileUploadEntityMock).toHaveBeenCalledTimes(1)
    })
    expect(profileUploadEntityMock.mock.calls[0][0]).toBe('e-99')
  })

  it('error backend kyb_file_too_large: muestra error i18n correcto', async () => {
    wizardUploadPersonMock.mockRejectedValueOnce(new ApiError({ status: 413, code: 'kyb_file_too_large', message: 'archivo supera 10 MB' }))
    const w = mount()
    const file = makeFile({ name: 'tiny.png', size: 100, type: 'image/png' })
    const input = w.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', { value: [file], writable: false })
    await input.trigger('change')

    await vi.waitFor(() => {
      expect(w.html()).toContain('supera 10 MB')
    })
  })
})
