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
  async _uploadEntry(entry) {
    try {
      const { author, title, content, thumbnail } = entry;

      // Insert the new blog entry into the BlogEntries table
      const [newEntryId] = await knex("BlogEntries")
        .insert({
          author,
          title,
          content: JSON.stringify(content), // Store content as JSON string
          thumbnail, // Base64 encoded thumbnail // Current timestamp
        })
        .returning("id");

      // Return the newly inserted entry ID
      return { id: newEntryId };
    } catch (error) {
      console.error("Error uploading entry to DB:", error);
      throw new Error("Failed to upload entry");
    }
  }
}

module.exports = { controller };
