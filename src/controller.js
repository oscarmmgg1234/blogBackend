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
      .select("id", "title", "thumbnail", "entry_date", "summary")
      .orderBy("entry_date", "desc");
    return results;
  }

  async _getEntry(id) {
    const results = await knex("BlogEntries")
      .select("author", "title", "content", "entry_date", "id", "comments")
      .where("id", id);
    return results;
  }
  async _uploadEntry(entry) {
    try {
      const { author, title, content, thumbnail, summary } = entry;

      // Insert the new blog entry into the BlogEntries table
      const [newEntryId] = await knex("BlogEntries")
        .insert({
          author,
          title,
          content: JSON.stringify(content), // Store content as JSON string
          thumbnail, // Base64 encoded thumbnail // Current timestamp
          summary,
        })
        .returning("id");

      // Return the newly inserted entry ID
      return { id: newEntryId };
    } catch (error) {
      console.error("Error uploading entry to DB:", error);
      throw new Error("Failed to upload entry");
    }
  }

  async pushComment(id, comment) {
    // push comment to the comments array for entry with id
    try {
      // Start a transaction to avoid concurrency issues
      await knex.transaction(async (trx) => {
        const result = await trx("BlogEntries")
          .select("comments")
          .where("id", id)
          .first();

        console.log("Result:", result);

        if (result) {
          // Parse the comments field if it's stored as JSON
          const comments = result.comments ? result.comments : [];

          // Sanitize the comment by filtering foul language
          const sanitizedComment = {
            author: comment.author,
            comment: comment.comment, // Filter bad words
            date: new Date().toISOString(),
          };

          // Push the sanitized comment to the array
          comments.push(sanitizedComment);

          // Update the comments field, stringifying the array
          await trx("BlogEntries")
            .where("id", id)
            .update({ comments: JSON.stringify(comments) });
          return { status: true };
        } else {
          throw new Error("Entry not found");
        }
      });
    } catch (error) {
      console.error("Error pushing comment to DB:", error);
      throw new Error("Failed to push comment");
    }
  }
}

module.exports = { controller };
