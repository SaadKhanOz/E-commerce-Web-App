const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (_, res) => res.json({ ok: true, service: 'auth' }));
app.get('/', (_, res) => res.json({ service: 'auth', message: 'hello' }));

app.listen(PORT, () => {
	console.log(`auth service listening on ${PORT}`);
});
