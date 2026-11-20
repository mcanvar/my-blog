import { describe, expect, it } from 'vitest'
import { isMediaObjectPath, mediaFilesFor, planUpload } from './paths'

const now = new Date('2026-11-20T12:00:00Z')

describe('planUpload', () => {
  it('names the file on the server and lists the responsive copies', () => {
    expect(planUpload({ name: 'Kapak Görseli!', width: 1600, height: 900 }, now, 'a1b2c3')).toEqual(
      {
        path: '/media/2026/kapak-gorseli-a1b2c3-rs-1600x900.webp',
        files: [
          { path: '/media/2026/kapak-gorseli-a1b2c3-rs-1600x900.webp', width: 1600 },
          { path: '/media/2026/kapak-gorseli-a1b2c3-rs-1600x900.w640.webp', width: 640 },
          { path: '/media/2026/kapak-gorseli-a1b2c3-rs-1600x900.w1200.webp', width: 1200 },
        ],
      }
    )
  })

  it('cannot be steered outside media/ by the name', () => {
    const plan = planUpload({ name: '../../admin/x', width: 100, height: 100 }, now, 'id0000')
    expect(plan?.path).toBe('/media/2026/admin-x-id0000-rs-100x100.webp')
    expect(planUpload({ name: '', width: 100, height: 100 }, now, 'id0000')?.path).toBe(
      '/media/2026/image-id0000-rs-100x100.webp'
    )
  })

  it('rejects sizes outside the limits', () => {
    expect(planUpload({ name: 'x', width: 2001, height: 10 }, now, 'id')).toBeNull()
    expect(planUpload({ name: 'x', width: 10, height: 0 }, now, 'id')).toBeNull()
    expect(planUpload({ name: 'x', width: 10.5, height: 10 }, now, 'id')).toBeNull()
  })
})

describe('media paths', () => {
  it('accepts media objects only', () => {
    expect(isMediaObjectPath('/media/2026/a-rs-100x100.webp')).toBe(true)
    expect(isMediaObjectPath('/media/../secrets')).toBe(false)
    expect(isMediaObjectPath('/media/2026/../../x')).toBe(false)
    expect(isMediaObjectPath('/other/x.webp')).toBe(false)
    expect(isMediaObjectPath('media/x.webp')).toBe(false)
  })

  it('deletes the responsive copies with the original', () => {
    expect(mediaFilesFor('/media/2026/a-rs-1600x900.webp')).toEqual([
      '/media/2026/a-rs-1600x900.webp',
      '/media/2026/a-rs-1600x900.w640.webp',
      '/media/2026/a-rs-1600x900.w1200.webp',
    ])
    expect(mediaFilesFor('/media/old.jpg')).toEqual(['/media/old.jpg'])
  })
})
