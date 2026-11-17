// Local API server: npm run api  →  http://localhost:3001/api/dishes
import app from "./app.js";

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API ready on http://localhost:${port}/api`));
