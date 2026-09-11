// Removes `//# sourceMappingURL=...` comments from dependencies. The bundle
// doesn't ship source maps, so these references would point to missing files.
module.exports = function stripSourceMapComments(source) {
    return source.replace(/^\/\/# sourceMappingURL=.*\r?\n?/gm, "");
};
