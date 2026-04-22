import {
  ControllableUnitSuspensionComment,
  ControllableUnitSuspensionCommentVisibility,
  ServiceProviderProductApplicationComment,
  ServiceProviderProductApplicationCommentVisibility,
  ServiceProviderProductSuspensionComment,
  ServiceProviderProductSuspensionCommentVisibility,
  ServiceProvidingGroupGridPrequalificationComment,
  ServiceProvidingGroupGridPrequalificationCommentVisibility,
  ServiceProvidingGroupProductApplicationComment,
  ServiceProvidingGroupProductApplicationCommentVisibility,
  ServiceProvidingGroupProductSuspensionComment,
  ServiceProvidingGroupProductSuspensionCommentVisibility,
} from "../../generated-client/types.gen";

export type Comment =
  | ServiceProviderProductApplicationComment
  | ServiceProviderProductSuspensionComment
  | ServiceProvidingGroupGridPrequalificationComment
  | ServiceProvidingGroupProductApplicationComment
  | ServiceProvidingGroupProductSuspensionComment
  | ControllableUnitSuspensionComment;

export type Visibility =
  | ServiceProviderProductApplicationCommentVisibility
  | ServiceProviderProductSuspensionCommentVisibility
  | ServiceProvidingGroupGridPrequalificationCommentVisibility
  | ServiceProvidingGroupProductApplicationCommentVisibility
  | ServiceProvidingGroupProductSuspensionCommentVisibility
  | ControllableUnitSuspensionCommentVisibility;
