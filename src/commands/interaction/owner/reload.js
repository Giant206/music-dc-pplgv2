/**
 * PPLGBot - Owner Command: Reload
 * Mereload commands atau events (Hanya untuk owner)
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "reload",
  description: "Reload commands atau events",
  developerOnly: true,

  options: [
    {
      name: "type",
      description: "Type yang akan di-reload",
      type: 3, // String
      required: true,
      choices: [
        { name: "Commands", value: "commands" },
        { name: "Events", value: "events" },
        { name: "All", value: "all" }
      ]
    }
  ],

  run: async (client, interaction) => {
    const type = interaction.options.getString("type");

    // Check if user is owner
    const owners = client.config.owners || client.config.developers || [];
    if (!owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Kamu tidak memiliki izin untuk menggunakan command ini.",
        flags: 64
      });
    }

    const results = [];

    try {
      // Reload commands
      if (type === "commands" || type === "all") {
        // Clear existing commands
        client.slashCommands.clear();
        
        // Reload slash command handler
        delete require.cache[require.resolve('../../../handlers/slashcommand')];
        require('../../../handlers/slashcommand')(client);
        
        results.push("✅ Commands di-reload");
      }

      // Reload events
      if (type === "events" || type === "all") {
        // Clear existing listeners
        client.removeAllListeners();
        
        // Reload event handler
        delete require.cache[require.resolve('../../../handlers/event')];
        require('../../../handlers/event')(client);
        
        results.push("✅ Events di-reload");
      }

      const container = new ContainerBuilder()
        .setAccentColor(0x22c55e)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ✅ Reload Berhasil")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            results.join("\n")
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
          new TextDisplayBuilder().setContent("### ❌ Reload Gagal")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Error: ${error.message}`
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
 */

