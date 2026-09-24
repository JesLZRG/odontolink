-- ============================================================
-- OdontoLink -- agrega doctores a las clinicas que se quedaron sin ninguno
-- (solo "Sonrisa Perfecta Dental" tenia doctores en la semilla original,
-- por eso las demas clinicas no dejaban agendar cita).
-- Ejecuta esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

insert into public.doctores (id, clinica_id, nombre, especialidad, avatar) values
-- Sonrisa Perfecta Dental (ya tenia d1-d4; faltaba "general")
('d5', '1', 'Dr. Jorge Ramirez', 'general', 'https://ui-avatars.com/api/?name=Jorge+Ramirez&background=0D9488&color=fff'),

-- BajaDent Clinic
('d6', '2', 'Dra. Patricia Nunez', 'implantes', 'https://ui-avatars.com/api/?name=Patricia+Nunez&background=0891B2&color=fff'),
('d7', '2', 'Dr. Fernando Castro', 'endodoncia', 'https://ui-avatars.com/api/?name=Fernando+Castro&background=10B981&color=fff'),
('d8', '2', 'Dra. Monica Salas', 'cirugia', 'https://ui-avatars.com/api/?name=Monica+Salas&background=6366F1&color=fff'),
('d9', '2', 'Dr. Ivan Delgado', 'periodoncia', 'https://ui-avatars.com/api/?name=Ivan+Delgado&background=F59E0B&color=fff'),

-- Clinica Dental Smile Border
('d10', '3', 'Dra. Karla Espinoza', 'ortodoncia', 'https://ui-avatars.com/api/?name=Karla+Espinoza&background=EC4899&color=fff'),
('d11', '3', 'Dr. Hugo Beltran', 'estetica', 'https://ui-avatars.com/api/?name=Hugo+Beltran&background=8B5CF6&color=fff'),
('d12', '3', 'Dra. Paola Rivas', 'pediatrica', 'https://ui-avatars.com/api/?name=Paola+Rivas&background=F97316&color=fff'),

-- Centro Odontologico del Noroeste
('d13', '4', 'Dr. Ricardo Soto', 'general', 'https://ui-avatars.com/api/?name=Ricardo+Soto&background=14B8A6&color=fff'),
('d14', '4', 'Dra. Veronica Aguilar', 'endodoncia', 'https://ui-avatars.com/api/?name=Veronica+Aguilar&background=EF4444&color=fff'),
('d15', '4', 'Dr. Manuel Ortega', 'periodoncia', 'https://ui-avatars.com/api/?name=Manuel+Ortega&background=0891B2&color=fff'),

-- Baja Smile Studio
('d16', '5', 'Dra. Camila Duarte', 'estetica', 'https://ui-avatars.com/api/?name=Camila+Duarte&background=10B981&color=fff'),
('d17', '5', 'Dr. Sergio Palomares', 'implantes', 'https://ui-avatars.com/api/?name=Sergio+Palomares&background=6366F1&color=fff'),
('d18', '5', 'Dra. Renata Cordero', 'ortodoncia', 'https://ui-avatars.com/api/?name=Renata+Cordero&background=EC4899&color=fff'),

-- Dental Tecate Express
('d19', '6', 'Dr. Oscar Villareal', 'general', 'https://ui-avatars.com/api/?name=Oscar+Villareal&background=F59E0B&color=fff'),
('d20', '6', 'Dra. Diana Marquez', 'pediatrica', 'https://ui-avatars.com/api/?name=Diana+Marquez&background=8B5CF6&color=fff')
on conflict (id) do nothing;
