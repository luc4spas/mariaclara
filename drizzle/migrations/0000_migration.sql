create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.handle_first_admin();

create table public.site_content (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;
create policy "public read content" on public.site_content for select to anon, authenticated using (true);
create policy "admin insert content" on public.site_content for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update content" on public.site_content for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  description text not null default '',
  image_url text,
  status text not null default 'aberto',
  cta_label text not null default 'Garantir minha vaga',
  cta_url text not null default '',
  price_text text not null default '',
  learnings text[] not null default '{}',
  audience jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.courses to anon, authenticated;
grant insert, update, delete on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;
create policy "public read published courses" on public.courses for select to anon, authenticated using (published or public.has_role(auth.uid(),'admin'));
create policy "admin insert courses" on public.courses for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update courses" on public.courses for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete courses" on public.courses for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "admin read media" on storage.objects for select to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "admin upload media" on storage.objects for insert to authenticated with check (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "admin update media" on storage.objects for update to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "admin delete media" on storage.objects for delete to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));

insert into public.site_content (id, data) values (1, '{
 "name":"Maria Clara Passos",
 "role":"Nutricionista Clínica & Terapeuta Alimentar",
 "heroTitle":"Comida de verdade, cuidado com afeto.",
 "heroSubtitle":"Ajudo pais, cuidadores e profissionais a transformar a relação de crianças e adolescentes com a comida — com escuta, ciência e afeto.",
 "heroImage":"",
 "aboutTitle":"Quem cuida da sua nutrição.",
 "aboutText":"Nutricionista Clínica, Terapeuta Alimentar e ABA. Especialista em Dificuldades Alimentares. Especialista em Terapia Alimentar no Método Pape e Brinque. Certificada PCM (Professional Crisis Management).",
 "aboutQuote":"Acredito em uma nutrição que, para além do corpo físico, alimenta possibilidades.",
 "aboutImage":"",
 "credentials":["Nutricionista Clínica","Terapeuta Alimentar e ABA","Especialista em Dificuldades Alimentares","Método Pape e Brinque","Certificada PCM"],
 "purposeTitle":"Uma rede de apoio para toda a família.",
 "purposeText":"Auxiliar pais, cuidadores e profissionais no manejo e apoio de crianças e adolescentes com dificuldades alimentares, para que recebam a melhor assistência possível — ampliando seu desenvolvimento e o bem-estar de toda a família.",
 "talks":["Autismo e Dificuldades Alimentares","Terapia Alimentar no Autismo e outros transtornos","A equipe multidisciplinar na Terapia Alimentar","Importância da Nutrição no desenvolvimento da criança autista"],
 "experience":["Curso Terapia Alimentar no TEA — Academia do Autismo"],
 "testimonials":[],
 "faq":[{"q":"Os cursos são online?","a":"Sim. As formações são online, para você assistir de onde estiver."},{"q":"Preciso ser profissional da saúde?","a":"Não. Os conteúdos são pensados também para pais e cuidadores."},{"q":"Como tiro dúvidas antes de me inscrever?","a":"Fale comigo pelo WhatsApp — respondo pessoalmente."}],
 "whatsapp":"5522992413828",
 "instagram":"",
 "email":"",
 "seoTitle":"Maria Clara Passos — Nutricionista e Terapeuta Alimentar no TEA",
 "seoDescription":"Nutricionista clínica especialista em dificuldades alimentares e terapia alimentar no autismo. Cursos, palestras e formações para pais e profissionais."
}'::jsonb);

insert into public.courses (slug,title,subtitle,description,status,cta_url,learnings,audience,sort_order) values (
 'terapia-alimentar-no-tea','Curso de Terapia Alimentar no TEA',
 'Formação prática para quem cuida, trata e transforma a relação da criança com a comida.',
 'Um curso pensado para pais, cuidadores e profissionais que acompanham crianças e adolescentes com dificuldades alimentares, especialmente no espectro autista. Caminhos práticos, embasados na experiência clínica real, para lidar com a seletividade alimentar e transformar o momento da refeição em algo mais leve para toda a família.',
 'aberto','https://wa.me/5522992413828',
 array['Como identificar as causas por trás da seletividade alimentar','Estratégias práticas de manejo comportamental à mesa','O papel da equipe multidisciplinar na terapia alimentar','Como aplicar o Método Pape e Brinque no dia a dia','Ferramentas para reduzir a ansiedade em torno da alimentação','Como fortalecer o vínculo familiar através da comida'],
 '[{"title":"Pais e cuidadores","text":"Que querem tornar a refeição mais leve em casa."},{"title":"Nutricionistas e profissionais da saúde","text":"Que atuam com crianças e adolescentes."},{"title":"Terapeutas e educadores","text":"Que acompanham o desenvolvimento infantil."}]'::jsonb,
 1);