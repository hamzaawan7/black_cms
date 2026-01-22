import { useState, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Textarea, Switch, Select, MediaUploader } from '@/Components/Admin';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Service {
  value: string;
  label: string;
}

interface Testimonial {
  id: number;
  author_name: string;
  author_title: string | null;
  author_image: string | null;
  content: string;
  rating: number;
  service_id: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  testimonial: Testimonial;
  services: Service[];
}

export default function Edit({ testimonial, services }: Props) {
  const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();
  const [imagePreview, setImagePreview] = useState<string | null>(testimonial.author_image);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
    author_name: testimonial.author_name,
    author_title: testimonial.author_title || '',
    author_image: null as File | null,
    content: testimonial.content,
    rating: testimonial.rating,
    service_id: testimonial.service_id?.toString() || '',
    is_featured: testimonial.is_featured,
    is_published: testimonial.is_published,
    _method: 'PUT',
  });

  const handleImageUpload = useCallback((files: File[]) => {
    if (files.length > 0) {
      setData('author_image', files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files[0]);
    }
  }, [setData]);

  const handleImageRemove = useCallback(() => {
    setData('author_image', null);
    setImagePreview(null);
  }, [setData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/testimonials/${testimonial.id}`, {
      preserveScroll: true,
      forceFormData: true,
    });
  };

  const handleDelete = async () => {
    const result = await confirmDelete(testimonial.author_name);
    if (result.isConfirmed) {
      router.delete(`/admin/testimonials/${testimonial.id}`, {
        onSuccess: () => {
          showDeletedSuccess(testimonial.author_name);
          router.visit('/admin/testimonials');
        },
        onError: () => errorNotification('Failed to delete testimonial'),
      });
    }
  };

  const ratingOptions = [
    { value: '5', label: '★★★★★ (5 stars)' },
    { value: '4', label: '★★★★☆ (4 stars)' },
    { value: '3', label: '★★★☆☆ (3 stars)' },
    { value: '2', label: '★★☆☆☆ (2 stars)' },
    { value: '1', label: '★☆☆☆☆ (1 star)' },
  ];

  return (
    <AdminLayout>
      <Head title={`Edit Testimonial: ${testimonial.author_name}`} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Testimonial</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update testimonial details.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Testimonial
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Author Information */}
            <Card>
              <CardHeader>
                <CardTitle>Author Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Author Name"
                    value={data.author_name}
                    onChange={(e) => setData('author_name', e.target.value)}
                    error={errors.author_name}
                    placeholder="Jane Smith"
                    required
                  />

                  <Input
                    label="Author Title/Location"
                    value={data.author_title}
                    onChange={(e) => setData('author_title', e.target.value)}
                    error={errors.author_title}
                    placeholder="CEO at Company, or City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author Photo
                  </label>
                  <MediaUploader
                    onUpload={handleImageUpload}
                    onRemove={handleImageRemove}
                    preview={imagePreview}
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                    maxFiles={1}
                    maxSize={2 * 1024 * 1024} // 2MB
                  />
                  {errors.author_image && (
                    <p className="mt-2 text-sm text-red-600">{errors.author_image}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Content */}
            <Card>
              <CardHeader>
                <CardTitle>Testimonial Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  label="Testimonial"
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  error={errors.content}
                  rows={6}
                  placeholder="What the customer said about your service..."
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Rating"
                    options={ratingOptions}
                    value={data.rating.toString()}
                    onChange={(e) => setData('rating', parseInt(e.target.value))}
                    error={errors.rating}
                  />

                  <Select
                    label="Related Service (Optional)"
                    options={[{ value: '', label: 'No specific service' }, ...services]}
                    value={data.service_id}
                    onChange={(e) => setData('service_id', e.target.value)}
                    error={errors.service_id}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <Switch
                    label="Featured"
                    description="Show this testimonial prominently on the homepage."
                    checked={data.is_featured}
                    onChange={(checked) => setData('is_featured', checked)}
                  />

                  <Switch
                    label="Published"
                    description="Make this testimonial visible on the website."
                    checked={data.is_published}
                    onChange={(checked) => setData('is_published', checked)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(testimonial.updated_at).toLocaleDateString()}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit('/admin/testimonials')}
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
              Delete Testimonial
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this testimonial from {testimonial.author_name}? This action cannot be undone.
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
