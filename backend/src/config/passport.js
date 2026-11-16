import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { pool } from './db.js';

export function configurePassport() {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };

  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const [rows] = await pool.query(
          'SELECT id, nombre, email FROM usuarios WHERE id = ?',
          [payload.id]
        );
        return done(null, rows[0] || false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
}
