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
  } catch (err) {
    console.error(err);
  }
};

module.exports = { seed };
