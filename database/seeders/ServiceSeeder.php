<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        // Get categories
        $categories = ServiceCategory::where('tenant_id', $tenantId)->pluck('id', 'slug');

        $services = [
            // Weight Loss Services
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['weight-loss'] ?? null,
                'name' => 'AOD 9604',
                'slug' => 'aod-9604',
                'description' => 'Advanced peptide therapy for targeted fat reduction',
                'headline' => 'Unlock Your Body\'s Natural Fat-Burning Potential',
                'content' => 'AOD 9604 is a modified form of amino acids 176-191 of the human growth hormone (HGH). This peptide has been shown to have potent fat-burning properties without the adverse effects associated with unmodified growth hormone.\n\nThrough Hyve Wellness telehealth platform, you can access this cutting-edge treatment from the comfort of your home, with personalized dosing protocols designed by our medical team.\n\nAOD 9604 works by stimulating the pituitary gland to speed up metabolism and burn body fat. It\'s particularly effective for stubborn areas that are resistant to diet and exercise alone.',
                'what_is' => 'AOD 9604 is a peptide fragment derived from human growth hormone. It was originally developed as an anti-obesity drug and has been shown to reduce body fat, particularly in the mid-abdominal area.\n\nThe peptide works by mimicking the way natural growth hormone regulates fat metabolism but without the adverse effects on blood sugar or growth that is seen with unmodified growth hormone.\n\nClinical studies have demonstrated its effectiveness in promoting fat loss while preserving lean muscle mass, making it an ideal option for those looking to optimize their body composition.',
                'benefits' => json_encode(['Accelerated fat burning', 'Improved metabolism', 'No blood sugar impact', 'Muscle preservation', 'Safe for long-term use']),
                'stats' => json_encode([
                    ['value' => '12-15%', 'label' => 'Body Fat Reduction', 'description' => 'Average decrease in body fat percentage over 12 weeks'],
                    ['value' => '3-5 lbs', 'label' => 'Monthly Fat Loss', 'description' => 'Typical fat loss per month with consistent use'],
                    ['value' => '89%', 'label' => 'Patient Satisfaction', 'description' => 'Of patients report visible results within 8 weeks']
                ]),
                'pricing' => '$199/month',
                'image' => '/images/1.png',
                'secondary_image' => '/images/2.png',
                'vial_image' => '/images/2.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 1,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['weight-loss'] ?? null,
                'name' => 'Semaglutide + B12',
                'slug' => 'semaglutide-b12',
                'description' => 'GLP-1 receptor agonist combined with essential vitamin support',
                'headline' => 'Transform Your Weight Loss Journey with Science-Backed Solutions',
                'content' => 'Semaglutide is a revolutionary GLP-1 receptor agonist that has transformed the landscape of medical weight management. Combined with B12 for enhanced energy and metabolism support, this treatment offers comprehensive weight loss support.\n\nThrough Hyve Wellness telehealth approach, you can receive expert medical guidance and prescription management without leaving your home. Regular virtual check-ins ensure your treatment is optimized for your specific needs.\n\nThis combination therapy works by reducing appetite, slowing gastric emptying, and improving insulin sensitivity, while B12 supports energy production and neurological function.',
                'what_is' => 'Semaglutide is a glucagon-like peptide-1 (GLP-1) receptor agonist that mimics a hormone naturally produced in your gut. When combined with methylcobalamin (B12), it provides both appetite control and metabolic support.\n\nThe medication works by activating GLP-1 receptors in the brain that regulate appetite and food intake, leading to reduced hunger and earlier feelings of fullness.\n\nB12 supplementation helps combat the fatigue that some patients experience during caloric restriction and supports healthy nerve function and red blood cell production.',
                'benefits' => json_encode(['Significant weight loss (15-20% body weight)', 'Reduced appetite', 'Improved blood sugar control', 'Increased energy with B12', 'Once-weekly dosing']),
                'stats' => json_encode([
                    ['value' => '15-20%', 'label' => 'Body Weight Loss', 'description' => 'Average weight loss in clinical trials over 68 weeks'],
                    ['value' => '5+ lbs', 'label' => 'Monthly Weight Loss', 'description' => 'Typical monthly weight loss during treatment'],
                    ['value' => '92%', 'label' => 'Reduced Appetite', 'description' => 'Of patients report significant appetite reduction']
                ]),
                'pricing' => '$299/month',
                'image' => '/images/3.png',
                'secondary_image' => '/images/4.png',
                'vial_image' => '/images/5.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 2,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['weight-loss'] ?? null,
                'name' => 'Tirzepatide + B12',
                'slug' => 'tirzepatide-b12',
                'description' => 'Dual-action GIP/GLP-1 therapy for maximum results',
                'headline' => 'Experience the Next Generation of Weight Loss Medicine',
                'content' => 'Tirzepatide represents the latest advancement in medical weight management, offering dual-action on both GIP and GLP-1 receptors for enhanced effectiveness.\n\nCombined with B12 supplementation, this treatment provides comprehensive support for sustainable weight loss while maintaining energy and vitality.\n\nThrough Hyve Wellness telehealth platform, you can incorporate this groundbreaking treatment into your lifestyle with expert medical oversight every step of the way.',
                'what_is' => 'Tirzepatide is the first FDA-approved dual GIP and GLP-1 receptor agonist. This dual action provides superior weight loss results compared to single-action medications.\n\nBy targeting both incretin hormones, Tirzepatide helps regulate blood sugar, reduce appetite, and promote significant weight loss.\n\nThe addition of B12 supports energy metabolism and helps prevent fatigue during your weight loss journey.',
                'benefits' => json_encode(['Superior weight loss (up to 22% body weight)', 'Dual hormone targeting', 'Improved metabolic health', 'Better appetite control', 'Once-weekly dosing']),
                'stats' => json_encode([
                    ['value' => '22.5%', 'label' => 'Body Weight Loss', 'description' => 'Maximum average weight loss achieved in clinical studies'],
                    ['value' => '52 lbs', 'label' => 'Average Loss', 'description' => 'Average total weight loss over 72-week treatment period'],
                    ['value' => '95%', 'label' => 'Success Rate', 'description' => 'Of patients achieve clinically significant weight loss']
                ]),
                'pricing' => '$399/month',
                'image' => '/images/5.png',
                'secondary_image' => '/images/6.png',
                'vial_image' => '/images/16.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 3,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['weight-loss'] ?? null,
                'name' => 'MOTS-C',
                'slug' => 'mots-c',
                'description' => 'Mitochondrial-derived peptide for metabolic optimization',
                'headline' => 'Enhance Your Metabolism at the Cellular Level',
                'content' => 'MOTS-C is a mitochondrial-derived peptide that plays a crucial role in metabolic regulation and exercise physiology.\n\nThis innovative peptide helps optimize how your body produces and uses energy at the cellular level.\n\nThrough Hyve Wellness, you can access this cutting-edge therapy with personalized protocols designed by our medical experts.',
                'what_is' => 'MOTS-C is a 16-amino acid peptide encoded in the mitochondrial genome. It acts as a signaling molecule that regulates metabolic functions throughout the body.\n\nAs we age, natural MOTS-C levels decline, which can contribute to metabolic dysfunction and decreased exercise capacity.\n\nSupplementation can help restore optimal metabolic function and improve overall energy levels.',
                'benefits' => json_encode(['Improved metabolic flexibility', 'Enhanced exercise performance', 'Better blood sugar regulation', 'Increased energy levels', 'Supports healthy aging']),
                'stats' => json_encode([
                    ['value' => '40%', 'label' => 'Improved Metabolism', 'description' => 'Average increase in metabolic efficiency markers'],
                    ['value' => '2x', 'label' => 'Energy Levels', 'description' => 'Patients report doubled energy levels during exercise'],
                    ['value' => '87%', 'label' => 'Better Endurance', 'description' => 'Of users experience improved physical performance']
                ]),
                'pricing' => '$249/month',
                'image' => '/images/1.png',
                'secondary_image' => '/images/8.png',
                'vial_image' => '/images/8.png',
                'is_published' => true,
                'is_popular' => false,
                'order' => 4,
            ],

            // Sexual Health Services
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['sexual-health'] ?? null,
                'name' => 'PT-141',
                'slug' => 'pt-141',
                'description' => 'Peptide therapy for enhanced intimacy and desire',
                'headline' => 'Rediscover Passion and Intimacy Naturally',
                'content' => 'PT-141, also known as Bremelanotide, is a revolutionary peptide therapy that works directly on the nervous system to enhance sexual desire and arousal.\n\nUnlike traditional treatments that work through vascular mechanisms, PT-141 activates the body\'s natural arousal pathways in the brain.\n\nThis makes it an effective option for both men and women experiencing decreased libido or sexual dysfunction.',
                'what_is' => 'PT-141 is a synthetic peptide that activates melanocortin receptors in the brain, specifically targeting the pathways involved in sexual arousal and desire.\n\nIt was originally developed from Melanotan II and has been extensively studied for its effects on sexual function.\n\nPT-141 is unique because it addresses sexual health at the neurological level rather than simply affecting blood flow.',
                'benefits' => json_encode(['Enhanced libido', 'Improved arousal response', 'Works for both men and women', 'Fast-acting (30 minutes)', 'Non-hormonal mechanism']),
                'stats' => json_encode([
                    ['value' => '76%', 'label' => 'Improved Desire', 'description' => 'Of patients report significant increase in sexual desire'],
                    ['value' => '30 min', 'label' => 'Onset Time', 'description' => 'Average time to feel effects after administration'],
                    ['value' => '12+ hrs', 'label' => 'Duration', 'description' => 'Effects can last up to 12 hours or more']
                ]),
                'pricing' => '$179/month',
                'image' => '/images/10.png',
                'secondary_image' => '/images/10.png',
                'vial_image' => '/images/10.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 1,
            ],

            // Longevity Services
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['longevity'] ?? null,
                'name' => 'NAD+',
                'slug' => 'nad-plus',
                'description' => 'Cellular energy and anti-aging support',
                'headline' => 'Restore Cellular Vitality and Turn Back Time',
                'content' => 'NAD+ (Nicotinamide Adenine Dinucleotide) is a critical coenzyme found in every cell of your body, essential for energy production and cellular repair.\n\nAs we age, NAD+ levels naturally decline, leading to decreased cellular function and accelerated aging.\n\nThrough Hyve Wellness, you can access NAD+ supplementation to help restore youthful cellular function and vitality.',
                'what_is' => 'NAD+ is a coenzyme that plays a central role in cellular metabolism, DNA repair, and the regulation of cellular aging processes.\n\nIt is required for the function of sirtuins, proteins that regulate cellular health and longevity.\n\nNAD+ supplementation can help restore the cellular energy and repair mechanisms that decline with age.',
                'benefits' => json_encode(['Enhanced energy levels', 'Improved mental clarity', 'DNA repair support', 'Anti-aging effects', 'Better sleep quality']),
                'stats' => json_encode([
                    ['value' => '50%', 'label' => 'Energy Boost', 'description' => 'Average increase in reported energy levels'],
                    ['value' => '85%', 'label' => 'Mental Clarity', 'description' => 'Of patients experience improved cognitive function'],
                    ['value' => '3 wks', 'label' => 'Time to Results', 'description' => 'Most patients notice benefits within 3 weeks']
                ]),
                'pricing' => '$159/month',
                'image' => '/images/9.png',
                'secondary_image' => '/images/9.png',
                'vial_image' => '/images/9.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 1,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['longevity'] ?? null,
                'name' => 'Epithalon',
                'slug' => 'epithalon',
                'description' => 'Telomere support for healthy aging',
                'headline' => 'Support Your Body\'s Natural Longevity Mechanisms',
                'content' => 'Epithalon is a synthetic tetrapeptide studied for its potential to activate telomerase, the enzyme responsible for maintaining telomere length.\n\nTelomeres are protective caps on the ends of chromosomes that shorten with age. Epithalon may help slow this process.\n\nThis peptide has been extensively studied in longevity research and is considered one of the most promising anti-aging therapies available.',
                'what_is' => 'Epithalon is based on the natural peptide Epithalamin, produced by the pineal gland. It has been studied extensively in longevity research.\n\nThe peptide works by stimulating telomerase activity, which helps maintain telomere length and cellular function.\n\nResearch suggests Epithalon may help support healthy aging at the cellular level.',
                'benefits' => json_encode(['Telomere protection', 'Improved sleep quality', 'Enhanced immunity', 'Antioxidant effects', 'Increased lifespan potential']),
                'stats' => json_encode([
                    ['value' => '33%', 'label' => 'Telomerase Activity', 'description' => 'Average increase in telomerase enzyme activity'],
                    ['value' => '91%', 'label' => 'Sleep Quality', 'description' => 'Of patients report improved sleep patterns'],
                    ['value' => '6 mo', 'label' => 'Optimal Duration', 'description' => 'Recommended treatment cycle for best results']
                ]),
                'pricing' => '$149/month',
                'image' => '/images/8.png',
                'secondary_image' => '/images/8.png',
                'vial_image' => '/images/8.png',
                'is_published' => true,
                'is_popular' => false,
                'order' => 2,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['longevity'] ?? null,
                'name' => 'Glutathione',
                'slug' => 'glutathione',
                'description' => 'Master antioxidant for cellular protection',
                'headline' => 'Protect Your Cells with Nature\'s Most Powerful Antioxidant',
                'content' => 'Glutathione is often called the "master antioxidant" due to its critical role in protecting cells from oxidative stress and supporting detoxification.\n\nIt is naturally produced by the body but levels decline with age and due to environmental stressors.\n\nSupplementation can help restore optimal glutathione levels and support overall cellular health.',
                'what_is' => 'Glutathione is a naturally occurring antioxidant made up of three amino acids: cysteine, glycine, and glutamic acid.\n\nIt plays a crucial role in detoxification, immune function, and cellular protection against oxidative damage.\n\nAs the body\'s primary antioxidant, it helps neutralize free radicals and support liver function.',
                'benefits' => json_encode(['Powerful cellular protection', 'Enhanced detoxification', 'Immune support', 'Skin brightening', 'Reduced oxidative stress']),
                'stats' => json_encode([
                    ['value' => '300%', 'label' => 'Antioxidant Boost', 'description' => 'Increase in cellular glutathione levels'],
                    ['value' => '78%', 'label' => 'Skin Improvement', 'description' => 'Of patients report clearer, brighter skin'],
                    ['value' => '4 wks', 'label' => 'Visible Results', 'description' => 'Average time to see skin and energy improvements']
                ]),
                'pricing' => '$129/month',
                'image' => '/images/6.png',
                'secondary_image' => '/images/6.png',
                'vial_image' => '/images/6.png',
                'is_published' => true,
                'is_popular' => false,
                'order' => 3,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['longevity'] ?? null,
                'name' => 'Semax/Selank',
                'slug' => 'semax-selank',
                'description' => 'Neuroprotective peptides for cognitive enhancement',
                'headline' => 'Optimize Your Brain Health and Cognitive Performance',
                'content' => 'Semax and Selank are neuroprotective peptides that support cognitive function, mood, and stress resilience.\n\nThese peptides work synergistically to enhance brain health while providing anxiolytic effects.\n\nThrough Hyve Wellness, you can access these advanced nootropic therapies with personalized protocols.',
                'what_is' => 'Semax is a synthetic peptide derived from ACTH that supports cognitive function and neuroprotection. Selank is an anxiety-reducing peptide.\n\nBoth peptides have been extensively studied in Russia and are used for cognitive enhancement and stress management.\n\nThey work by modulating neurotransmitter systems and supporting brain-derived neurotrophic factor (BDNF).',
                'benefits' => json_encode(['Improved memory and focus', 'Reduced anxiety and stress', 'Enhanced mental clarity', 'Neuroprotective effects', 'Mood stabilization']),
                'stats' => json_encode([
                    ['value' => '45%', 'label' => 'Cognitive Boost', 'description' => 'Average improvement in focus and memory tests'],
                    ['value' => '68%', 'label' => 'Anxiety Reduction', 'description' => 'Of patients report significant anxiety relief'],
                    ['value' => '2 wks', 'label' => 'Onset Time', 'description' => 'Most patients notice cognitive benefits within 2 weeks']
                ]),
                'pricing' => '$139/month',
                'image' => '/images/4.png',
                'secondary_image' => '/images/4.png',
                'vial_image' => '/images/4.png',
                'is_published' => true,
                'is_popular' => false,
                'order' => 4,
            ],

            // Hair Services
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['hair'] ?? null,
                'name' => 'Hair Restoration Treatments',
                'slug' => 'hair-restoration-treatments',
                'description' => 'Comprehensive solutions for hair loss and thinning',
                'headline' => 'Restore Your Confidence with Fuller, Healthier Hair',
                'content' => 'Our hair restoration protocols combine the latest peptide therapies and growth factors to stimulate natural hair growth.\n\nThese treatments target the root causes of hair loss, including hormonal imbalances and reduced scalp circulation.\n\nWith Hyve Wellness telehealth platform, you can access professional hair restoration treatment from the comfort of your home.',
                'what_is' => 'Hair restoration treatments include a range of therapies designed to stimulate hair follicles, improve scalp health, and promote new hair growth.\n\nOur protocols may include peptides like GHK-Cu, which has been shown to support hair follicle function.\n\nWe provide personalized treatment plans based on your specific type of hair loss.',
                'benefits' => json_encode(['Improved hair density', 'Reduced hair loss', 'Healthier scalp', 'Non-invasive approach', 'At-home convenience']),
                'stats' => json_encode([
                    ['value' => '65%', 'label' => 'Hair Regrowth', 'description' => 'Of patients see visible new hair growth'],
                    ['value' => '80%', 'label' => 'Reduced Shedding', 'description' => 'Report significant decrease in hair loss'],
                    ['value' => '3 mo', 'label' => 'Initial Results', 'description' => 'Average time to see first signs of improvement']
                ]),
                'pricing' => '$169/month',
                'image' => '/images/hyve-20clinic-20mockup-20-2825-29.jpg',
                'secondary_image' => '/images/hyve-20clinic-20mockup-20-2825-29.jpg',
                'vial_image' => '/images/hyve-20clinic-20mockup-20-2825-29.jpg',
                'is_published' => true,
                'is_popular' => false,
                'order' => 1,
            ],

            // Skin Services
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['skin'] ?? null,
                'name' => 'GHK-Cu Peptide',
                'slug' => 'ghk-cu-peptide',
                'description' => 'Copper peptide for skin rejuvenation',
                'headline' => 'Rejuvenate Your Skin at the Cellular Level',
                'content' => 'GHK-Cu is a naturally occurring copper peptide with powerful skin regeneration properties.\n\nThis peptide supports collagen synthesis, improves skin elasticity, and helps reduce the appearance of fine lines and wrinkles.\n\nThrough Hyve Wellness, you can access this advanced anti-aging therapy with personalized protocols.',
                'what_is' => 'GHK-Cu is a tripeptide naturally found in human plasma that decreases with age. It stimulates collagen production and supports cellular repair.\n\nThe copper complex helps activate genes involved in tissue regeneration and wound healing.\n\nResearch shows GHK-Cu can help improve skin appearance and support healthy aging.',
                'benefits' => json_encode(['Improved skin firmness', 'Reduced fine lines and wrinkles', 'Enhanced wound healing', 'Better skin texture', 'Increased collagen production']),
                'stats' => json_encode([
                    ['value' => '70%', 'label' => 'Collagen Increase', 'description' => 'Average improvement in collagen synthesis'],
                    ['value' => '85%', 'label' => 'Skin Texture', 'description' => 'Of patients report smoother, firmer skin'],
                    ['value' => '6 wks', 'label' => 'Visible Results', 'description' => 'Time to see noticeable skin improvements']
                ]),
                'pricing' => '$159/month',
                'image' => '/images/7.png',
                'secondary_image' => '/images/7.png',
                'vial_image' => '/images/7.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 1,
            ],

            // Hormones Services
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['hormones'] ?? null,
                'name' => 'CJC-1295 + Ipamorelin',
                'slug' => 'cjc-1295-ipamorelin',
                'description' => 'Growth hormone peptide combination for optimization',
                'headline' => 'Optimize Your Hormonal Health Naturally',
                'content' => 'CJC-1295 and Ipamorelin is a powerful peptide combination that supports natural growth hormone production.\n\nThis synergistic combination stimulates the pituitary gland to release growth hormone in a natural pulsatile pattern.\n\nThrough Hyve Wellness telehealth platform, you can access this therapy with ongoing medical supervision.',
                'what_is' => 'CJC-1295 is a growth hormone-releasing hormone analog. Ipamorelin is a selective growth hormone secretagogue.\n\nTogether, they work synergistically to stimulate natural GH production without suppressing the body\'s own production.\n\nThis combination is considered one of the safest and most effective ways to optimize growth hormone levels.',
                'benefits' => json_encode(['Improved body composition', 'Increased lean muscle mass', 'Better sleep quality', 'Enhanced recovery', 'Increased energy levels']),
                'stats' => json_encode([
                    ['value' => '25%', 'label' => 'GH Increase', 'description' => 'Average improvement in growth hormone levels'],
                    ['value' => '90%', 'label' => 'Sleep Quality', 'description' => 'Of patients report deeper, more restful sleep'],
                    ['value' => '4 wks', 'label' => 'Initial Benefits', 'description' => 'Time to feel improved energy and recovery']
                ]),
                'pricing' => '$229/month',
                'image' => '/images/12.png',
                'secondary_image' => '/images/12.png',
                'vial_image' => '/images/12.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 1,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['hormones'] ?? null,
                'name' => 'Sermorelin',
                'slug' => 'sermorelin',
                'description' => 'Growth hormone-releasing hormone analog',
                'headline' => 'Support Your Body\'s Natural Growth Hormone Production',
                'content' => 'Sermorelin is a bioidentical hormone peptide that stimulates the pituitary gland to produce and release growth hormone naturally.\n\nUnlike synthetic HGH, Sermorelin works with your body\'s natural feedback mechanisms.\n\nThis makes it a safer, more physiologically natural approach to optimizing growth hormone levels.',
                'what_is' => 'Sermorelin is a truncated analog of growth hormone-releasing hormone (GHRH), containing the first 29 amino acids of the natural hormone.\n\nIt stimulates the pituitary gland to produce and release growth hormone in a natural pattern.\n\nSermorelin is FDA-approved for the diagnosis and treatment of growth hormone deficiency.',
                'benefits' => json_encode(['Enhanced energy levels', 'Improved sleep quality', 'Better body composition', 'Faster recovery from exercise', 'Improved skin quality']),
                'stats' => json_encode([
                    ['value' => '20%', 'label' => 'GH Optimization', 'description' => 'Average improvement in natural GH production'],
                    ['value' => '88%', 'label' => 'Energy Improvement', 'description' => 'Of patients report increased energy'],
                    ['value' => '6 wks', 'label' => 'Full Benefits', 'description' => 'Time to experience comprehensive benefits']
                ]),
                'pricing' => '$209/month',
                'image' => '/images/3.png',
                'secondary_image' => '/images/3.png',
                'vial_image' => '/images/3.png',
                'is_published' => true,
                'is_popular' => false,
                'order' => 2,
            ],
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['hormones'] ?? null,
                'name' => 'Tesamorelin',
                'slug' => 'tesamorelin',
                'description' => 'FDA-approved GHRH analog for metabolic health',
                'headline' => 'Advanced Hormone Therapy for Metabolic Optimization',
                'content' => 'Tesamorelin is an FDA-approved growth hormone-releasing hormone analog known for its effectiveness in reducing excess abdominal fat.\n\nIt works by stimulating natural growth hormone production to improve body composition and metabolic health.\n\nThrough Hyve Wellness, you can access this advanced therapy with comprehensive medical oversight.',
                'what_is' => 'Tesamorelin is a synthetic GHRH analog that stimulates the production and release of endogenous growth hormone.\n\nIt is FDA-approved for reducing excess abdominal fat and has been extensively studied for its metabolic benefits.\n\nThe peptide works by binding to GHRH receptors in the pituitary gland, triggering natural GH release.',
                'benefits' => json_encode(['Reduced abdominal fat', 'Improved body composition', 'Enhanced metabolism', 'Better cardiovascular markers', 'Cognitive support']),
                'stats' => json_encode([
                    ['value' => '15%', 'label' => 'Visceral Fat Reduction', 'description' => 'Average decrease in abdominal fat'],
                    ['value' => '82%', 'label' => 'Metabolic Improvement', 'description' => 'Of patients see improved metabolic markers'],
                    ['value' => '12 wks', 'label' => 'Optimal Results', 'description' => 'Time to see significant body composition changes']
                ]),
                'pricing' => '$239/month',
                'image' => '/images/14.png',
                'secondary_image' => '/images/14.png',
                'vial_image' => '/images/14.png',
                'is_published' => true,
                'is_popular' => false,
                'order' => 3,
            ],

            // Brain & Mood
            [
                'tenant_id' => $tenantId,
                'category_id' => $categories['brain-and-mood'] ?? null,
                'name' => 'Semax/Selank',
                'slug' => 'semax-selank-brain',
                'description' => 'Neuroprotective peptides for brain health and mood',
                'headline' => 'Enhance Your Mental Clarity and Emotional Balance',
                'content' => 'Semax and Selank are neuroprotective peptides that support cognitive function, mood, and stress resilience.\n\nThese peptides work synergistically to enhance brain health while providing anxiolytic (anti-anxiety) effects.\n\nThrough Hyve Wellness, you can access these advanced nootropic therapies with personalized protocols.',
                'what_is' => 'Semax supports cognitive function and neuroprotection. Selank reduces anxiety and has immune-modulating properties.\n\nBoth peptides have been extensively researched and are used for cognitive enhancement and stress management.\n\nThey modulate neurotransmitter systems and support brain-derived neurotrophic factor (BDNF) production.',
                'benefits' => json_encode(['Improved memory and focus', 'Reduced anxiety and stress', 'Enhanced mental clarity', 'Neuroprotective effects', 'Mood stabilization']),
                'stats' => json_encode([
                    ['value' => '45%', 'label' => 'Cognitive Boost', 'description' => 'Average improvement in focus and memory tests'],
                    ['value' => '68%', 'label' => 'Anxiety Reduction', 'description' => 'Of patients report significant anxiety relief'],
                    ['value' => '2 wks', 'label' => 'Onset Time', 'description' => 'Most patients notice cognitive benefits within 2 weeks']
                ]),
                'pricing' => '$139/month',
                'image' => '/images/4.png',
                'secondary_image' => '/images/4.png',
                'vial_image' => '/images/4.png',
                'is_published' => true,
                'is_popular' => true,
                'order' => 1,
            ],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['tenant_id' => $service['tenant_id'], 'slug' => $service['slug']],
                $service
            );
        }

        $this->command->info('Services seeded successfully.');
    }
}
