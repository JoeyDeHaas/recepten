import {Box, Button, Flex, Heading, Link, Stack, Text} from "@chakra-ui/core";
import NextLink from "next/link";
import {EditDeleteRecipeButtons} from "../components/EditDeleteRecipeButtons";
import {Layout} from "../components/Layout";
import {UpdootSection} from "../components/UpdootSection";
import {useRecipesQuery} from "../generated/graphql";
import {withApollo} from "../utils/withApollo";
import React from "react";

const Index = () => {
  const {data, error, loading, fetchMore, variables} = useRecipesQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return (
      <div>
        <div>Het is niet gelukt om de recepten op te halen, probeer het later nog eens.</div>
        <div>{error?.message}</div>
      </div>
    );
  }

  return (
    <Layout>
      {!data && loading ? (
        <div>laden...</div>
      ) : (
        <Stack spacing={8}>
          {data!.recipes.recipes.map((recipe) =>
            !recipe ? null : (
              <Flex key={recipe.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection recipe={recipe}/>
                <Box flex={1}>
                  <NextLink href="/recipe/[id]" as={`/recipe/${recipe.id}`}>
                    <Link>
                      <Heading fontSize="xl">{recipe.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {recipe.creator.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {recipe.preparation}
                    </Text>
                    <Box ml="auto">
                      <EditDeleteRecipeButtons
                        id={recipe.id}
                        creatorId={recipe.creator.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
        </Stack>
      )}
      {data && data.recipes.hasMore ? (
        <Flex>
          <Button
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                  data.recipes.recipes[data.recipes.recipes.length - 1].createdAt,
                },
              });
            }}
            isLoading={loading}
            m="auto"
            my={8}
          >
            Meer recepten laden
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withApollo({ssr: true})(Index);
