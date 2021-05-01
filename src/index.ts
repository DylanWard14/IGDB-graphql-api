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

  type Involved_Company {
    id: ID!
    developer: Boolean
    publisher: Boolean
    porting: Boolean
    supporting: Boolean
    company: Company
  }

  type Company {
    id: ID!
    name: String
    developed: [Game]
    published: [Game]
  }

  type Game {
    id: ID!
    name: String
    platforms: [Platform]
    involved_companies: [Involved_Company]
  }

  type Query {
    games: [Game]
    game(id: Int!): Game
    company(id: Int!): Company
  }
`;

const resolvers: Resolvers = {
  Query: {
    games: async (_, __, { dataSources }) =>
      await dataSources.gamesAPI.getGames(),
    game: async (_, { id }, { dataSources }) =>
      await dataSources.gamesAPI.getGameById(id),
    company: async (_, { id }, { dataSources }) =>
      await dataSources.gamesAPI.getCompanyById(id),
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
    involved_companies: async (parent, _, { dataSources }) => {
      if (!parent.involved_companies) {
        return [];
      }
      const mappedCompanies = await Promise.all(
        parent.involved_companies.map(async (involvedCompanyId) => {
          const involvedCompany = await dataSources.gamesAPI.getInvolvedCompanyById(
            involvedCompanyId
          );
          return involvedCompany;
        })
      );
      return mappedCompanies;
    },
  },
  Involved_Company: {
    company: async ({ company }, _, { dataSources }) => {
      if (!company) {
        return null;
      }

      return await dataSources.gamesAPI.getCompanyById(company);
    },
  },
  Company: {
    // NOTE: developed and published are using the same data loader
    // This means that instead of having a limit of 500 items each
    // It is a limit of 500 items total (Due to rate limiting enforced by IGDB)
    // This causes items to return as null. Will need to add pagination to this.
    developed: async (parent, _, { dataSources }) => {
      if (!parent.developed) {
        return [];
      }
      const mappedGames = await Promise.all(
        parent.developed.map(async (gameId) => {
          const game = await dataSources.gamesAPI.getGameById(gameId);
          return game;
        })
      );
      return mappedGames;
    },
    published: async (parent, _, { dataSources }) => {
      if (!parent.published) {
        return [];
      }
      const mappedGames = await Promise.all(
        parent.published.map(async (gameId) => {
          const game = await dataSources.gamesAPI.getGameById(gameId);
          return game;
        })
      );
      return mappedGames;
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
