import { defineFunction } from '@aws-amplify/backend'

/**
 * Serves the guest-facing read queries (listPublishedPosts, getPublishedPost,
 * listApprovedComments). It reads the model tables directly and only returns
 * PUBLISHED posts whose publishedAt has passed and APPROVED comments.
 */
export const publicReader = defineFunction({
  name: 'public-reader',
  entry: './handler.ts',
  runtime: 22,
  timeoutSeconds: 10,
  memoryMB: 512,
  resourceGroupName: 'data',
})
