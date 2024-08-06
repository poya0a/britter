function paginate<T>(array: T[], page: number = 1, limit: number = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedItems = array.slice(startIndex, endIndex);
  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    paginatedItems,
    pageInfo: {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
    },
  };
}
