import { defaultSettings } from '../../site'
import type { AdminComment, AdminPost, PostRevision, SiteSettings } from '../../types'
import { buildFixturePosts } from './posts'

interface FixtureStore {
  posts: AdminPost[]
  comments: AdminComment[]
  revisions: PostRevision[]
  settings: SiteSettings
}

function seedComments(): AdminComment[] {
  const base = {
    postId: 'p-migration-tr',
    postSlug: 'paristen-virginiaya-dynamodb-tasima-gunlugu',
    postLocale: 'tr' as const,
    postTitle: "Paris'ten Virginia'ya: DynamoDB taşıma günlüğü",
  }
  return [
    {
      ...base,
      id: 'c-1',
      parentId: null,
      authorName: 'Ayşe',
      body: 'Çok faydalı oldu, özellikle zaman damgalarını koruma kısmı. Teşekkürler!',
      createdAt: '2026-10-26T14:10:00.000Z',
      isAuthorReply: false,
      status: 'APPROVED',
      recaptchaScore: 0.9,
    },
    {
      ...base,
      id: 'c-2',
      parentId: 'c-1',
      authorName: 'Mevlüt Canvar',
      body: 'Ben teşekkür ederim, işine yaradıysa ne mutlu.',
      createdAt: '2026-10-26T16:40:00.000Z',
      isAuthorReply: true,
      status: 'APPROVED',
      recaptchaScore: null,
    },
    {
      ...base,
      id: 'c-3',
      parentId: null,
      authorName: 'Can',
      body: 'Görselleri S3’e kopyalarken boyutları nasıl sakladın?',
      createdAt: '2026-10-28T08:05:00.000Z',
      isAuthorReply: false,
      status: 'PENDING',
      recaptchaScore: 0.7,
    },
    {
      ...base,
      id: 'c-4',
      parentId: null,
      authorName: 'cheap pills',
      body: 'Best deals at http://spam.example http://spam.example',
      createdAt: '2026-10-28T09:00:00.000Z',
      isAuthorReply: false,
      status: 'SPAM',
      recaptchaScore: 0.1,
    },
  ]
}

const globalStore = globalThis as typeof globalThis & { __blogFixtureStore?: FixtureStore }

/** In-memory store shared by the public site and admin while running with fixtures. */
export function fixtureStore(): FixtureStore {
  globalStore.__blogFixtureStore ??= {
    posts: buildFixturePosts(),
    comments: seedComments(),
    revisions: [],
    settings: { ...defaultSettings, sameAs: ['https://github.com/mcanvar'] },
  }
  return globalStore.__blogFixtureStore
}
