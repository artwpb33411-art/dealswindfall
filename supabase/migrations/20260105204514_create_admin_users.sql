-- ---------------------------------------------------
-- Admin Users (Authorization Layer)
-- ---------------------------------------------------

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Ensure only valid roles are used
alter table admin_users
add constraint admin_users_role_check
check (role in (
  'super_admin',
  'admin',
  'content_admin',
  'analytics_admin'
));

alter table admin_users enable row level security;

create policy "Super admins can read all admins"
on admin_users
for select
using (
  exists (
    select 1
    from admin_users au
    where au.id = auth.uid()
      and au.role = 'super_admin'
      and au.is_active = true
  )
);


create policy "Super admins can manage admins"
on admin_users
for all
using (
  exists (
    select 1
    from admin_users au
    where au.id = auth.uid()
      and au.role = 'super_admin'
      and au.is_active = true
  )
)
with check (
  exists (
    select 1
    from admin_users au
    where au.id = auth.uid()
      and au.role = 'super_admin'
      and au.is_active = true
  )
);
