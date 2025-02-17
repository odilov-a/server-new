const { Router } = require('express');
const testController = require('../controllers/test.controller');

const testRoutes = Router();

testRoutes.get('/', testController.getAll);
testRoutes.post('/', testController.create);
testRoutes.post('/import', testController.createWithFolder);
testRoutes.post('/check/:id', testController.checkAnswers);

module.exports = testRoutes;