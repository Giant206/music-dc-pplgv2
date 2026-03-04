/**
 * PPLGBot - Owner Command: DevMode
 * Mengaktifkan/menonaktifkan mode developer (Hanya untuk owner)
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

module.exports = {
  name: "devmode",
  description: "Aktifkan atau nonaktifkan mode developer",
  developerOnly: true,

  options: [
    {
      name: "action",
      description: "Aksi yang akan dilakukan",
      type: 3, // String
      required: true,
      choices: [
        { name: "Aktifkan", value: "enable" },
        { name: "Nonaktifkan", value: "disable" },
        { name: "Status", value: "status" }
      ]
    }
  ],

  run: async (client, interaction) => {
    const action = interaction.options.getString("action");

    // Check if user is owner
    const owners = client.config.owners || client.config.developers || [];
    if (!owners.includes(interaction.user.id)) {
      return interaction.reply({
        content: "❌ Kamu tidak memiliki izin untuk menggunakan command ini.",
        ephemeral: true
      });
    }

    switch (action) {
      case "enable":
        client.config.devMode = true;
        
        const enableContainer = new ContainerBuilder()
          .setAccentColor(0x22c55e)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### ✅ Mode Developer Aktif")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Mode developer telah diaktifkan.\n" +
              "Commands tidak akan di-register global."
            )
          );

        await interaction.reply({
          components: [enableContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;

      case "disable":
        client.config.devMode = false;
        
        const disableContainer = new ContainerBuilder()
          .setAccentColor(0x22c55e)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### ✅ Mode Developer Nonaktif")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Mode developer telah dinonaktifkan.\n" +
              "Commands akan di-register global."
            )
          );

        await interaction.reply({
          components: [disableContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;

      case "status":
        const statusContainer = new ContainerBuilder()
          .setAccentColor(0x38bdf8)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent("### 📊 Status Developer Mode")
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setDivider(true)
              .setSpacing(SeparatorSpacingSize.Small)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Mode Developer:** ${client.config.devMode ? "✅ Aktif" : "❌ Nonaktif"}\n\n` +
              `${client.config.devMode ? "Commands di-register ke guild dev saja." : "Commands di-register global."}`
            )
          );

        await interaction.reply({
          components: [statusContainer],
          flags: MessageFlags.IsComponentsV2
        });
        break;
    }
  }
};

/**
 * PPLGBot - Owner Command
 */

