<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        $faqs = [
            // Home Page FAQs (exact content from frontend)
            [
                'tenant_id' => $tenantId,
                'question' => 'How does telehealth work with Hyve Wellness?',
                'answer' => 'Our telehealth platform connects you with licensed healthcare providers through secure virtual consultations. After completing a brief health assessment, you\'ll have a video or phone consultation to discuss your health goals. If appropriate, prescriptions are sent directly to your pharmacy, and medications can be shipped to your door.',
                'category' => 'general',
                'order' => 1,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'What services can I access through telehealth?',
                'answer' => 'Hyve Wellness offers comprehensive virtual health services including weight management programs (Semaglutide, Tirzepatide), longevity treatments (NAD+, peptides), hormone optimization, skin health solutions, brain and mood support, and personalized wellness plans. Our providers can treat a wide range of conditions that don\'t require in-person physical examinations.',
                'category' => 'services',
                'order' => 2,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'How quickly can I get started with treatment?',
                'answer' => 'Most patients can schedule a consultation within 24-48 hours. After your virtual consultation, if treatment is prescribed, medications are typically shipped within 3-5 business days. For weight management programs, many patients start seeing results within the first month of treatment.',
                'category' => 'general',
                'order' => 3,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'Do you accept insurance?',
                'answer' => 'Currently, most of our services are not covered by traditional insurance as they focus on preventive care and wellness optimization. However, we offer competitive cash-pay pricing and flexible payment plans to make our services accessible. Some HSA/FSA cards may be accepted for qualified expenses.',
                'category' => 'pricing',
                'order' => 4,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, and select HSA/FSA cards. We also offer wellness membership plans that provide discounted rates and exclusive benefits for partners who want to build a health and wellness business.',
                'category' => 'pricing',
                'order' => 5,
                'is_published' => true,
            ],

            // Additional FAQs for completeness
            [
                'tenant_id' => $tenantId,
                'question' => 'What is peptide therapy?',
                'answer' => 'Peptide therapy involves the use of specific amino acid sequences (peptides) to trigger specific responses in the body. These peptides can help with weight loss, anti-aging, hormone optimization, and many other health benefits.',
                'category' => 'general',
                'order' => 6,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'Is peptide therapy safe?',
                'answer' => 'Yes, peptide therapy is generally considered safe when administered under medical supervision. All our treatments are prescribed by licensed healthcare providers and use pharmaceutical-grade peptides from accredited compounding pharmacies.',
                'category' => 'general',
                'order' => 7,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'How long does it take to see results?',
                'answer' => 'Results vary depending on the treatment and individual factors. Some patients notice improvements within the first few weeks, while others may take 2-3 months to see significant changes. Your provider will discuss expected timelines during your consultation.',
                'category' => 'general',
                'order' => 8,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'How is my medication shipped?',
                'answer' => 'All medications are shipped in temperature-controlled packaging to ensure potency and safety. We use expedited shipping methods and include cold packs when necessary for temperature-sensitive peptides.',
                'category' => 'shipping',
                'order' => 9,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'question' => 'What if I have side effects?',
                'answer' => 'If you experience any side effects, contact our medical team immediately. We provide 24/7 support for medical concerns and can adjust your treatment plan, dosage, or recommend alternatives as needed.',
                'category' => 'general',
                'order' => 10,
                'is_published' => true,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                [
                    'tenant_id' => $faq['tenant_id'],
                    'question' => $faq['question'],
                ],
                $faq
            );
        }
    }
}
