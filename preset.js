function managerEntries(entry = []) {
  return [...entry, require.resolve('./register')];
}

function previewAnnotations(entry = []) {
  return [...entry, require.resolve('./preview')];
}

module.exports = { 
  managerEntries, 
  previewAnnotations 
};