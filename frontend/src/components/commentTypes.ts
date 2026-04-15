// frontend/src/components/commentTypes.ts
import type { ServiceProvidingGroupProductApplicationCommentVisibility } from "../generated-client/types.gen";

export type { ServiceProvidingGroupProductApplicationCommentVisibility };

export type CommentRow = {
  id: number;
  authorId: number;
  content: string;
  visibility: ServiceProvidingGroupProductApplicationCommentVisibility;
  createdAt: string;
  authorName: string;
  authorParty: string;
  authorInitials: string;
  isCurrentUser: boolean;
};

export type PostCommentInput = {
  content: string;
  visibility: ServiceProvidingGroupProductApplicationCommentVisibility;
};
