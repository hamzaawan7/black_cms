import { useState, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Textarea, Switch, MediaUploader } from '@/Components/Admin';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface TeamMember {
  id: number;
  name: string;
  title: string;
  bio: string | null;
  image: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  teamMember: TeamMember;
}

export default function Edit({ teamMember }: Props) {
  const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();
  const [imagePreview, setImagePreview] = useState<string | null>(teamMember.image);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
    name: teamMember.name,
    title: teamMember.title,
    bio: teamMember.bio || '',
    image: null as File | null,
    email: teamMember.email || '',
    phone: teamMember.phone || '',
    linkedin_url: teamMember.linkedin_url || '',
    order: teamMember.order,
    is_published: teamMember.is_published,
    _method: 'PUT',
  });

  const handleImageUpload = useCallback((files: File[]) => {
    if (files.length > 0) {
      setData('image', files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  }, [setData]);

  const handleImageRemove = useCallback(() => {
    setData('image', null);
    setImagePreview(null);
  }, [setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/team/${teamMember.id}`, {
      preserveScroll: true,
      forceFormData: true,
    });
  };

  const handleDelete = async () => {
    const result = await confirmDelete(teamMember.name);
    if (result.isConfirmed) {
      router.delete(`/admin/team/${teamMember.id}`, {
        onSuccess: () => {
          showDeletedSuccess(teamMember.name);
          router.visit('/admin/team');
        },
        onError: () => errorNotification('Failed to delete team member'),
      });
    }
  };

  return (
    <AdminLayout>
      <Head title={`Edit Team Member: ${teamMember.name}`} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Team Member</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update team member information.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Member
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    placeholder="John Doe"
                    required
                  />

                  <Input
                    label="Job Title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    error={errors.title}
                    placeholder="CEO, Director, etc."
                    required
                  />
                </div>

                <Textarea
                  label="Bio"
                  value={data.bio}
                  onChange={(e) => setData('bio', e.target.value)}
                  error={errors.bio}
                  rows={4}
                  placeholder="A brief biography about the team member..."
                />
              </CardContent>
            </Card>

            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaUploader
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  preview={imagePreview}
                  accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
                {errors.image && (
                  <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="email"
                    label="Email Address"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    placeholder="john@example.com"
                  />

                  <Input
                    type="tel"
                    label="Phone Number"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    error={errors.phone}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <Input
                  type="url"
                  label="LinkedIn Profile URL"
                  value={data.linkedin_url}
                  onChange={(e) => setData('linkedin_url', e.target.value)}
                  error={errors.linkedin_url}
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    type="number"
                    label="Display Order"
                    value={data.order.toString()}
                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                    error={errors.order}
                    hint="Lower numbers appear first."
                  />

                  <div className="flex items-end">
                    <Switch
                      label="Published"
                      description="Show this team member on the website."
                      checked={data.is_published}
                      onChange={(checked) => setData('is_published', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(teamMember.updated_at).toLocaleDateString()}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit('/admin/team')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={processing}>
                    Save Changes
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Team Member
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{teamMember.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
