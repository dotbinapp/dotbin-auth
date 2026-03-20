/**
 * Re-export de servicios singleton (mismo patrón que dotbin-server + clases instanciadas).
 */
module.exports = {
  tokenService: require('./TokenService'),
  credentialService: require('./CredentialService'),
  sessionService: require('./SessionService'),
  identityUserService: require('./IdentityUserService'),
};
