export const postsByDate = /* GraphQL */ `
  query PostsByDate(
    $language: String!
    $sortDirection: ModelSortDirection
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    postsByDate(
      language: $language
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        language
        title
        slug
        content
        description
        createdAt
      }
      nextToken
    }
  }
`

export const listPostSlugsForISR = /* GraphQL */ `
  query ListPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        slug
      }
      nextToken
    }
  }
`

export const listPostsForISR = /* GraphQL */ `
  query ListPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        language
        title
        slug
        content
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`
