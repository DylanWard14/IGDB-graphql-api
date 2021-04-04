const { ApolloServer, gql } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");

const typeDefs = gql`
  scalar Date

  enum Status {
    PLAYED
    INTERESTED
    NOT_INTERESTED
    UNKNOWN
  }

  type Developer {
    id: ID!
    name: String!
  }

  type Game {
    id: ID!
    title: String!
    releaseDate: Date
    rating: Int
    developer: Developer
    status: Status
  }

  type Query {
    games: [Game]
    game(id: ID): Game
  }
`;

const games = [
  {
    id: "asdf",
    title: "Call of Duty",
    releaseDate: new Date("04-11-2020"),
    rating: 5,
  },
  {
    id: "asdfaasdf",
    title: "Destiny",
    releaseDate: new Date("04-11-2020"),
    rating: 5,
    developer: {
      id: "asdfaqw",
      name: "Bungie",
    },
  },
];

const resolvers = {
  Query: {
    games: () => {
      return games;
    },
    game: (obj, { id }, context, info) => {
      const foundGame = games.find((game) => game.id === id);
      return foundGame;
    },
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "it's a date",
    parseValue(value) {
      // Value from the client
      return new Date(value);
    },
    serialize(value) {
      // value sent to the client
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server started at ${url}`);
});
