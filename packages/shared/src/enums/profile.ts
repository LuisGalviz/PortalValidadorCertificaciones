export const Profile = {
  Oia: 'oia',
  Inspector: 'inspector',
  Admin: 'admin',
  Strategy: 'estrategia',
  Sac: 'sac',
  DataManager: 'dataManager',
  CompanyManager: 'companyManager',
} as const;

export type ProfileType = (typeof Profile)[keyof typeof Profile];

export const ProfileNames: Record<string, string> = {
  [Profile.Oia]: 'OIA',
  [Profile.Inspector]: 'Inspector',
  [Profile.Admin]: 'Administrador',
  [Profile.Strategy]: 'Estrategia',
  [Profile.Sac]: 'SAC',
  [Profile.DataManager]: 'Gestor de Datos',
  [Profile.CompanyManager]: 'Gestor de Empresas',
};
