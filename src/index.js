const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const accounts = [];

app.use(express.json());

//MIDDLEWARE
function verifyExistsAccount(request, response, next) {
	const { cpf } = request.params;

	const account = accounts.find((account) => account.cpf === cpf);

	if (!account) {
		return response.status(400).json({ error: "Account not found!" });
	}

	request.account = account;

	return next();
}

//Create a new account
app.post("/account", (request, response) => {
	const { cpf, name } = request.body;

	const accountAlreadyExists = accounts.some((account) => account.cpf === cpf);

	if (accountAlreadyExists) {
		return response.status(400).json({ error: "CPF already exists" });
	}

	accounts.push({
		id: uuidv4(),
		cpf,
		name,
		statement: [],
	});

	return response.status(201).send();
});

//Get all accounts
app.get("/account", (request, response) => {
	return response.json(accounts);
});

//Update account
app.put("/account/:cpf", verifyExistsAccount, (request, response) => {
	const { account } = request;
	const { name } = request.body;
	if (name) {
		account.name = name;
	}
	return response.status(200).send();
});

//Delete account
app.delete("/account/:cpf", verifyExistsAccount, (request, response) => {
	const { account } = request;

	//splice
	accounts.splice(account, 1);
	return response.status(204).send();
});

//Get all statement from CPF
app.get("/statement/:cpf", verifyExistsAccount, (request, response) => {
	const { account } = request;
	return response.json(account.statement);
});

//Get statement sum
app.get("/statement/total/:cpf", verifyExistsAccount, (request, response) => {
	const { account } = request;
	total = 0;
	account.statement.forEach((statement) =>
		statement.type == "Income"
			? (total += statement.value)
			: statement.type == "Outcome"
			? (total -= statement.value)
			: ""
	);
	console.log(total);
	return response.json({ total: total });
});

//Get filter statement from CPF
app.get("/statement/filter/:cpf", verifyExistsAccount, (request, response) => {
	const { account } = request;
	const { date } = request.query;

	const dateFormat = new Date(date + " 00:00");

	const statement = account.statement.filter(
		(statement) =>
			statement.created_at.toDateString() ===
			new Date(dateFormat).toDateString()
	);

	return response.json(statement);
});

//Create new statement for CPF
app.post("/statement/:cpf", verifyExistsAccount, (request, response) => {
	const { account } = request;

	const { transaction, value, type } = request.body;

	account.statement.push({
		transaction,
		value,
		type,
		created_at: new Date(),
	});

	return response.status(200).send();
});

app.listen(3333);
