import React from "react";
import { Box, IconButton, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import { useDeleteRecipeMutation, useMeQuery} from "../generated/graphql";

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

export const EditDeleteRecipeButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const { data: meData } = useMeQuery();
  const [deleteRecipe] = useDeleteRecipeMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <Box>
      <NextLink href="/recipe/edit/[id]" as={`/recipe/edit/${id}`}>
        <IconButton as={Link} mr={4} icon="edit" aria-label="Edit Recipe" />
      </NextLink>
      <IconButton
        icon="delete"
        aria-label="Delete Recipe"
        onClick={() => {
          deleteRecipe({
            variables: { id },
            update: (cache) => {
              // Recipe:77
              cache.evict({ id: "Recipe:" + id });
            },
          });
        }}
      />
    </Box>
  );
};
