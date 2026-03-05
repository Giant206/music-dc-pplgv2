/**
 * PPLGBot - Owner Command: Eval
 * Mengevaluasi kode JavaScript (Hanya untuk owner)
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "eval",
  description: "Evaluasi kode JavaScript",
  developerOnly: true,

  options: [
    {
      name: "code",
      description: "Kode yang akan dievaluasi",
      type: 3, // String
      required: true
    }
  ],

  run: async (client, interaction) => {
    const code = interaction.options.getString("code");

    // Check if user is owner
    const owners = client.config.owners || client.config.developers || [];
    if (!owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Kamu tidak memiliki izin untuk menggunakan command ini.",
        flags: 64
      });
    }

    try {
      // Evaluate code
      let result = eval(code);
      
      // Handle async functions
      if (result instanceof Promise) {
        result = await result;
      }

      // Format result
      const formatted = typeof result === 'object' 
        ? JSON.stringify(result, null, 2) 
        : String(result);

      // Limit output length
      const output = formatted.length > 1900 
        ? formatted.substring(0, 1900) + "\n```(terpotong)" 
        : formatted;

      const container = new ContainerBuilder()
        .setAccentColor(0x22c55e)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ✅ Eval Berhasil")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Input:**\n" + "```js\n" + code + "\n```\n\n" +
            "**Output:**\n" + "```js\n" + output + "\n```"
          )
        );

      await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

    } catch (error) {
      const container = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Eval Gagal")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "**Input:**\n" + "```js\n" + code + "\n```\n\n" +
            "**Error:**\n" + "```js\n" + error.message + "\n```"
          )
        );

      await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }
};

/**
 * PPLGBot - Owner Command
 * WARNING: Command ini berbahaya jika digunakan oleh orang yang tidak dipercaya
 */

