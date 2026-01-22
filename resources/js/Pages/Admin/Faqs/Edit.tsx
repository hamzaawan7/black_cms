import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Textarea, Switch, Select } from '@/Components/Admin';
import { useSweetAlert } from '@/hooks/useSweetAlert';

interface Category {
  value: string;
  label: string;
}

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  faq: Faq;
  categories: Category[];
}

export default function Edit({ faq, categories }: Props) {
  const { confirmDelete, showDeletedSuccess, errorNotification } = useSweetAlert();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data, setData, put, processing, errors } = useForm({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    order: faq.order,
    is_published: faq.is_published,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/faqs/${faq.id}`, {
      preserveScroll: true,
    });
  };

  const handleDelete = async () => {
    const result = await confirmDelete(faq.question.substring(0, 30) + '...');
    if (result.isConfirmed) {
      router.delete(`/admin/faqs/${faq.id}`, {
        onSuccess: () => {
          showDeletedSuccess('FAQ');
          router.visit('/admin/faqs');
        },
        onError: () => errorNotification('Failed to delete FAQ'),
      });
    }
  };

  const categoryOptions = categories.length > 0 
    ? categories 
    : [
        { value: 'general', label: 'General' },
        { value: 'services', label: 'Services' },
        { value: 'pricing', label: 'Pricing' },
        { value: 'shipping', label: 'Shipping' },
        { value: 'returns', label: 'Returns & Refunds' },
      ];

  return (
    <AdminLayout>
      <Head title={`Edit FAQ: ${faq.question.substring(0, 30)}...`} />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit FAQ</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update the FAQ details below.
            </p>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete FAQ
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>FAQ Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Question"
                value={data.question}
                onChange={(e) => setData('question', e.target.value)}
                error={errors.question}
                placeholder="Enter the frequently asked question"
                required
              />

              <Textarea
                label="Answer"
                value={data.answer}
                onChange={(e) => setData('answer', e.target.value)}
                error={errors.answer}
                rows={6}
                placeholder="Enter the answer to the question"
                hint="You can use markdown formatting for rich text."
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Category"
                  options={categoryOptions}
                  value={data.category}
                  onChange={(e) => setData('category', e.target.value)}
                  error={errors.category}
                />

                <Input
                  type="number"
                  label="Display Order"
                  value={data.order.toString()}
                  onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                  error={errors.order}
                  hint="Lower numbers appear first."
                />
              </div>

              <Switch
                label="Published"
                description="Make this FAQ visible on the website."
                checked={data.is_published}
                onChange={(checked) => setData('is_published', checked)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(faq.updated_at).toLocaleDateString()}
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/admin/faqs')}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={processing}>
                  Save Changes
                </Button>
              </div>
            </CardFooter>
          </Card>
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
              Delete FAQ
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
