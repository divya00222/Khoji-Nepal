-- ==============================================================================
-- KHOJI NEPAL (खोजि नेपाल) — RASUWA FLOOD INFORMATION & RESPONSE PLATFORM
-- DEMO SEED DATA (नमुना तथ्याङ्क)
-- ==============================================================================
-- ⚠️  CRITICAL NOTICE: THIS FILE CONTAINS DEMONSTRATION & TEST DATA ONLY.
-- ⚠️  DO NOT RUN THIS SCRIPT IN A LIVE GOVERNMENT PRODUCTION ENVIRONMENT.
-- ⚠️  All personal names, contact records, and incident scenarios are simulated
--     for software verification, disaster response drills, and UI testing.
-- ==============================================================================

USE `khoji_nepal`;

-- Disable Foreign Key checks temporarily for clean seed insertion
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `reports`;
TRUNCATE TABLE `emergency_contacts`;
TRUNCATE TABLE `government_news`;
TRUNCATE TABLE `relief_requests`;
TRUNCATE TABLE `relief_centers`;
TRUNCATE TABLE `rescue_records`;
TRUNCATE TABLE `found_persons`;
TRUNCATE TABLE `missing_persons`;
TRUNCATE TABLE `locations`;
TRUNCATE TABLE `users`;

-- ------------------------------------------------------------------------------
-- 1. SEED: users (DEMO ACCOUNTS)
-- Default demo password for all accounts: "KhojiDemo@2024"
-- Hash generated using PASSWORD_BCRYPT (cost 10)
-- ------------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `status`, `created_at`) VALUES
(1, 'NEOC System Administrator', 'admin@neoc.gov.np', '+977-1-4200000', '$2y$10$wT5g9zJq9vV8H.1v2jD4UeLpG0oM5yD7N9mK8uX1x4z0p2w8r2wWy', 'admin', 'active', '2024-07-01 08:00:00'),
(2, 'Sub-Inspector Rajesh Shrestha (Nepal Police)', 'moderator.police@rasuwa.police.gov.np', '+977-9851000100', '$2y$10$wT5g9zJq9vV8H.1v2jD4UeLpG0oM5yD7N9mK8uX1x4z0p2w8r2wWy', 'moderator', 'active', '2024-07-01 08:15:00'),
(3, 'Nepal Red Cross Society Rasuwa Chapter', 'rfl.rasuwa@nrcs.org', '+977-9851000200', '$2y$10$wT5g9zJq9vV8H.1v2jD4UeLpG0oM5yD7N9mK8uX1x4z0p2w8r2wWy', 'organization', 'active', '2024-07-01 08:30:00'),
(4, 'Armed Police Force Disaster Management Unit', 'apf.rescue@rasuwa.gov.np', '+977-9851000300', '$2y$10$wT5g9zJq9vV8H.1v2jD4UeLpG0oM5yD7N9mK8uX1x4z0p2w8r2wWy', 'organization', 'active', '2024-07-01 08:45:00'),
(5, 'Citizen Reporter (Demo User)', 'citizen.demo@khoji.np', '+977-9841234567', '$2y$10$wT5g9zJq9vV8H.1v2jD4UeLpG0oM5yD7N9mK8uX1x4z0p2w8r2wWy', 'user', 'active', '2024-07-02 09:00:00');

-- ------------------------------------------------------------------------------
-- 2. SEED: locations (DEMO RASUWA GEOGRAPHIC POINTS)
-- ------------------------------------------------------------------------------
INSERT INTO `locations` (`id`, `name`, `type`, `district`, `municipality`, `ward`, `latitude`, `longitude`, `address`, `status`) VALUES
(1, 'Syabrubesi Bridge & Market Area', 'missing', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 5', 28.16100000, 85.34300000, 'Trishuli-Bhotekoshi Confluence, Syabrubesi', 'inaccessible'),
(2, 'Timure Border Customs Checkpoint', 'missing', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 2', 28.27500000, 85.37800000, 'Near Rasuwagadhi Border Post, Timure', 'overwhelmed'),
(3, 'Dhunche District Hospital', 'hospital', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 6', 28.11200000, 85.29700000, 'Hospital Road, Dhunche Bazaar', 'operational'),
(4, 'Trishuli Zonal Hospital (Nuwakot Ref)', 'hospital', 'Nuwakot', 'Bidur Municipality', 'Ward 1', 27.91500000, 85.16300000, 'Trishuli Bazaar, Nuwakot', 'operational'),
(5, 'Syabrubesi Higher Secondary School Shelter', 'shelter', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 5', 28.16300000, 85.34100000, 'Upper Syabrubesi, Safe Highland Zone', 'operational'),
(6, 'Dhunche Community Camp', 'shelter', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 6', 28.11500000, 85.29400000, 'Dhunche Ground, Near CDO Office', 'operational'),
(7, 'Syabrubesi Helipad Relief Distribution Hub', 'relief', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 5', 28.16600000, 85.34600000, 'Syabrubesi Army Ground', 'operational'),
(8, 'Timure Temporary Relief Camp', 'relief', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 2', 28.27200000, 85.37500000, 'Timure Secondary School Field', 'operational'),
(9, 'Mailung Gorge Flood Inundation Zone', 'missing', 'Rasuwa', 'Uttargaya Rural Municipality', 'Ward 1', 28.04500000, 85.23000000, 'Pasang Lhamu Highway KM 42, Mailung', 'inaccessible'),
(10, 'Nepali Army Disaster Air Base Dhunche', 'rescue_team', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 6', 28.11000000, 85.29200000, 'Nepali Army 6 No. Brigade Basecamp', 'operational');

-- ------------------------------------------------------------------------------
-- 3. SEED: missing_persons (DEMO PERSON DIRECTORY)
-- ------------------------------------------------------------------------------
INSERT INTO `missing_persons` (`id`, `report_id`, `full_name`, `age`, `gender`, `photo`, `missing_date`, `missing_time`, `last_seen_location`, `district`, `municipality`, `ward`, `description`, `clothing_description`, `identifying_marks`, `guardian_name`, `guardian_phone`, `status`, `source_type`, `source_name`, `source_reference`, `verification_status`, `created_at`) VALUES
(1, 'KN-MP-2024-001', 'Pasang Norbu Tamang', 34, 'male', 'assets/demo_person_1.jpg', '2024-07-08', '06:30:00', 'Syabrubesi Suspension Bridge Area', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 5', 'Local lodge owner; swept during flash flood while securing boats.', 'Dark blue windcheater jacket, black cargo trousers, gumboots', 'Scar on left forearm, height approx 5ft 7in', 'Dawa Tamang (Brother)', '+977-9841234111', 'missing', 'police', 'Dhunche Police Post', 'POL-RSW-2024-88', 'verified', '2024-07-08 09:30:00'),
(2, 'KN-MP-2024-002', 'Sunita Ghale', 22, 'female', 'assets/demo_person_2.jpg', '2024-07-08', '07:15:00', 'Timure Customs Yard (Rasuwagadhi Road)', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 2', 'Freight documentation clerk at border post when river overflowed.', 'Red woolen shawl, dark kurtha suruwal, white sneakers', 'Silver ring on right index finger, glasses', 'Maya Ghale (Mother)', '+977-9841234222', 'missing', 'citizen', 'Maya Ghale (Relative)', 'CIT-SUB-0029', 'verified', '2024-07-08 10:15:00'),
(3, 'KN-MP-2024-003', 'Karmapa Lama', 67, 'male', 'assets/demo_person_3.jpg', '2024-07-07', '18:00:00', 'Langtang Trail Entrance, Syabrubesi', 'Rasuwa', 'Gosaikunda Rural Municipality', 'Ward 5', 'Elderly monastery caretaker; was evacuating toward upper monastery path.', 'Traditional maroon Tibetan chuba with yellow sash', 'White beard, walking stick with brass head', 'Lobsang Lama (Son)', '+977-9841234333', 'rescued', 'army', 'Nepali Army 6 Brigade', 'NA-REC-014', 'verified', '2024-07-08 11:00:00'),
(4, 'KN-MP-2024-004', 'Anita Shrestha', 28, 'female', 'assets/demo_person_4.jpg', '2024-07-08', '05:45:00', 'Mailung Powerhouse Access Road', 'Rasuwa', 'Uttargaya Rural Municipality', 'Ward 1', 'Hydropower site engineer inspecting intake water levels.', 'Yellow high-visibility safety vest over green jacket, safety helmet', 'Height 5ft 3in, mole on right cheek', 'Ramesh Shrestha (Husband)', '+977-9841234444', 'found', 'red_cross', 'Nepal Red Cross Rasuwa', 'RFL-RSW-512', 'verified', '2024-07-08 12:30:00'),
(5, 'KN-MP-2024-005', 'Bikash Pariyar', 16, 'male', 'assets/demo_person_5.jpg', '2024-07-08', '08:00:00', 'Gatlang Roadside Settlement', 'Rasuwa', 'Amachodingmo Rural Municipality', 'Ward 3', 'High school student separated from evacuation group during mudflow.', 'Grey school sweater, navy trousers', 'Birthmark on left collarbone', 'Kanchhi Pariyar (Mother)', '+977-9841234555', 'missing', 'citizen', 'Village Ward Rep', 'CIT-SUB-0051', 'under_review', '2024-07-08 14:00:00');

-- ------------------------------------------------------------------------------
-- 4. SEED: found_persons (DEMO UNIDENTIFIED / RECOVERED PERSONS)
-- ------------------------------------------------------------------------------
INSERT INTO `found_persons` (`id`, `report_id`, `approx_name`, `approx_age`, `gender`, `photo`, `found_date`, `found_location`, `current_location`, `description`, `source_type`, `source_name`, `verification_status`, `created_at`) VALUES
(1, 'KN-FP-2024-001', 'Anita Shrestha (Matched)', 28, 'female', 'assets/demo_found_1.jpg', '2024-07-09', 'Downstream riverbank near Betrawati', 'Dhunche District Hospital (Room 4)', 'Conscious with mild hypothermia; confirmed identity via engineer ID card.', 'army', 'Nepali Army Water Rescue Team', 'verified', '2024-07-09 09:00:00'),
(2, 'KN-FP-2024-002', 'Unidentified Boy (approx 7-9 yrs)', 8, 'male', 'assets/demo_found_2.jpg', '2024-07-09', 'Syabrubesi Upper Forest Ridge', 'Syabrubesi School Relief Shelter', 'Unable to speak full details, wearing red fleece hoodie, healthy condition.', 'red_cross', 'Red Cross Syabrubesi Unit', 'verified', '2024-07-09 11:30:00'),
(3, 'KN-FP-2024-003', 'Elderly Man (responds to "Chiring")', 72, 'male', 'assets/demo_found_3.jpg', '2024-07-09', 'Timure Hillside Cave Safe Zone', 'Dhunche Community Camp Shelter', 'Dehydrated but stable, wearing brown wool vest and prayer beads.', 'police', 'Armed Police Force Unit 20', 'verified', '2024-07-09 14:15:00');

-- ------------------------------------------------------------------------------
-- 5. SEED: rescue_records (DEMO FIELD RESCUE OPERATIONS)
-- ------------------------------------------------------------------------------
INSERT INTO `rescue_records` (`id`, `person_id`, `rescue_status`, `rescued_date`, `rescued_location`, `current_location`, `hospital_id`, `shelter_id`, `rescue_team`, `organization`, `description`, `verified_by`, `created_at`) VALUES
(1, 3, 'medical_evac', '2024-07-08 16:45:00', 'Upper Syabrubesi Ridge', 'Dhunche District Hospital', 3, 5, 'Air Wing Sortie #04 (MI-17)', 'Nepali Army Disaster Rescue Directorate', 'Airlifted safely from isolated ridge above landslide; treated for mild dehydration.', 2, '2024-07-08 17:30:00'),
(2, 4, 'completed', '2024-07-09 08:30:00', 'Betrawati Riverbank', 'Dhunche District Hospital', 3, NULL, 'APF Swiftwater Search Squad', 'Armed Police Force Nepal', 'Extracted via riverbank rope system and stabilized by paramedic team.', 2, '2024-07-09 10:00:00');

-- ------------------------------------------------------------------------------
-- 6. SEED: relief_centers (DEMO RELIEF DISTRIBUTION HUBS)
-- ------------------------------------------------------------------------------
INSERT INTO `relief_centers` (`id`, `name`, `location_id`, `organization`, `food_status`, `water_status`, `medicine_status`, `blanket_status`, `other_resources`, `contact_phone`, `opening_hours`, `status`, `last_updated`) VALUES
(1, 'Syabrubesi Central Relief Hub', 7, 'District Disaster Management Committee (DDMC) & NRCS', 'adequate', 'adequate', 'low', 'adequate', 'Water purification tablets, 120 tents, solar lamps', '+977-9851001111', '24 Hours Open', 'operational', '2024-07-09 12:00:00'),
(2, 'Timure Secondary Shelter Distribution Point', 8, 'Armed Police Force & Local Red Cross Desk', 'low', 'low', 'critical', 'low', 'Emergency high-energy biscuits, ORS packets, 40 tarpaulins', '+977-9851002222', '06:00 AM - 08:00 PM', 'operational', '2024-07-09 13:00:00'),
(3, 'Dhunche Main Community Relief Depot', 6, 'Nepal Red Cross Society Rasuwa Chapter', 'adequate', 'adequate', 'adequate', 'adequate', 'Complete emergency ration kits, baby food, hygiene kits', '+977-9851003333', '24 Hours Open', 'operational', '2024-07-09 14:00:00');

-- ------------------------------------------------------------------------------
-- 7. SEED: relief_requests (DEMO CITIZEN EMERGENCY SOS REQUESTS)
-- ------------------------------------------------------------------------------
INSERT INTO `relief_requests` (`id`, `request_id`, `requester_name`, `phone`, `location_id`, `latitude`, `longitude`, `people_count`, `request_type`, `description`, `priority`, `status`, `assigned_team`, `created_at`) VALUES
(1, 'KN-RR-2024-001', 'Kalsang Dorje', '+977-9841999111', 1, 28.16200000, 85.34400000, 18, 'food_water', '18 villagers cut off on higher bank near Syabrubesi bridge; road blocked by debris, require potable water and emergency dry food.', 'high', 'dispatched', 'Nepali Army Ground Team Alpha', '2024-07-08 13:00:00'),
(2, 'KN-RR-2024-002', 'Dr. Nirmal Adhikari', '+977-9841999222', 2, 28.27400000, 85.37600000, 6, 'medical_evac', 'Two elderly patients with fractures and trauma requiring urgent helicopter extraction from Timure to Kathmandu/Trishuli.', 'critical', 'acknowledged', 'Air Wing Sortie Bravo (Standby)', '2024-07-08 15:30:00'),
(3, 'KN-RR-2024-003', 'Pemba Chhiring', '+977-9841999333', 9, 28.04600000, 85.23100000, 35, 'shelter_blankets', '35 displaced persons camping under temporary plastic sheets near Mailung; need dry blankets and tarpaulins due to continuous heavy rain.', 'medium', 'pending', NULL, '2024-07-09 08:00:00');

-- ------------------------------------------------------------------------------
-- 7.5 SEED: official_sources (AUTHORIZED DISASTER RESPONSE SOURCES)
-- ------------------------------------------------------------------------------
INSERT INTO `official_sources` (`id`, `name`, `code`, `category`, `website`, `contact_phone`, `is_verified_source`, `description`) VALUES
(1, 'Government of Nepal (MOHA / NEOC)', 'GON-MOHA', 'Government of Nepal', 'https://moha.gov.np', '+977-1-4200000', 1, 'Ministry of Home Affairs & National Emergency Operation Centre'),
(2, 'NDRRMA Disaster Management Portal', 'NDRRMA', 'NDRRMA', 'https://bipadportal.gov.np', '1149', 1, 'National Disaster Risk Reduction and Management Authority'),
(3, 'Nepal Police Headquarters & Rasuwa DPO', 'NEPAL-POLICE', 'Nepal Police', 'https://nepalpolice.gov.np', '100', 1, 'Central Command & Rasuwa District Police Office'),
(4, 'Nepali Army Directorate of Disaster Management', 'NEPALI-ARMY', 'Nepali Army', 'https://nepalarmy.mil.np', '+977-10-540101', 1, 'Air Wing Heli Squadrons & 6 Brigade Engineering Units'),
(5, 'Armed Police Force Disaster Management Division', 'APF-NEPAL', 'Armed Police Force', 'https://apf.gov.np', '1114', 1, 'Swiftwater rescue & flood zone tactical unit'),
(6, 'District Administration Office (DAO) Rasuwa', 'DAO-RASUWA', 'District Administration', 'https://daorasuwa.gov.np', '+977-10-540199', 1, 'Chief District Officer (CDO) Emergency Command Desk'),
(7, 'Gosaikunda Rural Municipality Disaster Cell', 'GOSAIKUNDA-MUN', 'Local Municipality', 'https://gosaikundamun.gov.np', '+977-10-540144', 1, 'Local municipal crisis response & ward coordination desk'),
(8, 'Nepal Red Cross Society (NRCS) RFL Bureau', 'NRCS-RFL', 'Other Authorized Organizations', 'https://nrcs.org', '112', 1, 'Restoring Family Links & physical tracing desks in Dhunche');

-- ------------------------------------------------------------------------------
-- 8. SEED: government_news (OFFICIAL EMERGENCY BULLETINS)
-- ------------------------------------------------------------------------------
INSERT INTO `government_news` (`id`, `title`, `summary`, `content`, `organization`, `category`, `priority`, `source_url`, `image`, `published_at`, `updated_at`, `verification_status`, `is_important`, `is_published`, `is_archived`, `created_by`) VALUES
(1, 'NEOC Emergency Flood Advisory: Trishuli & Bhotekoshi Rivers in Rasuwa', 'High alert issued for downstream settlements along Trishuli River corridor. Citizens advised to evacuate to designated school shelters immediately.', 'The National Emergency Operation Centre (NEOC), Ministry of Home Affairs (MOHA) has declared a Level 3 emergency response for Rasuwa district following torrential cloudbursts upstream in the Bhotekoshi-Trishuli watershed.\n\nAll residents residing within 500 meters of the river basin in Syabrubesi, Timure, and Mailung are instructed to immediately move to designated higher ground shelters (Syabrubesi Higher Secondary School and Dhunche Community Camp). Three search and rescue helicopter sorties have been deployed under Joint Task Force Command.\n\nCitizens are requested to avoid all low-lying river bridges and monitor local FM radio stations and the Khoji Nepal central portal for live updates.', 'NDRRMA', 'WEATHER UPDATE', 'critical', 'https://neoc.gov.np/bulletins/2024/rasuwa-alert-01', 'assets/demo_news_1.jpg', '2024-07-08 07:00:00', '2024-07-08 07:45:00', 'official', 1, 1, 0, 1),
(2, 'District Administration Office Rasuwa: Public Notice on Road Closures', 'Pasang Lhamu Highway temporarily shut between Dhunche and Timure due to multiple mudslides.', 'The District Administration Office (DAO) Rasuwa informs all transport operators, pilgrims, and commercial haulers that the Pasang Lhamu Highway between KM 38 (Betrawati) and KM 54 (Timure) remains closed for clearing operations by the Department of Roads and Nepali Army engineering heavy machinery units.\n\nOnly accredited emergency vehicles, army air ambulance convoys, and disaster relief carriers with authorized passes will be permitted on cleared single-lane sections. General vehicular movement is strictly suspended until further safety assessments at 08:00 AM tomorrow.', 'District Administration', 'ROAD UPDATE', 'warning', 'https://daorasuwa.gov.np/notices/road-closure-07', 'assets/demo_news_2.jpg', '2024-07-08 11:30:00', '2024-07-08 12:15:00', 'official', 1, 1, 0, 1),
(3, 'Nepali Army Air Wing Deploys 4 Heli Sorties for Isolated Ridge Rescue', 'Joint search and extraction operations completed 14 airlifts from upper Syabrubesi and Mailung high-points.', 'Nepali Army Directorate of Disaster Management in coordination with the Armed Police Force Swiftwater Taskforce completed four tactical helicopter sorties (MI-17 and Ecureuil) to evacuate critically isolated residents trapped on isolated ridges above Mailung power canal.\n\nAll 14 rescued citizens have been transferred safely to the Dhunche District Hospital triage unit and reunited with verified family contacts. Operations continue in Timure sector with ground squads.', 'Nepali Army', 'RESCUE UPDATE', 'info', 'https://nepalarmy.mil.np/news/rasuwa-airlift-01', 'assets/demo_news_3.jpg', '2024-07-08 15:45:00', '2024-07-08 16:30:00', 'verified', 1, 1, 0, 2),
(4, 'Nepal Red Cross Society: Restoring Family Links (RFL) Helpdesks Established', 'Family tracing desks activated at Dhunche District Hospital and Syabrubesi camp for missing family registration.', 'Nepal Red Cross Society Rasuwa Chapter, in coordination with the International Committee of the Red Cross (ICRC), has opened 24/7 physical and digital tracing helpdesks.\n\nFamilies seeking information on uncontactable relatives in the flood impact zone can call hotline 112 or register directly on the Khoji Nepal portal. Volunteer teams equipped with satellite phones are cross-verifying shelter rosters with incoming citizen reports.', 'Other Authorized Organizations', 'RELIEF UPDATE', 'info', 'https://nrcs.org/rfl/rasuwa-response', 'assets/demo_news_1.jpg', '2024-07-08 14:00:00', '2024-07-08 14:00:00', 'verified_bulletin', 0, 1, 0, 3),
(5, 'Gosaikunda Municipality Health Advisory: Boil Drinking Water Notice', 'Precautionary health directive issued to prevent waterborne illnesses in flood-affected wards.', 'The Health Directorate of Gosaikunda Rural Municipality urges all residents and temporary shelter occupants in Wards 1 through 5 to consume only boiled water or use chlorine purification tablets provided at municipal relief distribution hubs.\n\nMobile health units from Dhunche Primary Health Centre are distributing oral rehydration salts (ORS), zinc supplements, and water purification drops free of charge at all relief camps.', 'Local Municipality', 'SAFETY NOTICE', 'warning', 'https://gosaikundamun.gov.np/notices/health-advisory-01', 'assets/demo_news_2.jpg', '2024-07-09 09:00:00', '2024-07-09 09:30:00', 'official', 0, 1, 0, 1),
(6, 'Nepal Police Cyber & Missing Bureau: Avoid Sharing Unverified Casualty Rumors', 'Official appeal to public and media to rely strictly on verified bulletins from District Administration Desk.', 'Nepal Police Central Headquarters requests all social media users and community groups to refrain from circulating unverified casualty lists or unconfirmed disaster rumors. All verified missing person lists, rescued logs, and emergency notices are published in real-time through the Khoji Nepal portal and official DAO Rasuwa press briefings.', 'Nepal Police', 'SAFETY NOTICE', 'info', 'https://nepalpolice.gov.np/news/disaster-advisory-rasuwa', 'assets/demo_news_3.jpg', '2024-07-09 11:00:00', '2024-07-09 11:00:00', 'official', 0, 1, 0, 2);

-- ------------------------------------------------------------------------------
-- 9. SEED: emergency_contacts (OFFICIAL HOTLINES & DISPATCH DESKS)
-- ------------------------------------------------------------------------------
INSERT INTO `emergency_contacts` (`id`, `organization`, `service`, `phone`, `description`, `source`, `is_active`) VALUES
(1, 'District Police Office, Rasuwa (Dhunche)', 'Emergency Police Dispatch', '100 / +977-10-540199', '24/7 Central control room for flood distress calls and missing person reports', 'Ministry of Home Affairs', 1),
(2, 'National Emergency Operation Centre (NEOC)', 'National Disaster Helpline', '1149 / +977-1-4200000', 'Toll-free national crisis coordination and inter-agency disaster helpline', 'NEOC Kathmandu', 1),
(3, 'Nepal Red Cross Society Rasuwa Chapter', 'Restoring Family Links (RFL) Desk', '112 / +977-9851000200', 'Missing relatives inquiry, family reconnection, and shelter location desk', 'NRCS', 1),
(4, 'Dhunche District Hospital Emergency Desk', 'Medical & Ambulance Dispatch', '102 / +977-10-540118', '24/7 Trauma emergency triage, medical evacuation, and patient verification', 'Ministry of Health & Population', 1),
(5, 'Armed Police Force Disaster Management Unit', 'Swiftwater Search & Rescue', '1114 / +977-10-540200', 'Rapid response swiftwater extraction, inflatable boat, and rope rescue units', 'APF Headquarters', 1),
(6, 'Nepali Army 6 Brigade Disaster Control Desk', 'Air Rescue & Heavy Extraction', '+977-10-540101', 'Helicopter evacuation, air drop of relief supplies, and road clearing teams', 'Nepali Army', 1);

-- ------------------------------------------------------------------------------
-- 10. SEED: reports (DEMO CITIZEN SIGHTING & VERIFICATION SUBMISSIONS)
-- ------------------------------------------------------------------------------
INSERT INTO `reports` (`id`, `report_type`, `reporter_id`, `target_id`, `reason`, `description`, `status`, `created_at`, `resolved_at`) VALUES
(1, 'missing_sighting', 5, 1, 'Possible Sighting near Betrawati Bridge', 'Local porter reported seeing a person matching Pasang Norbu Tamangs clothing description walking toward Betrawati medical post on July 8 afternoon.', 'investigating', '2024-07-08 17:00:00', NULL),
(2, 'data_update', 3, 3, 'Status update to Rescued', 'Nepal Red Cross field coordinator confirmed Karmapa Lama has been safely accommodated at Dhunche Hospital Ward 2.', 'resolved', '2024-07-08 17:45:00', '2024-07-08 18:00:00');

-- ------------------------------------------------------------------------------
-- 11. SEED: audit_logs (COMPLIANCE AUDIT TRAIL)
-- ------------------------------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `created_at`) VALUES
(1, 1, 'SEED_DATABASE_INITIALIZED', 'system', 0, '127.0.0.1', '2024-07-01 08:00:00'),
(2, 2, 'VERIFIED_MISSING_PERSON', 'missing_persons', 1, '192.168.1.10', '2024-07-08 09:40:00'),
(3, 2, 'VERIFIED_MISSING_PERSON', 'missing_persons', 2, '192.168.1.10', '2024-07-08 10:20:00'),
(4, 3, 'UPDATED_RESCUE_RECORD', 'rescue_records', 1, '192.168.1.25', '2024-07-08 17:35:00'),
(5, 2, 'ACCESSED_GUARDIAN_PHONE_CONTACT', 'missing_persons', 1, '192.168.1.10', '2024-07-08 18:15:00');

-- Re-enable Foreign Key checks
SET FOREIGN_KEY_CHECKS = 1;
