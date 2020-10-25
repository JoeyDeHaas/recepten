import {useGetIntId} from "./useGetIntId";
import {useRecipeQuery} from "../generated/graphql";

export const useGetRecipeFromUrl = () => {
  const intId = useGetIntId();
  return useRecipeQuery({
    skip: intId === -1,
    variables: {
      id: intId,
    },
  });
};
