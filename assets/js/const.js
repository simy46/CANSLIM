export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL; // Vérifie que la variable est bien définie
console.log('Server URL:', SERVER_URL); // Ajoute ceci pour vérifier que la variable est bien définie

export const TRENDING_STOCKS_KEY = 'TRENDING_STOCKS',
TRENDING_STOCKS_TICKERS = 'TRENDING_TICKERS',
ETAG_KEY = 'stocksEtag',
ACTIVE_INDEX = 'activeContainerIndex',
STOCK_SELECTION = 'stockSelection';
