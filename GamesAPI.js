const { RESTDataSource } = require("apollo-datasource-rest");

class GamesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api.igdb.com/v4/";
  }

  async getGames() {
    const response = await this.post(
      "games/",
      "fields name,platforms; limit 10;",
      {
        headers: {
          "Client-ID": process.env.IGDB_CLIENT_ID,
          Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  }

  async getPlatformById(id) {
    const response = await this.post(
      "platforms/",
      `fields name; where id = ${id};`,
      {
        headers: {
          "Client-ID": process.env.IGDB_CLIENT_ID,
          Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
        },
      }
    );
    return response;
  }
}

module.exports = GamesAPI;
