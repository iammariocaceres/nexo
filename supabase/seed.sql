-- Este script (seed) asume que YA TE CREASTE UNA CUENTA en la app.
-- Utilizará el primer usuario que encuentre en tu base de datos para atar los datos de prueba.

DO $$
DECLARE
  v_user_id uuid;
  v_mario_id uuid;
  v_yoris_id uuid;
  v_diana_id uuid;
BEGIN
  -- 1. Obtener tu usuario recién creado (asume que creaste al menos 1 cuenta)
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún usuario. Regístrate en la app primero.';
  END IF;

  -- 2. Crear el Grupo Familiar (si no existe)
  INSERT INTO public.family_groups (id, name, admin_pin)
  VALUES (v_user_id, 'The Caceres Family', '1234')
  ON CONFLICT (id) DO NOTHING;

  -- 3. Crear los Miembros (Members)
  -- Insertamos a Mario, Yoris y Diana y guardamos sus IDs reales para asignarles tareas después
  INSERT INTO public.members (family_id, name, display_name, role, avatar_url, color, emoji, points)
  VALUES 
    (v_user_id, 'Mario', 'Dad', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mario&backgroundColor=b6e3f4', '#3B82F6', '👨‍💼', 120),
    (v_user_id, 'Yoris', 'Mum', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yoris&backgroundColor=d1d4f9', '#8B5CF6', '👩', 80),
    (v_user_id, 'Diana', 'Daughter', 'member', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Diana', '#F472B6', '🌸', 30)
  RETURNING id INTO v_mario_id;

  -- Como no podemos obtener todos los RETURNING simultáneamente en variables individuales en Postgres facilmente,
  -- los consultamos:
  SELECT id INTO v_mario_id FROM public.members WHERE family_id = v_user_id AND name = 'Mario';
  SELECT id INTO v_yoris_id FROM public.members WHERE family_id = v_user_id AND name = 'Yoris';
  SELECT id INTO v_diana_id FROM public.members WHERE family_id = v_user_id AND name = 'Diana';

  -- 4. Crear Tareas
  INSERT INTO public.tasks (family_id, assigned_to, title, emoji, points, time_slot)
  VALUES
    -- Mario's tasks
    (v_user_id, v_mario_id, 'Prepare breakfast', '🍳', 20, 'morning'),
    (v_user_id, v_mario_id, 'Empty the dishwasher', '🍽️', 15, 'morning'),
    (v_user_id, v_mario_id, 'Take out the trash', '🗑️', 20, 'afternoon'),
    (v_user_id, v_mario_id, 'Vacuum the living room', '🧹', 25, 'afternoon'),
    (v_user_id, v_mario_id, 'Check homework', '📋', 15, 'night'),
    
    -- Yoris's tasks
    (v_user_id, v_yoris_id, 'Do the laundry', '👕', 30, 'morning'),
    (v_user_id, v_yoris_id, 'Write the grocery list', '📝', 10, 'morning'),
    (v_user_id, v_yoris_id, 'Cook dinner', '🍲', 35, 'afternoon'),
    (v_user_id, v_yoris_id, 'Water the plants', '🌱', 15, 'afternoon'),
    (v_user_id, v_yoris_id, 'Tidy up the kitchen', '🫧', 20, 'night'),
    
    -- Diana's tasks
    (v_user_id, v_diana_id, 'Make your bed', '🛏️', 10, 'morning'),
    (v_user_id, v_diana_id, 'Brush your teeth', '🦷', 5, 'morning'),
    (v_user_id, v_diana_id, 'Pack your backpack', '🎒', 10, 'morning'),
    (v_user_id, v_diana_id, 'Do your homework', '📚', 20, 'afternoon'),
    (v_user_id, v_diana_id, 'Tidy up your room', '🧸', 15, 'afternoon'),
    (v_user_id, v_diana_id, 'Bath time', '🛁', 10, 'night'),
    (v_user_id, v_diana_id, 'Read for 15 minutes', '📖', 15, 'night');

  -- 5. Crear Premios
  INSERT INTO public.rewards (family_id, title, emoji, description, cost, category)
  VALUES
    (v_user_id, 'Movie Night', '🎬', 'You pick what we watch for family movie night!', 100, 'Fun'),
    (v_user_id, 'Pizza Night', '🍕', 'Choose your favorite pizza toppings for everyone!', 300, 'Food'),
    (v_user_id, '30min Extra Tablet Time', '📱', 'Half an hour of extra games or YouTube.', 80, 'Screen Time'),
    (v_user_id, 'Choose Your Dessert', '🍦', 'Pick any dessert or ice cream you want!', 60, 'Food'),
    (v_user_id, 'Stay Up 30min Late', '🌙', 'Go to bed 30 minutes after your usual bedtime.', 120, 'Special'),
    (v_user_id, 'Pick Weekend Adventure', '🎡', 'You choose what the family does this weekend!', 400, 'Special'),
    (v_user_id, 'No Chores Day', '🏖️', 'One free day with no chores assigned — enjoy!', 250, 'Special'),
    (v_user_id, 'Sleepover Party', '🛌', 'Invite a friend for a sleepover this weekend.', 500, 'Fun');

  -- 6. Crear Eventos de Calendario
  INSERT INTO public.calendar_events (family_id, title, date, emoji, color, text_color)
  VALUES
    (v_user_id, 'Diana''s Dance Class', CURRENT_DATE + interval '3 days', '💃', 'bg-pink-100', 'text-pink-700'),
    (v_user_id, 'Dentist — Leo', CURRENT_DATE + interval '8 days', '🦷', 'bg-cyan-100', 'text-cyan-700'),
    (v_user_id, 'Family Pizza Night', CURRENT_DATE + interval '11 days', '🍕', 'bg-orange-100', 'text-orange-700'),
    (v_user_id, 'School Play', CURRENT_DATE + interval '15 days', '🎭', 'bg-purple-100', 'text-purple-700');

END $$;
