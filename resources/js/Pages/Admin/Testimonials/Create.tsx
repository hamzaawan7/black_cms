import { useState, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Textarea, Switch, Select, MediaUploader } from '@/Components/Admin';

interface Service {
  value: string;
  label: string;
}

interface Props {
  services: Service[];
}

interface FormData {
  author_name: string;
  author_title: string;
  author_image: File | null;
  content: string;
  rating: number;
  service_id: string;
  is_featured: boolean;
  is_published: boolean;
}

export default function Create({ services }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    author_name: '',
    author_title: '',
    author_image: null,
    content: '',
    rating: 5,
    service_id: '',
    is_featured: false,
    is_published: true,
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
    post('/admin/testimonials', {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        reset();
        setImagePreview(null);
      },
    });
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
      <Head title="Add Testimonial" />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Testimonial</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new customer testimonial.
          </p>
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
                    Author Photo (Optional)
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
              <CardFooter className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/admin/testimonials')}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={processing}>
                  Add Testimonial
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
