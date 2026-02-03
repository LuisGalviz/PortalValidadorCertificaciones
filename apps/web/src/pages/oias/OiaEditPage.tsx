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
import { OiaStatusCode, StatusRequestText } from '@portal/shared';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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

type OrganismCode = {
  gasera: string;
  codigo: string;
};

interface OiaEditFormData {
  identification: string;
  name: string;
  codeAcred: string;
  effectiveDate: string;
  typeOrganismId: string;
  addressOrganism: string;
  cedRepLegal: string;
  nameRepLegal: string;
  addressRepLegal: string;
  nameContact: string;
  phoneContact: string;
  phoneContactAlternative: string;
  status: string;
  comment: string;
}

const emptyFormData: OiaEditFormData = {
  identification: '',
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
  status: '',
  comment: '',
};

const GASERA_LABELS: Record<string, string> = {
  GDC: 'Gases del Caribe',
  GDG: 'Gases de La Guajira',
};

function normalizeGasera(value: string) {
  const trimmed = value.trim();
  if (trimmed === GASERA_LABELS.GDC) return 'GDC';
  if (trimmed === GASERA_LABELS.GDG) return 'GDG';
  return trimmed;
}

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

function mapOiaToFormData(oiaData: OiaWithExtras): OiaEditFormData {
  return {
    identification: toStringValue(oiaData.identification),
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
    status: toStringValue(oiaData.status),
    comment: oiaData.comment ?? '',
  };
}

function mapOrganismCodes(raw: unknown): OrganismCode[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    gasera: normalizeGasera(String(item?.gasera ?? '')),
    codigo: String(item?.codigo ?? ''),
  }));
}

async function fetchTypeOrganismsData(): Promise<TypeOrganism[] | null> {
  try {
    const response = await api.get<ApiResponse<TypeOrganism[]>>('/catalogs/type-organisms');
    if (response.success && response.data) {
      return response.data;
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Error al cargar catálogos');
  }
  return null;
}

async function fetchOiaData(id: string): Promise<OiaWithExtras | null> {
  try {
    const response = await api.get<ApiResponse<OiaWithExtras>>(`/oias/${id}`, { includeFiles: 1 });
    if (response.success && response.data) {
      return response.data;
    }
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Error al cargar datos');
  }
  return null;
}

function appendIfValue(form: FormData, key: string, value?: string) {
  if (value !== undefined && value !== null && value !== '') {
    form.append(key, value);
  }
}

function getValidationError(data: OiaEditFormData, organismCodes: OrganismCode[]): string | null {
  const requiredFields = [
    { value: data.identification, message: 'El NIT es requerido' },
    { value: data.name, message: 'La razón social es requerida' },
    { value: data.codeAcred, message: 'El código de acreditación es requerido' },
    { value: data.effectiveDate, message: 'La vigencia del certificado ONAC es requerida' },
    { value: data.typeOrganismId, message: 'El tipo de organismo es requerido' },
    { value: data.addressOrganism, message: 'La dirección de operación es requerida' },
    { value: data.nameContact, message: 'El nombre del contacto es requerido' },
    { value: data.phoneContact, message: 'El celular del contacto es requerido' },
  ];

  const missingField = requiredFields.find((field) => !field.value);
  if (missingField) {
    return missingField.message;
  }

  if (data.status && Number(data.status) !== OiaStatusCode.Approved && !data.comment.trim()) {
    return 'Debe ingresar una observación cuando el estado no es aprobado';
  }

  if (Number(data.status) === OiaStatusCode.Approved && organismCodes.length === 0) {
    return 'Debe agregar al menos un código de distribuidora para aprobar';
  }

  return null;
}

export function OiaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const oiaId = Number(id);
  const [typeOrganisms, setTypeOrganisms] = useState<TypeOrganism[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fileOnac, setFileOnac] = useState<File | null>(null);
  const [fileCRT, setFileCRT] = useState<File | null>(null);
  const [formData, setFormData] = useState<OiaEditFormData>(emptyFormData);
  const [organismCodes, setOrganismCodes] = useState<OrganismCode[]>([]);
  const [gasera, setGasera] = useState('');
  const [codigo, setCodigo] = useState('');
  const [oia, setOia] = useState<OiaWithExtras | null>(null);

  const statusOptions = useMemo(
    () => [
      { value: String(OiaStatusCode.Pending), label: StatusRequestText.Pending },
      { value: String(OiaStatusCode.Approved), label: StatusRequestText.Approved },
      { value: String(OiaStatusCode.Rejected), label: StatusRequestText.Rejected },
      { value: String(OiaStatusCode.Suspended), label: StatusRequestText.Suspended },
      { value: String(OiaStatusCode.Expired), label: StatusRequestText.Expired },
      { value: String(OiaStatusCode.Retired), label: StatusRequestText.Retired },
    ],
    []
  );

  useEffect(() => {
    if (!id || Number.isNaN(oiaId)) {
      setLoading(false);
      return;
    }

    const oiaIdParam = id;
    let isMounted = true;

    async function loadData() {
      const [typesData, oiaData] = await Promise.all([
        fetchTypeOrganismsData(),
        fetchOiaData(oiaIdParam),
      ]);

      if (!isMounted) return;

      if (typesData) {
        setTypeOrganisms(typesData);
      }

      if (oiaData) {
        setOia(oiaData);
        setFormData(mapOiaToFormData(oiaData));
        setOrganismCodes(mapOrganismCodes(oiaData.organismCodes));
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, oiaId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(value: string, field: keyof OiaEditFormData) {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    const validationError = getValidationError(formData, organismCodes);
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      appendIfValue(payload, 'identification', formData.identification);
      appendIfValue(payload, 'name', formData.name);
      appendIfValue(payload, 'codeAcred', formData.codeAcred);
      appendIfValue(payload, 'effectiveDate', formData.effectiveDate);
      appendIfValue(payload, 'typeOrganismId', formData.typeOrganismId);
      appendIfValue(payload, 'addressOrganism', formData.addressOrganism);
      appendIfValue(payload, 'cedRepLegal', formData.cedRepLegal);
      appendIfValue(payload, 'nameRepLegal', formData.nameRepLegal);
      appendIfValue(payload, 'addressRepLegal', formData.addressRepLegal);
      appendIfValue(payload, 'nameContact', formData.nameContact);
      appendIfValue(payload, 'phoneContact', formData.phoneContact);
      appendIfValue(payload, 'phoneContactAlternative', formData.phoneContactAlternative);
      appendIfValue(payload, 'status', formData.status);
      appendIfValue(payload, 'comment', formData.comment);
      payload.append('organismCodes', JSON.stringify(organismCodes));

      if (fileOnac) payload.append('fileOnac', fileOnac);
      if (fileCRT) payload.append('fileCRT', fileCRT);

      const response = await api.put<ApiResponse<Oia>>(`/oias/${id}`, payload);

      if (response.success) {
        showSuccess('OIA actualizada correctamente');
        queryClient.invalidateQueries({ queryKey: ['oias'] });
        navigate('/oias');
        return;
      }

      showError(response.error || 'Error al actualizar OIA');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al actualizar OIA');
    } finally {
      setSaving(false);
    }
  }

  if (!id || Number.isNaN(oiaId)) {
    return (
      <PageContainer>
        <div className="text-sm text-slate-600">OIA inválida.</div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4 lg:space-y-6 xl:space-y-8 min-w-0">
      <div className="flex items-center justify-between gap-4 pb-8">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">
            Editar OIA
          </h1>
          <p className="text-sm lg:text-base xl:text-lg text-slate-600 truncate">
            {oia?.name || `OIA #${id}`}
          </p>
        </div>
        <Button asChild variant="outline" className="xl:h-11 xl:px-6 xl:text-base flex-shrink-0">
          <Link to="/oias">
            <ArrowLeft className="h-4 w-4 xl:h-5 xl:w-5 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
            <CardDescription>Datos generales del organismo</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="identification">NIT *</Label>
              <Input
                id="identification"
                name="identification"
                type="number"
                value={formData.identification}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Razón Social *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeAcred">Código Acreditación *</Label>
              <Input
                id="codeAcred"
                name="codeAcred"
                value={formData.codeAcred}
                onChange={handleChange}
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
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Registro</Label>
              <Input
                value={oia?.createdAt ? new Date(oia.createdAt).toLocaleDateString('es-CO') : ''}
                disabled
                className="bg-slate-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeOrganismId">Tipo de Organismo *</Label>
              <Select
                value={formData.typeOrganismId}
                onValueChange={(value) => handleSelectChange(value, 'typeOrganismId')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOrganisms.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressOrganism">Dirección de Operación *</Label>
              <Input
                id="addressOrganism"
                name="addressOrganism"
                value={formData.addressOrganism}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Representante Legal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="cedRepLegal">Cédula Representante</Label>
              <Input
                id="cedRepLegal"
                name="cedRepLegal"
                type="number"
                value={formData.cedRepLegal}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameRepLegal">Nombre Representante</Label>
              <Input
                id="nameRepLegal"
                name="nameRepLegal"
                value={formData.nameRepLegal}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressRepLegal">Dirección Representante</Label>
              <Input
                id="addressRepLegal"
                name="addressRepLegal"
                value={formData.addressRepLegal}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nameContact">Nombre del Contacto *</Label>
              <Input
                id="nameContact"
                name="nameContact"
                value={formData.nameContact}
                onChange={handleChange}
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
            <CardTitle>Estado y Observaciones</CardTitle>
            <CardDescription>Gestión del estado y comentarios administrativos</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange(value, 'status')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aceptó Términos y Condiciones</Label>
              <Input
                value={oia?.acceptedTermsAndConditions ? 'SI' : 'NO'}
                disabled
                className="bg-slate-100"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="comment">Observación</Label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                className="min-h-[110px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Códigos de Organismo por Distribuidora</CardTitle>
            <CardDescription>Registre los códigos asociados a cada distribuidora</CardDescription>
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
                    <SelectItem value="GDC">{GASERA_LABELS.GDC}</SelectItem>
                    <SelectItem value="GDG">{GASERA_LABELS.GDG}</SelectItem>
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
                      <td className="px-3 py-2">{GASERA_LABELS[item.gasera] ?? item.gasera}</td>
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

        <Card>
          <CardHeader>
            <CardTitle>Certificados</CardTitle>
            <CardDescription>Adjunte o actualice los certificados vigentes</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Certificado ONAC</Label>
                {oia?.fileONACUrl ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
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
                <Label htmlFor="fileOnac">Actualizar Certificado ONAC (PDF)</Label>
                <Input
                  id="fileOnac"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setFileOnac)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Certificado de Existencia</Label>
                {oia?.fileCRTUrl ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
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
                <Label htmlFor="fileCRT">Actualizar Certificado de Existencia (PDF)</Label>
                <Input
                  id="fileCRT"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, setFileCRT)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pb-4">
          <Button type="submit" disabled={saving} className="w-full md:w-auto">
            {saving ? 'Guardando...' : 'Actualizar'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
