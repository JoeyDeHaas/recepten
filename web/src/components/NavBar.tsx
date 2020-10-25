import React from "react";
import {Box, Button, Flex, Heading, Link} from "@chakra-ui/core";
import NextLink from "next/link";
import {useLogoutMutation, useMeQuery} from "../generated/graphql";
import {isServer} from "../utils/isServer";
import {useApolloClient} from "@apollo/client";

export const NavBar: React.FC = () => {
  const [logout, {loading: logoutFetching}] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const {data, loading} = useMeQuery({
    skip: isServer(),
  });

  let body = null;

  if (loading) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Inloggen</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Registreren</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex align="center">
        <NextLink href="/create-recipe">
          <Button as={Link} mr={4}>
            Recept Maken
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4}>
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <NextLink href="/">
          <Link>
            <Heading>Joey's Recepten</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
