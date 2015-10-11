"use strict";
/* Depencies */
const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const port = 8000;
const app = express();

/* Databse objects */
const _companies  = [];
const _users = [];

/* Init */
app.use(bodyParser.json());
app.listen(port, () => {
	console.log("Server is on port", port);
});


/**
*	Returns a clist of all companies
*/
app.get("/api/companies", (req, res) => {
	res.send(_companies);
});


/**
*	Adds a new company to the 'database' 
*	Must specify a name and punch count
*/
app.post("/api/companies", (req, res) => {
	if(!req.body.hasOwnProperty("name")) {
		res.status(412).send("MUST_SPECIFY_NAME");
		return;
	}

	if(!req.body.hasOwnProperty("punchCount")) {
		res.status(412).send("MUST_SPECIFY_PUNCH_COUNT");
		return;
	}
	req.body.ID = uuid.v1();

	_companies.push(req.body);

	res.status(201).send("OK");
});


/**
*	Returns a single company with the given id	
*/
app.get("/api/companies/:id", (req, res) => {
	for(var i = 0; i < _companies.length; ++i) {
		if(_companies[i].ID === req.params.id) {
			res.send(_companies[i]);
			return;
		}
	}

	res.status(404).send("COMPANY_NOT_FOUND");
});


/**
*	Returns a list of all users
*/
app.get("/api/users", (req, res) => {
	res.send(_users);
});

/**
*	Adds a new user to the list of users
*	Name and email must be specified
*/
app.post("/api/users", (req, res) => {
	if(!req.body.hasOwnProperty("name")) {
		res.status(412).send("MUST_SPECIFY_NAME");
		return;
	}

	if(!req.body.hasOwnProperty("email")) {
		res.status(412).send("MUST_SPECIFY_EMAIL");
		return;
	}

	req.body.ID = uuid.v1();
	if(req.body.punches === undefined) req.body.punches = [];

	_users.push(req.body);

	res.status(201).send("OK");
});


/**
* Returns all punches for the given user
*/
app.get("/api/users/:id/punches", (req, res) => {
	var punches = [];

	var user = getUserByID(req.params.id);
	if(user === undefined) {
		res.status(404).send("USER_NOT_FOUND");
	}

	/* Company can be sent in as an optional query string 
	*  If supplied, only punches for the given company will be provided
	*/
	if(req.query.hasOwnProperty("company")) {
		for(var i = 0; i < user.punches.length; ++i) {
			if(req.query.company === user.punches[i].companyID) {
				punches.push(user.punches[i]);
			}
		}
	}
	else {
		punches = user.punches;
	}

	res.send(punches);
});


app.post("/api/users/:id/punches", (req, res) => {
	var user = getUserByID(req.params.id);
	if(user === undefined) {
		res.status(404).send("USER_NOT_FOUND");
	}

	if(!req.body.hasOwnProperty("companyID")) {
		res.status(412).send("MUST_SPECIFY_COMPANY_ID");
		return;
	}

	req.body.ID = uuid.v1();
	req.body.dateCreated = Date.now();

	user.punches.push(req.body);
	res.status(201).send("OK");
});

/* Helper functions */
function getUserByID(id) {
	for(var i = 0; i < _users.length; ++i) {
		if(_users[i].ID === id) {
			return _users[i];
		}
	}
}