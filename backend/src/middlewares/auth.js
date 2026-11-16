import passport from 'passport';

// Verifica el JWT con Passport. Si falla, responde 401.
export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const expired = info?.name === 'TokenExpiredError';
      return res.status(401).json({
        message: expired ? 'El token expiró, iniciá sesión nuevamente' : 'No autorizado: token inválido o ausente',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};
