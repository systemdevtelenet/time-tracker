-- Read-only checks to run in CTNP Systems SQL Editor after table creation.
select table_name
from information_schema.tables
where table_schema = 'workforce_portal_system'
  and table_type = 'BASE TABLE'
order by table_name;

select c.relname as table_name, c.relrowsecurity as rls_enabled,
       has_table_privilege('service_role', c.oid, 'SELECT') as service_role_can_read,
       has_table_privilege('anon', c.oid, 'SELECT') as anon_can_read,
       has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_can_read
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'workforce_portal_system'
  and c.relkind = 'r'
order by c.relname;
