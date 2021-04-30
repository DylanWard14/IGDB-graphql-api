import { ApolloServer, gql } from "apollo-server";
import dotenv from "dotenv";
import GamesAPI from "./GamesAPI";
import { Resolvers } from "./resolvers-types";

dotenv.config();

// gql`` parses your string into an AST (Abstract Syntax Tree)
const typeDefs = gql`
  type Platform {
    id: ID!
    name: String
    slug: String
  }

  type Game {
    id: ID!
    name: String
    platforms: [Platform]
  }

  type Query {
    games: [Game]
    game(id: Int!): Game
  }
`;

const resolvers: Resolvers = {
  Query: {
    games: async (_, __, { dataSources }) =>
      await dataSources.gamesAPI.getGames(),
    game: async (_, { id }, { dataSources }) =>
      await dataSources.gamesAPI.getGameById(id),
  },
  Game: {
    platforms: async (parent, _, { dataSources }) => {
      if (!parent.platforms) {
        return [];
      }
      const mappedPlatforms = await Promise.all(
        parent.platforms.map(async (platformId) => {
          const platform = await dataSources.gamesAPI.getPlatformById(
            platformId
          );
          return platform;
        })
      );
      return mappedPlatforms;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    gamesAPI: new GamesAPI(),
  }),
  introspection: true,
  playground: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server started at ${url}`);
});
