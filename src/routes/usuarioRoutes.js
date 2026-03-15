const express = require("express");
const routes = express.Router();

// Importa o "cérebro" das ações do usuário
const usuarioController = require("../controllers/usuarioController");

// Importa a configuração do Multer para lidar com o upload de arquivos (fotos)
const upload = require("../config/multer");

/**
 * ========= CREATE (POST) =========
 * Rota para cadastrar um novo usuário.
 * upload.single("avatar"): Middleware que intercepta a imagem enviada sob a chave "avatar".
 * O arquivo físico vai para a pasta /uploads e os dados do texto vão para o req.body.
 */
routes.post("/", upload.single("avatar"), usuarioController.criar);

/**
 * ========= READ (GET) =========
 * Listar todos os usuários (útil para rankings ou testes).
 */
routes.get("/", usuarioController.listar);

/**
 * Buscar um usuário específico pelo ID (usado na tela de Perfil do seu App).
 * O :id é um parâmetro de rota que o Controller acessa via req.params.id.
 */
routes.get("/:id", usuarioController.buscarPorId);

/**
 * ========= UPDATE (PUT) =========
 * Rota para atualizar os dados do usuário.
 * Também permite trocar a foto de perfil usando o mesmo campo "avatar".
 */
routes.put("/:id", upload.single("avatar"), usuarioController.atualizar);

/**
 * ========= DELETE (DELETE) =========
 * Rota para remover a conta do usuário e sua respectiva foto.
 */
routes.delete("/:id", usuarioController.deletar);

module.exports = routes;