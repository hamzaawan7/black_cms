import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Textarea, Switch, Select } from '@/Components/Admin';

interface Category {
  value: string;
  label: string;
}

interface Props {
  categories: Category[];
}

interface FormData {
  question: string;
  answer: string;
  category: string;
  order: number;
  is_published: boolean;
}

export default function Create({ categories }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    is_published: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/faqs', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
      },
    });
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
      <Head title="Create FAQ" />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create FAQ</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add a new frequently asked question.
          </p>
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
            <CardFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.visit('/admin/faqs')}
              >
                Cancel
              </Button>
              <Button type="submit" loading={processing}>
                Create FAQ
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
