const { ApolloServer, gql } = require("apollo-server");
const dotenv = require("dotenv");
const GamesAPI = require("./GamesAPI");

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
    game(id: ID): Game
  }
`;

const resolvers = {
  Query: {
    games: async (_, __, { dataSources }) => {
      try {
        const response = await dataSources.gamesAPI.getGames();

        return response;
      } catch (e) {
        console.log("error: ", e);
        return [];
      }
    },
    game: async (_, { id }) => {
      try {
        return await Game.findById(id);
      } catch (e) {
        console.log("error: ", e);
        return {};
      }
    },
  },
  Game: {
    platforms: async (obj, _, { dataSources }) => {
      try {
        if (!obj.platforms) {
          return [];
        }
        const mappedPlatforms = await Promise.all(
          obj.platforms.map(async (platformId) => {
            const [platform] = await dataSources.gamesAPI.getPlatformById(
              platformId
            );
            return platform;
          })
        );
        return mappedPlatforms;
      } catch (e) {
        console.log("error:", e);
        return [];
      }
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
