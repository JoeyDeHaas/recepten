import React from "react";
import {Layout} from "../../components/Layout";
import {Box, Heading} from "@chakra-ui/core";
import {withApollo} from "../../utils/withApollo";
import {useGetRecipeFromUrl} from "../../utils/useGetRecipeFromUrl";
import {EditDeleteRecipeButtons} from "../../components/EditDeleteRecipeButtons";

const Recipe = ({}) => {
  const {data, error, loading} = useGetRecipeFromUrl();

  if (loading) {
    return (
      <Layout>
        <div>laden...</div>
      </Layout>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!data?.recipe) {
    return (
      <Layout>
        <Box>We konden het recept niet vinden, probeer het later nog eens.</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data.recipe.title}</Heading>
      <Box mb={4}>{data.recipe.preparation}</Box>
      <EditDeleteRecipeButtons
        id={data.recipe.id}
        creatorId={data.recipe.creator.id}
      />
    </Layout>
  );
};

export default withApollo({ssr: true})(Recipe);
