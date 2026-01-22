<?php

namespace Database\Seeders;

use App\Models\TeamMember;
use Illuminate\Database\Seeder;

class TeamMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        $teamMembers = [
            [
                'tenant_id' => $tenantId,
                'name' => 'Dr. Emily Chen',
                'title' => 'Medical Director',
                'bio' => 'Dr. Chen is a board-certified physician with over 15 years of experience in regenerative medicine and peptide therapy. She leads our medical team with a focus on personalized, evidence-based treatment protocols.',
                'image' => null,
                'credentials' => 'MD, Board Certified',
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/dremilychen']),
                'order' => 1,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Dr. James Mitchell',
                'title' => 'Chief Science Officer',
                'bio' => 'Dr. Mitchell holds a Ph.D. in Biochemistry from Stanford University. His research background in peptide science ensures our treatments are based on the latest scientific advancements.',
                'image' => null,
                'credentials' => 'Ph.D. Biochemistry',
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/drjamesmitchell']),
                'order' => 2,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Sarah Williams',
                'title' => 'Nurse Practitioner',
                'bio' => 'Sarah is a certified family nurse practitioner specializing in weight management and hormone optimization. She brings a compassionate approach to patient care and treatment planning.',
                'image' => null,
                'credentials' => 'FNP-C',
                'social_links' => null,
                'order' => 3,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Dr. Robert Garcia',
                'title' => 'Telemedicine Physician',
                'bio' => 'Dr. Garcia specializes in telemedicine consultations, bringing quality healthcare to patients nationwide. His expertise in anti-aging medicine helps patients achieve their wellness goals.',
                'image' => null,
                'credentials' => 'MD',
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/drrobertgarcia']),
                'order' => 4,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Jennifer Thompson',
                'title' => 'Patient Care Coordinator',
                'bio' => 'Jennifer ensures every patient receives personalized attention from consultation to treatment. Her dedication to patient satisfaction makes the Hyve experience seamless.',
                'image' => null,
                'credentials' => null,
                'social_links' => null,
                'order' => 5,
                'is_published' => true,
            ],
            [
                'tenant_id' => $tenantId,
                'name' => 'Michael Anderson',
                'title' => 'Clinical Pharmacist',
                'bio' => 'Michael oversees our pharmaceutical partnerships and ensures all medications meet the highest quality standards. His expertise guarantees safe and effective treatment delivery.',
                'image' => null,
                'credentials' => 'PharmD',
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/michaelandersonpharmd']),
                'order' => 6,
                'is_published' => true,
            ],
        ];

        foreach ($teamMembers as $member) {
            TeamMember::updateOrCreate(
                [
                    'tenant_id' => $member['tenant_id'],
                    'name' => $member['name'],
                ],
                $member
            );
        }
    }
}
