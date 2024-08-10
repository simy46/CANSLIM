import { SERVER_URL } from "./const.js";
import { listenToSearchEvent } from "./search.js";

document.addEventListener('DOMContentLoaded', async () => {
    listenToSearchEvent();
});