export const csrfTokenMiddleware = (req, res, next) => {
  //WARN: Generate a CSRF secret if not already set
  if (!req.session.csrfToken) {
    req.session.csrfSecret = tokens.secretSync();
  }
  //WARN: Generate a token to be sent to the client
  res.locals.csrfToken = tokens.create(req.session.csrfSecret);

  next();
};
