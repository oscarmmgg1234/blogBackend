const { query_manager } = require("./data/query_manager");

const knex = query_manager;

class controller {
  constructor() {
    //singleton
    if (controller.instance) {
      return controller.instance;
    }
  }

  static getInstance() {
    if (!controller.instance) {
      controller.instance = new controller();
    }
    return controller.instance;
  }

  async _getEntries() {
    const results = await knex("BlogEntries")
      .select("id", "title", "thumbnail", "entry_date")
      .orderBy("entry_date", "desc");
    return results;
  }

  async _getEntry(id) {
    const results = await knex("BlogEntries")
      .select("author", "title", "content", "entry_date", "id")
      .where("id", id);
    return results;
  }
}

module.exports = { controller };
