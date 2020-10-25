import {Box, Button} from "@chakra-ui/core";
import {Form, Formik} from "formik";
import {useRouter} from "next/router";
import React from "react";
import {InputField} from "../components/InputField";
import {Layout} from "../components/Layout";
import {useIsAuth} from "../utils/useIsAuth";
import {withApollo} from "../utils/withApollo";
import {useCreateRecipeMutation} from "../generated/graphql";

const CreateRecipe: React.FC = () => {
  const router = useRouter();
  useIsAuth();
  const [createRecipe] = useCreateRecipeMutation();
  return (
    <Layout variant="small">
      <Formik
        initialValues={{title: "", preparationTime: "", preparation: ""}}
        onSubmit={async (values) => {
          const {errors} = await createRecipe({
            variables: {input: values},
            update: (cache) => {
              cache.evict({fieldName: "recipes:{}"});
            },
          });
          if (!errors) {
            router.push("/");
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField name="title" placeholder="Pasta carbonara" label="Recept titel"/>
            <Box mt={4}>
              <InputField name="preparationTime" placeholder="15 min" label="Bereidingstijd"/>
            </Box>
            <Box mt={4}>
              <InputField
                textarea
                name="preparation"
                placeholder="Kook de pasta in een pan"
                label="Bereidingswijze"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
            >
              Recept aanmaken
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ssr: false})(CreateRecipe);
