const { query_manager } = require("./data/query_manager");

const knex = query_manager;

class controller {
  constructor() {
    if (controller.instance) return controller.instance;
  }

  static getInstance() {
    if (!controller.instance) controller.instance = new controller();
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

    return results.map((row) => ({
      ...row,
      content: typeof row.content === "string" ? JSON.parse(row.content) : row.content,
      comments:
        typeof row.comments === "string"
          ? JSON.parse(row.comments)
          : (row.comments || []),
    }));
  }

    async pushMessage(data){

          try {
                  const {fn, ln, country, email, message} = data;

                  const [newEntryId] = await knex("Contactme")
                  .insert({
                          fn,
                          ln,
                          email,
                          country,
                          message
                  })
                  .returning("id")

                  return {id: newEntryId};

          } catch (error){
                  console.error("Error uploading entry to DB:", error);
      throw new Error("Failed to upload entry");
          }}

  async _uploadEntry(entry) {
    try {
      const { author, title, content, thumbnail, summary } = entry;

      const [newEntryId] = await knex("BlogEntries")
        .insert({
          author,
          title,
          content: JSON.stringify(content),
          thumbnail,
          summary,
        })
        .returning("id");

      return { id: newEntryId };
    } catch (error) {
      console.error("Error uploading entry to DB:", error);
      throw new Error("Failed to upload entry");
    }
  }

  async pushComment(id, comment) {
    try {
      await knex.transaction(async (trx) => {
        const result = await trx("BlogEntries")
          .select("comments")
          .where("id", id)
          .first();

        if (!result) throw new Error("Entry not found");

        // ✅ FIX: parse JSON string safely
        const comments =
          typeof result.comments === "string"
            ? JSON.parse(result.comments)
            : (result.comments || []);

        const sanitizedComment = {
          author: comment.author,
          comment: comment.comment,
          date: new Date().toISOString(),
        };

        comments.push(sanitizedComment);

        await trx("BlogEntries")
          .where("id", id)
          .update({ comments: JSON.stringify(comments) });

        return comments;
      });
    } catch (error) {
      console.error("Error pushing comment to DB:", error);
      throw new Error("Failed to push comment");
    }
  }
}

module.exports = { controller };

