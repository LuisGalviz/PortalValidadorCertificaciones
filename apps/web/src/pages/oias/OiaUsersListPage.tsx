import { PageContainer, usePageHeader } from '@/components/layout';
import { OiaUsersTable } from '@/components/tables';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import type { ApiResponse, Oia } from '@portal/shared';
import { Permissions, hasPermission } from '@portal/shared';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type ModalMode = 'create' | 'edit' | 'view';

interface OiaUserFormData {
  name: string;
  authEmail: string;
  email: string;
  phone: string;
  active: string;
}

interface OiaUserResponse {
  id: number;
  name: string;
  authEmail?: string | null;
  email: string;
  phone: number | string | null;
  active: boolean | null;
}

const emptyUserFormData: OiaUserFormData = {
  name: '',
  authEmail: '',
  email: '',
  phone: '',
  active: 'true',
};

interface OiaUserPayload {
  name: string;
  email: string;
  authEmail: string | null;
  phone: number;
  active: boolean;
}

interface SaveRequest {
  execute: () => Promise<ApiResponse<OiaUserResponse>>;
  successMessage: string;
}

function getModalTitle(mode: ModalMode) {
  switch (mode) {
    case 'create':
      return 'Crear usuario';
    case 'edit':
      return 'Editar usuario';
    default:
      return 'Visualizar usuario';
  }
}

function mapUserToFormData(user: OiaUserResponse): OiaUserFormData {
  return {
    name: user.name ?? '',
    authEmail: user.authEmail ?? '',
    email: user.email ?? '',
    phone: user.phone ? String(user.phone) : '',
    active: user.active ? 'true' : 'false',
  };
}

function getUserValidationError(data: OiaUserFormData): string | null {
  if (!data.name) return 'El nombre es requerido';
  if (!data.email) return 'El correo de notificaciones es requerido';
  if (!data.phone) return 'El teléfono es requerido';
  return null;
}

function buildUserPayload(data: OiaUserFormData): OiaUserPayload {
  return {
    name: data.name,
    email: data.email,
    authEmail: data.authEmail || null,
    phone: Number(data.phone),
    active: data.active === 'true',
  };
}

function getSaveError(
  id: string | undefined,
  oiaId: number,
  mode: ModalMode,
  userId: number | null,
  data: OiaUserFormData
): string | null {
  const validationError = getUserValidationError(data);
  if (validationError) return validationError;
  if (!id || Number.isNaN(oiaId)) return 'OIA inválida';
  if (mode !== 'create' && !userId) return 'Usuario inválido';
  return null;
}

function buildSaveRequest(
  mode: ModalMode,
  oiaId: number,
  userId: number | null,
  payload: OiaUserPayload
): SaveRequest | null {
  if (mode === 'create') {
    return {
      execute: () => api.post<ApiResponse<OiaUserResponse>>(`/oias/${oiaId}/users`, payload),
      successMessage: 'Usuario creado correctamente',
    };
  }

  if (!userId) return null;

  return {
    execute: () => api.put<ApiResponse<OiaUserResponse>>(`/oias/${oiaId}/users/${userId}`, payload),
    successMessage: 'Usuario actualizado',
  };
}

async function fetchOiaName(id: string): Promise<string | null> {
  try {
    const response = await api.get<ApiResponse<Oia>>(`/oias/${id}`);
    if (response.success && response.data?.name) {
      return response.data.name;
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Error al cargar OIA');
  }
  return null;
}

async function fetchOiaUser(oiaId: number, userId: number): Promise<OiaUserResponse | null> {
  try {
    const response = await api.get<ApiResponse<OiaUserResponse>>(`/oias/${oiaId}/users/${userId}`);
    if (response.success && response.data) {
      return response.data;
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Error al cargar usuario');
  }
  return null;
}

export function OiaUsersListPage() {
  const { id } = useParams();
  const oiaId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [oiaName, setOiaName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [formData, setFormData] = useState<OiaUserFormData>(emptyUserFormData);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const canEdit = hasPermission(user?.permission ?? null, Permissions.OIAS_UPDATE);
  const subtitle = (() => {
    if (!id || Number.isNaN(oiaId)) return 'OIA inválida';
    if (loading) return 'Cargando OIA...';
    if (oiaName) return oiaName;
    return `OIA #${id}`;
  })();

  usePageHeader({
    title: 'Usuarios OIA',
    subtitle,
    backTo: '/oias',
  });

  useEffect(() => {
    if (!id || Number.isNaN(oiaId)) {
      setLoading(false);
      return;
    }

    const oiaIdParam = id;
    let isMounted = true;
    async function loadOia() {
      const name = await fetchOiaName(oiaIdParam);
      if (!isMounted) return;
      if (name) setOiaName(name);
      setLoading(false);
    }

    loadOia();
    return () => {
      isMounted = false;
    };
  }, [id, oiaId]);

  function closeModal() {
    setModalOpen(false);
    setModalLoading(false);
    setModalSaving(false);
    setSelectedUserId(null);
  }

  function openCreateModal() {
    setModalMode('create');
    setFormData(emptyUserFormData);
    setSelectedUserId(null);
    setModalOpen(true);
  }

  async function openUserModal(userId: number, mode: ModalMode) {
    if (Number.isNaN(oiaId)) return;
    setModalMode(mode);
    setModalLoading(true);
    setModalOpen(true);
    setSelectedUserId(userId);

    const userData = await fetchOiaUser(oiaId, userId);
    if (!userData) {
      closeModal();
      return;
    }

    setFormData(mapUserToFormData(userData));
    setModalLoading(false);
  }

  async function handleSave() {
    const saveError = getSaveError(id, oiaId, modalMode, selectedUserId, formData);
    if (saveError) {
      showError(saveError);
      return;
    }

    const payload = buildUserPayload(formData);
    const request = buildSaveRequest(modalMode, oiaId, selectedUserId, payload);
    if (!request) {
      showError('Usuario inválido');
      return;
    }

    try {
      setModalSaving(true);
      const response = await request.execute();
      if (response.success) {
        showSuccess(request.successMessage);
        queryClient.invalidateQueries({ queryKey: ['oia-users', oiaId] });
        closeModal();
        return;
      }

      showError(response.error || 'Error al guardar usuario');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar usuario');
    } finally {
      setModalSaving(false);
    }
  }

  if (!id || Number.isNaN(oiaId)) {
    return (
      <PageContainer>
        <div className="text-sm text-slate-600">OIA inválida.</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-w-0" fullHeight={true}>
      <div className="min-w-0 flex flex-col flex-1 min-h-0 space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-base lg:text-lg xl:text-xl font-semibold text-slate-900">
            Listado de usuarios
          </h2>
          {canEdit && (
            <Button onClick={openCreateModal} className="w-full sm:w-auto xl:h-10 xl:px-4">
              Crear usuario
            </Button>
          )}
        </div>

        <div className="min-w-0 flex-1 min-h-0">
          <OiaUsersTable
            oiaId={oiaId}
            onView={(userId) => openUserModal(userId, 'view')}
            onEdit={(userId) => openUserModal(userId, 'edit')}
            canEdit={canEdit}
          />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-base lg:text-lg font-semibold text-slate-900">
                {getModalTitle(modalMode)}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="px-4 py-5">
              {modalLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="userName">Nombre</Label>
                    <Input
                      id="userName"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmailAuth">Correo de acceso</Label>
                    <Input
                      id="userEmailAuth"
                      value={formData.authEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, authEmail: e.target.value }))
                      }
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Correo de notificaciones</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userPhone">Teléfono</Label>
                    <Input
                      id="userPhone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userActive">Estado</Label>
                    <Select
                      value={formData.active}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, active: value }))}
                      disabled={modalMode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            {modalMode !== 'view' && (
              <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                <Button variant="outline" onClick={closeModal} disabled={modalSaving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={modalSaving || modalLoading}>
                  {modalSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
