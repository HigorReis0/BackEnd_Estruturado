const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Define o caminho da pasta de uploads (subindo dois níveis para chegar na raiz)
const uploadDir = path.join(__dirname, "..", "..", "uploads");

// Verifica se a pasta existe, se não, cria de forma recursiva
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = {

  // ========= CREATE (CADASTRO) =========
  async criar(req, res) {
    try {
      const { nome, email, senha, google_id } = req.body;

      // Validação básica: Google Login não envia senha, então a senha só é obrigatória se não houver google_id
      if (!nome || !email || (!senha && !google_id)) {
        return res.status(400).json({
          erro: "Dados insuficientes para o cadastro.",
        });
      }

      // Verifica se o usuário já existe pelo e-mail
      const existe = await Usuario.findOne({ where: { email } });
      if (existe) {
        if (req.file) fs.unlinkSync(req.file.path); // Apaga a foto enviada se o cadastro falhar
        return res.status(409).json({ erro: "Email já cadastrado" });
      }

      // Se houver senha (cadastro manual), faz o hash. Se for Google, fica null.
      const senhaHash = senha ? await bcrypt.hash(senha, 10) : null;

      // Mapeia o caminho da foto para o campo avatar_url
      const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;

      // Cria o registro usando os nomes das colunas da tab_usuario
      const usuario = await Usuario.create({
        nome,
        email,
        senha: senhaHash,
        google_id,
        avatar_url,
      });

      const usuarioJSON = usuario.toJSON();
      delete usuarioJSON.senha; // Segurança: nunca devolvemos o hash da senha

      return res.status(201).json(usuarioJSON);

    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(500).json({ erro: error.message });
    }
  },

  // ========= READ (LISTAR) =========
  async listar(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: { exclude: ["senha"] }, // Esconde a senha de todos
        order: [["usuario_id", "ASC"]],     // Ajustado para usar usuario_id
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const resultado = usuarios.map(u => {
        const user = u.toJSON();
        // Transforma o caminho relativo em URL completa para o App Expo ler
        if (user.avatar_url && !user.avatar_url.startsWith("http")) {
          user.avatar_url = `${baseUrl}${user.avatar_url}`;
        }
        return user;
      });

      return res.json(resultado);

    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // ========= READ (POR ID) =========
  async buscarPorId(req, res) {
    try {
      const { id } = req.params; // O id vem da rota (ex: /usuarios/1)

      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ["senha"] },
      });

      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const user = usuario.toJSON();

      if (user.avatar_url && !user.avatar_url.startsWith("http")) {
        user.avatar_url = `${baseUrl}${user.avatar_url}`;
      }

      return res.json(user);

    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },

  // ========= UPDATE =========
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, senha } = req.body;

      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      let novaSenha = usuario.senha;
      if (senha) {
        novaSenha = await bcrypt.hash(senha, 10);
      }

      let novoAvatar = usuario.avatar_url;
      if (req.file) {
        // Se já tinha uma foto antiga, apaga o arquivo físico
        if (usuario.avatar_url) {
          const fotoAntiga = path.join(__dirname, "..", "..", usuario.avatar_url);
          if (fs.existsSync(fotoAntiga)) fs.unlinkSync(fotoAntiga);
        }
        novoAvatar = `/uploads/${req.file.filename}`;
      }

      await usuario.update({
        nome: nome ?? usuario.nome,
        email: email ?? usuario.email,
        senha: novaSenha,
        avatar_url: novoAvatar,
      });

      const user = usuario.toJSON();
      delete user.senha;

      return res.json(user);

    } catch (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(500).json({ erro: error.message });
    }
  },

  // ========= DELETE =========
  async deletar(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      // Remove o arquivo da foto antes de deletar o registro do banco
      if (usuario.avatar_url) {
        const fotoPath = path.join(__dirname, "..", "..", usuario.avatar_url);
        if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
      }

      await usuario.destroy();

      return res.json({ sucesso: true, mensagem: "Conta removida com sucesso" });

    } catch (error) {
      return res.status(500).json({ erro: error.message });
    }
  },
};