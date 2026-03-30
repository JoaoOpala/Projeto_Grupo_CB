export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login/json",
    REGISTRO_VENDEDOR: "/auth/registro/vendedor",
    REGISTRO_FORNECEDOR: "/auth/registro/fornecedor",
    REFRESH: "/auth/refresh",
  },

  // Vendedor
  VENDEDOR: {
    ME: "/vendedor/me",
    LOJA: "/vendedor/loja",
    PRODUTOS_LOJA: "/vendedor/loja/produtos",
    PEDIDOS: "/vendedor/pedidos",
    COMISSOES: "/vendedor/financeiro/comissoes",
    DASHBOARD: "/vendedor/financeiro/dashboard",
  },

  // Fornecedor
  FORNECEDOR: {
    ME: "/fornecedor/me",
    CONDICOES: "/fornecedor/condicoes-comerciais",
    PRODUTOS: "/fornecedor/produtos",
    ESTOQUE: "/fornecedor/estoque",
    PEDIDOS: "/fornecedor/pedidos",
    REPASSES: "/fornecedor/financeiro/repasses",
  },

  // Admin
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    VENDEDORES: "/admin/vendedores",
    FORNECEDORES: "/admin/fornecedores",
    PRODUTOS: "/admin/produtos",
    PEDIDOS: "/admin/pedidos",
    CLIENTES: "/admin/clientes",
    LOJAS: "/admin/lojas",
    COMISSOES: "/admin/financeiro/comissoes",
    RELATORIOS: "/admin/financeiro/relatorios",
    CONFIGURACOES: "/admin/configuracoes",
  },

  // Cliente
  CLIENTE: {
    ME: "/cliente/me",
    REGISTRO: "/auth/registro/cliente",
  },

  // Lojas públicas
  LOJAS: {
    LIST: "/lojas",
    GET: (slug: string) => `/lojas/${slug}`,
    PRODUTOS: (slug: string) => `/lojas/${slug}/produtos`,
  },

  // Público
  CATALOGO: {
    PRODUTOS: "/produtos",
    CATEGORIAS: "/produtos/categorias",
    BUSCA: "/produtos/busca",
  },

  PEDIDOS: {
    CRIAR: "/pedidos",
    RASTREIO: "/pedidos/rastreio",
  },
} as const;
