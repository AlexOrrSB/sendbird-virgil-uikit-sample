const express = require('express');
const { JwtGenerator } = require('virgil-sdk');
const {
  initCrypto,
  VirgilCrypto,
  VirgilAccessTokenSigner,
} = require('virgil-crypto');

const getJwtGenerator = async () => {
  await initCrypto();

  const virgilCrypto = new VirgilCrypto();

  return new JwtGenerator({
    appId: process.env.VIRGIL_APP_ID,
    apiKeyId: process.env.VIRGIL_APP_KEY_ID,
    apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_APP_KEY),
    accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
  });
};

const generatorPromise = getJwtGenerator();

const virgilRouter = express.Router();

virgilRouter.get('/jwt/:userId', async (req, res) => {
  const { params } = req;
  const { userId } = params;
  const generator = await generatorPromise;
  const virgilJwtToken = generator.generateToken(userId);

  res.json({ virgilToken: virgilJwtToken.toString() });
});

module.exports = { virgilRouter };
