/**
 * PPLGBot - Command: Queue (Advanced)
 * Menampilkan antrian lagu dengan pagination
 */

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require("discord.js");

module.exports = {
  name: "queue",
  description: "Tampilkan antrian lagu",
  inVoice: true,
  sameVoice: true,
  player: true,

  options: [
    {
      name: "page",
      description: "Halaman antrian",
      type: 4, // INTEGER
      required: false,
      min_value: 1
    },
    {
      name: "search",
      description: "Cari lagu dalam antrian",
      type: 3, // STRING
      required: false
    }
  ],

  run: async (client, interaction) => {
    const player = client.riffy.players.get(interaction.guild.id);
    const page = interaction.options.getInteger("page") || 1;
    const searchQuery = interaction.options.getString("search");

    // ============================================
    // ❌ CHECK PLAYER
    // ============================================
    if (!player || !player.current) {
      const noPlayer = new ContainerBuilder()
        .setAccentColor(0xef4444)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### ❌ Tidak Ada Musik")
        )
        .addSeparatorComponents(
          new SeparatorBuilder()
            .setDivider(true)
            .setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Tidak ada player aktif di server ini."
          )
        );

      return interaction.reply({
        components: [noPlayer],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      });
    }

    // Get queue safely
    let queue = [];
    try {
      queue = Array.from(player.queue || []);
    } catch (e) {
      queue = [];
    }

    // Handle search
    if (searchQuery) {
      return handleSearch(client, interaction, player, queue, searchQuery);
    }

    // Pagination settings
    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(queue.length / itemsPerPage));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const queuePage = queue.slice(startIndex, endIndex);

    // Get ms for duration formatting
    const ms = (await import("pretty-ms")).default;

    // Now playing text
    const nowPlayingText =
      `**[${player.current.info.title}](${player.current.info.uri})**\n` +
      `Duration: ${ms(player.current.info.length)}\n\n` +
      `**Antrian:** ${queue.length} lagu`;

    // Up next text
    let upNextText = "";

    if (queuePage.length) {
      upNextText = queuePage
        .map(
          (track, index) =>
            `${startIndex + index + 1}. [${track.info.title}](${track.info.uri}) - ${track.info.author || "Unknown"}`
        )
        .join("\n");
    } else {
      upNextText = "Tidak ada lagu dalam antrian.";
    }

    // Create container
    const container = new ContainerBuilder()
      .setAccentColor(0x38bdf8)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🎵 Sedang Diputar")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(nowPlayingText)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### 📋 Berikutnya (Halaman ${currentPage}/${totalPages})`)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(upNextText)
      );

    // Set thumbnail if available
    if (player.current.info.thumbnail) {
      container.addSectionComponents(
        new SectionBuilder()
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(player.current.info.thumbnail)
          )
      );
    }

    // Create pagination buttons
    const buttons = new ActionRowBuilder();

    // Previous button
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId(`queue_page_${interaction.guild.id}_${currentPage - 1}`)
        .setLabel("◀️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage <= 1)
    );

    // Page indicator
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId("queue_page_indicator")
        .setLabel(`${currentPage}/${totalPages}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    // Next button
    buttons.addComponents(
      new ButtonBuilder()
        .setCustomId(`queue_page_${interaction.guild.id}_${currentPage + 1}`)
        .setLabel("▶️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage >= totalPages)
    );

    // Action buttons
    const actionButtons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`queue_jump_${interaction.guild.id}`)
          .setLabel("Jump")
          .setEmoji("⏭️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`queue_remove_${interaction.guild.id}`)
          .setLabel("Remove")
          .setEmoji("🗑️")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`shuffle_again_${interaction.guild.id}`)
          .setLabel("Acak")
          .setEmoji("🔀")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`loop_queue_${interaction.guild.id}`)
          .setLabel("Loop")
          .setEmoji("🔁")
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.reply({
      components: [container, buttons, actionButtons],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

async function handleSearch(client, interaction, player, queue, query) {
  const searchResults = queue.filter(track => {
    const title = track.info.title?.toLowerCase() || "";
    const author = track.info.author?.toLowerCase() || "";
    const searchLower = query.toLowerCase();
    return title.includes(searchLower) || author.includes(searchLower);
  });

  if (searchResults.length === 0) {
    const notFound = new ContainerBuilder()
      .setAccentColor(0xf59e0b)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent("### 🔍 Hasil Pencarian")
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setDivider(true)
          .setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Tidak ada lagu yang cocok dengan: **${query}**`
        )
      );

    return interaction.reply({
      components: [notFound],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
  }

  // Create search results select menu
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`queue_play_search_${interaction.guild.id}`)
    .setPlaceholder("Pilih lagu untuk diputar")
    .addOptions(
      searchResults.slice(0, 25).map((track, index) => {
        return new StringSelectMenuOptionBuilder()
          .setLabel(`${index + 1}. ${track.info.title}`.substring(0, 100))
          .setValue(`search_${index}`)
          .setDescription(track.info.author?.substring(0, 50) || "Unknown");
      })
    );

  const searchContainer = new ContainerBuilder()
    .setAccentColor(0x38bdf8)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### 🔍 Hasil Pencarian: "${query}"`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Ditemukan ${searchResults.length} lagu:\n\n` +
        searchResults.slice(0, 5).map((t, i) => `${i + 1}. **${t.info.title}** - ${t.info.author}`).join("\n")
      )
    );

  const selectRow = new ActionRowBuilder()
    .addComponents(selectMenu);

  return interaction.reply({
    components: [searchContainer, selectRow],
    flags: MessageFlags.IsComponentsV2
  });
}

/**
 * PPLGBot - Advanced Queue System
 * Dengan pagination, search, jump, dan remove
 */

