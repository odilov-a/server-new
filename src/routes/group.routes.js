const { Router } = require("express");
const groupController = require("../controllers/group.controller.js");

const groupRoutes = Router();

groupRoutes.get('/', groupController.getAll);
groupRoutes.get('/:id', groupController.getById);
groupRoutes.post('/', groupController.create);
groupRoutes.put('/:id', groupController.update);
groupRoutes.delete('/:id', groupController.delete);

module.exports = groupRoutes;
