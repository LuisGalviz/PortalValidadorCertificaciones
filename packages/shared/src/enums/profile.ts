export const Profile = {
  Oia: 'oia',
  Admin: 'admin',
  Funcional: 'funcional',
} as const;

export type ProfileType = (typeof Profile)[keyof typeof Profile];

export const ProfileNames: Record<string, string> = {
  [Profile.Oia]: 'OIA',
  [Profile.Admin]: 'Administrador',
  [Profile.Funcional]: 'Funcional',
};
