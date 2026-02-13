import {app} from "./src/app";

app.listen(8080);

console.log(`🚀 API running at http://localhost:${app.server?.port}`);
