module.exports = ({ pkg = {}, pe = {} } = {}) => {
  if (pe && pe.skipNodeFiles && pe.skipPackage) {
    pe.skipNodeFiles();
    if (pkg && pkg.dependencies) {
      pe.skipPackage(...Object.keys(pkg.dependencies));
    }
  }
  const logError = err => {
    if (pe && pe.render) {
      pe.render(err);
    } else {
      console.log(err);
    }
  };

  return asyncHandler => (req, res) => {
    asyncHandler(req, res)
      .then(
        (response = {}) =>
          typeof response === 'string'
            ? res.status(response.statusCode || 200).send(response)
            : res.status(response.statusCode || 200).json(response),
      )
      .catch(err => {
        logError(err);
        const { statusCode = 500, message } = err;
        res.status(statusCode).json({ statusCode, message, error: true });
      });
    return;
  };
};
