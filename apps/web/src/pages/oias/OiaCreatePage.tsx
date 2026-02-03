import { PageContainer, usePageHeader } from '@/components/layout';
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
import { useAuth } from '@/features/auth';
import { api } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import type { ApiResponse } from '@portal/shared';
import { Profile } from '@portal/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TypeOrganism {
  id: number;
  name: string;
  active: boolean;
}

interface OrganismCode {
  gasera: string;
  codigo: string;
}

interface OiaCreateFormData {
  identification: string;
  name: string;
  codeAcred: string;
  effectiveDate: string;
  cedRepLegal: string;
  nameRepLegal: string;
  addressRepLegal: string;
  typeOrganismId: string;
  addressOrganism: string;
  nameContact: string;
  phoneContact: string;
  phoneContactAlternative: string;
  userName: string;
  userPhone: string;
  userEmail: string;
}

const emptyFormData: OiaCreateFormData = {
  identification: '',
  name: '',
  codeAcred: '',
  effectiveDate: '',
  cedRepLegal: '',
  nameRepLegal: '',
  addressRepLegal: '',
  typeOrganismId: '',
  addressOrganism: '',
  nameContact: '',
  phoneContact: '',
  phoneContactAlternative: '',
  userName: '',
  userPhone: '',
  userEmail: '',
};

function appendIfValue(form: FormData, key: string, value: string) {
  if (value) {
    form.append(key, value);
  }
}

function buildFormData(
  data: OiaCreateFormData,
  files: { fileOnac: File | null; fileCRT: File | null },
  organismCodes: OrganismCode[]
) {
  const form = new FormData();

  form.append('identification', data.identification);
  form.append('name', data.name);
  form.append('codeAcred', data.codeAcred);

  appendIfValue(form, 'effectiveDate', data.effectiveDate);
  appendIfValue(form, 'cedRepLegal', data.cedRepLegal);
  appendIfValue(form, 'nameRepLegal', data.nameRepLegal);
  appendIfValue(form, 'addressRepLegal', data.addressRepLegal);
  appendIfValue(form, 'typeOrganismId', data.typeOrganismId);
  appendIfValue(form, 'addressOrganism', data.addressOrganism);
  appendIfValue(form, 'nameContact', data.nameContact);
  appendIfValue(form, 'phoneContact', data.phoneContact);
  appendIfValue(form, 'phoneContactAlternative', data.phoneContactAlternative);

  form.append('userName', data.userName);
  form.append('userPhone', data.userPhone);
  form.append('userEmail', data.userEmail);
  form.append('emailContact', data.userEmail);

  if (organismCodes.length > 0) {
    form.append('organismCodes', JSON.stringify(organismCodes));
  }

  if (files.fileOnac) {
    form.append('fileOnac', files.fileOnac);
  }
  if (files.fileCRT) {
    form.append('fileCRT', files.fileCRT);
  }

  return form;
}

function getValidationError(
  data: OiaCreateFormData,
  files: { fileOnac: File | null; fileCRT: File | null }
) {
  const requiredFields = [
    { value: data.identification, message: 'El NIT es requerido' },
    { value: data.name, message: 'La razón social es requerida' },
    { value: data.codeAcred, message: 'El código de acreditación es requerido' },
    { value: data.effectiveDate, message: 'La vigencia del certificado ONAC es requerida' },
    { value: data.cedRepLegal, message: 'La cédula del representante legal es requerida' },
    { value: data.nameRepLegal, message: 'El nombre del representante legal es requerido' },
    { value: data.addressRepLegal, message: 'La dirección del representante legal es requerida' },
    { value: data.typeOrganismId, message: 'El tipo de organismo es requerido' },
    { value: data.addressOrganism, message: 'La dirección de operación es requerida' },
    { value: data.nameContact, message: 'El nombre del contacto es requerido' },
    { value: data.phoneContact, message: 'El celular del contacto es requerido' },
    { value: data.userName, message: 'El nombre del usuario es requerido' },
    { value: data.userPhone, message: 'El celular del usuario es requerido' },
    { value: data.userEmail, message: 'El correo de notificación es requerido' },
  ];

  const missingField = requiredFields.find((field) => !field.value);
  if (missingField) {
    return missingField.message;
  }

  if (!files.fileOnac) return 'Debe cargar el certificado ONAC';
  if (!files.fileCRT) return 'Debe cargar el certificado de existencia';

  return null;
}

export function OiaCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [typeOrganisms, setTypeOrganisms] = useState<TypeOrganism[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileOnac, setFileOnac] = useState<File | null>(null);
  const [fileCRT, setFileCRT] = useState<File | null>(null);
  const [formData, setFormData] = useState<OiaCreateFormData>(emptyFormData);
  const [organismCodes, setOrganismCodes] = useState<OrganismCode[]>([]);
  const [gasera, setGasera] = useState('');
  const [codigo, setCodigo] = useState('');

  usePageHeader({
    title: 'Registro de OIA',
    subtitle: 'Registre un nuevo organismo de inspección',
    backTo: '/oias',
  });

  const isAdmin = user?.permission === Profile.Admin;

  useEffect(() => {
    let isMounted = true;

    async function loadTypeOrganisms() {
      try {
        const response = await api.get<ApiResponse<TypeOrganism[]>>('/catalogs/type-organisms');
        if (response.success && response.data && isMounted) {
          setTypeOrganisms(response.data);
        }
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Error al cargar catálogos');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTypeOrganisms();

    return () => {
      isMounted = false;
    };
  }, []);

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

  function handleAddCode() {
    if (!gasera) {
      showError('Seleccione una distribuidora');
      return;
    }
    if (!codigo) {
      showError('Ingrese un código de organismo');
      return;
    }
    if (organismCodes.some((item) => item.gasera === gasera)) {
      showError('No puede haber gaseras repetidas');
      return;
    }

    setOrganismCodes((prev) => [...prev, { gasera, codigo }]);
    setGasera('');
    setCodigo('');
  }

  function handleRemoveCode(index: number) {
    setOrganismCodes((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = getValidationError(formData, { fileOnac, fileCRT });
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);
      const payload = buildFormData(formData, { fileOnac, fileCRT }, organismCodes);
      const response = await api.post<ApiResponse<unknown>>('/oias', payload);

      if (response.success) {
        showSuccess(response.message || 'OIA registrado correctamente');
        queryClient.invalidateQueries({ queryKey: ['oias'] });
        navigate('/oias');
        return;
      }

      showError(response.error || 'Error al registrar OIA');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al registrar OIA');
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
    <PageContainer className="space-y-4 lg:space-y-6 pb-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos generales de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="identification">NIT *</Label>
                <Input
                  id="identification"
                  name="identification"
                  type="number"
                  value={formData.identification}
                  onChange={handleChange}
                  required
                />
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
                <Label htmlFor="effectiveDate">Vigencia Certificado ONAC *</Label>
                <Input
                  id="effectiveDate"
                  name="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeOrganismId">Tipo de Organismo *</Label>
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
                <Label htmlFor="addressOrganism">Dirección de Operación *</Label>
                <Input
                  id="addressOrganism"
                  name="addressOrganism"
                  value={formData.addressOrganism}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Representante Legal</CardTitle>
              <CardDescription>Información del representante legal de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cedRepLegal">Cédula del Representante *</Label>
                <Input
                  id="cedRepLegal"
                  name="cedRepLegal"
                  type="number"
                  value={formData.cedRepLegal}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameRepLegal">Nombre Completo *</Label>
                <Input
                  id="nameRepLegal"
                  name="nameRepLegal"
                  value={formData.nameRepLegal}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressRepLegal">Dirección del Representante *</Label>
                <Input
                  id="addressRepLegal"
                  name="addressRepLegal"
                  value={formData.addressRepLegal}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Datos del contacto de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nameContact">Nombre del Contacto *</Label>
                <Input
                  id="nameContact"
                  name="nameContact"
                  value={formData.nameContact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneContact">Celular del Contacto *</Label>
                <Input
                  id="phoneContact"
                  name="phoneContact"
                  type="tel"
                  value={formData.phoneContact}
                  onChange={handleChange}
                  required
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

          <Card>
            <CardHeader>
              <CardTitle>Certificados</CardTitle>
              <CardDescription>Documentos requeridos para el registro</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fileOnac">Certificado ONAC (PDF) *</Label>
                <Input
                  id="fileOnac"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setFileOnac)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileCRT">Certificado de Existencia (PDF) *</Label>
                <Input
                  id="fileCRT"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setFileCRT)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Códigos de Organismo por Distribuidora</CardTitle>
                <CardDescription>
                  Registre los códigos asociados a cada distribuidora
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end">
                  <div className="space-y-2">
                    <Label>Distribuidora</Label>
                    <Select value={gasera} onValueChange={setGasera}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione distribuidora" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GDC">Gases del Caribe</SelectItem>
                        <SelectItem value="GDG">Gases de La Guajira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código de Organismo</Label>
                    <Input
                      id="codigo"
                      type="number"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      min={1}
                    />
                  </div>

                  <Button type="button" onClick={handleAddCode}>
                    Agregar
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border border-slate-200">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Distribuidora</th>
                        <th className="px-3 py-2 text-left font-medium">Código</th>
                        <th className="px-3 py-2 text-left font-medium w-24">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organismCodes.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-3 py-3 text-slate-500 text-center">
                            No hay códigos registrados
                          </td>
                        </tr>
                      )}
                      {organismCodes.map((item, index) => (
                        <tr key={`${item.gasera}-${item.codigo}`} className="border-t">
                          <td className="px-3 py-2">{item.gasera}</td>
                          <td className="px-3 py-2">{item.codigo}</td>
                          <td className="px-3 py-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveCode(index)}
                            >
                              Eliminar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle>Información de Acceso</CardTitle>
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
                <Label htmlFor="userPhone">Celular del Usuario *</Label>
                <Input
                  id="userPhone"
                  name="userPhone"
                  type="tel"
                  value={formData.userPhone}
                  onChange={handleChange}
                  required
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
                <strong>Nota:</strong> El número de celular será solicitado para autenticación y el
                correo será utilizado para las notificaciones del portal.
              </p>
            </div>
          </Card>

          <div className="flex justify-end pb-4">
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              {saving ? 'Registrando...' : 'Registrar OIA'}
            </Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
