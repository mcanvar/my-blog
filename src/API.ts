/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreatePostInput = {
  id?: string | null,
  language: string,
  title: string,
  slug: string,
  description: string,
  content: string,
  createdAt?: string | null,
  type: string,
  updatedAt?: string | null,
};

export type ModelPostConditionInput = {
  language?: ModelStringInput | null,
  title?: ModelStringInput | null,
  slug?: ModelStringInput | null,
  description?: ModelStringInput | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  type?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelPostConditionInput | null > | null,
  or?: Array< ModelPostConditionInput | null > | null,
  not?: ModelPostConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type Post = {
  __typename: "Post",
  id: string,
  language: string,
  title: string,
  slug: string,
  description: string,
  content: string,
  createdAt: string,
  type: string,
  updatedAt: string,
  comments?: ModelCommentConnection | null,
  owner?: string | null,
};

export type ModelCommentConnection = {
  __typename: "ModelCommentConnection",
  items:  Array<Comment | null >,
  nextToken?: string | null,
};

export type Comment = {
  __typename: "Comment",
  id: string,
  post?: Post | null,
  content: string,
  createdAt: string,
  updatedAt: string,
  postCommentsId?: string | null,
  owner?: string | null,
};

export type UpdatePostInput = {
  id: string,
  language?: string | null,
  title?: string | null,
  slug?: string | null,
  description?: string | null,
  content?: string | null,
  createdAt?: string | null,
  type?: string | null,
  updatedAt?: string | null,
};

export type DeletePostInput = {
  id: string,
};

export type CreateCommentInput = {
  id?: string | null,
  content: string,
  postCommentsId?: string | null,
};

export type ModelCommentConditionInput = {
  content?: ModelStringInput | null,
  and?: Array< ModelCommentConditionInput | null > | null,
  or?: Array< ModelCommentConditionInput | null > | null,
  not?: ModelCommentConditionInput | null,
  postCommentsId?: ModelIDInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type UpdateCommentInput = {
  id: string,
  content?: string | null,
  postCommentsId?: string | null,
};

export type DeleteCommentInput = {
  id: string,
};

export type ModelPostFilterInput = {
  id?: ModelIDInput | null,
  language?: ModelStringInput | null,
  title?: ModelStringInput | null,
  slug?: ModelStringInput | null,
  description?: ModelStringInput | null,
  content?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  type?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelPostFilterInput | null > | null,
  or?: Array< ModelPostFilterInput | null > | null,
  not?: ModelPostFilterInput | null,
};

export type ModelPostConnection = {
  __typename: "ModelPostConnection",
  items:  Array<Post | null >,
  nextToken?: string | null,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelCommentFilterInput = {
  id?: ModelIDInput | null,
  content?: ModelStringInput | null,
  and?: Array< ModelCommentFilterInput | null > | null,
  or?: Array< ModelCommentFilterInput | null > | null,
  not?: ModelCommentFilterInput | null,
  postCommentsId?: ModelIDInput | null,
};

export type CreatePostMutationVariables = {
  input: CreatePostInput,
  condition?: ModelPostConditionInput | null,
};

export type CreatePostMutation = {
  createPost?:  {
    __typename: "Post",
    id: string,
    language: string,
    title: string,
    slug: string,
    description: string,
    content: string,
    createdAt: string,
    type: string,
    updatedAt: string,
    comments?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        content: string,
        createdAt: string,
        updatedAt: string,
        postCommentsId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    owner?: string | null,
  } | null,
};

export type UpdatePostMutationVariables = {
  input: UpdatePostInput,
  condition?: ModelPostConditionInput | null,
};

export type UpdatePostMutation = {
  updatePost?:  {
    __typename: "Post",
    id: string,
    language: string,
    title: string,
    slug: string,
    description: string,
    content: string,
    createdAt: string,
    type: string,
    updatedAt: string,
    comments?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        content: string,
        createdAt: string,
        updatedAt: string,
        postCommentsId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    owner?: string | null,
  } | null,
};

export type DeletePostMutationVariables = {
  input: DeletePostInput,
  condition?: ModelPostConditionInput | null,
};

export type DeletePostMutation = {
  deletePost?:  {
    __typename: "Post",
    id: string,
    language: string,
    title: string,
    slug: string,
    description: string,
    content: string,
    createdAt: string,
    type: string,
    updatedAt: string,
    comments?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        content: string,
        createdAt: string,
        updatedAt: string,
        postCommentsId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    owner?: string | null,
  } | null,
};

export type CreateCommentMutationVariables = {
  input: CreateCommentInput,
  condition?: ModelCommentConditionInput | null,
};

export type CreateCommentMutation = {
  createComment?:  {
    __typename: "Comment",
    id: string,
    post?:  {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    postCommentsId?: string | null,
    owner?: string | null,
  } | null,
};

export type UpdateCommentMutationVariables = {
  input: UpdateCommentInput,
  condition?: ModelCommentConditionInput | null,
};

export type UpdateCommentMutation = {
  updateComment?:  {
    __typename: "Comment",
    id: string,
    post?:  {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    postCommentsId?: string | null,
    owner?: string | null,
  } | null,
};

export type DeleteCommentMutationVariables = {
  input: DeleteCommentInput,
  condition?: ModelCommentConditionInput | null,
};

export type DeleteCommentMutation = {
  deleteComment?:  {
    __typename: "Comment",
    id: string,
    post?:  {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    postCommentsId?: string | null,
    owner?: string | null,
  } | null,
};

export type GetPostQueryVariables = {
  id: string,
};

export type GetPostQuery = {
  getPost?:  {
    __typename: "Post",
    id: string,
    language: string,
    title: string,
    slug: string,
    description: string,
    content: string,
    createdAt: string,
    type: string,
    updatedAt: string,
    comments?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        content: string,
        createdAt: string,
        updatedAt: string,
        postCommentsId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    owner?: string | null,
  } | null,
};

export type ListPostsQueryVariables = {
  filter?: ModelPostFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPostsQuery = {
  listPosts?:  {
    __typename: "ModelPostConnection",
    items:  Array< {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type PostsByDateQueryVariables = {
  language: string,
  createdAt?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelPostFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type PostsByDateQuery = {
  postsByDate?:  {
    __typename: "ModelPostConnection",
    items:  Array< {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetCommentQueryVariables = {
  id: string,
};

export type GetCommentQuery = {
  getComment?:  {
    __typename: "Comment",
    id: string,
    post?:  {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    postCommentsId?: string | null,
    owner?: string | null,
  } | null,
};

export type ListCommentsQueryVariables = {
  filter?: ModelCommentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListCommentsQuery = {
  listComments?:  {
    __typename: "ModelCommentConnection",
    items:  Array< {
      __typename: "Comment",
      id: string,
      post?:  {
        __typename: "Post",
        id: string,
        language: string,
        title: string,
        slug: string,
        description: string,
        content: string,
        createdAt: string,
        type: string,
        updatedAt: string,
        owner?: string | null,
      } | null,
      content: string,
      createdAt: string,
      updatedAt: string,
      postCommentsId?: string | null,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreatePostSubscriptionVariables = {
  owner?: string | null,
};

export type OnCreatePostSubscription = {
  onCreatePost?:  {
    __typename: "Post",
    id: string,
    language: string,
    title: string,
    slug: string,
    description: string,
    content: string,
    createdAt: string,
    type: string,
    updatedAt: string,
    comments?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        content: string,
        createdAt: string,
        updatedAt: string,
        postCommentsId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    owner?: string | null,
  } | null,
};

export type OnUpdatePostSubscriptionVariables = {
  owner?: string | null,
};

export type OnUpdatePostSubscription = {
  onUpdatePost?:  {
    __typename: "Post",
    id: string,
    language: string,
    title: string,
    slug: string,
    description: string,
    content: string,
    createdAt: string,
    type: string,
    updatedAt: string,
    comments?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        content: string,
        createdAt: string,
        updatedAt: string,
        postCommentsId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    owner?: string | null,
  } | null,
};

export type OnDeletePostSubscriptionVariables = {
  owner?: string | null,
};

export type OnDeletePostSubscription = {
  onDeletePost?:  {
    __typename: "Post",
    id: string,
    language: string,
    title: string,
    slug: string,
    description: string,
    content: string,
    createdAt: string,
    type: string,
    updatedAt: string,
    comments?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        content: string,
        createdAt: string,
        updatedAt: string,
        postCommentsId?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    owner?: string | null,
  } | null,
};

export type OnCreateCommentSubscriptionVariables = {
  owner?: string | null,
};

export type OnCreateCommentSubscription = {
  onCreateComment?:  {
    __typename: "Comment",
    id: string,
    post?:  {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    postCommentsId?: string | null,
    owner?: string | null,
  } | null,
};

export type OnUpdateCommentSubscriptionVariables = {
  owner?: string | null,
};

export type OnUpdateCommentSubscription = {
  onUpdateComment?:  {
    __typename: "Comment",
    id: string,
    post?:  {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    postCommentsId?: string | null,
    owner?: string | null,
  } | null,
};

export type OnDeleteCommentSubscriptionVariables = {
  owner?: string | null,
};

export type OnDeleteCommentSubscription = {
  onDeleteComment?:  {
    __typename: "Comment",
    id: string,
    post?:  {
      __typename: "Post",
      id: string,
      language: string,
      title: string,
      slug: string,
      description: string,
      content: string,
      createdAt: string,
      type: string,
      updatedAt: string,
      comments?:  {
        __typename: "ModelCommentConnection",
        nextToken?: string | null,
      } | null,
      owner?: string | null,
    } | null,
    content: string,
    createdAt: string,
    updatedAt: string,
    postCommentsId?: string | null,
    owner?: string | null,
  } | null,
};
