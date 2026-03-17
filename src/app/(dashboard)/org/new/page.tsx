'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createOrganization, type CreateOrganizationData } from '@/lib/api/organizations';
import { uploadLogo } from '@/lib/api/upload';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { Building2, Upload, Image as ImageIcon } from 'lucide-react';

const orgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description too long').optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export default function NewOrganizationPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrgFormValues>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
    },
  });

  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name, { shouldValidate: true });
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setValue('slug', slug, { shouldValidate: true });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const createOrgMutation = useMutation({
    mutationFn: async (data: OrgFormValues) => {
      let logoUrl: string | undefined;
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadRes = (await uploadLogo(formData)) as unknown as { url: string };
        logoUrl = uploadRes.url;
      }
      return createOrganization({
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: logoUrl,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
      } as CreateOrganizationData) as unknown as { _id: string; id?: string };
    },
    onSuccess: async (result) => {
      toast.success('Organization created successfully');
      // Refresh user profile — backend auto-promotes to org_admin on org creation
      await refreshUser();
      router.push(`/org/${result._id || result.id}/manage`);
    },
    onError: () => {
      toast.error('Failed to create organization');
    },
  });

  const onSubmit = (data: OrgFormValues) => {
    createOrgMutation.mutate(data);
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <Building2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Create Organization
          </h1>
          <p className="text-sm text-text-secondary">
            Set up your sports organization to manage tournaments
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Logo Upload */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface transition-colors hover:border-accent hover:bg-accent/5"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-text-tertiary group-hover:text-accent" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />
              <p className="mt-2 text-xs text-text-tertiary">Click to upload logo</p>
            </div>

            {/* Name */}
            <Input
              label="Organization Name"
              {...register('name')}
              onChange={handleNameChange}
              placeholder="My Sports Club"
              error={errors.name?.message}
            />

            {/* Slug */}
            <Input
              label="Slug (URL identifier)"
              {...register('slug')}
              placeholder="my-sports-club"
              error={errors.slug?.message}
            />

            {/* Description */}
            <Textarea
              label="Description"
              {...register('description')}
              placeholder="What is this organization about?"
              rows={3}
              error={errors.description?.message}
            />

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor || '#10B981'}
                    onChange={(e) => setValue('primaryColor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                  />
                  <Input
                    {...register('primaryColor')}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor || '#059669'}
                    onChange={(e) => setValue('secondaryColor', e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                  />
                  <Input
                    {...register('secondaryColor')}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              loading={createOrgMutation.isPending}
              className="w-full"
            >
              Create Organization
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
