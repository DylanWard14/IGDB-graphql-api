import GamesAPI from "./GamesAPI";

export type GraphQLContext = {
  dataSources: {
    gamesAPI: GamesAPI;
  };
};
