export const environment = {
  production: false,
  // Matches arithmaxa-backend's `npm run dev` default (its .env.example
  // PORT value). Only takes effect for `ng serve`/`npm start` now that
  // angular.json's "development" configuration has a fileReplacements
  // entry pointing at this file — it was dead code before that existed.
  backendUrl: 'http://localhost:3000',
};
