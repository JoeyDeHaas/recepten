import {createWithApollo} from "./createWithApollo";
import {ApolloClient, InMemoryCache} from "@apollo/client";
import {PaginatedRecipes} from "../generated/graphql";
import {NextPageContext} from "next";

const createClient = (ctx: NextPageContext) =>
  new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL as string,
    credentials: "include",
    headers: {
      cookie:
        (typeof window === "undefined"
          ? ctx?.req?.headers.cookie
          : undefined) || "",
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            recipes: {
              keyArgs: [],
              merge(
                existing: PaginatedRecipes | undefined,
                incoming: PaginatedRecipes
              ): PaginatedRecipes {
                return {
                  ...incoming,
                  recipes: [...(existing?.recipes || []), ...incoming.recipes],
                };
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
