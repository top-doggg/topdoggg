import config from './playwright.config.mjs';
export default { ...config, use: { ...config.use, baseURL: 'https://trststudios.online' }, webServer: undefined };
