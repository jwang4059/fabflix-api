const { Client } = require("pg");

const handleSignUp = async (req, res) => {
	const { name, email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json("invalid login credentials");
	}

	try {
		const client = new Client({
			connectionString: process.env.DATABASE_URL,
			ssl: {
				rejectUnauthorized: false,
			},
		});

		client.connect();

		const response = await client.query("CALL add_user($1, $2, $3, $4);", [
			name,
			email,
			password,
			new Date(),
		]);
		await client.end();

		res.json(response);
	} catch (e) {
		res.status(404).json(e);
	}
};

module.exports = {
	handleSignUp,
};