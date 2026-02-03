import { PageContainer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import type { ApiResponse, Oia } from '@portal/shared';
import { useCallback, useEffect, useState } from 'react';

interface TypeOrganism {
  id: number;
  name: string;
  active: boolean;
}

interface NotificationUser {
  name: string;
  phone: number;
  email: string;
  authEmail: string | null;
}

interface OiaWithExtras extends Oia {
  statusName?: string | null;
  typeOrganismName?: string | null;
  fileONACUrl?: string | null;
  fileONACName?: string | null;
  fileCRTUrl?: string | null;
  fileCRTName?: string | null;
  notificationUser?: NotificationUser | null;
}

interface OiaFormData {
  // Información básica
  name: string;
  codeAcred: string;
  effectiveDate: string;
  typeOrganismId: string;
  addressOrganism: string;
  // Representante Legal
  cedRepLegal: string;
  nameRepLegal: string;
  addressRepLegal: string;
  // Información de Contacto (datos de OIA)
  nameContact: string;
  phoneContact: string;
  phoneContactAlternative: string;
  // Información de Notificación (datos del Usuario)
  userName: string;
  userPhone: string;
  userEmail: string;
}

const emptyFormData: OiaFormData = {
  name: '',
  codeAcred: '',
  effectiveDate: '',
  typeOrganismId: '',
  addressOrganism: '',
  cedRepLegal: '',
  nameRepLegal: '',
  addressRepLegal: '',
  nameContact: '',
  phoneContact: '',
  phoneContactAlternative: '',
  userName: '',
  userPhone: '',
  userEmail: '',
};

function toInputDate(value?: string | Date | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

function toStringValue(value?: string | number | null): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function mapOiaToFormData(oiaData: OiaWithExtras): OiaFormData {
  return {
    name: oiaData.name ?? '',
    codeAcred: oiaData.codeAcred ?? '',
    effectiveDate: toInputDate(oiaData.effectiveDate),
    typeOrganismId: toStringValue(oiaData.typeOrganismId),
    addressOrganism: oiaData.addressOrganism ?? '',
    cedRepLegal: toStringValue(oiaData.cedRepLegal),
    nameRepLegal: oiaData.nameRepLegal ?? '',
    addressRepLegal: oiaData.addressRepLegal ?? '',
    nameContact: oiaData.nameContact ?? '',
    phoneContact: toStringValue(oiaData.phoneContact),
    phoneContactAlternative: toStringValue(oiaData.phoneContactAlternative),
    userName: oiaData.notificationUser?.name ?? '',
    userPhone: toStringValue(oiaData.notificationUser?.phone),
    userEmail: oiaData.notificationUser?.email ?? '',
  };
}

function getResponseData<T>(response: ApiResponse<T>): T | null {
  if (!response.success || !response.data) return null;
  return response.data;
}

function getValidationError(data: OiaFormData): string | null {
  if (!data.userName) return 'El nombre del usuario es requerido';
  if (!data.userPhone) return 'El celular de notificación es requerido';
  if (!data.userEmail) return 'El correo de notificación es requerido';
  return null;
}

function appendIfValue(form: FormData, key: string, value: string) {
  if (value) form.append(key, value);
}

function buildMultipartData(
  data: OiaFormData,
  files: { fileOnac: File | null; fileCRT: File | null }
): FormData {
  const multipartData = new FormData();

  multipartData.append('name', data.name);
  multipartData.append('codeAcred', data.codeAcred);
  appendIfValue(multipartData, 'effectiveDate', data.effectiveDate);
  appendIfValue(multipartData, 'cedRepLegal', data.cedRepLegal);
  appendIfValue(multipartData, 'nameRepLegal', data.nameRepLegal);
  appendIfValue(multipartData, 'addressRepLegal', data.addressRepLegal);
  appendIfValue(multipartData, 'typeOrganismId', data.typeOrganismId);
  appendIfValue(multipartData, 'addressOrganism', data.addressOrganism);
  appendIfValue(multipartData, 'nameContact', data.nameContact);
  appendIfValue(multipartData, 'phoneContact', data.phoneContact);
  appendIfValue(multipartData, 'phoneContactAlternative', data.phoneContactAlternative);

  multipartData.append('userName', data.userName);
  multipartData.append('userPhone', data.userPhone);
  multipartData.append('userEmail', data.userEmail);

  if (files.fileOnac) multipartData.append('fileOnac', files.fileOnac);
  if (files.fileCRT) multipartData.append('fileCRT', files.fileCRT);

  return multipartData;
}

export function MyOiaPage() {
  const [oia, setOia] = useState<OiaWithExtras | null>(null);
  const [typeOrganisms, setTypeOrganisms] = useState<TypeOrganism[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileOnac, setFileOnac] = useState<File | null>(null);
  const [fileCRT, setFileCRT] = useState<File | null>(null);

  const [formData, setFormData] = useState<OiaFormData>(emptyFormData);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [oiaResponse, typesResponse] = await Promise.all([
        api.get<ApiResponse<OiaWithExtras>>('/oias/me'),
        api.get<ApiResponse<TypeOrganism[]>>('/catalogs/type-organisms'),
      ]);

      const typesData = getResponseData(typesResponse);
      if (typesData) {
        setTypeOrganisms(typesData);
      }

      const oiaData = getResponseData(oiaResponse);
      if (oiaData) {
        setOia(oiaData);
        setFormData(mapOiaToFormData(oiaData));
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(value: string) {
    setFormData((prev) => ({ ...prev, typeOrganismId: value }));
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) {
    if (e.target.files && e.target.files.length > 0) {
      setter(e.target.files[0]);
    } else {
      setter(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = getValidationError(formData);
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);

      const multipartData = buildMultipartData(formData, { fileOnac, fileCRT });

      const response = await api.put<ApiResponse<OiaWithExtras> & { message?: string }>(
        '/oias/me',
        multipartData
      );

      if (response.success) {
        showSuccess(
          response.message ||
            'Datos actualizados correctamente. Su solicitud está pendiente de revisión.'
        );
        if (response.data) {
          setOia(response.data);
          // Reset files after successful upload
          setFileOnac(null);
          setFileCRT(null);
        }
      } else {
        showError(response.error || 'Error al guardar datos');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al guardar datos');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900">
          Datos de mi Empresa
        </h1>
        <p className="text-sm lg:text-base text-slate-600">
          Actualice la información de su organismo de inspección
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos generales de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>NIT</Label>
                <Input value={oia?.identification || ''} disabled className="bg-slate-100" />
                <p className="text-xs text-slate-500">El NIT no puede ser modificado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Razón Social *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codeAcred">Código de Acreditación *</Label>
                <Input
                  id="codeAcred"
                  name="codeAcred"
                  value={formData.codeAcred}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Vigencia Certificado ONAC</Label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeOrganismId">Tipo de Organismo</Label>
                <Select value={formData.typeOrganismId} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de organismo" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOrganisms.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressOrganism">Dirección de Operación</Label>
                <Input
                  id="addressOrganism"
                  name="addressOrganism"
                  value={formData.addressOrganism}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Representante Legal */}
          <Card>
            <CardHeader>
              <CardTitle>Representante Legal</CardTitle>
              <CardDescription>Información del representante legal de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cedRepLegal">Cédula del Representante</Label>
                <Input
                  id="cedRepLegal"
                  name="cedRepLegal"
                  type="number"
                  value={formData.cedRepLegal}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameRepLegal">Nombre Completo</Label>
                <Input
                  id="nameRepLegal"
                  name="nameRepLegal"
                  value={formData.nameRepLegal}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressRepLegal">Dirección del Representante</Label>
                <Input
                  id="addressRepLegal"
                  name="addressRepLegal"
                  value={formData.addressRepLegal}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto - Datos de la OIA */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Datos del contacto de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nameContact">Nombre del Contacto</Label>
                <Input
                  id="nameContact"
                  name="nameContact"
                  value={formData.nameContact}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneContact">Celular del Contacto</Label>
                <Input
                  id="phoneContact"
                  name="phoneContact"
                  type="tel"
                  value={formData.phoneContact}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneContactAlternative">Teléfono Alternativo</Label>
                <Input
                  id="phoneContactAlternative"
                  name="phoneContactAlternative"
                  type="tel"
                  value={formData.phoneContactAlternative}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Certificados y Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Certificados y Estado</CardTitle>
              <CardDescription>Documentos y estado actual de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Certificado ONAC</Label>
                  {oia?.fileONACUrl ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        role="img"
                        aria-label="Certificado ONAC"
                      >
                        <title>Certificado ONAC</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={oia.fileONACUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
                      >
                        {oia.fileONACName || 'Descargar Certificado ONAC'}
                      </a>
                    </div>
                  ) : (
                    <div className="p-2 border rounded-md bg-slate-50 text-sm text-slate-500">
                      No hay certificado cargado
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileOnac">Subir nuevo Certificado ONAC (PDF)</Label>
                  <Input
                    id="fileOnac"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, setFileOnac)}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Certificado de Existencia</Label>
                  {oia?.fileCRTUrl ? (
                    <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        role="img"
                        aria-label="Certificado de Existencia"
                      >
                        <title>Certificado de Existencia</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={oia.fileCRTUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
                      >
                        {oia.fileCRTName || 'Descargar Certificado de Existencia'}
                      </a>
                    </div>
                  ) : (
                    <div className="p-2 border rounded-md bg-slate-50 text-sm text-slate-500">
                      No hay certificado cargado
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileCRT">Subir nuevo Certificado de Existencia (PDF)</Label>
                  <Input
                    id="fileCRT"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, setFileCRT)}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Aceptó Términos y Condiciones</Label>
                <Input
                  value={oia?.acceptedTermsAndConditions ? 'SI' : 'NO'}
                  disabled
                  className="bg-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label>Estado Actual</Label>
                <Input value={oia?.statusName || 'Sin estado'} disabled className="bg-slate-100" />
              </div>
            </CardContent>
          </Card>

          {/* Información de Notificación - Datos del Usuario */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle>Información de Notificación</CardTitle>
              <CardDescription>
                Datos del usuario para autenticación y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="userName">Nombre del Usuario *</Label>
                <Input
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userPhone">Celular de Notificación *</Label>
                <Input
                  id="userPhone"
                  name="userPhone"
                  type="tel"
                  value={formData.userPhone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail">Correo de Notificación *</Label>
                <Input
                  id="userEmail"
                  name="userEmail"
                  type="email"
                  value={formData.userEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <div className="px-6 pb-4">
              <p className="text-xs text-blue-700 bg-blue-100 p-3 rounded-md">
                <strong>Nota:</strong> El número de celular será solicitado al momento de
                autenticarse. El correo de notificación será utilizado para enviar todas las
                comunicaciones sobre los procesos de su organismo.
              </p>
            </div>
          </Card>

          {/* Nota informativa */}
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
            <strong>Importante:</strong> Al guardar los cambios, su solicitud quedará en estado
            &quot;Pendiente&quot; hasta que sea revisada y aprobada por el administrador.
          </div>

          {/* Botón de Guardar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
