import type {
  AdminComment,
  AdminPost,
  CommentStatus,
  Locale,
  PostRevision,
  SiteSettings,
} from '../../types'

export type PostWrite = Omit<AdminPost, 'id' | 'createdAt' | 'updatedAt'>

export interface CommentPatch {
  status?: CommentStatus
  body?: string
}

export interface AuthorReplyInput {
  parent: AdminComment
  body: string
  authorName: string
}

export interface AdminRepository {
  listPosts(): Promise<AdminPost[]>
  getPost(id: string): Promise<AdminPost | null>
  findPostsBySlug(locale: Locale, slug: string): Promise<AdminPost[]>
  createPost(input: PostWrite): Promise<AdminPost>
  updatePost(id: string, input: PostWrite): Promise<AdminPost>
  deletePost(id: string): Promise<void>

  listRevisions(postId: string): Promise<PostRevision[]>
  getRevision(id: string): Promise<PostRevision | null>
  createRevision(post: AdminPost, note: string | null): Promise<void>

  listComments(status: CommentStatus): Promise<AdminComment[]>
  countComments(status: CommentStatus): Promise<number>
  getComment(id: string): Promise<AdminComment | null>
  updateComment(id: string, patch: CommentPatch, expiresAt: number | null): Promise<void>
  deleteComment(id: string): Promise<void>
  createAuthorReply(input: AuthorReplyInput): Promise<void>

  getSettings(): Promise<SiteSettings>
  saveSettings(settings: SiteSettings): Promise<void>
}
