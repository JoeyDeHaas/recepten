import {Cache, cacheExchange, Resolver} from "@urql/exchange-graphcache";
import {dedupExchange, Exchange, fetchExchange, stringifyVariables} from "urql";
import {pipe, tap} from "wonka";
import {
  DeleteRecipeMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables
} from "../generated/graphql";
import {betterUpdateQuery} from "./betterUpdateQuery";
import Router from "next/router";
import gql from "graphql-tag";
import {isServer} from "./isServer";

const errorExchange: Exchange = ({forward}) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({error}) => {
      if (error?.message.includes("not authenticated")) {
        Router.replace("/login");
      }
    })
  );
};

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const {parentKey: entityKey, fieldName} = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "recipes"
    );
    info.partial = !isItInTheCache;
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "recipes") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });

    return {
      __typename: "PaginatedRecipes",
      hasMore,
      recipes: results,
    };
  };
};

function invalidateAllRecipes(cache: Cache) {
  const allFields = cache.inspectFields("Query");
  const fieldInfos = allFields.filter((info) => info.fieldName === "recipes");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "recipes", fi.arguments || {});
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

    return {
      url: process.env.NEXT_PUBLIC_API_URL as string,
      fetchOptions: {
        credentials: "include" as const,
        headers: cookie
          ? {
            cookie,
          }
          : undefined,
      },
        exchanges: [
          dedupExchange,
            cacheExchange({
              keys: {
                PaginatedRecipes: () => null,
              },
              resolvers: {
                Query: {
                  recipes: cursorPagination(),
                },
              },
                updates: {
                    Mutation: {
                      deleteRecipe: (_result, args, cache, info) => {
                        cache.invalidate({
                          __typename: "Recipe",
                          id: (args as DeleteRecipeMutationVariables).id,
                        });
                      },
                        vote: (_result, args, cache, info) => {
                          const {recipeId, value} = args as VoteMutationVariables;
                            const data = cache.readFragment(
                              gql`
                                  fragment _ on Recipe {
                                      id
                                      points
                                      voteStatus
                                  }
                              `,
                              {id: recipeId} as any
                            );

                            if (data) {
                              if (data.voteStatus === value) {
                                return;
                              }
                              const newPoints =
                                (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                                cache.writeFragment(
                                  gql`
                                      fragment __ on Recipe {
                                          points
                                          voteStatus
                                      }
                                  `,
                                  {id: recipeId, points: newPoints, voteStatus: value} as any
                                );
                            }
                        },
                      createRecipe: (_result, args, cache, info) => {
                        invalidateAllRecipes(cache);
                      },
                      logout: (_result, args, cache, info) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                          cache,
                          {query: MeDocument},
                          _result,
                          () => ({me: null})
                        );
                      },
                      login: (_result, args, cache, info) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(
                          cache,
                          {query: MeDocument},
                          _result,
                          (result, query) => {
                            if (result.login.errors) {
                              return query;
                            } else {
                              return {
                                me: result.login.user,
                              };
                            }
                          }
                        );
                        invalidateAllRecipes(cache);
                      },
                      register: (_result, args, cache, info) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                          cache,
                          {query: MeDocument},
                          _result,
                          (result, query) => {
                            if (result.register.errors) {
                              return query;
                            } else {
                              return {
                                me: result.register.user,
                              };
                            }
                          }
                        );
                      },
                    },
                },
            }),
          errorExchange,
          ssrExchange,
          fetchExchange,
        ],
    };
};
