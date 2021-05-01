import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import DataLoader from "dataloader";
import {
  GameModel,
  PlatformModel,
  Involved_CompanyModel,
  CompanyModel,
} from "./models";

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

  private gamesLoader = new DataLoader(async (ids) => {
    // TODO maybe convert to multiple requests if needed to fetch more than 500 platforms?
    const gamesList = await this.post<GameModel[]>(
      "games/",
      `fields name, platforms,involved_companies; where id = (${ids.join(
        ","
      )}); limit 500;`
    );

    // Tranform response to match the order that the id's were requested (this is are requirement of the data loader)
    return ids.map((id) => {
      const game = gamesList.find((game) => game.id === id);
      return game ?? null;
    });
  });

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

  private involvedCompanyLoader = new DataLoader(async (ids) => {
    const involvedCompanyList = await this.post<Involved_CompanyModel[]>(
      "/involved_companies/",
      `fields developer, publisher, porting, supporting, company; where id = (${ids.join(
        ","
      )}); limit 500;`
    );

    // Tranform response to match the order that the id's were requested (this is are requirement of the data loader)
    return ids.map((id) => {
      const involvedCompany = involvedCompanyList.find(
        (involvedCompany) => involvedCompany.id === id
      );
      return involvedCompany ?? null;
    });
  });

  private companyLoader = new DataLoader(async (ids) => {
    const companyList = await this.post<CompanyModel[]>(
      "/companies/",
      `fields name, developed, published; where id = (${ids.join(
        ","
      )}); limit 500;`
    );

    // Tranform response to match the order that the id's were requested (this is are requirement of the data loader)
    return ids.map((id) => {
      const company = companyList.find((company) => company.id === id);
      return company ?? null;
    });
  });

  async getGames() {
    const response = await this.post<GameModel[]>(
      "games/",
      "fields name,platforms,involved_companies; limit 100;"
    );
    return response;
  }

  async getGameById(id: number): Promise<GameModel | null> {
    return this.gamesLoader.load(id);
  }

  async getPlatformById(id: number): Promise<PlatformModel | null> {
    return this.platformsLoader.load(id);
  }

  async getInvolvedCompanyById(
    id: number
  ): Promise<Involved_CompanyModel | null> {
    return this.involvedCompanyLoader.load(id);
  }

  async getCompanyById(id: number): Promise<CompanyModel | null> {
    return this.companyLoader.load(id);
  }
}

export default GamesAPI;
