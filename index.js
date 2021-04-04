const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
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
    releaseDate: String
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
    releaseDate: "04-11-2020",
    rating: 5,
  },
  {
    id: "asdfaasdf",
    title: "Destiny",
    releaseDate: "04-11-2020",
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
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Server started at ${url}`);
});
