import { SERVER_URL } from "./const.js";
import { listenToButtonEvent } from "./header.js";

document.addEventListener('DOMContentLoaded', async () => {
    listenToButtonEvent();
});