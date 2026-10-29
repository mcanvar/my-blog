import type { AdminPost } from '../../types'
import { fixtureStore } from '../fixtures/store'
import type { AdminRepository } from './repository'

const now = () => new Date().toISOString()
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`

export const fixtureRepository: AdminRepository = {
  async listPosts() {
    return [...fixtureStore().posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
  async getPost(id) {
    return fixtureStore().posts.find((p) => p.id === id) ?? null
  },
  async findPostsBySlug(locale, slug) {
    return fixtureStore().posts.filter((p) => p.locale === locale && p.slug === slug)
  },
  async createPost(input) {
    const post: AdminPost = { ...input, id: newId('p'), createdAt: now(), updatedAt: now() }
    fixtureStore().posts.push(post)
    return post
  },
  async updatePost(id, input) {
    const store = fixtureStore()
    const index = store.posts.findIndex((p) => p.id === id)
    const existing = store.posts[index]
    if (!existing) throw new Error('Post not found')
    const post: AdminPost = { ...existing, ...input, id, updatedAt: now() }
    store.posts[index] = post
    return post
  },
  async deletePost(id) {
    const store = fixtureStore()
    store.posts = store.posts.filter((p) => p.id !== id)
    store.revisions = store.revisions.filter((r) => r.postId !== id)
  },

  async listRevisions(postId) {
    return fixtureStore()
      .revisions.filter((r) => r.postId === postId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async getRevision(id) {
    return fixtureStore().revisions.find((r) => r.id === id) ?? null
  },
  async createRevision(post, note) {
    fixtureStore().revisions.push({
      id: newId('r'),
      postId: post.id,
      createdAt: now(),
      note,
      snapshot: structuredClone(post),
    })
  },

  async listComments(status) {
    return fixtureStore()
      .comments.filter((c) => c.status === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  async countComments(status) {
    return fixtureStore().comments.filter((c) => c.status === status).length
  },
  async getComment(id) {
    return fixtureStore().comments.find((c) => c.id === id) ?? null
  },
  async updateComment(id, patch) {
    const comment = fixtureStore().comments.find((c) => c.id === id)
    if (!comment) throw new Error('Comment not found')
    Object.assign(comment, patch)
  },
  async deleteComment(id) {
    const store = fixtureStore()
    store.comments = store.comments.filter((c) => c.id !== id && c.parentId !== id)
  },
  async createAuthorReply({ parent, body, authorName }) {
    fixtureStore().comments.push({
      id: newId('c'),
      postId: parent.postId,
      postSlug: parent.postSlug,
      postLocale: parent.postLocale,
      postTitle: parent.postTitle,
      parentId: parent.parentId ?? parent.id,
      authorName,
      body,
      createdAt: now(),
      isAuthorReply: true,
      status: 'APPROVED',
      recaptchaScore: null,
    })
  },

  async getSettings() {
    return fixtureStore().settings
  },
  async saveSettings(settings) {
    fixtureStore().settings = settings
  },
}
