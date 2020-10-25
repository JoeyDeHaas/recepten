import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useGetIntId } from "../../../utils/useGetIntId";
import { withApollo } from "../../../utils/withApollo";
import {useRecipeQuery, useUpdateRecipeMutation} from "../../../generated/graphql";

const EditRecipe = ({}) => {
  const router = useRouter();
  const intId = useGetIntId();
  const { data, loading } = useRecipeQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [updateRecipe] = useUpdateRecipeMutation();
  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  }

  if (!data?.recipe) {
    return (
      <Layout>
        <Box>could not find recipe</Box>
      </Layout>
    );
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.recipe.title, preparation: data.recipe.preparation, preparationTime: data.recipe.preparationTime }}
        onSubmit={async (values) => {
          await updateRecipe({ variables: { id: intId, ...values } });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="title" label="Title" />
            <InputField name="preparationTime" placeholder="preparation time" label="Preparation time" />
            <Box mt={4}>
              <InputField
                textarea
                name="preparation"
                placeholder="preparation ..."
                label="Body"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              update recipe
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditRecipe);
