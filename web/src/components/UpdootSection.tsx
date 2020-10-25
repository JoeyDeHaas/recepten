import React, { useState } from "react";
import { Flex, IconButton } from "@chakra-ui/core";
import {
  RecipeSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from "../generated/graphql";
import gql from "graphql-tag";
import { ApolloCache } from "@apollo/client";

interface UpdootSectionProps {
  recipe: RecipeSnippetFragment;
}

const updateAfterVote = (
  value: number,
  recipeId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: "Recipe:" + recipeId,
    fragment: gql`
      fragment _ on Recipe {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints =
      (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: "Recipe:" + recipeId,
      fragment: gql`
        fragment __ on Recipe {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

export const UpdootSection: React.FC<UpdootSectionProps> = ({ recipe }) => {
  const [loadingState, setLoadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          if (recipe.voteStatus === 1) {
            return;
          }
          setLoadingState("updoot-loading");
          await vote({
            variables: {
              recipeId: recipe.id,
              value: 1,
            },
            update: (cache) => updateAfterVote(1, recipe.id, cache),
          });
          setLoadingState("not-loading");
        }}
        variantColor={recipe.voteStatus === 1 ? "green" : undefined}
        isLoading={loadingState === "updoot-loading"}
        aria-label="updoot recipe"
        icon="chevron-up"
      />
      {recipe.points}
      <IconButton
        onClick={async () => {
          if (recipe.voteStatus === -1) {
            return;
          }
          setLoadingState("downdoot-loading");
          await vote({
            variables: {
              recipeId: recipe.id,
              value: -1,
            },
            update: (cache) => updateAfterVote(-1, recipe.id, cache),
          });
          setLoadingState("not-loading");
        }}
        variantColor={recipe.voteStatus === -1 ? "red" : undefined}
        isLoading={loadingState === "downdoot-loading"}
        aria-label="downdoot recipe"
        icon="chevron-down"
      />
    </Flex>
  );
};
