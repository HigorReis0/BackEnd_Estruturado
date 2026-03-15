// Importa a classe DataTypes do pacote sequelize para definir os tipos das colunas (ex: STRING, INTEGER)
const { DataTypes } = require("sequelize");

// Importa a instância da conexão com o banco de dados que configuramos no arquivo database.js
const sequelize = require("../config/database");

// Define o modelo "Usuario", que representa a estrutura de um usuário no código
const Usuario = sequelize.define(
  "Usuario", // Nome interno do modelo dentro do Sequelize
  {
    // Define a coluna da Chave Primária
    usuario_id: {
      type: DataTypes.INTEGER, // Define o tipo como Inteiro
      primaryKey: true,        // Indica que esta é a Chave Primária (PK)
      autoIncrement: true,     // Indica que o banco deve gerar o ID automaticamente (SERIAL)
      field: 'usuario_id'      // MAPEAMENTO CRUCIAL: Diz ao Sequelize que no banco o nome da coluna é exatamente este
    },

    // Define a coluna para o nome do usuário
    nome: {
      type: DataTypes.STRING(100), // Define como VARCHAR(100) - mais performático que TEXT para nomes
      allowNull: false,            // Indica que este campo é obrigatório (NOT NULL)
    },

    // Define a coluna para o e-mail
    email: {
      type: DataTypes.STRING(100), // Define como VARCHAR(100)
      allowNull: false,            // Campo obrigatório
      unique: true,                // Garante que não existam dois usuários com o mesmo e-mail
    },

    // Define a coluna para a senha
    senha: {
      type: DataTypes.STRING(255), // Define como VARCHAR(255) para suportar o hash da senha
      allowNull: true,             // PERMISSIVO: Permite ser vazio para quem logar com o Google
    },

    // Define a coluna para o ID único fornecido pelo Google
    google_id: {
      type: DataTypes.STRING(255), // Define como VARCHAR(255)
      unique: true,                // Garante que cada conta Google seja vinculada a apenas um usuário
      allowNull: true,             // Permite ser vazio para quem criar conta apenas com e-mail/senha
    },

    // Define a coluna para a URL da foto de perfil
    avatar_url: {
      type: DataTypes.TEXT,        // Usa TEXT porque links de imagens podem ser muito longos
      allowNull: true,             // Campo opcional
    },
  },
  {
    // CONFIGURAÇÕES ADICIONAIS DO MODELO
    tableName: "tab_usuario",      // Obriga o Sequelize a usar o nome exato da tabela que criamos no Postgres
    timestamps: false,             // Informa que não usaremos as colunas automáticas 'createdAt' e 'updatedAt'
  }
);

// Exporta o modelo para que possamos usá-lo nos Controllers (para criar, buscar, deletar usuários)
module.exports = Usuario;