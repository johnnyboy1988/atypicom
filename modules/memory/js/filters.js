function applyFilters(collection, settings) {

  if (!collection) return [];

  let result = [...collection];

  // =========================
  // CATEGORY FILTER
  // =========================

  if (settings.categories?.length) {
    result = result.filter(card =>
      settings.categories.includes(card.category)
    );
  }

  // =========================
  // TAG FILTER
  // =========================

  if (settings.tags?.length) {
    result = result.filter(card =>
      card.tags?.some(tag =>
        settings.tags.includes(tag)
      )
    );
  }

  return result;
}