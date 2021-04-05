const { ApolloServer, gql, PubSub } = require("apollo-server");
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_LOGIN}:${process.env.MONGODB_PASSWORD}@cluster0.pa2ux.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;

const gameSchema = new mongoose.Schema({
  title: String,
  releaseDate: Date,
  rating: Number,
  developerId: String,
  status: String,
});

const Game = mongoose.model("Game", gameSchema);

// gql`` parses your string into an AST (Abstract Syntax Tree)
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

  input DeveloperInput {
    id: ID
  }

  input GameInput {
    id: ID
    title: String
    releaseDate: Date
    rating: Int
    status: Status
    developer: DeveloperInput
  }

  type Mutation {
    addGame(game: GameInput): [Game]
  }

  type Subscription {
    gameAdded: Game
  }
`;

const pubsub = new PubSub();
const GAME_ADDED = "GAME_ADDED";

const resolvers = {
  Subscription: {
    gameAdded: {
      subscribe: () => pubsub.asyncIterator([GAME_ADDED]),
    },
  },
  Query: {
    games: async () => {
      try {
        return await Game.find();
      } catch (e) {
        console.log("error: ", e);
        return [];
      }
    },
    game: async (obj, { id }) => {
      try {
        return await Game.findById(id);
      } catch (e) {
        console.log("error: ", e);
        return {};
      }
    },
  },
  Game: {
    developer: (obj, args, context) =>
      developers.find((developer) => developer.id === obj.developer.id),
  },
  Mutation: {
    addGame: async (obj, { game }, context) => {
      try {
        const newGame = await Game.create({
          ...game,
        });
        pubsub.publish(GAME_ADDED, { gameAdded: newGame });

        return await Game.find();
      } catch (e) {
        console.log("error: ", e);
        return [];
      }
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

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  // we're connected!
  console.log("Database connected!");

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
  });

  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Server started at ${url}`);
  });
});
