-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_models (
  id integer NOT NULL DEFAULT nextval('ai_models_id_seq'::regclass),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  provider text DEFAULT 'replicate'::text,
  model_path text NOT NULL,
  description text,
  price_per_photo numeric NOT NULL DEFAULT 0.00,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  icon_name text DEFAULT 'Sparkles'::text,
  parameters jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT ai_models_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cameras (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  serial_number text NOT NULL,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  owner_id uuid,
  ftp_user text DEFAULT (chr((((97)::double precision + floor((random() * (26)::double precision))))::integer) || (nextval('camera_ftp_seq'::regclass))::text) UNIQUE,
  ftp_pass text DEFAULT (floor(((random() * (((999999 - 100000) + 1))::double precision) + (100000)::double precision)))::text,
  ftp_url text DEFAULT 'ftp.rooplife.com'::text,
  ftp_port integer DEFAULT 21,
  nickname text,
  brand text,
  model text,
  CONSTRAINT cameras_pkey PRIMARY KEY (id),
  CONSTRAINT cameras_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.coupon_usages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coupon_id uuid,
  user_id uuid,
  used_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupon_usages_pkey PRIMARY KEY (id),
  CONSTRAINT coupon_usages_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id),
  CONSTRAINT coupon_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  max_usages integer DEFAULT 1,
  usage_count integer DEFAULT 0,
  user_limit integer DEFAULT 1,
  expiry_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.event_cameras (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  status text DEFAULT 'active'::text,
  last_seen timestamp with time zone DEFAULT timezone('utc'::text, now()),
  user_id uuid,
  camera_id uuid NOT NULL,
  ai_beauty_enabled boolean DEFAULT false,
  ai_model_id integer DEFAULT 1,
  CONSTRAINT event_cameras_pkey PRIMARY KEY (id),
  CONSTRAINT event_cameras_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT fk_camera_photographer FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_event_cameras_camera FOREIGN KEY (camera_id) REFERENCES public.cameras(id),
  CONSTRAINT event_cameras_ai_model_id_fkey FOREIGN KEY (ai_model_id) REFERENCES public.ai_models(id)
);
CREATE TABLE public.event_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'member'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT event_members_pkey PRIMARY KEY (id),
  CONSTRAINT event_members_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  start_time timestamp with time zone,
  max_cameras integer DEFAULT 1,
  ai_beauty_enabled boolean DEFAULT false,
  status text DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  storage_days integer DEFAULT 2,
  join_code text UNIQUE,
  watermark_path text,
  watermark_enabled boolean DEFAULT false,
  watermark_opacity double precision DEFAULT 1.0,
  watermark_version bigint,
  watermark_position text,
  watermark_size integer DEFAULT 400,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.face_clusters (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  aws_face_id text,
  latest_photo_id uuid,
  updated_at timestamp with time zone DEFAULT now(),
  hero_score double precision DEFAULT 0,
  is_manual_locked boolean DEFAULT false,
  CONSTRAINT face_clusters_pkey PRIMARY KEY (id),
  CONSTRAINT face_clusters_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT fk_latest_photo FOREIGN KEY (latest_photo_id) REFERENCES public.photos(id)
);
CREATE TABLE public.photo_faces (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  photo_id uuid,
  cluster_id uuid,
  face_id text,
  bounding_box jsonb,
  created_at timestamp with time zone DEFAULT now(),
  quality_score double precision DEFAULT 0,
  beauty_score double precision DEFAULT 0,
  CONSTRAINT photo_faces_pkey PRIMARY KEY (id),
  CONSTRAINT photo_faces_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.photos(id),
  CONSTRAINT photo_faces_cluster_id_fkey FOREIGN KEY (cluster_id) REFERENCES public.face_clusters(id)
);
CREATE TABLE public.photos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL,
  url_raw text NOT NULL,
  url_thumb text NOT NULL,
  taken_at timestamp with time zone,
  uploaded_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT now(),
  camera_serial text,
  ai_beauty boolean DEFAULT false,
  phash text,
  ai_beauty_status text DEFAULT 'none'::text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT photos_pkey PRIMARY KEY (id),
  CONSTRAINT photos_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.processing_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  camera_serial text NOT NULL,
  temp_path text NOT NULL,
  file_name text NOT NULL,
  status text DEFAULT 'pending'::text,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT processing_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT processing_jobs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id)
);
CREATE TABLE public.service_fees (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_key text NOT NULL UNIQUE,
  price numeric NOT NULL DEFAULT 0,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT service_fees_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  current_event_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  phone_number text,
  avatar_url text,
  wallet_balance numeric DEFAULT '200'::numeric CHECK (wallet_balance >= 0::numeric),
  full_name text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);