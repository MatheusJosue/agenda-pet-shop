export function getAppPageTitle(pathname: string): string {
  if (pathname === "/app") return "Início";

  if (pathname.startsWith("/app/agendamentos/novo")) return "Novo Agendamento";
  if (pathname.startsWith("/app/agendamentos/")) return "Detalhes do Agendamento";
  if (pathname.startsWith("/app/agendamentos")) return "Agendamentos";

  if (pathname.startsWith("/app/clientes/novo")) return "Novo Cliente";
  if (/^\/app\/clientes\/[^/]+\/pets\/[^/]+/.test(pathname)) return "Detalhes do Pet";
  if (pathname.startsWith("/app/clientes/")) return "Detalhes do Cliente";
  if (pathname.startsWith("/app/clientes")) return "Clientes";

  if (pathname.startsWith("/app/pets/novo")) return "Novo Pet";
  if (pathname.startsWith("/app/pets/")) return "Detalhes do Pet";
  if (pathname.startsWith("/app/pets")) return "Pets";

  if (pathname.startsWith("/app/servicos/novo")) return "Novo Serviço";
  if (pathname.startsWith("/app/servicos/")) return "Editar Serviço";
  if (pathname.startsWith("/app/servicos")) return "Serviços";

  if (pathname.startsWith("/app/precos")) return "Preços";

  if (pathname.startsWith("/app/pacotes/novo")) return "Novo Pacote";
  if (pathname.startsWith("/app/pacotes/") && pathname.endsWith("/editar")) {
    return "Editar Pacote";
  }
  if (pathname.startsWith("/app/pacotes")) return "Pacotes";

  if (pathname.startsWith("/app/perfil")) return "Meu Perfil";
  if (pathname.startsWith("/app/ajuda")) return "Central de Ajuda";

  return "Agenda";
}
