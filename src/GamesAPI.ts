import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import DataLoader from "dataloader";
import { GameModel, PlatformModel } from "./models";

class GamesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.igdb.com/v4/";
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set("Client-ID", String(process.env.IGDB_CLIENT_ID));
    request.headers.set(
      "Authorization",
      `Bearer ${process.env.IGDB_ACCESS_TOKEN}`
    );
  }

  private platformsLoader = new DataLoader(async (ids) => {
    // TODO maybe convert to multiple requests if needed to fetch more than 500 platforms?
    const platfromsList = await this.post<PlatformModel[]>(
      "platforms/",
      `fields name; where id = (${ids.join(",")}); limit 500;`
    );

    // Tranform response to match the order that the id's were requested (this is are requirement of the data loader)
    return ids.map((id) => {
      const platform = platfromsList.find((platform) => platform.id === id);
      return platform ?? null;
    });
  });

  async getGames() {
    const response = await this.post<GameModel[]>(
      "games/",
      "fields name,platforms; limit 100;"
    );
    return response;
  }

  async getGameById(id: number): Promise<GameModel> {
    const [game] = await this.post<GameModel[]>(
      "games/",
      `fields name, platforms; where id = ${id};`
    );

    return game;
  }

  async getPlatformById(id: number): Promise<PlatformModel | null> {
    return this.platformsLoader.load(id);
  }
}

export default GamesAPI;
