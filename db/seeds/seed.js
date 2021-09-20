const {
  setupCategoriesTable,
  setupUsersTable,
  setupReviewsTable,
  setupCommentsTable,
} = require("./setupTables.js");

const seed = async (data) => {
  const { categoryData, commentData, reviewData, userData } = data;

  try {
    const [categories, users] = await Promise.all([
      setupCategoriesTable(categoryData),
      setupUsersTable(userData),
    ]);
    const reviews = await setupReviewsTable(reviewData);
    const comments = await setupCommentsTable(commentData);
    // if (
    // [categories, users, reviews, comments].every((table) => table.length > 0)
    // ) {
    // console.log("finished seeding tables.");
    // }
  } catch (err) {
    console.error(err);
  }
};

module.exports = { seed };
