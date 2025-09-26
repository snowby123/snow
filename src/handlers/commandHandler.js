const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const commandsPath = path.join(__dirname, "../commands");
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const folderPath = path.join(commandsPath, category);
    if (!fs.lstatSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      try {
        let command = require(filePath);

        // compatibilidade com ESM transpiled: require pode retornar { default: { ... } }
        if (command && command.default && Object.keys(command).length === 1) {
          command = command.default;
        }

        // tente extrair nome nas formas possíveis
        const name = command?.data?.name ?? command?.name ?? command?.config?.name;

        if (!name) {
          console.error(`❌ Comando inválido em: ${filePath}`);
          console.error("Export encontrado:", Object.keys(command || {}));
          console.error("Esperado: module.exports = { data: <SlashCommandBuilder>, execute: async (...) => {...} } ou module.exports = { name: 'nome', execute(...) }");
          continue; // pula esse arquivo mas não quebra tudo
        }

        client.commands.set(name, command);
        console.log(`✅ Comando carregado: ${name} (${file})`);
      } catch (err) {
        console.error(`❌ Erro ao carregar o comando ${filePath}:`, err);
      }
    }
  }
};
