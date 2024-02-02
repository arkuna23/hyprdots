-- keymap
vim.api.nvim_set_keymap('n', 'ww', ':NvimTreeFocus<CR>', { noremap = true, silent = true })
vim.api.nvim_set_keymap('n', '<C-n>', ':NvimTreeToggle<CR>', { noremap = true, silent = true })

require("nvim-tree").setup({
  sort = {
    sorter = "case_sensitive",
  },
  hijack_cursor = true,
  system_open = {
    cmd = "open",
  },
  view = {
    width = 5,
    adaptive_size = true,
  },
  renderer = {
    group_empty = true,
  },
  filters = {
    dotfiles = false,
  },
})
