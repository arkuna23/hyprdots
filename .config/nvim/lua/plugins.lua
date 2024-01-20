
return require('packer').startup(function()
  use { 
    'nvim-treesitter/nvim-treesitter', 
    run = function()
      local ts_update = require('nvim-treesitter.install').update({ with_sync = true })
      ts_update()
    end, 
  }
  use { 'ful1e5/onedark.nvim' }
  use { 'hrsh7th/nvim-cmp' }
	use { 'wbthomason/packer.nvim' }
  use { 'nvim-lualine/lualine.nvim' }
end)
